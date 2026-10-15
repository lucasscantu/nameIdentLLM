import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { extractTextFromFile, saveDocument, generateId, countWords } from '../lib/storage';
import { Document } from '../types';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState('');

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    const newDocs: Document[] = [];

    for (const file of Array.from(files)) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Upload de Documentos</h3>
          <p className="text-sm text-slate-500 mt-1">
            Arraste arquivos ou clique para selecionar. Formatos aceitos: TXT, PDF, DOCX
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Tags input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: TCC, pesquisa, artigo"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
            />
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50 scale-[1.02]'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
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
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-600">Processando documentos...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Arraste arquivos aqui ou <span className="text-indigo-600">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">TXT, PDF, DOCX • Máximo 50MB por arquivo</p>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recently uploaded */}
      {uploadedDocs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">
              Documentos Recém-Uploadados ({uploadedDocs.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {uploadedDocs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {doc.wordCount} palavras • {(doc.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    doc.type === 'pdf' ? 'bg-red-50 text-red-600' :
                    doc.type === 'docx' ? 'bg-blue-50 text-blue-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {doc.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Formatos Suportados</h4>
          </div>
          <p className="text-xs text-slate-500">TXT (texto puro), PDF (extração automática), DOCX (Word)</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-purple-500" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Validação Automática</h4>
          </div>
          <p className="text-xs text-slate-500">Verificação de formato, extração de texto e normalização</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Armazenamento Local</h4>
          </div>
          <p className="text-xs text-slate-500">Documentos armazenados no navegador. Dados nunca enviados a servidores.</p>
        </div>
      </div>
    </div>
  );
}
