import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompareArrows,
  Play,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { getDocuments, saveAnalysis, generateId } from '../lib/storage';
import { combinedSimilarity, findSimilarPassages } from '../lib/algorithms';
import { Document, SimilarityResult } from '../types';

export default function SimilarityPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SimilarityResult | null>(null);
  const [passages, setPassages] = useState<any[]>([]);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const runAnalysis = () => {
    if (selectedDocs.length < 2) return;
    
    setAnalyzing(true);
    setResults([]);
    setSelectedResult(null);
    setPassages([]);

    setTimeout(() => {
      const newResults: SimilarityResult[] = [];
      const selectedDocuments = selectedDocs.map(id => documents.find(d => d.id === id)!);

      for (let i = 0; i < selectedDocuments.length; i++) {
        for (let j = i + 1; j < selectedDocuments.length; j++) {
          const doc1 = selectedDocuments[i];
          const doc2 = selectedDocuments[j];
          
          const similarity = combinedSimilarity(doc1.content, doc2.content);
          
          const result: SimilarityResult = {
            document1Id: doc1.id,
            document2Id: doc2.id,
            document1Name: doc1.name,
            document2Name: doc2.name,
            ...similarity,
            timestamp: new Date(),
          };
          
          newResults.push(result);
        }
      }

      setResults(newResults);
      
      saveAnalysis({
        id: generateId(),
        type: 'similarity',
        documents: selectedDocs,
        results: newResults,
        timestamp: new Date(),
        threshold: 50,
        status: 'completed',
      });
      
      setAnalyzing(false);
    }, 1000);
  };

  const viewPassages = (result: SimilarityResult) => {
    setSelectedResult(result);
    const doc1 = documents.find(d => d.id === result.document1Id);
    const doc2 = documents.find(d => d.id === result.document2Id);
    if (doc1 && doc2) {
      const found = findSimilarPassages(doc1.content, doc2.content);
      setPassages(found);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 40) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Muito Similar';
    if (score >= 60) return 'Similar';
    if (score >= 40) return 'Parcialmente Similar';
    return 'Diferente';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Document Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GitCompareArrows className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Análise de Similaridade</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Selecione 2 ou mais documentos para comparar • 4 algoritmos de análise
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runAnalysis}
              disabled={selectedDocs.length < 2 || analyzing}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
            >
              {analyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {analyzing ? 'Analisando...' : 'Analisar'}
            </motion.button>
          </div>
        </div>

        <div className="p-8">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-base text-slate-500 font-medium">Nenhum documento disponível</p>
              <p className="text-sm text-slate-400 mt-2">Faça upload de documentos primeiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => (
                <motion.button
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    selectedDocs.includes(doc.id)
                      ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-200/50'
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      selectedDocs.includes(doc.id) ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg' : 'bg-slate-100'
                    }`}>
                      {selectedDocs.includes(doc.id) ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.wordCount} palavras</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
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
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Resultados da Análise</h3>
                  <p className="text-sm text-slate-600 mt-1">{results.length} comparação(ões) realizada(s)</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {results.map((result, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <GitCompareArrows className="w-6 h-6 text-indigo-500" />
                      <div>
                        <p className="text-base font-bold text-slate-800">
                          {result.document1Name} ↔ {result.document2Name}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-bold ${getScoreColor(result.combined)}`}
                    >
                      {result.combined}% — {getScoreLabel(result.combined)}
                    </motion.div>
                  </div>

                  {/* Algorithm scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <ScoreBar label="Levenshtein" value={result.levenshtein} />
                    <ScoreBar label="Jaro-Winkler" value={result.jaroWinkler} />
                    <ScoreBar label="Token-Based" value={result.tokenBased} />
                    <ScoreBar label="Bigram" value={result.bigram} />
                  </div>

                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => viewPassages(result)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ver trechos similares →
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Similar Passages */}
      <AnimatePresence>
        {selectedResult && passages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Trechos Similares</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedResult.document1Name} ↔ {selectedResult.document2Name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-5">
              {passages.map((passage, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-2 border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 flex items-center justify-between border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-700">Trecho #{idx + 1}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getScoreColor(passage.similarity)}`}>
                      {passage.similarity}% similar
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                    <div className="p-5">
                      <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Documento 1</p>
                      <p className="text-sm text-slate-700 leading-relaxed font-mono bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        {passage.text1}
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Documento 2</p>
                      <p className="text-sm text-slate-700 leading-relaxed font-mono bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                        {passage.text2}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-sm font-bold text-slate-800">{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            value >= 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
            value >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
            value >= 40 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
            'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
        />
      </div>
    </div>
  );
}
