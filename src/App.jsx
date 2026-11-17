import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-service-hours-v1';

// Fictional volunteering programs for the self-contained UI/UX exercise.
// Staff names, partners and descriptions are examples, not real university records.
const PROGRAMS = {
  ENV110: {
    name: 'Campus Green Team',
    partner: 'University Sustainability Office',
    description: 'Weekly tree planting, recycling audits and awareness stands that help the campus reduce its waste and energy use.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Heba Lotfy'], coordinators: ['Malak Ashraf', 'Ziad Hamdy']},
      {year: '2024/25', supervisors: ['Dr. Sherif Galal'], coordinators: ['Jana Wael', 'Seif Mostafa']},
    ],
  },
  EDU210: {
    name: 'Peer Tutoring Circle',
    partner: 'Student Learning Center',
    description: 'Senior students run small study groups for first-year courses, preparing worked examples and answering questions.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Nermine Aly'], coordinators: ['Hana Kamal', 'Marwan Essam']},
      {year: '2024/25', supervisors: ['Dr. Waleed Fouad'], coordinators: ['Laila Samy', 'Kareem Ayman']},
    ],
  },
  HLT150: {
    name: 'Blood Drive Crew',
    partner: 'Regional Blood Bank',
    description: 'Volunteers organise campus donation days, register donors and support the medical team on site.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Amr Zaki'], coordinators: ['Salma Reda', 'Omar Hesham']},
      {year: '2024/25', supervisors: ['Dr. Mona Sabry', 'Dr. Amr Zaki'], coordinators: ['Nadia Fikry', 'Tarek Adel']},
    ],
  },
  COM305: {
    name: 'Community Kitchen',
    partner: 'Neighbourhood Food Network',
    description: 'Preparing and packing meals for local families, managing donations and keeping the kitchen inventory up to date.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Yasmin Talaat', 'Hazem Farid']},
      {year: '2024/25', supervisors: ['Dr. Ghada Ibrahim'], coordinators: ['Rania Saleh', 'Mostafa Emad']},
    ],
  },
  TEC220: {
    name: 'Digital Skills for Seniors',
    partner: 'City Community Library',
    description: 'One-to-one sessions that help older adults use smartphones, video calls, online banking and e-government services safely.',
    history: [
      {year: '2025/26', supervisors: ['Dr. Khaled Mourad'], coordinators: ['Reem Atef', 'Ahmed Nabil']},
      {year: '2024/25', supervisors: ['Dr. Inas Farag'], coordinators: ['Mai Yehia', 'Bassem Hany']},
    ],
  },
};
const getProgram = code => PROGRAMS[code?.toUpperCase()] || {
  name: 'Program details not yet added',
  partner: '—',
  description: 'This program does not have a profile in the example directory.',
  history: [],
};
const isKnown = code => !!PROGRAMS[code?.trim().toUpperCase()];
const readRoute = () => {
  const match = window.location.hash.match(/^#\/programs\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const programHref = code => `#/programs/${encodeURIComponent(code.toUpperCase())}`;
const seed = [
  {id:'e1',programCode:'ENV110',hours:3,reflection:'Planting day was well organised and the team lead explained every step.',owner:'you',name:'You',date:'2026-10-11'},
  {id:'e2',programCode:'EDU210',hours:2,reflection:'If you prepare examples in advance the sessions run smoothly.',owner:'other',name:'Habiba',date:'2026-10-08'},
  {id:'e3',programCode:'HLT150',hours:6,reflection:'Long shift but very rewarding. Bring water and snacks.',owner:'other',name:'Omar',date:'2026-10-03'},
  {id:'e4',programCode:'COM305',hours:4,reflection:'Packing went quickly once roles were clear.',owner:'you',name:'You',date:'2026-09-29'},
  {id:'e5',programCode:'TEC220',hours:2,reflection:'Patience matters more than technical knowledge here.',owner:'other',name:'Lina',date:'2026-09-25'},
  {id:'e6',programCode:'ENV110',hours:5,reflection:'Recycling audit took longer than planned.',owner:'other',name:'Youssef',date:'2026-09-19'},
  {id:'e7',programCode:'EDU210',hours:3,reflection:'Students asked great questions about recursion.',owner:'other',name:'Mariam',date:'2026-09-12'},
  {id:'e8',programCode:'HLT150',hours:8,reflection:'',owner:'other',name:'Ali',date:'2026-09-05'},
  {id:'e9',programCode:'COM305',hours:1,reflection:'Short orientation session only.',owner:'other',name:'Nour',date:'2026-08-28'},
  {id:'e10',programCode:'ENV110',hours:2,reflection:'Good for a first volunteering experience.',owner:'other',name:'Farah',date:'2026-08-20'},
];
function loadEntries(){try{const s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}

const HOURS = [1,2,3,4,5,6,7,8];
const meanHours = a => a.length?(a.reduce((s,e)=>s+e.hours,0)/a.length).toFixed(1):'—';
const sumHours = a => a.reduce((s,e)=>s+e.hours,0);
const plural = (n,word) => `${n} ${word}${n===1?'':'s'}`;
const byNewest = (a,b) => (b.date||'').localeCompare(a.date||'');
const fmtDate = d => {const t=new Date(`${d}T00:00:00`);return isNaN(t)?d:t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
const sameCode = (a,b) => a.trim().toUpperCase()===b.trim().toUpperCase();

function HoursMeter({hours}){
 return <span className="hours" title={`${plural(hours,'hour')} out of a maximum of 8`}>
  <b>{hours} h</b>
  <span className="meter" aria-hidden="true">{HOURS.map(h=><i key={h} className={h<=hours?'on':''}/>)}</span>
 </span>;
}

function EntryItem({e,onEdit,showProgram=true}){
 const mine = e.owner==='you';
 return <li className={`entry${mine?' mine':''}`}>
  <div className="entry-head">
   {showProgram
    ? <a className="program-link" href={programHref(e.programCode)}><span className="code">{e.programCode}</span><span>{isKnown(e.programCode)?getProgram(e.programCode).name:'Not in directory'}</span></a>
    : <span className="entry-name">{e.name}</span>}
   <HoursMeter hours={e.hours}/>
  </div>
  {e.reflection ? <blockquote>“{e.reflection}”</blockquote> : <p className="no-reflection">No reflection written.</p>}
  <div className="entry-foot">
   <span>{showProgram&&<><b>{e.name}</b> · </>}{fmtDate(e.date)}{mine&&<span className="badge">Your entry</span>}</span>
   {mine&&<button className="btn small" onClick={()=>onEdit(e)} aria-label={`Edit your ${e.programCode} entry`}>Edit</button>}
  </div>
 </li>;
}

function Stat({value,label}){return <div className="stat"><b>{value}</b><span>{label}</span></div>;}

export default function App(){
 const [entries,setEntries] = useState(loadEntries);
 const [query,setQuery] = useState('');
 const [hoursFilter,setHoursFilter] = useState('all');
 const [mineOnly,setMineOnly] = useState(false);
 const [lookup,setLookup] = useState('ENV110');
 const [form,setForm] = useState(null);
 const [errors,setErrors] = useState({});
 const [toast,setToast] = useState('');
 const [programCode,setProgramCode] = useState(readRoute);

 useEffect(()=>{
  const onHash = () => {setProgramCode(readRoute());window.scrollTo({top:0,behavior:'instant'});};
  window.addEventListener('hashchange',onHash);
  return ()=>window.removeEventListener('hashchange',onHash);
 },[]);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(entries)),[entries]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return ()=>clearTimeout(t);},[toast]);
 useEffect(()=>{
  if(!form)return;
  const onKey = e => {if(e.key==='Escape')setForm(null);};
  window.addEventListener('keydown',onKey);
  return ()=>window.removeEventListener('keydown',onKey);
 },[form]);

 const goHome = sectionId => {
  if(window.location.hash!=='#/'&&window.location.hash!=='')window.location.hash='#/';
  setProgramCode(null);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(sectionId)document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth',block:'start'});
   else window.scrollTo({top:0,behavior:'smooth'});
  }));
 };

 const sorted = useMemo(()=>[...entries].sort(byNewest),[entries]);
 const shown = useMemo(()=>sorted.filter(e=>
  (hoursFilter==='all'||e.hours===Number(hoursFilter)) &&
  (!mineOnly||e.owner==='you') &&
  `${e.programCode} ${e.reflection} ${e.name}`.toLowerCase().includes(query.trim().toLowerCase())
 ),[sorted,query,hoursFilter,mineOnly]);
 const filtersActive = query.trim()||hoursFilter!=='all'||mineOnly;
 const clearFilters = () => {setQuery('');setHoursFilter('all');setMineOnly(false);};

 const looked = entries.filter(e=>lookup.trim()&&sameCode(e.programCode,lookup));
 const programsLogged = [...new Set(entries.map(e=>e.programCode))];
 const spread = HOURS.map(h=>({h,count:entries.filter(e=>e.hours===h).length}));
 const peak = Math.max(...spread.map(s=>s.count),1);

 const programs = useMemo(()=>{
  const codes=[...new Set([...Object.keys(PROGRAMS),...entries.map(e=>e.programCode.toUpperCase())])];
  return codes.map(code=>{
   const list=entries.filter(e=>e.programCode.toUpperCase()===code);
   const hrs=list.map(e=>e.hours);
   return {code,info:getProgram(code),known:!!PROGRAMS[code],list,
    min:hrs.length?Math.min(...hrs):null,max:hrs.length?Math.max(...hrs):null,
    quote:[...list].filter(e=>e.reflection).sort(byNewest)[0],
    mine:list.find(e=>e.owner==='you')};
  });
 },[entries]);

 const ownEntryFor = (code,exceptId) => code.trim() ? entries.find(e=>e.id!==exceptId&&e.owner==='you'&&sameCode(e.programCode,code)) : undefined;

 function openForm(e,presetCode=''){
  if(e&&e.owner!=='you')return;
  setErrors({});
  setForm({id:e?.id||null,programCode:e?.programCode||presetCode,hours:e?String(e.hours):'',reflection:e?.reflection||''});
 }
 function save(ev){ev.preventDefault();
  const code=form.programCode.trim(), hrs=form.hours.trim(), errs={};
  if(!code)errs.programCode='Enter a program code, for example ENV110.';
  else if(ownEntryFor(code,form.id))errs.programCode=`You already logged hours for ${code.toUpperCase()}. You can log only one entry per program — edit your existing entry instead.`;
  if(!hrs)errs.hours='Enter how many hours you volunteered.';
  else if(!/^[1-8]$/.test(hrs))errs.hours='Hours must be a whole number from 1 to 8.';
  setErrors(errs);
  if(Object.keys(errs).length)return;
  const data={programCode:code.toUpperCase(),hours:Number(hrs),reflection:form.reflection.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
  const label=`${data.programCode}${isKnown(data.programCode)?` (${getProgram(data.programCode).name})`:''}`;
  if(form.id){setEntries(entries.map(e=>e.id===form.id?{...e,...data}:e));setToast(`Saved changes to your ${label} entry.`);}
  else{setEntries([{...data,id:'e-'+Date.now()},...entries]);setToast(`Logged ${plural(data.hours,'hour')} for ${label}.`);}
  setForm(null);
 }
 function resetAll(){
  if(!window.confirm('Reset all data? Every entry you added or edited will be replaced by the original example records.'))return;
  setEntries(seed);clearFilters();setLookup('ENV110');setForm(null);setToast('Data reset to the example records.');
 }
 async function copyLink(){
  try{await navigator.clipboard.writeText(window.location.href);setToast('Link to this program copied.');}
  catch{setToast(`Copy this link to share: ${window.location.href}`);}
 }

 const formDup = form && ownEntryFor(form.programCode,form.id);
 const formCode = form?.programCode.trim().toUpperCase();

 return <div className="hub">
  <a className="skip" href="#main">Skip to content</a>
  <nav className="topbar" aria-label="Main">
   <button className="brand" onClick={()=>goHome()}><span className="brand-mark" aria-hidden="true">◆</span>service<b>hub</b></button>
   <div className="nav-links">
    <button onClick={()=>goHome('programs')}>Programs</button>
    <button onClick={()=>goHome('entries')}>All entries</button>
    <button onClick={()=>{setMineOnly(true);setQuery('');setHoursFilter('all');goHome('entries');}}>My entries</button>
   </div>
   <button className="btn primary" onClick={()=>openForm(null,programCode&&!ownEntryFor(programCode)?programCode:'')}>+ Log hours</button>
  </nav>

  {toast&&<div className="toast" role="status"><span>✓ {toast}</span><button onClick={()=>setToast('')} aria-label="Dismiss message">×</button></div>}

  <main className="page" id="main">{programCode ? (() => {
   const info=getProgram(programCode), list=entries.filter(e=>e.programCode.toUpperCase()===programCode).sort(byNewest), mine=list.find(e=>e.owner==='you');
   const years=['2025/26','2024/25'].map(y=>info.history.find(h=>h.year===y)||{year:y,supervisors:[],coordinators:[]});
   return <article className="program-page">
    <div className="crumbs"><button className="link" onClick={()=>goHome('programs')}>← All programs</button><button className="btn small" onClick={copyLink}>Copy shareable link</button></div>
    <header className="program-hero">
     <div className="program-hero-text">
      <span className="tag">{programCode}</span>
      <h1>{info.name}</h1>
      <p>Partner: {info.partner}</p>
     </div>
     <div className="hero-side">
      <div className="hero-stats">
       <Stat value={list.length?`${meanHours(list)} h`:'—'} label="avg. per entry"/>
       <Stat value={list.length} label={list.length===1?'entry':'entries'}/>
       <Stat value={`${sumHours(list)} h`} label="total logged"/>
      </div>
      {mine
       ? <button className="btn light" onClick={()=>openForm(mine)}>Edit your entry ({mine.hours} h)</button>
       : <button className="btn accent" onClick={()=>openForm(null,programCode)}>+ Log hours for this program</button>}
     </div>
    </header>

    <div className="program-grid">
     <section className="card">
      <h2>About this program</h2>
      <p className="lead">{info.description}</p>
      <dl className="facts"><dt>Partner organisation</dt><dd>{info.partner}</dd><dt>Program code</dt><dd>{programCode}</dd></dl>
     </section>
     <section className="card">
      <h2>Program team</h2>
      <p className="muted">Faculty supervisors and student coordinators by academic year.</p>
      {info.history.length ? <div className="team-grid">{years.map(h=><div className="team-year" key={h.year}>
       <h3>{h.year}{h.year==='2025/26'&&<span className="badge">Current</span>}</h3>
       <span className="label">Faculty supervisor{h.supervisors.length===1?'':'s'}</span><p>{h.supervisors.join(', ')||'—'}</p>
       <span className="label">Student coordinators</span><p>{h.coordinators.join(', ')||'—'}</p>
      </div>)}</div> : <p className="empty">No team records for this program yet.</p>}
      <p className="fine-print">Illustrative program and staff records; all names are fictional.</p>
     </section>
    </div>

    <section className="card">
     <div className="card-head"><div><h2>What volunteers said</h2><p className="muted">{list.length?`${plural(list.length,'entry')} · ${Math.min(...list.map(e=>e.hours))}–${Math.max(...list.map(e=>e.hours))} hours per entry`:'Hours and reflections logged for this program'}</p></div></div>
     {list.length ? <ul className="entry-list">{list.map(e=><EntryItem key={e.id} e={e} onEdit={openForm} showProgram={false}/>)}</ul>
      : <p className="empty">No one has logged hours for this program yet.</p>}
    </section>
   </article>;
  })() : <>
   <header className="intro">
    <div>
     <h1>Community service hours</h1>
     <p>Compare programs, see how much time other volunteers spent and what they said, then log your own hours.</p>
    </div>
    <ol className="steps" aria-label="How it works">
     <li><button onClick={()=>goHome('programs')}><b>1</b>Pick a program</button></li>
     <li><button onClick={()=>goHome('entries')}><b>2</b>Read reflections</button></li>
     <li><button onClick={()=>openForm(null)}><b>3</b>Log your hours</button></li>
    </ol>
   </header>

   <section className="kpis" aria-label="Overview">
    <div className="kpi"><span>Total entries</span><b>{entries.length}</b></div>
    <div className="kpi"><span>Average hours per entry</span><b>{meanHours(entries)}</b></div>
    <div className="kpi"><span>Programs with activity</span><b>{programsLogged.length}</b></div>
    <div className="kpi"><span>Total hours logged</span><b>{sumHours(entries)}</b></div>
   </section>

   <section id="programs" className="section">
    <div className="section-head"><div><h2>Programs</h2><p className="muted">Average effort per volunteer and the latest reflection. Open a program for its team and all entries.</p></div></div>
    <div className="program-cards">{programs.map(p=><a key={p.code} className="program-card" href={programHref(p.code)}>
     <div className="pc-top"><span className="code">{p.code}</span>{p.mine&&<span className="badge">You logged {p.mine.hours} h</span>}</div>
     <h3>{p.info.name}</h3>
     <p className="pc-partner">{p.info.partner}</p>
     <div className="pc-stats">
      <div><b>{p.list.length?`${meanHours(p.list)} h`:'—'}</b><span>avg. per entry</span></div>
      <div><b>{p.list.length?(p.min===p.max?`${p.min} h`:`${p.min}–${p.max} h`):'—'}</b><span>range</span></div>
      <div><b>{p.list.length}</b><span>{p.list.length===1?'entry':'entries'}</span></div>
     </div>
     {p.quote ? <blockquote>“{p.quote.reflection}” <cite>— {p.quote.name}</cite></blockquote> : <p className="no-reflection">No reflections yet.</p>}
     <span className="pc-cta">View program details →</span>
    </a>)}</div>
   </section>

   <div className="dash-grid">
    <section className="card">
     <div className="card-head"><div><h2>Hours distribution</h2><p className="muted">Number of entries by hours logged (1–8). Select a bar to filter the entries.</p></div></div>
     <div className="bars" role="list">{spread.map(s=><button role="listitem" key={s.h} className={`bar${hoursFilter===String(s.h)?' on':''}`} onClick={()=>{setHoursFilter(String(s.h));goHome('entries');}} aria-label={`${plural(s.count,'entry')} with ${plural(s.h,'hour')}`}>
      <span className="bar-count">{s.count}</span>
      <span className="bar-track"><i style={{height:`${s.count/peak*100}%`}}/></span>
      <span className="bar-label">{s.h} h</span>
     </button>)}</div>
    </section>

    <section className="card lookup">
     <h2>Program check</h2>
     <p className="muted">Enter any program code to see its numbers.</p>
     <label className="field"><span>Program code</span>
      <input value={lookup} onChange={e=>setLookup(e.target.value)} placeholder="e.g. ENV110" list="program-codes" autoComplete="off"/>
     </label>
     {lookup.trim() ? <>
      <p className="lookup-name">{isKnown(lookup)?getProgram(lookup).name:'Not in the program directory'}</p>
      <div className="lookup-result">
       <Stat value={meanHours(looked)} label="avg. hours / entry"/>
       <Stat value={looked.length} label="entries"/>
       <Stat value={sumHours(looked)} label="total hours"/>
      </div>
      <a className="btn block" href={programHref(lookup.trim())}>Open {lookup.trim().toUpperCase()} program page →</a>
     </> : <p className="empty">Type a code to see results.</p>}
    </section>
   </div>

   <section className="card" id="entries">
    <div className="card-head"><div><h2>{mineOnly?'My entries':'All entries'}</h2><p className="muted" aria-live="polite">Showing {shown.length} of {plural(entries.length,'entry')}, newest first</p></div></div>
    <div className="filters">
     <label className="field grow"><span>Search</span>
      <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Program code, reflection or volunteer name"/>
     </label>
     <label className="field"><span>Hours</span>
      <select value={hoursFilter} onChange={e=>setHoursFilter(e.target.value)}>
       <option value="all">Any number</option>{HOURS.map(h=><option key={h} value={h}>{plural(h,'hour')}</option>)}
      </select>
     </label>
     <label className="check"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/>Only my entries</label>
     {filtersActive&&<button className="link" onClick={clearFilters}>Clear filters</button>}
    </div>
    {shown.length ? <ul className="entry-list">{shown.map(e=><EntryItem key={e.id} e={e} onEdit={openForm}/>)}</ul>
     : <div className="empty">No entries match these filters. {filtersActive&&<button className="link" onClick={clearFilters}>Clear filters</button>}</div>}
   </section>

   <footer className="foot">
    <p>Data is saved in this browser only. Programs, staff and partners are fictional sample data.</p>
    <button className="btn danger" onClick={resetAll}>Reset data</button>
   </footer>
  </>}
  </main>

  <datalist id="program-codes">{Object.entries(PROGRAMS).map(([c,p])=><option key={c} value={c}>{p.name}</option>)}</datalist>

  {form&&<div className="scrim" onMouseDown={e=>e.target===e.currentTarget&&setForm(null)}>
   <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="form-title">
    <div className="drawer-head"><h2 id="form-title">{form.id?'Edit your entry':'Log volunteering hours'}</h2><button onClick={()=>setForm(null)} aria-label="Close">×</button></div>
    <p className="muted">You can log one entry per program. You can edit it later.</p>
    <form onSubmit={save} noValidate>
     <label className="field"><span>Program code <em>required</em></span>
      <input value={form.programCode} autoFocus={!form.programCode} list="program-codes" autoComplete="off" aria-invalid={!!errors.programCode} aria-describedby="code-hint"
       onChange={e=>{const v=e.target.value;setForm(d=>({...d,programCode:v}));setErrors(x=>({...x,programCode:''}));}} placeholder="e.g. TEC220"/>
      <small id="code-hint" className={errors.programCode?'error':'hint'}>
       {errors.programCode || (formCode ? (isKnown(formCode)?`✓ ${getProgram(formCode).name} · ${getProgram(formCode).partner}`:'Not in the program directory — you can still log it.') : 'Choose from the list or type a code.')}
      </small>
     </label>
     {formDup&&<div className="notice">You already logged {formDup.hours} h for {formDup.programCode}. <button type="button" className="link" onClick={()=>openForm(formDup)}>Edit that entry instead</button></div>}
     <label className="field"><span>Hours <em>required</em></span>
      <input type="number" inputMode="numeric" min="1" max="8" step="1" value={form.hours} autoFocus={!!form.programCode} aria-invalid={!!errors.hours} aria-describedby="hours-hint"
       onChange={e=>{const v=e.target.value;setForm(d=>({...d,hours:v}));setErrors(x=>({...x,hours:''}));}} placeholder="1–8" className="hours-input"/>
      <small id="hours-hint" className={errors.hours?'error':'hint'}>{errors.hours||'Whole number from 1 to 8.'}</small>
     </label>
     <label className="field"><span>Reflection <em className="opt">optional</em></span>
      <textarea value={form.reflection} rows={5} onChange={e=>setForm(d=>({...d,reflection:e.target.value}))} placeholder="What did you do? Any tips for future volunteers?"/>
     </label>
     <div className="drawer-actions">
      <button type="submit" className="btn primary">{form.id?'Save changes':'Log hours'}</button>
      <button type="button" className="btn" onClick={()=>setForm(null)}>Cancel</button>
     </div>
    </form>
   </aside>
  </div>}
 </div>;
}
