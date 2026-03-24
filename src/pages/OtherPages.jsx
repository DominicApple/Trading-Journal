import { useState } from "react";
import { PageHeader, EmptyState, Logo } from "../components/Shared";
import { uid, today, MONTHS } from "../utils";
import { CHANGELOG } from "../changelog";

// ══════════════════════════════════════
// WEEKLY PROJECTIONS
// ══════════════════════════════════════
export function WeeklyProjectionPage({ projections, setProjections, onHome, onBack, logoEmoji, logoG1, logoG2 }) {
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [sortMonth, setSortMonth] = useState("all");
  const [sortYear, setSortYear] = useState("all");

  const years = [...new Set(projections.map(p=>new Date(p.date).getFullYear()))].sort((a,b)=>b-a);
  const filtered = projections
    .filter(p=>{
      const d=new Date(p.date);
      if(sortYear!=="all"&&d.getFullYear()!==parseInt(sortYear)) return false;
      if(sortMonth!=="all"&&d.getMonth()!==parseInt(sortMonth)) return false;
      return true;
    })
    .sort((a,b)=>b.date.localeCompare(a.date));

  const add = ()=>{
    if(!newTitle.trim()) return;
    const p={id:uid(),date:today(),title:newTitle.trim(),content:""};
    setProjections(prev=>[...prev,p]); setSelected(p); setShowNew(false); setNewTitle("");
  };
  const updateContent=(id,content)=>{
    setProjections(prev=>prev.map(p=>p.id===id?{...p,content}:p));
    if(selected?.id===id) setSelected(p=>({...p,content}));
  };

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title="Weekly Projections" onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}>
        <select value={sortMonth} onChange={e=>setSortMonth(e.target.value)} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:6,padding:"5px 10px",color:"var(--t1)",fontSize:11,fontFamily:"var(--mono)",outline:"none"}}>
          <option value="all">All Months</option>
          {MONTHS.map((m,i)=><option key={m} value={i}>{m}</option>)}
        </select>
        {years.length>0&&(
          <select value={sortYear} onChange={e=>setSortYear(e.target.value)} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:6,padding:"5px 10px",color:"var(--t1)",fontSize:11,fontFamily:"var(--mono)",outline:"none"}}>
            <option value="all">All Years</option>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button onClick={()=>setShowNew(true)} style={{padding:"7px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ New</button>
      </PageHeader>
      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",height:"calc(100vh - 51px)"}}>
        <div style={{borderRight:"1px solid var(--bord)",overflowY:"auto",padding:12}}>
          {showNew&&(
            <div style={{marginBottom:12}}>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Week title..." autoFocus onKeyDown={e=>e.key==="Enter"&&add()}
                style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--a1)",borderRadius:6,padding:"8px 12px",color:"var(--t1)",fontSize:12,fontFamily:"var(--mono)",outline:"none",boxSizing:"border-box",marginBottom:6}}/>
              <div style={{display:"flex",gap:6}}>
                <button onClick={add} style={{flex:1,padding:6,borderRadius:6,border:"none",background:"var(--a1)",color:"#fff",fontSize:11,cursor:"pointer"}}>Add</button>
                <button onClick={()=>setShowNew(false)} style={{flex:1,padding:6,borderRadius:6,border:"1px solid var(--bord)",background:"transparent",color:"var(--t2)",fontSize:11,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}
          {filtered.map(p=>(
            <div key={p.id} onClick={()=>setSelected(p)} style={{padding:"10px 14px",borderRadius:8,marginBottom:3,cursor:"pointer",background:selected?.id===p.id?"rgba(59,130,246,0.08)":"transparent",borderLeft:selected?.id===p.id?"2px solid var(--a1)":"2px solid transparent"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{p.title}</div>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>{p.date}</div>
            </div>
          ))}
          {!filtered.length&&!showNew&&<EmptyState icon="🔮" title="No projections" subtitle="Plan your week ahead"/>}
        </div>
        <div style={{overflowY:"auto",padding:24}}>
          {selected?(
            <div style={{animation:"fadeIn 0.2s"}}>
              <div style={{fontSize:20,fontWeight:700,color:"var(--t1)",marginBottom:4,fontFamily:"var(--display)"}}>{selected.title}</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:18}}>{selected.date}</div>
              <textarea value={selected.content} onChange={e=>updateContent(selected.id,e.target.value)} placeholder="Write your projections for the upcoming week..."
                style={{width:"100%",minHeight:420,background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:10,padding:20,color:"var(--t1)",fontSize:14,lineHeight:1.7,fontFamily:"var(--body)",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
          ):<EmptyState icon="📝" title="Select a projection" subtitle="Choose from the sidebar or create a new one"/>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// TRADE SYSTEM
// ══════════════════════════════════════
export function TradeSystemPage({ content, setContent, onHome, onBack, logoEmoji, logoG1, logoG2 }) {
  const sections = [
    {id:"model",        title:"Entry Model",          icon:"🎯", placeholder:"Describe your entry model..."},
    {id:"rules",        title:"Trading Rules",         icon:"📏", placeholder:"List your trading rules..."},
    {id:"confluences",  title:"Confluence Checklist",  icon:"✅", placeholder:"What confluences must be present?"},
    {id:"psychology",   title:"Psychology & Mindset",  icon:"🧠", placeholder:"How do you manage emotions?"},
    {id:"risk",         title:"Risk Management",       icon:"🛡️", placeholder:"Define your risk parameters..."},
  ];
  const parsed = (()=>{ try{return JSON.parse(content)||{};}catch{return{};} })();
  const updateSection=(id,text)=>setContent(JSON.stringify({...parsed,[id]:text}));

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title="Trade System" onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}/>
      <div style={{padding:24,maxWidth:800,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,rgba(0,212,255,0.04),rgba(124,58,237,0.04))",border:"1px solid rgba(0,212,255,0.1)",borderRadius:14,padding:"20px 24px",marginBottom:24}}>
          <div style={{fontSize:16,fontWeight:700,fontFamily:"var(--display)",marginBottom:4,background:"linear-gradient(135deg,#00d4ff,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Your Trading Playbook</div>
          <div style={{fontSize:12,color:"var(--t3)"}}>Define your complete system — entry model, rules, confluences, psychology, and risk management all in one place.</div>
        </div>
        {sections.map((sec,i)=>(
          <div key={sec.id} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"18px 20px",marginBottom:14,animation:`fadeIn 0.2s ease ${i*0.05}s both`}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:18}}>{sec.icon}</span>
              <span style={{fontSize:14,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)"}}>{sec.title}</span>
            </div>
            <textarea value={parsed[sec.id]||""} onChange={e=>updateSection(sec.id,e.target.value)} placeholder={sec.placeholder}
              style={{width:"100%",minHeight:120,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,padding:16,color:"var(--t1)",fontSize:13,lineHeight:1.7,fontFamily:"var(--body)",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════
function ChangelogModal({ onClose }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:16,padding:28,maxWidth:540,width:"90%",maxHeight:"80vh",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)"}}>What's New</div>
            <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>TradeLog release history</div>
          </div>
          <button onClick={onClose} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:8,color:"var(--t2)",padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>✕</button>
        </div>
        <div style={{overflowY:"auto",display:"flex",flexDirection:"column",gap:20}}>
          {CHANGELOG.map((entry,ei)=>(
            <div key={ei}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:13,fontWeight:700,fontFamily:"var(--mono)",color:"var(--a1)"}}>v{entry.version}</span>
                <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{entry.date}</span>
                {ei===0&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"linear-gradient(135deg,var(--a1),var(--a2))",color:"#fff"}}>LATEST</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {entry.changes.map((c,ci)=>(
                  <div key={ci} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"7px 12px",background:"var(--bg3)",borderRadius:8,border:"1px solid var(--bord)"}}>
                    <span style={{color:"var(--a1)",fontWeight:700,marginTop:1,fontSize:12}}>›</span>
                    <span style={{fontSize:12,color:"var(--t1)",lineHeight:1.5}}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeScreen({ accounts, allData, onAddAccount, onDeleteAccount, onSelectAccount, onOpenSettings, logoEmoji, logoG1, logoG2 }) {
  const [newId,   setNewId]   = useState("");
  const [newName, setNewName] = useState("");
  const [newBal,  setNewBal]  = useState("");
  const [showChangelog, setShowChangelog] = useState(false);

  const emptyData = { trades:[], projections:[], backtests:[], tradeCount:0, tradeSystem:"" };
  const handleAdd = ()=>{
    if(!newId.trim()||!newName.trim()) return;
    onAddAccount(newName.trim(),newId.trim(),parseFloat(newBal)||0);
    setNewId(""); setNewName(""); setNewBal("");
  };

  const inp = {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 14px",color:"#e5e7eb",fontSize:13,fontFamily:"var(--mono)",outline:"none",boxSizing:"border-box",width:"100%"};

  return (
    <div style={{minHeight:"100vh"}}>
      {showChangelog && <ChangelogModal onClose={()=>setShowChangelog(false)}/>}

      {/* ── HERO HEADER ── */}
      <div style={{height:170,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#050f07 0%,#07091a 40%,#07091a 60%,#0f0507 100%)"}}>

        {/* Bull & Bear Businessmen — filled illustrated style */}
        <svg width="100%" height="170" viewBox="0 0 1200 170" preserveAspectRatio="xMidYMid slice"
          style={{position:"absolute",inset:0,zIndex:0}}>
          <defs>
            <filter id="glowG" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glowR" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id="ambG" cx="22%" cy="55%" r="38%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="ambR" cx="78%" cy="55%" r="38%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.11"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="ambC" cx="50%" cy="50%" r="28%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.07"/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="fadeRt" x1="55%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#07091a" stopOpacity="0"/>
              <stop offset="100%" stopColor="#07091a" stopOpacity="0.72"/>
            </linearGradient>
            <linearGradient id="cuG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80"/>
              <stop offset="100%" stopColor="#16a34a"/>
            </linearGradient>
            <linearGradient id="cdR" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f87171"/>
              <stop offset="100%" stopColor="#b91c1c"/>
            </linearGradient>
            <linearGradient id="suitG" x1="25%" y1="0%" x2="75%" y2="100%">
              <stop offset="0%" stopColor="#0e2416"/>
              <stop offset="55%" stopColor="#07140e"/>
              <stop offset="100%" stopColor="#020a05"/>
            </linearGradient>
            <linearGradient id="suitR" x1="25%" y1="0%" x2="75%" y2="100%">
              <stop offset="0%" stopColor="#240e0e"/>
              <stop offset="55%" stopColor="#140707"/>
              <stop offset="100%" stopColor="#0a0202"/>
            </linearGradient>
            <radialGradient id="headG" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#163020"/>
              <stop offset="55%" stopColor="#0a1e12"/>
              <stop offset="100%" stopColor="#030c06"/>
            </radialGradient>
            <radialGradient id="headR" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#301616"/>
              <stop offset="55%" stopColor="#1e0a0a"/>
              <stop offset="100%" stopColor="#0c0303"/>
            </radialGradient>
            <linearGradient id="hornG" x1="0%" y1="100%" x2="85%" y2="0%">
              <stop offset="0%" stopColor="#166534"/>
              <stop offset="100%" stopColor="#4ade80"/>
            </linearGradient>
            <linearGradient id="hornR" x1="0%" y1="100%" x2="85%" y2="0%">
              <stop offset="0%" stopColor="#991b1b"/>
              <stop offset="100%" stopColor="#f87171"/>
            </linearGradient>
            <radialGradient id="snoutG" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#0f2818"/>
              <stop offset="100%" stopColor="#050f09"/>
            </radialGradient>
            <radialGradient id="snoutR" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#281010"/>
              <stop offset="100%" stopColor="#0f0505"/>
            </radialGradient>
          </defs>

          {/* Background glow */}
          <rect width="1200" height="170" fill="url(#ambG)"/>
          <rect width="1200" height="170" fill="url(#ambR)"/>
          <rect width="1200" height="170" fill="url(#ambC)"/>

          {/* Candlestick backdrop left (rising) */}
          {[[68,150,108,32],[98,144,100,30],[128,136,92,30],[158,128,84,30],[188,118,76,28]].map(([x,bot,top,h],i)=>(
            <g key={`cl${i}`} opacity="0.13">
              <line x1={x} y1={bot} x2={x} y2={top-6} stroke="#22c55e" strokeWidth="1"/>
              <rect x={x-5} y={top} width="10" height={h} fill="url(#cuG)" rx="1"/>
            </g>
          ))}
          {/* Candlestick backdrop right (falling) */}
          {[[1012,78,152,30],[1042,84,156,30],[1072,92,160,28],[1102,100,163,26],[1132,108,165,24]].map(([x,top,bot,h],i)=>(
            <g key={`cr${i}`} opacity="0.13">
              <line x1={x} y1={top-6} x2={x} y2={bot} stroke="#ef4444" strokeWidth="1"/>
              <rect x={x-5} y={top} width="10" height={h} fill="url(#cdR)" rx="1"/>
            </g>
          ))}
          {/* Center clash candles */}
          <line x1="556" y1="160" x2="556" y2="12" stroke="#22c55e" strokeWidth="1.5" opacity="0.22"/>
          <rect x="548" y="30" width="16" height="100" fill="url(#cuG)" opacity="0.18" rx="2"/>
          <line x1="644" y1="10" x2="644" y2="158" stroke="#ef4444" strokeWidth="1.5" opacity="0.22"/>
          <rect x="636" y="28" width="16" height="100" fill="url(#cdR)" opacity="0.18" rx="2"/>
          {/* Trend lines */}
          <path d="M68,138 Q180,105 305,78 Q405,58 490,54" stroke="#22c55e" strokeWidth="1.2" fill="none" opacity="0.16" strokeDasharray="5,5"/>
          <path d="M710,54 Q800,58 905,78 Q1010,100 1132,138" stroke="#ef4444" strokeWidth="1.2" fill="none" opacity="0.16" strokeDasharray="5,5"/>

          {/* ══ BULL BUSINESSMAN (cx≈291) ══ */}
          <g filter="url(#glowG)">
            {/* left sleeve */}
            <path d="M258,118 Q240,116 230,132 Q222,146 228,160" stroke="#040e06" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M258,118 Q240,116 230,132 Q222,146 228,160" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* suit jacket */}
            <path d="M258,108 Q244,103 236,116 L226,162 L356,162 L346,116 Q338,103 324,108 Q308,105 291,105 Q274,105 258,108 Z" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.8"/>
            <path d="M258,108 Q244,103 236,116 L238,162 L264,162 L264,122 Q262,114 258,108 Z" fill="#010804" opacity="0.45"/>
            <path d="M274,108 L280,148 L291,130 L302,148 L308,108" fill="#0b1e10" opacity="0.75"/>
            <path d="M272,108 L282,146 L291,128 Z" fill="#112818" stroke="#22c55e" strokeWidth="1.1"/>
            <path d="M310,108 L300,146 L291,128 Z" fill="#112818" stroke="#22c55e" strokeWidth="1.1"/>
            <path d="M287,112 L295,112 L293,120 L291,123 L289,120 Z" fill="#22c55e" opacity="0.8"/>
            <path d="M289,121 L293,121 L296,150 L291,157 L286,150 Z" fill="#22c55e" opacity="0.55"/>
            <path d="M250,120 L257,113 L263,122 L255,126 Z" fill="#22c55e" opacity="0.3"/>
            <circle cx="291" cy="158" r="2" fill="#22c55e" opacity="0.28"/>
            <circle cx="291" cy="148" r="2" fill="#22c55e" opacity="0.28"/>
            {/* right sleeve (raised) */}
            <path d="M324,116 Q342,108 352,94 Q360,80 354,68" stroke="#040e06" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M324,116 Q342,108 352,94 Q360,80 354,68" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* fists */}
            <ellipse cx="353" cy="66" rx="8" ry="7" fill="url(#headG)" stroke="#22c55e" strokeWidth="1.5"/>
            <line x1="347" y1="62" x2="359" y2="70" stroke="#22c55e" strokeWidth="1" opacity="0.38"/>
            <ellipse cx="228" cy="162" rx="8" ry="7" fill="url(#headG)" stroke="#22c55e" strokeWidth="1.5"/>
            {/* pen */}
            <line x1="214" y1="150" x2="228" y2="163" stroke="#22c55e" strokeWidth="1.8" opacity="0.7"/>
            <path d="M210,146 L215,143 L219,150 L215,153 Z" fill="#22c55e" opacity="0.6"/>
            {/* rising candle */}
            <line x1="353" y1="20" x2="353" y2="59" stroke="#22c55e" strokeWidth="1.5" opacity="0.75"/>
            <rect x="347" y="28" width="12" height="26" fill="url(#cuG)" opacity="0.92" rx="2"/>
            <path d="M353,18 L346,26 M353,18 L360,26" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
            {/* neck */}
            <rect x="280" y="104" width="22" height="14" rx="5" fill="url(#headG)" stroke="#22c55e" strokeWidth="1.4"/>
            {/* head */}
            <ellipse cx="291" cy="84" rx="34" ry="29" fill="url(#headG)" stroke="#22c55e" strokeWidth="2.2"/>
            {/* horns */}
            <path d="M271,70 C262,53 264,38 274,33 C280,29 288,36 285,52 L280,68 Z" fill="url(#hornG)" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M280,68 C283,54 284,40 278,35 C272,39 265,52 268,67 Z" fill="#166534" opacity="0.35"/>
            <path d="M311,70 C320,53 318,38 308,33 C302,29 294,36 297,52 L302,68 Z" fill="url(#hornG)" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M302,68 C299,54 298,40 304,35 C310,39 317,52 314,67 Z" fill="#166534" opacity="0.35"/>
            {/* eyes */}
            <ellipse cx="278" cy="82" rx="8" ry="7" fill="#06160a" stroke="#22c55e" strokeWidth="1.2"/>
            <ellipse cx="278" cy="82" rx="6" ry="5.5" fill="#22c55e" opacity="0.95"/>
            <circle cx="278" cy="82" r="3.2" fill="#010804"/>
            <circle cx="280" cy="80" r="1.4" fill="white" opacity="0.7"/>
            <path d="M270,74 Q278,70 285,74" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
            <ellipse cx="304" cy="82" rx="8" ry="7" fill="#06160a" stroke="#22c55e" strokeWidth="1.2"/>
            <ellipse cx="304" cy="82" rx="6" ry="5.5" fill="#22c55e" opacity="0.95"/>
            <circle cx="304" cy="82" r="3.2" fill="#010804"/>
            <circle cx="306" cy="80" r="1.4" fill="white" opacity="0.7"/>
            <path d="M297,74 Q304,70 312,74" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
            {/* snout */}
            <ellipse cx="291" cy="100" rx="17" ry="12" fill="url(#snoutG)" stroke="#22c55e" strokeWidth="1.8"/>
            <ellipse cx="291" cy="100" rx="12" ry="8" fill="#0a2010" opacity="0.55"/>
            <ellipse cx="283" cy="100" rx="3.5" ry="3" fill="#22c55e" opacity="0.38"/>
            <ellipse cx="299" cy="100" rx="3.5" ry="3" fill="#22c55e" opacity="0.38"/>
            <path d="M283,106 Q291,110 299,106" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.3"/>
            {/* journal */}
            <rect x="162" y="120" width="54" height="42" rx="4" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.6"/>
            <rect x="162" y="120" width="10" height="42" rx="3" fill="#010804" stroke="#22c55e" strokeWidth="1.6"/>
            <line x1="177" y1="130" x2="210" y2="130" stroke="#22c55e" strokeWidth="0.6" opacity="0.2"/>
            <line x1="177" y1="137" x2="210" y2="137" stroke="#22c55e" strokeWidth="0.6" opacity="0.2"/>
            <line x1="177" y1="144" x2="210" y2="144" stroke="#22c55e" strokeWidth="0.6" opacity="0.2"/>
            <polyline points="178,154 185,141 192,147 200,131 207,135 213,122" stroke="#22c55e" strokeWidth="1.6" fill="none" opacity="0.78" strokeLinejoin="round"/>
            <circle cx="213" cy="122" r="2.5" fill="#22c55e" opacity="0.88"/>
            {/* legs */}
            <rect x="248" y="158" width="18" height="12" rx="5" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.3"/>
            <rect x="270" y="158" width="18" height="12" rx="5" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.3"/>
            <rect x="294" y="158" width="18" height="12" rx="5" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.3"/>
            <rect x="316" y="158" width="18" height="12" rx="5" fill="url(#suitG)" stroke="#22c55e" strokeWidth="1.3"/>
            <text x="244" y="30" fontFamily="Impact,Arial Black,sans-serif" fontSize="15" fontWeight="900" fill="#22c55e" opacity="0.35" transform="skewX(-8)">BULL</text>
            <path d="M376,150 L376,114 L368,123 M376,114 L384,123" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
          </g>

          {/* ══ CENTER CLASH ══ */}
          <path d="M570,36 L591,76 L578,76 L600,130 L579,84 L593,84 Z" fill="#f59e0b" opacity="0.52"/>
          <line x1="552" y1="48" x2="536" y2="36" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.38"/>
          <line x1="616" y1="48" x2="632" y2="36" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.38"/>
          <line x1="546" y1="80" x2="526" y2="78" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.38"/>
          <line x1="622" y1="80" x2="642" y2="78" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.38"/>
          <text x="558" y="22" fontFamily="Impact,Arial Black,sans-serif" fontSize="20" fontWeight="900" fill="#f59e0b" opacity="0.18" transform="rotate(-4,573,22)">VS</text>

          {/* ══ BEAR BUSINESSMAN (cx≈951) ══ */}
          <g filter="url(#glowR)">
            {/* right sleeve */}
            <path d="M984,118 Q1002,116 1012,132 Q1020,146 1014,160" stroke="#0e0404" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M984,118 Q1002,116 1012,132 Q1020,146 1014,160" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* suit jacket */}
            <path d="M984,108 Q998,103 1006,116 L1016,162 L886,162 L896,116 Q904,103 918,108 Q934,105 951,105 Q968,105 984,108 Z" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.8"/>
            <path d="M984,108 Q998,103 1006,116 L1004,162 L978,162 L978,122 Q980,114 984,108 Z" fill="#060101" opacity="0.45"/>
            <path d="M968,108 L962,148 L951,130 L940,148 L934,108" fill="#1e0b0b" opacity="0.75"/>
            <path d="M970,108 L960,146 L951,128 Z" fill="#281212" stroke="#ef4444" strokeWidth="1.1"/>
            <path d="M932,108 L942,146 L951,128 Z" fill="#281212" stroke="#ef4444" strokeWidth="1.1"/>
            <path d="M947,112 L955,112 L953,120 L951,123 L949,120 Z" fill="#ef4444" opacity="0.8"/>
            <path d="M949,121 L953,121 L956,150 L951,157 L946,150 Z" fill="#ef4444" opacity="0.55"/>
            <path d="M1002,120 L995,113 L989,122 L997,126 Z" fill="#ef4444" opacity="0.3"/>
            <circle cx="951" cy="158" r="2" fill="#ef4444" opacity="0.28"/>
            <circle cx="951" cy="148" r="2" fill="#ef4444" opacity="0.28"/>
            {/* left sleeve (raised) */}
            <path d="M918,116 Q900,108 890,94 Q882,80 888,68" stroke="#0e0404" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M918,116 Q900,108 890,94 Q882,80 888,68" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* fists */}
            <ellipse cx="887" cy="66" rx="8" ry="7" fill="url(#headR)" stroke="#ef4444" strokeWidth="1.5"/>
            <line x1="881" y1="62" x2="893" y2="70" stroke="#ef4444" strokeWidth="1" opacity="0.38"/>
            <ellipse cx="1014" cy="162" rx="8" ry="7" fill="url(#headR)" stroke="#ef4444" strokeWidth="1.5"/>
            {/* pen */}
            <line x1="1026" y1="150" x2="1012" y2="163" stroke="#ef4444" strokeWidth="1.8" opacity="0.7"/>
            <path d="M1030,146 L1025,143 L1021,150 L1025,153 Z" fill="#ef4444" opacity="0.6"/>
            {/* falling candle */}
            <line x1="887" y1="20" x2="887" y2="59" stroke="#ef4444" strokeWidth="1.5" opacity="0.75"/>
            <rect x="881" y="28" width="12" height="26" fill="url(#cdR)" opacity="0.92" rx="2"/>
            <path d="M887,56 L880,48 M887,56 L894,48" stroke="#ef4444" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7"/>
            {/* neck */}
            <rect x="940" y="104" width="22" height="14" rx="5" fill="url(#headR)" stroke="#ef4444" strokeWidth="1.4"/>
            {/* head */}
            <ellipse cx="951" cy="84" rx="34" ry="29" fill="url(#headR)" stroke="#ef4444" strokeWidth="2.2"/>
            {/* ears */}
            <path d="M928,70 C918,52 922,36 934,32 C942,29 950,38 946,55 L940,68 Z" fill="url(#hornR)" stroke="#ef4444" strokeWidth="1.5"/>
            <ellipse cx="934" cy="50" rx="7" ry="9" fill="url(#headR)" stroke="#ef4444" strokeWidth="1.2" opacity="0.75"/>
            <path d="M974,70 C984,52 980,36 968,32 C960,29 952,38 956,55 L962,68 Z" fill="url(#hornR)" stroke="#ef4444" strokeWidth="1.5"/>
            <ellipse cx="968" cy="50" rx="7" ry="9" fill="url(#headR)" stroke="#ef4444" strokeWidth="1.2" opacity="0.75"/>
            {/* eyes */}
            <ellipse cx="938" cy="82" rx="8" ry="7" fill="#160606" stroke="#ef4444" strokeWidth="1.2"/>
            <ellipse cx="938" cy="82" rx="6" ry="5.5" fill="#ef4444" opacity="0.95"/>
            <circle cx="938" cy="82" r="3.2" fill="#060101"/>
            <circle cx="940" cy="80" r="1.4" fill="white" opacity="0.7"/>
            <path d="M930,74 Q938,69 945,73" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.65" transform="rotate(-7,938,73)"/>
            <ellipse cx="964" cy="82" rx="8" ry="7" fill="#160606" stroke="#ef4444" strokeWidth="1.2"/>
            <ellipse cx="964" cy="82" rx="6" ry="5.5" fill="#ef4444" opacity="0.95"/>
            <circle cx="964" cy="82" r="3.2" fill="#060101"/>
            <circle cx="966" cy="80" r="1.4" fill="white" opacity="0.7"/>
            <path d="M957,73 Q964,69 972,74" stroke="#ef4444" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.65" transform="rotate(7,964,73)"/>
            {/* snout */}
            <ellipse cx="951" cy="100" rx="18" ry="13" fill="url(#snoutR)" stroke="#ef4444" strokeWidth="1.8"/>
            <ellipse cx="951" cy="100" rx="13" ry="9" fill="#200808" opacity="0.55"/>
            <ellipse cx="943" cy="100" rx="3.5" ry="3" fill="#ef4444" opacity="0.38"/>
            <ellipse cx="959" cy="100" rx="3.5" ry="3" fill="#ef4444" opacity="0.38"/>
            <path d="M941,107 Q951,112 961,107" stroke="#ef4444" strokeWidth="1.2" fill="none" opacity="0.45"/>
            <rect x="945" y="107" width="5" height="5" fill="#ef4444" opacity="0.2" rx="1"/>
            <rect x="952" y="107" width="5" height="5" fill="#ef4444" opacity="0.2" rx="1"/>
            {/* journal */}
            <rect x="1028" y="120" width="54" height="42" rx="4" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.6"/>
            <rect x="1072" y="120" width="10" height="42" rx="3" fill="#060101" stroke="#ef4444" strokeWidth="1.6"/>
            <line x1="1033" y1="130" x2="1068" y2="130" stroke="#ef4444" strokeWidth="0.6" opacity="0.2"/>
            <line x1="1033" y1="137" x2="1068" y2="137" stroke="#ef4444" strokeWidth="0.6" opacity="0.2"/>
            <line x1="1033" y1="144" x2="1068" y2="144" stroke="#ef4444" strokeWidth="0.6" opacity="0.2"/>
            <polyline points="1033,122 1040,133 1047,128 1055,140 1062,135 1068,152" stroke="#ef4444" strokeWidth="1.6" fill="none" opacity="0.78" strokeLinejoin="round"/>
            <circle cx="1033" cy="122" r="2.5" fill="#ef4444" opacity="0.88"/>
            {/* legs */}
            <rect x="912" y="158" width="18" height="12" rx="5" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.3"/>
            <rect x="934" y="158" width="18" height="12" rx="5" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.3"/>
            <rect x="958" y="158" width="18" height="12" rx="5" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.3"/>
            <rect x="980" y="158" width="18" height="12" rx="5" fill="url(#suitR)" stroke="#ef4444" strokeWidth="1.3"/>
            <text x="958" y="30" fontFamily="Impact,Arial Black,sans-serif" fontSize="15" fontWeight="900" fill="#ef4444" opacity="0.35" transform="skewX(8)">BEAR</text>
            <path d="M836,114 L836,150 L828,142 M836,150 L844,142" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
          </g>

          {/* Labels */}
          <text x="72" y="48" fontFamily="Impact,sans-serif" fontSize="32" fill="#22c55e" opacity="0.07" transform="rotate(-18,72,48)">$</text>
          <text x="418" y="162" fontFamily="Impact,sans-serif" fontSize="11" fill="#22c55e" opacity="0.14" transform="rotate(-3,418,162)">LONG</text>
          <text x="730" y="162" fontFamily="Impact,sans-serif" fontSize="11" fill="#ef4444" opacity="0.14" transform="rotate(3,730,162)">SHORT</text>
          <text x="1130" y="48" fontFamily="Impact,sans-serif" fontSize="32" fill="#ef4444" opacity="0.07" transform="rotate(18,1130,48)">$</text>
          {/* Right fade — keeps button area clean */}
          <rect x="620" y="0" width="580" height="170" fill="url(#fadeRt)"/>
        </svg>

        {/* Bottom fade */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:50,background:"linear-gradient(transparent,var(--bg))",zIndex:1}}/>

        {/* Header content — z-index 2, always above SVG */}
        <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <Logo size={50} emoji={logoEmoji} g1={logoG1} g2={logoG2}/>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:"var(--display)",letterSpacing:"-0.02em"}}>TradeLog</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontFamily:"var(--mono)"}}>Personal Trading Journal</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer"
              style={{padding:"7px 16px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.15)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              📊 TradingView
            </a>
            <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer"
              style={{padding:"7px 16px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(245,158,11,0.12)";e.currentTarget.style.borderColor="rgba(245,158,11,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              📅 Forex Factory
            </a>
            <button onClick={()=>setShowChangelog(true)}
              style={{padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.15)";e.currentTarget.style.borderColor="rgba(139,92,246,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              📋 What's New
            </button>
            <button onClick={onOpenSettings}
              style={{padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.15)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              ⚙️ Settings
            </button>
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:"linear-gradient(transparent,var(--bg))"}}/>
      </div>

      {/* ── ACCOUNTS ── */}
      <div style={{padding:"24px 32px",maxWidth:900,margin:"0 auto"}}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--mono)",marginBottom:14}}>
            Your Accounts {accounts.length>0&&`(${accounts.length})`}
          </div>
          {accounts.length>0?(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {accounts.map(acc=>{
                const d=allData[acc.id]||emptyData;
                const pnl=d.trades.reduce((s,t)=>s+t.pnl,0);
                const balance=(acc.startBalance||0)+pnl;
                const wins=d.trades.filter(t=>t.result==="win").length;
                const losses=d.trades.filter(t=>t.result==="loss").length;
                return (
                  <div key={acc.id} onClick={()=>onSelectAccount(acc.id)}
                    style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:14,padding:"20px 22px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.2)";e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.borderColor="var(--bord)";e.currentTarget.style.transform="translateY(0)";}}>
                    <button onClick={e=>{e.stopPropagation();onDeleteAccount(acc.id);}}
                      style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"var(--t3)",fontSize:14,cursor:"pointer",padding:"2px 4px",borderRadius:4}}
                      onMouseEnter={e=>e.currentTarget.style.color="#ef4444"}
                      onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}>✕</button>
                    <div style={{fontSize:14,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)",marginBottom:2}}>{acc.name}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:14}}>ID: {acc.id}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:3}}>BALANCE</div>
                        <div style={{fontSize:20,fontWeight:700,color:"var(--t1)",fontFamily:"var(--mono)"}}>${balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:3}}>P&L</div>
                        <div style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:pnl>=0?"#22c55e":"#ef4444"}}>{pnl>=0?"+":""}${Math.abs(pnl).toFixed(2)}</div>
                      </div>
                    </div>
                    {d.trades.length>0&&(
                      <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--bord)",display:"flex",gap:12,fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>
                        <span>{d.trades.length} trades</span>
                        <span style={{color:"#22c55e"}}>{wins}W</span>
                        <span style={{color:"#ef4444"}}>{losses}L</span>
                      </div>
                    )}
                    <div style={{marginTop:10,fontSize:11,color:"var(--a1)",fontWeight:600,fontFamily:"var(--mono)"}}>Open Journal →</div>
                  </div>
                );
              })}
            </div>
          ):(
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--t3)",fontSize:13}}>No accounts yet. Add one below to get started.</div>
          )}
        </div>

        {/* Add Account */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:14,padding:"22px 24px"}}>
          <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--mono)",marginBottom:14}}>Add Account</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
            <div>
              <label style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",display:"block",marginBottom:4}}>ACCOUNT ID</label>
              <input value={newId} onChange={e=>setNewId(e.target.value)} placeholder="FT4X8K2M" style={inp} onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",display:"block",marginBottom:4}}>ACCOUNT NAME</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="FTMO 100k" style={inp} onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",display:"block",marginBottom:4}}>STARTING BALANCE</label>
              <input type="number" value={newBal} onChange={e=>setNewBal(e.target.value)} placeholder="100000" style={inp} onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
            </div>
            <button onClick={handleAdd}
              style={{padding:"10px 22px",borderRadius:8,border:"none",background:newId.trim()&&newName.trim()?`linear-gradient(135deg,var(--a1),var(--a2))`:"var(--bg3)",color:newId.trim()&&newName.trim()?"#fff":"var(--t3)",fontSize:13,fontWeight:600,cursor:newId.trim()&&newName.trim()?"pointer":"default",fontFamily:"var(--display)",whiteSpace:"nowrap",height:42}}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
