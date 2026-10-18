import { useCallback, useEffect, useState } from 'react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultQueriesPageConfig } from '../defaultConfig';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { CustomerEnquiry, QueriesPageConfig } from '../types';

export function QueriesManager() {
  const {config,updateQueriesPage,publishConfig,isSaving,saveError,saveSuccess}=useAdminConfig();
  const cfg={...defaultQueriesPageConfig,...config.queriesPage};
  const [tab,setTab]=useState<'inbox'|'trash'|'page'>('inbox');
  const [rows,setRows]=useState<CustomerEnquiry[]>([]);
  const [total,setTotal]=useState(0);
  const [page,setPage]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [savingId,setSavingId]=useState('');
  const [notice,setNotice]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');try {const response=await fetch(`/api/site-config/queries?page=${page}&trash=${tab==='trash'?'1':'0'}`,{cache:'no-store',credentials:'same-origin'});const data=await response.json();if(!response.ok)throw Error(data.error || 'Unable to load enquiries.');setRows(data.enquiries);setTotal(data.total);}catch(error){setError(error instanceof Error?error.message:'Unable to load enquiries.');}finally{setLoading(false);}},[page,tab]);
  useEffect(()=>{if(tab!=='page')void load();},[load,tab]);
  const change=(id:string,value:Partial<CustomerEnquiry>)=>setRows(previous=>previous.map(row=>row.id===id?{...row,...value}:row));
  const save=async(row:CustomerEnquiry)=>{setSavingId(row.id);setError('');setNotice('');try{const response=await fetch('/api/site-config/queries',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,status:row.status,adminNotes:row.adminNotes})});const data=await response.json();if(!response.ok)throw Error(data.error || 'Unable to update enquiry.');change(row.id,data.enquiry);setNotice('Enquiry updated.');}catch(error){setError(error instanceof Error?error.message:'Unable to update enquiry.');}finally{setSavingId('');}};
  const move=async(row:CustomerEnquiry,restore=false)=>{
    setSavingId(row.id);setError('');setNotice('');
    try {
      const response=await fetch('/api/site-config/queries',{method:restore?'PATCH':'DELETE',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:row.id,...(restore?{action:'restore'}:{})})});
      const data=await response.json();if(!response.ok)throw Error(data.error || 'Unable to update enquiry.');
      setNotice(restore?'Enquiry restored to the inbox.':'Enquiry moved to Trash. You can restore it there.');
      if(rows.length===1 && page>0)setPage(previous=>previous-1);else await load();
    }catch(error){setError(error instanceof Error?error.message:'Unable to update enquiry.');}finally{setSavingId('');}
  };
  const input='w-full p-3 border border-slate-300 rounded-xl bg-white text-sm';
  const update=(key:keyof QueriesPageConfig,value:string|boolean)=>updateQueriesPage({...cfg,[key]:value});
  return <div className="space-y-6 text-left pb-12"><header className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-3xl p-7"><p className="text-xs uppercase tracking-widest text-purple-200 font-bold">Customer conversations</p><h1 className="font-bold text-3xl mt-3">Queries & compliance</h1><p className="text-purple-100 mt-3 text-sm">Manage the enquiry page and real customer submissions.</p><a href="/queries" target="_blank" rel="noreferrer" className="inline-block mt-4 text-sm underline">View Any Queries? page ↗</a></header>
    <div className="flex gap-2 rounded-2xl bg-white border p-2">{(['inbox','trash','page'] as const).map(id=><button key={id} type="button" onClick={()=>{setTab(id);setPage(0);setNotice('');}} className={`px-5 py-3 rounded-xl font-bold text-sm ${tab===id?'bg-purple-600 text-white shadow':'text-slate-600 hover:bg-slate-100'}`}>{id==='inbox'?'Customer enquiries':id==='trash'?'Trash':'Edit enquiry page'}</button>)}</div>
    {tab==='page'?<section className="bg-white border rounded-2xl p-6 space-y-5"><div className="flex flex-wrap justify-between gap-4 items-center"><h2 className="font-bold text-xl">Page content</h2><label className="flex gap-2"><input type="checkbox" checked={cfg.enabled} onChange={e=>update('enabled',e.target.checked)}/>Page enabled</label></div>
      <div className="grid md:grid-cols-2 gap-5">{(['title','badge','subtitle','formHeading','submitLabel','successMessage','privacyNote','complianceTitle','complianceBody'] as const).map(key=><label key={key} className={['subtitle','privacyNote','complianceBody','successMessage'].includes(key)?'md:col-span-2':''}><span className="block text-sm font-bold mb-2">{{title:'Page title',badge:'Intro badge',subtitle:'Introduction',formHeading:'Form heading',submitLabel:'Submit button',successMessage:'Confirmation message',privacyNote:'Privacy note',complianceTitle:'Queries & compliance heading',complianceBody:'Queries & compliance information'}[key]}</span><textarea className={input} rows={key==='complianceBody'?5:2} value={cfg[key]} onChange={e=>update(key,e.target.value)}/></label>)}</div>
      <AdminImageUpload label="Page image (optional)" value={cfg.image} onChange={image=>update('image',image)} aspectRatio="video"/>
      {saveError&&<p role="alert" className="text-red-600">{saveError}</p>}{saveSuccess&&<p role="status" className="text-emerald-700">Page saved to the live store.</p>}
      <button type="button" className="rounded-xl px-5 py-3 bg-purple-600 text-white font-bold" disabled={isSaving} onClick={()=>void publishConfig()}>{isSaving?'Publishing…':'Save Changes'}</button>
    </section>:<section className="space-y-4"><div className="flex items-center justify-between"><h2 className="font-bold text-xl">{tab==='trash'?'Trash':'Enquiries'} ({total})</h2><button type="button" disabled={loading} onClick={()=>void load()} className="text-purple-700 font-bold">{loading?'Loading…':'Refresh inbox'}</button></div>
      {error&&<p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</p>}{notice&&<p role="status" className="text-emerald-700">{notice}</p>}
      {!loading&&!rows.length&&!error&&<div className="rounded-2xl border border-dashed p-12 text-center bg-white"><h3 className="font-bold text-lg">{tab==='trash'?'Trash is empty':'No enquiries yet'}</h3><p className="text-sm text-slate-500 mt-2">{tab==='trash'?'Deleted enquiries appear here and can be restored.':'Customer submissions will appear here. No sample messages are added.'}</p></div>}
      {rows.map(row=><article key={row.id} className="bg-white border rounded-2xl p-6 space-y-5"><header className="flex flex-wrap justify-between items-start gap-3"><div><h3 className="font-bold text-lg">{row.name}</h3><p className="text-xs text-slate-500 mt-1">{new Date(row.createdAt).toLocaleString('en-IN')} · {row.kind}</p></div><span className="bg-purple-50 text-purple-700 rounded-full text-xs px-3 py-2 font-bold">{row.status}</span></header><div className="flex flex-wrap gap-5 text-sm"><a href={`tel:${row.mobile}`} className="text-purple-700">{row.mobile}</a>{row.email&&<a href={`mailto:${row.email}`} className="text-purple-700">{row.email}</a>}</div><p className="whitespace-pre-wrap break-words text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">{row.message}</p>{tab!=='trash'&&<div className="grid md:grid-cols-[1fr_2fr] gap-4"><label>Status<select className={input} value={row.status} onChange={e=>change(row.id,{status:e.target.value as CustomerEnquiry['status']})}><option value="new">New</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></label><label>Private staff notes<textarea className={input} maxLength={5000} rows={3} value={row.adminNotes} onChange={e=>change(row.id,{adminNotes:e.target.value})}/></label></div>}<div className="flex flex-wrap justify-between items-center gap-3"><span className="text-xs text-slate-400 break-all">Reference: {row.id}</span><div className="flex gap-3">{tab==='trash'?<button type="button" disabled={!!savingId} onClick={()=>void move(row,true)} className="text-purple-700 font-bold px-4 py-2 rounded-xl border border-purple-200">Restore enquiry</button>:<><button type="button" disabled={!!savingId} onClick={()=>void move(row)} className="text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-xl border border-red-200">Delete enquiry</button><button type="button" disabled={!!savingId} onClick={()=>void save(row)} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm">{savingId===row.id?'Saving…':'Save enquiry'}</button></>}</div></div></article>)}
      {total>25&&<div className="flex justify-between"><button disabled={!page||loading} onClick={()=>setPage(p=>p-1)}>← Previous</button><span>Page {page+1} of {Math.ceil(total/25)}</span><button disabled={(page+1)*25>=total||loading} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
    </section>}
  </div>;
}
