import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';

test('renders a user message', () => {
  render(<MessageBubble message={{ role: 'user', content: 'Hello' }} />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});

test('renders an assistant message', () => {
  render(<MessageBubble message={{ role: 'assistant', content: 'Hi there!' }} />);
  expect(screen.getByText('Hi there!')).toBeInTheDocument();
});

test('applies different aria-labels for user vs assistant', () => {
  const { rerender } = render(
    <MessageBubble message={{ role: 'user', content: 'Hello' }} />
  );
  expect(screen.getByLabelText(/^you:/i)).toBeInTheDocument();

  rerender(<MessageBubble message={{ role: 'assistant', content: 'Hello' }} />);
  expect(screen.getByLabelText(/^chitchat:/i)).toBeInTheDocument();
});
