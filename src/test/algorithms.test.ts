import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  levenshteinSimilarity,
  jaroWinklerSimilarity,
  tokenBasedSimilarity,
  bigramSimilarity,
  combinedSimilarity,
  tokenize,
  getBigrams,
  findSimilarPassages,
} from '../lib/algorithms';

describe('Algoritmos de Similaridade', () => {
  describe('Levenshtein Distance', () => {
    it('deve retornar 0 para strings idênticas', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('deve calcular distância correta para strings diferentes', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('deve retornar comprimento da string quando uma está vazia', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('hello', '')).toBe(5);
    });

    it('deve retornar 0 para ambas strings vazias', () => {
      expect(levenshteinDistance('', '')).toBe(0);
    });
  });

  describe('Levenshtein Similarity', () => {
    it('deve retornar 100 para strings idênticas', () => {
      expect(levenshteinSimilarity('hello', 'hello')).toBe(100);
    });

    it('deve retornar 0 para strings completamente diferentes', () => {
      expect(levenshteinSimilarity('abc', 'xyz')).toBeLessThan(50);
    });

    it('deve retornar 100 para ambas strings vazias', () => {
      expect(levenshteinSimilarity('', '')).toBe(100);
    });

    it('deve calcular similaridade proporcional', () => {
      const sim = levenshteinSimilarity('hello', 'hallo');
      expect(sim).toBeGreaterThan(50);
      expect(sim).toBeLessThan(100);
    });
  });

  describe('Jaro-Winkler Similarity', () => {
    it('deve retornar 100 para strings idênticas', () => {
      expect(jaroWinklerSimilarity('hello', 'hello')).toBe(100);
    });

    it('deve dar bônus para prefixos comuns', () => {
      const sim1 = jaroWinklerSimilarity('martha', 'marhta');
      const sim2 = jaroWinklerSimilarity('martha', 'htamra');
      expect(sim1).toBeGreaterThan(sim2);
    });

    it('deve retornar 100 para ambas strings vazias', () => {
      expect(jaroWinklerSimilarity('', '')).toBe(100);
    });
  });

  describe('Tokenize', () => {
    it('deve tokenizar texto corretamente', () => {
      const tokens = tokenize('Hello, World! This is a test.');
      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).toContain('test');
    });

    it('deve remover caracteres especiais', () => {
      const tokens = tokenize('test@#$%123');
      expect(tokens).toContain('test');
      expect(tokens).toContain('123');
    });

    it('deve retornar array vazio para string vazia', () => {
      expect(tokenize('')).toEqual([]);
    });
  });

  describe('Token-Based Similarity', () => {
    it('deve retornar 100 para textos com mesmas palavras', () => {
      expect(tokenBasedSimilarity('hello world', 'world hello')).toBe(100);
    });

    it('deve retornar 0 para textos sem palavras em comum', () => {
      expect(tokenBasedSimilarity('hello world', 'foo bar')).toBe(0);
    });

    it('deve calcular similaridade parcial', () => {
      const sim = tokenBasedSimilarity('hello world test', 'hello world example');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(100);
    });
  });

  describe('Get Bigrams', () => {
    it('deve gerar bigrams corretamente', () => {
      const bigrams = getBigrams('hello');
      expect(bigrams).toContain('he');
      expect(bigrams).toContain('el');
      expect(bigrams).toContain('ll');
      expect(bigrams).toContain('lo');
    });

    it('deve retornar array vazio para string de 1 caractere', () => {
      expect(getBigrams('a')).toEqual([]);
    });
  });

  describe('Bigram Similarity', () => {
    it('deve retornar 100 para strings idênticas', () => {
      expect(bigramSimilarity('hello', 'hello')).toBe(100);
    });

    it('deve detectar similaridade estrutural', () => {
      const sim = bigramSimilarity('programming', 'programing');
      expect(sim).toBeGreaterThan(70);
    });
  });

  describe('Combined Similarity', () => {
    it('deve combinar todos os algoritmos', () => {
      const result = combinedSimilarity('hello world', 'hello world');
      expect(result.levenshtein).toBe(100);
      expect(result.jaroWinkler).toBe(100);
      expect(result.tokenBased).toBe(100);
      expect(result.bigram).toBe(100);
      expect(result.combined).toBe(100);
    });

    it('deve calcular score combinado ponderado', () => {
      const result = combinedSimilarity('hello world test', 'hello world example');
      expect(result.combined).toBeGreaterThan(0);
      expect(result.combined).toBeLessThan(100);
    });
  });

  describe('Find Similar Passages', () => {
    it('deve encontrar trechos similares', () => {
      const text1 = 'The quick brown fox jumps over the lazy dog. This is a test passage with some content.';
      const text2 = 'The quick brown fox jumps over the lazy cat. Another passage with different content.';
      
      const passages = findSimilarPassages(text1, text2, 10);
      expect(passages.length).toBeGreaterThan(0);
      expect(passages[0].similarity).toBeGreaterThan(0);
    });

    it('deve retornar array vazio para textos muito diferentes', () => {
      const text1 = 'completely different content here';
      const text2 = 'nothing similar at all whatsoever';
      
      const passages = findSimilarPassages(text1, text2, 5);
      expect(passages.length).toBe(0);
    });
  });
});
