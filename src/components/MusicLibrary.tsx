import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, MusicFile, Category } from '../types';

export function MusicLibrary({ user }: { user: User }) {
  const [files, setFiles] = useState<MusicFile[]>([]);
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<Category>('hymns');
  const [file, setFile] = useState<File | null>(null);

  const canUpload = user.role === 'president' || user.role === 'custodian';

  useEffect(() => loadFiles(), []);

  const loadFiles = () => setFiles(storage.get<MusicFile[]>('music_files') || []);

  const handleUpload = () => {
    if (!file || !title) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const newFile: MusicFile = {
        id: Date.now().toString(),
        title,
        category: cat,
        file_type: ext as any,
        file_url: '',
        file_data: e.target?.result as string,
        uploaded_by: user.id,
        uploaded_by_name: user.name,
        created_at: new Date().toISOString().split('T')[0],
      };
      const all = storage.get<MusicFile[]>('music_files') || [];
      storage.set('music_files', [...all, newFile]);
      logAudit(user, 'UPLOAD', 'music_files', newFile.id, { title, category: cat });
      setTitle(''); setFile(null); setShowUpload(false);
      loadFiles();
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (f: MusicFile) => {
    if (f.file_data) {
      const a = document.createElement('a');
      a.href = f.file_data;
      a.download = `${f.title}.${f.file_type}`;
      a.click();
      logAudit(user, 'DOWNLOAD', 'music_files', f.id, { title: f.title });
    }
  };

  const filtered = files.filter(f =>
    (category === 'all' || f.category === category) &&
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const cats = [
    { id: 'all' as const, label: 'All Files', count: files.length },
    { id: 'hymns' as const, label: 'Hymns', count: files.filter(f => f.category === 'hymns').length },
    { id: 'gospel' as const, label: 'Gospel Songs', count: files.filter(f => f.category === 'gospel').length },
    { id: 'practice' as const, label: 'Practice Tracks', count: files.filter(f => f.category === 'practice').length },
    { id: 'sheet' as const, label: 'Sheet Music', count: files.filter(f => f.category === 'sheet').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Music Library File Manager</h2>
        {canUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg flex items-center space-x-2"
          >
            <span>+</span><span>Upload File</span>
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 space-y-2">
          <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                category === c.id
                  ? 'bg-amber-100 border-2 border-amber-400 text-amber-900'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between">
                <span>{c.label}</span>
                <span className="text-sm text-gray-500">{c.count}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-amber-300 hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  f.category === 'hymns' ? 'bg-blue-100 text-blue-800' :
                  f.category === 'gospel' ? 'bg-green-100 text-green-800' :
                  f.category === 'practice' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>{f.category}</span>
                <span className="text-xs text-gray-500 uppercase">{f.file_type}</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">{f.title}</h4>
              <div className="text-sm text-gray-600 mb-4">
                <p>Uploaded: {f.created_at}</p>
                <p>By: {f.uploaded_by_name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(f)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  <span>⬇️</span><span>Download</span>
                </button>
                {f.file_type === 'mp3' && f.file_data && (
                  <audio controls src={f.file_data} className="flex-1 h-10" />
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-600">No files found</p>
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Upload Music File</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as Category)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="hymns">Hymns</option>
                <option value="gospel">Gospel Songs</option>
                <option value="practice">Practice Tracks</option>
                <option value="sheet">Sheet Music</option>
              </select>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".mp3,.wav,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <p className="text-sm text-gray-600">{file ? file.name : 'Click to upload'}</p>
                  <p className="text-xs text-gray-500 mt-1">MP3, WAV, or PDF (max 10MB)</p>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpload}
                  disabled={!file || !title}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium"
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}