import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateId,
  getDocuments,
  saveDocument,
  deleteDocument,
  updateDocumentTags,
  countWords,
  normalizeText,
} from '../lib/storage';
import { Document } from '../types';

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('deve gerar string não vazia', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('countWords', () => {
    it('deve contar palavras corretamente', () => {
      expect(countWords('hello world test')).toBe(3);
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

    it('deve deletar documento', () => {
      saveDocument(mockDoc);
      deleteDocument('test-1');
      const docs = getDocuments();
      expect(docs).toHaveLength(0);
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
  });
});
