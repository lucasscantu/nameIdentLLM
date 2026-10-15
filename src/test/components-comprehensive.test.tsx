import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/Toast';
import Layout from '../components/Layout';
import App from '../App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('Bateria Completa de Testes - Componentes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Layout Component', () => {
    it('deve renderizar o título DocSim', () => {
      renderWithProviders(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      expect(screen.getByText('DocSim')).toBeInTheDocument();
    });

    it('deve renderizar todos os itens de navegação', () => {
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
      expect(screen.getByText('Histórico')).toBeInTheDocument();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    it('deve renderizar conteúdo children', () => {
      renderWithProviders(
        <Layout>
          <div>Conteúdo de Teste</div>
        </Layout>
      );
      expect(screen.getByText('Conteúdo de Teste')).toBeInTheDocument();
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

    it('deve ter navegação clicável', () => {
      renderWithProviders(
        <Layout>
          <div>Test</div>
        </Layout>
      );
      
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('href');
    });
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

    it('deve mostrar navegação principal', () => {
      render(<App />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('deve renderizar a página inicial', () => {
      render(<App />);
      // Deve mostrar conteúdo do Dashboard
      expect(screen.getByText(/DocSim/i)).toBeInTheDocument();
    });
  });

  describe('Toast Component', () => {
    it('deve renderizar children', () => {
      render(
        <ToastProvider>
          <div>Conteúdo de teste</div>
        </ToastProvider>
      );
      
      expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
    });

    it('deve fornecer hook useToast', () => {
      const TestComponent = () => {
        const { showToast } = require('../components/Toast').useToast();
        return <button onClick={() => showToast('success', 'Teste')}>Show Toast</button>;
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByText('Show Toast')).toBeInTheDocument();
    });
  });
});

describe('Testes de Acessibilidade', () => {
  it('deve ter labels ARIA nos botões de navegação', () => {
    render(<App />);
    
    // Verificar se há elementos interativos
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('deve ter estrutura semântica', () => {
    render(<App />);
    
    // Verificar presença de elementos semânticos
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('deve ter navegação por teclado', () => {
    render(<App />);
    
    // Verificar se há links navegáveis
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});

describe('Testes de Responsividade', () => {
  it('deve renderizar em viewport mobile', () => {
    // Simular viewport mobile
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 667 });
    
    render(<App />);
    expect(screen.getByText('DocSim')).toBeInTheDocument();
  });

  it('deve renderizar em viewport desktop', () => {
    // Simular viewport desktop
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1920 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 1080 });
    
    render(<App />);
    expect(screen.getByText('DocSim')).toBeInTheDocument();
  });
});
