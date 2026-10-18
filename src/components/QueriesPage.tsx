import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultQueriesPageConfig } from '../admin/defaultConfig';

export function QueriesPage() {
  const {publishedConfig}=useAdminConfig();
  const cfg={...defaultQueriesPageConfig,...publishedConfig.queriesPage};
  const [form,setForm]=useState({name:'',mobile:'',email:'',message:'',kind:'query',website:''});
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const [reference,setReference]=useState('');
  const requestId=useRef(crypto.randomUUID());
  const sendingRef=useRef(false);
  useEffect(()=>{document.title='Any Queries? — Farminix';window.scrollTo(0,0);},[]);
  const field='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition';
  const update=(key:keyof typeof form,value:string)=>setForm(previous=>({...previous,[key]:value}));
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();if(sendingRef.current)return;sendingRef.current=true;setSending(true);setError('');
    try {const response=await fetch('/api/site-config/queries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,requestId:requestId.current}),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)throw Error(data.error || 'Unable to submit. Please retry.');setReference(data.id);}
    catch(error){setError(error instanceof Error?error.message:'Unable to submit. Please retry.');}
    finally{sendingRef.current=false;setSending(false);}
  };
  if(!cfg.enabled)return <div className="max-w-3xl mx-auto px-6 py-24 text-center"><h1 className="text-3xl font-bold">Enquiries are currently unavailable</h1></div>;
  return <div className="bg-[#fbfaff] min-h-[75vh] pb-16">
    <div className="relative overflow-hidden bg-[#20103c] text-white"><div className="absolute -right-20 -top-40 w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-3xl pointer-events-none"/><div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center relative"><div><span className="inline-flex items-center gap-2 text-purple-200 text-xs tracking-widest uppercase font-bold border border-purple-400/30 rounded-full px-4 py-2"><Sparkles size={14}/>{cfg.badge}</span><h1 className="text-4xl md:text-6xl font-black mt-6 leading-tight tracking-tight">{cfg.title}</h1><p className="text-purple-100/80 mt-5 max-w-xl leading-relaxed text-base md:text-lg">{cfg.subtitle}</p></div>{cfg.image?<img src={cfg.image} alt="" className="rounded-3xl max-h-72 w-full object-cover"/>:<div aria-hidden="true" className="hidden md:flex justify-center"><div className="w-44 h-44 rounded-[3rem] border border-purple-300/20 bg-white/5 rotate-6 flex items-center justify-center"><MessageCircle size={82} strokeWidth={1} className="text-lime-200 -rotate-6"/></div></div>}</div></div>
    <div className="max-w-7xl mx-auto px-6 pt-12 grid lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-16 items-start"><aside className="space-y-8"><div className="flex gap-3 items-center text-purple-700"><span className="h-px w-10 bg-purple-500"/><span className="text-xs font-bold uppercase tracking-[0.18em]">A direct line to Farminix</span></div><h2 className="text-2xl font-bold text-slate-900">{cfg.complianceTitle}</h2><p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{cfg.complianceBody}</p><div className="flex items-start gap-3 rounded-2xl bg-purple-50 border border-purple-100 p-5"><ShieldCheck className="text-purple-600 shrink-0" size={22}/><p className="text-sm text-slate-600 leading-relaxed">{cfg.privacyNote}</p></div></aside>
      <section className="bg-white rounded-[2rem] border border-slate-200/80 p-6 md:p-9 shadow-xl shadow-purple-950/5">
      {reference?<div role="status" className="py-10 text-center"><CheckCircle2 size={48} className="mx-auto text-emerald-600"/><h2 className="text-2xl font-bold mt-5">Enquiry received</h2><p className="text-slate-600 mt-3">{cfg.successMessage}</p><p className="text-xs text-slate-500 mt-5 break-all">Reference: {reference}</p><button type="button" className="mt-6 text-purple-700 font-bold" onClick={()=>{setReference('');setForm({name:'',mobile:'',email:'',message:'',kind:'query',website:''});requestId.current=crypto.randomUUID();}}>Send another enquiry</button></div>:<form onSubmit={submit} className="space-y-5"><div className="flex justify-between items-center gap-4 mb-7"><h2 className="text-2xl font-bold text-slate-900">{cfg.formHeading}</h2><MessageCircle className="text-purple-500 shrink-0" size={26}/></div>
      <div className="grid sm:grid-cols-2 gap-5"><label className="text-sm font-semibold text-slate-700">Customer name <span className="text-purple-600">*</span><input required minLength={2} maxLength={120} autoComplete="name" className={field} value={form.name} onChange={e=>update('name',e.target.value)}/></label><label className="text-sm font-semibold text-slate-700">Mobile number <span className="text-purple-600">*</span><input required type="tel" autoComplete="tel" maxLength={24} className={field} value={form.mobile} onChange={e=>update('mobile',e.target.value)}/></label></div>
      <label className="block text-sm font-semibold text-slate-700">Email address <span className="font-normal text-slate-400">(optional)</span><input type="email" maxLength={254} autoComplete="email" className={field} value={form.email} onChange={e=>update('email',e.target.value)}/></label>
      <label className="block text-sm font-semibold text-slate-700">Enquiry topic<select className={field} value={form.kind} onChange={e=>update('kind',e.target.value)}><option value="query">General query</option><option value="complaint">Complaint</option><option value="compliance">Compliance query</option></select></label>
      <label className="block text-sm font-semibold text-slate-700">Query or message <span className="text-purple-600">*</span><textarea required minLength={5} maxLength={5000} rows={6} className={field+' resize-y'} value={form.message} onChange={e=>update('message',e.target.value)}/><span className="block text-right mt-1 text-xs font-normal text-slate-400">{form.message.length}/5,000</span></label>
      <div aria-hidden="true" className="hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/></label></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}<button type="submit" disabled={sending} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-2xl px-6 py-4 font-bold flex items-center justify-center gap-3 transition">{sending?'Sending…':cfg.submitLabel}<ArrowUpRight size={20}/></button></form>}
      </section></div>
  </div>;
}
