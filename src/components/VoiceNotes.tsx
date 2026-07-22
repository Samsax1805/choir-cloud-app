import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { logAudit } from '../utils/auditLogger';
import type { User, VoiceNote } from '../types';

export function VoiceNotes({ user }: { user: User }) {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [title, setTitle] = useState('');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const canUpload = user.role === 'president' || user.role === 'custodian';

  useEffect(() => setNotes(storage.get<VoiceNote[]>('voice_notes') || []), []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => setBlob(new Blob(chunksRef.current, { type: 'audio/webm' }));
      rec.start();
      setRecording(true);
    } catch (e) {
      alert('Microphone access denied');
    }
  };

  const stop = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      recorderRef.current.stream.getTracks().forEach(t => t.stop());
      setRecording(false);
    }
  };

  const save = () => {
    if (!blob || !title) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const note: VoiceNote = {
        id: Date.now().toString(),
        title,
        audio_url: '',
        audio_data: e.target?.result as string,
        recorded_by: user.id,
        recorded_by_name: user.name,
        created_at: new Date().toISOString().split('T')[0],
      };
      const all = storage.get<VoiceNote[]>('voice_notes') || [];
      storage.set('voice_notes', [...all, note]);
      logAudit(user, 'UPLOAD', 'voice_notes', note.id, { title });
      setTitle(''); setBlob(null);
      setNotes(storage.get<VoiceNote[]>('voice_notes') || []);
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Voice Notes</h2>

      {canUpload && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Record New Note</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex space-x-4">
              <button
                onClick={recording ? stop : start}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  recording ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {recording ? '⏹ Stop' : '🎤 Start Recording'}
              </button>
              {blob && (
                <button onClick={save} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
                   Save
                </button>
              )}
            </div>
            {recording && <p className="text-center text-red-600 font-medium">🔴 Recording...</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes.map((n) => (
          <div key={n.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎵</div>
              <div>
                <h4 className="font-semibold text-slate-900">{n.title}</h4>
                <p className="text-sm text-gray-600">By {n.recorded_by_name} • {n.created_at}</p>
              </div>
            </div>
            {n.audio_data && <audio controls src={n.audio_data} className="h-10" />}
          </div>
        ))}
        {notes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-600">No voice notes yet</p>
          </div>
        )}
      </div>
    </div>
  );
}