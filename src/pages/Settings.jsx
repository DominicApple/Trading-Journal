import { useState } from "react";
import { PageHeader } from "../components/Shared";
import { THEMES } from "../themes";
import { uid, MONTHS } from "../utils";

// ── Theme Grid ──
function ThemeGrid({ currentId, onSelect }) {
  const [mode, setMode] = useState("dark");
  const filtered = THEMES.filter(t => t.mode === mode);
  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {["dark","light"].map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{padding:"6px 20px",borderRadius:8,border:"1px solid var(--bord)",background:mode===m?"var(--a1)":"var(--bg3)",color:mode===m?"#fff":"var(--t2)",fontSize:12,fontWeight:600,cursor:"pointer",textTransform:"capitalize",transition:"all 0.15s"}}>{m}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
        {filtered.map(th=>(
          <div key={th.id} onClick={()=>onSelect(th.id)} style={{
            borderRadius:10, overflow:"hidden", cursor:"pointer",
            border:`2px solid ${currentId===th.id?"var(--a1)":"var(--bord)"}`,
            transform:currentId===th.id?"scale(1.02)":"scale(1)",
            transition:"all 0.15s",
            boxShadow:currentId===th.id?`0 0 16px ${th.a1}44`:"none",
          }}>
            {/* Preview swatch */}
            <div style={{background:th.bg,padding:"12px",height:80,position:"relative"}}>
              <div style={{background:th.bg2,borderRadius:6,padding:"6px 8px",marginBottom:6,border:`1px solid ${th.bord}`}}>
                <div style={{height:6,width:"60%",borderRadius:3,background:th.a1,marginBottom:3}}/>
                <div style={{height:4,width:"40%",borderRadius:3,background:th.t3}}/>
              </div>
              <div style={{display:"flex",gap:4}}>
                <div style={{height:12,flex:2,borderRadius:3,background:th.a1}}/>
                <div style={{height:12,flex:1,borderRadius:3,background:th.a2}}/>
              </div>
              {currentId===th.id&&<div style={{position:"absolute",top:6,right:6,fontSize:12}}>✓</div>}
            </div>
            <div style={{background:th.bg2,padding:"8px 10px",borderTop:`1px solid ${th.bord}`}}>
              <div style={{fontSize:11,fontWeight:600,color:th.t1,fontFamily:"var(--display)"}}>{th.name}</div>
              <div style={{fontSize:9,color:th.t3,fontFamily:"var(--mono)",marginTop:2,textTransform:"capitalize"}}>{th.mode}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Theme Builder ──
function CustomThemeBuilder({ custom, onSave }) {
  const defaults = { bg:"#0a0b0e", bg2:"#111318", bg3:"rgba(255,255,255,0.02)", bord:"rgba(255,255,255,0.06)", t1:"#e5e7eb", t2:"#9ca3af", t3:"#4b5563", a1:"#3b82f6", a2:"#7c3aed" };
  const [c, setC] = useState(custom || defaults);
  const set = (k,v) => setC(p=>({...p,[k]:v}));
  const fields = [
    {k:"bg",    l:"Background"},
    {k:"bg2",   l:"Panel / Modal"},
    {k:"bg3",   l:"Card Surface"},
    {k:"t1",    l:"Primary Text"},
    {k:"t2",    l:"Secondary Text"},
    {k:"t3",    l:"Muted Text"},
    {k:"a1",    l:"Accent 1"},
    {k:"a2",    l:"Accent 2"},
  ];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        {fields.map(f=>(
          <div key={f.k}>
            <label style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{f.l}</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="color" value={c[f.k]?.startsWith("#")?c[f.k]:"#000000"} onChange={e=>set(f.k,e.target.value)} style={{width:36,height:36,borderRadius:6,border:"1px solid var(--bord)",background:"none",cursor:"pointer",padding:2}}/>
              <input value={c[f.k]} onChange={e=>set(f.k,e.target.value)} style={{flex:1,background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:8,padding:"7px 10px",color:"var(--t1)",fontSize:12,fontFamily:"var(--mono)",outline:"none"}}/>
            </div>
          </div>
        ))}
      </div>
      {/* Preview */}
      <div style={{borderRadius:12,overflow:"hidden",border:"1px solid var(--bord)",marginBottom:16}}>
        <div style={{background:c.bg,padding:16}}>
          <div style={{background:c.bg2,borderRadius:8,padding:12,border:`1px solid ${c.bord}`,marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700,color:c.t1,marginBottom:4}}>Preview Card</div>
            <div style={{fontSize:11,color:c.t2}}>Secondary text sample</div>
            <div style={{fontSize:10,color:c.t3,marginTop:2}}>Muted text sample</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,background:c.a1,borderRadius:6,padding:"8px 12px",color:"#fff",fontSize:11,fontWeight:600,textAlign:"center"}}>Accent 1</div>
            <div style={{flex:1,background:c.a2,borderRadius:6,padding:"8px 12px",color:"#fff",fontSize:11,fontWeight:600,textAlign:"center"}}>Accent 2</div>
          </div>
        </div>
      </div>
      <button onClick={()=>onSave(c)} style={{padding:"10px 28px",borderRadius:8,border:"none",background:`linear-gradient(135deg,var(--a1),var(--a2))`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Apply Custom Theme</button>
    </div>
  );
}

// ── Account Manager ──
function AccountManager({ accounts, onRename }) {
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState("");
  return (
    <div>
      {accounts.map(acc=>(
        <div key={acc.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:10,marginBottom:8}}>
          <div style={{flex:1}}>
            {editing===acc.id ? (
              <input autoFocus value={val} onChange={e=>setVal(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){onRename(acc.id,val);setEditing(null);}if(e.key==="Escape")setEditing(null);}}
                style={{background:"var(--bg2)",border:"1px solid var(--a1)",borderRadius:6,padding:"6px 10px",color:"var(--t1)",fontSize:13,fontFamily:"var(--mono)",outline:"none",width:"100%"}}/>
            ) : (
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--t1)",fontFamily:"var(--display)"}}>{acc.name}</div>
                <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{acc.id} · ${(acc.startBalance||0).toLocaleString()}</div>
              </div>
            )}
          </div>
          {editing===acc.id ? (
            <button onClick={()=>{onRename(acc.id,val);setEditing(null);}} style={{padding:"6px 16px",borderRadius:7,border:"none",background:"var(--a1)",color:"#fff",fontSize:12,cursor:"pointer"}}>Save</button>
          ) : (
            <button onClick={()=>{setEditing(acc.id);setVal(acc.name);}} style={{padding:"6px 16px",borderRadius:7,border:"1px solid var(--bord)",background:"var(--bg2)",color:"var(--t2)",fontSize:12,cursor:"pointer"}}>Rename</button>
          )}
        </div>
      ))}
      {!accounts.length&&<div style={{color:"var(--t3)",fontSize:13,fontStyle:"italic",padding:"20px 0",textAlign:"center"}}>No accounts</div>}
    </div>
  );
}

