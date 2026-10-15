import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Brain, Loader2, FileText, Sparkles, Wand2 } from 'lucide-react';
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

    const aiResult = await ollamaClient.semanticSearch(
      query,
      documents.map(d => ({ id: d.id, name: d.name, content: d.content }))
    );

    if (aiResult) {
      setResults(aiResult.results);
      setSummary(aiResult.summary);
      setUsedAI(true);
    } else {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Busca Semântica com IA</h3>
              <p className="text-sm text-slate-600 mt-1">
                Encontre documentos por significado usando processamento de linguagem natural
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Descreva o que você está procurando..."
                className="w-full pl-14 pr-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-sm transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={!query.trim() || searching || documents.length === 0}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              {searching ? 'Buscando...' : 'Buscar'}
            </motion.button>
          </div>
        </div>

        {/* AI Status */}
        <div className="px-8 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${usedAI ? 'bg-emerald-500' : 'bg-amber-500'} relative`}>
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${usedAI ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping`} />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {usedAI ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                IA Local (Ollama) ativa — análise semântica completa
              </span>
            ) : (
              'Busca por palavras-chave — Conecte o Ollama para busca semântica com IA'
            )}
          </span>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Resultados ({results.length})</h3>
              {summary && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{summary}</p>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {results.map((result, idx) => {
                const doc = documents.find(d => d.id === result.documentId);
                if (!doc) return null;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0"
                      >
                        <FileText className="w-6 h-6 text-purple-600" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-base font-bold text-slate-800 truncate">{doc.name}</p>
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: idx * 0.05 }}
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              result.relevance >= 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              result.relevance >= 40 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {result.relevance}% relevante
                          </motion.span>
                        </div>
                        <p className="text-sm text-slate-600">{result.explanation}</p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          {doc.wordCount} palavras • {doc.tags.join(', ') || 'Sem tags'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Relevance bar */}
                    <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.relevance}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                        className={`h-full rounded-full ${
                          result.relevance >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          result.relevance >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                          'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      <AnimatePresence>
        {results.length === 0 && !searching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Search className="w-10 h-10 text-purple-500" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-700">Busca Semântica Inteligente</h3>
            <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
              Digite uma consulta em linguagem natural para encontrar documentos relevantes.
              {documents.length === 0 && ' Faça upload de documentos primeiro.'}
            </p>
            {documents.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                  Ex: "metodologia de pesquisa"
                </span>
                <span className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold">
                  Ex: "resultados experimentais"
                </span>
                <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                  Ex: "revisão de literatura"
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
