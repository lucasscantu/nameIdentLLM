import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Documentos"
          value={stats.totalDocuments}
          color="indigo"
          link="/documents"
        />
        <StatCard
          icon={GitCompareArrows}
          label="Análises"
          value={stats.totalAnalyses}
          color="purple"
          link="/similarity"
        />
        <StatCard
          icon={TrendingUp}
          label="Similaridade Média"
          value={`${stats.avgSimilarity}%`}
          color="emerald"
        />
        <StatCard
          icon={ShieldAlert}
          label="Alertas de Plágio"
          value={stats.plagiarismAlerts}
          color="red"
          link="/plagiarism"
        />
      </div>

      {/* Ollama Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Status do Ollama</h3>
              <p className="text-xs text-slate-500">Processamento de IA local</p>
            </div>
          </div>
          <Link to="/settings" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Configurar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-6">
          {ollamaStatus?.available ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Conectado</span>
                <span className="text-xs text-slate-500 ml-2">{ollamaStatus.baseUrl}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ollamaStatus.models.map((model) => (
                  <span
                    key={model.name}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      model.name === ollamaStatus.selectedModel
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {model.name}
                    {model.name === ollamaStatus.selectedModel && ' ✓'}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Activity className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-800">Ollama não detectado</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Instale o Ollama em{' '}
                  <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="underline">
                    ollama.ai
                  </a>{' '}
                  e inicie o serviço.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Documentos Recentes</h3>
            <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.wordCount} palavras</p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-500">Nenhum documento ainda</p>
                <Link to="/upload" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block">
                  Fazer upload
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Análises Recentes</h3>
            <Link to="/similarity" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Nova análise
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {analyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  analysis.type === 'plagiarism' ? 'bg-red-50' :
                  analysis.type === 'semantic' ? 'bg-purple-50' : 'bg-emerald-50'
                }`}>
                  {analysis.type === 'plagiarism' ? <ShieldAlert className="w-4 h-4 text-red-500" /> :
                   analysis.type === 'semantic' ? <Brain className="w-4 h-4 text-purple-500" /> :
                   <GitCompareArrows className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 capitalize">{analysis.type}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(analysis.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  analysis.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  analysis.status === 'failed' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {analysis.status === 'completed' ? 'Concluída' :
                   analysis.status === 'failed' ? 'Falhou' : 'Pendente'}
                </span>
              </div>
            ))}
            {analyses.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-500">Nenhuma análise realizada</p>
                <Link to="/similarity" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block">
                  Iniciar análise
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          icon={Upload}
          title="Upload de Documento"
          description="Adicione novos documentos ao sistema"
          link="/upload"
          color="indigo"
        />
        <QuickAction
          icon={GitCompareArrows}
          title="Análise de Similaridade"
          description="Compare documentos entre si"
          link="/similarity"
          color="purple"
        />
        <QuickAction
          icon={Search}
          title="Busca Semântica"
          description="Encontre documentos por significado"
          link="/semantic"
          color="emerald"
        />
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
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function QuickAction({ icon: Icon, title, description, link, color }: {
  icon: any;
  title: string;
  description: string;
  link: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-500 hover:bg-indigo-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
  };

  return (
    <Link to={link} className="group">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]} mb-3 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}