// ── Data Export ──
function DataExport({ trades, projections, backtests, accountName }) {
  const exportCSV = () => {
    const headers = ["Date","Pair","Direction","Entry","Exit","Lots","Result","P&L","Emotion","Rating","Confluences","Quick Thoughts"];
    const rows = trades.map(t=>[
      t.date,t.pair,t.direction,t.entry,t.exit,t.size,t.result,t.pnl,t.emotion,t.rating||3,
      (t.confluences||[]).join("; "),(t.quickThoughts||[]).join("; ")
    ]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`${accountName||"tradelog"}-trades.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = JSON.stringify({trades,projections,backtests},null,2);
    const blob  = new Blob([data],{type:"application/json"});
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a");
    a.href=url; a.download=`${accountName||"tradelog"}-backup.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const btnStyle = {
    padding:"12px 24px",borderRadius:10,border:"1px solid var(--bord)",
    background:"var(--bg3)",color:"var(--t1)",fontSize:13,fontWeight:600,
    cursor:"pointer",fontFamily:"var(--display)",transition:"all 0.15s",
    display:"flex",flexDirection:"column",alignItems:"center",gap:6,
  };

  return (
    <div>
      <div style={{fontSize:12,color:"var(--t2)",marginBottom:20,lineHeight:1.6}}>
        Export your trading data. The <strong>CSV file</strong> opens directly in Excel with full filter support. The <strong>JSON backup</strong> contains all data including backtest notes and images.
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <button onClick={exportCSV} style={btnStyle}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--a1)";e.currentTarget.style.background="var(--bg2)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bord)";e.currentTarget.style.background="var(--bg3)";}}>
          <span style={{fontSize:28}}>📊</span>
          <span>Export Trades to CSV</span>
          <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>Excel compatible · {trades.length} trades</span>
        </button>
        <button onClick={exportJSON} style={btnStyle}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--a1)";e.currentTarget.style.background="var(--bg2)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bord)";e.currentTarget.style.background="var(--bg3)";}}>
          <span style={{fontSize:28}}>💾</span>
          <span>Export Full Backup (JSON)</span>
          <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>All data including notes & links</span>
        </button>
      </div>
    </div>
  );
}

