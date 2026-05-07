# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

ChitChat is a full-stack NDIS (National Disability Insurance Scheme) AI assistant. It helps participants, families, carers, and support workers with NDIS questions using an agentic Claude-powered backend. It has two tools: one that fetches live content from ndis.gov.au and one that searches a local NDIS pricing PDF.

## Running the project

Two separate processes must run simultaneously:

```bash
# Backend (from repo root) — runs on port 3001
node server/index.js

# Frontend (from client/) — runs on port 3000
cd client && npm start
```

```bash
# Run frontend tests (Jest + React Testing Library)
cd client && npm test

# Run a single test file
cd client && npm test -- ChatInput

# Test the pricing PDF search logic
npm run test:pricing
```

```bash
# Production build
cd client && npm run build
```

## Architecture

### Request flow

```
User (React) → POST /chat → Express server → Claude API (with tools) → response
```

The React frontend (`client/src/App.jsx`) sends `{ message, history }` to `http://localhost:3001/chat`. The full conversation history is sent each request — there is no server-side session state.

### Agentic tool loop (`server/index.js`)

The backend runs an autonomous loop (max `MAX_TOOL_ROUNDS = 2`) where Claude can call tools before returning a final reply:

1. `shouldUseTools()` — regex matches keywords in the user message to decide whether to offer tools at all
2. Claude receives tool definitions and chooses whether/which to call
3. Backend executes the tool and appends the result to the message array
4. Claude reads the result and either calls another tool or produces a final answer

**Tools:**
- `fetch_ndis_page` — fetches and strips HTML from ndis.gov.au URLs only (URL validated; non-ndis.gov.au URLs are rejected to prevent prompt injection)
- `get_pricing_info` — keyword-scores chunks of the local PDF (`NDIS Pricing Arrangements and Price Limits 2025-26.pdf`) loaded at server startup; returns the top 8 scored snippets with ±1 line of context

### PDF indexing

At server start, `pdf-parse` reads the local PDF and splits it into line-level chunks. Each chunk gets a relevance score at query time based on keyword matching. This runs once on startup — no re-indexing during runtime.

### Frontend component tree

```
App.jsx           — state (messages, loading), fetch logic, API_URL
├── ChatWindow    — renders message list, auto-scrolls, ARIA live region
│   └── MessageBubble — per-message bubble; assistant messages render via react-markdown
└── ChatInput     — textarea; Enter submits, Shift+Enter adds newline
```

## Key config

- `ANTHROPIC_API_KEY` in `.env` at repo root (single required env var)
- Model: `claude-sonnet-4-5` (set in `server/index.js`)
- Frontend proxies nothing — it calls `http://localhost:3001` directly; both processes must be running for the UI to work
- Tailwind config is in `client/tailwind.config.js`; scans `./src/**/*.{js,jsx,ts,tsx}`
