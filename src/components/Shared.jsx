import { useState, useRef } from "react";
import { EMOTIONS, EMOTION_META, fmt } from "../utils";

// ── Logo ──
export function Logo({ size = 32, emoji = "⚡", g1 = "#3b82f6", g2 = "#7c3aed" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: `linear-gradient(135deg,${g1},${g2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, lineHeight: 1, flexShrink: 0,
      boxShadow: `0 0 16px ${g1}55`,
    }}>{emoji}</div>
  );
}

// ── Logo Button ──
export function LogoButton({ onClick, size = 30, emoji = "⚡", g1 = "#3b82f6", g2 = "#7c3aed" }) {
  return (
    <button onClick={onClick} title="Home" style={{
      width: size, height: size, borderRadius: size * 0.22, border: "none", cursor: "pointer",
      background: `linear-gradient(135deg,${g1},${g2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, lineHeight: 1, padding: 0, flexShrink: 0,
      boxShadow: `0 0 14px ${g1}55`, transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="scale(1.12)"; e.currentTarget.style.boxShadow=`0 0 24px ${g1}88`; }}
      onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow=`0 0 14px ${g1}55`; }}
    >{emoji}</button>
  );
}

// ── Page Header ──
export function PageHeader({ title, onHome, onBack, children, logoEmoji, logoG1, logoG2 }) {
  return (
    <div style={{
      padding: "12px 24px", borderBottom: "1px solid var(--bord)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(0,0,0,0.1)", position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LogoButton onClick={onHome} size={30} emoji={logoEmoji} g1={logoG1} g2={logoG2} />
        {onBack && (
          <button onClick={onBack} style={{
            padding: "5px 12px", borderRadius: 7, border: "1px solid var(--bord)",
            background: "transparent", color: "var(--t2)", fontSize: 12,
            cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color="var(--t1)"; e.currentTarget.style.borderColor="var(--a1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="var(--t2)"; e.currentTarget.style.borderColor="var(--bord)"; }}
          >← Back</button>
        )}
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--display)", color: "var(--t1)", letterSpacing: "-0.01em" }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{children}</div>
    </div>
  );
}

// ── Stat Card ──
export function StatCard({ label, value, accent, sub, icon }) {
  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--bord)",
      borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 130, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -8, right: -8, fontSize: 36, opacity: 0.04 }}>{icon}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--t3)", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent || "var(--t1)", fontFamily: "var(--mono)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, fontFamily: "var(--mono)" }}>{sub}</div>}
    </div>
  );
}

// ── Equity Curve ──
export function EquityChart({ trades }) {
  if (trades.length < 2) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:80, color:"var(--t3)", fontSize:12, fontStyle:"italic" }}>
      Need 2+ trades
    </div>
  );
  const sorted = [...trades].sort((a,b) => a.date.localeCompare(b.date));
  let c=0; const data=sorted.map(t=>{c+=t.pnl;return c;});
  const w=500,h=90,min=Math.min(0,...data),max=Math.max(0,...data),range=max-min||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*w, h-((v-min)/range)*(h-10)-5]);
  const line=pts.map(p=>p.join(",")).join(" ");
  const color=data[data.length-1]>=0?"#22c55e":"#ef4444";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      <defs><linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon fill="url(#eqFill)" points={`0,${h} ${line} ${w},${h}`}/>
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line}/>
      {pts.length>0&&<circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill={color}/>}
    </svg>
  );
}

