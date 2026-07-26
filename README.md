# OLTANI — WhatsApp AI Multi-Instance SaaS

Multi-instance WhatsApp automation platform with AI agents.

## Stack
- **Frontend:** React 18 + Vite + Tailwind v3 (PWA)
- **Backend:** Node 20 + Express + Socket.io + Baileys + Gemini
- **Auth:** Firebase Google Login + Custom Claims
- **DB:** Cloud Firestore

## Quick start (local)

### Backend
```bash
cd backend
cp .env.example .env          # then fill FIREBASE_SERVICE_ACCOUNT + GEMINI_API_KEYS
npm install
npm run dev                   # http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env.local    # adjust VITE_API_BASE for prod
npm install
npm run dev                   # http://localhost:3000
```

## Deploy
- **Frontend → Cloudflare Pages:**
  ```bash
  cd frontend && npm run build
  npx wrangler pages deploy dist --project-name oltani
  ```
- **Backend → Oracle VPS:**
  ```bash
  scp -r backend ubuntu@158.180.31.160:/tmp/oltani
  ssh ubuntu@158.180.31.160 'cd /tmp/oltani && sudo bash deploy-vps.sh api.your-domain.com'
  ```

## Architecture
See [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Security
- Every protected API route verifies Firebase ID token via `verifyIdToken`.
- `role`/`plan` stored as Firebase Custom Claims.
- CORS locked to `CLIENT_ORIGIN`.
- Old vendor code preserved on `backup/vendor-v1` branch.
