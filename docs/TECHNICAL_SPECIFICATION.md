# Documentação Técnica - DocSim

## Especificação dos Algoritmos de Similaridade Textual

### 1. Introdução

Este documento apresenta a especificação técnica detalhada dos algoritmos de similaridade textual implementados no sistema DocSim. Cada algoritmo foi selecionado com base em suas características complementares, permitindo uma análise robusta e multifacetada da similaridade entre documentos acadêmicos.

### 2. Algoritmo de Levenshtein

#### 2.1 Definição Formal

A distância de Levenshtein entre duas strings *s* e *t* é definida como o número mínimo de operações de edição necessárias para transformar *s* em *t*, onde as operações permitidas são:

- **Inserção**: Adicionar um caractere
- **Deleção**: Remover um caractere  
- **Substituição**: Trocar um caractere por outro

#### 2.2 Formulação Matemática

Seja *d(i,j)* a distância de Levenshtein entre os prefixos *s[1..i]* e *t[1..j]*. A relação de recorrência é:

```
d(i,j) = min {
  d(i-1, j) + 1,      // deleção
  d(i, j-1) + 1,      // inserção
  d(i-1, j-1) + cost  // substituição
}
```

onde:
- *cost* = 0 se *s[i]* = *t[j]*
- *cost* = 1 se *s[i]* ≠ *t[j]*

**Condições de contorno:**
- *d(i, 0)* = *i* para todo *i* (deletar todos os caracteres de *s*)
- *d(0, j)* = *j* para todo *j* (inserir todos os caracteres de *t*)

#### 2.3 Complexidade

- **Tempo**: O(|*s*| × |*t*|)
- **Espaço**: O(|*s*| × |*t*|), otimizado para O(min(|*s*|, |*t*|))

#### 2.4 Cálculo de Similaridade

A similaridade é normalizada para o intervalo [0, 100]:

```
Similaridade_Levenshtein(s, t) = (max(|s|, |t|) - d(s,t)) / max(|s|, |t|) × 100
```

#### 2.5 Vantagens e Limitações

**Vantagens:**
- Captura diferenças estruturais em nível de caractere
- Sensível a pequenas alterações (erros de digitação, mudanças pontuais)
- Bem estabelecido na literatura

**Limitações:**
- Computacionalmente caro para textos longos
- Não considera semântica ou contexto
- Sensível a reordenações de palavras

### 3. Algoritmo de Jaro-Winkler

#### 3.1 Definição Formal

O algoritmo de Jaro mede a similaridade entre duas strings com base em caracteres correspondentes e transposições. A extensão de Winkler adiciona um bônus para prefixos comuns.

#### 3.2 Formulação Matemática

**Similaridade de Jaro:**

```
jaro(s1, s2) = {
  0, se m = 0
  (1/3) × (m/|s1| + m/|s2| + (m - t/2)/m), caso contrário
}
```

onde:
- *m* = número de caracteres correspondentes
- *t* = número de transposições divididas por dois
- Dois caracteres são considerados correspondentes se:
  - São iguais
  - Estão a uma distância máxima de ⌊max(|*s1*|, |*s2*|)/2⌋ - 1

**Extensão de Winkler:**

```
jaro-winkler(s1, s2) = jaro(s1, s2) + l × p × (1 - jaro(s1, s2))
```

onde:
- *l* = comprimento do prefixo comum (máximo 4 caracteres)
- *p* = constante de escala (padrão: 0.1)

#### 3.3 Complexidade

- **Tempo**: O(|*s1*| × |*s2*|)
- **Espaço**: O(|*s1*| + |*s2*|)

#### 3.4 Cálculo de Similaridade

```
Similaridade_JaroWinkler(s1, s2) = jaro-winkler(s1, s2) × 100
```

#### 3.5 Vantagens e Limitações

**Vantagens:**
- Excelente para strings curtas (nomes, termos técnicos)
- Bônus para prefixos comuns (útil em citações)
- Menos sensível a pequenas variações que Levenshtein

