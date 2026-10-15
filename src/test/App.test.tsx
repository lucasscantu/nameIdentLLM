import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('App Component', () => {
  it('deve renderizar sem erros', () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it('deve renderizar o layout principal', () => {
    render(<App />);
    expect(screen.getByText('DocSim')).toBeInTheDocument();
  });

  it('deve mostrar navegação', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });
});
