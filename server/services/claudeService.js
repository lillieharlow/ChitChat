import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { fetchNdisPage, getPricingInfo } from "../tools/index.js";
import { MAX_ITERATIONS } from "../config/constants.js";

dotenv.config();

const client = new Anthropic();

// ============================================================
// NDIS SYSTEM PROMPT
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

Only use tools when the question is clearly about current or source-specific
information. For general NDIS explanations, answer directly without calling a
tool.

IMPORTANT: After you use a tool and receive the results, ALWAYS answer the
user's question directly using the information you found. Do not loop or call
tools multiple times for the same question. Give a friendly, clear answer using
the tool results you received.

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
// TOOL DEFINITIONS
// ============================================================
// The "menu" Claude reads to decide when and how to call each tool.
// The input_schema is the contract — it tells Claude exactly what
// arguments to provide.
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

// Keyword gate — avoids sending tool definitions to Claude for every message,
// which reduces token usage and prevents Claude from over-using tools on
// simple questions it can answer from training alone.
// Add keywords here whenever Claude should be prompted to use a tool for a
// new topic (e.g. new support types, policy areas users frequently ask about).
function shouldUseTools(message) {
  return /\b(current|latest|today|this year|pricing|price|rate|rates|cost|costs|hourly|line item|support worker|ndis website|policy|garden|gardener|yard|mow|mowing|lawn|household|cleaning)\b/i.test(
    message,
  );
}

// Executes the tool calls Claude requested and returns results in the
// format the Anthropic API expects (tool_result blocks)
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
      // Tell Claude the tool failed — it handles this gracefully in its response
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
// AGENTIC LOOP
// ============================================================
// Keeps calling Claude until it returns a final text reply.
// Each tool-use round appends Claude's request + the tool result
// to messages, then calls Claude again with the updated history.
// MAX_ITERATIONS caps the loop to prevent runaway API calls.
// ============================================================

export async function getChatReply(message, history) {
  const useTools = shouldUseTools(message);
  let messages = [...history, { role: "user", content: message.trim() }];

  let rounds = 0;
  let finalReply = null;

  while (finalReply === null && rounds < MAX_ITERATIONS) {
    rounds++;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: NDIS_SYSTEM_PROMPT,
      tools: useTools ? TOOLS : undefined,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      finalReply = textBlock?.text ?? "I wasn't able to generate a response.";
    } else if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b) => b.type === "tool_use",
      );

      // The Anthropic API requires Claude's response before tool results
      messages = [...messages, { role: "assistant", content: response.content }];

      const toolResults = await runTools(toolUseBlocks);

      // Tool results are sent back as role "user"
      messages = [...messages, { role: "user", content: toolResults }];
    } else {
      finalReply = "I wasn't able to complete my response. Please try again.";
    }
  }

  if (finalReply === null) {
    finalReply =
      "I needed to look up too many things at once. Could you try asking " +
      "a more specific question?";
  }

  return finalReply;
}
