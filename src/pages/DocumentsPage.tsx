import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Trash2,
  Tag,
  Download,
  Eye,
  X,
  Filter,
  Grid3X3,
  List,
} from 'lucide-react';
import { getDocuments, deleteDocument, updateDocumentTags } from '../lib/storage';
import { Document } from '../types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTags, setNewTags] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  const allTags = Array.from(new Set(documents.flatMap(d => d.tags)));

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === '' || doc.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      deleteDocument(id);
      setDocuments(getDocuments());
      if (selectedDoc?.id === id) setSelectedDoc(null);
    }
  };

  const handleSaveTags = (id: string) => {
    const tags = newTags.split(',').map(t => t.trim()).filter(t => t);
    updateDocumentTags(id, tags);
    setDocuments(getDocuments());
    setEditingTags(null);
    setNewTags('');
  };

  const exportDocument = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name.replace(/\.[^.]+$/, '') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-5"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou conteúdo..."
              className="w-full pl-12 pr-5 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="text-sm font-medium focus:outline-none bg-transparent"
              >
                <option value="">Todas as tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2">
          {filteredDocs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-16 text-center"
            >
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-base text-slate-500 font-medium">
                {documents.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum resultado encontrado'}
              </p>
            </motion.div>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border p-5 cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id ? 'border-indigo-400 ring-4 ring-indigo-100 shadow-xl' : 'border-slate-200/50 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      doc.type === 'pdf' ? 'bg-gradient-to-br from-red-100 to-orange-100' :
                      doc.type === 'docx' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                      'bg-gradient-to-br from-slate-100 to-slate-200'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        doc.type === 'pdf' ? 'text-red-600' :
                        doc.type === 'docx' ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-800 truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 font-medium">{doc.wordCount} palavras</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {doc.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); exportDocument(doc); }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Exportar"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border p-5 cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-slate-200/50 hover:shadow-xl'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                    doc.type === 'pdf' ? 'bg-gradient-to-br from-red-100 to-orange-100' :
                    doc.type === 'docx' ? 'bg-gradient-to-br from-blue-100 to-cyan-100' :
                    'bg-gradient-to-br from-slate-100 to-slate-200'
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      doc.type === 'pdf' ? 'text-red-600' :
                      doc.type === 'docx' ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{doc.wordCount} palavras</p>
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence>
            {selectedDoc ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden sticky top-4"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <h3 className="text-base font-bold text-slate-800">Detalhes do Documento</h3>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Nome</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedDoc.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Palavras', value: selectedDoc.wordCount },
                      { label: 'Caracteres', value: selectedDoc.charCount },
                      { label: 'Tipo', value: selectedDoc.type.toUpperCase() },
                      { label: 'Tamanho', value: `${(selectedDoc.size / 1024).toFixed(1)} KB` },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/50">
                        <p className="text-xs font-bold text-slate-500 mb-0.5">{item.label}</p>
                        <p className="text-sm font-bold text-slate-800">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tags</p>
                      <button
                        onClick={() => {
                          setEditingTags(selectedDoc.id);
                          setNewTags(selectedDoc.tags.join(', '));
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" /> Editar
                      </button>
                    </div>
                    {editingTags === selectedDoc.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          placeholder="tag1, tag2, tag3"
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveTags(selectedDoc.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-bold"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingTags(null)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.tags.length > 0 ? selectedDoc.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
                            {tag}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-400">Sem tags</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Pré-visualização</p>
                    <div className="bg-slate-50 rounded-2xl p-4 max-h-48 overflow-y-auto border border-slate-200/50">
                      <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                        {selectedDoc.content.substring(0, 500)}
                        {selectedDoc.content.length > 500 && '...'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => exportDocument(selectedDoc)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Exportar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Completo
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
                <p className="text-sm text-slate-500 font-medium">Selecione um documento para ver detalhes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
