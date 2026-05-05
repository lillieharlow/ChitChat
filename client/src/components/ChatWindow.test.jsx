import { render, screen } from '@testing-library/react';
import ChatWindow from './ChatWindow';

const messages = [
  { role: 'user', content: 'What is Core Support?' },
  { role: 'assistant', content: 'Core Support funds everyday activities.' },
];

test('shows empty state when there are no messages', () => {
  render(<ChatWindow messages={[]} isLoading={false} />);
  expect(screen.getByText(/ask me anything about the ndis/i)).toBeInTheDocument();
});

test('renders all messages', () => {
  render(<ChatWindow messages={messages} isLoading={false} />);
  expect(screen.getByText('What is Core Support?')).toBeInTheDocument();
  expect(screen.getByText('Core Support funds everyday activities.')).toBeInTheDocument();
});

test('shows typing indicator when loading', () => {
  render(<ChatWindow messages={[]} isLoading={true} />);
  expect(screen.getByText(/chitchat is typing/i)).toBeInTheDocument();
});

test('hides typing indicator when not loading', () => {
  render(<ChatWindow messages={[]} isLoading={false} />);
  expect(screen.queryByText(/chitchat is typing/i)).not.toBeInTheDocument();
});
