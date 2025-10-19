 # Next.js AI Web App Generator

 Generate AI-powered web applications with integrated GitHub repository creation, real-time progress updates, and instant GitHub Pages hosting.

 ## 🌟 Features
 - AI-driven HTML/CSS/JavaScript app generation via OpenAI (AI Pipe)
 - Automatic GitHub repository creation and commit
 - Instant GitHub Pages deployment
 - Real-time polling and progress UI
 - Dark mode and responsive design with Tailwind CSS
 - TypeScript & Zod validation for type-safe inputs

 ## 🚀 Quick Start
 ```bash
 git clone https://github.com/iftikar0016/AI-WEB-APP-GENERATOR.git
 cd AI-WEB-APP-GENERATOR
 npm install
 cp .env.example .env
 # Fill in .env variables
 npm run dev
 ```

 Open http://localhost:3000 in your browser.

 ## 🔧 Scripts
 | Command            | Description                  |
 | ------------------ | ---------------------------- |
 | npm run dev        | Start development server     |
 | npm run build      | Build for production         |
 | npm run start      | Start production server      |
 | npm run lint       | Run ESLint                   |
 | npm run type-check | TypeScript type checking     |
 | npm test           | Run tests                    |

 ## 🔑 Environment Variables
 | Name            | Required | Description                          |
 | --------------- | -------- | ------------------------------------ |
 | MY_SECRET       | Yes      | API authentication secret            |
 | GITHUB_TOKEN    | Yes      | GitHub Personal Access Token         |
 | GITHUB_USERNAME | Yes      | Your GitHub username                 |
 | AIPIPE_TOKEN    | Yes      | AI Pipe proxy token                  |
 | OPENAI_BASE_URL | No       | AI Pipe endpoint (default used)      |

 ## ⚖️ License
 This project is licensed under the MIT License. See [LICENSE](LICENSE).
