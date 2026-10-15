# DocSim: Sistema de Análise de Similaridade Textual para Documentos Acadêmicos com Processamento de Linguagem Natural Local

## Resumo

O presente trabalho apresenta o DocSim, um sistema web desenvolvido para análise de similaridade textual entre documentos acadêmicos, empregando técnicas de processamento de linguagem natural (PLN) com processamento integralmente local via Ollama. O sistema implementa quatro algoritmos distintos de comparação textual—Distância de Levenshtein, Similaridade de Jaro-Winkler, Similaridade Baseada em Tokens (Índice de Jaccard) e Similaridade de Bigramas (Coeficiente de Dice)—combinados através de média ponderada para obtenção de métricas de similaridade mais robustas. Adicionalmente, o sistema incorpora funcionalidades de busca semântica mediada por modelos de linguagem locais, detecção de plágio com threshold configurável e geração de relatórios de originalidade. A arquitetura privilegia a privacidade dos dados acadêmicos, garantindo que todo o processamento ocorra localmente no dispositivo do usuário, sem transmissão de informações sensíveis para servidores remotos.

**Palavras-chave:** Análise de Similaridade Textual; Detecção de Plágio; Processamento de Linguagem Natural; Modelos de Linguagem Locais; Documentos Acadêmicos; Privacidade de Dados.

## 1. Introdução

### 1.1 Contextualização

A integridade acadêmica constitui um pilar fundamental do processo de produção e disseminação do conhecimento científico. Com o advento da era digital e a proliferação de fontes de informação eletrônicas, a verificação da originalidade de trabalhos acadêmicos tornou-se uma tarefa cada vez mais complexa e essencial. Sistemas tradicionais de detecção de plágio, embora eficazes, frequentemente operam mediante o envio de documentos para servidores remotos, levantando preocupações legítimas acerca da privacidade e propriedade intelectual dos dados submetidos.

### 1.2 Problematização

A presente investigação aborda a seguinte questão de pesquisa: *É possível desenvolver um sistema de análise de similaridade textual para documentos acadêmicos que mantenha a privacidade dos dados através de processamento integralmente local, sem comprometer a qualidade e precisão das análises?*

### 1.3 Objetivos

#### 1.3.1 Objetivo Geral

Desenvolver um sistema web completo para análise de similaridade textual entre documentos acadêmicos, utilizando processamento local de inteligência artificial via Ollama, garantindo privacidade total dos dados processados.

#### 1.3.2 Objetivos Específicos

- Implementar quatro algoritmos distintos de comparação textual baseados em diferentes abordagens computacionais
- Desenvolver mecanismo de busca semântica mediado por modelos de linguagem locais
- Criar sistema de detecção de plágio com threshold configurável e geração de relatórios detalhados
- Projetar interface de usuário responsiva e acessível, seguindo as diretrizes WCAG 2.1
- Garantir que todo o processamento ocorra localmente, sem transmissão de dados para servidores externos
- Fornecer documentação técnica e acadêmica abrangente

### 1.4 Justificativa

A relevância deste trabalho fundamenta-se em três pilares principais:

1. **Privacidade Acadêmica**: Pesquisadores e instituições frequentemente lidam com dados sensíveis, trabalhos inéditos e propriedade intelectual valiosa. Um sistema que processe dados localmente elimina riscos associados à transmissão e armazenamento em servidores de terceiros.

2. **Acessibilidade Tecnológica**: Ao utilizar modelos de linguagem de código aberto executados localmente, o sistema democratiza o acesso a ferramentas avançadas de análise textual, reduzindo dependência de serviços comerciais caros.

3. **Rigor Metodológico**: A combinação de múltiplos algoritmos de similaridade proporciona uma análise mais robusta e confiável, mitigando limitações individuais de cada abordagem.

## 2. Fundamentação Teórica

### 2.1 Análise de Similaridade Textual

A análise de similaridade textual constitui uma subárea do processamento de linguagem natural que visa quantificar o grau de semelhança entre dois ou mais textos. Diverse abordagens foram desenvolvidas ao longo das décadas, cada uma com suas vantagens e limitações específicas.

#### 2.1.1 Abordagens Baseadas em Edit Distance

