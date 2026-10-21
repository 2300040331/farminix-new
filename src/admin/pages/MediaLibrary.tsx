import React, { useState } from 'react';
import { Image, Upload, Trash2, Copy, Check, Search } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { MediaItem } from '../types';

export const MediaLibrary: React.FC = () => {
  const { config, addMedia, deleteMedia } = useAdminConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Upload Form
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaItem['category']>('product');

  const filteredMedia = config.mediaLibrary.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim() || !newMediaUrl.trim()) {
      alert('Please upload an asset image and specify a label!');
      return;
    }

    const item: MediaItem = {
      id: `med-${Date.now()}`,
      name: newMediaName.trim(),
      url: newMediaUrl.trim(),
      category: newMediaCategory,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: '480 KB',
    };

    addMedia(item);
    setNewMediaName('');
    setNewMediaUrl('');
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Image className="w-4 h-4" />
            <span>Digital Asset Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Media &amp; Image Library
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Store and manage product photographs, brand SVGs, category thumbnails, and hero banners.
          </p>
        </div>
      </div>

      {/* Add New Media Form */}
      <form onSubmit={handleAddMedia} className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Upload / Register New Asset
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Asset Label</label>
              <input
                type="text"
                required
                value={newMediaName}
                onChange={(e) => setNewMediaName(e.target.value)}
                placeholder="E.g., Daawat Rice 5kg Banner"
                className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Asset Type</label>
              <select
                value={newMediaCategory}
                onChange={(e) => setNewMediaCategory(e.target.value as any)}
                className="w-full h-10 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 mb-3"
              >
                <option value="product">Product Photo</option>
                <option value="category">Category Thumbnail</option>
                <option value="banner">Hero / Deal Banner</option>
                <option value="brand">Brand Partner Logo</option>
                <option value="other">Other Asset</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Save Asset</span>
            </button>
          </div>

          <div className="md:col-span-2">
            <AdminImageUpload
              value={newMediaUrl}
              onChange={setNewMediaUrl}
              label="Asset Image (Drag & Drop or Click)"
              aspectRatio="video"
            />
          </div>
        </div>
      </form>

      {/* Filter Bar */}
      <div className="admin-panel bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media by title..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="ALL">All Asset Types</option>
          <option value="product">Products</option>
          <option value="category">Categories</option>
          <option value="banner">Banners</option>
          <option value="brand">Brand Logos</option>
        </select>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((media) => (
          <div
            key={media.id}
            className="admin-panel bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between group hover:border-purple-300 transition-colors"
          >
            <div className="w-full aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center p-2">
              <img src={media.url} alt={media.name} className="max-h-full max-w-full object-contain" />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase">
                {media.category}
              </span>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="font-bold text-xs text-slate-900 truncate" title={media.name}>
                {media.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{media.url}</div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleCopyUrl(media.url, media.id)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === media.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === media.id ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => deleteMedia(media.id)}
                  className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
