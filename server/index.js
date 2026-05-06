// ============================================================
// ChitChat — NDIS Assistant Backend
// server/index.js
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const client = new Anthropic();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRICING_PDF_PATH = path.join(
  __dirname,
  "..",
  "NDIS Pricing Arrangements and Price Limits 2025-26.pdf",
);
const PRICING_INDEX_PROMISE = loadPricingIndex();

app.use(cors());
app.use(express.json());

// ============================================================
// NDIS SYSTEM PROMPT
// ============================================================
// This tells Claude who it is and how to behave.
// Critically: we now tell it that it has a tool to fetch live
// NDIS pages, so it knows to use it when it needs fresh info.
// ============================================================

const NDIS_SYSTEM_PROMPT = `
You are ChitChat, a friendly, warm, and knowledgeable NDIS support assistant.
Your job is to help NDIS participants, their families, carers, and support workers
understand the National Disability Insurance Scheme in plain, simple language.

You have access to a tool called fetch_ndis_page that lets you read live pages
from ndis.gov.au. Use it whenever a question involves:
- Current pricing or funding amounts
- Specific support categories or line items
- Recent policy changes
- Any information that may have changed recently

You also have access to a tool called get_pricing_info that searches the local
NDIS pricing PDF. Use it first when the user asks about hourly rates, pricing
limits, or pricing line items, especially if the answer is not obvious from the
live website.

Always prefer fresh, source-based information over relying on your training data
for anything time-sensitive.

WHAT YOU HELP WITH:
- Explaining what the NDIS is and how it works
- The three support budget categories:
    * Core Supports — everyday activities, consumables, transport, support workers
    * Capacity Building Supports — therapy, skills development, employment support,
      support coordination, improved living arrangements, and more
    * Capital Supports — assistive technology, home/vehicle modifications
- What specific supports and services are funded under each category
- How participants can use their funding flexibly (especially Core budgets)
- The difference between Agency Managed, Plan Managed, and Self Managed funding
- What the NDIS does NOT fund
- How to find registered NDIS providers
- What a support coordinator or local area coordinator (LAC) does
- How to prepare for a planning meeting
- How to request a plan review or raise concerns with the NDIA

HOW TO RESPOND:
- Write like a knowledgeable friend, not a government document
- Keep responses concise — 2 to 4 short paragraphs at most
- Only use bullet points or bold text when it genuinely makes something clearer,
  not as a default structure for every response
- Never use headers (##) — this is a chat, not a webpage
- Use plain, jargon-free language
- Be warm, patient, and encouraging
- If a question is about a very specific situation, recommend they speak with
  their support coordinator, LAC, or contact the NDIA directly
- When you fetch a page, let the user know you've checked the live NDIS website

IMPORTANT BOUNDARIES:
- Do NOT provide legal advice
- Do NOT provide financial advice
- Do NOT make specific promises about what any individual plan will or won't fund
- If you are unsure, say so and direct the user to the NDIA (1800 800 110) or ndis.gov.au
`;

// ============================================================
// TOOL DEFINITION
// ============================================================
// This is the "menu" of tools you're offering Claude.
// Claude reads this description to decide when and how to use it.
// The input_schema tells Claude exactly what arguments to provide
// — like a contract between you and the AI.
// ============================================================

const TOOLS = [
  {
    name: "fetch_ndis_page",
    description:
      "Fetches the live content of an ndis.gov.au page so you can provide " +
      "accurate, up-to-date information. Use this for any question involving " +
      "current NDIS rules, support categories, pricing, or policies.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description:
            "The full URL to fetch. Must start with https://www.ndis.gov.au/",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_pricing_info",
    description:
      "Searches the local NDIS pricing PDF for hourly rates, line items, and " +
      "other pricing details. Use this first for pricing questions, then use " +
      "fetch_ndis_page if you need to confirm a current live page.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "A short description of the pricing information to look up.",
        },
      },
      required: ["query"],
    },
  },
];

async function loadPricingIndex() {
  try {
    const pdfBuffer = await readFile(PRICING_PDF_PATH);
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();

    const normalizedText = result.text.replace(/\r\n/g, "\n");
    const lines = normalizedText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      text: normalizedText,
      lines,
      totalPages: result.total ?? null,
    };
  } catch (error) {
    console.error("Could not load pricing PDF:", error);
    return null;
  }
}

function buildPricingSnippets(pricingIndex, query) {
  const normalizedQuery = query.toLowerCase().trim();
  const keywords = normalizedQuery
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);

  if (keywords.length === 0) {
    return [];
  }

  const scoredMatches = pricingIndex.lines
    .map((line, index) => {
      const lowerLine = line.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (lowerLine.includes(keyword) ? 1 : 0),
        0,
      );

      return { index, line, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 8);

  return scoredMatches.map((item) => {
    const start = Math.max(0, item.index - 1);
    const end = Math.min(pricingIndex.lines.length, item.index + 2);
    return pricingIndex.lines.slice(start, end).join(" ");
  });
}

async function getPricingInfo(query) {
  const pricingIndex = await PRICING_INDEX_PROMISE;

  if (!pricingIndex) {
    return "The local pricing PDF could not be loaded, so I could not search it.";
  }

  const snippets = buildPricingSnippets(pricingIndex, query);

  if (snippets.length === 0) {
    return (
      "I could not find a clear match in the local pricing PDF for: " +
      `${query}. Try a more specific support type, line item, or weekday/weekend rate.`
    );
  }

  return [
    `Matched local pricing PDF for: ${query}`,
    ...snippets.map((snippet, index) => `${index + 1}. ${snippet}`),
  ].join("\n");
}

