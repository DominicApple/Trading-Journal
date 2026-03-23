import { useState, useMemo, useRef } from "react";
import { PageHeader, EmptyState } from "../components/Shared";
import { uid, mkKey, keyLabel, today } from "../utils";

// ── Backtest Note Page ──
function BacktestNote({ bt, onBack, onUpdate, logoEmoji, logoG1, logoG2, onHome }) {
  const [notes, setNotes] = useState(bt.notes||"");
  const [link, setLink] = useState("");
  const fileRef = useRef(null);

  const save = (field, val) => onUpdate(bt.id, { [field]: val });

  const addLink = () => {
    if (!link.trim()) return;
    const updated = [...(bt.tradingViewLinks||[]), { id: uid(), url: link.trim(), label: link.trim() }];
    onUpdate(bt.id, { tradingViewLinks: updated });
    setLink("");
  };

  const removeLink = id => onUpdate(bt.id, { tradingViewLinks: (bt.tradingViewLinks||[]).filter(l=>l.id!==id) });

  const openLink = url => {
    if (window.electronShell) window.electronShell.openExternal(url);
    else window.open(url,"_blank");
  };

  const handleImages = e => {
    const files = Array.from(e.target.files);
    files.slice(0, 5).forEach(file => {
      if (file.size > 3*1024*1024) return; // skip >3MB
      const reader = new FileReader();
      reader.onload = ev => {
        const updated = [...(bt.images||[]), { id: uid(), name: file.name, dataUrl: ev.target.result }];
        onUpdate(bt.id, { images: updated });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = id => onUpdate(bt.id, { images: (bt.images||[]).filter(i=>i.id!==id) });

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title={bt.title} onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}/>
      <div style={{padding:24,maxWidth:900,margin:"0 auto",animation:"fadeIn 0.2s"}}>
        {/* Notes */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:22,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:12,fontFamily:"var(--display)"}}>📝 Backtest Notes</div>
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);save("notes",e.target.value);}}
            placeholder="What did you observe? How did price react? Key patterns, entries, invalidations..."
            style={{width:"100%",minHeight:260,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,padding:18,color:"var(--t1)",fontSize:14,lineHeight:1.7,fontFamily:"var(--body)",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>

        {/* Images */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:22,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",fontFamily:"var(--display)"}}>📸 Screenshots</div>
            <button onClick={()=>fileRef.current.click()} style={{padding:"6px 14px",borderRadius:8,border:"1px solid var(--bord)",background:"var(--bg2)",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>+ Add Image</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleImages}/>
          {(bt.images||[]).length>0 ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
              {(bt.images||[]).map(img=>(
                <div key={img.id} style={{position:"relative",borderRadius:8,overflow:"hidden",border:"1px solid var(--bord)"}}>
                  <img src={img.dataUrl} alt={img.name} style={{width:"100%",height:110,objectFit:"cover",display:"block"}}/>
                  <button onClick={()=>removeImage(img.id)} style={{position:"absolute",top:4,right:4,width:20,height:20,borderRadius:"50%",background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  <div style={{padding:"6px 8px",fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{img.name}</div>
                </div>
              ))}
            </div>
          ) : <div style={{fontSize:12,color:"var(--t3)",fontStyle:"italic",textAlign:"center",padding:"20px 0"}}>No screenshots yet</div>}
        </div>

        {/* TradingView Links */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:22}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--t1)",marginBottom:14,fontFamily:"var(--display)"}}>📊 TradingView Links</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={link} onChange={e=>setLink(e.target.value)} placeholder="Paste TradingView chart URL..." onKeyDown={e=>e.key==="Enter"&&addLink()}
              style={{flex:1,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:8,padding:"9px 12px",color:"var(--t1)",fontSize:13,fontFamily:"var(--mono)",outline:"none"}}/>
            <button onClick={addLink} style={{padding:"9px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Add</button>
          </div>
          {(bt.tradingViewLinks||[]).map(l=>(
            <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--bg2)",borderRadius:8,marginBottom:6}}>
              <span style={{fontSize:14}}>📊</span>
              <span onClick={()=>openLink(l.url)} style={{flex:1,fontSize:12,color:"var(--a1)",fontFamily:"var(--mono)",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={l.url}>{l.url}</span>
              <button onClick={()=>removeLink(l.id)} style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:12}}>✕</button>
            </div>
          ))}
          {!(bt.tradingViewLinks||[]).length&&<div style={{fontSize:12,color:"var(--t3)",fontStyle:"italic",textAlign:"center",padding:"12px 0"}}>No links yet</div>}
        </div>
      </div>
    </div>
  );
}

// ── Month Deck for Backtests ──
function BacktestMonthDeck({ monthKey, cards, onSelectCard, isOpen, onToggle }) {
  const label = keyLabel(monthKey);
  const withNotes = cards.filter(c=>(c.notes||"").trim().length>0).length;
  return (
    <div style={{marginBottom:16}}>
      <div onClick={onToggle} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:isOpen?"12px 12px 0 0":12,padding:"16px 20px",cursor:"pointer",transition:"all 0.2s",borderBottom:isOpen?"1px solid var(--a1)33":"1px solid var(--bord)"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--a1)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=isOpen?"var(--a1)33":"var(--bord)";}}
      >
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,#f59e0b,#ea580c)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:18}}>📖</span>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)"}}>{label}</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>{cards.length} {cards.length===1?"recap":"recaps"} · {withNotes} with notes</div>
            </div>
          </div>
          <span style={{fontSize:14,color:"var(--t3)",transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▾</span>
        </div>
      </div>
      {isOpen&&(
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderTop:"none",borderRadius:"0 0 12px 12px",padding:16,animation:"fadeIn 0.15s"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {cards.map(c=>(
              <div key={c.id} onClick={()=>onSelectCard(c)} style={{background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,padding:"14px 16px",cursor:"pointer",transition:"all 0.15s",borderLeft:`3px solid ${c.direction==="LONG"?"#22c55e":"#ef4444"}`}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.transform="translateY(-1px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="var(--bg2)";e.currentTarget.style.transform="translateY(0)";}}
              >
                <div style={{fontSize:13,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)",marginBottom:4}}>{c.title}</div>
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  <span style={{fontSize:10,fontWeight:700,color:c.direction==="LONG"?"#22c55e":"#ef4444",background:c.direction==="LONG"?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:4}}>{c.direction}</span>
                  <span style={{fontSize:10,color:"var(--a1)",background:"var(--bg3)",padding:"2px 8px",borderRadius:4,fontFamily:"var(--mono)"}}>{c.pair}</span>
                </div>
                {(c.notes||"").trim() ? (
                  <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{c.notes}</div>
                ) : <div style={{fontSize:11,color:"var(--t3)",fontStyle:"italic"}}>No notes yet — click to add</div>}
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  {(c.images||[]).length>0&&<span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>📸 {c.images.length}</span>}
                  {(c.tradingViewLinks||[]).length>0&&<span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>📊 {c.tradingViewLinks.length}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Backtest Page ──
export default function BacktestPage({ backtests, setBacktests, trades, onHome, onBack, logoEmoji, logoG1, logoG2 }) {
  const [selected, setSelected] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [openDecks, setOpenDecks] = useState({});

  // Auto-sync: ensure a backtest card exists for every trade
  const synced = useMemo(() => {
    const existing = new Set(backtests.map(b=>b.tradeId));
    const toAdd = trades.filter(t=>!existing.has(t.id)).map(t=>{
      const d = new Date(t.date+"T12:00:00");
      const mon = `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}`;
      return { id:uid(), tradeId:t.id, date:t.date, pair:t.pair, direction:t.direction, title:`${mon} · ${t.direction} · ${t.pair}`, notes:"", images:[], tradingViewLinks:[] };
    });
    if (toAdd.length>0) {
      setBacktests(prev=>[...prev,...toAdd]);
      return [...backtests,...toAdd];
    }
    return backtests;
  },[trades,backtests]);

  const updateBt = (id, changes) => {
    setBacktests(prev=>prev.map(b=>b.id===id?{...b,...changes}:b));
    if (selected?.id===id) setSelected(p=>({...p,...changes}));
  };

  const decks = useMemo(()=>{
    const map = {};
    synced.forEach(b=>{ const k=mkKey(b.date); if(!map[k]) map[k]=[]; map[k].push(b); });
    return Object.entries(map).sort(([a],[b])=>sortDir==="desc"?b.localeCompare(a):a.localeCompare(b));
  },[synced,sortDir]);

  const toggleDeck = k => setOpenDecks(p=>({...p,[k]:!p[k]}));

  if (selected) {
    return <BacktestNote bt={selected} onBack={()=>setSelected(null)} onUpdate={updateBt} onHome={onHome} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}/>;
  }

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title="Backtest Recaps" onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}>
        <button onClick={()=>setSortDir(p=>p==="desc"?"asc":"desc")} style={{padding:"5px 12px",borderRadius:7,border:"1px solid var(--bord)",background:"var(--bg3)",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>
          {sortDir==="desc"?"↓ Newest":"↑ Oldest"}
        </button>
      </PageHeader>
      <div style={{padding:"16px 24px"}}>
        {decks.length>0 ? decks.map(([k,cards])=>(
          <BacktestMonthDeck key={k} monthKey={k} cards={cards} onSelectCard={c=>{setSelected(c);}} isOpen={!!openDecks[k]} onToggle={()=>toggleDeck(k)}/>
        )) : (
          <EmptyState icon="📖" title="No backtest recaps yet" subtitle="Backtest cards are created automatically when you log trades." />
        )}
      </div>
    </div>
  );
}
