import { LogoButton, StatCard, EquityChart, EmotionBar, TradeCounter } from "../components/Shared";
import { fmt } from "../utils";

export default function Homepage({ trades, navigate, accountDropdown, onHome, account, logoEmoji, logoG1, logoG2, onOpenSettings }) {
  const totalPnl  = trades.reduce((s,t)=>s+t.pnl,0);
  const wins      = trades.filter(t=>t.result==="win");
  const losses    = trades.filter(t=>t.result==="loss");
  const avgWin    = wins.length   ? (wins.reduce((s,t)=>s+t.pnl,0)/wins.length).toFixed(2)     : "—";
  const avgLoss   = losses.length ? (losses.reduce((s,t)=>s+t.pnl,0)/losses.length).toFixed(2) : "—";
  const pf        = losses.length&&wins.length ? Math.abs(wins.reduce((s,t)=>s+t.pnl,0)/losses.reduce((s,t)=>s+t.pnl,0)).toFixed(2) : "—";
  const highW     = wins.length   ? Math.max(...wins.map(t=>t.pnl)).toFixed(2)   : "—";
  const highL     = losses.length ? Math.min(...losses.map(t=>t.pnl)).toFixed(2) : "—";
  const recent    = [...trades].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const balance   = (account?.startBalance||0) + totalPnl;

  const navCards = [
    { key:"trades",      icon:"🃏", title:"Trade Deck",         sub:"Monthly card system",     color:"var(--a1)", glow:`rgba(59,130,246,0.12)` },
    { key:"system",      icon:"⚙️", title:"Trade System",       sub:"Entry model & rules",     color:"#00d4ff",   glow:"rgba(0,212,255,0.1)"  },
    { key:"projections", icon:"🔮", title:"Weekly Projections",  sub:"Plan your week",          color:"#a855f7",   glow:"rgba(168,85,247,0.12)"},
    { key:"backtest",    icon:"📖", title:"Backtest Recaps",     sub:"Linked to your trades",   color:"#f59e0b",   glow:"rgba(245,158,11,0.12)"},
  ];

  return (
    <div style={{minHeight:"100vh"}}>
      {/* Hero */}
      <div style={{height:200,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 80%,#0f172a 100%)"}}>
        <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:0.12}}>
          {Array.from({length:24},(_,i)=>{const x=20+i*42;const bull=i%3!==0;const h=18+Math.sin(i*0.7)*35+25;const y=100-h/2;return(<g key={i}><line x1={x+8} y1={y-15} x2={x+8} y2={y+h+15} stroke={bull?"#22c55e":"#ef4444"} strokeWidth="1"/><rect x={x} y={y} width="16" height={h} rx="2" fill={bull?"#22c55e":"#ef4444"} opacity="0.7"/></g>);})}
          <polyline fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.5" points={Array.from({length:24},(_,i)=>`${28+i*42},${95+Math.sin(i*0.4)*22}`).join(" ")}/>
        </svg>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
        <div style={{position:"relative",zIndex:2,height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <LogoButton onClick={onHome} size={50} emoji={logoEmoji} g1={logoG1} g2={logoG2}/>
            <div>
              <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:"var(--display)",letterSpacing:"-0.02em"}}>TradeLog</div>
              {account&&<div style={{fontSize:12,color:"rgba(255,255,255,0.5)",fontFamily:"var(--mono)",marginTop:2}}>{account.name}</div>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {/* Account Balance */}
            {account&&(
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"var(--mono)",marginBottom:2,letterSpacing:"0.08em"}}>ACCOUNT BALANCE</div>
                <div style={{fontSize:22,fontWeight:700,color:"#fff",fontFamily:"var(--mono)"}}>${balance.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                <div style={{fontSize:11,fontFamily:"var(--mono)",color:totalPnl>=0?"#22c55e":"#ef4444",marginTop:1}}>{fmt(totalPnl)} P&L</div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
              {accountDropdown}
              <button onClick={onOpenSettings} title="Settings" style={{padding:"5px 10px",borderRadius:7,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",fontSize:14,cursor:"pointer",lineHeight:1}}>⚙</button>
            </div>
          </div>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:50,background:"linear-gradient(transparent,var(--bg))"}}/>
      </div>

      <div style={{padding:"20px 28px"}}>
        {/* Stats Row */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:18,alignItems:"stretch"}}>
          {/* P&L Circle */}
          <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"14px 18px",flex:1,minWidth:160,display:"flex",alignItems:"center",gap:16,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-8,right:-8,fontSize:36,opacity:0.04}}>📈</div>
            <div style={{position:"relative",width:72,height:72,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="72" height="72" style={{position:"absolute",animation:"spin 4s linear infinite"}}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff87"/><stop offset="50%" stopColor="#22c55e"/><stop offset="100%" stopColor="#00ff87"/></linearGradient>
                  <filter id="pnlGlow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(0,255,135,0.1)" strokeWidth="2"/>
                <circle cx="36" cy="36" r="32" fill="none" stroke="url(#pnlGrad)" strokeWidth="2.5" strokeDasharray="45 156" strokeLinecap="round" filter="url(#pnlGlow)"/>
              </svg>
              <span style={{fontSize:18,fontWeight:700,color:totalPnl>=0?"#00ff87":"#ef4444",textShadow:totalPnl>=0?"0 0 12px rgba(0,255,135,0.4)":"0 0 12px rgba(239,68,68,0.4)",fontFamily:"var(--mono)",zIndex:1}}>{trades.length?fmt(totalPnl):"—"}</span>
            </div>
            <div>
              <div style={{fontSize:10,letterSpacing:"0.1em",color:"var(--t3)",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:4}}>Total P&L</div>
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{trades.length} trades</div>
              <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginTop:2}}>{wins.length}W / {losses.length}L</div>
            </div>
          </div>
          <StatCard label="Avg Win"      value={avgWin!=="—"?`+$${avgWin}`:"—"}  accent="#22c55e" sub={`${wins.length} wins`}   icon="🟢"/>
          <StatCard label="Avg Loss"     value={avgLoss!=="—"?`$${avgLoss}`:"—"} accent="#ef4444" sub={`${losses.length} losses`} icon="🔴"/>
          <StatCard label="Profit Factor" value={pf}                              accent="#a855f7" icon="⚖️"/>
          <StatCard label="Highest Win"  value={highW!=="—"?`+$${highW}`:"—"}    accent="#34d399" icon="🏆"/>
          <StatCard label="Highest Loss" value={highL!=="—"?`$${highL}`:"—"}     accent="#f87171" icon="💥"/>
        </div>

        {/* Trade Report */}
        <div style={{background:"linear-gradient(135deg,rgba(0,212,255,0.03),rgba(124,58,237,0.03))",border:"1px solid rgba(0,212,255,0.08)",borderRadius:14,padding:"20px 22px",marginBottom:18,position:"relative",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--mono)"}}>Trade Report</div>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(0,212,255,0.15),transparent)"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {[
              {label:"Best Pair",  value:trades.length>0?(()=>{const p={};trades.forEach(t=>{if(!p[t.pair])p[t.pair]=0;p[t.pair]+=t.pnl;});const b=Object.entries(p).sort((a,c)=>c[1]-a[1])[0];return b?b[0]:"—";})():"—", sub:"by total P&L",    col:"#00d4ff"},
              {label:"Win Streak", value:(()=>{let max=0,cur=0;[...trades].sort((a,b)=>a.date.localeCompare(b.date)).forEach(t=>{if(t.result==="win"){cur++;max=Math.max(max,cur);}else cur=0;});return max||"—";})(),                         sub:"consecutive",    col:"#ff6b00", fire:true},
              {label:"Avg R:R",    value:(()=>{const w=trades.filter(t=>t.result==="win");const l=trades.filter(t=>t.result==="loss");if(!w.length||!l.length)return"—";const aw=w.reduce((s,t)=>s+Math.abs(t.pnl),0)/w.length;const al=l.reduce((s,t)=>s+Math.abs(t.pnl),0)/l.length;return`1:${(aw/al).toFixed(1)}`;})(), sub:"risk to reward",  col:"#c026d3"},
              {label:"Win Rate",   value:trades.length>0?`${((wins.length/trades.length)*100).toFixed(0)}%`:"—",                                                                                                                                 sub:"overall accuracy",col:"#00d4ff"},
            ].map((item,i)=>(
              item.fire ? (
                <div key={i} style={{
                  background:"linear-gradient(135deg,rgba(255,107,0,0.12),rgba(220,38,38,0.08))",
                  border:"1px solid rgba(255,107,0,0.3)",
                  borderRadius:10,padding:"12px 14px",position:"relative",overflow:"hidden",
                  boxShadow:"0 0 18px rgba(255,107,0,0.15), inset 0 0 20px rgba(255,60,0,0.05)",
                }}>
                  <style>{`
                    @keyframes fireFlicker {
                      0%,100%{opacity:1;transform:scaleY(1) translateY(0)}
                      25%{opacity:.85;transform:scaleY(1.04) translateY(-1px)}
                      50%{opacity:.9;transform:scaleY(.97) translateY(1px)}
                      75%{opacity:.88;transform:scaleY(1.03) translateY(-1px)}
                    }
                    @keyframes fireGlow {
                      0%,100%{box-shadow:0 0 18px rgba(255,107,0,0.2),inset 0 0 20px rgba(255,60,0,0.05)}
                      50%{box-shadow:0 0 32px rgba(255,107,0,0.4),inset 0 0 30px rgba(255,60,0,0.1)}
                    }
                  `}</style>
                  <div style={{position:"absolute",top:6,right:8,fontSize:18,animation:"fireFlicker 1.4s ease-in-out infinite"}}>🔥</div>
                  <div style={{fontSize:9,letterSpacing:"0.1em",color:"#fb923c",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:5,fontWeight:700}}>{item.label}</div>
                  <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--mono)",lineHeight:1.1,background:"linear-gradient(135deg,#ff6b00,#dc2626)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"fireFlicker 1.4s ease-in-out infinite"}}>{item.value}</div>
                  <div style={{fontSize:10,color:"#fb923c",marginTop:3,fontFamily:"var(--mono)",opacity:0.8}}>{item.sub}</div>
                </div>
              ) : (
                <div key={i} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:9,letterSpacing:"0.1em",color:"var(--t3)",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:5}}>{item.label}</div>
                  <div style={{fontSize:18,fontWeight:700,fontFamily:"var(--mono)",lineHeight:1.1,background:`linear-gradient(135deg,${item.col},#7c3aed)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{item.value}</div>
                  <div style={{fontSize:10,color:"var(--t3)",marginTop:3,fontFamily:"var(--mono)"}}>{item.sub}</div>
                </div>
              )
            ))}
          </div>
          <div style={{marginTop:12,display:"flex",gap:12}}>
            {[
              {label:"Top Confluence",  val:trades.length>0?(()=>{const c={};trades.filter(t=>t.result==="win").forEach(t=>(t.confluences||[]).forEach(x=>{c[x]=(c[x]||0)+1;}));const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];return t?t[0]:"—";})():"—"},
              {label:"Best Emotion",    val:trades.length>0?(()=>{const e={};trades.filter(t=>t.result==="win").forEach(t=>{e[t.emotion]=(e[t.emotion]||0)+1;});const t=Object.entries(e).sort((a,b)=>b[1]-a[1])[0];return t?t[0]:"—";})():"—"},
            ].map((item,i)=>(
              <div key={i} style={{flex:1,background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:10,padding:"10px 14px"}}>
                <div style={{fontSize:9,letterSpacing:"0.1em",color:"var(--t3)",textTransform:"uppercase",fontFamily:"var(--mono)",marginBottom:4}}>{item.label}</div>
                <div style={{fontSize:14,fontWeight:700,fontFamily:"var(--mono)",background:"linear-gradient(135deg,#00d4ff,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",textTransform:"capitalize"}}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts + Counter */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,marginBottom:18}}>
          <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"14px 18px"}}>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--mono)",marginBottom:10}}>Equity Curve</div>
            <EquityChart trades={trades}/>
          </div>
          <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"14px 18px"}}>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--mono)",marginBottom:10}}>Emotion Distribution</div>
            <EmotionBar trades={trades}/>
          </div>
          <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"20px 28px",display:"flex",alignItems:"center"}}>
            <TradeCounter count={trades.length} onAddTrade={()=>navigate("trades")}/>
          </div>
        </div>

        {/* Nav Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {navCards.map(nc=>(
            <div key={nc.key} onClick={()=>navigate(nc.key)} style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"18px 20px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=nc.glow;e.currentTarget.style.borderColor=`${nc.color}44`;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--bg3)";e.currentTarget.style.borderColor="var(--bord)";e.currentTarget.style.transform="translateY(0)";}}
            >
              <div style={{fontSize:26,marginBottom:8}}>{nc.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--t1)",fontFamily:"var(--display)",marginBottom:2}}>{nc.title}</div>
              <div style={{fontSize:11,color:"var(--t3)"}}>{nc.sub}</div>
              <div style={{marginTop:10,fontSize:11,color:nc.color,fontWeight:600,fontFamily:"var(--mono)"}}>Open →</div>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:12,padding:"14px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--mono)"}}>Recent Trades</div>
            {trades.length>0&&<button onClick={()=>navigate("trades")} style={{background:"none",border:"none",color:"var(--a1)",fontSize:11,cursor:"pointer",fontFamily:"var(--mono)"}}>View all →</button>}
          </div>
          {recent.length>0?recent.map(t=>(
            <div key={t.id} onClick={()=>navigate("trades")} style={{display:"grid",gridTemplateColumns:"78px 90px 52px 1fr 90px",alignItems:"center",gap:10,padding:"10px",cursor:"pointer",borderBottom:"1px solid var(--bord)",transition:"background 0.1s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--bg2)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}
            >
              <span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{t.date}</span>
              <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{t.pair}</span>
              <span style={{fontSize:9,fontWeight:700,color:t.direction==="LONG"?"#22c55e":"#ef4444",background:t.direction==="LONG"?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",padding:"2px 7px",borderRadius:4,textAlign:"center"}}>{t.direction}</span>
              <div style={{display:"flex",gap:4}}>{(t.confluences||[]).slice(0,2).map(c=><span key={c} style={{fontSize:9,color:"#7c3aed",background:"rgba(124,58,237,0.08)",padding:"1px 6px",borderRadius:10}}>{c}</span>)}</div>
              <span style={{fontSize:13,fontWeight:700,fontFamily:"var(--mono)",textAlign:"right",color:t.pnl>=0?"#22c55e":"#ef4444"}}>{fmt(t.pnl)}</span>
            </div>
          )):<div style={{color:"var(--t3)",fontSize:12,fontStyle:"italic",padding:"20px 0",textAlign:"center"}}>No trades yet</div>}
        </div>
      </div>
    </div>
  );
}
