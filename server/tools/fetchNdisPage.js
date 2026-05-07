import * as cheerio from "cheerio";
import { ALLOWED_DOMAINS } from "../config/constants.js";

// Restricting to ALLOWED_DOMAINS prevents a manipulated prompt from tricking
// Claude into fetching internal services or arbitrary private URLs.
async function fetchNdisPage(url) {
  const isAllowed = ALLOWED_DOMAINS.some((domain) =>
    url.startsWith(`https://www.${domain}/`),
  );

  if (!isAllowed) {
    throw new Error(
      `Only ${ALLOWED_DOMAINS.join(", ")} URLs are permitted.`,
    );
  }

  const response = await fetch(url, {
    headers: {
      // Mimic a real browser — government sites with Cloudflare reject non-browser requests
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
  const $ = cheerio.load(html);

  $("nav, header, footer, script, style, .menu, .breadcrumb, .sidebar").remove();

  const content =
    $("main").text() ||
    $('[role="main"]').text() ||
    $(".content-area").text() ||
    $("body").text();

  // Cap at 8000 chars — enough for a full page but safe for Claude's context and API costs
  return content.replace(/\s+/g, " ").trim().slice(0, 8000);
}

export default fetchNdisPage;
