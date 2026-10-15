import { OllamaModel, OllamaStatus } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:11434';

class OllamaClient {
  private baseUrl: string;
  private selectedModel: string;

  constructor() {
    this.baseUrl = DEFAULT_BASE_URL;
    this.selectedModel = '';
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setModel(model: string) {
    this.selectedModel = model;
  }

  getModel(): string {
    return this.selectedModel;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async checkStatus(): Promise<OllamaStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) throw new Error('Ollama not available');
      
      const data = await response.json();
      const models: OllamaModel[] = data.models || [];
      
      if (!this.selectedModel && models.length > 0) {
        this.selectedModel = models[0].name;
      }
      
      return {
        available: true,
        models,
        selectedModel: this.selectedModel,
        baseUrl: this.baseUrl,
      };
    } catch {
      return {
        available: false,
        models: [],
        selectedModel: this.selectedModel,
        baseUrl: this.baseUrl,
      };
    }
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.selectedModel,
          prompt: text.substring(0, 2000),
        }),
        signal: AbortSignal.timeout(30000),
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.embedding || null;
    } catch {
      return null;
    }
  }

  async analyzeSimilarity(text1: string, text2: string): Promise<{
    analysis: string;
    confidence: number;
  } | null> {
    try {
      const prompt = `Analise a similaridade entre os seguintes dois trechos de texto acadêmico. 
Responda em português com:
1. Uma explicação breve da similaridade (máximo 3 frases)
2. Um score de confiança de 0 a 100

Texto 1: "${text1.substring(0, 1000)}"
Texto 2: "${text2.substring(0, 1000)}"

Formato da resposta:
EXPLICACAO: [sua explicação]
CONFIANCA: [número de 0 a 100]`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.selectedModel,
          prompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const result = data.response || '';
      
      const explanationMatch = result.match(/EXPLICACAO:\s*(.+?)(?=CONFIANCA:|$)/s);
      const confidenceMatch = result.match(/CONFIANCA:\s*(\d+)/);
      
      return {
        analysis: explanationMatch ? explanationMatch[1].trim() : result.substring(0, 200),
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
      };
    } catch {
      return null;
    }
  }

  async semanticSearch(query: string, documents: { id: string; name: string; content: string }[]): Promise<{
    results: { documentId: string; relevance: number; explanation: string }[];
    summary: string;
  } | null> {
    try {
      const docsSummary = documents
        .map((d, i) => `[Doc ${i + 1}] "${d.name}": ${d.content.substring(0, 300)}...`)
        .join('\n\n');

      const prompt = `Você é um assistente de análise acadêmica. Com base na consulta do usuário, 
analise os documentos fornecidos e identifique quais são mais relevantes.

Consulta: "${query}"

Documentos disponíveis:
${docsSummary}

Responda em português no seguinte formato:
RESULTADOS: [lista de números dos documentos mais relevantes, separados por vírgula, do mais ao menos relevante]
RESUMO: [breve explicação de por que esses documentos são relevantes para a consulta]`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.selectedModel,
          prompt,
          stream: false,
        }),
        signal: AbortSignal.timeout(60000),
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const result = data.response || '';
      
      const resultsMatch = result.match(/RESULTADOS:\s*(.+?)(?=RESUMO:|$)/s);
      const summaryMatch = result.match(/RESUMO:\s*(.+)/s);
      
      const docNumbers = resultsMatch 
        ? resultsMatch[1].match(/\d+/g)?.map((n: string) => parseInt(n) - 1) || []
        : [];
      
      const results = docNumbers.map((idx: number, pos: number) => ({
        documentId: documents[idx]?.id || '',
        relevance: Math.max(95 - pos * 15, 30),
        explanation: summaryMatch ? summaryMatch[1].trim() : 'Documento relevante para a consulta.',
      }));
      
      return {
        results,
        summary: summaryMatch ? summaryMatch[1].trim() : 'Análise semântica concluída.',
      };
    } catch {
      return null;
    }
  }
}

export const ollamaClient = new OllamaClient();