**Limitações:**
- Projetado originalmente para nomes pessoais
- Pode não capturar similaridade semântica
- Distância de correspondência pode ser inadequada para textos longos

### 4. Similaridade Baseada em Tokens (Índice de Jaccard)

#### 4.1 Definição Formal

O Índice de Jaccard mede a similaridade entre dois conjuntos como a razão entre o tamanho da interseção e o tamanho da união.

#### 4.2 Formulação Matemática

Dado dois textos *A* e *B*, sejam *T(A)* e *T(B)* os conjuntos de tokens únicos após tokenização e normalização:

```
Jaccard(A, B) = |T(A) ∩ T(B)| / |T(A) ∪ T(B)|
```

**Tokenização:**
```
T(texto) = {token ∈ texto | token é uma palavra após normalização}
```

**Normalização inclui:**
- Conversão para minúsculas
- Remoção de pontuação
- Remoção de stopwords (opcional)
- Stemming/Lemmatization (opcional)

#### 4.3 Complexidade

- **Tempo**: O(|*T(A)*| + |*T(B)*|) com hash sets
- **Espaço**: O(|*T(A)*| + |*T(B)*|)

#### 4.4 Cálculo de Similaridade

```
Similaridade_TokenBased(A, B) = Jaccard(A, B) × 100
```

#### 4.5 Vantagens e Limitações

**Vantagens:**
- Rápido e eficiente para textos longos
- Insensível à ordem das palavras
- Robusto a variações de formatação

**Limitações:**
- Não considera frequência de termos
- Ignora contexto e semântica
- Sensível a sinônimos e paráfrases

### 5. Similaridade de Bigramas (Coeficiente de Dice)

#### 5.1 Definição Formal

Os bigramas (ou 2-gramas) são sequências de dois elementos consecutivos. O Coeficiente de Dice mede a similaridade entre dois conjuntos de bigramas.

#### 5.2 Formulação Matemática

Dado dois textos *A* e *B*, sejam *BG(A)* e *BG(B)* os conjuntos de bigramas:

```
BG(texto) = {texto[i:i+2] | 0 ≤ i < |texto| - 1}
```

**Coeficiente de Dice:**

```
Dice(A, B) = 2 × |BG(A) ∩ BG(B)| / (|BG(A)| + |BG(B)|)
```

#### 5.3 Complexidade

- **Tempo**: O(|*A*| + |*B*|)
- **Espaço**: O(|*A*| + |*B*|)

#### 5.4 Cálculo de Similaridade

```
Similaridade_Bigram(A, B) = Dice(A, B) × 100
```

#### 5.5 Vantagens e Limitações

**Vantagens:**
- Captura padrões de caracteres consecutivos
- Robusto a pequenas alterações
- Eficiente computacionalmente
- Bom para detectar similaridade estrutural

**Limitações:**
- Não considera semântica
- Sensível a variações de espaçamento
- Pode gerar falsos positivos em textos curtos

### 6. Estratégia de Combinação

#### 6.1 Justificativa

Cada algoritmo possui características complementares:

- **Levenshtein**: Sensível a diferenças estruturais em nível de caractere
- **Jaro-Winkler**: Excelente para strings curtas com prefixos comuns
- **Token-Based**: Robusto a reordenações e variações de formatação
- **Bigram**: Captura padrões estruturais de caracteres consecutivos

A combinação ponderada permite mitigar limitações individuais e obter uma métrica mais robusta.

#### 6.2 Formulação da Combinação

```
Score_Combinado = w1 × Levenshtein + w2 × JaroWinkler + w3 × TokenBased + w4 × Bigram
```

**Pesos atribuídos:**
- *w1* = 0.20 (Levenshtein)
- *w2* = 0.20 (Jaro-Winkler)
- *w3* = 0.30 (Token-Based)
- *w4* = 0.30 (Bigram)

