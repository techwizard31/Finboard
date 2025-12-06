# Heroku Deployment Guide for FinBoard

## Prerequisites
- Heroku CLI installed ([Download here](https://devcenter.heroku.com/articles/heroku-cli))
- Git repository initialized
- Heroku account created

## Environment Variables for Heroku

Set these Config Vars in your Heroku dashboard or via CLI:

### Required Variables:
```bash
# Alpha Vantage API Key
ALPHA_VANTAGE_API_KEY=your_actual_key

# Finnhub API Key  
FINNHUB_API_KEY=your_actual_key

# Your Heroku app URL (after creating the app)
NEXT_PUBLIC_APP_URL=https://your-app-name.herokuapp.com

# Socket.IO URL (same as app URL)
NEXT_PUBLIC_SOCKET_URL=https://your-app-name.herokuapp.com

# Node environment
NODE_ENV=production
```

### NOT Required (Heroku provides automatically):
- `PORT` - Heroku automatically sets this via environment variable
- The app is configured to use `process.env.PORT` which Heroku provides

## Deployment Steps

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku App
```bash
heroku create your-app-name
# Example: heroku create finboard-dashboard
```

### 3. Set Environment Variables
```bash
heroku config:set ALPHA_VANTAGE_API_KEY=your_actual_key
heroku config:set FINNHUB_API_KEY=your_actual_key
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_APP_URL=https://your-app-name.herokuapp.com
heroku config:set NEXT_PUBLIC_SOCKET_URL=https://your-app-name.herokuapp.com
```

### 4. Verify Config Vars
```bash
heroku config
```

### 5. Deploy to Heroku
```bash
git add .
git commit -m "Ready for Heroku deployment"
git push heroku main
```

### 6. Open Your App
```bash
heroku open
```

## View Logs
```bash
heroku logs --tail
```

## Important Notes

### Server Configuration
The `server.ts` is already configured for Heroku:
- ✅ Uses `process.env.PORT` (Heroku's dynamic port)
- ✅ Binds to `0.0.0.0` in production (required for Heroku)
- ✅ Only loads `.env.local` in development
- ✅ Uses Heroku Config Vars in production

### Files Already Set Up
- ✅ `Procfile` - Tells Heroku to run `npm start`
- ✅ `package.json` - Contains build and start scripts
- ✅ `.env.example` - Template for environment variables

### CORS Configuration
The Socket.IO server is configured to accept connections from:
- Development: `http://localhost:3000`
- Production: Value from `NEXT_PUBLIC_APP_URL` environment variable

### Build Process
Heroku will automatically:
1. Install dependencies (`npm install`)
2. Build Next.js app (`npm run build`)
3. Build TypeScript server (`npm run build:server`)
4. Start production server (`npm start`)

## Troubleshooting

### App Crashes on Startup
Check logs:
```bash
heroku logs --tail
```

Common issues:
- Missing environment variables
- Build errors
- Port binding issues

### WebSocket Not Connecting
1. Verify `NEXT_PUBLIC_SOCKET_URL` matches your Heroku app URL
2. Ensure it uses `https://` (not `http://`)
3. Check that `FINNHUB_API_KEY` is set correctly

### API Rate Limits
- Alpha Vantage free tier: 5 calls/min, 500/day
- Consider upgrading for production use

## Update Deployment
```bash
git add .
git commit -m "Update description"
git push heroku main
```

## Restart App
```bash
heroku restart
```

## Scale Dynos (if needed)
```bash
# Check current dynos
heroku ps

# Scale to 1 web dyno (free tier)
heroku ps:scale web=1
```

## Environment Variables Quick Reference

| Variable | Required | Source | Example |
|----------|----------|--------|---------|
| `ALPHA_VANTAGE_API_KEY` | Yes | alphavantage.co | `YXCJB8UQ94SLU8XH` |
| `FINNHUB_API_KEY` | Yes | finnhub.io | `d4pvd01r01qjpnb1pn5g` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your Heroku app | `https://finboard.herokuapp.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Same as APP_URL | `https://finboard.herokuapp.com` |
| `NODE_ENV` | Yes | Set manually | `production` |
| `PORT` | No | Heroku provides | Auto-set by Heroku |

## Cost
- Free tier includes 550-1000 dyno hours/month
- App will sleep after 30 minutes of inactivity on free tier
- Consider Hobby dyno ($7/month) for always-on service
