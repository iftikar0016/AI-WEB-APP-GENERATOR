# 🚀 Next.js AI Web App Generator # Next.js AI Web App Generator



Generate AI-powered web applications with integrated GitHub repository creation, real-time progress updates, and instant GitHub Pages hosting. Generate AI-powered web applications with integrated GitHub repository creation, real-time progress updates, and instant GitHub Pages hosting.



**Built with Next.js 15, React 19, TypeScript, Tailwind CSS, and OpenAI** ## 🌟 Features

 - AI-driven HTML/CSS/JavaScript app generation via OpenAI (AI Pipe)

## ✨ Features - Automatic GitHub repository creation and commit

 - Instant GitHub Pages deployment

- 🤖 **AI-Driven Generation**: Create complete HTML/CSS/JavaScript applications via OpenAI (AI Pipe) - Real-time polling and progress UI

- 📦 **GitHub Integration**: Automatic repository creation, commits, and Pages deployment - Dark mode and responsive design with Tailwind CSS

- 🔄 **Two Rounds of Creation**: Initial build (Round 1) + iterative improvements (Round 2) - TypeScript & Zod validation for type-safe inputs

- ⚡ **Real-Time Progress**: Live polling updates with progress bar in the UI

- 🌙 **Dark Mode & Responsive**: Modern Tailwind CSS design with light/dark theme ## 🚀 Quick Start

- ✅ **Type-Safe**: Full TypeScript with Zod schema validation ```bash

- 🎯 **Component-Based**: Modular React components for clean, maintainable code git clone https://github.com/iftikar0016/AI-WEB-APP-GENERATOR.git

 cd AI-WEB-APP-GENERATOR

## 📋 Prerequisites npm install

 cp .env.example .env

- **Node.js** >= 18.0.0 # Fill in .env variables

- **npm** >= 9.0.0 npm run dev

- **GitHub Personal Access Token** (with `repo` scope) ```

- **AI Pipe Token** (for OpenAI API access)

 Open http://localhost:3000 in your browser.

## 🚀 Quick Start

 ## 🔧 Scripts

### 1. Clone & Install | Command            | Description                  |

 | ------------------ | ---------------------------- |

```bash | npm run dev        | Start development server     |

git clone https://github.com/iftikar0016/AI-WEB-APP-GENERATOR.git | npm run build      | Build for production         |

cd AI-WEB-APP-GENERATOR | npm run start      | Start production server      |

npm install | npm run lint       | Run ESLint                   |

``` | npm run type-check | TypeScript type checking     |

 | npm test           | Run tests                    |

### 2. Setup Environment

 ## 🔑 Environment Variables

```bash | Name            | Required | Description                          |

cp .env.example .env | --------------- | -------- | ------------------------------------ |

``` | MY_SECRET       | Yes      | API authentication secret            |

 | GITHUB_TOKEN    | Yes      | GitHub Personal Access Token         |

Edit `.env` and fill in: | GITHUB_USERNAME | Yes      | Your GitHub username                 |

 | AIPIPE_TOKEN    | Yes      | AI Pipe proxy token                  |

```env | OPENAI_BASE_URL | No       | AI Pipe endpoint (default used)      |

MY_SECRET=your_secret_key_here

GITHUB_TOKEN=ghp_your_github_personal_access_token ## ⚖️ License

GITHUB_USERNAME=your_github_username This project is licensed under the MIT License. See [LICENSE](LICENSE).

AIPIPE_TOKEN=your_aipipe_token- **Round-based Updates**: Support for initial creation (Round 1) and iterative improvements (Round 2)

OPENAI_BASE_URL=https://aipipe.org/openrouter/v1- **Background Processing**: BullMQ-based job queue with Redis for reliable task processing

```- **Exponential Backoff Retry**: Robust evaluation callback delivery with configurable timeout

- **TypeScript**: Fully typed with Zod schema validation

### 3. Start Development Server- **Production Ready**: Docker support, CI/CD pipeline, comprehensive testing