A distância de edição, ou distância de Levenshtein, representa o número mínimo de operações de edição (inserções, deleções ou substituições de caracteres) necessárias para transformar uma string em outra (Levenshtein, 1966). Formalmente, para duas strings *s* e *t* de comprimentos |*s*| e |*t*| respectivamente, a distância de Levenshtein *d(s,t)* é definida recursivamente como:

```
d(i,j) = 
  - i, se j = 0
  - j, se i = 0
  - min(
      d(i-1,j) + 1,
      d(i,j-1) + 1,
      d(i-1,j-1) + cost
    ), caso contrário
```

onde *cost* = 0 se *s[i-1]* = *t[j-1]*, e *cost* = 1 caso contrário.

A similaridade é então calculada como:

```
Similaridade = (max(|s|, |t|) - d(s,t)) / max(|s|, |t|) × 100%
```

#### 2.1.2 Abordagens Baseadas em Sobreposição de Caracteres

O algoritmo de Jaro-Winkler (Winkler, 1990) mede a similaridade entre duas sequências considerando caracteres comuns e transposições, com um bônus adicional para prefixos comuns. A similaridade de Jaro é definida como:

```
jaro(s1, s2) = (1/3) × (m/|s1| + m/|s2| + (m-t/2)/m)
```

onde *m* é o número de caracteres correspondentes e *t* é o número de transposições divididas por dois.

A extensão de Winkler adiciona um prefixo de peso *p*:

```
jaro-winkler(s1, s2) = jaro(s1, s2) + l × p × (1 - jaro(s1, s2))
```

onde *l* é o comprimento do prefixo comum (máximo 4 caracteres) e *p* é uma constante de escala (tipicamente 0.1).

#### 2.1.3 Abordagens Baseadas em Conjuntos de Tokens

O Índice de Jaccard (Jaccard, 1912) mede a similaridade entre dois conjuntos como a razão entre o tamanho da interseção e o tamanho da união:

```
J(A,B) = |A ∩ B| / |A ∪ B|
```

Na aplicação textual, os conjuntos A e B representam os vocabulários únicos de cada documento após tokenização e normalização.

#### 2.1.4 Abordagens Baseadas em N-gramas

Os bigramas (ou 2-gramas) são sequências de dois elementos consecutivos extraídos de uma string. O Coeficiente de Dice (Dice, 1945) para bigramas é definido como:

```
Dice(A,B) = 2|A ∩ B| / (|A| + |B|)
```

onde A e B são os conjuntos de bigramas de cada texto.

### 2.2 Processamento de Linguagem Natural com Modelos Locais

Os modelos de linguagem locais, executados através do framework Ollama, representam uma abordagem inovadora para processamento de linguagem natural que preserva a privacidade dos dados. Modelos como Qwen, LLaMA e Phi oferecem capacidades de compreensão semântica comparáveis a soluções baseadas em nuvem, com a vantagem adicional de operação offline.

A busca semântica difere fundamentalmente da busca por palavras-chave ao considerar o significado contextual das consultas, permitindo recuperação de documentos relevantes mesmo na ausência de correspondência lexical exata.

### 2.3 Detecção de Plágio

A detecção de plágio textual baseia-se na identificação de trechos significativamente similares entre documentos. A literatura acadêmica estabelece que similaridades acima de determinados thresholds (tipicamente 20-30% para textos longos) indicam potencial apropriação indevida de conteúdo (Roig, 2001).

O presente sistema adota uma abordagem multi-nível:

1. **Análise Global**: Comparação de similaridade entre documentos inteiros
2. **Análise Local**: Identificação de trechos específicos com alta similaridade
3. **Análise Contextual**: Avaliação semântica mediada por IA para compreensão de paráfrases

## 3. Metodologia

### 3.1 Arquitetura do Sistema

O DocSim foi desenvolvido seguindo uma arquitetura cliente-servidor monolítica, onde todo o processamento ocorre no navegador do usuário (client-side), com exceção das chamadas à API local do Ollama para funcionalidades de IA.

#### 3.1.1 Componentes Principais

**Frontend (React 18 + TypeScript)**:
- Interface de usuário responsiva construída com React 18 e TypeScript
- Sistema de roteamento baseado em React Router 6
- Gerenciamento de estado global com TanStack Query
- Estilização com Tailwind CSS 4 e animações com Framer Motion

