import { useState, useMemo } from "react";
import { PageHeader, EmptyState } from "../components/Shared";
import { TradeCard, TradeForm } from "../components/TradeForm";
import { fmt, mkKey, keyLabel, MONTHS, PAIRS } from "../utils";

// ── Creative Card Suit Filter ──
const SUITS = [
  { id:"all",     label:"All",    sym:"✦",   color:"var(--t2)",   glow:"transparent",              desc:"All trades" },
  { id:"wins",    label:"Wins",   sym:"♥",   color:"#d4af37",     glow:"rgba(212,175,55,0.15)",    desc:"Hearts" },
  { id:"losses",  label:"Losses", sym:"🃏",   color:"#ef4444",     glow:"rgba(239,68,68,0.15)",     desc:"Joker" },
  { id:"long",    label:"Long",   sym:"♦",   color:"#d4af37",     glow:"rgba(212,175,55,0.15)",    desc:"Diamonds" },
  { id:"short",   label:"Short",  sym:"♠",   color:"#dc2626",     glow:"rgba(220,38,38,0.15)",     desc:"Spades" },
  { id:"pair",    label:"Pair",   sym:"♣",   color:"#d4af37",     glow:"rgba(212,175,55,0.15)",    desc:"Clubs" },
];

function SuitFilter({ active, onSelect, pairFilter, onPairFilter, availPairs }) {
  return (
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
      {SUITS.map(s=>(
        <button key={s.id} onClick={()=>onSelect(s.id)} title={s.desc} style={{
          padding:"6px 14px", borderRadius:10,
          border:`1px solid ${active===s.id?s.color:"var(--bord)"}`,
          background: active===s.id ? s.glow : "transparent",
          cursor:"pointer", display:"flex", alignItems:"center", gap:6,
          transition:"all 0.15s",
          boxShadow: active===s.id ? `0 0 12px ${s.glow}` : "none",
        }}>
          <span style={{
            fontSize:16, lineHeight:1,
            background: s.id!=="all" ? `linear-gradient(135deg,${s.color},${s.id==="losses"||s.id==="short"?"#991b1b":"#92711a"})` : "none",
            WebkitBackgroundClip: s.id!=="all" ? "text" : "none",
            WebkitTextFillColor: s.id!=="all" ? "transparent" : s.color,
            backgroundClip: s.id!=="all" ? "text" : "none",
            filter: active===s.id ? `drop-shadow(0 0 4px ${s.color})` : "none",
            fontWeight:900,
          }}>{s.sym}</span>
          <span style={{fontSize:11,fontFamily:"var(--mono)",color:active===s.id?s.color:"var(--t3)",fontWeight:active===s.id?700:400}}>{s.label}</span>
        </button>
      ))}
      {active==="pair" && (
        <select value={pairFilter} onChange={e=>onPairFilter(e.target.value)}
          style={{padding:"6px 12px",borderRadius:8,border:"1px solid var(--bord)",background:"var(--bg2)",color:"var(--t1)",fontSize:11,fontFamily:"var(--mono)",outline:"none",cursor:"pointer"}}>
          <option value="all">All Pairs</option>
          {availPairs.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      )}
    </div>
  );
}

// ── Month Deck ──
function MonthDeck({ monthKey, trades, onSelectTrade, isOpen, onToggle }) {
  const label = keyLabel(monthKey);
  const wins = trades.filter(t=>t.result==="win");
  const losses = trades.filter(t=>t.result==="loss");
  const totalPnl = trades.reduce((s,t)=>s+t.pnl,0);
  const longs = trades.filter(t=>t.direction==="LONG").length;
  const shorts = trades.filter(t=>t.direction==="SHORT").length;
  const bestDir = longs>=shorts ? "LONG" : "SHORT";
  const pairs = [...new Set(trades.map(t=>t.pair))];

  return (
    <div style={{marginBottom:16}}>
      {/* Deck Header */}
      <div onClick={onToggle} style={{
        background:"var(--bg3)", border:"1px solid var(--bord)", borderRadius:isOpen?"12px 12px 0 0":12,
        padding:"16px 20px", cursor:"pointer", transition:"all 0.2s",
        borderBottom: isOpen?"1px solid var(--a1)33":"1px solid var(--bord)",
      }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--a1)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=isOpen?"var(--a1)33":"var(--bord)";}}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Deck icon */}
            <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,var(--a1),var(--a2))`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:18}}>🃏</span>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)"}}>{label}</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>
                {trades.length} {trades.length===1?"trade":"trades"} · {pairs.slice(0,3).join(", ")}{pairs.length>3?` +${pairs.length-3} more`:""}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:2}}>MONTH P&L</div>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:totalPnl>=0?"#22c55e":"#ef4444"}}>{fmt(totalPnl)}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <span style={{fontSize:10,color:"#22c55e",fontFamily:"var(--mono)",fontWeight:600}}>{wins.length}W</span>
              <span style={{fontSize:10,color:"#ef4444",fontFamily:"var(--mono)",fontWeight:600}}>{losses.length}L</span>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:2}}>BIAS</div>
              <span style={{fontSize:11,fontWeight:700,color:bestDir==="LONG"?"#22c55e":"#ef4444",fontFamily:"var(--mono)"}}>{bestDir}</span>
            </div>
            <span style={{fontSize:14,color:"var(--t3)",transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▾</span>
          </div>
        </div>
      </div>
      {/* Deck Cards */}
      {isOpen && (
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderTop:"none",borderRadius:"0 0 12px 12px",padding:16,animation:"fadeIn 0.15s"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
            {trades.map(t=><TradeCard key={t.id} trade={t} onClick={()=>onSelectTrade(t)}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Trade Entry Page ──
export default function TradeEntryPage({ trades, setTrades, onHome, onBack, logoEmoji, logoG1, logoG2 }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [suitFilter, setSuitFilter] = useState("all");
  const [pairFilter, setPairFilter] = useState("all");
  const [sortDir, setSortDir] = useState("desc"); // newest first
  const [openDecks, setOpenDecks] = useState({});

  const availPairs = useMemo(()=>[...new Set(trades.map(t=>t.pair))].sort(),[trades]);

  const filtered = useMemo(()=>{
    let t = [...trades];
    if (suitFilter==="wins")   t=t.filter(x=>x.result==="win");
    if (suitFilter==="losses") t=t.filter(x=>x.result==="loss");
    if (suitFilter==="long")   t=t.filter(x=>x.direction==="LONG");
    if (suitFilter==="short")  t=t.filter(x=>x.direction==="SHORT");
    if (suitFilter==="pair" && pairFilter!=="all") t=t.filter(x=>x.pair===pairFilter);
    return t;
  },[trades,suitFilter,pairFilter]);

  // Group by month-year deck
  const decks = useMemo(()=>{
    const map = {};
    filtered.forEach(t=>{ const k=mkKey(t.date); if(!map[k]) map[k]=[]; map[k].push(t); });
    return Object.entries(map).sort(([a],[b])=>sortDir==="desc"?b.localeCompare(a):a.localeCompare(b));
  },[filtered,sortDir]);

  const toggleDeck = k => setOpenDecks(p=>({...p,[k]:!p[k]}));

  const addTrade = trade => {
    setTrades(prev=>[...prev,trade]);
    setShowForm(false);
    setOpenDecks(p=>({...p,[mkKey(trade.date)]:true}));
  };
  const editTrade = updated => {
    setTrades(prev=>prev.map(t=>t.id===updated.id?updated:t));
    setSelected(updated);
    setShowEditForm(false);
  };
  const deleteTrade = id => {
    setTrades(prev=>prev.filter(t=>t.id!==id));
    setSelected(null);
  };
  const updateJournal = (id,text)=>setTrades(prev=>prev.map(t=>t.id===id?{...t,journal:text}:t));

  // ── Selected trade detail view ──
  if (selected) {
    const qs = selected.quickThoughts||[];
    return (
      <div style={{minHeight:"100vh"}}>
        <PageHeader title={`${selected.pair} · ${selected.date}`} onHome={onHome} onBack={()=>setSelected(null)} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}>
          <button onClick={()=>setShowEditForm(true)} style={{padding:"7px 16px",borderRadius:8,border:"1px solid var(--a1)",background:"rgba(var(--a1-rgb),0.1)",color:"var(--a1)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--display)"}}>✏️ Edit Card</button>
          <button onClick={()=>{ if(window.confirm("Delete this trade? This cannot be undone.")) deleteTrade(selected.id); }} style={{padding:"7px 16px",borderRadius:8,border:"1px solid #ef4444",background:"rgba(239,68,68,0.08)",color:"#ef4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--display)"}}>🗑 Delete</button>
        </PageHeader>
        <div style={{padding:24,animation:"fadeIn 0.2s"}}>
          <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:20,maxWidth:1100,margin:"0 auto"}}>
            <TradeCard trade={selected} onClick={()=>{}}/>
            <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:22}}>
              <div style={{fontSize:14,fontWeight:600,color:"var(--t1)",marginBottom:12,fontFamily:"var(--display)"}}>Trade Journal</div>
              {qs.length>0&&(
                <div style={{marginBottom:16,background:"var(--bg2)",borderRadius:8,padding:"12px 16px"}}>
                  <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Quick Thoughts</div>
                  {qs.map((b,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:"var(--a1)",fontFamily:"var(--mono)"}}>•</span><span style={{fontSize:13,color:"var(--t2)",fontFamily:"var(--body)",lineHeight:1.5}}>{b}</span></div>)}
                </div>
              )}
              <textarea value={selected.journal||""} onChange={e=>{updateJournal(selected.id,e.target.value);setSelected(p=>({...p,journal:e.target.value}));}}
                placeholder="Deep dive notes — thesis, market behaviour, lessons..."
                style={{width:"100%",minHeight:280,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,padding:18,color:"var(--t1)",fontSize:13,lineHeight:1.7,fontFamily:"var(--body)",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
          </div>
        </div>
        {showEditForm&&<TradeForm initialValues={selected} onSave={editTrade} onCancel={()=>setShowEditForm(false)}/>}
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title="Trade Deck" onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}>
        <button onClick={()=>setSortDir(p=>p==="desc"?"asc":"desc")} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--bord)",background:"var(--bg3)",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>
          {sortDir==="desc"?"↓ Newest":"↑ Oldest"}
        </button>
        <button onClick={()=>setShowForm(true)} style={{padding:"7px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ New Card</button>
      </PageHeader>

      <div style={{padding:"16px 24px"}}>
        {/* Suit Filter */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Filter by Card Type</div>
          <SuitFilter active={suitFilter} onSelect={setSuitFilter} pairFilter={pairFilter} onPairFilter={setPairFilter} availPairs={availPairs}/>
        </div>

        {decks.length>0 ? decks.map(([k,ts])=>(
          <MonthDeck key={k} monthKey={k} trades={ts} onSelectTrade={setSelected} isOpen={!!openDecks[k]} onToggle={()=>toggleDeck(k)}/>
        )) : (
          <EmptyState icon="🃏" title="No trades yet" subtitle="Start building your trading deck." action="+ Add First Card" onAction={()=>setShowForm(true)}/>
        )}
      </div>
      {showForm&&<TradeForm onSave={addTrade} onCancel={()=>setShowForm(false)}/>}
    </div>
  );
}
