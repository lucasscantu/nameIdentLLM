import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Brain,
  RefreshCw,
  CheckCircle,
  XCircle,
  Server,
  Cpu,
  Globe,
  Info,
} from 'lucide-react';
import { ollamaClient } from '../lib/ollama';
import { OllamaStatus } from '../types';

export default function SettingsPage() {
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [selectedModel, setSelectedModel] = useState('');
  const [checking, setChecking] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setChecking(true);
    ollamaClient.setBaseUrl(baseUrl);
    const status = await ollamaClient.checkStatus();
    setOllamaStatus(status);
    if (status.selectedModel) {
      setSelectedModel(status.selectedModel);
    }
    setChecking(false);
  };

  const handleSave = () => {
    ollamaClient.setBaseUrl(baseUrl);
    ollamaClient.setModel(selectedModel);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    checkConnection();
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    ollamaClient.setModel(model);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Ollama Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Configuração do Ollama</h3>
              <p className="text-sm text-slate-500">Configure a conexão com o serviço de IA local</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                URL do Servidor
              </div>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Endereço do servidor Ollama. Padrão: http://localhost:11434
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-400" />
                Modelo de IA
              </div>
            </label>
            {ollamaStatus?.available && ollamaStatus.models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              >
                {ollamaStatus.models.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({(model.size / 1e9).toFixed(1)} GB)
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-700">
                  Nenhum modelo encontrado. Instale um modelo com: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">ollama pull qwen3:4b</code>
                </p>
              </div>
            )}
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Status da Conexão</p>
                <p className="text-xs text-slate-500">
                  {ollamaStatus?.available
                    ? `Conectado • ${ollamaStatus.models.length} modelo(s) disponível(is)`
                    : 'Não conectado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ollamaStatus?.available ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-700">Offline</span>
                </div>
              )}
              <button
                onClick={checkConnection}
                disabled={checking}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"
                title="Verificar conexão"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <SettingsIcon className="w-4 h-4" />}
            {saved ? 'Configurações Salvas!' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Guia de Instalação</h3>
              <p className="text-sm text-slate-500">Como configurar o Ollama para uso com o DocSim</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <Step number={1} title="Instalar o Ollama">
              <p>Acesse <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">ollama.ai</a> e baixe o instalador para seu sistema operacional.</p>
            </Step>
            <Step number={2} title="Baixar um modelo">
              <p>Abra o terminal e execute:</p>
              <code className="block mt-2 px-4 py-2 bg-slate-800 text-emerald-400 rounded-lg text-xs font-mono">
                ollama pull qwen3:4b
              </code>
              <p className="text-xs text-slate-500 mt-2">
                Modelos recomendados: qwen3:4b, llama3.2, phi3, mistral
              </p>
            </Step>
            <Step number={3} title="Iniciar o servidor">
              <p>O Ollama geralmente inicia automaticamente. Caso contrário:</p>
              <code className="block mt-2 px-4 py-2 bg-slate-800 text-emerald-400 rounded-lg text-xs font-mono">
                ollama serve
              </code>
            </Step>
            <Step number={4} title="Configurar CORS (se necessário)">
              <p>Para permitir acesso do navegador, configure a variável de ambiente:</p>
              <code className="block mt-2 px-4 py-2 bg-slate-800 text-emerald-400 rounded-lg text-xs font-mono">
                OLLAMA_ORIGINS="*" ollama serve
              </code>
            </Step>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Sobre o DocSim</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>DocSim é um sistema de análise de similaridade textual para documentos acadêmicos.</p>
          <p>Todo o processamento é feito localmente no seu navegador e computador, garantindo total privacidade dos seus documentos.</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs font-medium text-slate-500">Versão</p>
              <p className="text-sm font-semibold text-slate-800">1.0.0</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-xs font-medium text-slate-500">Algoritmos</p>
              <p className="text-sm font-semibold text-slate-800">4 implementados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-indigo-600">{number}</span>
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <div className="text-sm text-slate-600 mt-1">{children}</div>
      </div>
    </div>
  );
}