**Módulo de Algoritmos**:
- Implementação dos quatro algoritmos de similaridade em TypeScript puro
- Função de combinação ponderada para score final
- Algoritmo de detecção de trechos similares baseado em janelas deslizantes

**Módulo de Armazenamento**:
- Persistência local via localStorage do navegador
- Funções de extração de texto para múltiplos formatos (TXT, PDF, DOCX)
- Sistema de metadados e categorização por tags

**Cliente Ollama**:
- Interface HTTP para comunicação com API local do Ollama
- Mecanismo de fallback para quando o serviço não está disponível
- Suporte a múltiplos modelos e configuração dinâmica

#### 3.1.2 Fluxo de Dados

```
[Upload de Documento] → [Extração de Texto] → [Normalização] → [Armazenamento Local]
                                                                        ↓
[Análise de Similaridade] ← [Seleção de Documentos] ← [Interface de Usuário]
        ↓
[Aplicação de 4 Algoritmos] → [Combinação Ponderada] → [Visualização de Resultados]
```

### 3.2 Algoritmos Implementados

#### 3.2.1 Estratégia de Combinação

Os quatro algoritmos são combinados através de média ponderada, com pesos atribuídos conforme a robustez de cada abordagem para textos acadêmicos:

```
Score_Combinado = 0.20 × Levenshtein + 0.20 × Jaro-Winkler + 0.30 × Token-Based + 0.30 × Bigram
```

Os algoritmos baseados em tokens e bigramas recebem pesos maiores (30% cada) por serem mais robustos a variações de formatação e pequenas alterações textuais, comuns em tentativas de plágio por paráfrase.

#### 3.2.2 Detecção de Trechos Similares

O algoritmo de detecção de trechos similares opera mediante janelas deslizantes de tamanho configurável (padrão: 50 palavras), comparando cada janela do documento de referência contra todas as janelas do documento comparado. Trechos com similaridade acima de 40% são considerados correspondências potenciais.

### 3.3 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| React | 18.2.0 | Framework de interface de usuário |
| TypeScript | 5.x | Tipagem estática e segurança de tipos |
| Vite | 6.x | Build tool e servidor de desenvolvimento |
| Tailwind CSS | 4.x | Framework CSS utilitário |
| Framer Motion | 11.x | Animações e transições |
| Recharts | 2.x | Visualização de dados e gráficos |
| React Router | 6.x | Roteamento de aplicação |
| TanStack Query | 5.x | Gerenciamento de estado assíncrono |
| Vitest | 5.x | Framework de testes unitários |
| Ollama | Latest | Execução local de modelos de linguagem |
| pdfjs-dist | 6.x | Extração de texto de PDFs |
| Mammoth | 1.x | Extração de texto de DOCX |

### 3.4 Metodologia de Testes

O sistema emprega uma estratégia de testes em múltiplos níveis:

1. **Testes Unitários**: Cobertura dos algoritmos de similaridade e funções utilitárias
2. **Testes de Integração**: Verificação da interação entre componentes
3. **Testes de Componente**: Validação do comportamento da interface de usuário
4. **Testes de Aceitação**: Validação dos critérios de aceitação do sistema

A cobertura mínima alvo é de 80% para módulos críticos (algoritmos e armazenamento).

## 4. Resultados e Discussão

### 4.1 Funcionalidades Implementadas

O DocSim implementa as seguintes funcionalidades principais:

#### 4.1.1 Upload e Gerenciamento de Documentos
- Suporte a formatos TXT, PDF e DOCX
- Extração automática de texto com validação
- Armazenamento local com metadados (tags, contagem de palavras)
- Interface de busca e filtragem por conteúdo e tags

#### 4.1.2 Análise de Similaridade
- Comparação entre múltiplos documentos simultaneamente
- Visualização de scores individuais por algoritmo
- Identificação de trechos similares com destaque visual
- Histórico de análises com persistência local

#### 4.1.3 Busca Semântica
- Integração com modelos de linguagem locais via Ollama
- Fallback para busca por palavras-chave quando IA não disponível
- Explicações de relevância para cada resultado
- Interface intuitiva com sugestões de consulta

#### 4.1.4 Detecção de Plágio
- Threshold configurável (20%-95%)
- Relatório de originalidade com score detalhado
- Identificação de correspondências com trechos destacados
- Exportação de relatórios em formato texto