**Justificativa dos pesos:**
Os algoritmos baseados em tokens e bigramas recebem pesos maiores (30% cada) por serem mais robustos a:
- Variações de formatação
- Pequenas alterações textuais (comuns em plágio por paráfrase)
- Diferenças de estilo de escrita

#### 6.3 Validação

A combinação foi validada empiricamente com documentos acadêmicos reais, demonstrando:
- Maior precisão na detecção de plágio
- Menor taxa de falsos positivos
- Robustez a diferentes tipos de manipulação textual

### 7. Detecção de Trechos Similares

#### 7.1 Algoritmo

O algoritmo de detecção de trechos similares opera mediante janelas deslizantes:

1. **Divisão**: Ambos os textos são divididos em janelas de tamanho *W* (padrão: 50 palavras)
2. **Comparação**: Cada janela do texto de referência é comparada com todas as janelas do texto comparado
3. **Seleção**: Trechos com similaridade acima do threshold *T* (padrão: 40%) são selecionados
4. **Ordenação**: Resultados são ordenados por similaridade decrescente

#### 7.2 Formulação

```
Para cada janela w1 ∈ Texto1:
  Para cada janela w2 ∈ Texto2:
    sim = Similaridade_Bigram(w1, w2)
    Se sim > T:
      Adicionar (w1, w2, sim) aos resultados
```

#### 7.3 Complexidade

- **Tempo**: O((|*Texto1*|/*W*) × (|*Texto2*|/*W*) × *W*)
- **Espaço**: O(*n*) onde *n* é o número de trechos similares encontrados

#### 7.4 Otimizações

- **Janelas sobrepostas**: Janelas são deslocadas por *W*/2 para capturar trechos em posições intermediárias
- **Limitação de resultados**: Apenas os top-*k* trechos mais similares são retornados (padrão: *k* = 10)
- **Early termination**: Comparação é interrompida quando similaridade máxima possível é encontrada

### 8. Considerações de Implementação

#### 8.1 Normalização de Texto

Antes da aplicação dos algoritmos, o texto passa por normalização:

```typescript
function normalizeText(text: string): string {
  return text
    .toLowerCase()                           // Minúsculas
    .normalize('NFD')                        // Decomposição Unicode
    .replace(/[\u0300-\u036f]/g, '')         // Remoção de acentos
    .replace(/[^\w\s]/g, ' ')                // Remoção de pontuação
    .replace(/\s+/g, ' ')                    // Normalização de espaços
    .trim();                                 // Remoção de espaços extras
}
```

#### 8.2 Tokenização

```typescript
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sàáâãéêíóôõúüç]/g, ' ')  // Preservar caracteres acentuados
    .split(/\s+/)
    .filter(token => token.length > 0);
}
```

#### 8.3 Otimizações de Performance

- **Cache de resultados**: Análises recentes são cacheadas para evitar recálculos
- **Processamento incremental**: Para documentos muito longos, processamento é feito em chunks
- **Web Workers**: Algoritmos computacionalmente intensivos podem ser executados em threads separadas (implementação futura)

### 9. Referências Técnicas

1. Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. *Soviet Physics Doklady*, 10(8), 707-710.

2. Winkler, W. E. (1990). String matcher programs in the SAS and SPSS environments. *Proceedings of the Section on Survey Research Methods*, American Statistical Association, 443-448.

3. Jaccard, P. (1912). The distribution of the flora in the alpine zone. *New Phytologist*, 11(2), 37-50.

4. Dice, L. R. (1945). Measures of the amount of ecologic association between species. *Ecology*, 26(3), 297-302.

5. Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to Information Retrieval*. Cambridge University Press.

6. Jurafsky, D., & Martin, J. H. (2023). *Speech and Language Processing* (3rd ed. draft). Prentice Hall.

---

**Versão do Documento:** 1.0  
**Última Atualização:** 2024  
**Autores:** Equipe DocSim
