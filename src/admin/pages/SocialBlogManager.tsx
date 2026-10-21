import React, { useEffect, useState } from 'react';
import { Check, Camera, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { SocialBlogConfig, SocialBlogEntry } from '../types';

export const SocialBlogManager: React.FC = () => {
  const { config, updateSocialBlog, publishConfig } = useAdminConfig();
  const [formData, setFormData] = useState<SocialBlogConfig>(config.socialBlog);
  const [saved, setSaved] = useState(false);

  useEffect(() => setFormData(config.socialBlog), [config.socialBlog]);

  const update = (next: SocialBlogConfig) => {
    setFormData(next);
    updateSocialBlog(next);
  };

  const updateEntry = (id: string, patch: Partial<SocialBlogEntry>) => {
    update({ ...formData, entries: formData.entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry) });
  };

  const addEntry = () => {
    const nextOrder = formData.entries.length + 1;
    update({ ...formData, enabled: true, entries: [...formData.entries, { id: `social-${Date.now()}`, title: '', caption: '', mediaUrl: '', sourceUrl: '', enabled: true, order: nextOrder }] });
  };

  const removeEntry = (id: string) => update({ ...formData, entries: formData.entries.filter((entry) => entry.id !== id).map((entry, index) => ({ ...entry, order: index + 1 })) });
  const moveEntry = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= formData.entries.length) return;
    const entries = [...formData.entries];
    [entries[index], entries[target]] = [entries[target], entries[index]];
    update({ ...formData, entries: entries.map((entry, i) => ({ ...entry, order: i + 1 })) });
  };

  const save = async () => {
    updateSocialBlog(formData);
    setSaved(await publishConfig());
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1"><Camera className="w-4 h-4" />Social publishing</div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Instagram &amp; Blog Videos</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Add a real Instagram post/reel URL or a direct video URL. Entries with the crossed-eye control are hidden from the storefront.</p>
        </div>
        <button onClick={() => void save()} className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"><Check className="w-4 h-4" />Save &amp; Publish</button>
      </div>

      {saved && <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">Published to the live homepage.</div>}

      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer"><input type="checkbox" checked={formData.enabled} onChange={(e) => update({ ...formData, enabled: e.target.checked })} className="accent-purple-600" />Show this section when it has published entries</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-xs font-bold text-slate-700">Section title<input value={formData.title} onChange={(e) => update({ ...formData, title: e.target.value })} className="w-full mt-1 h-10 px-3 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
          <label className="text-xs font-bold text-slate-700">Section subtitle<input value={formData.subtitle} onChange={(e) => update({ ...formData, subtitle: e.target.value })} className="w-full mt-1 h-10 px-3 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
        </div>
      </div>

      <div className="space-y-4">
        {formData.entries.map((entry, index) => (
          <div key={entry.id} className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-900">Video {index + 1}</div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveEntry(index, -1)} disabled={index === 0} className="p-2 text-slate-500 disabled:opacity-30 cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveEntry(index, 1)} disabled={index === formData.entries.length - 1} className="p-2 text-slate-500 disabled:opacity-30 cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
                <button type="button" onClick={() => updateEntry(entry.id, { enabled: !entry.enabled })} className="p-2 text-slate-500 hover:text-purple-600 cursor-pointer" title={entry.enabled ? 'Hide entry' : 'Show entry'}>{entry.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button type="button" onClick={() => removeEntry(entry.id)} className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer" title="Remove entry"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-700">Title<input value={entry.title} onChange={(e) => updateEntry(entry.id, { title: e.target.value })} className="w-full mt-1 h-10 px-3 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
              <label className="text-xs font-bold text-slate-700">Media/video URL<input value={entry.mediaUrl} onChange={(e) => updateEntry(entry.id, { mediaUrl: e.target.value })} placeholder="https://www.instagram.com/reel/... or https://.../video.mp4" className="w-full mt-1 h-10 px-3 text-xs font-mono font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
              <label className="text-xs font-bold text-slate-700">Caption<textarea value={entry.caption} onChange={(e) => updateEntry(entry.id, { caption: e.target.value })} rows={2} className="w-full mt-1 p-3 text-xs font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
              <label className="text-xs font-bold text-slate-700">Original post URL (optional)<input value={entry.sourceUrl} onChange={(e) => updateEntry(entry.id, { sourceUrl: e.target.value })} placeholder="https://www.instagram.com/..." className="w-full mt-1 h-10 px-3 text-xs font-mono font-normal bg-slate-50 border border-slate-200 rounded-xl" /></label>
            </div>
            {entry.mediaUrl && <a href={entry.mediaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600"><ExternalLink className="w-3.5 h-3.5" />Open media URL</a>}
          </div>
        ))}
        {formData.entries.length === 0 && <div className="admin-panel bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center text-sm text-slate-500">No Instagram or video posts have been added. Add a real post to show it below Popular Today.</div>}
        <button type="button" onClick={addEntry} className="w-full py-3 rounded-2xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-100"><Plus className="w-4 h-4" />Add Instagram/video post</button>
      </div>
    </div>
  );
};