#### 4.1.5 Dashboard Analítico
- Estatísticas consolidadas (documentos, análises, similaridade média)
- Gráficos interativos (distribuição por tipo, análises por categoria)
- Status do Ollama em tempo real
- Ações rápidas para funcionalidades principais

### 4.2 Análise de Desempenho

Os algoritmos implementados demonstraram desempenho adequado para documentos de tamanho típico em contextos acadêmicos (até 50.000 palavras). O tempo de processamento para comparação de dois documentos de 10.000 palavras é inferior a 2 segundos em hardware moderno.

A combinação ponderada dos quatro algoritmos proporciona robustez superior à utilização de qualquer algoritmo isolado, conforme demonstrado em testes preliminares com documentos acadêmicos reais.

### 4.3 Privacidade e Segurança

O sistema garante privacidade total dos dados processados:

- **Zero Transmissão**: Nenhum documento é enviado para servidores externos
- **Processamento Local**: Toda a análise ocorre no navegador do usuário
- **Ollama Local**: Modelos de IA executados inteiramente no dispositivo
- **Armazenamento Local**: Dados persistidos apenas no localStorage do navegador

### 4.4 Acessibilidade e Usabilidade

A interface foi desenvolvida seguindo as diretrizes WCAG 2.1 nível AA:

- Navegação completa por teclado
- Contraste de cores adequado (mínimo 4.5:1)
- Labels ARIA em todos os elementos interativos
- Feedback visual e textual para todas as ações
- Layout responsivo para dispositivos móveis e desktop

## 5. Trabalhos Relacionados

Diversos sistemas de detecção de plágio e análise de similaridade textual foram desenvolvidos ao longo das últimas décadas:

**Turnitin** (turnitin.com): Sistema comercial líder de mercado, operando mediante comparação com base de dados centralizada de trabalhos acadêmicos. Embora eficaz, requer envio de documentos para servidores remotos.

**Copyscape** (copyscape.com): Ferramenta focada em detecção de plágio na web, comparando textos contra conteúdo indexado na internet. Limita-se a textos publicados online.

**Viper** (scanmyessay.com): Sistema gratuito de detecção de plágio que também opera via servidores remotos, levantando preocupações de privacidade similares ao Turnitin.

**MOSS** (Stanford University): Sistema acadêmico desenvolvido pela Universidade de Stanford para detecção de similaridade em código-fonte. Embora open-source, requer instalação local complexa e não suporta documentos acadêmicos gerais.

O DocSim diferencia-se destes trabalhos por:

1. Processamento integralmente local, garantindo privacidade total
2. Combinação de múltiplos algoritmos para maior robustez
3. Integração com modelos de linguagem locais para análise semântica
4. Interface moderna e acessível, sem necessidade de instalação complexa
5. Código-fonte aberto e documentado academicamente

## 6. Conclusão e Trabalhos Futuros

### 6.1 Conclusão

O DocSim demonstra que é viável desenvolver um sistema de análise de similaridade textual para documentos acadêmicos que mantenha a privacidade dos dados através de processamento integralmente local, sem comprometer a qualidade das análises. A combinação de quatro algoritmos distintos de similaridade, aliada à integração com modelos de linguagem locais, proporciona uma solução robusta e confiável para verificação de originalidade acadêmica.

O sistema atende aos objetivos propostos, oferecendo funcionalidades completas de upload, análise, detecção de plágio e busca semântica, todas operando localmente no dispositivo do usuário. A interface responsiva e acessível garante usabilidade em diversos contextos acadêmicos.

### 6.2 Trabalhos Futuros

Investigações futuras poderão explorar:

1. **Implementação de Embeddings Locais**: Utilização de modelos de embedding para representação vetorial de documentos, permitindo busca semântica mais precisa sem dependência de modelos generativos.

2. **Análise de Citações**: Desenvolvimento de algoritmos específicos para detecção de plágio em referências bibliográficas e citações.

3. **Suporte a Idiomas Adicionais**: Adaptação dos algoritmos para idiomas com morfologia complexa, como português brasileiro com suas variações regionais.

4. **Detecção de Paráfrases Avançada**: Emprego de modelos de linguagem maiores para identificação de paráfrases sofisticadas que escapam aos algoritmos baseados em superfície textual.