- **Round-based Updates**: Support for initial creation (Round 1) and iterative improvements (Round 2)
- **Background Processing**: BullMQ-based job queue with Redis for reliable task processing
- **Exponential Backoff Retry**: Robust evaluation callback delivery with configurable timeout
- **TypeScript**: Fully typed with Zod schema validation
- **Production Ready**: Docker support, CI/CD pipeline, comprehensive testing

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Worker Architecture](#worker-architecture)
- [Migration from FastAPI](#migration-from-fastapi)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│  Next.js API │─────▶│   BullMQ    │
│  (POST)     │      │   Endpoint   │      │   Queue     │
└─────────────┘      └──────────────┘      └─────────────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │   Worker    │
                                            │  Processor  │
                                            └─────────────┘
                                                   │
                     ┌─────────────────────────────┼─────────────────────────┐
                     ▼                             ▼                         ▼
              ┌─────────────┐            ┌──────────────┐         ┌──────────────┐
              │   OpenAI    │            │   GitHub     │         │  Evaluation  │
              │  (AI Pipe)  │            │     API      │         │   Callback   │
              └─────────────┘            └──────────────┘         └──────────────┘
```

### Components

- **Next.js API Routes**: Handle incoming requests, validate input, queue jobs
- **BullMQ + Redis**: Durable job queue for background task processing
- **Worker Process**: Separate Node.js process that processes tasks
- **OpenAI Integration**: Generate HTML/README via AI Pipe proxy
- **GitHub API**: Create repos, commit files, enable Pages
- **Retry Logic**: Exponential backoff for evaluation callbacks

## 📦 Prerequisites

### Required
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **GitHub Personal Access Token** with `repo` and `admin:repo_hook` permissions
- **AI Pipe Token** for OpenAI access

### Optional (for Production)
- **Redis**: 6.x or 7.x (local or hosted) - *Not needed for development with in-memory queue*

## 🚀 Quick Start

### Easy Mode (No Docker/Redis) 🎯

**Perfect for quick testing and development!**

```bash
cd nextjs-web-generator
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

That's it! Open http://localhost:3000

👉 **[See QUICKSTART-SIMPLE.md](QUICKSTART-SIMPLE.md) for detailed no-Docker setup**

---

### Full Mode (with Redis) 🔧

**For production-like development:**

**1. Install**
```bash
cd nextjs-web-generator
npm install
```

**2. Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MY_SECRET=your_secret_key_here
GITHUB_TOKEN=ghp_your_github_token
GITHUB_USERNAME=your_github_username
AIPIPE_TOKEN=your_aipipe_token
OPENAI_BASE_URL=https://aipipe.org/openrouter/v1
REDIS_URL=redis://localhost:6379
```

**3. Start Redis**

**Option A: Docker**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Option B: Local Installation**
```bash
# macOS
brew install redis
redis-server

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

**4. Switch to Redis Queue**

Edit `lib/queue.ts`:
```typescript
// Comment this line:
// export { addTaskToQueue, getQueueHealth } from './queue-memory';

// Uncomment this line:
export { addTaskToQueue, getQueueHealth } from './queue-redis';
```

**5. Run Development Servers**

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Worker Process:**
```bash
npm run worker:dev
```

The app will be available at `http://localhost:3000`

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MY_SECRET` | ✅ | - | Authentication secret for API requests |
| `GITHUB_TOKEN` | ✅ | - | GitHub Personal Access Token |
| `GITHUB_USERNAME` | ✅ | - | Your GitHub username |
| `AIPIPE_TOKEN` | ✅ | - | AI Pipe API token |
| `OPENAI_BASE_URL` | ❌ | `https://aipipe.org/openrouter/v1` | OpenAI API base URL |
| `REDIS_URL` | ❌ | `redis://localhost:6379` | Redis connection string |
| `WEBHOOK_SECRET` | ❌ | `default_webhook_secret` | Webhook validation secret |

## 📚 API Documentation

### POST `/api/api-endpoint`

Submit a task for web app generation.

**Request Body:**

```json
{
  "secret": "your_secret_key",
  "email": "user@example.com",
  "task": "my-awesome-app",
  "round": 1,
  "brief": "Create a todo app with local storage and dark mode",
  "nonce": "unique-identifier-123",
  "evaluation_url": "https://example.com/eval",
  "checks": [],
  "attachments": [
    {
      "name": "design.png",
      "url": "https://example.com/design.png"
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "status": "processing",
  "task": "my-awesome-app",
  "round": 1,
  "message": "Task 'my-awesome-app' (Round 1) accepted and processing in background"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request format or validation error
- `401 Unauthorized`: Invalid or missing secret
- `500 Internal Server Error`: Server error

### GET `/api/health`

Check service health and queue status.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "queue": {
    "waiting": 2,
    "active": 1,
    "completed": 145,
    "failed": 3
  }
}
```

### GET `/`

Web UI with API documentation and usage examples.

## 🛠️ Development

### Project Structure

```
nextjs-web-generator/
├── app/
│   ├── api/
│   │   ├── api-endpoint/route.ts    # Main API endpoint
│   │   └── health/route.ts          # Health check
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── lib/
│   ├── types.ts                     # TypeScript types & Zod schemas
│   ├── llm.ts                       # OpenAI/LLM integration
│   ├── github.ts                    # GitHub API utilities
│   ├── eval.ts                      # Evaluation retry logic
│   └── queue.ts                     # BullMQ queue configuration
├── workers/
│   └── processor.ts                 # Background job processor
├── tests/
│   ├── setup.ts                     # Jest configuration
│   ├── api.test.ts                  # API endpoint tests
│   └── github.test.ts               # GitHub utilities tests
├── .github/workflows/
│   └── ci.yml                       # GitHub Actions CI/CD
├── Dockerfile                       # App container
├── Dockerfile.worker                # Worker container
├── docker-compose.yml               # Multi-container setup
└── package.json
```

### Available Scripts

```bash
npm run dev          # Start Next.js dev server
npm run build        # Build production app
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run worker       # Start worker process
npm run worker:dev   # Start worker in watch mode
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

The project includes unit tests for:
- API endpoint validation and authentication
- Request/response formatting
- GitHub utility functions
- LLM prompt generation
- Error handling

## 🚢 Deployment

### Option 1: Docker Compose (Recommended for Production)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This starts:
- Redis server
- Next.js application (port 3000)
- Background worker process

### Option 2: Vercel (Web App Only)

**⚠️ Important Limitations:**

Vercel serverless functions have a 10-second execution timeout, which is **not suitable** for the worker process that runs long-running tasks. You have two options:

**Option A: Split Architecture (Recommended)**
- Deploy Next.js app to Vercel
- Deploy worker separately to:
  - Railway
  - Render
  - DigitalOcean App Platform
  - Heroku
  - AWS ECS/Fargate

**Option B: Use External Queue Service**
- Use [Upstash](https://upstash.com/) for Redis
- Use serverless-friendly queue like [Trigger.dev](https://trigger.dev/)

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - MY_SECRET
# - GITHUB_TOKEN
# - GITHUB_USERNAME
# - AIPIPE_TOKEN
# - REDIS_URL (Upstash or external Redis)
```

### Option 3: Traditional Hosting

**Requirements:**
- Server with Node.js 18+
- Redis instance
- Process manager (PM2 recommended)

```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Start Next.js app
pm2 start npm --name "nextjs-app" -- start

# Start worker
pm2 start npm --name "worker" -- run worker

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Variables in Production

Set all required environment variables using your hosting provider's dashboard or CLI:

```bash
# Vercel
vercel env add MY_SECRET production

# Railway
railway variables set MY_SECRET=your_secret

# Render
# Use dashboard: Settings → Environment
```

## 👷 Worker Architecture

### Why Separate Worker?

The worker process runs long-running tasks that can take several minutes:
1. Call OpenAI API (10-30 seconds)
2. Create GitHub repository
3. Commit multiple files
4. Enable GitHub Pages
5. Retry evaluation callback (up to 10 minutes)

This is incompatible with serverless function timeouts.

### Worker Features

- **Graceful Shutdown**: Handles SIGTERM/SIGINT
- **Error Recovery**: Automatic retry with exponential backoff
- **Concurrency Control**: Processes one task at a time
- **Job Persistence**: Jobs survive crashes via Redis
- **Logging**: Detailed progress logging

### Scaling Workers

```bash
# Run multiple workers for higher throughput
pm2 start npm --name "worker-1" -i 1 -- run worker
pm2 start npm --name "worker-2" -i 1 -- run worker
```

## 🔄 Migration from FastAPI

This project is a **complete port** of the original FastAPI Python application. Key changes:

### What's the Same

- ✅ API contract (request/response format)
- ✅ LLM prompt templates (identical)
- ✅ GitHub workflow (same repos, commits, Pages)
- ✅ Evaluation retry logic (same backoff algorithm)
- ✅ Round 1 & Round 2 behavior
- ✅ MIT license generation

### What's Different

| FastAPI (Python) | Next.js (TypeScript) |
|------------------|----------------------|
| FastAPI + Uvicorn | Next.js App Router |
| Pydantic models | Zod schemas |
| `BackgroundTasks` | BullMQ + Redis |
| PyGithub | @octokit/rest |
| `asyncio.sleep` | `setTimeout` |
| `httpx` | `fetch` API |

### Breaking Changes

**None!** The API is 100% compatible. Existing clients work without modification.

## 🐛 Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check `REDIS_URL` environment variable
- For Docker: use `redis://redis:6379` instead of `localhost`

### Worker Not Processing Jobs

**Check:**
1. Worker is running: `npm run worker:dev`
2. Redis is accessible from worker
3. Check worker logs for errors
4. Verify queue health: `GET /api/health`

### GitHub API Rate Limit

```
Error: API rate limit exceeded
```

**Solution:**
- Use authenticated token (should give 5000 req/hour)
- Check token permissions: needs `repo` scope
- Monitor usage: https://github.com/settings/tokens

### OpenAI/AI Pipe Errors

```
Error: OpenAI API error: ...
```

**Solution:**
- Verify `AIPIPE_TOKEN` is correct
- Check `OPENAI_BASE_URL` is set
- Ensure sufficient credits/quota
- Check model availability: `openai/gpt-4o-mini`

### TypeScript Errors After npm install

The TypeScript errors you see are expected before running `npm install`. They will be resolved once dependencies are installed.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Open a [GitHub Issue](../../issues)
- Check [Troubleshooting](#troubleshooting) section
- Review [API Documentation](#api-documentation)

---

**Built with ❤️ using Next.js, TypeScript, BullMQ, and OpenAI**
