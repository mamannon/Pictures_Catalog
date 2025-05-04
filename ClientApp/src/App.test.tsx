import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders React working text', () => {
    render(<App />);
    const textElement = screen.getByText(/React is working!/i);
    expect(textElement).toBeInTheDocument();
});