// ── Logo Customizer ──
function LogoCustomizer({ emoji, g1, g2, onSave }) {
  const [e,setE]=useState(emoji||"⚡");
  const [c1,setC1]=useState(g1||"#3b82f6");
  const [c2,setC2]=useState(g2||"#7c3aed");
  const presets=["⚡","📈","💹","🎯","🔥","💎","⚔️","🌊","🦅","🏆"];
  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>Logo Icon</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {presets.map(p=>(
            <button key={p} onClick={()=>setE(p)} style={{width:40,height:40,borderRadius:8,border:`1px solid ${e===p?"var(--a1)":"var(--bord)"}`,background:e===p?"var(--bg2)":"var(--bg3)",fontSize:20,cursor:"pointer",transition:"all 0.15s"}}>{p}</button>
          ))}
        </div>
        <input value={e} onChange={ev=>setE(ev.target.value)} placeholder="Or type any emoji..." style={{background:"var(--bg3)",border:"1px solid var(--bord)",borderRadius:8,padding:"8px 12px",color:"var(--t1)",fontSize:16,fontFamily:"var(--mono)",outline:"none",width:180}}/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>Logo Gradient</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div><div style={{fontSize:11,color:"var(--t2)",marginBottom:4}}>Color 1</div><input type="color" value={c1} onChange={ev=>setC1(ev.target.value)} style={{width:48,height:36,borderRadius:6,border:"1px solid var(--bord)",padding:2,cursor:"pointer",background:"none"}}/></div>
          <div style={{fontSize:16,color:"var(--t3)"}}>→</div>
          <div><div style={{fontSize:11,color:"var(--t2)",marginBottom:4}}>Color 2</div><input type="color" value={c2} onChange={ev=>setC2(ev.target.value)} style={{width:48,height:36,borderRadius:6,border:"1px solid var(--bord)",padding:2,cursor:"pointer",background:"none"}}/></div>
          <div style={{width:50,height:50,borderRadius:10,background:`linear-gradient(135deg,${c1},${c2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 0 16px ${c1}55`,marginLeft:12}}>{e}</div>
        </div>
      </div>
      <button onClick={()=>onSave(e,c1,c2)} style={{padding:"10px 28px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${c1},${c2})`,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Apply Logo</button>
    </div>
  );
}

// ── Settings Page ──
const TABS = ["Themes","Custom Theme","Logo","Accounts","Export"];

export default function SettingsPage({ settings, onUpdateSettings, accounts, onRenameAccount, trades, projections, backtests, onHome, onBack, logoEmoji, logoG1, logoG2 }) {
  const [tab, setTab] = useState("Themes");
  const accountName = accounts[0]?.name;

  return (
    <div style={{minHeight:"100vh"}}>
      <PageHeader title="Settings" onHome={onHome} onBack={onBack} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}/>
      <div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"1px solid var(--bord)",paddingBottom:0}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 18px",borderRadius:"8px 8px 0 0",border:"1px solid",borderBottom:"none",borderColor:tab===t?"var(--bord)":"transparent",background:tab===t?"var(--bg2)":"transparent",color:tab===t?"var(--t1)":"var(--t3)",fontSize:13,fontWeight:tab===t?600:400,cursor:"pointer",fontFamily:"var(--display)",transition:"all 0.15s",marginBottom:"-1px"}}>
              {t}
            </button>
          ))}
        </div>

        {tab==="Themes"&&(
          <ThemeGrid currentId={settings.themeId} onSelect={id=>onUpdateSettings({themeId:id,customTheme:null})}/>
        )}
        {tab==="Custom Theme"&&(
          <CustomThemeBuilder custom={settings.customTheme} onSave={ct=>onUpdateSettings({customTheme:ct})}/>
        )}
        {tab==="Logo"&&(
          <LogoCustomizer emoji={settings.logoEmoji} g1={settings.logoG1} g2={settings.logoG2} onSave={(e,g1,g2)=>onUpdateSettings({logoEmoji:e,logoG1:g1,logoG2:g2})}/>
        )}
        {tab==="Accounts"&&(
          <AccountManager accounts={accounts} onRename={onRenameAccount}/>
        )}
        {tab==="Export"&&(
          <DataExport trades={trades} projections={projections} backtests={backtests} accountName={accountName}/>
        )}
      </div>
    </div>
  );
}
