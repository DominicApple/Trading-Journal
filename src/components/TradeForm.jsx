import { useState } from "react";
import { CONFLUENCES, EMOTIONS, EMOTION_META, PAIRS, fmt, uid, today, wordCount } from "../utils";

const inp = {
  width:"100%", background:"var(--bg3)", border:"1px solid var(--bord)",
  borderRadius:8, padding:"9px 12px", color:"var(--t1)", fontSize:13,
  fontFamily:"var(--mono)", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s",
};
const lbl = { fontSize:10, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block", fontFamily:"var(--mono)" };

// ── Emotion Picker (custom — fixes text/bg mismatch) ──
function EmotionPicker({ value, onChange }) {
  const [open,setOpen] = useState(false);
  const meta = EMOTION_META[value];
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{
        width:"100%", padding:"9px 12px", borderRadius:8,
        border:`1px solid ${meta.color}44`,
        background: meta.bg,
        color: meta.color, fontSize:13, fontFamily:"var(--mono)",
        textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between",
        alignItems:"center", transition:"all 0.15s",
      }}>
        <span style={{textTransform:"capitalize", fontWeight:600}}>{meta.label}</span>
        <span style={{fontSize:9,opacity:0.7}}>▼</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:200,overflow:"hidden",animation:"fadeIn 0.1s"}}>
          {EMOTIONS.map(em => {
            const m = EMOTION_META[em];
            return (
              <div key={em} onClick={()=>{onChange(em);setOpen(false);}} style={{
                padding:"10px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                background: value===em ? m.bg : "transparent",
                transition:"background 0.1s",
              }}
                onMouseEnter={e=>{ if(value!==em) e.currentTarget.style.background="var(--bg3)"; }}
                onMouseLeave={e=>{ if(value!==em) e.currentTarget.style.background="transparent"; }}
              >
                <div style={{width:10,height:10,borderRadius:"50%",background:m.color,flexShrink:0}}/>
                <span style={{fontSize:13,color:m.color,fontFamily:"var(--mono)",textTransform:"capitalize",fontWeight:600}}>{m.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Quick Thoughts Input (bullet points, 150 word limit) ──
function QuickThoughtsInput({ value, onChange }) {
  const bullets = value.length ? value : [""];
  const total = wordCount(bullets);
  const remaining = 150 - total;

  const update = (i, text) => {
    const next = [...bullets];
    next[i] = text;
    onChange(next);
  };
  const addBullet = (i) => {
    const next = [...bullets.slice(0,i+1), "", ...bullets.slice(i+1)];
    onChange(next);
  };
  const removeBullet = (i) => {
    if (bullets.length <= 1) { onChange([""]); return; }
    const next = bullets.filter((_,idx)=>idx!==i);
    onChange(next);
  };

  return (
    <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:8,padding:"10px 12px"}}>
      {bullets.map((b,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
          <span style={{color:"var(--a1)",fontFamily:"var(--mono)",fontSize:14,paddingTop:3,flexShrink:0}}>•</span>
          <input
            value={b}
            onChange={e => update(i, e.target.value)}
            onKeyDown={e => {
              if (e.key==="Enter") { e.preventDefault(); addBullet(i); }
              if (e.key==="Backspace" && b==="" && bullets.length>1) { e.preventDefault(); removeBullet(i); }
            }}
            placeholder={i===0?"Quick thought...":""}
            style={{
              flex:1,background:"transparent",border:"none",outline:"none",
              color:"var(--t1)",fontSize:13,fontFamily:"var(--body)",
              padding:0, resize:"none",
            }}
          />
        </div>
      ))}
      <div style={{fontSize:10,color:remaining<20?"#ef4444":"var(--t3)",fontFamily:"var(--mono)",textAlign:"right",marginTop:4}}>
        {remaining} words left
      </div>
    </div>
  );
}

// ── Trade Card ──
export function TradeCard({ trade, onClick }) {
  const isWin = trade.result==="win";
  return (
    <div onClick={onClick} style={{
      background:"var(--bg3)", border:"1px solid var(--bord)",
      borderRadius:12, padding:"16px 18px", cursor:"pointer",
      borderLeft:`3px solid ${isWin?"#22c55e":"#ef4444"}`,
      transition:"all 0.15s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.background="var(--bg2)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.transform="translateY(0)";}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"var(--t1)"}}>{trade.pair}</div>
          <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>{trade.date}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:trade.direction==="LONG"?"#22c55e":"#ef4444",background:trade.direction==="LONG"?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",padding:"3px 10px",borderRadius:5}}>{trade.direction}</span>
          <span style={{fontSize:10,fontWeight:700,color:isWin?"#22c55e":"#ef4444",background:isWin?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",padding:"3px 8px",borderRadius:5}}>{isWin?"WIN":"LOSS"}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:14,marginBottom:10,fontSize:11,fontFamily:"var(--mono)"}}>
        <span style={{color:"var(--t3)"}}>Entry <span style={{color:"var(--t2)"}}>{trade.entry}</span></span>
        <span style={{color:"var(--t3)"}}>Exit <span style={{color:"var(--t2)"}}>{trade.exit}</span></span>
        <span style={{color:"var(--t3)"}}>Lots <span style={{color:"var(--t2)"}}>{trade.size}</span></span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {(trade.confluences||[]).slice(0,3).map(c=>(
            <span key={c} style={{fontSize:9,color:"#c4b5fd",background:"rgba(167,139,250,0.1)",padding:"2px 8px",borderRadius:20,border:"1px solid rgba(167,139,250,0.12)"}}>{c}</span>
          ))}
          {(trade.confluences||[]).length>3&&<span style={{fontSize:9,color:"var(--t3)"}}>+{trade.confluences.length-3}</span>}
        </div>
        <span style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:isWin?"#22c55e":"#ef4444"}}>{fmt(trade.pnl)}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,paddingTop:8,borderTop:"1px solid var(--bord)"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:EMOTION_META[trade.emotion]?.color||"#64748b"}}/>
        <span style={{fontSize:10,color:"var(--t2)",textTransform:"capitalize",fontFamily:"var(--mono)"}}>{trade.emotion}</span>
        <span style={{marginLeft:"auto",fontSize:12,letterSpacing:1}}>
          {[1,2,3,4,5].map(n=><span key={n} style={{color:n<=(trade.rating||3)?"#f59e0b":"var(--t3)"}}>★</span>)}
        </span>
      </div>
    </div>
  );
}

