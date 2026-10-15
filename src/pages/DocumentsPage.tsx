import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Trash2,
  Tag,
  Download,
  Eye,
  X,
  Filter,
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou conteúdo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Todas as tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                {documents.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum resultado encontrado'}
              </p>
            </div>
          ) : (
            filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedDoc?.id === doc.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.type === 'pdf' ? 'bg-red-50' :
                    doc.type === 'docx' ? 'bg-blue-50' : 'bg-slate-50'
                  }`}>
                    <FileText className={`w-5 h-5 ${
                      doc.type === 'pdf' ? 'text-red-500' :
                      doc.type === 'docx' ? 'text-blue-500' : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{doc.wordCount} palavras</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); exportDocument(doc); }}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      title="Exportar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-4">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Detalhes</h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Nome</p>
                  <p className="text-sm text-slate-800">{selectedDoc.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Palavras</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedDoc.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Caracteres</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedDoc.charCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Tipo</p>
                    <p className="text-sm font-semibold text-slate-800 uppercase">{selectedDoc.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Tamanho</p>
                    <p className="text-sm font-semibold text-slate-800">{(selectedDoc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500">Tags</p>
                    <button
                      onClick={() => {
                        setEditingTags(selectedDoc.id);
                        setNewTags(selectedDoc.tags.join(', '));
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveTags(selectedDoc.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingTags(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags.length > 0 ? selectedDoc.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
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
                  <p className="text-xs font-medium text-slate-500 mb-2">Pré-visualização</p>
                  <div className="bg-slate-50 rounded-xl p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedDoc.content.substring(0, 500)}
                      {selectedDoc.content.length > 500 && '...'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => exportDocument(selectedDoc)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoc({ ...selectedDoc, content: selectedDoc.content });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver Completo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
              <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Selecione um documento para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
