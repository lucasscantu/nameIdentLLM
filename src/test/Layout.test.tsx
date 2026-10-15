import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '../components/Layout';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Layout Component', () => {
  it('deve renderizar o título DocSim', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('DocSim')).toBeInTheDocument();
  });

  it('deve renderizar navegação', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Similaridade')).toBeInTheDocument();
    expect(screen.getByText('Busca Semântica')).toBeInTheDocument();
    expect(screen.getByText('Detecção de Plágio')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });

  it('deve renderizar conteúdo children', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('deve mostrar indicador de sistema ativo', () => {
    renderWithProviders(
      <Layout>
        <div>Test</div>
      </Layout>
    );
    expect(screen.getByText('Sistema Ativo')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de processamento local', () => {
    renderWithProviders(
      <Layout>
        <div>Test</div>
      </Layout>
    );
    expect(screen.getByText('Processamento 100% Local')).toBeInTheDocument();
  });
});
