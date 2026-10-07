import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Grid } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';

interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  recommendedDimensions?: string;
}

export const AdminImageUpload: React.FC<AdminImageUploadProps> = ({
  value,
  onChange,
  label,
  aspectRatio = 'square',
  recommendedDimensions,
}) => {
  const { config } = useAdminConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    onChange('');
  };

  const previewClass = 
    aspectRatio === 'square' 
      ? 'w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-2xs' 
      : aspectRatio === 'video'
        ? 'w-full aspect-video max-h-40 rounded-2xl object-cover border border-slate-200 shadow-2xs'
        : 'max-h-24 w-auto rounded-xl object-contain border border-slate-200 shadow-2xs';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
        {label && <label className="block text-xs font-bold text-slate-700">{label}</label>}
        {recommendedDimensions && (
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <span>📐 Dimensions:</span>
            <span className="font-extrabold">{recommendedDimensions}</span>
          </span>
        )}
      </div>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-wrap items-center gap-4 p-4 border rounded-2xl transition-all ${
          isDragOver 
            ? 'bg-purple-50 border-purple-500 border-2' 
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Preview or Icon */}
        {value ? (
          <img src={value} alt="Preview" className={previewClass} />
        ) : (
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-350 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-3.5 h-8.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Change File' : 'Upload File'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="px-3.5 h-8.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Drag image here or click to upload (Max 2MB)
          </div>

          {value && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-fit text-red-500 hover:text-red-650 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Image</span>
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Media Library Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">Select Image from Media Library</h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Select from pre-defined high quality assets</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                Close
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50/50">
              {config.mediaLibrary && config.mediaLibrary.map((med) => (
                <div
                  key={med.id}
                  onClick={() => {
                    onChange(med.url);
                    setShowMediaModal(false);
                  }}
                  className="bg-white p-2.5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                    <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] font-extrabold text-slate-800 truncate leading-snug group-hover:text-purple-600">
                    {med.name}
                  </div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                    {med.category} • {med.size}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