```bash## 📋 Table of Contents

npm run dev

```- [Architecture](#architecture)

- [Prerequisites](#prerequisites)

Open http://localhost:3000 in your browser. 🎉- [Quick Start](#quick-start)

- [Environment Variables](#environment-variables)

## 🔧 Scripts- [API Documentation](#api-documentation)

- [Development](#development)

| Command         | Description                    |- [Testing](#testing)

| --------------- | ------------------------------ |- [Deployment](#deployment)

| `npm run dev`   | Start Next.js dev server       |- [Worker Architecture](#worker-architecture)

| `npm run build` | Build for production           |- [Migration from FastAPI](#migration-from-fastapi)

| `npm run start` | Start production server        |- [Troubleshooting](#troubleshooting)

| `npm run lint`  | Run ESLint                     |- [License](#license)

| `npm run type-check` | TypeScript type checking    |

| `npm run format` | Format code with Prettier      |## 🏗️ Architecture

| `npm test`      | Run Jest tests                 |

```

## 📁 Project Structure┌─────────────┐      ┌──────────────┐      ┌─────────────┐

│   Client    │─────▶│  Next.js API │─────▶│   BullMQ    │

```│  (POST)     │      │   Endpoint   │      │   Queue     │

app/└─────────────┘      └──────────────┘      └─────────────┘

├── api/                    # API routes                                                   │

│   ├── api-endpoint/      # Main task submission endpoint                                                   ▼

│   ├── health/            # Health check endpoint                                            ┌─────────────┐

│   └── task-status/       # Polling endpoint for progress                                            │   Worker    │

├── components/            # React components                                            │  Processor  │

│   ├── HeaderCard.tsx     # Header with dark mode toggle                                            └─────────────┘

│   ├── QueueStatus.tsx    # Queue status display                                                   │

│   ├── FeaturesCard.tsx   # Features list                     ┌─────────────────────────────┼─────────────────────────┐

│   ├── ApiEndpointsCard.tsx # API documentation                     ▼                             ▼                         ▼

│   └── CreateAppModal.tsx # Form modal              ┌─────────────┐            ┌──────────────┐         ┌──────────────┐

├── page.tsx              # Home page (main UI)              │   OpenAI    │            │   GitHub     │         │  Evaluation  │

├── layout.tsx            # Root layout              │  (AI Pipe)  │            │     API      │         │   Callback   │

├── types.ts              # UI types              └─────────────┘            └──────────────┘         └──────────────┘

└── globals.css           # Global styles```



lib/### Components

├── types.ts              # Core TypeScript types

├── llm.ts               # OpenAI/LLM integration- **Next.js API Routes**: Handle incoming requests, validate input, queue jobs

├── github.ts            # GitHub API utilities- **BullMQ + Redis**: Durable job queue for background task processing

├── queue-memory.ts      # In-memory task queue- **Worker Process**: Separate Node.js process that processes tasks

├── queue-processor.ts   # Task processing logic- **OpenAI Integration**: Generate HTML/README via AI Pipe proxy

└── queue.ts             # Queue exports- **GitHub API**: Create repos, commit files, enable Pages

- **Retry Logic**: Exponential backoff for evaluation callbacks

tests/

├── api.test.ts          # API endpoint tests## 📦 Prerequisites

└── github.test.ts       # GitHub utilities tests

```### Required

- **Node.js**: >= 18.0.0

## 📚 API Documentation- **npm**: >= 9.0.0

- **GitHub Personal Access Token** with `repo` and `admin:repo_hook` permissions

### POST `/api/api-endpoint`- **AI Pipe Token** for OpenAI access



Submit a task to generate a web application.### Optional (for Production)

- **Redis**: 6.x or 7.x (local or hosted) - *Not needed for development with in-memory queue*

**Request:**

## 🚀 Quick Start

```json

{### Easy Mode (No Docker/Redis) 🎯

  "secret": "your_secret_key",

  "email": "user@example.com",**Perfect for quick testing and development!**

  "task": "my-calculator-app",

  "round": 1,```bash

  "brief": "Create a calculator app with basic operations",cd nextjs-web-generator

  "nonce": "unique-id-123"npm install

}cp .env.example .env

```# Edit .env with your credentials

npm run dev

**Response:**```



```jsonThat's it! Open http://localhost:3000

{

  "taskId": "task-uuid-here",👉 **[See QUICKSTART-SIMPLE.md](QUICKSTART-SIMPLE.md) for detailed no-Docker setup**

  "status": "queued",

  "message": "Task accepted and queued for processing"---

}

```### Full Mode (with Redis) 🔧



### GET `/api/task-status?taskId=<id>`**For production-like development:**



Poll for task progress and results.**1. Install**

```bash

**Response:**cd nextjs-web-generator

npm install

```json```

{

  "taskId": "task-uuid-here",**2. Configure Environment**

  "status": "active",```bash

  "stage": "committing-files",cp .env.example .env

  "progress": 50,```

  "message": "Committing files to GitHub...",

  "githubUrl": "https://github.com/user/my-calculator-app",Edit `.env` with your credentials:

  "pagesUrl": "https://user.github.io/my-calculator-app"

}```env

```MY_SECRET=your_secret_key_here

GITHUB_TOKEN=ghp_your_github_token

### GET `/api/health`GITHUB_USERNAME=your_github_username

AIPIPE_TOKEN=your_aipipe_token

Check service health and queue metrics.OPENAI_BASE_URL=https://aipipe.org/openrouter/v1

REDIS_URL=redis://localhost:6379

**Response:**```



```json**3. Start Redis**

{

  "status": "healthy",**Option A: Docker**

  "queue": {```bash

    "waiting": 2,docker run -d -p 6379:6379 redis:7-alpine

    "active": 1,```

    "completed": 145,

    "failed": 0**Option B: Local Installation**

  }```bash

}# macOS

```brew install redis

redis-server

## 🏗️ Architecture

# Ubuntu/Debian

```sudo apt-get install redis-server

┌─────────────────┐sudo systemctl start redis

│  React UI       │ ← User fills form & submits```

└────────┬────────┘

         │**4. Switch to Redis Queue**

         ▼

┌─────────────────────────────┐Edit `lib/queue.ts`:

│ POST /api/api-endpoint      │ ← Validate & queue task```typescript

└──────────┬──────────────────┘// Comment this line:

           │// export { addTaskToQueue, getQueueHealth } from './queue-memory';

           ▼

┌─────────────────────────────┐// Uncomment this line:

│ In-Memory Queue             │ ← Tasks stored in memoryexport { addTaskToQueue, getQueueHealth } from './queue-redis';

└──────────┬──────────────────┘```

           │

           ▼**5. Run Development Servers**

┌─────────────────────────────┐

│ Queue Processor             │ ← Process one task at a time**Terminal 1 - Next.js App:**

│ 1. OpenAI API call          │```bash

│ 2. GitHub repo creation     │npm run dev

│ 3. Commit files             │```

│ 4. Enable Pages             │

└──────────┬──────────────────┘**Terminal 2 - Worker Process:**

           │```bash

           ▼npm run worker:dev

┌─────────────────────────────┐```

│ GET /api/task-status        │ ← Client polls for updates

│ Real-time progress          │The app will be available at `http://localhost:3000`

└─────────────────────────────┘

```## 🔑 Environment Variables



## 🔄 How It Works| Variable | Required | Default | Description |

|----------|----------|---------|-------------|

1. **Form Submission**: User fills in app details and submits form| `MY_SECRET` | ✅ | - | Authentication secret for API requests |

2. **Task Queued**: Task is added to in-memory queue with a unique ID| `GITHUB_TOKEN` | ✅ | - | GitHub Personal Access Token |

3. **Processing**:| `GITHUB_USERNAME` | ✅ | - | Your GitHub username |

   - OpenAI generates HTML/CSS/JS| `AIPIPE_TOKEN` | ✅ | - | AI Pipe API token |

   - GitHub repo is created| `OPENAI_BASE_URL` | ❌ | `https://aipipe.org/openrouter/v1` | OpenAI API base URL |

   - Files are committed| `REDIS_URL` | ❌ | `redis://localhost:6379` | Redis connection string |

   - GitHub Pages is enabled| `WEBHOOK_SECRET` | ❌ | `default_webhook_secret` | Webhook validation secret |

4. **Progress Updates**: Client polls `/api/task-status` every 2 seconds

5. **Completion**: URLs to GitHub repo and live app are displayed## 📚 API Documentation

6. **Round 2** (Optional): User can submit same app for improvements

### POST `/api/api-endpoint`

## 🔐 Security

Submit a task for web app generation.

- **Secret-based authentication**: All API requests require `MY_SECRET`

- **Zod validation**: Input validation on all API endpoints**Request Body:**

- **GitHub token**: Securely stored in environment variables

- **No data persistence**: Tasks are processed and removed from memory```json

{

## 🌐 Deployment  "secret": "your_secret_key",

  "email": "user@example.com",

### Vercel (Recommended)  "task": "my-awesome-app",

  "round": 1,

```bash  "brief": "Create a todo app with local storage and dark mode",

vercel deploy  "nonce": "unique-identifier-123",

```  "evaluation_url": "https://example.com/eval",

  "checks": [],

Set environment variables in Vercel dashboard.  "attachments": [

    {

### Docker      "name": "design.png",

      "url": "https://example.com/design.png"

```bash    }

docker build -t nextjs-web-generator .  ]

docker run -p 3000:3000 -e MY_SECRET=... nextjs-web-generator}

``````



### Traditional Hosting**Response (200 OK):**



```bash```json

npm run build{

npm start  "status": "processing",

```  "task": "my-awesome-app",

  "round": 1,

## 🧪 Testing  "message": "Task 'my-awesome-app' (Round 1) accepted and processing in background"

}

```bash```

# Run all tests

npm test**Error Responses:**



# Watch mode- `400 Bad Request`: Invalid request format or validation error

npm run test:watch- `401 Unauthorized`: Invalid or missing secret

- `500 Internal Server Error`: Server error

# Coverage report

npm run test:coverage### GET `/api/health`

```

Check service health and queue status.

## 🐛 Troubleshooting

**Response (200 OK):**

### "Task not found" error

```json

- Task may still be processing. Keep polling.{

- Check `/api/health` to verify queue status.  "status": "healthy",

  "timestamp": "2025-01-15T10:30:00.000Z",

### GitHub API errors  "queue": {

    "waiting": 2,

- Verify `GITHUB_TOKEN` has `repo` scope    "active": 1,

- Check token isn't expired    "completed": 145,

- Monitor rate limits on https://github.com/settings/tokens    "failed": 3

  }

### OpenAI API errors}

```

- Verify `AIPIPE_TOKEN` is correct

- Check account has sufficient credits### GET `/`

- Verify `OPENAI_BASE_URL` is set correctly

Web UI with API documentation and usage examples.

### Hydration warnings in browser

## 🛠️ Development

- Browser extensions (Grammarly, VS Code, etc.) may inject attributes

- Safe to ignore or test in incognito mode### Project Structure



## 📦 Dependencies```

nextjs-web-generator/

### Core├── app/

- **next** (15.0.0) - React framework│   ├── api/

- **react** (19.0.0) - UI library│   │   ├── api-endpoint/route.ts    # Main API endpoint

- **react-dom** (19.0.0) - React DOM│   │   └── health/route.ts          # Health check

- **typescript** (5.5.4) - Type safety│   ├── globals.css                  # Global styles

│   ├── layout.tsx                   # Root layout

### APIs & Services│   └── page.tsx                     # Home page

- **@octokit/rest** (20.0.2) - GitHub API client├── lib/

- **openai** (4.26.0) - OpenAI/AI Pipe client│   ├── types.ts                     # TypeScript types & Zod schemas

- **zod** (3.22.4) - Schema validation│   ├── llm.ts                       # OpenAI/LLM integration

│   ├── github.ts                    # GitHub API utilities

### Styling│   ├── eval.ts                      # Evaluation retry logic

- **tailwindcss** (3.4.1) - Utility CSS│   └── queue.ts                     # BullMQ queue configuration

- **postcss** (8.4.33) - CSS processing├── workers/

- **autoprefixer** (10.4.17) - Browser prefixes│   └── processor.ts                 # Background job processor

├── tests/

### Development│   ├── setup.ts                     # Jest configuration

- **eslint** (8.57.0) - Linting│   ├── api.test.ts                  # API endpoint tests

- **prettier** (3.2.4) - Code formatting│   └── github.test.ts               # GitHub utilities tests

- **jest** (29.7.0) - Testing├── .github/workflows/

- **typescript-eslint** (7.15.0) - TS linting│   └── ci.yml                       # GitHub Actions CI/CD

├── Dockerfile                       # App container

## ⚖️ License├── Dockerfile.worker                # Worker container

├── docker-compose.yml               # Multi-container setup

MIT License - See [LICENSE](LICENSE) for details.└── package.json

```

Contributions and feedback are welcome! 🙌

### Available Scripts

---

```bash

**Questions?** Open an [issue](https://github.com/iftikar0016/AI-WEB-APP-GENERATOR/issues) on GitHub.npm run dev          # Start Next.js dev server

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
