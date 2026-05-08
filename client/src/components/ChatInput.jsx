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

import { useState, useRef, useEffect } from 'react';
import { styles } from '../styles';

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Return focus to the textarea when loading finishes so keyboard users
  // don't get stranded on the disabled Send button after submitting.
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

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
    <form onSubmit={handleSubmit} className={styles.chatForm}>
      <div className="flex gap-2 items-end">
        {/* htmlFor links this label to the textarea below */}
        <label htmlFor="chat-input" className={styles.srOnly}>
          Type your message
        </label>
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask about the NDIS…"
          rows={1}
          className={`${styles.textarea} resize-none rounded-xl`}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-label={isLoading ? 'Sending message' : 'Send message'}
          className={`${styles.sendButton} shrink-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600 focus:ring-offset-2`}
        >
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
