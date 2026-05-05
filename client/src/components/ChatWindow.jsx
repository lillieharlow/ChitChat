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

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Scroll to the bottom whenever messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      className="flex-1 overflow-y-auto px-6 py-4"
    >
      {messages.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          Ask me anything about the NDIS
        </p>
      )}

      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-3">
          <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
            {/* sr-only text is read by screen readers; the dots are hidden from them */}
            <span className="sr-only" aria-live="assertive">
              ChitChat is typing
            </span>
            <div aria-hidden="true" className="flex gap-1 items-center h-4">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {/* Empty div at the bottom — scrolled into view on new messages */}
      <div ref={bottomRef} />
    </div>
  );
}
