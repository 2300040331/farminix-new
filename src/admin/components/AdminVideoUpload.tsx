import React, { useRef, useState } from 'react';
import { Trash2, Upload, Video } from 'lucide-react';

interface AdminVideoUploadProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

export const AdminVideoUpload: React.FC<AdminVideoUploadProps> = ({ value, label, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      window.alert('Please select a video file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.alert('Video files must be 2MB or smaller so they can be published safely.');
      return;
    }
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result || ''));
      setIsReading(false);
    };
    reader.onerror = () => {
      setIsReading(false);
      window.alert('The video could not be read. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        {value ? (
          <video src={value} controls muted playsInline className="w-full aspect-video max-h-48 rounded-xl bg-black object-contain" />
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Video className="h-5 w-5 text-purple-600" />No video uploaded</div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={isReading} className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50">
            <Upload className="h-3.5 w-3.5" />{isReading ? 'Reading…' : value ? 'Change video' : 'Upload video'}
          </button>
          {value && <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Remove video</button>}
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">MP4/WebM · max 2MB</span>
        </div>
        <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => { selectFile(e.target.files?.[0]); e.currentTarget.value = ''; }} />
      </div>
    </div>
  );
};
