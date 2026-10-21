import React from 'react';
import { ExternalLink, Camera, Play } from 'lucide-react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

const isDirectVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
const instagramEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('instagram.com')) return '';
    if (!/^\/(p|reel|tv)\//.test(parsed.pathname)) return '';
    return `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}/embed`;
  } catch {
    return '';
  }
};

export const SocialBlogSection: React.FC = () => {
  const { publishedConfig } = useAdminConfig();
  const config = publishedConfig.socialBlog;
  const entries = (config?.entries || []).filter((entry) => entry.enabled && entry.mediaUrl.trim()).sort((a, b) => a.order - b.order);

  if (!config?.enabled || entries.length === 0) return null;

  return (
    <section className="store-social-section w-full py-12 sm:py-16 bg-gradient-to-b from-white via-purple-50/30 to-white" aria-labelledby="farminix-social-blog-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-600 mb-2 flex items-center gap-2"><Camera className="w-4 h-4" /> Farminix updates</p>
            <h2 id="farminix-social-blog-title" className="text-2xl sm:text-3xl font-black text-slate-900">{config.title}</h2>
            <p className="text-sm text-slate-500 mt-2">{config.subtitle}</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Shared by Farminix</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {entries.map((entry) => {
            const instagramUrl = instagramEmbedUrl(entry.mediaUrl);
            return (
              <article key={entry.id} className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[4/5] overflow-hidden bg-slate-950 relative">
                  {isDirectVideo(entry.mediaUrl) ? (
                    <video className="w-full h-full object-cover" src={entry.mediaUrl} controls autoPlay muted loop playsInline preload="auto" />
                  ) : instagramUrl ? (
                    <iframe className="absolute inset-0 h-full w-full border-0 bg-black" src={instagramUrl} title={entry.title || 'Farminix Instagram video'} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen loading="eager" />
                  ) : (
                    <a href={entry.mediaUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center gap-3 text-white bg-gradient-to-br from-purple-950 via-fuchsia-900 to-slate-950">
                      <Play className="w-10 h-10" />
                      <span className="text-xs font-bold">Open video</span>
                    </a>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black text-slate-900">{entry.title}</h3>
                  {entry.caption && <p className="text-sm text-slate-500 mt-2 line-clamp-3">{entry.caption}</p>}
                  {entry.sourceUrl && <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-purple-600 hover:text-purple-800">View original post <ExternalLink className="w-3.5 h-3.5" /></a>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
