import { render, screen } from '@testing-library/react';
import App from './App';

test('renders study social app shell', () => {
  render(<App />);
  expect(screen.getByText(/study rooms for classes and hobbies/i)).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: /rooms/i })).toBeInTheDocument();
});
