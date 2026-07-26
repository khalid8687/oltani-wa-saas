# OLTANI — Architecture Spec

> Multi-Instance WhatsApp AI SaaS. Same stack, rebuilt clean.

## Stack

| Layer    | Tech                                                        |
| -------- | --------------------------------------------------------- |
| Frontend | React 18 + Vite + Tailwind v3 (PWA)                       |
| Backend  | Node 20 + Express + Socket.io                             |
| WhatsApp | `@whiskeysockets/baileys` (multi-session)                 |
| AI       | Google Gemini (`@google/generative-ai`) — 10-key balancer |
| Auth     | Firebase Google Login + Custom Claims (`role`, `plan`)    |
| DB       | Cloud Firestore (`users`, `instances`, `settings`)        |
| Hosting  | Cloudflare Pages (frontend) + Oracle VPS (backend)        |

## Security Model (the main thing we fixed)

1. Every protected API request **must** send `Authorization: Bearer <Firebase ID Token>`.
2. Backend verifies via `admin.auth().verifyIdToken()` and loads the user doc.
3. `role` and `plan` live in **Custom Claims** (set by admin via Firebase Admin SDK).
4. Old `x-admin-email` header is **gone**.

## Plan Limits

| Plan  | Instances | Daily AI Messages | Price |
| ----- | --------- | ----------------- | ----- |
| Free  | 1         | 50                | $0    |
| Pro   | 3         | 300               | $10   |
| Ultra | ∞         | 1000              | $20   |

Free trial: 7 days of Pro on signup (timestamp stored on user doc).

## Bot Modes

| Mode   | Behaviour                                                                  |
| ------ | -------------------------------------------------------------------------- |
| fixed  | Send `fixedMessage` to everyone.                                           |
| qa     | Gemini matches the incoming message to the closest saved Q&A pair.         |
| ai     | Full Gemini agent built from `persona`, `instructions`, `services`, `routePhone`. |

## Firestore Collections

```
users/{uid}        { email, displayName, photoURL, plan, role, dailyMsgCount,
                     lastResetDate, trialStartedAt, isBlocked, createdAt }
instances/{id}     { userId, name, mode, fixedMessage, qaPairs, persona,
                     instructions, services, routePhone, isAdminGarden,
                     phone, status, createdAt, updatedAt }
settings/gemini    { keys[], modelName, updatedAt }
```

## Project Layout

```
backend/
  src/{server.js, config/, middleware/, services/, routes/, utils/}
frontend/
  src/{main.jsx, App.jsx, index.css, contexts/, components/, pages/, services/, lib/}
```

## Deploy Targets

- **Frontend**: `wrangler pages deploy frontend/dist` (after `npm run build`)
- **Backend**: `bash backend/deploy-vps.sh` (Ubuntu + Node 20 + PM2 + nginx + Let's Encrypt + WSS proxy)
