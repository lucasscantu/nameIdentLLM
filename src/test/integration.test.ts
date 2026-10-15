import { describe, it, expect, beforeEach } from 'vitest';
import { combinedSimilarity, findSimilarPassages } from '../lib/algorithms';
import { saveDocument, getDocuments, saveAnalysis, getAnalyses, generateId } from '../lib/storage';
import { Document } from '../types';

describe('Testes de Integração - Fluxo Completo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Fluxo de Upload e Análise', () => {
    it('deve fazer upload de documento e analisar similaridade', () => {
      // Upload
      const doc1: Document = {
        id: generateId(),
        name: 'documento1.txt',
        content: 'A pesquisa científica é fundamental para o avanço do conhecimento.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['pesquisa'],
        wordCount: 10,
        charCount: 60,
      };

      const doc2: Document = {
        id: generateId(),
        name: 'documento2.txt',
        content: 'A investigação científica é essencial para o progresso do saber.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['pesquisa'],
        wordCount: 10,
        charCount: 60,
      };

      saveDocument(doc1);
      saveDocument(doc2);

      // Verificar upload
      const docs = getDocuments();
      expect(docs).toHaveLength(2);

      // Análise de similaridade
      const similarity = combinedSimilarity(doc1.content, doc2.content);
      expect(similarity.combined).toBeGreaterThan(50);

      // Salvar análise
      saveAnalysis({
        id: generateId(),
        type: 'similarity',
        documents: [doc1.id, doc2.id],
        results: [{
          document1Id: doc1.id,
          document2Id: doc2.id,
          document1Name: doc1.name,
          document2Name: doc2.name,
          ...similarity,
          timestamp: new Date(),
        }],
        timestamp: new Date(),
        threshold: 50,
        status: 'completed',
      });

      // Verificar análise
      const analyses = getAnalyses();
      expect(analyses).toHaveLength(1);
      expect(analyses[0].results[0].combined).toBeGreaterThan(50);
    });

    it('deve detectar plágio em documentos similares', () => {
      const original: Document = {
        id: generateId(),
        name: 'original.txt',
        content: 'O método científico consiste em observação, hipótese, experimentação e conclusão. Esta abordagem sistemática garante a validade dos resultados.',
        type: 'txt',
        size: 200,
        uploadedAt: new Date(),
        tags: ['metodologia'],
        wordCount: 20,
        charCount: 150,
      };

      const plagio: Document = {
        id: generateId(),
        name: 'plagio.txt',
        content: 'O método científico consiste em observação, hipótese, experimentação e conclusão. Esta abordagem sistemática garante a validade dos resultados.',
        type: 'txt',
        size: 200,
        uploadedAt: new Date(),
        tags: ['metodologia'],
        wordCount: 20,
        charCount: 150,
      };

      saveDocument(original);
      saveDocument(plagio);

      const similarity = combinedSimilarity(original.content, plagio.content);
      expect(similarity.combined).toBe(100);

      // Detectar trechos similares
      const passages = findSimilarPassages(original.content, plagio.content);
      expect(passages.length).toBeGreaterThan(0);
      expect(passages[0].similarity).toBe(100);
    });

    it('deve lidar com documentos de diferentes tamanhos', () => {
      const short: Document = {
        id: generateId(),
        name: 'curto.txt',
        content: 'Texto curto.',
        type: 'txt',
        size: 12,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 2,
        charCount: 12,
      };

      const long: Document = {
        id: generateId(),
        name: 'longo.txt',
        content: 'Texto curto. ' + 'Esta é uma frase adicional. '.repeat(50),
        type: 'txt',
        size: 1000,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 300,
        charCount: 1500,
      };

      saveDocument(short);
      saveDocument(long);

      const similarity = combinedSimilarity(short.content, long.content);
      expect(similarity.combined).toBeGreaterThan(0);
      expect(similarity.combined).toBeLessThan(100);
    });
  });

  describe('Fluxo de Busca Semântica', () => {
    it('deve buscar documentos por palavras-chave', () => {
      const doc1: Document = {
        id: generateId(),
        name: 'metodologia.txt',
        content: 'A metodologia científica é fundamental para pesquisas acadêmicas.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['metodologia'],
        wordCount: 10,
        charCount: 60,
      };

      const doc2: Document = {
        id: generateId(),
        name: 'resultados.txt',
        content: 'Os resultados da pesquisa foram publicados em revistas científicas.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['resultados'],
        wordCount: 10,
        charCount: 60,
      };

      saveDocument(doc1);
      saveDocument(doc2);

      // Buscar por "metodologia"
      const query = 'metodologia';
      const docs = getDocuments();
      
      const results = docs.map(doc => {
        const content = doc.content.toLowerCase();
        const matches = content.includes(query.toLowerCase()) ? 1 : 0;
        return { docId: doc.id, relevance: matches * 100 };
      }).filter(r => r.relevance > 0);

      expect(results).toHaveLength(1);
      expect(results[0].docId).toBe(doc1.id);
    });
  });

  describe('Fluxo de Detecção de Plágio', () => {
    it('deve detectar plágio com threshold configurável', () => {
      const doc1: Document = {
        id: generateId(),
        name: 'doc1.txt',
        content: 'A pesquisa é importante. Os resultados são relevantes. A conclusão é clara.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 12,
        charCount: 70,
      };

      const doc2: Document = {
        id: generateId(),
        name: 'doc2.txt',
        content: 'A pesquisa é importante. Os resultados são relevantes. A conclusão é clara.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 12,
        charCount: 70,
      };

      saveDocument(doc1);
      saveDocument(doc2);

      const similarity = combinedSimilarity(doc1.content, doc2.content);
      
      // Threshold 50%
      expect(similarity.combined).toBeGreaterThan(50);
      
      // Threshold 90%
      expect(similarity.combined).toBeGreaterThan(90);
      
      // Threshold 100%
      expect(similarity.combined).toBe(100);
    });

    it('deve gerar relatório de plágio', () => {
      const original: Document = {
        id: generateId(),
        name: 'original.txt',
        content: 'Texto original com conteúdo único e específico.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 8,
        charCount: 50,
      };

      const copia: Document = {
        id: generateId(),
        name: 'copia.txt',
        content: 'Texto original com conteúdo único e específico.',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 8,
        charCount: 50,
      };

      saveDocument(original);
      saveDocument(copia);

      const similarity = combinedSimilarity(original.content, copia.content);
      
      // Gerar relatório
      const report = {
        documentId: original.id,
        documentName: original.name,
        totalSimilarity: similarity.combined,
        matches: [{
          comparedDocumentId: copia.id,
          comparedDocumentName: copia.name,
          similarity: similarity.combined,
          similarPassages: findSimilarPassages(original.content, copia.content),
        }],
        originalityScore: 100 - similarity.combined,
        timestamp: new Date(),
      };

      expect(report.totalSimilarity).toBe(100);
      expect(report.originalityScore).toBe(0);
      expect(report.matches).toHaveLength(1);
    });
  });

  describe('Fluxo de Gerenciamento de Documentos', () => {
    it('deve gerenciar tags de documentos', () => {
      const doc: Document = {
        id: generateId(),
        name: 'teste.txt',
        content: 'Conteúdo de teste',
        type: 'txt',
        size: 50,
        uploadedAt: new Date(),
        tags: ['inicial'],
        wordCount: 3,
        charCount: 18,
      };

      saveDocument(doc);

      // Atualizar tags
      const { updateDocumentTags } = require('../lib/storage');
      updateDocumentTags(doc.id, ['tag1', 'tag2', 'tag3']);

      const docs = getDocuments();
      expect(docs[0].tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('deve buscar documentos por conteúdo', () => {
      const doc1: Document = {
        id: generateId(),
        name: 'doc1.txt',
        content: 'Pesquisa sobre inteligência artificial',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['ia'],
        wordCount: 5,
        charCount: 40,
      };

      const doc2: Document = {
        id: generateId(),
        name: 'doc2.txt',
        content: 'Estudo sobre machine learning',
        type: 'txt',
        size: 100,
        uploadedAt: new Date(),
        tags: ['ml'],
        wordCount: 5,
        charCount: 30,
      };

      saveDocument(doc1);
      saveDocument(doc2);

      const docs = getDocuments();
      const query = 'inteligência';
      
      const results = docs.filter(doc => 
        doc.content.toLowerCase().includes(query.toLowerCase()) ||
        doc.name.toLowerCase().includes(query.toLowerCase())
      );

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(doc1.id);
    });
  });

  describe('Testes de Performance', () => {
    it('deve processar documentos de tamanho médio rapidamente', () => {
      const content = 'palavra '.repeat(1000);
      const doc1: Document = {
        id: generateId(),
        name: 'medio1.txt',
        content,
        type: 'txt',
        size: 8000,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 1000,
        charCount: 8000,
      };

      const doc2: Document = {
        id: generateId(),
        name: 'medio2.txt',
        content: content + ' extra',
        type: 'txt',
        size: 8006,
        uploadedAt: new Date(),
        tags: [],
        wordCount: 1001,
        charCount: 8006,
      };

      const start = Date.now();
      const similarity = combinedSimilarity(doc1.content, doc2.content);
      const duration = Date.now() - start;

      expect(similarity.combined).toBeGreaterThan(90);
      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });
  });
});
