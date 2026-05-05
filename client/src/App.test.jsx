import { render, screen } from '@testing-library/react';
import App from './App';

// A "smoke test" — just confirms the component renders without crashing
// and that the key structural elements are present.
test('renders the ChitChat header', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /chitchat/i })).toBeInTheDocument();
});

test('renders the empty state prompt', () => {
  render(<App />);
  expect(screen.getByText(/ask me anything about the ndis/i)).toBeInTheDocument();
});

test('renders the message input', () => {
  render(<App />);
  expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
});
