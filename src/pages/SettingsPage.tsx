import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Terminal,
  Shield,
  Zap,
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Configuração do Ollama</h3>
              <p className="text-sm text-slate-600 mt-1">Configure a conexão com o serviço de IA local</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Base URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                URL do Servidor
              </div>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm font-mono transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">
              Endereço do servidor Ollama. Padrão: http://localhost:11434
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                Modelo de IA
              </div>
            </label>
            {ollamaStatus?.available && ollamaStatus.models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition-all"
              >
                {ollamaStatus.models.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({(model.size / 1e9).toFixed(1)} GB)
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                <p className="text-sm font-medium text-amber-800">
                  Nenhum modelo encontrado. Instale um modelo com:
                </p>
                <code className="block mt-2 px-4 py-2 bg-amber-100 rounded-xl text-xs font-mono text-amber-900">
                  ollama pull qwen3:4b
                </code>
              </div>
            )}
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border-2 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                <Server className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Status da Conexão</p>
                <p className="text-xs text-slate-500">
                  {ollamaStatus?.available
                    ? `Conectado • ${ollamaStatus.models.length} modelo(s) disponível(is)`
                    : 'Não conectado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ollamaStatus?.available ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border-2 border-emerald-200"
                >
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Online</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border-2 border-red-200"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-red-700">Offline</span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={checkConnection}
                disabled={checking}
                className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                title="Verificar conexão"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/30"
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <SettingsIcon className="w-5 h-5" />}
            {saved ? 'Configurações Salvas!' : 'Salvar Configurações'}
          </motion.button>
        </div>
      </motion.div>

      {/* Installation Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Info className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Guia de Instalação</h3>
              <p className="text-sm text-slate-600 mt-1">Como configurar o Ollama para uso com o DocSim</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {[
            {
              icon: Terminal,
              title: 'Instalar o Ollama',
              content: (
                <p>Acesse <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-semibold">ollama.ai</a> e baixe o instalador para seu sistema operacional.</p>
              ),
            },
            {
              icon: Cpu,
              title: 'Baixar um modelo',
              content: (
                <>
                  <p className="mb-2">Abra o terminal e execute:</p>
                  <code className="block px-4 py-3 bg-slate-800 text-emerald-400 rounded-xl text-xs font-mono">
                    ollama pull qwen3:4b
                  </code>
                  <p className="text-xs text-slate-500 mt-2">
                    Modelos recomendados: qwen3:4b, llama3.2, phi3, mistral
                  </p>
                </>
              ),
            },
            {
              icon: Zap,
              title: 'Iniciar o servidor',
              content: (
                <>
                  <p className="mb-2">O Ollama geralmente inicia automaticamente. Caso contrário:</p>
                  <code className="block px-4 py-3 bg-slate-800 text-emerald-400 rounded-xl text-xs font-mono">
                    ollama serve
                  </code>
                </>
              ),
            },
            {
              icon: Shield,
              title: 'Configurar CORS (se necessário)',
              content: (
                <>
                  <p className="mb-2">Para permitir acesso do navegador, configure a variável de ambiente:</p>
                  <code className="block px-4 py-3 bg-slate-800 text-emerald-400 rounded-xl text-xs font-mono">
                    OLLAMA_ORIGINS="*" ollama serve
                  </code>
                </>
              ),
            },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-800">{step.title}</p>
                <div className="text-sm text-slate-600 mt-1.5 leading-relaxed">{step.content}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4">Sobre o DocSim</h3>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>DocSim é um sistema de análise de similaridade textual para documentos acadêmicos.</p>
          <p>Todo o processamento é feito localmente no seu navegador e computador, garantindo total privacidade dos seus documentos.</p>
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/50">
              <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Versão</p>
              <p className="text-xl font-black text-slate-800">1.0.0</p>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50">
              <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Algoritmos</p>
              <p className="text-xl font-black text-slate-800">4</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
