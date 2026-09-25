# Deployment

## GitHub and Vercel

This project deploys as one Vercel application:

- Vite serves the React frontend.
- `api/[...path].js` serves the Express REST API.
- MongoDB Atlas remains the persistent database.

The repository declares `npm run build` and `dist` as the Vercel build settings. In the Vercel dashboard, set the project Root Directory to the repository root and remove any override that uses `server`, `server/index.js`, or `npm run server` as the build/output setting. `npm run server` is only for local development; Vercel uses `api/[...path].js` for the backend function.

Add these variables in Vercel Project Settings for Production, Preview, and Development as appropriate:

```env
MONGODB_URI=mongodb://...
JWT_SECRET=long-random-secret
BANK_MANAGER_CODE=manager-code
CLIENT_ORIGIN=https://your-project.vercel.app
WHATSAPP_SUPPORT_NUMBER=
VITE_API_URL=
```

Leave `VITE_API_URL` empty when frontend and API are deployed together. The frontend then calls same-origin `/api` routes.

In MongoDB Atlas, allow the Vercel deployment to connect through the network access settings and use a restricted database user. Do not commit `.env`; it is ignored by Git.

## Local development

Create `.env` from `.env.example`, set the real values locally, then run:

```powershell
npm run server
npm run dev
```

The Vite development proxy forwards `/api` to `http://127.0.0.1:4000`.

## Seeding

Seeding is a manual operation. Set `SEED_PASSWORD` in the process environment and run `npm run seed` once against the intended Atlas database. Never put that password in source control.