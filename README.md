# ChitChat — NDIS AI Assistant

A full-stack agentic AI chatbot specialized for the **National Disability Insurance Scheme (NDIS)**. Built with React, Node.js, and Claude Sonnet 4.5, ChitChat helps NDIS participants, families, carers, and support workers understand scheme rules, funding categories, pricing, and support services in plain, accessible language.

## Key Features

### Agentic Tool Use

ChitChat uses an autonomous reasoning loop where Claude decides when and how to use tools:

- **`fetch_ndis_page`** — Fetches live content from ndis.gov.au using HTTP requests and parses with Cheerio to extract relevant policy, funding categories, and support information
- **`get_pricing_info`** — Searches a local NDIS pricing PDF document indexed at server startup using keyword-based relevance matching to answer hourly rate and pricing line item questions

### RAG Architecture

Implements document retrieval augmented generation (RAG) by:

- Loading the NDIS pricing PDF at startup and extracting normalized text
- Building a searchable line index with context windowing (surrounding lines for clarity)
- Scoring results by keyword overlap to surface most relevant pricing snippets
- Fallback to live NDIS website for information not found in local PDF

### Intelligent Routing

- **Pricing questions** → Uses local PDF first for faster, deterministic results
- **Policy/current info** → Uses live website fetch for up-to-date information
- **General NDIS questions** → Responds from Claude's training with boundaries (no legal/financial advice)

### Accessible & Secure

- **Frontend**: Semantic HTML with ARIA live regions for screen reader support
- **Backend**: URL validation restricts web fetching to ndis.gov.au only; prevents prompt injection
- **User Experience**: Warm, conversational tone mimicking a knowledgeable support worker, not a government document

## Architecture

```
React Frontend (client/)
    ↓ (POST /chat)
Express Backend (server/)
    ├─ Claude API (Sonnet 4.5)
    ├─ fetch_ndis_page tool → ndis.gov.au (Cheerio parsing)
    └─ get_pricing_info tool → Local NDIS pricing PDF (pdf-parse indexing)
```

The backend implements a multi-turn agentic loop:

1. User sends message → Backend adds to conversation history
2. Claude reads tools definitions and decides which to use
3. Tool results added back to conversation
4. Claude reads results and responds (or uses another tool)
5. Loop repeats up to 5 rounds before returning final answer

## Tech Stack

- **Frontend**: React, Tailwind CSS, Semantic HTML
- **Backend**: Node.js, Express, Anthropic API
- **PDF Processing**: pdf-parse (text extraction & indexing)
- **Web Scraping**: Cheerio (HTML parsing)
- **Development**: ES modules, async/await patterns
