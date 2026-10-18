import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export function HeroBanner() {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const hero = publishedConfig.hero;
  const slides = (hero.slides ?? (hero.bannerImage ? [{id:'original-banner',image:hero.bannerImage,altText:hero.altText,linkUrl:hero.shopNowUrl,buttonText:'Shop now',enabled:true,legacyHotspots:true}] : [])).filter(s => s.enabled && s.image);
  const [index,setIndex]=useState(0);
  useEffect(() => {if (!hero.enabled || slides.length < 2) return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>clearInterval(timer);},[hero.enabled,slides.length]);
  if (!hero.enabled || !slides.length) return null;
  const active=index%slides.length;
  const move=(direction:number)=>setIndex(i=>(i+direction+slides.length)%slides.length);
  const open=(url:string)=>{if(url.startsWith('/') && !url.startsWith('//')) navigate(url);else if(/^https?:\/\//i.test(url)) window.location.assign(url);};
  return <section aria-label="Farminix home banners" aria-roledescription="carousel" className="relative w-full bg-purple-50">
    <div className="relative overflow-hidden">{slides.map((slide,i)=><div key={slide.id} hidden={i!==active} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${slides.length}`} className="relative">
      <img src={slide.image} alt={slide.altText || 'Farminix banner'} className="w-full h-auto block" draggable="false" loading={i===0?'eager':'lazy'}/>
      {slide.linkUrl && !slide.buttonText && !slide.legacyHotspots && <button type="button" className="absolute inset-0 cursor-pointer" aria-label={slide.altText || `Open banner ${i+1}`} onClick={()=>open(slide.linkUrl)}/>}
      {slide.linkUrl && (slide.buttonText || slide.legacyHotspots) && <button type="button" onClick={()=>open(slide.linkUrl)} className={slide.legacyHotspots ? 'absolute left-[4.1%] top-[54.2%] w-[15.8%] h-[6.4%] bg-purple-600 text-white rounded-full font-bold text-[8px] sm:text-sm cursor-pointer' : 'absolute bottom-6 left-6 sm:bottom-12 sm:left-12 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg'}>{slide.buttonText || 'Shop now'} →</button>}
    </div>)}</div>
    {slides.length>1 && <><button type="button" aria-label="Previous banner" onClick={()=>move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-purple-800 shadow"><ChevronLeft size={22}/></button><button type="button" aria-label="Next banner" onClick={()=>move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-purple-800 shadow"><ChevronRight size={22}/></button><div className="flex justify-center items-center gap-2 py-3 bg-white">{slides.map((s,i)=><button key={s.id} type="button" aria-label={`Show banner ${i+1}`} aria-current={i===active?'true':undefined} onClick={()=>setIndex(i)} className={`h-2.5 rounded-full transition-all ${i===active?'w-7 bg-purple-600':'w-2.5 bg-purple-200'}`}/>)}</div></>}
  </section>;
}
