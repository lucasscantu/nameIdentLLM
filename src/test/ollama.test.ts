import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ollamaClient } from '../lib/ollama';

describe('Ollama Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve ter URL padrão correta', () => {
    expect(ollamaClient.getBaseUrl()).toBe('http://localhost:11434');
  });

  it('deve permitir alterar URL base', () => {
    ollamaClient.setBaseUrl('http://custom:1234');
    expect(ollamaClient.getBaseUrl()).toBe('http://custom:1234');
    ollamaClient.setBaseUrl('http://localhost:11434'); // reset
  });

  it('deve permitir definir modelo', () => {
    ollamaClient.setModel('test-model');
    expect(ollamaClient.getModel()).toBe('test-model');
  });

  it('deve retornar status offline quando servidor não disponível', async () => {
    const status = await ollamaClient.checkStatus();
    expect(status).toHaveProperty('available');
    expect(status).toHaveProperty('models');
    expect(status).toHaveProperty('selectedModel');
    expect(status).toHaveProperty('baseUrl');
  });

  it('deve retornar null para embedding quando servidor offline', async () => {
    const embedding = await ollamaClient.generateEmbedding('test');
    expect(embedding).toBeNull();
  });

  it('deve retornar null para análise quando servidor offline', async () => {
    const analysis = await ollamaClient.analyzeSimilarity('text1', 'text2');
    expect(analysis).toBeNull();
  });

  it('deve retornar null para busca semântica quando servidor offline', async () => {
    const result = await ollamaClient.semanticSearch('query', []);
    expect(result).toBeNull();
  });
});
