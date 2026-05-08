// Max tool-use rounds per request before the loop returns a fallback answer.
// Prevents runaway API calls if Claude keeps requesting tools without resolving.
export const MAX_ITERATIONS = 5;

// Only URLs under these domains may be fetched by the fetch_ndis_page tool.
// Restricting the allowlist prevents prompt injection from redirecting fetches
// to arbitrary or internal URLs.
export const ALLOWED_DOMAINS = ["ndis.gov.au"];
