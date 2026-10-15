import { useState, useEffect } from 'react';
import {
  GitCompareArrows,
  Play,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
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
      
      // Save analysis
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Selecionar Documentos</h3>
              <p className="text-sm text-slate-500 mt-1">
                Selecione 2 ou mais documentos para comparar
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={selectedDocs.length < 2 || analyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {analyzing ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Nenhum documento disponível</p>
              <p className="text-xs text-slate-400 mt-1">Faça upload de documentos primeiro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDocs.includes(doc.id)
                      ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedDocs.includes(doc.id) ? 'bg-indigo-500' : 'bg-slate-100'
                    }`}>
                      {selectedDocs.includes(doc.id) ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.wordCount} palavras</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Resultados da Análise</h3>
                <p className="text-sm text-slate-500">{results.length} comparação(ões) realizada(s)</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {results.map((result, idx) => (
              <div key={idx} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GitCompareArrows className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {result.document1Name} ↔ {result.document2Name}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${getScoreColor(result.combined)}`}>
                    {result.combined}% — {getScoreLabel(result.combined)}
                  </div>
                </div>

                {/* Algorithm scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <ScoreBar label="Levenshtein" value={result.levenshtein} />
                  <ScoreBar label="Jaro-Winkler" value={result.jaroWinkler} />
                  <ScoreBar label="Token-Based" value={result.tokenBased} />
                  <ScoreBar label="Bigram" value={result.bigram} />
                </div>

                <button
                  onClick={() => viewPassages(result)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  Ver trechos similares →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Passages */}
      {selectedResult && passages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Trechos Similares</h3>
                <p className="text-sm text-slate-500">
                  {selectedResult.document1Name} ↔ {selectedResult.document2Name}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {passages.map((passage, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Trecho #{idx + 1}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(passage.similarity)}`}>
                    {passage.similarity}% similar
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                  <div className="p-4">
                    <p className="text-xs font-medium text-indigo-600 mb-2">Documento 1</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-mono bg-indigo-50/50 p-3 rounded-lg">
                      {passage.text1}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-purple-600 mb-2">Documento 2</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-mono bg-purple-50/50 p-3 rounded-lg">
                      {passage.text2}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-bold text-slate-700">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 80 ? 'bg-red-500' :
            value >= 60 ? 'bg-amber-500' :
            value >= 40 ? 'bg-blue-500' :
            'bg-emerald-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
