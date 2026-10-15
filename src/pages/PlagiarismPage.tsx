import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { getDocuments, saveAnalysis, generateId } from '../lib/storage';
import { combinedSimilarity, findSimilarPassages } from '../lib/algorithms';
import { Document } from '../types';

export default function PlagiarismPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const [threshold, setThreshold] = useState(60);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<{
    documentName: string;
    totalSimilarity: number;
    matches: {
      comparedDocumentName: string;
      similarity: number;
      passages: { text1: string; text2: string; similarity: number }[];
    }[];
    originalityScore: number;
  } | null>(null);

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const runPlagiarismCheck = () => {
    if (!selectedDoc) return;
    
    setAnalyzing(true);
    setReport(null);

    setTimeout(() => {
      const targetDoc = documents.find(d => d.id === selectedDoc);
      if (!targetDoc) return;

      const otherDocs = documents.filter(d => d.id !== selectedDoc);
      const matches: any[] = [];

      otherDocs.forEach(otherDoc => {
        const similarity = combinedSimilarity(targetDoc.content, otherDoc.content);
        
        if (similarity.combined >= threshold) {
          const passages = findSimilarPassages(targetDoc.content, otherDoc.content);
          matches.push({
            comparedDocumentName: otherDoc.name,
            similarity: similarity.combined,
            passages: passages.slice(0, 5),
          });
        }
      });

      matches.sort((a, b) => b.similarity - a.similarity);
      
      const totalSimilarity = matches.length > 0
        ? Math.round(matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length)
        : 0;

      const originalityScore = 100 - totalSimilarity;

      const newReport = {
        documentName: targetDoc.name,
        totalSimilarity,
        matches,
        originalityScore,
      };

      setReport(newReport);

      // Save analysis
      saveAnalysis({
        id: generateId(),
        type: 'plagiarism',
        documents: [selectedDoc],
        results: matches.map(m => ({
          combined: m.similarity,
          document1Name: targetDoc.name,
          document2Name: m.comparedDocumentName,
        })),
        timestamp: new Date(),
        threshold,
        status: 'completed',
      });

      setAnalyzing(false);
    }, 1500);
  };

  const exportReport = () => {
    if (!report) return;
    
    const content = `
RELATÓRIO DE ORIGINALIDADE
==========================
Documento: ${report.documentName}
Data: ${new Date().toLocaleDateString('pt-BR')}
Score de Originalidade: ${report.originalityScore}%
Similaridade Total: ${report.totalSimilarity}%
Threshold: ${threshold}%

CORRESPONDÊNCIAS ENCONTRADAS: ${report.matches.length}
${report.matches.map((m, i) => `
--- Correspondência ${i + 1} ---
Documento: ${m.comparedDocumentName}
Similaridade: ${m.similarity}%
Trechos similares: ${m.passages.length}
`).join('\n')}

RELATÓRIO GERADO POR DOCSIM - Sistema de Análise de Similaridade Textual
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-originalidade-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Detecção de Plágio</h3>
              <p className="text-sm text-slate-500">
                Verifique a originalidade de um documento comparando com todos os outros
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Document selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Documento para verificar
              </label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              >
                <option value="">Selecione um documento...</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Threshold de similaridade: {threshold}%
              </label>
              <input
                type="range"
                min="20"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>20% (sensível)</span>
                <span>95% (restrito)</span>
              </div>
            </div>

            <button
              onClick={runPlagiarismCheck}
              disabled={!selectedDoc || analyzing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-200"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {analyzing ? 'Analisando...' : 'Verificar Originalidade'}
            </button>
          </div>
        </div>
      </div>

      {/* Report */}
      {report && (
        <>
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Relatório de Originalidade</h3>
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${
                  report.originalityScore >= 70 ? 'bg-emerald-50 border-emerald-200' :
                  report.originalityScore >= 40 ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <p className="text-xs font-medium text-slate-500 mb-1">Score de Originalidade</p>
                  <p className={`text-2xl font-bold ${
                    report.originalityScore >= 70 ? 'text-emerald-600' :
                    report.originalityScore >= 40 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {report.originalityScore}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 mb-1">Similaridade Total</p>
                  <p className="text-2xl font-bold text-slate-800">{report.totalSimilarity}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 mb-1">Correspondências</p>
                  <p className="text-2xl font-bold text-slate-800">{report.matches.length}</p>
                </div>
              </div>

              {/* Verdict */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                report.originalityScore >= 70 ? 'bg-emerald-50 border border-emerald-200' :
                report.originalityScore >= 40 ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                {report.originalityScore >= 70 ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-semibold ${
                    report.originalityScore >= 70 ? 'text-emerald-800' :
                    report.originalityScore >= 40 ? 'text-amber-800' :
                    'text-red-800'
                  }`}>
                    {report.originalityScore >= 70
                      ? 'Documento com alto nível de originalidade'
                      : report.originalityScore >= 40
                      ? 'Documento com similaridade moderada — revisão recomendada'
                      : 'Alta similaridade detectada — revisão urgente necessária'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {report.documentName} • Threshold: {threshold}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Matches */}
          {report.matches.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Correspondências Detalhadas ({report.matches.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {report.matches.map((match, idx) => (
                  <div key={idx} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {match.comparedDocumentName}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        match.similarity >= 80 ? 'bg-red-50 text-red-600' :
                        match.similarity >= 60 ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {match.similarity}% similar
                      </span>
                    </div>

                    {match.passages.length > 0 && (
                      <div className="space-y-2">
                        {match.passages.slice(0, 3).map((passage, pIdx) => (
                          <div key={pIdx} className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-red-50/50 p-2 rounded-lg border border-red-100">
                              <p className="text-red-600 font-medium mb-1">Original</p>
                              <p className="text-slate-600 font-mono line-clamp-2">{passage.text1}</p>
                            </div>
                            <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                              <p className="text-amber-600 font-medium mb-1">Comparado</p>
                              <p className="text-slate-600 font-mono line-clamp-2">{passage.text2}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
