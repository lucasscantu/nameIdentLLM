export interface Document {
  id: string;
  name: string;
  content: string;
  type: 'txt' | 'pdf' | 'docx';
  size: number;
  uploadedAt: Date;
  tags: string[];
  wordCount: number;
  charCount: number;
}

export interface SimilarityResult {
  document1Id: string;
  document2Id: string;
  document1Name: string;
  document2Name: string;
  levenshtein: number;
  jaroWinkler: number;
  tokenBased: number;
  bigram: number;
  combined: number;
  timestamp: Date;
}

export interface AnalysisResult {
  id: string;
  type: 'similarity' | 'plagiarism' | 'semantic';
  documents: string[];
  results: SimilarityResult[];
  timestamp: Date;
  threshold: number;
  status: 'completed' | 'failed' | 'pending';
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaStatus {
  available: boolean;
  models: OllamaModel[];
  selectedModel: string;
  baseUrl: string;
}

export interface PlagiarismReport {
  documentId: string;
  documentName: string;
  totalSimilarity: number;
  matches: PlagiarismMatch[];
  originalityScore: number;
  timestamp: Date;
}

export interface PlagiarismMatch {
  comparedDocumentId: string;
  comparedDocumentName: string;
  similarity: number;
  similarPassages: SimilarPassage[];
}

export interface SimilarPassage {
  text1: string;
  text2: string;
  similarity: number;
  position1: number;
  position2: number;
}

export interface SemanticSearchResult {
  query: string;
  results: SemanticMatch[];
  explanation: string;
  timestamp: Date;
}

export interface SemanticMatch {
  documentId: string;
  documentName: string;
  relevance: number;
  relevantPassages: string[];
  explanation: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalAnalyses: number;
  avgSimilarity: number;
  plagiarismAlerts: number;
}
