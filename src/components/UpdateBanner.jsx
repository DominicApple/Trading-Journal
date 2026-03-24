import { useState, useEffect } from "react";

/* ── helpers ── */
const fmtBytes = b => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
const fmtSpeed = b => b > 1048576 ? `${(b/1048576).toFixed(1)} MB/s` : `${(b/1024).toFixed(0)} KB/s`;

/* Parse release notes — GitHub sends HTML or plain text */
function parseNotes(raw) {
  if (!raw) return [];
  // Strip HTML tags
  const plain = raw.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&");
  return plain.split(/\n/).map(l => l.trim()).filter(l => l.length > 1);
}

/* ── Changelog Modal ── */
function ChangelogModal({ version, notes, onClose }) {
  const lines = parseNotes(notes);
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",
      zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
      animation:"fadeIn .15s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"var(--bg2,#111318)",border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:16,padding:32,maxWidth:520,width:"90%",maxHeight:"70vh",
        display:"flex",flexDirection:"column",gap:16,
      }}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:"var(--t1,#e5e7eb)",fontFamily:"var(--display)"}}>
              What's New in v{version}
            </div>
            <div style={{fontSize:12,color:"var(--t3,#6b7280)",marginTop:2}}>Release notes</div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:8,color:"var(--t2,#9ca3af)",padding:"6px 12px",cursor:"pointer",fontSize:13,
          }}>✕ Close</button>
        </div>

        {/* Notes */}
        <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:8}}>
          {lines.length === 0 ? (
            <div style={{color:"var(--t3,#6b7280)",fontSize:13}}>No release notes provided.</div>
          ) : lines.map((line,i) => (
            <div key={i} style={{
              display:"flex",gap:10,alignItems:"flex-start",
              padding:"8px 12px",background:"rgba(255,255,255,0.03)",
              borderRadius:8,border:"1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{color:"var(--a1,#3b82f6)",fontWeight:700,marginTop:1}}>›</span>
              <span style={{fontSize:13,color:"var(--t1,#e5e7eb)",lineHeight:1.5}}>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main UpdateBanner ── */
export default function UpdateBanner() {
  const [state, setState] = useState("idle"); // idle | available | downloading | ready | error
  const [info,  setInfo]  = useState({});
  const [progress, setProgress] = useState(0);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    const u = window.electronUpdater;
    if (!u) return;

    u.onUpdateAvailable(d => {
      setState("available");
      setInfo(d);
    });
    u.onUpdateProgress(d => {
      setState("downloading");
      setProgress(d.percent || 0);
      setInfo(prev => ({ ...prev, ...d }));
    });
    u.onUpdateDownloaded(d => {
      setState("ready");
      setInfo(prev => ({ ...prev, ...d }));
    });
    u.onUpdateError(d => {
      setState("error");
      setInfo(d);
    });

    return () => u.removeAllListeners();
  }, []);

  if (state === "idle") return null;

  /* ── Styles ── */
  const banner = {
    position:"fixed", top:0, left:0, right:0, zIndex:9000,
    background: state==="ready"   ? "linear-gradient(90deg,#16a34a,#15803d)"
               : state==="error"  ? "linear-gradient(90deg,#dc2626,#b91c1c)"
               : state==="downloading" ? "linear-gradient(90deg,#1d4ed8,#4f46e5)"
               : "linear-gradient(90deg,#1d4ed8,#7c3aed)",
    padding:"10px 20px",
    display:"flex", alignItems:"center", gap:12,
    boxShadow:"0 2px 20px rgba(0,0,0,0.4)",
    animation:"fadeIn .2s ease",
  };
  const txt = { color:"#fff", fontSize:13, fontWeight:600 };
  const sub = { color:"rgba(255,255,255,0.75)", fontSize:12 };
  const btn = (bg) => ({
    background: bg || "rgba(255,255,255,0.15)",
    border:"1px solid rgba(255,255,255,0.25)",
    borderRadius:8, color:"#fff", padding:"5px 14px",
    cursor:"pointer", fontSize:12, fontWeight:600,
    whiteSpace:"nowrap",
  });

  return (
    <>
      <div style={banner}>
        {/* Icon */}
        <span style={{fontSize:18}}>
          { state==="ready"       ? "✅"
          : state==="error"       ? "⚠️"
          : state==="downloading" ? "⬇️"
          : "🔔" }
        </span>

        {/* Text */}
        <div style={{flex:1}}>
          { state==="available" && <>
            <div style={txt}>Update Available — v{info.version}</div>
            <div style={sub}>Downloading in the background…</div>
          </>}
          { state==="downloading" && <>
            <div style={{...txt,display:"flex",alignItems:"center",gap:10}}>
              Downloading v{info.version}
              <span style={{fontWeight:400,...sub}}>{progress}%</span>
              {info.bytesPerSecond && <span style={sub}>{fmtSpeed(info.bytesPerSecond)}</span>}
            </div>
            {/* Progress bar */}
            <div style={{marginTop:4,height:4,background:"rgba(255,255,255,0.2)",borderRadius:4,width:"100%",maxWidth:360}}>
              <div style={{height:"100%",borderRadius:4,background:"rgba(255,255,255,0.9)",width:`${progress}%`,transition:"width .3s ease"}}/>
            </div>
          </>}
          { state==="ready" && <>
            <div style={txt}>Update Ready — v{info.version}</div>
            <div style={sub}>Restart TradeLog to apply the update</div>
          </>}
          { state==="error" && <>
            <div style={txt}>Update Failed</div>
            <div style={sub}>{info.message || "An error occurred while updating."}</div>
          </>}
        </div>

        {/* Buttons */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {(state==="available"||state==="downloading"||state==="ready") && info.releaseNotes && (
            <button style={btn()} onClick={()=>setShowLog(true)}>What's New</button>
          )}
          {state==="ready" && (
            <button style={btn("rgba(255,255,255,0.25)")}
              onClick={()=>window.electronUpdater?.installUpdate()}>
              Restart &amp; Update
            </button>
          )}
          {state==="error" && (
            <button style={btn()} onClick={()=>setState("idle")}>Dismiss</button>
          )}
        </div>
      </div>

      {/* Offset page content so banner doesn't overlap */}
      <div style={{height:42}} />

      {showLog && (
        <ChangelogModal
          version={info.version}
          notes={info.releaseNotes}
          onClose={()=>setShowLog(false)}
        />
      )}
    </>
  );
}
