# Railway Deployment Guide

This guide explains how to deploy the Anvago Travel Planning app to Railway.

## Architecture

The app consists of 3 services:
- **Backend (Server)** - Express.js API with Prisma ORM
- **Frontend (Client)** - React SPA served via nginx
- **Database** - PostgreSQL (Railway provides this)

## Prerequisites

1. A Railway account (https://railway.app)
2. Railway CLI installed: `npm install -g @railway/cli`
3. Git repository connected to Railway

## Deployment Steps

### 1. Create a New Project on Railway

```bash
railway login
railway init
```

Or create via the Railway dashboard.

### 2. Add PostgreSQL Database

In Railway dashboard:
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create `DATABASE_URL` variable

### 3. Deploy the Backend (Server)

Create a new service in Railway:

1. Click "New" → "GitHub Repo" → Select your repo
2. Configure the service:
   - **Root Directory**: `/` (root of monorepo)
   - **Dockerfile Path**: `packages/server/Dockerfile`
   - **Watch Paths**: `packages/server/**`, `packages/shared/**`

3. Add environment variables:
   ```
   DATABASE_URL        → Reference the PostgreSQL service variable
   JWT_SECRET          → Your secret key (generate a strong random string)
   CLIENT_URL          → Your frontend URL (set after deploying client)
   NODE_ENV            → production
   GOOGLE_CLIENT_ID    → (optional) For Google OAuth
   GOOGLE_CLIENT_SECRET → (optional) For Google OAuth
   GEMINI_API_KEY      → (optional) For AI features
   ```

4. Railway will auto-deploy when you push to main branch

### 4. Deploy the Frontend (Client)

Create another service in Railway:

1. Click "New" → "GitHub Repo" → Select your repo
2. Configure the service:
   - **Root Directory**: `/` (root of monorepo)
   - **Dockerfile Path**: `packages/client/Dockerfile`
   - **Watch Paths**: `packages/client/**`, `packages/shared/**`

3. Add build arguments (in Variables section):
   ```
   VITE_API_URL → Your backend URL + /api/v1 (e.g., https://anvago-server.up.railway.app/api/v1)
   ```

4. After deployment, copy the client URL and update `CLIENT_URL` in the server service

### 5. Run Database Migrations

The server Dockerfile automatically runs `prisma migrate deploy` on startup.

To seed the database (first time only):
```bash
railway run -s anvago-server pnpm db:seed
```

Or connect to Railway shell:
```bash
railway connect anvago-server
cd packages/server && npx tsx prisma/seed.ts
```

## Environment Variables Reference

### Server (Backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Railway) |
| `PORT` | No | Server port (auto-set by Railway) |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `NODE_ENV` | Yes | Set to `production` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |

### Client (Frontend)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (build-time variable) |
| `PORT` | No | nginx port (auto-set by Railway) |

## Custom Domains

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CLIENT_URL` in server to match

## Monitoring

- Railway provides built-in logs and metrics
- Health check endpoint: `/health` (server)
- The server logs all requests in production

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Dockerfile paths are correct

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly referenced
- Check if PostgreSQL service is running
- Verify network connectivity between services

### CORS Errors
- Ensure `CLIENT_URL` matches the exact frontend URL
- Include protocol (https://) in the URL

### Frontend Shows Blank Page
- Check browser console for errors
- Verify `VITE_API_URL` was set during build
- Ensure nginx is serving on correct port

## Local Testing with Railway

Test your Docker builds locally before deploying:

```bash
# Build and test server
docker build -f packages/server/Dockerfile -t anvago-server .
docker run -p 3001:3001 -e DATABASE_URL="..." -e JWT_SECRET="test" anvago-server

# Build and test client
docker build -f packages/client/Dockerfile -t anvago-client --build-arg VITE_API_URL="http://localhost:3001/api/v1" .
docker run -p 8080:80 -e PORT=80 anvago-client
```

## CI/CD

Railway automatically deploys when you push to the connected branch. For more control:

1. Go to service settings
2. Configure "Deploy Triggers"
3. Set specific branch or enable PR previews
