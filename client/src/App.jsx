// App.jsx — the brain of your React frontend
//
// This component does three things:
//   1. Holds all the state (conversation history, loading, errors)
//   2. Handles sending messages to your backend
//   3. Renders the layout and passes data down to child components

import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';

const API_URL = 'http://localhost:3001/chat';

export default function App() {
  // ----------------------------------------------------------
  // STATE
  // Think of state as React's memory — when state changes,
  // the component re-renders and the UI updates automatically.
  // ----------------------------------------------------------

  // messages holds the full conversation history.
  // Each item: { role: 'user' | 'assistant', content: string }
  const [messages, setMessages] = useState([]);

  // isLoading is true while we're waiting for Claude to reply.
  const [isLoading, setIsLoading] = useState(false);

  // error holds a message to show if something goes wrong.
  const [error, setError] = useState(null);

  // ----------------------------------------------------------
  // SEND MESSAGE
  // async because we need to wait for the backend to reply.
  // ----------------------------------------------------------

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };

    // Update the UI immediately — don't wait for the server.
    // Stored in a variable so we can reference it in both the
    // optimistic update and when appending the assistant reply.
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setIsLoading(true);
    setError(null);

    try {
      // fetch() sends an HTTP request to our Express backend.
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          // Send history BEFORE the new message — the server
          // adds the new message itself before calling Claude.
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);

    } catch (err) {
      console.error('Chat error:', err);
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      // finally runs whether we succeeded or failed — always stop loading.
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // <main> is the correct semantic element for the primary page
  // content — screen readers use it as a navigation landmark.
  // ----------------------------------------------------------

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col items-center justify-center p-4">
      <main
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col h-[80vh]"
        aria-label="ChitChat NDIS Assistant"
      >
        <header className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800">ChitChat</h1>
          <p className="text-sm text-gray-500">Your NDIS assistant</p>
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />

        {/* role="alert" means screen readers announce this immediately when it appears */}
        {error && (
          <div
            role="alert"
            className="px-6 py-2 text-sm text-red-600 bg-red-50 border-t border-red-100"
          >
            {error}
          </div>
        )}

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
