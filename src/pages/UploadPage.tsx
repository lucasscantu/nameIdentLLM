import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { extractTextFromFile, saveDocument, generateId, countWords } from '../lib/storage';
import { Document } from '../types';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    const newDocs: Document[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 1) / totalFiles) * 100);
      
      const validTypes = ['.txt', '.pdf', '.docx'];
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      
      if (!validTypes.includes(ext)) {
        setError(`Formato não suportado: ${file.name}. Use TXT, PDF ou DOCX.`);
        continue;
      }

      try {
        const { content, type } = await extractTextFromFile(file);
        
        if (!content.trim()) {
          setError(`Não foi possível extrair texto de: ${file.name}`);
          continue;
        }

        const doc: Document = {
          id: generateId(),
          name: file.name,
          content,
          type,
          size: file.size,
          uploadedAt: new Date(),
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
          wordCount: countWords(content),
          charCount: content.length,
        };

        saveDocument(doc);
        newDocs.push(doc);
      } catch (err) {
        setError(`Erro ao processar ${file.name}: ${(err as Error).message}`);
      }
    }

    setUploadedDocs(prev => [...newDocs, ...prev]);
    setUploading(false);
    setUploadProgress(0);
  }, [tags]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Upload de Documentos</h3>
              <p className="text-sm text-slate-600 mt-1">
                Arraste arquivos ou clique para selecionar • Formatos: TXT, PDF, DOCX
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Tags input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags (opcional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: TCC, pesquisa, artigo, 2024"
              className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm transition-all"
            />
          </div>

          {/* Drop zone */}
          <motion.div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`relative border-3 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
              isDragging
                ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl shadow-indigo-200/50'
                : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.docx"
              onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-700">Processando documentos...</p>
                  <p className="text-sm text-slate-500 mt-1">Extraindo texto e analisando conteúdo</p>
                </div>
                <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg"
                >
                  <Upload className="w-10 h-10 text-indigo-600" />
                </motion.div>
                <div>
                  <p className="text-lg font-bold text-slate-700">
                    Arraste arquivos aqui ou <span className="text-indigo-600">clique para selecionar</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    TXT, PDF, DOCX • Máximo 50MB por arquivo
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-200"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recently uploaded */}
      <AnimatePresence>
        {uploadedDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Documentos Uploadados com Sucesso
                  </h3>
                  <p className="text-sm text-slate-600">{uploadedDocs.length} documento(s) pronto(s) para análise</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {uploadedDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 font-medium">{doc.wordCount} palavras</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">{(doc.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      doc.type === 'pdf' ? 'bg-red-50 text-red-600' :
                      doc.type === 'docx' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.type.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: FileText,
            title: 'Formatos Suportados',
            description: 'TXT (texto puro), PDF (extração automática), DOCX (Word)',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
          },
          {
            icon: Zap,
            title: 'Processamento Rápido',
            description: 'Extração e análise em segundos com algoritmos otimizados',
            color: 'from-amber-500 to-orange-500',
            bgColor: 'from-amber-50 to-orange-50',
          },
          {
            icon: CheckCircle,
            title: 'Validação Automática',
            description: 'Verificação de formato e normalização de texto',
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'from-emerald-50 to-teal-50',
          },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`bg-gradient-to-br ${card.bgColor} rounded-3xl p-6 border border-white/50 shadow-lg`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-2">{card.title}</h4>
            <p className="text-sm text-slate-600">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