// ============================================================
// FETCH TOOL IMPLEMENTATION
// ============================================================
// This is the actual code that runs when Claude calls the tool.
// Claude decides WHAT to fetch — your code decides HOW.
//
// Security note: we validate the URL before fetching anything.
// Without this check, a manipulated prompt could theoretically
// trick Claude into fetching internal services or private URLs.
// Restricting to ndis.gov.au eliminates that risk entirely.
// ============================================================

async function fetchNdisPage(url) {
  // Only allow ndis.gov.au — never fetch arbitrary URLs
  if (!url.startsWith("https://www.ndis.gov.au/")) {
    throw new Error("Only ndis.gov.au URLs are permitted.");
  }

  const response = await fetch(url, {
    headers: {
      // Mimic a real browser — government sites with Cloudflare protection
      // reject requests that don't look like they come from a browser
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-AU,en;q=0.9",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load that page (status ${response.status}).`);
  }

  const html = await response.text();

  // cheerio lets us query HTML like jQuery — $("selector").text()
  // We load the raw HTML into cheerio to parse it
  const $ = cheerio.load(html);

  // Remove parts of the page that aren't useful content
  $(
    "nav, header, footer, script, style, .menu, .breadcrumb, .sidebar",
  ).remove();

  // Try to grab the main content area; fall back to the whole body
  const content =
    $("main").text() ||
    $('[role="main"]').text() ||
    $(".content-area").text() ||
    $("body").text();

  // Collapse multiple spaces/newlines into single spaces, then trim
  // We also cap at 8000 characters — enough for a full page but safe
  // for Claude's context window and your API costs
  return content.replace(/\s+/g, " ").trim().slice(0, 8000);
}

// ============================================================
// TOOL RUNNER
// ============================================================
// When Claude responds with "I want to call a tool", it gives
// us a list of tool_use blocks. This function:
//   1. Loops through each one
//   2. Calls the right function
//   3. Returns the results in the format the Anthropic API expects
// ============================================================

async function runTools(toolUseBlocks) {
  const results = [];

  for (const toolUse of toolUseBlocks) {
    let content;
    try {
      if (toolUse.name === "fetch_ndis_page") {
        console.log(`Fetching: ${toolUse.input.url}`);
        content = await fetchNdisPage(toolUse.input.url);
      } else if (toolUse.name === "get_pricing_info") {
        console.log(`Searching pricing PDF: ${toolUse.input.query}`);
        content = await getPricingInfo(toolUse.input.query);
      } else {
        content = "Unknown tool requested.";
      }
    } catch (error) {
      // If the fetch fails, tell Claude — it will handle this gracefully
      // in its response rather than crashing your whole server
      content = `Could not fetch that page: ${error.message}`;
    }

    results.push({
      type: "tool_result",
      tool_use_id: toolUse.id, // must match the ID Claude gave us
      content,
    });
  }

  return results;
}

// ============================================================
// ROUTES
// ============================================================

app.get("/", (req, res) => {
  res.json({ status: "ChitChat NDIS Assistant is running!" });
});

// POST /chat
// Body: { message: string, history: array }
app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Build the starting messages — same as before
    let messages = [...history, { role: "user", content: message.trim() }];

    // ----------------------------------------------------------
    // THE AGENTIC LOOP
    // ----------------------------------------------------------
    // We keep calling Claude until it gives us a final text reply.
    // Each time Claude uses a tool, we:
    //   1. Add Claude's response (including the tool_use block) to messages
    //   2. Run the tool and get the result
    //   3. Add the tool result to messages
    //   4. Call Claude again with the updated conversation
    //
    // We cap at MAX_TOOL_ROUNDS to prevent infinite loops in case
    // something unexpected happens.
    // ----------------------------------------------------------

    const MAX_TOOL_ROUNDS = 5;
    let rounds = 0;
    let finalReply = null;

    while (finalReply === null && rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: NDIS_SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      });

      if (response.stop_reason === "end_turn") {
        // Claude is done — find the text block in its response
        const textBlock = response.content.find((b) => b.type === "text");
        finalReply = textBlock?.text ?? "I wasn't able to generate a response.";
      } else if (response.stop_reason === "tool_use") {
        // Claude wants to call a tool before answering
        const toolUseBlocks = response.content.filter(
          (b) => b.type === "tool_use",
        );

        // Step 1: Add Claude's response to the conversation
        // (the Anthropic API requires this before adding tool results)
        messages = [
          ...messages,
          { role: "assistant", content: response.content },
        ];

        // Step 2: Run the tools and collect results
        const toolResults = await runTools(toolUseBlocks);

        // Step 3: Add the results back as a user message
        // (the Anthropic API uses role "user" for tool results)
        messages = [...messages, { role: "user", content: toolResults }];

        // Loop again — Claude will now read the results and respond
      } else {
        // Unexpected stop reason — bail out safely
        finalReply = "I wasn't able to complete my response. Please try again.";
      }
    }

    // If we hit the round limit without a final answer
    if (finalReply === null) {
      finalReply =
        "I needed to look up too many things at once. Could you try asking " +
        "a more specific question?";
    }

    res.json({ reply: finalReply });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`✅ ChitChat server running on http://localhost:${PORT}`);
});
