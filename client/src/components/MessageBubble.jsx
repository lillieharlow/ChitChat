// MessageBubble.jsx — renders a single chat message
//
// Props:
//   message: { role: 'user' | 'assistant', content: string }
//
// User messages are plain text — no need to parse markdown.
// Assistant messages use ReactMarkdown so bold, lists, and
// headings render properly instead of showing raw symbols.

import ReactMarkdown from 'react-markdown';
import { styles } from '../styles';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${styles.messageBubble} rounded-2xl ${
          isUser ? styles.userMessage : styles.assistantMessage
        }`}
      >
        {/* sr-only span attributes the message to a speaker for screen readers.
            This is more reliable than aria-label on a div (which has no role). */}
        <span className={styles.srOnly}>{isUser ? 'You:' : 'ChitChat:'}</span>
        {isUser ? (
          message.content
        ) : (
          // components prop lets us style each markdown element with Tailwind
          // without needing a separate typography plugin
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className={styles.markdown.p}>{children}</p>,
              strong: ({ children }) => (
                <strong className={styles.markdown.strong}>{children}</strong>
              ),
              ul: ({ children }) => <ul className={styles.markdown.ul}>{children}</ul>,
              ol: ({ children }) => <ol className={styles.markdown.ol}>{children}</ol>,
              li: ({ children }) => <li className={styles.markdown.li}>{children}</li>,
              h2: ({ children }) => <h2 className={styles.markdown.h2}>{children}</h2>,
              h3: ({ children }) => <h3 className={styles.markdown.h3}>{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