// ── Trade Form ──
export function TradeForm({ onSave, onCancel }) {
  const [f,setF] = useState({
    date:today(), pair:PAIRS[0], direction:"LONG", entry:"", exit:"", size:"0.01",
    emotion:"neutral", rating:3, confluences:[], quickThoughts:[""], result:"win", pnl:"",
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const toggleConf = c => setF(p=>({...p,confluences:p.confluences.includes(c)?p.confluences.filter(x=>x!==c):[...p.confluences,c]}));

  const handleSave = () => {
    if (!f.entry||!f.exit||!f.pnl) return;
    onSave({
      ...f, id:uid(),
      entry:parseFloat(f.entry), exit:parseFloat(f.exit), size:parseFloat(f.size),
      pnl:f.result==="win"?Math.abs(parseFloat(f.pnl)):-Math.abs(parseFloat(f.pnl)),
      pair:f.pair.toUpperCase(), journal:"",
      quickThoughts: f.quickThoughts.filter(t=>t.trim()),
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(6px)",animation:"fadeIn 0.15s ease"}} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:16,padding:28,width:480,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 48px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:18,fontWeight:700,color:"var(--t1)",marginBottom:20,fontFamily:"var(--display)"}}>New Trade Card</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* Date */}
          <div><label style={lbl}>Date</label><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={inp}/></div>
          {/* Pair Dropdown */}
          <div>
            <label style={lbl}>Pair / Symbol</label>
            <select value={f.pair} onChange={e=>set("pair",e.target.value)} style={{...inp,appearance:"none",background:"var(--bg3)",cursor:"pointer"}}>
              {PAIRS.map(p=><option key={p} value={p} style={{background:"#1a1a2e",color:"#e5e7eb"}}>{p}</option>)}
            </select>
          </div>
          {/* Direction */}
          <div>
            <label style={lbl}>Direction</label>
            <div style={{display:"flex",gap:6}}>
              {["LONG","SHORT"].map(d=>(
                <button key={d} onClick={()=>set("direction",d)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid",borderColor:f.direction===d?(d==="LONG"?"#22c55e":"#ef4444"):"var(--bord)",background:f.direction===d?(d==="LONG"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)"):"transparent",color:f.direction===d?(d==="LONG"?"#22c55e":"#ef4444"):"var(--t3)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)"}}>{d}</button>
              ))}
            </div>
          </div>
          {/* Lot Size */}
          <div><label style={lbl}>Lot Size</label><input type="number" step="0.01" min="0.01" value={f.size} onChange={e=>set("size",e.target.value)} style={inp}/></div>
          {/* Entry */}
          <div><label style={lbl}>Entry Price</label><input type="number" step="any" value={f.entry} onChange={e=>set("entry",e.target.value)} style={inp}/></div>
          {/* Exit */}
          <div><label style={lbl}>Exit Price</label><input type="number" step="any" value={f.exit} onChange={e=>set("exit",e.target.value)} style={inp}/></div>
          {/* Result */}
          <div>
            <label style={lbl}>Result</label>
            <div style={{display:"flex",gap:6}}>
              {["win","loss"].map(r=>(
                <button key={r} onClick={()=>set("result",r)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid",borderColor:f.result===r?(r==="win"?"#22c55e":"#ef4444"):"var(--bord)",background:f.result===r?(r==="win"?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)"):"transparent",color:f.result===r?(r==="win"?"#22c55e":"#ef4444"):"var(--t3)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--mono)",textTransform:"uppercase"}}>{r}</button>
              ))}
            </div>
          </div>
          {/* P&L */}
          <div><label style={lbl}>Profit / Loss ($)</label><input type="number" step="0.01" placeholder="0.00" value={f.pnl} onChange={e=>set("pnl",e.target.value)} style={inp}/></div>
          {/* Emotion */}
          <div><label style={lbl}>Emotion</label><EmotionPicker value={f.emotion} onChange={v=>set("emotion",v)}/></div>
          {/* Rating */}
          <div>
            <label style={lbl}>Rating</label>
            <div style={{display:"flex",gap:4,paddingTop:5}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>set("rating",n)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,padding:0,color:n<=f.rating?"#f59e0b":"var(--t3)",transition:"color 0.1s"}}>★</button>
              ))}
            </div>
          </div>
        </div>
        {/* Confluences */}
        <div style={{marginTop:14}}>
          <label style={lbl}>Confluences</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {CONFLUENCES.map(c=>{
              const active=f.confluences.includes(c);
              return <button key={c} onClick={()=>toggleConf(c)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid",borderColor:active?"#a78bfa":"var(--bord)",background:active?"rgba(167,139,250,0.12)":"transparent",color:active?"#c4b5fd":"var(--t3)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)",transition:"all 0.15s"}}>{c}</button>;
            })}
          </div>
        </div>
        {/* Quick Thoughts */}
        <div style={{marginTop:14}}>
          <label style={lbl}>Quick Thoughts <span style={{color:"var(--t3)",fontStyle:"italic",textTransform:"none",letterSpacing:0}}>(press Enter for new bullet · 150 word limit)</span></label>
          <QuickThoughtsInput value={f.quickThoughts} onChange={v=>set("quickThoughts",v)}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:22,justifyContent:"flex-end"}}>
          <button onClick={onCancel} style={{padding:"9px 22px",borderRadius:8,border:"1px solid var(--bord)",background:"transparent",color:"var(--t2)",cursor:"pointer",fontSize:12,fontFamily:"var(--display)"}}>Cancel</button>
          <button onClick={handleSave} style={{padding:"9px 26px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"var(--display)"}}>Save Trade</button>
        </div>
      </div>
    </div>
  );
}
