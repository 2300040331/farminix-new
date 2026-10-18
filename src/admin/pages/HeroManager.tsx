import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { HeroSlide } from '../types';

export function HeroManager() {
  const { config, updateHero, publishConfig, isSaving, saveError, saveSuccess } = useAdminConfig();
  const hero = config.hero;
  const slides: HeroSlide[] = hero.slides ?? (hero.bannerImage ? [{id:'original-banner',image:hero.bannerImage,altText:hero.altText,linkUrl:hero.shopNowUrl,buttonText:'Shop now',enabled:true,legacyHotspots:true}] : []);
  const update = (id: string, value: Partial<HeroSlide>) => updateHero({slides:slides.map(s => s.id === id ? {...s,...value} : s)});
  const input='w-full border border-slate-300 rounded-xl p-3 text-sm';
  return <div className="space-y-6 text-left"><header className="bg-white border rounded-2xl p-6 flex flex-wrap gap-4 justify-between items-center"><div><h1 className="font-bold text-2xl">Home banner carousel</h1><p className="text-slate-500 mt-2 text-sm">Add your own images. Enabled slides appear in this order after Save Changes.</p></div><button type="button" disabled={isSaving} className="bg-purple-600 text-white rounded-xl px-5 py-3" onClick={() => void publishConfig()}>{isSaving ? 'Publishing…' : 'Save Changes'}</button></header>
    {saveError && <p role="alert" className="text-red-600">{saveError}</p>}{saveSuccess && <p role="status" className="text-emerald-700">Carousel saved to the live store.</p>}
    <div className="bg-white border rounded-2xl p-6 flex flex-wrap items-center gap-6"><label className="flex gap-2"><input type="checkbox" checked={hero.enabled} onChange={e => updateHero({enabled:e.target.checked})}/>Show home carousel</label><p className="text-sm font-semibold text-slate-600">Slides rotate automatically every 5 seconds.</p></div>
    {slides.map((slide,i) => <section key={slide.id} className="bg-white border rounded-2xl p-6 space-y-4"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Slide {i+1}</h2><div className="flex gap-4"><label className="flex gap-2"><input type="checkbox" checked={slide.enabled} onChange={e => update(slide.id,{enabled:e.target.checked})}/>Enabled</label><button type="button" disabled={!i} onClick={() => {const list=[...slides];[list[i-1],list[i]]=[list[i],list[i-1]];updateHero({slides:list});}}>Move up</button><button type="button" onClick={() => updateHero({slides:slides.filter(s => s.id !== slide.id)})}>Remove</button></div></div>
      <AdminImageUpload label={`Carousel image ${i+1}`} value={slide.image} onChange={image => update(slide.id,{image})} aspectRatio="video" recommendedDimensions="1920 × 1080 px; use consistent dimensions for every slide"/>
      <div className="grid md:grid-cols-3 gap-4"><label>Image description<input className={input} value={slide.altText} onChange={e => update(slide.id,{altText:e.target.value})}/></label><label>Link (optional)<input className={input} value={slide.linkUrl} onChange={e => update(slide.id,{linkUrl:e.target.value})}/></label><label>Button text (optional)<input className={input} value={slide.buttonText} onChange={e => update(slide.id,{buttonText:e.target.value})}/></label></div>
      {slide.legacyHotspots && <label className="flex gap-2 text-sm"><input type="checkbox" checked={slide.legacyHotspots} onChange={e => update(slide.id,{legacyHotspots:e.target.checked})}/>Keep the original banner’s Shop Now button placement</label>}
    </section>)}
    {!slides.length && <p className="text-slate-500">No banner images added.</p>}<button type="button" className="w-full border-2 border-dashed border-purple-300 rounded-2xl p-5 text-purple-700 font-bold" onClick={() => updateHero({slides:[...slides,{id:crypto.randomUUID(),image:'',altText:'',linkUrl:'',buttonText:'',enabled:true}]})}>+ Add carousel image</button>
  </div>;
}
