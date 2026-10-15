import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText,
  GitCompareArrows,
  ShieldAlert,
  Brain,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  Upload,
  Search,
  Sparkles,
  BarChart3,
  Target,
} from 'lucide-react';
import { getDocuments, getAnalyses } from '../lib/storage';
import { ollamaClient } from '../lib/ollama';
import { Document, OllamaStatus } from '../types';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const docs = getDocuments();
      const anals = getAnalyses();
      setDocuments(docs);
      setAnalyses(anals);
      
      const status = await ollamaClient.checkStatus();
      setOllamaStatus(status);
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    totalDocuments: documents.length,
    totalAnalyses: analyses.length,
    avgSimilarity: analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => {
          const results = a.results || [];
          const avg = results.length > 0 ? results.reduce((s: number, r: any) => s + (r.combined || 0), 0) / results.length : 0;
          return sum + avg;
        }, 0) / analyses.length)
      : 0,
    plagiarismAlerts: analyses.filter(a => 
      a.results?.some((r: any) => r.combined > 70)
    ).length,
  };

  // Chart data
  const docTypeData = [
    { name: 'TXT', value: documents.filter(d => d.type === 'txt').length, color: '#6366f1' },
    { name: 'PDF', value: documents.filter(d => d.type === 'pdf').length, color: '#ef4444' },
    { name: 'DOCX', value: documents.filter(d => d.type === 'docx').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const analysisTypeData = [
    { name: 'Similaridade', count: analyses.filter(a => a.type === 'similarity').length },
    { name: 'Plágio', count: analyses.filter(a => a.type === 'plagiarism').length },
    { name: 'Semântica', count: analyses.filter(a => a.type === 'semantic').length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white/80">Bem-vindo ao DocSim</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Análise de Similaridade com IA</h2>
          <p className="text-white/80 max-w-xl">
            Compare documentos acadêmicos, detecte plágio e faça buscas semânticas com processamento 100% local.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              to="/upload"
              className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              Upload Documento
            </Link>
            <Link
              to="/similarity"
              className="px-5 py-2.5 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Analisar Similaridade
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Documentos', value: stats.totalDocuments, color: 'indigo', link: '/documents' },
          { icon: BarChart3, label: 'Análises', value: stats.totalAnalyses, color: 'purple', link: '/similarity' },
          { icon: TrendingUp, label: 'Similaridade Média', value: `${stats.avgSimilarity}%`, color: 'emerald' },
          { icon: ShieldAlert, label: 'Alertas Plágio', value: stats.plagiarismAlerts, color: 'red', link: '/plagiarism' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Tipos de Documentos</h3>
            <p className="text-xs text-slate-500 mt-1">Distribuição por formato</p>
          </div>
          <div className="p-6 h-64 flex items-center justify-center">
            {docTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={docTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {docTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum documento</p>
              </div>
            )}
          </div>
          <div className="px-6 pb-4 flex justify-center gap-4">
            {docTypeData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-medium text-slate-600">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analysis Types Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Análises Realizadas</h3>
            <p className="text-xs text-slate-500 mt-1">Por tipo de análise</p>
          </div>
          <div className="p-6 h-64">
            {analyses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisTypeData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma análise realizada</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Ollama Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Status do Ollama</h3>
              <p className="text-xs text-slate-500">Processamento de IA local</p>
            </div>
          </div>
          <Link to="/settings" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
            Configurar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-6">
          {ollamaStatus?.available ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/50">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <span className="text-sm font-bold text-emerald-700">Conectado</span>
                <span className="text-xs text-slate-500 ml-auto font-mono">{ollamaStatus.baseUrl}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ollamaStatus.models.map((model) => (
                  <span
                    key={model.name}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      model.name === ollamaStatus.selectedModel
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {model.name}
                    {model.name === ollamaStatus.selectedModel && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Ollama não detectado</p>
                <p className="text-xs text-amber-600 mt-1">
                  Instale o Ollama em{' '}
                  <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    ollama.ai
                  </a>{' '}
                  para habilitar busca semântica com IA.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Documentos Recentes</h3>
            <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.wordCount} palavras</p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">Nenhum documento ainda</p>
                <Link to="/upload" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-2 inline-block">
                  Fazer upload →
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Análises Recentes</h3>
            <Link to="/similarity" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
              Nova análise <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  analysis.type === 'plagiarism' ? 'bg-gradient-to-br from-red-100 to-orange-100' :
                  analysis.type === 'semantic' ? 'bg-gradient-to-br from-purple-100 to-pink-100' :
                  'bg-gradient-to-br from-emerald-100 to-teal-100'
                }`}>
                  {analysis.type === 'plagiarism' ? <ShieldAlert className="w-5 h-5 text-red-600" /> :
                   analysis.type === 'semantic' ? <Brain className="w-5 h-5 text-purple-600" /> :
                   <GitCompareArrows className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 capitalize">{analysis.type}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(analysis.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  analysis.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  analysis.status === 'failed' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {analysis.status === 'completed' ? '✓' : analysis.status === 'failed' ? '✗' : '...'}
                </span>
              </div>
            ))}
            {analyses.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">Nenhuma análise realizada</p>
                <Link to="/similarity" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold mt-2 inline-block">
                  Iniciar análise →
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Upload, title: 'Upload de Documento', description: 'Adicione novos documentos', link: '/upload', gradient: 'from-indigo-500 to-blue-500' },
          { icon: Target, title: 'Análise de Similaridade', description: 'Compare documentos entre si', link: '/similarity', gradient: 'from-purple-500 to-pink-500' },
          { icon: Search, title: 'Busca Semântica', description: 'Encontre por significado', link: '/semantic', gradient: 'from-emerald-500 to-teal-500' },
        ].map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <QuickAction {...action} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, link }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  link?: string;
}) {
  const gradients: Record<string, string> = {
    indigo: 'from-indigo-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500',
    red: 'from-red-500 to-orange-500',
  };

  const content = (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 hover:shadow-2xl transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function QuickAction({ icon: Icon, title, description, link, gradient }: {
  icon: any;
  title: string;
  description: string;
  link: string;
  gradient: string;
}) {
  return (
    <Link to={link} className="group">
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 hover:shadow-2xl transition-all"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </motion.div>
    </Link>
  );
}
