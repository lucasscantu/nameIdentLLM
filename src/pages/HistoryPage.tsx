import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  GitCompareArrows,
  ShieldAlert,
  Brain,
  Trash2,
  Eye,
  Download,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';
import { getAnalyses, getDocuments } from '../lib/storage';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);

  useEffect(() => {
    setAnalyses(getAnalyses());
  }, []);

  const filteredAnalyses = analyses.filter(a => {
    const matchesFilter = filter === 'all' || a.type === filter;
    const matchesSearch = searchQuery === '' || 
      JSON.stringify(a).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const deleteAnalysis = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta análise?')) {
      const updated = analyses.filter(a => a.id !== id);
      localStorage.setItem('docsim_analyses', JSON.stringify(updated));
      setAnalyses(updated);
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
    }
  };

  const exportAnalysis = (analysis: any) => {
    const content = `
RELATÓRIO DE ANÁLISE
====================
Tipo: ${analysis.type}
Data: ${new Date(analysis.timestamp).toLocaleString('pt-BR')}
Status: ${analysis.status}

RESULTADOS:
${JSON.stringify(analysis.results, null, 2)}

Gerado por DocSim - Sistema de Análise de Similaridade Textual
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${analysis.type}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'similarity': return GitCompareArrows;
      case 'plagiarism': return ShieldAlert;
      case 'semantic': return Brain;
      default: return History;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'similarity': return 'from-indigo-500 to-blue-500';
      case 'plagiarism': return 'from-red-500 to-orange-500';
      case 'semantic': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
            <History className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Histórico de Análises</h3>
            <p className="text-sm text-slate-600 mt-1">
              Visualize e gerencie todas as análises realizadas
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar análises..."
              className="w-full pl-12 pr-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm font-medium focus:outline-none bg-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="similarity">Similaridade</option>
              <option value="plagiarism">Plágio</option>
              <option value="semantic">Semântica</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAnalyses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-16 text-center"
            >
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-base text-slate-500 font-medium">
                {analyses.length === 0 ? 'Nenhuma análise realizada ainda' : 'Nenhum resultado encontrado'}
              </p>
            </motion.div>
          ) : (
            filteredAnalyses.map((analysis, index) => {
              const Icon = getTypeIcon(analysis.type);
              const color = getTypeColor(analysis.type);
              
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border p-5 cursor-pointer transition-all ${
                    selectedAnalysis?.id === analysis.id ? 'border-indigo-400 ring-4 ring-indigo-100 shadow-xl' : 'border-slate-200/50 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-base font-bold text-slate-800 capitalize">{analysis.type}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          analysis.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          analysis.status === 'failed' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {analysis.status === 'completed' ? 'Concluída' : analysis.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(analysis.timestamp).toLocaleString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span>{analysis.results?.length || 0} resultado(s)</span>
                      </div>
                      {analysis.results && analysis.results.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-slate-500">Similaridade média:</span>
                          <span className="text-xs font-bold text-indigo-600">
                            {Math.round(analysis.results.reduce((sum: number, r: any) => sum + (r.combined || 0), 0) / analysis.results.length)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence>
            {selectedAnalysis ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden sticky top-4"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-slate-100/50">
                  <h3 className="text-base font-bold text-slate-800">Detalhes da Análise</h3>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Tipo</p>
                    <p className="text-sm font-semibold text-slate-800 capitalize">{selectedAnalysis.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(selectedAnalysis.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Status</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedAnalysis.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      selectedAnalysis.status === 'failed' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {selectedAnalysis.status === 'completed' ? 'Concluída' : selectedAnalysis.status === 'failed' ? 'Falhou' : 'Pendente'}
                    </span>
                  </div>
                  {selectedAnalysis.results && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Resultados</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedAnalysis.results.map((result: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {result.document1Name} ↔ {result.document2Name}
                            </p>
                            <p className="text-lg font-black text-indigo-600 mt-1">
                              {result.combined}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => exportAnalysis(selectedAnalysis)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => deleteAnalysis(selectedAnalysis.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-10 text-center"
              >
                <Eye className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Selecione uma análise para ver detalhes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
