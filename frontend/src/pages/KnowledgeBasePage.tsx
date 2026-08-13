import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, FileText, CheckCircle2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { Document } from '../types/crm';

export const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.content || []);
    } catch (e: any) {
      console.error('Failed to fetch documents', e);
      setError(e.response?.data?.message || 'Failed to fetch indexed documents from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (title) formData.append('title', title);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload and index document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this indexed document and its vector embeddings?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            Company Knowledge Base (RAG Library)
          </h1>
          <p className="text-xs text-slate-400">Upload sales playbooks, pricing sheets, and product specs for AI citation grounding</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDocuments}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Upload Box */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">Upload Document for Indexing</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Enterprise Sales Playbook & Pricing Guidelines"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 inline-block">
              <Upload className="w-8 h-8 text-brand-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                {selectedFile ? selectedFile.name : 'Click to select PDF or TXT file'}
              </p>
              <p className="text-[11px] text-slate-500">Max size 10MB • Auto vector chunking</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{isUploading ? 'Processing & Indexing Embeddings...' : 'Upload & Vector Index'}</span>
          </button>
        </form>
      </div>

      {/* Indexed Document List */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-slate-200">Indexed Knowledge Documents</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-slate-500 gap-2 text-xs">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
            <span>Loading documents...</span>
          </div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No documents uploaded yet. Select a file above to index your company's sales playbooks.</p>
        )}

        <div className="space-y-3">
          {!isLoading && !error && documents.map((doc) => (
            <div key={doc.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-400" />
                <div>
                  <h4 className="font-bold text-xs text-slate-100">{doc.title}</h4>
                  <p className="text-[11px] text-slate-500">{doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Vector Indexed</span>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
