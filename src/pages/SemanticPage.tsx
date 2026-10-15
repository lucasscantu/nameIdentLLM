import { useState, useEffect } from 'react';
import { Search, Brain, Loader2, FileText, Sparkles } from 'lucide-react';
import { getDocuments } from '../lib/storage';
import { ollamaClient } from '../lib/ollama';
import { Document } from '../types';

export default function SemanticPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{
    documentId: string;
    relevance: number;
    explanation: string;
  }[]>([]);
  const [summary, setSummary] = useState('');
  const [usedAI, setUsedAI] = useState(false);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || documents.length === 0) return;
    
    setSearching(true);
    setResults([]);
    setSummary('');
    setUsedAI(false);

    // Try Ollama first
    const aiResult = await ollamaClient.semanticSearch(
      query,
      documents.map(d => ({ id: d.id, name: d.name, content: d.content }))
    );

    if (aiResult) {
      setResults(aiResult.results);
      setSummary(aiResult.summary);
      setUsedAI(true);
    } else {
      // Fallback: keyword-based search
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const scored = documents.map(doc => {
        const content = doc.content.toLowerCase();
        let matches = 0;
        queryWords.forEach(word => {
          if (content.includes(word)) matches++;
        });
        const relevance = queryWords.length > 0 ? Math.round((matches / queryWords.length) * 100) : 0;
        return {
          documentId: doc.id,
          relevance,
          explanation: relevance > 0
            ? `Contém ${matches} de ${queryWords.length} termos da consulta.`
            : 'Sem correspondência direta com os termos da consulta.',
        };
      }).filter(r => r.relevance > 0).sort((a, b) => b.relevance - a.relevance);

      setResults(scored);
      setSummary(`Busca por palavras-chave: ${queryWords.length} termos analisados em ${documents.length} documentos.`);
    }

    setSearching(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Busca Semântica com IA</h3>
              <p className="text-sm text-slate-500">
                Encontre documentos por significado usando processamento de linguagem natural
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Descreva o que você está procurando..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || searching || documents.length === 0}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* AI Status */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${usedAI ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-xs text-slate-600">
            {usedAI
              ? 'IA Local (Ollama) ativa — análise semântica completa'
              : 'Busca por palavras-chave — Conecte o Ollama para busca semântica com IA'}
          </span>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Resultados ({results.length})</h3>
            {summary && (
              <p className="text-sm text-slate-500 mt-2">{summary}</p>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {results.map((result, idx) => {
              const doc = documents.find(d => d.id === result.documentId);
              if (!doc) return null;

              return (
                <div key={idx} className="p-5 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          result.relevance >= 70 ? 'bg-emerald-50 text-emerald-600' :
                          result.relevance >= 40 ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {result.relevance}% relevante
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{result.explanation}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {doc.wordCount} palavras • {doc.tags.join(', ') || 'Sem tags'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Relevance bar */}
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.relevance >= 70 ? 'bg-emerald-500' :
                        result.relevance >= 40 ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${result.relevance}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !searching && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Busca Semântica</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Digite uma consulta em linguagem natural para encontrar documentos relevantes.
            {documents.length === 0 && ' Faça upload de documentos primeiro.'}
          </p>
        </div>
      )}
    </div>
  );
}
