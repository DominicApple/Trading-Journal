import { useState } from "react";
import { PageHeader, EmptyState, Logo } from "../components/Shared";
import { uid, today, MONTHS } from "../utils";

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
// HOME SCREEN (Account Overview)
// ══════════════════════════════════════
export function HomeScreen({ accounts, allData, onAddAccount, onDeleteAccount, onSelectAccount, logoEmoji, logoG1, logoG2 }) {
  const [newId,   setNewId]   = useState("");
  const [newName, setNewName] = useState("");
  const [newBal,  setNewBal]  = useState("");

  const emptyData = { trades:[], projections:[], backtests:[], tradeCount:0, tradeSystem:"" };
  const handleAdd = ()=>{
    if(!newId.trim()||!newName.trim()) return;
    onAddAccount(newName.trim(),newId.trim(),parseFloat(newBal)||0);
    setNewId(""); setNewName(""); setNewBal("");
  };

  const inp = {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"10px 14px",color:"#e5e7eb",fontSize:13,fontFamily:"var(--mono)",outline:"none",boxSizing:"border-box",width:"100%"};

  return (
    <div style={{minHeight:"100vh"}}>
      {/* Hero */}
      <div style={{height:170,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 80%,#0f172a 100%)"}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:0.1}}>
          {Array.from({length:24},(_,i)=>{const x=20+i*42;const bull=i%3!==0;const h=18+Math.sin(i*0.7)*35+25;const y=85-h/2;return(<g key={i}><line x1={x+8} y1={y-15} x2={x+8} y2={y+h+15} stroke={bull?"#22c55e":"#ef4444"} strokeWidth="1"/><rect x={x} y={y} width="16" height={h} rx="2" fill={bull?"#22c55e":"#ef4444"} opacity="0.7"/></g>);})}
        </svg>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
        <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <Logo size={50} emoji={logoEmoji} g1={logoG1} g2={logoG2}/>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:"var(--display)",letterSpacing:"-0.02em"}}>TradeLog</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontFamily:"var(--mono)"}}>Personal Trading Journal</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer" style={{padding:"7px 16px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.15)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              📊 TradingView
            </a>
            <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" style={{padding:"7px 16px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e5e7eb",fontSize:12,fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:6}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(245,158,11,0.12)";e.currentTarget.style.borderColor="rgba(245,158,11,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}>
              📅 Forex Factory
            </a>
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:"linear-gradient(transparent,var(--bg))"}}/>
      </div>

      <div style={{padding:"24px 32px",maxWidth:900,margin:"0 auto"}}>
        {/* Account Cards */}
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
                  <div key={acc.id} onClick={()=>onSelectAccount(acc.id)} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:14,padding:"20px 22px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.2)";e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.borderColor="var(--bord)";e.currentTarget.style.transform="translateY(0)";}}
                  >
                    <button onClick={e=>{e.stopPropagation();onDeleteAccount(acc.id);}} style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"var(--t3)",fontSize:14,cursor:"pointer",padding:"2px 4px",borderRadius:4}}
                      onMouseEnter={e=>{e.currentTarget.style.color="#ef4444";}} onMouseLeave={e=>{e.currentTarget.style.color="var(--t3)";}}>✕</button>
                    <div style={{fontSize:14,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)",marginBottom:2}}>{acc.name}</div>
                    <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:14}}>ID: {acc.id}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:3}}>BALANCE</div>
                        <div style={{fontSize:20,fontWeight:700,color:"var(--t1)",fontFamily:"var(--mono)"}}>${balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:3}}>P&L</div>
                        <div style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:pnl>=0?"#22c55e":"#ef4444"}}>{pnl>=0?"+":""}{pnl>=0?"":""}${Math.abs(pnl).toFixed(2)}</div>
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
            <button onClick={handleAdd} style={{padding:"10px 22px",borderRadius:8,border:"none",background:newId.trim()&&newName.trim()?`linear-gradient(135deg,var(--a1),var(--a2))`:"var(--bg3)",color:newId.trim()&&newName.trim()?"#fff":"var(--t3)",fontSize:13,fontWeight:600,cursor:newId.trim()&&newName.trim()?"pointer":"default",fontFamily:"var(--display)",whiteSpace:"nowrap",height:42}}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
