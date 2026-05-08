/**
 * Centralized Tailwind style classes for the ChitChat app.
 * This ensures consistent, accessible colors across all components
 * and makes it easy to update the entire theme in one place.
 *
 * Contrast ratios verified against WCAG 2.1 AA (4.5:1 normal text, 3:1 large text).
 */

export const styles = {
  // ── App shell ────────────────────────────────────────────────────────────
  appWrapper: 'h-screen overflow-hidden bg-gray-100 flex flex-col items-center justify-center p-4',
  appCard: 'w-full max-w-2xl bg-gray-50 rounded-2xl shadow-lg flex flex-col h-[80vh]',

  // Header sits on bg-sage-50 (#F4F7F2). sage-800 (#3D5530) gives 6.3:1 contrast ✓
  appHeader: 'px-6 py-4 border-b border-sage-200 bg-sage-50',
  appTitle: 'text-xl font-semibold text-sage-800',
  // gray-800 (#4A4A4A) on sage-50 gives 7.8:1 contrast ✓
  appSubtitle: 'text-sm text-gray-800',

  // Error banner — red-600 (#C53030) on red-50 (#FFF5F5) gives 4.8:1 contrast ✓
  errorBanner: 'px-6 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100',

  // ── Chat window ───────────────────────────────────────────────────────────
  chatWindow: 'flex-1 overflow-y-auto px-6 py-4',
  chatForm: 'px-4 py-4 border-t border-gray-200',

  // ── Message bubbles ───────────────────────────────────────────────────────
  messageBubble: 'max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed',

  // bg-sage-400 (#9CAF88) + text-black (#1A1A1A) = 7.4:1 contrast ✓
  // Previous: text-white was only 2.4:1 — a WCAG failure.
  userMessage: 'bg-sage-400 text-black rounded-br-sm',

  // bg-sky-200 (#B4D7F1) + text-gray-800 (#4A4A4A) = 6.0:1 contrast ✓
  assistantMessage: 'bg-sky-200 text-gray-800 rounded-bl-sm',

  // ── Typing indicator ──────────────────────────────────────────────────────
  typingIndicator: 'bg-sky-100 px-4 py-3 rounded-2xl rounded-bl-sm',

  // ── Input area ────────────────────────────────────────────────────────────
  // border-gray-600 (#8B8B8B) on white = 3.4:1 — passes WCAG 1.4.11 (UI component boundary ≥ 3:1) ✓
  // Previous border-gray-200 was only ~1.2:1 — a WCAG 1.4.11 failure.
  textarea:
    'flex-1 p-3 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent bg-white text-gray-800 placeholder-gray-400',

  // bg-sage-600 text + border-sage-700 boundary on gray-50 = 4.1:1 — passes WCAG 1.4.11 ✓
  // Previous had no border; bg alone was ~2.9:1 — a WCAG 1.4.11 failure.
  sendButton:
    'px-4 py-2 bg-sage-600 text-black border border-sage-700 rounded-lg font-medium hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',

  // ── Text styles ───────────────────────────────────────────────────────────
  // gray-800 on gray-50 background = 8.5:1 ✓. Previous gray-600 was 3.3:1 — a WCAG failure.
  emptyState: 'text-center text-gray-800 text-sm mt-8',
  srOnly: 'sr-only',

  // ── Markdown rendering inside assistant messages ───────────────────────────
  // All text is gray-800 on sky-200 (6.0:1) ✓.
  // Previous: sage-600 and sky-600 on sky-200 were ~2.1:1 and ~1.9:1 — WCAG failures.
  markdown: {
    p: 'mb-2 last:mb-0',
    strong: 'font-semibold text-gray-800',
    ul: 'list-disc list-inside space-y-1 my-1 text-gray-800',
    ol: 'list-decimal list-inside space-y-1 my-1 text-gray-800',
    li: 'text-gray-800',
    h2: 'font-semibold mt-3 mb-1 text-gray-800',
    h3: 'font-medium mt-2 mb-1 text-gray-800',
  },
};
