import { Document } from '../types';

const STORAGE_KEY = 'docsim_documents';
const ANALYSES_KEY = 'docsim_analyses';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getDocuments(): Document[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const docs = JSON.parse(data);
    return docs.map((d: Document) => ({
      ...d,
      uploadedAt: new Date(d.uploadedAt),
    }));
  } catch {
    return [];
  }
}

export function saveDocument(doc: Document): void {
  const docs = getDocuments();
  docs.push(doc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function deleteDocument(id: string): void {
  const docs = getDocuments().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function updateDocumentTags(id: string, tags: string[]): void {
  const docs = getDocuments().map(d => d.id === id ? { ...d, tags } : d);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function getAnalyses(): any[] {
  try {
    const data = localStorage.getItem(ANALYSES_KEY);
    if (!data) return [];
    return JSON.parse(data).map((a: any) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
  } catch {
    return [];
  }
}

export function saveAnalysis(analysis: any): void {
  const analyses = getAnalyses();
  analyses.unshift(analysis);
  // Keep only last 50 analyses
  localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses.slice(0, 50)));
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function extractTextFromTxt(content: string): string {
  return content;
}

export async function extractTextFromFile(file: File): Promise<{ content: string; type: 'txt' | 'pdf' | 'docx' }> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
  
  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return { content: text.trim(), type: 'pdf' };
    } catch {
      return { content: '', type: 'pdf' };
    }
  } else if (extension === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { content: result.value, type: 'docx' };
    } catch {
      return { content: '', type: 'docx' };
    }
  } else {
    const text = await file.text();
    return { content: text, type: 'txt' };
  }
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
