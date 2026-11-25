# Pastebin Lite

A lightweight Pastebin application built with Next.js, TypeScript, Tailwind CSS, and Upstash Redis. Users can create text pastes, generate shareable links, and optionally set expiration times and view limits.

## Features

- Create and share text pastes using unique URLs.
- Optional time-to-live (TTL) expiration.
- Optional maximum view limits.
- Persistent storage using Upstash Redis.
- Atomic view counting to handle concurrent requests safely.
- Plain-text paste viewer with safe HTML escaping.
- API validation and JSON error responses.
- Test-time support for deterministic expiration checks.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Upstash Redis
- Vercel

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- An Upstash Redis database

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd pastebin-lite
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

For local deterministic expiry testing, optionally add:

```env
TEST_MODE=1
```

Do not commit your actual environment variables or Redis credentials.

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Endpoints

### Health Check

`GET /api/healthz`

Checks whether the application can connect to Redis.

### Create a Paste

`POST /api/pastes`

Example request:

```json
{
  "content": "Hello, Pastebin Lite!",
  "ttl_seconds": 3600,
  "max_views": 5
}
```

Both `ttl_seconds` and `max_views` are optional.

Example response:

```json
{
  "id": "generated-paste-id",
  "url": "https://your-domain.com/p/generated-paste-id"
}
```

### Retrieve a Paste

`GET /api/pastes/:id`

Returns the paste content, remaining views, and expiration timestamp.

### View a Paste

`GET /p/:id`

Displays the paste as plain text in a shareable HTML page.

Unavailable or expired pastes return a 404 response.

## Storage and Expiration

Paste records are stored in Upstash Redis, allowing data to persist across application requests and serverless deployments.

View-limit checking and view-count increments are performed atomically using a Redis Lua script. This prevents concurrent requests from exceeding the configured maximum view count.

Expiration is checked using the stored expiration timestamp. When `TEST_MODE=1`, the `x-test-now-ms` request header can provide a deterministic timestamp for testing.

## Build and Lint

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Deployment

The application can be deployed on Vercel. Configure the Upstash Redis environment variables in the Vercel project settings before deploying.

Do not enable `TEST_MODE=1` in production.

## AI Assistance

ChatGPT was used as a development assistant to understand requirements, discuss implementation choices, troubleshoot issues, and review edge cases. The implementation, integration, and testing were carried out by me with AI-assisted guidance.