# OLTANI — WhatsApp AI Multi-Instance SaaS

Multi-instance WhatsApp automation platform with AI agents.

> **Status:** Code complete, committed, pushed. Ready for deploy once you complete the Firebase setup below.

## Stack
- **Frontend:** React 18 + Vite + Tailwind v3 (PWA)
- **Backend:** Node 20 + Express + Socket.io + Baileys + Gemini
- **Auth:** Firebase Google Login + Custom Claims (`role`, `plan`)
- **DB:** Cloud Firestore

---

## 🚀 Setup Guide (one-time, ~15 min)

### 1. Firebase Console — `wazup-5f7a6` project

**a) Enable Google Sign-In:**
- Console → Authentication → Sign-in method → Google → Enable
- Add your dev + prod domains to **Authorized domains**

**b) Generate Service Account JSON:**
- Console → Project Settings → Service Accounts → **Generate new private key**
- A JSON file downloads. Open it, copy the **entire contents** to one line (use `jq -c .` if you have it).

**c) Set Custom Claims for super-admin** (after first deploy):
```bash
cd backend
node src/scripts/setAdmin.js khalidkhattab8687@gmail.com
```

### 2. Backend `.env` — `backend/.env`
```bash
PORT=5000
NODE_ENV=production
CLIENT_ORIGIN=https://your-frontend-domain.pages.dev

# Paste the one-line JSON from step 1b here:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Replace the 2 broken OAuth tokens (AQ.Ab8RN...) with real Gemini API keys
GEMINI_API_KEYS=key1,key2,key3,key4,key5,key6,key7,key8,key9,key10
GEMINI_MODEL=gemini-1.5-flash

SUPER_ADMIN_EMAIL=khalidkhattab8687@gmail.com
```

### 3. Frontend `.env.local` — `frontend/.env.local`
```bash
# Backend URL (VPS domain once deployed):
VITE_API_BASE=https://api.your-domain.com/api
VITE_SOCKET_BASE=https://api.your-domain.com

VITE_SUPER_ADMIN_EMAIL=khalidkhattab8687@gmail.com
# Firebase client config is hardcoded in src/services/firebase.js (safe — public keys)
```

### 4. Local dev verification
```bash
# Terminal 1
cd backend && cp .env.example .env  # then fill it
npm install && npm run dev

# Terminal 2
cd frontend && npm run dev
# Open http://localhost:3000
```

---

## 📦 Deploy

### Frontend → Cloudflare Pages
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name oltani
# Then set VITE_API_BASE / VITE_SOCKET_BASE in Pages dashboard → Settings → Environment variables
```

### Backend → Oracle VPS (158.180.31.160)
```bash
# From local machine
scp -r backend ubuntu@158.180.31.160:/tmp/oltani
scp -i ssh-key-*.key backend/.env ubuntu@158.180.31.160:/tmp/oltani/.env

ssh ubuntu@158.180.31.160
cd /tmp/oltani && sudo bash deploy-vps.sh api.your-domain.com
```

The deploy script handles: Node 20 + PM2 + nginx (HTTP + WebSocket) + Let's Encrypt SSL + 2GB swap (Oracle free tier RAM is tight).

---

## 🔍 Post-deploy verification

| Check | Expected |
|-------|----------|
| `curl https://api.your-domain.com/health` | `{"status":"ok","firestore":true}` |
| `curl https://api.your-domain.com/api/instances/me` | `401 Unauthorized` |
| Open frontend, click Login | Google popup appears |
| First login as super-admin | User doc created in Firestore `users/{uid}` |
| Create instance in Wizard → QR appears | Phone scans → status `connected` |
| Send WhatsApp message to linked number | Bot replies within ~2s |

---

## 🏗️ Architecture
See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full spec — collections, security model, plan limits.

## 🔒 Security
- Every protected API route verifies Firebase ID token via `verifyIdToken`.
- `role`/`plan` stored as Custom Claims **and** user doc (dbData preferred for freshness).
- Socket.io authenticates connections + authorizes per-instance subscriptions.
- Old vendor code preserved on `backup/vendor-v1` branch.

## ⚠️ Critical follow-ups
1. **Rotate leaked secrets** in `api-details.txt` (GitHub PAT + Cloudflare token).
2. **Replace the 2 broken Gemini keys** (`AQ.Ab8RN...` — they're OAuth tokens, not API keys).
3. **Lock down Firestore** with proper security rules (currently relies on Auth + backend middleware).