// ── Emotion Bar ──
export function EmotionBar({ trades }) {
  if (!trades.length) return <div style={{color:"var(--t3)",fontSize:12,fontStyle:"italic"}}>No emotion data yet</div>;
  const total=trades.length;
  return (
    <div>
      <div style={{display:"flex",gap:2,height:8,borderRadius:6,overflow:"hidden",marginBottom:10}}>
        {EMOTIONS.map(em=>{
          const count=trades.filter(t=>t.emotion===em).length;
          if(!count) return null;
          return <div key={em} style={{flex:count,background:EMOTION_META[em].color,transition:"flex 0.4s ease"}}/>;
        })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
        {EMOTIONS.map(em=>{
          const count=trades.filter(t=>t.emotion===em).length;
          if(!count) return null;
          return (
            <div key={em} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:EMOTION_META[em].color}}/>
              <span style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",textTransform:"capitalize"}}>{em}</span>
              <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{((count/total)*100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Trade Counter (auto from trades) ──
export function TradeCounter({ count, onAddTrade }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <div style={{position:"relative",width:84,height:84,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="84" height="84" style={{position:"absolute",animation:"spin 3s linear infinite"}}>
          <defs>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff"/><stop offset="50%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#c026d3"/>
            </linearGradient>
            <filter id="neonGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle cx="42" cy="42" r="37" fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth="2.5"/>
          <circle cx="42" cy="42" r="37" fill="none" stroke="url(#neonGrad)" strokeWidth="3" strokeDasharray="50 183" strokeLinecap="round" filter="url(#neonGlow)"/>
        </svg>
        <span style={{fontSize:26,fontWeight:700,color:"#7c3aed",textShadow:"0 0 16px rgba(124,58,237,0.4)",fontFamily:"var(--mono)",zIndex:1}}>{count}</span>
      </div>
      <button onClick={onAddTrade} style={{
        padding:"9px 20px",borderRadius:10,border:"1px solid rgba(0,212,255,0.2)",
        background:"linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))",
        color:"#00d4ff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--display)",transition:"all 0.2s",
      }}
        onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(0,212,255,0.2),rgba(124,58,237,0.2))";e.currentTarget.style.borderColor="rgba(0,212,255,0.4)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))";e.currentTarget.style.borderColor="rgba(0,212,255,0.2)";}}
      >+ Log Trade</button>
      <span style={{fontSize:9,fontFamily:"var(--mono)",letterSpacing:"0.1em",textTransform:"uppercase",color:"#6b5ce7"}}>total trades</span>
    </div>
  );
}

// ── Empty State ──
export function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12,opacity:0.3}}>{icon}</div>
      <div style={{fontSize:15,fontWeight:600,color:"var(--t2)",marginBottom:4,fontFamily:"var(--display)"}}>{title}</div>
      <div style={{fontSize:12,color:"var(--t3)",marginBottom:16,maxWidth:300}}>{subtitle}</div>
      {action&&<button onClick={onAction} style={{padding:"8px 20px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{action}</button>}
    </div>
  );
}

// ── Account Dropdown ──
export function AccountDropdownSmall({ accounts, activeId, onSwitch }) {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  const active=accounts.find(a=>a.id===activeId);
  return (
    <div ref={ref} style={{position:"relative",zIndex:100}}>
      <button onClick={()=>setOpen(!open)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:7,background:"var(--bg3)",border:"1px solid var(--bord)",color:"var(--t2)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e"}}/>
        {active?.name||active?.id}
        <span style={{fontSize:8,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.15s"}}>▼</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,minWidth:180,background:"var(--bg2)",border:"1px solid var(--bord)",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",animation:"fadeIn 0.1s"}}>
          {accounts.map(acc=>(
            <div key={acc.id} onClick={()=>{onSwitch(acc.id);setOpen(false);}} style={{padding:"8px 12px",cursor:"pointer",background:acc.id===activeId?"rgba(59,130,246,0.08)":"transparent",fontSize:12,color:acc.id===activeId?"var(--t1)":"var(--t2)"}}
              onMouseEnter={e=>{if(acc.id!==activeId)e.currentTarget.style.background="var(--bg3)";}}
              onMouseLeave={e=>{if(acc.id!==activeId)e.currentTarget.style.background="transparent";}}
            >{acc.name} <span style={{fontSize:9,color:"var(--t3)"}}>{acc.id}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

