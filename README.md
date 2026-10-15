# DocSim - Sistema de Análise de Similaridade Textual para Documentos Acadêmicos

## 📋 Sobre

DocSim é um sistema web completo para análise de similaridade textual entre documentos acadêmicos, utilizando processamento local de IA via Ollama. O sistema permite upload de documentos, análise de similaridade, detecção de plágio e busca semântica — tudo processado 100% localmente, garantindo total privacidade.

## 🚀 Funcionalidades

### Upload de Documentos
- Suporte a TXT, PDF e DOCX
- Extração automática de texto
- Validação de formato
- Armazenamento local (localStorage)
- Categorização por tags

### Análise de Similaridade
- 4 algoritmos implementados:
  - **Levenshtein**: distância de edição entre strings
  - **Jaro-Winkler**: similaridade baseada em caracteres comuns
  - **Token-Based**: similaridade por conjuntos de palavras (Jaccard)
  - **Bigram**: similaridade por pares de caracteres consecutivos
- Score combinado ponderado (0-100%)
- Visualização de trechos similares

### Busca Semântica com IA
- Integração com Ollama (processamento local)
- Análise de contexto e significado
- Fallback para busca por palavras-chave
- Explicações de relevância

### Detecção de Plágio
- Comparação com base de documentos
- Highlight de trechos similares
- Relatório de originalidade
- Threshold configurável (20%-95%)
- Exportação de relatórios em TXT

### Dashboard
- Estatísticas de documentos
- Histórico de análises
- Status do Ollama em tempo real
- Modelos disponíveis

### Gerenciamento de Documentos
- Lista completa de documentos
- Categorização por tags
- Busca por nome e conteúdo
- Exportação individual
- Pré-visualização de conteúdo

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Vite 6** (build tool)
- **Tailwind CSS 4** (estilização)
- **React Router 6** (navegação)
- **TanStack Query** (gerenciamento de estado)
- **React Hook Form + Zod** (formulários)
- **Lucide React** (ícones)

### Backend/IA
- **Ollama** (modelo local: qwen3:4b ou similar)
- Processamento 100% local
- API REST para integração

### Bibliotecas de Extração
- **pdfjs-dist**: extração de texto de PDFs
- **mammoth**: extração de texto de DOCX

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Ollama (opcional, para busca semântica com IA)

### Passos

1. Clone o repositório:
```bash
git clone <repository-url>
cd docsim
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. (Opcional) Configure o Ollama:
```bash
# Instale o Ollama em https://ollama.ai
ollama pull qwen3:4b
OLLAMA_ORIGINS="*" ollama serve
```

5. Build para produção:
```bash
npm run build
```

## 📖 Guia de Uso

### 1. Upload de Documentos
- Acesse a página "Upload"
- Arraste arquivos ou clique para selecionar
- Adicione tags para organização
- Formatos aceitos: TXT, PDF, DOCX

### 2. Análise de Similaridade
- Acesse "Similaridade"
- Selecione 2 ou mais documentos
- Clique em "Analisar"
- Veja os scores por algoritmo
- Explore trechos similares

### 3. Busca Semântica
- Acesse "Busca Semântica"
- Digite uma consulta em linguagem natural
- O sistema usa IA (se Ollama disponível) ou busca por palavras-chave
- Veja documentos relevantes ordenados por relevância

### 4. Detecção de Plágio
- Acesse "Detecção de Plágio"
- Selecione o documento para verificar
- Ajuste o threshold de sensibilidade
- Veja o relatório de originalidade
- Exporte o relatório

### 5. Configurações
- Configure a URL do Ollama
- Selecione o modelo de IA
- Verifique a conexão

## 🏗️ Arquitetura

```
src/
├── App.tsx              # Componente principal com rotas
├── main.tsx             # Entry point
├── index.css            # Estilos globais
├── components/
│   └── Layout.tsx       # Layout com sidebar e navegação
├── pages/
│   ├── DashboardPage.tsx    # Dashboard principal
│   ├── UploadPage.tsx       # Upload de documentos
│   ├── SimilarityPage.tsx   # Análise de similaridade
│   ├── SemanticPage.tsx     # Busca semântica
│   ├── PlagiarismPage.tsx   # Detecção de plágio
│   ├── DocumentsPage.tsx    # Gerenciamento de documentos
│   └── SettingsPage.tsx     # Configurações do Ollama
├── lib/
│   ├── algorithms.ts    # Algoritmos de similaridade
│   ├── ollama.ts        # Cliente Ollama
│   └── storage.ts       # Armazenamento e utilitários
└── types/
    └── index.ts         # Tipos TypeScript
```

## 🔬 Algoritmos de Similaridade

### Levenshtein Distance
Calcula o número mínimo de edições (inserções, remoções, substituições) para transformar uma string em outra.

### Jaro-Winkler
Mede a similaridade entre duas sequências, com bônus para prefixos comuns. Ideal para nomes e termos curtos.

### Token-Based (Jaccard)
Compara conjuntos de palavras únicas entre dois textos. Mede a interseção sobre a união dos tokens.

### Bigram (Dice)
Analisa pares de caracteres consecutivos. Excelente para detectar similaridade estrutural em textos.

### Score Combinado
Os quatro algoritmos são combinados com pesos:
- Levenshtein: 20%
- Jaro-Winkler: 20%
- Token-Based: 30%
- Bigram: 30%

## 🔒 Privacidade

- Todo processamento é feito localmente no navegador
- Documentos nunca são enviados a servidores externos
- Ollama roda 100% na máquina local
- Dados armazenados no localStorage

## 📄 Licença

Este projeto é destinado ao uso educacional e acadêmico.

## 🧪 Testes

O projeto inclui testes automatizados usando Vitest e React Testing Library:

```bash
# Rodar todos os testes
npx vitest run

# Rodar testes em modo watch
npx vitest

# Gerar relatório de cobertura
npx vitest run --coverage
```

### Testes Incluídos
- **algorithms.test.ts**: Testes unitários para todos os 4 algoritmos de similaridade
- **storage.test.ts**: Testes para funções de armazenamento e utilitários
- **ollama.test.ts**: Testes para o cliente Ollama
- **Layout.test.tsx**: Testes de componente para o Layout
- **App.test.tsx**: Testes de integração do App principal

## 🎨 Melhorias de Frontend

- Animações suaves com Framer Motion
- Gráficos interativos com Recharts
- Design system consistente com gradientes e glassmorphism
- Transições de página animadas
- Feedback visual em todas as interações
- Layout responsivo mobile-first
- Sidebar com navegação intuitiva

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
