#!/usr/bin/env bash
# OLTANI Backend — Full VPS Provisioning (Ubuntu 24.04)
# Run as root (or with sudo) on the Oracle VPS.
set -euo pipefail

APP_DIR="/var/www/oltani-backend"
APP_USER="oltani"
APP_PORT=5000
DOMAIN="${1:-api.oltani.pages.dev}"   # pass your domain as first arg

echo "🚀 Provisioning OLTANI backend on $DOMAIN ..."

# ── 1. System + Node 20 LTS ──────────────────────────────────────
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg build-essential git ufw nginx

# Ensure 2GB swap (Oracle free tier has 1GB RAM — Baileys sessions are hungry).
if ! swapon --show | grep -q '/swapfile'; then
  echo "💾 Creating 2GB swap..."
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2

# ── 2. Dedicated user + dirs ────────────────────────────────────
id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "$APP_USER"
mkdir -p "$APP_DIR" "$APP_DIR/sessions" "$APP_DIR/logs"
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

# ── 3. Pull code (run from current dir → copy) ──────────────────
if [ -f "package.json" ]; then
  sudo -u "$APP_USER" cp -r ./* "$APP_DIR/"
  sudo -u "$APP_USER" cp -r ./.env "$APP_DIR/.env" 2>/dev/null || true
fi

cd "$APP_DIR"
sudo -u "$APP_USER" npm install --omit=dev --no-audit --no-fund

# ── 4. PM2 startup ──────────────────────────────────────────────
sudo -u "$APP_USER" pm2 start ecosystem.config.cjs || \
  sudo -u "$APP_USER" pm2 restart oltani-backend
sudo -u "$APP_USER" pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" || true

# ── 5. Firewall ─────────────────────────────────────────────────
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

# ── 6. Nginx reverse proxy (HTTP + WebSocket) ───────────────────
cat > "/etc/nginx/sites-available/oltani" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket upgrade (Socket.io)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
NGINX
ln -sf "/etc/nginx/sites-available/oltani" "/etc/nginx/sites-enabled/oltani"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 7. Let's Encrypt SSL ────────────────────────────────────────
if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -n --redirect -d "$DOMAIN" -m "admin@$DOMAIN" --agree-tos || \
  echo "⚠️  Certbot skipped (no DNS yet?). Re-run: certbot --nginx -d $DOMAIN"

echo "✅ Done. Backend live at https://$DOMAIN"
echo "   Logs: pm2 logs oltani-backend"
echo "   Status: curl https://$DOMAIN/health"
