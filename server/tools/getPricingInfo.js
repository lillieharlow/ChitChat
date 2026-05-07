import { PDFParse } from "pdf-parse";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This file lives in server/tools/, so go up two levels to reach the repo root
const PRICING_PDF_PATH = path.join(
  __dirname,
  "..",
  "..",
  "NDIS Pricing Arrangements and Price Limits 2025-26.pdf",
);

// Load once at server startup — no re-indexing during runtime
const PRICING_INDEX_PROMISE = loadPricingIndex();

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

export default getPricingInfo;