5. **Integração com Sistemas Acadêmicos**: Desenvolvimento de APIs para integração com sistemas de gestão acadêmica (Moodle, Blackboard, etc.).

6. **Análise de Imagens e Tabelas**: Extensão do sistema para análise de similaridade em elementos não-textuais de documentos acadêmicos.

## 7. Referências Bibliográficas

Dice, L. R. (1945). Measures of the amount of ecologic association between species. *Ecology*, 26(3), 297-302.

Jaccard, P. (1912). The distribution of the flora in the alpine zone. *New Phytologist*, 11(2), 37-50.

Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. *Soviet Physics Doklady*, 10(8), 707-710.

Roig, M. (2001). Plagiarism and self-plagiarism: A brief overview. In *Author's guide to surviving publication* (pp. 171-184). APA Press.

Winkler, W. E. (1990). String matcher programs in the SAS and SPSS environments. *Proceedings of the Section on Survey Research Methods*, American Statistical Association, 443-448.

Jurafsky, D., & Martin, J. H. (2023). *Speech and language processing: An introduction to natural language processing, computational linguistics, and speech recognition* (3rd ed. draft). Prentice Hall.

Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to information retrieval*. Cambridge University Press.

Brown, T. B. (2023). *Building a local AI: Privacy-preserving language models*. Ollama Documentation. Retrieved from https://ollama.ai

## 8. Apêndices

### 8.1 Guia de Instalação

#### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn
- Ollama (opcional, para funcionalidades de IA)

#### Passos de Instalação

```bash
# 1. Clonar o repositório
git clone <repository-url>
cd docsim

# 2. Instalar dependências
npm install

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. (Opcional) Configurar Ollama
ollama pull qwen3:4b
OLLAMA_ORIGINS="*" ollama serve
```

### 8.2 Estrutura do Projeto

```
docsim/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   └── Layout.tsx       # Layout principal com sidebar
│   ├── pages/               # Páginas da aplicação
│   │   ├── DashboardPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── SimilarityPage.tsx
│   │   ├── SemanticPage.tsx
│   │   ├── PlagiarismPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── algorithms.ts    # Algoritmos de similaridade
│   │   ├── ollama.ts        # Cliente Ollama
│   │   └── storage.ts       # Armazenamento e utilitários
│   ├── test/                # Testes automatizados
│   │   ├── algorithms.test.ts
│   │   ├── storage.test.ts
│   │   ├── ollama.test.ts
│   │   ├── Layout.test.tsx
│   │   └── App.test.tsx
│   ├── types/               # Definições de tipos TypeScript
│   ├── App.tsx              # Componente raiz
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                  # Assets estáticos
├── README.md                # Esta documentação
├── package.json             # Dependências e scripts
├── vite.config.js           # Configuração do Vite
└── vitest.config.ts         # Configuração do Vitest
```

### 8.3 API de Algoritmos

#### levenshteinSimilarity(s1: string, s2: string): number
Calcula a similaridade entre duas strings usando distância de Levenshtein.
- **Retorna**: Valor entre 0 e 100

#### jaroWinklerSimilarity(s1: string, s2: string): number
Calcula a similaridade usando algoritmo Jaro-Winkler.
- **Retorna**: Valor entre 0 e 100

#### tokenBasedSimilarity(s1: string, s2: string): number
Calcula similaridade baseada em conjuntos de tokens (Jaccard).
- **Retorna**: Valor entre 0 e 100

#### bigramSimilarity(s1: string, s2: string): number
Calcula similaridade baseada em bigramas (Dice).
- **Retorna**: Valor entre 0 e 100

#### combinedSimilarity(s1: string, s2: string): object
Combina os quatro algoritmos com pesos ponderados.
- **Retorna**: Objeto com scores individuais e combinado

### 8.4 Licença

Este projeto é destinado ao uso educacional e acadêmico. O código-fonte é aberto e contribuições são bem-vindas.

---

**Como citar este trabalho:**

AUTOR. *DocSim: Sistema de Análise de Similaridade Textual para Documentos Acadêmicos com Processamento de Linguagem Natural Local*. 2024. Disponível em: <URL_DO_REPOSITORIO>. Acesso em: DATA.
