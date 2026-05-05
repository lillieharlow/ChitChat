import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

test('renders input and send button', () => {
  render(<ChatInput onSend={() => {}} isLoading={false} />);
  expect(screen.getByLabelText(/type your message/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
});

test('send button is disabled when input is empty', () => {
  render(<ChatInput onSend={() => {}} isLoading={false} />);
  expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
});

test('send button is disabled while loading', () => {
  render(<ChatInput onSend={() => {}} isLoading={true} />);
  expect(screen.getByRole('button', { name: /sending message/i })).toBeDisabled();
});

test('calls onSend with the message text and clears input', () => {
  const onSend = jest.fn();
  render(<ChatInput onSend={onSend} isLoading={false} />);

  const input = screen.getByLabelText(/type your message/i);
  userEvent.type(input, 'What is the NDIS?');
  fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form'));

  expect(onSend).toHaveBeenCalledWith('What is the NDIS?');
  expect(input.value).toBe('');
});
