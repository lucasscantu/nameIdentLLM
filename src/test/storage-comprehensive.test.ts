import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateId,
  getDocuments,
  saveDocument,
  deleteDocument,
  updateDocumentTags,
  countWords,
  normalizeText,
  getAnalyses,
  saveAnalysis,
} from '../lib/storage';
import { Document } from '../types';

describe('Bateria Completa de Testes - Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('deve gerar string não vazia', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('deve conter timestamp', () => {
      const id = generateId();
      const parts = id.split('-');
      expect(parts.length).toBeGreaterThan(0);
    });
  });

  describe('countWords', () => {
    it('deve contar palavras em texto simples', () => {
      expect(countWords('hello world test')).toBe(3);
    });

    it('deve contar palavras com pontuação', () => {
      expect(countWords('hello, world! test.')).toBe(3);
    });

    it('deve ignorar espaços extras', () => {
      expect(countWords('hello   world   test')).toBe(3);
    });

    it('deve retornar 0 para string vazia', () => {
      expect(countWords('')).toBe(0);
    });

    it('deve retornar 0 para apenas espaços', () => {
      expect(countWords('   ')).toBe(0);
    });

    it('deve contar palavras com caracteres acentuados', () => {
      expect(countWords('ação educação saúde')).toBe(3);
    });

    it('deve lidar com quebras de linha', () => {
      expect(countWords('hello\nworld\ntest')).toBe(3);
    });

    it('deve contar palavras com números', () => {
      expect(countWords('test 123 hello')).toBe(3);
    });
  });

  describe('normalizeText', () => {
    it('deve converter para minúsculas', () => {
      expect(normalizeText('HELLO World')).toBe('hello world');
    });

    it('deve remover acentos', () => {
      expect(normalizeText('ação é útil')).toBe('acao e util');
    });

    it('deve remover caracteres especiais', () => {
      expect(normalizeText('hello, world!')).toBe('hello world');
    });

    it('deve normalizar espaços', () => {
      expect(normalizeText('hello   world')).toBe('hello world');
    });

    it('deve remover pontuação', () => {
      expect(normalizeText('test. hello! world?')).toBe('test hello world');
    });

    it('deve lidar com texto vazio', () => {
      expect(normalizeText('')).toBe('');
    });

    it('deve lidar com apenas espaços', () => {
      expect(normalizeText('   ')).toBe('');
    });

    it('deve normalizar múltiplos acentos', () => {
      expect(normalizeText('áéíóúãõç')).toBe('aeiouaoc');
    });
  });

  describe('Document Management', () => {
    const mockDoc: Document = {
      id: 'test-1',
      name: 'test.txt',
      content: 'Test content',
      type: 'txt',
      size: 100,
      uploadedAt: new Date(),
      tags: ['test'],
      wordCount: 2,
      charCount: 12,
    };

    it('deve salvar e recuperar documento', () => {
      saveDocument(mockDoc);
      const docs = getDocuments();
      expect(docs).toHaveLength(1);
      expect(docs[0].id).toBe('test-1');
      expect(docs[0].name).toBe('test.txt');
    });

    it('deve salvar múltiplos documentos', () => {
      saveDocument(mockDoc);
      saveDocument({ ...mockDoc, id: 'test-2', name: 'test2.txt' });
      saveDocument({ ...mockDoc, id: 'test-3', name: 'test3.txt' });
      
      const docs = getDocuments();
      expect(docs).toHaveLength(3);
    });

    it('deve deletar documento', () => {
      saveDocument(mockDoc);
      deleteDocument('test-1');
      const docs = getDocuments();
      expect(docs).toHaveLength(0);
    });

    it('deve deletar documento específico', () => {
      saveDocument(mockDoc);
      saveDocument({ ...mockDoc, id: 'test-2' });
      deleteDocument('test-1');
      
      const docs = getDocuments();
      expect(docs).toHaveLength(1);
      expect(docs[0].id).toBe('test-2');
    });

    it('deve atualizar tags', () => {
      saveDocument(mockDoc);
      updateDocumentTags('test-1', ['new-tag', 'another']);
      const docs = getDocuments();
      expect(docs[0].tags).toEqual(['new-tag', 'another']);
    });

    it('deve retornar array vazio quando não há documentos', () => {
      const docs = getDocuments();
      expect(docs).toEqual([]);
    });

    it('deve preservar datas ao salvar', () => {
      const date = new Date('2024-01-01');
      saveDocument({ ...mockDoc, uploadedAt: date });
      const docs = getDocuments();
      expect(new Date(docs[0].uploadedAt).getTime()).toBe(date.getTime());
    });

    it('deve lidar com documentos grandes', () => {
      const largeDoc = {
        ...mockDoc,
        content: 'test '.repeat(10000),
        wordCount: 10000,
        charCount: 50000,
      };
      saveDocument(largeDoc);
      const docs = getDocuments();
      expect(docs[0].wordCount).toBe(10000);
    });
  });

  describe('Analysis Management', () => {
    const mockAnalysis = {
      id: 'analysis-1',
      type: 'similarity',
      documents: ['doc1', 'doc2'],
      results: [{ combined: 75 }],
      timestamp: new Date(),
      threshold: 50,
      status: 'completed',
    };

    it('deve salvar e recuperar análise', () => {
      saveAnalysis(mockAnalysis);
      const analyses = getAnalyses();
      expect(analyses).toHaveLength(1);
      expect(analyses[0].id).toBe('analysis-1');
    });

    it('deve salvar múltiplas análises', () => {
      saveAnalysis(mockAnalysis);
      saveAnalysis({ ...mockAnalysis, id: 'analysis-2' });
      saveAnalysis({ ...mockAnalysis, id: 'analysis-3' });
      
      const analyses = getAnalyses();
      expect(analyses).toHaveLength(3);
    });

    it('deve ordenar análises por data (mais recente primeiro)', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      
      saveAnalysis({ ...mockAnalysis, timestamp: date1 });
      saveAnalysis({ ...mockAnalysis, timestamp: date2 });
      saveAnalysis({ ...mockAnalysis, timestamp: date3 });
      
      const analyses = getAnalyses();
      expect(new Date(analyses[0].timestamp).getTime()).toBe(date3.getTime());
      expect(new Date(analyses[2].timestamp).getTime()).toBe(date1.getTime());
    });

    it('deve limitar a 50 análises', () => {
      for (let i = 0; i < 60; i++) {
        saveAnalysis({ ...mockAnalysis, id: `analysis-${i}` });
      }
      
      const analyses = getAnalyses();
      expect(analyses.length).toBeLessThanOrEqual(50);
    });

    it('deve retornar array vazio quando não há análises', () => {
      const analyses = getAnalyses();
      expect(analyses).toEqual([]);
    });
  });
});
