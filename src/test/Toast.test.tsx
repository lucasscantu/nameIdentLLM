import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/Toast';

// Componente de teste que usa o hook
function TestComponent() {
  const { showToast } = useToast();
  
  return (
    <div>
      <button onClick={() => showToast('success', 'Mensagem de sucesso')}>
        Mostrar Toast
      </button>
      <button onClick={() => showToast('error', 'Mensagem de erro')}>
        Mostrar Erro
      </button>
    </div>
  );
}

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar children', () => {
    render(
      <ToastProvider>
        <div>Conteúdo de teste</div>
      </ToastProvider>
    );
    
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument();
  });

  it('deve mostrar toast ao clicar no botão', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Mostrar Toast');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Mensagem de sucesso')).toBeInTheDocument();
    });
  });

  it('deve mostrar toast de erro', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Mostrar Erro');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Mensagem de erro')).toBeInTheDocument();
    });
  });

  it('deve remover toast ao clicar no botão de fechar', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    const button = screen.getByText('Mostrar Toast');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Mensagem de sucesso')).toBeInTheDocument();
    });
    
    // Encontrar e clicar no botão de fechar (ícone X)
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Mensagem de sucesso')).not.toBeInTheDocument();
    });
  });
});
