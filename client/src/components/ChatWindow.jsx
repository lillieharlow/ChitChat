// ChatWindow.jsx — displays the conversation history
//
// Props:
//   messages:  array of { role: 'user' | 'assistant', content: string }
//   isLoading: boolean — true while waiting for Claude to reply
//
// Accessibility notes:
//   - role="log" is the correct ARIA role for chat transcripts.
//     It implies aria-live="polite" — screen readers announce new
//     messages without interrupting what they're already reading.
//   - The typing indicator uses aria-live="assertive" so it's
//     announced immediately, and aria-hidden on the visual dots
//     so the animation isn't narrated character by character.
//   - useRef + scrollIntoView keeps the view at the latest message.

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { styles } from '../styles';

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Scroll to the bottom whenever messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div role="log" aria-label="Conversation" aria-live="polite" className={styles.chatWindow}>
      {messages.length === 0 && <p className={styles.emptyState}>Ask me anything about the NDIS</p>}

      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className={`${styles.typingIndicator} px-4 py-3 rounded-2xl`}>
            {/* sr-only text is announced by the parent role="log" region (polite).
                Removed aria-live="assertive" here — nesting assertive inside polite
                causes double-announcements on VoiceOver and NVDA. */}
            <span className={styles.srOnly}>ChitChat is typing</span>
            {/* aria-hidden keeps the visual dots out of the accessibility tree.
                motion-reduce:animate-none stops the bounce for users with
                vestibular disorders (prefers-reduced-motion media query). */}
            <div aria-hidden="true" className="flex gap-1 items-center h-4">
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce motion-reduce:animate-none [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce motion-reduce:animate-none [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce motion-reduce:animate-none [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {/* Empty div at the bottom — scrolled into view on new messages */}
      <div ref={bottomRef} />
    </div>
  );
}
