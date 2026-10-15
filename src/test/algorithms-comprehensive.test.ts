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

describe('Bateria Completa de Testes - Algoritmos de Similaridade', () => {
  
  describe('Levenshtein Distance - Casos Extensivos', () => {
    it('deve calcular distância entre strings de tamanhos diferentes', () => {
      expect(levenshteinDistance('a', 'abc')).toBe(2);
      expect(levenshteinDistance('abc', 'a')).toBe(2);
      expect(levenshteinDistance('test', 'testing')).toBe(3);
    });

    it('deve lidar com caracteres especiais', () => {
      expect(levenshteinDistance('café', 'cafe')).toBe(1);
      expect(levenshteinDistance('ação', 'acao')).toBe(1);
      expect(levenshteinDistance('não', 'nao')).toBe(1);
    });

    it('deve calcular distância para strings longas', () => {
      const str1 = 'a'.repeat(100);
      const str2 = 'a'.repeat(99) + 'b';
      expect(levenshteinDistance(str1, str2)).toBe(1);
    });

    it('deve retornar 0 para strings vazias', () => {
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('deve calcular distância máxima corretamente', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
      expect(levenshteinDistance('hello', 'world')).toBe(4);
    });
  });

  describe('Levenshtein Similarity - Normalização', () => {
    it('deve normalizar similaridade para 0-100', () => {
      const sim = levenshteinSimilarity('hello', 'hallo');
      expect(sim).toBeGreaterThanOrEqual(0);
      expect(sim).toBeLessThanOrEqual(100);
    });

    it('deve retornar 100 para strings idênticas', () => {
      expect(levenshteinSimilarity('test', 'test')).toBe(100);
      expect(levenshteinSimilarity('método científico', 'método científico')).toBe(100);
    });

    it('deve retornar valores baixos para strings muito diferentes', () => {
      const sim = levenshteinSimilarity('abc', 'xyz');
      expect(sim).toBeLessThan(50);
    });

    it('deve ser simétrica', () => {
      const sim1 = levenshteinSimilarity('hello', 'world');
      const sim2 = levenshteinSimilarity('world', 'hello');
      expect(sim1).toBe(sim2);
    });
  });

  describe('Jaro-Winkler - Casos Especiais', () => {
    it('deve dar bônus para prefixos comuns', () => {
      const sim1 = jaroWinklerSimilarity('martha', 'marhta');
      const sim2 = jaroWinklerSimilarity('martha', 'htamra');
      expect(sim1).toBeGreaterThan(sim2);
    });

    it('deve lidar com strings de um caractere', () => {
      expect(jaroWinklerSimilarity('a', 'a')).toBe(100);
      expect(jaroWinklerSimilarity('a', 'b')).toBe(0);
    });

    it('deve calcular similaridade para nomes acadêmicos', () => {
      const sim = jaroWinklerSimilarity('Einstein', 'Enstein');
      expect(sim).toBeGreaterThan(80);
    });

    it('deve ser sensível a transposições', () => {
      const sim = jaroWinklerSimilarity('abcedf', 'abcdef');
      expect(sim).toBeGreaterThan(70);
    });
  });

  describe('Tokenize - Processamento de Texto', () => {
    it('deve tokenizar texto acadêmico', () => {
      const text = 'O método científico é fundamental para a pesquisa.';
      const tokens = tokenize(text);
      expect(tokens).toContain('método');
      expect(tokens).toContain('científico');
      expect(tokens).toContain('fundamental');
      expect(tokens).toContain('pesquisa');
    });

    it('deve remover pontuação', () => {
      const tokens = tokenize('Hello, world! How are you?');
      expect(tokens).not.toContain(',');
      expect(tokens).not.toContain('!');
      expect(tokens).not.toContain('?');
    });

    it('deve converter para minúsculas', () => {
      const tokens = tokenize('HELLO World TEST');
      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).toContain('test');
    });

    it('deve lidar com múltiplos espaços', () => {
      const tokens = tokenize('hello    world    test');
      expect(tokens).toHaveLength(3);
    });

    it('deve retornar array vazio para string vazia', () => {
      expect(tokenize('')).toEqual([]);
    });

    it('deve lidar com caracteres acentuados', () => {
      const tokens = tokenize('ação educação saúde');
      expect(tokens).toContain('ação');
      expect(tokens).toContain('educação');
      expect(tokens).toContain('saúde');
    });
  });

  describe('Token-Based Similarity - Jaccard', () => {
    it('deve calcular similaridade para textos acadêmicos', () => {
      const text1 = 'A pesquisa científica utiliza métodos rigorosos';
      const text2 = 'A investigação científica emprega métodos rigorosos';
      const sim = tokenBasedSimilarity(text1, text2);
      expect(sim).toBeGreaterThan(50);
    });

    it('deve ser insensível à ordem das palavras', () => {
      const sim1 = tokenBasedSimilarity('a b c', 'c b a');
      const sim2 = tokenBasedSimilarity('a b c', 'a b c');
      expect(sim1).toBe(sim2);
    });

    it('deve retornar 0 para textos sem palavras em comum', () => {
      const sim = tokenBasedSimilarity('hello world', 'foo bar baz');
      expect(sim).toBe(0);
    });

    it('deve retornar 100 para textos idênticos', () => {
      const sim = tokenBasedSimilarity('test text', 'test text');
      expect(sim).toBe(100);
    });

    it('deve lidar com textos de tamanhos diferentes', () => {
      const sim = tokenBasedSimilarity('a b c', 'a b c d e f');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(100);
    });
  });

  describe('Get Bigrams - Extração de N-gramas', () => {
    it('deve extrair bigrams corretamente', () => {
      const bigrams = getBigrams('hello');
      expect(bigrams).toEqual(['he', 'el', 'll', 'lo']);
    });

    it('deve normalizar texto antes de extrair', () => {
      const bigrams = getBigrams('HELLO');
      expect(bigrams).toEqual(['he', 'el', 'll', 'lo']);
    });

    it('deve remover caracteres especiais', () => {
      const bigrams = getBigrams('he!lo');
      expect(bigrams).toEqual(['he', 'el', 'lo']);
    });

    it('deve retornar array vazio para string de 1 caractere', () => {
      expect(getBigrams('a')).toEqual([]);
    });

    it('deve retornar array vazio para string vazia', () => {
      expect(getBigrams('')).toEqual([]);
    });

    it('deve lidar com espaços', () => {
      const bigrams = getBigrams('a b');
      expect(bigrams).toContain('a ');
      expect(bigrams).toContain(' b');
    });
  });

  describe('Bigram Similarity - Dice Coefficient', () => {
    it('deve detectar similaridade estrutural', () => {
      const sim = bigramSimilarity('programming', 'programing');
      expect(sim).toBeGreaterThan(70);
    });

    it('deve ser sensível a pequenas alterações', () => {
      const sim = bigramSimilarity('test', 'tset');
      expect(sim).toBeGreaterThan(50);
    });

    it('deve retornar 100 para strings idênticas', () => {
      expect(bigramSimilarity('hello', 'hello')).toBe(100);
    });

    it('deve retornar valores baixos para strings diferentes', () => {
      const sim = bigramSimilarity('abc', 'xyz');
      expect(sim).toBeLessThan(30);
    });

    it('deve lidar com textos longos', () => {
      const text1 = 'a'.repeat(100);
      const text2 = 'a'.repeat(100);
      expect(bigramSimilarity(text1, text2)).toBe(100);
    });
  });

  describe('Combined Similarity - Ensemble', () => {
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
      
      // Verificar que o combinado é uma média ponderada
      const expected = Math.round(
        result.levenshtein * 0.2 +
        result.jaroWinkler * 0.2 +
        result.tokenBased * 0.3 +
        result.bigram * 0.3
      );
      expect(result.combined).toBe(expected);
    });

    it('deve retornar todos os scores individuais', () => {
      const result = combinedSimilarity('test', 'test');
      expect(result).toHaveProperty('levenshtein');
      expect(result).toHaveProperty('jaroWinkler');
      expect(result).toHaveProperty('tokenBased');
      expect(result).toHaveProperty('bigram');
      expect(result).toHaveProperty('combined');
    });

    it('deve ser robusto a diferentes tipos de similaridade', () => {
      // Paráfrase
      const result1 = combinedSimilarity(
        'O experimento foi realizado',
        'A experiência foi conduzida'
      );
      expect(result1.combined).toBeGreaterThan(30);
      
      // Cópia com pequenas alterações
      const result2 = combinedSimilarity(
        'metodologia científica rigorosa',
        'metodologia cientifica rigorosa'
      );
      expect(result2.combined).toBeGreaterThan(80);
    });
  });

  describe('Find Similar Passages - Detecção de Trechos', () => {
    it('deve encontrar trechos similares em textos longos', () => {
      const text1 = 'A pesquisa científica é fundamental para o avanço do conhecimento. ' +
                    'Os métodos utilizados devem ser rigorosos e replicáveis. ' +
                    'A análise dos dados requer cuidado e precisão.';
      const text2 = 'A investigação científica é essencial para o progresso do saber. ' +
                    'Os procedimentos empregados precisam ser rigorosos e replicáveis. ' +
                    'O exame das informações exige atenção e exatidão.';
      
      const passages = findSimilarPassages(text1, text2, 10);
      expect(passages.length).toBeGreaterThan(0);
      expect(passages[0].similarity).toBeGreaterThan(40);
    });

    it('deve retornar array vazio para textos muito diferentes', () => {
      const text1 = 'completely different content here nothing similar';
      const text2 = 'totally unrelated text with no matching patterns';
      
      const passages = findSimilarPassages(text1, text2, 5);
      expect(passages).toHaveLength(0);
    });

    it('deve ordenar por similaridade decrescente', () => {
      const text1 = 'hello world test example sample';
      const text2 = 'hello world test demo instance';
      
      const passages = findSimilarPassages(text1, text2, 5);
      for (let i = 1; i < passages.length; i++) {
        expect(passages[i - 1].similarity).toBeGreaterThanOrEqual(passages[i].similarity);
      }
    });

    it('deve limitar resultados a 10 trechos', () => {
      const text1 = 'a b c d e f g h i j k l m n o p q r s t'.repeat(5);
      const text2 = 'a b c d e f g h i j k l m n o p q r s t'.repeat(5);
      
      const passages = findSimilarPassages(text1, text2, 5);
      expect(passages.length).toBeLessThanOrEqual(10);
    });

    it('deve incluir posições dos trechos', () => {
      const text1 = 'hello world test';
      const text2 = 'hello world test';
      
      const passages = findSimilarPassages(text1, text2, 3);
      expect(passages[0]).toHaveProperty('position1');
      expect(passages[0]).toHaveProperty('position2');
      expect(passages[0]).toHaveProperty('text1');
      expect(passages[0]).toHaveProperty('text2');
      expect(passages[0]).toHaveProperty('similarity');
    });
  });

  describe('Casos de Borda e Erros', () => {
    it('deve lidar com strings muito longas', () => {
      const longText = 'test '.repeat(1000);
      const sim = combinedSimilarity(longText, longText);
      expect(sim.combined).toBe(100);
    });

    it('deve lidar com strings com apenas espaços', () => {
      const sim = combinedSimilarity('   ', '   ');
      expect(sim.combined).toBeGreaterThanOrEqual(0);
    });

    it('deve lidar com strings com caracteres especiais', () => {
      const sim = combinedSimilarity('!@#$%', '!@#$%');
      expect(sim.combined).toBeGreaterThanOrEqual(0);
    });

    it('deve lidar com strings unicode', () => {
      const sim = combinedSimilarity('日本語テスト', '日本語テスト');
      expect(sim.combined).toBe(100);
    });

    it('deve lidar com emojis', () => {
      const sim = combinedSimilarity('😀😁😂', '😀😁😂');
      expect(sim.combined).toBeGreaterThanOrEqual(0);
    });
  });
});
