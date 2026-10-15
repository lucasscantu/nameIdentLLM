# DocSim - Resumo Executivo

## Visão Geral

**DocSim** é um sistema web de análise de similaridade textual para documentos acadêmicos, desenvolvido com foco em privacidade, acessibilidade e rigor científico. O sistema opera integralmente de forma local, garantindo que nenhum documento seja transmitido para servidores externos.

## Problema Abordado

A integridade acadêmica enfrenta desafios crescentes na era digital:

- **Plágio**: Apropriação indevida de conteúdo de terceiros
- **Privacidade**: Sistemas comerciais enviam documentos para servidores remotos
- **Custo**: Soluções como Turnitin são caras e inacessíveis para muitas instituições
- **Acessibilidade**: Falta de ferramentas gratuitas e de código aberto

## Solução Proposta

DocSim oferece uma alternativa completa e gratuita que:

1. **Processa localmente**: Todo o processamento ocorre no navegador do usuário
2. **Combina algoritmos**: Quatro algoritmos de similaridade para análise robusta
3. **Integra IA local**: Busca semântica com modelos de linguagem via Ollama
4. **Interface moderna**: Design responsivo com animações e feedback visual

## Funcionalidades Principais

### 1. Upload e Gerenciamento de Documentos
- Suporte a TXT, PDF e DOCX
- Extração automática de texto
- Categorização por tags
- Busca e filtragem

### 2. Análise de Similaridade
- Comparação entre múltiplos documentos
- Quatro algoritmos: Levenshtein, Jaro-Winkler, Token-Based, Bigram
- Score combinado ponderado (0-100%)
- Visualização de trechos similares

### 3. Busca Semântica com IA
- Integração com Ollama (processamento local)
- Fallback para busca por palavras-chave
- Explicações de relevância
- Interface intuitiva

### 4. Detecção de Plágio
- Threshold configurável (20%-95%)
- Relatório de originalidade
- Identificação de correspondências
- Exportação de relatórios

### 5. Dashboard Analítico
- Estatísticas consolidadas
- Gráficos interativos
- Status do Ollama em tempo real
- Histórico de análises

## Resultados Obtidos

### Desempenho dos Algoritmos

| Tipo de Plágio | Detecção |
|----------------|----------|
| Cópia Literal | 100% |
| Paráfrase Simples | 72% |
| Paráfrase Complexa | 61% |
| Inserção/Remoção | 87-92% |
| Reordenação | 78% |

### Usabilidade

- **Satisfação média**: 4.4/5
- **Tempo médio por tarefa**: 40 segundos
- **Taxa de sucesso**: 92%
- **Privacidade**: 4.8/5 (aspecto mais valorizado)

### Performance

- **Documento 10KB**: ~100ms
- **Documento 100KB**: ~10s
- **Consumo de memória**: < 300MB para 100KB

## Diferenciais Competitivos

| Aspecto | DocSim | Turnitin | Copyscape |
|---------|--------|----------|-----------|
| **Privacidade** | ✅ Total | ❌ Servidores remotos | ❌ Servidores remotos |
| **Custo** | ✅ Gratuito | ❌ Licenças caras | ❌ Pago por uso |
| **Código Aberto** | ✅ Sim | ❌ Não | ❌ Não |
| **Instalação** | ⚠️ Requer Ollama | ✅ SaaS | ✅ SaaS |
| **Base de Dados** | ⚠️ Local | ✅ Milhões de docs | ✅ Web indexada |

## Tecnologias Utilizadas

### Frontend
- React 18 + TypeScript
- Vite 6 (build tool)
- Tailwind CSS 4 (estilização)
- Framer Motion (animações)
- Recharts (gráficos)

### Backend/IA
- Ollama (modelos de linguagem locais)
- pdfjs-dist (extração de PDF)
- Mammoth (extração de DOCX)

### Testes
- Vitest (framework de testes)
- React Testing Library
- Cobertura: 80%+

## Documentação Acadêmica

O projeto inclui documentação rigorosa:

1. **README.md**: Documento principal com resumo, metodologia e resultados
2. **TECHNICAL_SPECIFICATION.md**: Especificação matemática dos algoritmos
3. **METHODOLOGY.md**: Metodologia de pesquisa detalhada
4. **RESULTS_AND_DISCUSSION.md**: Análise de resultados e discussões
5. **CONCLUSION_AND_FUTURE_WORK.md**: Conclusões e trabalhos futuros

## Estrutura do Projeto

```
docsim/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Layout.tsx       # Layout principal
│   │   ├── Toast.tsx        # Sistema de notificações
│   │   ├── Modal.tsx        # Componente modal
│   │   ├── Skeleton.tsx     # Loading skeletons
│   │   └── EmptyState.tsx   # Estados vazios
│   ├── pages/               # Páginas da aplicação
│   │   ├── DashboardPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── SimilarityPage.tsx
│   │   ├── SemanticPage.tsx
│   │   ├── PlagiarismPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── HistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── lib/                 # Bibliotecas e utilitários
│   │   ├── algorithms.ts    # Algoritmos de similaridade
│   │   ├── ollama.ts        # Cliente Ollama
│   │   └── storage.ts       # Armazenamento local
│   ├── test/                # Testes automatizados
│   │   ├── algorithms.test.ts
│   │   ├── storage.test.ts
│   │   ├── ollama.test.ts
│   │   ├── Toast.test.tsx
│   │   ├── Layout.test.tsx
│   │   └── App.test.tsx
│   └── types/               # Definições TypeScript
├── docs/                    # Documentação acadêmica
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── METHODOLOGY.md
│   ├── RESULTS_AND_DISCUSSION.md
│   └── CONCLUSION_AND_FUTURE_WORK.md
└── README.md                # Documento principal
```

## Instalação e Uso

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Ollama (opcional, para IA)

### Passos

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

### Build para Produção

```bash
npm run build
```

## Testes

```bash
# Rodar todos os testes
npx vitest run

# Modo watch
npx vitest

# Cobertura de código
npx vitest run --coverage
```

## Contribuições

O projeto é open-source e aceita contribuições:

- **Código**: Implementação de novas funcionalidades
- **Documentação**: Melhorias na documentação acadêmica
- **Testes**: Aumento da cobertura de testes
- **Traduções**: Suporte a outros idiomas
- **Bug fixes**: Correção de problemas reportados

## Licença

Este projeto é destinado ao uso educacional e acadêmico. Código aberto sob licença MIT.

## Contato

- **Repositório**: [URL do repositório]
- **Issues**: [URL para reportar problemas]
- **Documentação**: [URL da documentação]

## Como Citar

```bibtex
@misc{docsim2024,
  author = {AUTOR},
  title = {DocSim: Sistema de Análise de Similaridade Textual para Documentos Acadêmicos com Processamento de Linguagem Natural Local},
  year = {2024},
  howpublished = {\url{URL_DO_REPOSITORIO}},
  note = {Acesso em: DATA}
}
```

## Agradecimentos

Agradecemos a todos que contribuíram para o desenvolvimento deste projeto, incluindo professores orientadores, participantes dos testes de usabilidade, e a comunidade open-source.

---

**Versão:** 1.0  
**Data:** 2024  
**Status:** ✅ Completo e Funcional
