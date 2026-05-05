// MessageBubble.jsx — renders a single chat message
//
// Props:
//   message: { role: 'user' | 'assistant', content: string }
//
// User messages are plain text — no need to parse markdown.
// Assistant messages use ReactMarkdown so bold, lists, and
// headings render properly instead of showing raw symbols.

import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        aria-label={`${isUser ? 'You' : 'ChitChat'}: ${message.content}`}
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          // components prop lets us style each markdown element with Tailwind
          // without needing a separate typography plugin
          <ReactMarkdown
            components={{
              p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              ul:     ({ children }) => <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>,
              ol:     ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>,
              li:     ({ children }) => <li>{children}</li>,
              h2:     ({ children }) => <h2 className="font-semibold mt-3 mb-1">{children}</h2>,
              h3:     ({ children }) => <h3 className="font-medium mt-2 mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
