// ChatInput.jsx — the message input and send button
//
// Props:
//   onSend:    function(text: string) — called when the user submits
//   isLoading: boolean — disables input while waiting for a reply
//
// Accessibility notes:
//   - We use a <form> so Enter submits naturally and assistive
//     technologies understand this as a form control.
//   - The <label> is visually hidden (sr-only) but associated with
//     the textarea via htmlFor/id — screen readers will read it.
//   - Shift+Enter inserts a newline; Enter alone submits.
//   - aria-label on the button describes the action clearly,
//     and updates to "Sending…" while loading.
//   - disabled state on both input and button prevents double-submit.

import { useState } from 'react';

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e) => {
    // Enter submits; Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-4 border-t border-gray-100"
    >
      <div className="flex gap-2 items-end">
        {/* htmlFor links this label to the textarea below */}
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <textarea
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask about the NDIS…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-label={isLoading ? 'Sending message' : 'Send message'}
          className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
