# 🚀 Deploy to Vercel - Complete Guide

## ✅ Prerequisites

- Vercel account (free tier works!)
- GitHub account
- GitHub Personal Access Token
- AI Pipe API token

## 📦 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables:**
   
   In Vercel dashboard, add these variables:
   
   ```
   MY_SECRET=your_secret_key_here
   GITHUB_TOKEN=ghp_your_github_token
   GITHUB_USERNAME=your_github_username
   AIPIPE_TOKEN=your_aipipe_token
   OPENAI_BASE_URL=https://aipipe.org/openrouter/v1
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```powershell
   npm i -g vercel
   ```

2. **Login:**
   ```powershell
   vercel login
   ```

3. **Deploy:**
   ```powershell
   vercel
   ```

4. **Add Environment Variables:**
   ```powershell
   vercel env add MY_SECRET
   vercel env add GITHUB_TOKEN
   vercel env add GITHUB_USERNAME
   vercel env add AIPIPE_TOKEN
   ```

5. **Deploy to Production:**
   ```powershell
   vercel --prod
   ```

## 🔧 Configuration

### Vercel Project Settings

**Build Settings:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

**Function Settings (Important!):**
- **Node.js Version:** 18.x
- **Serverless Function Timeout:** 
  - Hobby: 10 seconds
  - Pro: 60 seconds (recommended)

⚠️ **Note:** Long-running tasks (generating complex apps) may timeout on Hobby plan. Consider upgrading to Pro for 60-second timeout.

### Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `MY_SECRET` | ✅ | `my_secure_secret_123` | API authentication secret |
| `GITHUB_TOKEN` | ✅ | `ghp_xxxxxxxxxxxx` | GitHub PAT with `repo` scope |
| `GITHUB_USERNAME` | ✅ | `your-username` | Your GitHub username |
| `AIPIPE_TOKEN` | ✅ | `sk-xxxxxxxxxxxx` | AI Pipe API token |
| `OPENAI_BASE_URL` | ❌ | `https://aipipe.org/openrouter/v1` | OpenAI base URL (auto-set) |

### GitHub Token Setup

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (all)
   - ✅ `admin:repo_hook` (read:repo_hook, write:repo_hook)
4. Click "Generate token"
5. Copy the token (starts with `ghp_`)
6. Add to Vercel environment variables

## 🧪 Testing Your Deployment

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "https://your-app.vercel.app/api/health"
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T...",
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 0,
    "failed": 0
  }
}
```

### 2. Submit Test Task

```powershell
$body = @{
    secret = "your_secret_key"
    email = "test@example.com"
    task = "test-vercel-app"
    round = 1
    brief = "Create a simple stopwatch app"
    nonce = "test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    evaluation_url = "https://httpbin.org/post"
    checks = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-app.vercel.app/api/api-endpoint" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

## ⚡ Performance & Limitations

### Vercel Hobby Plan

| Feature | Limit |
|---------|-------|
| Function Timeout | 10 seconds |
| Deployments/Day | 100 |
| Bandwidth | 100 GB/month |
| Build Time | Unlimited |

⚠️ **Timeout Warning:** Complex app generation may take 15-30 seconds, which exceeds the 10-second limit. Consider:
- Upgrading to Pro plan (60-second timeout)
- Simplifying prompts
- Using faster models

### Vercel Pro Plan ($20/month)

| Feature | Limit |
|---------|-------|
| Function Timeout | **60 seconds** ✅ |
| Deployments/Day | Unlimited |
| Bandwidth | 1 TB/month |
| Build Time | Unlimited |

**Recommended for production use.**

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel automatically:

- ✅ Deploys on every push to `main`
- ✅ Creates preview deployments for PRs
- ✅ Runs build checks
- ✅ Updates environment variables

### Auto-Deploy Workflow

```
git add .
git commit -m "Update feature"
git push
# Vercel automatically deploys! 🚀
```

## 🐛 Troubleshooting

### Function Timeout Errors

**Error:** `FUNCTION_INVOCATION_TIMEOUT`

**Solutions:**
1. Upgrade to Pro plan (60s timeout)
2. Optimize LLM prompts
3. Use faster OpenAI models
4. Split into multiple steps

### Environment Variable Not Found

**Error:** `Cannot read property 'MY_SECRET' of undefined`

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add missing variable
3. Redeploy: `vercel --prod`

### Build Failures

**Error:** `Build failed`

**Solution:**
```powershell
# Test build locally first
npm run build

# Fix any errors, then deploy
vercel --prod
```

### GitHub API Rate Limit

**Error:** `API rate limit exceeded`

**Solution:**
- Ensure `GITHUB_TOKEN` is set (gives 5000 req/hour)
- Use fine-grained token with proper scopes
- Monitor usage at https://github.com/settings/tokens

## 📊 Monitoring

### Vercel Analytics

Enable in dashboard:
- **Settings** → **Analytics** → Enable
- View real-time metrics
- Monitor function execution times
- Track errors

### Logs

View logs in Vercel dashboard:
- **Deployments** → Select deployment → **Functions**
- Real-time logs during execution
- Error stack traces

### Custom Monitoring

Add to your code:
```typescript
console.log('[METRIC] Task started:', taskName);
console.log('[METRIC] Task completed in:', duration, 'ms');
```

View in Vercel function logs.

## 🔐 Security Best Practices

### 1. Secret Rotation

Regularly rotate your secrets:
```powershell
# Generate new secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Update in Vercel dashboard
```

### 2. Fine-Grained GitHub Tokens

Use fine-grained tokens instead of classic:
- More secure
- Repository-specific access
- Automatic expiration

### 3. Environment Variables

- ✅ Never commit secrets to Git
- ✅ Use Vercel environment variables
- ✅ Different secrets for dev/prod
- ✅ Enable "Sensitive" flag in Vercel

## 🚀 Advanced Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS records
4. Vercel auto-provisions SSL

### Preview Deployments

- Automatic for every branch/PR
- Test before merging
- Unique URL per deployment

### Deployment Protection

Enable in **Settings** → **Deployment Protection**:
- Password protect preview deployments
- Restrict by IP
- Enable Vercel Authentication

## 💰 Cost Estimation

### Hobby Plan (Free)

**Good for:**
- Personal projects
- Low traffic (<100 req/day)
- Simple apps

**Limitations:**
- 10-second timeout (may fail on complex tasks)
- Limited bandwidth

### Pro Plan ($20/month)

**Good for:**
- Production applications
- Medium traffic (1000+ req/day)
- Complex app generation

**Benefits:**
- 60-second timeout ✅
- Unlimited deployments
- Priority support

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Test locally: `npm run dev`
- [ ] Test build: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Configure environment variables in Vercel
- [ ] Test GitHub token permissions
- [ ] Test AI Pipe token
- [ ] Deploy to preview first
- [ ] Test API endpoints
- [ ] Submit test task
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)

## 🎉 Success!

Your app is now live on Vercel!

**Your URLs:**
- Production: `https://your-app.vercel.app`
- API Endpoint: `https://your-app.vercel.app/api/api-endpoint`
- Health Check: `https://your-app.vercel.app/api/health`

## 📞 Getting Help

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Project Issues:** Open GitHub issue
- **Community:** Vercel Discord

---

**Deployed successfully?** Share your feedback!
