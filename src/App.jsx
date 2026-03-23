import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   TRADELOG — Personal Desktop Trading Journal
   Local storage • No internet • Just for you
   ═══════════════════════════════════════════════ */

const CONFLUENCES = ["HTF Orderflow", "FVG", "IFVG", "Order Block", "SMT", "Breaker"];
const EMOTIONS = ["confident", "calm", "anxious", "frustrated", "neutral", "euphoric"];
const EMOTION_COLORS = {
  confident: "#22c55e", calm: "#3b82f6", anxious: "#f59e0b",
  frustrated: "#ef4444", neutral: "#64748b", euphoric: "#a855f7",
};
const EMOTION_ICONS = {
  confident: "🟢", calm: "🔵", anxious: "🟡", frustrated: "🔴", neutral: "⚪", euphoric: "🟣",
};

const fmt = (v) => `${v >= 0 ? "+" : ""}$${Math.abs(v).toFixed(2)}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);

// ── Persistent state hook ──
// Uses electron-store (via preload bridge) when running in Electron
// Falls back to localStorage when running in browser (dev mode)
function useLocalState(key, initial) {
  const storageKey = `tradelog_${key}`;
  const isElectron = typeof window !== "undefined" && window.electronStore;

  const [val, setVal] = useState(() => {
    // Synchronous init from localStorage (fast, available immediately)
    if (!isElectron) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) return JSON.parse(stored);
      } catch {}
    }
    return initial;
  });

  const [loaded, setLoaded] = useState(!isElectron);

  // Async load from electron-store on mount
  useEffect(() => {
    if (!isElectron) return;
    (async () => {
      try {
        const stored = await window.electronStore.get(storageKey);
        if (stored !== undefined && stored !== null) {
          setVal(stored);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Save on change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    if (isElectron) {
      window.electronStore.set(storageKey, val).catch(() => {});
    } else {
      try {
        localStorage.setItem(storageKey, JSON.stringify(val));
      } catch {}
    }
  }, [val, loaded]);

  return [val, setVal];
}

// ═══════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════

function Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, lineHeight: 1, flexShrink: 0,
      boxShadow: "0 0 16px rgba(99,102,241,0.35)",
    }}>⚡</div>
  );
}

function LogoButton({ onClick, size = 30 }) {
  return (
    <button onClick={onClick} title="Back to Homepage" style={{
      width: size, height: size, borderRadius: size * 0.22, border: "none", cursor: "pointer",
      background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.5, lineHeight: 1, padding: 0, flexShrink: 0,
      boxShadow: "0 0 14px rgba(99,102,241,0.35)",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.55)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 14px rgba(99,102,241,0.35)"; }}
    >⚡</button>
  );
}

function PageHeader({ title, onHome, children }) {
  return (
    <div style={{
      padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(255,255,255,0.012)", position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LogoButton onClick={onHome} />
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--display)", color: "#e5e7eb", letterSpacing: "-0.01em" }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{children}</div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, accent, sub, icon }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)",
      borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 130,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -8, right: -8, fontSize: 36, opacity: 0.04 }}>{icon}</div>
      <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent || "#e5e7eb", fontFamily: "var(--mono)", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4, fontFamily: "var(--mono)" }}>{sub}</div>}
    </div>
  );
}

// ── Equity Curve ──
function EquityChart({ trades }) {
  if (trades.length < 2) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, color: "#374151", fontSize: 12, fontStyle: "italic" }}>
      Need 2+ trades for equity curve
    </div>
  );
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let c = 0; const data = sorted.map(t => { c += t.pnl; return c; });
  const w = 500, h = 90, min = Math.min(0, ...data), max = Math.max(0, ...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * (h - 10) - 5]);
  const line = pts.map(p => p.join(",")).join(" ");
  const color = data[data.length - 1] >= 0 ? "#22c55e" : "#ef4444";
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs><linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.2" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon fill="url(#eqFill)" points={`0,${h} ${line} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line} />
      {pts.length > 0 && <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill={color} />}
    </svg>
  );
}

// ── Emotion Bar ──
function EmotionBar({ trades }) {
  if (!trades.length) return <div style={{ color: "#374151", fontSize: 12, fontStyle: "italic" }}>No emotion data yet</div>;
  const total = trades.length;
  return (
    <div>
      <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
        {EMOTIONS.map(em => {
          const count = trades.filter(t => t.emotion === em).length;
          if (!count) return null;
          return <div key={em} style={{ flex: count, background: EMOTION_COLORS[em], transition: "flex 0.4s ease" }} />;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {EMOTIONS.map(em => {
          const count = trades.filter(t => t.emotion === em).length;
          if (!count) return null;
          const pct = ((count / total) * 100).toFixed(0);
          return (
            <div key={em} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: EMOTION_COLORS[em] }} />
              <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "capitalize" }}>{em}</span>
              <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)" }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Spinning Trade Counter (Neon Gradient) ──
function TradeCounter({ count, onPress, onUndo }) {
  const [flash, setFlash] = useState(false);
  const [undoFlash, setUndoFlash] = useState(false);
  const handlePress = () => { onPress(); setFlash(true); setTimeout(() => setFlash(false), 600); };
  const handleUndo = () => { if (count > 0) { onUndo(); setUndoFlash(true); setTimeout(() => setUndoFlash(false), 400); } };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="84" height="84" style={{ position: "absolute", animation: "spin 3s linear infinite" }}>
          <defs>
            <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
            <linearGradient id="neonGradBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#c026d3" stopOpacity="0.12" />
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="42" cy="42" r="37" fill="none" stroke="url(#neonGradBg)" strokeWidth="2.5" />
          <circle cx="42" cy="42" r="37" fill="none" stroke="url(#neonGrad)" strokeWidth="3"
            strokeDasharray="50 183" strokeLinecap="round" filter="url(#neonGlow)" />
        </svg>
        <span style={{
          fontSize: 26, fontWeight: 700,
          color: flash ? "#00d4ff" : undoFlash ? "#ef4444" : "#7c3aed",
          textShadow: flash ? "0 0 20px rgba(0,212,255,0.6)" : undoFlash ? "0 0 12px rgba(239,68,68,0.4)" : "0 0 16px rgba(124,58,237,0.4)",
          fontFamily: "var(--mono)", zIndex: 1,
          transition: "color 0.3s, transform 0.3s, text-shadow 0.3s",
          transform: flash ? "scale(1.25)" : undoFlash ? "scale(0.85)" : "scale(1)",
        }}>{count}</span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={handlePress} style={{
          padding: "9px 20px", borderRadius: 10,
          border: "1px solid rgba(0,212,255,0.2)",
          background: flash
            ? "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(124,58,237,0.25))"
            : "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))",
          color: "#00d4ff", fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "var(--display)", transition: "all 0.2s",
          backgroundClip: "padding-box",
          position: "relative", overflow: "hidden",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,255,0.15), 0 0 20px rgba(124,58,237,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))"; e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ color: "#00d4ff" }}>I Took a Trade</span>
        </button>
        <button onClick={handleUndo} title="Remove a trade" style={{
          width: 34, height: 34, borderRadius: 8,
          border: "1px solid rgba(239,68,68,0.15)",
          background: undoFlash ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.05)",
          color: count > 0 ? "#ef4444" : "#1f2937", fontSize: 14, cursor: count > 0 ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", opacity: count > 0 ? 1 : 0.3,
        }}
          onMouseEnter={e => { if (count > 0) { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)"; }}
        >−</button>
      </div>
      <span style={{
        fontSize: 9, fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#6b5ce7",
      }}>total trades taken</span>
    </div>
  );
}

// ── Empty State ──
function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280", marginBottom: 4, fontFamily: "var(--display)" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 16, maxWidth: 300 }}>{subtitle}</div>
      {action && (
        <button onClick={onAction} style={{
          padding: "8px 20px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>{action}</button>
      )}
    </div>
  );
}

// ── Trade Card ──
function TradeCard({ trade, onClick }) {
  const isWin = trade.result === "win";
  return (
    <div onClick={onClick} style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)",
      borderRadius: 12, padding: "16px 18px", cursor: "pointer",
      borderLeft: `3px solid ${isWin ? "#22c55e" : "#ef4444"}`,
      transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb" }}>{trade.pair}</div>
          <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "var(--mono)", marginTop: 2 }}>{trade.date}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: trade.direction === "LONG" ? "#22c55e" : "#ef4444",
            background: trade.direction === "LONG" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            padding: "3px 10px", borderRadius: 5,
          }}>{trade.direction}</span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: isWin ? "#22c55e" : "#ef4444",
            background: isWin ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            padding: "3px 8px", borderRadius: 5,
          }}>{isWin ? "WIN" : "LOSS"}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 10, fontSize: 11, fontFamily: "var(--mono)" }}>
        <span style={{ color: "#4b5563" }}>Entry <span style={{ color: "#9ca3af" }}>{trade.entry}</span></span>
        <span style={{ color: "#4b5563" }}>Exit <span style={{ color: "#9ca3af" }}>{trade.exit}</span></span>
        <span style={{ color: "#4b5563" }}>Lots <span style={{ color: "#9ca3af" }}>{trade.size}</span></span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {trade.confluences.slice(0, 3).map(c => (
            <span key={c} style={{ fontSize: 9, color: "#c4b5fd", background: "rgba(167,139,250,0.1)", padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(167,139,250,0.12)" }}>{c}</span>
          ))}
          {trade.confluences.length > 3 && <span style={{ fontSize: 9, color: "#4b5563" }}>+{trade.confluences.length - 3}</span>}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)", color: isWin ? "#22c55e" : "#ef4444" }}>{fmt(trade.pnl)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontSize: 11 }}>{EMOTION_ICONS[trade.emotion]}</span>
        <span style={{ fontSize: 10, color: "#6b7280", textTransform: "capitalize" }}>{trade.emotion}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, letterSpacing: 1 }}>
          {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= trade.rating ? "#f59e0b" : "#1f2937" }}>★</span>)}
        </span>
      </div>
    </div>
  );
}

// ── Trade Form ──
function TradeForm({ onSave, onCancel }) {
  const [f, setF] = useState({
    date: today(), pair: "", direction: "LONG", entry: "", exit: "", size: "0.01",
    emotion: "neutral", rating: 3, confluences: [], notes: "", result: "win", pnl: "",
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggleConf = (c) => setF(p => ({ ...p, confluences: p.confluences.includes(c) ? p.confluences.filter(x => x !== c) : [...p.confluences, c] }));

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "9px 12px", color: "#e5e7eb", fontSize: 13, fontFamily: "var(--mono)",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const lbl = { fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block", fontFamily: "var(--mono)" };

  const handleSave = () => {
    if (!f.pair || !f.entry || !f.exit || !f.pnl) return;
    onSave({
      ...f, id: uid(),
      entry: parseFloat(f.entry), exit: parseFloat(f.exit),
      size: parseFloat(f.size), pnl: f.result === "win" ? Math.abs(parseFloat(f.pnl)) : -Math.abs(parseFloat(f.pnl)),
      pair: f.pair.toUpperCase(), journal: "",
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(6px)", animation: "fadeIn 0.15s ease",
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111318", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
        padding: 28, width: 460, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e7eb", marginBottom: 20, fontFamily: "var(--display)" }}>Log New Trade</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div><label style={lbl}>Date</label><input type="date" value={f.date} onChange={e => set("date", e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Pair / Symbol</label><input placeholder="EUR/USD" value={f.pair} onChange={e => set("pair", e.target.value)} style={inp} /></div>
          <div>
            <label style={lbl}>Direction</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["LONG", "SHORT"].map(d => (
                <button key={d} onClick={() => set("direction", d)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid",
                  borderColor: f.direction === d ? (d === "LONG" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.08)",
                  background: f.direction === d ? (d === "LONG" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)") : "transparent",
                  color: f.direction === d ? (d === "LONG" ? "#22c55e" : "#ef4444") : "#4b5563",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--mono)",
                }}>{d}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Lot Size</label><input type="number" step="0.01" min="0.01" value={f.size} onChange={e => set("size", e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Entry Price</label><input type="number" step="any" value={f.entry} onChange={e => set("entry", e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Exit Price</label><input type="number" step="any" value={f.exit} onChange={e => set("exit", e.target.value)} style={inp} /></div>
          <div>
            <label style={lbl}>Result</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["win", "loss"].map(r => (
                <button key={r} onClick={() => set("result", r)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid",
                  borderColor: f.result === r ? (r === "win" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.08)",
                  background: f.result === r ? (r === "win" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)") : "transparent",
                  color: f.result === r ? (r === "win" ? "#22c55e" : "#ef4444") : "#4b5563",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--mono)", textTransform: "uppercase",
                }}>{r}</button>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Profit / Loss ($)</label><input type="number" step="0.01" placeholder="0.00" value={f.pnl} onChange={e => set("pnl", e.target.value)} style={inp} /></div>
          <div>
            <label style={lbl}>Emotion</label>
            <select value={f.emotion} onChange={e => set("emotion", e.target.value)} style={{ ...inp, appearance: "none" }}>
              {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Rating</label>
            <div style={{ display: "flex", gap: 4, paddingTop: 5 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => set("rating", n)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 0,
                  color: n <= f.rating ? "#f59e0b" : "#1f2937", transition: "color 0.1s",
                }}>★</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lbl}>Confluences</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {CONFLUENCES.map(c => {
              const active = f.confluences.includes(c);
              return (
                <button key={c} onClick={() => toggleConf(c)} style={{
                  padding: "6px 14px", borderRadius: 20, border: "1px solid",
                  borderColor: active ? "#a78bfa" : "rgba(255,255,255,0.08)",
                  background: active ? "rgba(167,139,250,0.12)" : "transparent",
                  color: active ? "#c4b5fd" : "#4b5563",
                  fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
                }}>{c}</button>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lbl}>Notes</label>
          <textarea rows={3} value={f.notes} onChange={e => set("notes", e.target.value)}
            placeholder="What did you observe? What would you do differently?"
            style={{ ...inp, resize: "vertical" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 22px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 12, fontFamily: "var(--display)" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "9px 26px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--display)" }}>Save Trade</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PAGE: Trade Entry
// ═══════════════════════════════════════
function TradeEntryPage({ trades, setTrades, onHome }) {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [filter, setFilter] = useState("all");

  const sorted = [...trades]
    .filter(t => filter === "all" ? true : filter === "wins" ? t.result === "win" : t.result === "loss")
    .sort((a, b) => {
      if (sortBy === "date") return b.date.localeCompare(a.date);
      if (sortBy === "pair") return a.pair.localeCompare(b.pair);
      if (sortBy === "direction") return a.direction.localeCompare(b.direction);
      return 0;
    });

  const addTrade = (trade) => { setTrades(prev => [...prev, trade]); setShowForm(false); };
  const updateJournal = (id, text) => { setTrades(prev => prev.map(t => t.id === id ? { ...t, journal: text } : t)); };

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader title="Trade Entry" onHome={onHome}>
        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: 3 }}>
          {["all", "wins", "losses"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 12px", borderRadius: 5, border: "none",
              background: filter === f ? "rgba(255,255,255,0.07)" : "transparent",
              color: filter === f ? "#e5e7eb" : "#4b5563", fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.03)", borderRadius: 7, padding: 3 }}>
          {[["date","Date"],["pair","Pair"],["direction","Dir"]].map(([v,l]) => (
            <button key={v} onClick={() => setSortBy(v)} style={{
              padding: "4px 10px", borderRadius: 5, border: "none",
              background: sortBy === v ? "rgba(255,255,255,0.07)" : "transparent",
              color: sortBy === v ? "#e5e7eb" : "#4b5563", fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)",
            }}>{l}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} style={{
          padding: "7px 18px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>+ New Trade</button>
      </PageHeader>

      {selected ? (
        <div style={{ padding: 24, animation: "fadeIn 0.2s" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 12, fontFamily: "var(--mono)", marginBottom: 16 }}>← Back to cards</button>
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
            <TradeCard trade={selected} onClick={() => {}} />
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", marginBottom: 12, fontFamily: "var(--display)" }}>Trade Journal — {selected.pair} ({selected.date})</div>
              <textarea value={selected.journal || ""} onChange={e => { updateJournal(selected.id, e.target.value); setSelected(prev => ({...prev, journal: e.target.value})); }}
                placeholder="Write your thought process... What was your thesis? How did the market behave? What lessons did you learn?"
                style={{ width: "100%", minHeight: 320, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 18, color: "#d1d5db", fontSize: 13, lineHeight: 1.7, fontFamily: "var(--body)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 24 }}>
          {sorted.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 14 }}>
              {sorted.map(t => <TradeCard key={t.id} trade={t} onClick={() => setSelected(t)} />)}
            </div>
          ) : (
            <EmptyState icon="📋" title="No trades yet" subtitle="Start logging your trades to build your journal and track your performance over time." action="+ Log First Trade" onAction={() => setShowForm(true)} />
          )}
        </div>
      )}
      {showForm && <TradeForm onSave={addTrade} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════
// PAGE: Weekly Projections
// ═══════════════════════════════════════
function WeeklyProjectionPage({ projections, setProjections, onHome }) {
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [sortMonth, setSortMonth] = useState("all");
  const [sortYear, setSortYear] = useState("all");

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = [...new Set(projections.map(p => new Date(p.date).getFullYear()))].sort((a,b) => b-a);

  const filtered = projections
    .filter(p => { const d = new Date(p.date); if (sortYear !== "all" && d.getFullYear() !== parseInt(sortYear)) return false; if (sortMonth !== "all" && d.getMonth() !== parseInt(sortMonth)) return false; return true; })
    .sort((a, b) => b.date.localeCompare(a.date));

  const add = () => { if (!newTitle.trim()) return; const p = { id: uid(), date: today(), title: newTitle.trim(), content: "" }; setProjections(prev => [...prev, p]); setSelected(p); setShowNew(false); setNewTitle(""); };
  const updateContent = (id, content) => { setProjections(prev => prev.map(p => p.id === id ? { ...p, content } : p)); if (selected?.id === id) setSelected(prev => ({ ...prev, content })); };

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader title="Weekly Projections" onHome={onHome}>
        <select value={sortMonth} onChange={e => setSortMonth(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "#e5e7eb", fontSize: 11, fontFamily: "var(--mono)", outline: "none" }}>
          <option value="all">All Months</option>
          {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        {years.length > 0 && <select value={sortYear} onChange={e => setSortYear(e.target.value)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 10px", color: "#e5e7eb", fontSize: 11, fontFamily: "var(--mono)", outline: "none" }}>
          <option value="all">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>}
        <button onClick={() => setShowNew(true)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New</button>
      </PageHeader>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "calc(100vh - 51px)" }}>
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.05)", overflowY: "auto", padding: 12 }}>
          {showNew && (
            <div style={{ marginBottom: 12 }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Week title..." autoFocus onKeyDown={e => e.key === "Enter" && add()}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, padding: "8px 12px", color: "#e5e7eb", fontSize: 12, fontFamily: "var(--mono)", outline: "none", boxSizing: "border-box", marginBottom: 6 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={add} style={{ flex: 1, padding: 6, borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 11, cursor: "pointer" }}>Add</button>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b7280", fontSize: 11, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
          {filtered.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 3, cursor: "pointer", background: selected?.id === p.id ? "rgba(59,130,246,0.08)" : "transparent", borderLeft: selected?.id === p.id ? "2px solid #3b82f6" : "2px solid transparent" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{p.title}</div>
              <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", marginTop: 2 }}>{p.date}</div>
            </div>
          ))}
          {!filtered.length && !showNew && <EmptyState icon="🔮" title="No projections" subtitle="Plan your week ahead" />}
        </div>
        <div style={{ overflowY: "auto", padding: 24 }}>
          {selected ? (
            <div style={{ animation: "fadeIn 0.2s" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e5e7eb", marginBottom: 4, fontFamily: "var(--display)" }}>{selected.title}</div>
              <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "var(--mono)", marginBottom: 18 }}>{selected.date}</div>
              <textarea value={selected.content} onChange={e => updateContent(selected.id, e.target.value)} placeholder="Write your projections for the upcoming week..." style={{ width: "100%", minHeight: 420, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 20, color: "#d1d5db", fontSize: 14, lineHeight: 1.7, fontFamily: "var(--body)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          ) : <EmptyState icon="📝" title="Select a projection" subtitle="Choose from the sidebar or create a new one" />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PAGE: Backtest Recaps (Book Style)
// ═══════════════════════════════════════
function BacktestPage({ backtests, setBacktests, onHome }) {
  const [selected, setSelected] = useState(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [newDate, setNewDate] = useState(today());
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const DAY_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"];
  const DAY_ICONS = ["📘", "📗", "📙", "📕", "📓"];

  const add = () => {
    const d = new Date(newDate); const day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    const title = `${mon.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${fri.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;
    const bt = { id: uid(), title, startDate: newDate, days: DAYS.map(d => ({ day: d, content: "", screenshots: [] })) };
    setBacktests(prev => [...prev, bt]); setSelected(bt); setDayIdx(0); setShowNew(false);
  };

  const updateDay = (btId, idx, content) => {
    setBacktests(prev => prev.map(bt => { if (bt.id !== btId) return bt; const days = [...bt.days]; days[idx] = { ...days[idx], content }; return { ...bt, days }; }));
    if (selected?.id === btId) setSelected(prev => { const days = [...prev.days]; days[idx] = { ...days[idx], content }; return { ...prev, days }; });
  };

  const day = selected?.days[dayIdx];

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader title="Backtest Recaps" onHome={onHome}>
        <button onClick={() => setShowNew(true)} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New Week</button>
      </PageHeader>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "calc(100vh - 51px)" }}>
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.05)", overflowY: "auto", padding: 12 }}>
          {showNew && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: "#6b7280", fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>WEEK STARTING</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, padding: "8px 12px", color: "#e5e7eb", fontSize: 12, fontFamily: "var(--mono)", outline: "none", boxSizing: "border-box", marginBottom: 6 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={add} style={{ flex: 1, padding: 6, borderRadius: 6, border: "none", background: "#3b82f6", color: "#fff", fontSize: 11, cursor: "pointer" }}>Create</button>
                <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#6b7280", fontSize: 11, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
          {backtests.map(bt => (
            <div key={bt.id} onClick={() => { setSelected(bt); setDayIdx(0); }} style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 3, cursor: "pointer", background: selected?.id === bt.id ? "rgba(59,130,246,0.08)" : "transparent", borderLeft: selected?.id === bt.id ? "2px solid #3b82f6" : "2px solid transparent" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e5e7eb" }}>{bt.title}</div>
            </div>
          ))}
          {!backtests.length && !showNew && <EmptyState icon="📖" title="No backtests" subtitle="Create a weekly recap" />}
        </div>
        <div style={{ overflowY: "auto", padding: 24 }}>
          {selected && day ? (
            <div style={{ maxWidth: 720, margin: "0 auto", animation: "fadeIn 0.2s" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e7eb", textAlign: "center", fontFamily: "var(--display)", marginBottom: 16 }}>{selected.title}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 20 }}>
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => setDayIdx(i)} style={{
                    padding: "7px 16px", borderRadius: "10px 10px 0 0", border: "1px solid", borderBottom: "none",
                    borderColor: dayIdx === i ? "rgba(255,255,255,0.08)" : "transparent",
                    background: dayIdx === i ? "rgba(255,255,255,0.03)" : "transparent",
                    color: dayIdx === i ? DAY_COLORS[i] : "#4b5563", fontSize: 12, fontWeight: dayIdx === i ? 700 : 400,
                    cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
                  }}>{DAY_ICONS[i]} {d.slice(0,3)}</button>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 28, minHeight: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: DAY_COLORS[dayIdx], marginBottom: 16, fontFamily: "var(--display)" }}>{DAY_ICONS[dayIdx]} {day.day}</div>
                <textarea value={day.content} onChange={e => updateDay(selected.id, dayIdx, e.target.value)} placeholder={`Recap for ${day.day}... What happened in the markets? What setups played out?`}
                  style={{ width: "100%", minHeight: 260, background: "transparent", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 18, color: "#d1d5db", fontSize: 14, lineHeight: 1.7, fontFamily: "var(--body)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <button onClick={() => setDayIdx(Math.max(0, dayIdx - 1))} disabled={dayIdx === 0} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: dayIdx === 0 ? "transparent" : "rgba(255,255,255,0.02)", color: dayIdx === 0 ? "#1f2937" : "#6b7280", fontSize: 12, cursor: dayIdx === 0 ? "default" : "pointer" }}>← Previous</button>
                <span style={{ fontSize: 11, color: "#374151", fontFamily: "var(--mono)", alignSelf: "center" }}>{dayIdx + 1} / 5</span>
                <button onClick={() => setDayIdx(Math.min(4, dayIdx + 1))} disabled={dayIdx === 4} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: dayIdx === 4 ? "transparent" : "rgba(255,255,255,0.02)", color: dayIdx === 4 ? "#1f2937" : "#6b7280", fontSize: 12, cursor: dayIdx === 4 ? "default" : "pointer" }}>Next →</button>
              </div>
            </div>
          ) : <EmptyState icon="📖" title="Select a week" subtitle="Choose from the sidebar or create a new backtest" />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PAGE: Trade System (Entry Model & Rules)
// ═══════════════════════════════════════
function TradeSystemPage({ content, setContent, onHome }) {
  const sections = [
    { id: "model", title: "Entry Model", icon: "🎯", placeholder: "Describe your entry model... What does a valid setup look like? What timeframe do you analyze? What has to happen before you pull the trigger?" },
    { id: "rules", title: "Trading Rules", icon: "📏", placeholder: "List your trading rules... Max risk per trade, max trades per day, when to sit out, position sizing rules..." },
    { id: "confluences", title: "Confluence Checklist", icon: "✅", placeholder: "What confluences must be present? HTF orderflow alignment, FVG, Order Block, SMT divergence... How many do you need minimum?" },
    { id: "psychology", title: "Psychology & Mindset", icon: "🧠", placeholder: "How do you manage emotions? What do you do after a loss? After a win? When do you know you're not in the right headspace to trade?" },
    { id: "risk", title: "Risk Management", icon: "🛡️", placeholder: "Define your risk parameters... Stop loss rules, take profit strategy, max drawdown before stopping, lot sizing formula..." },
  ];

  // Parse content into sections
  const parsed = (() => {
    try { return JSON.parse(content) || {}; } catch { return {}; }
  })();
  const updateSection = (id, text) => {
    const updated = { ...parsed, [id]: text };
    setContent(JSON.stringify(updated));
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <PageHeader title="Trade System" onHome={onHome} />
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(124,58,237,0.04))",
          border: "1px solid rgba(0,212,255,0.1)", borderRadius: 14, padding: "20px 24px", marginBottom: 24,
        }}>
          <div style={{
            fontSize: 16, fontWeight: 700, fontFamily: "var(--display)", marginBottom: 4,
            background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Your Trading Playbook</div>
          <div style={{ fontSize: 12, color: "#4b5563" }}>Define how you trade. Your entry model, rules, confluences, psychology, and risk management — all in one place. This is your system.</div>
        </div>

        {sections.map((sec, i) => (
          <div key={sec.id} style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 12, padding: "18px 20px", marginBottom: 14,
            animation: `fadeIn 0.2s ease ${i * 0.05}s both`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{sec.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb", fontFamily: "var(--display)" }}>{sec.title}</span>
            </div>
            <textarea
              value={parsed[sec.id] || ""}
              onChange={e => updateSection(sec.id, e.target.value)}
              placeholder={sec.placeholder}
              style={{
                width: "100%", minHeight: 120, background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: 16,
                color: "#d1d5db", fontSize: 13, lineHeight: 1.7, fontFamily: "var(--body)",
                outline: "none", resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════
function Homepage({ trades, tradeCount, onTradePress, onTradeUndo, navigate, accountDropdown, onHome }) {
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const wins = trades.filter(t => t.result === "win");
  const losses = trades.filter(t => t.result === "loss");
  const avgWin = wins.length ? (wins.reduce((s, t) => s + t.pnl, 0) / wins.length).toFixed(2) : "—";
  const avgLoss = losses.length ? (losses.reduce((s, t) => s + t.pnl, 0) / losses.length).toFixed(2) : "—";
  const pf = losses.length && wins.length ? Math.abs(wins.reduce((s,t) => s+t.pnl, 0) / losses.reduce((s,t) => s+t.pnl, 0)).toFixed(2) : "—";
  const highW = wins.length ? Math.max(...wins.map(t => t.pnl)).toFixed(2) : "—";
  const highL = losses.length ? Math.min(...losses.map(t => t.pnl)).toFixed(2) : "—";
  const recent = [...trades].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);

  const navCards = [
    { key: "trades", icon: "📋", title: "Trade Entry", sub: "Log & review trades", color: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
    { key: "system", icon: "⚙️", title: "Trade System", sub: "Your entry model & rules", color: "#00d4ff", glow: "rgba(0,212,255,0.12)" },
    { key: "projections", icon: "🔮", title: "Weekly Projections", sub: "Plan your week", color: "#a855f7", glow: "rgba(168,85,247,0.15)" },
    { key: "backtest", icon: "📖", title: "Backtest Recaps", sub: "Weekly chart review", color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ height: 180, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 80%, #0f172a 100%)" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
          {Array.from({length: 24}, (_, i) => {
            const x = 20 + i * 42; const bull = i % 3 !== 0;
            const h = 18 + Math.sin(i * 0.7) * 35 + 25; const y = 90 - h/2;
            return (<g key={i}><line x1={x+8} y1={y-15} x2={x+8} y2={y+h+15} stroke={bull?"#22c55e":"#ef4444"} strokeWidth="1"/><rect x={x} y={y} width="16" height={h} rx="2" fill={bull?"#22c55e":"#ef4444"} opacity="0.7"/></g>);
          })}
          <polyline fill="none" stroke="#818cf8" strokeWidth="2" opacity="0.5" points={Array.from({length:24},(_,i)=>`${28+i*42},${85+Math.sin(i*0.4)*22}`).join(" ")} />
        </svg>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LogoButton onClick={onHome} size={46} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>TradeLog</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--mono)", marginTop: 2 }}>Personal Trading Journal</div>
            </div>
          </div>
          {accountDropdown}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(transparent, #0a0b0e)" }} />
      </div>

      <div style={{ padding: "20px 28px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, alignItems: "stretch" }}>
          {/* Total P&L with spinning neon green circle */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 160,
            display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -8, right: -8, fontSize: 36, opacity: 0.04 }}>📈</div>
            <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="72" height="72" style={{ position: "absolute", animation: "spin 4s linear infinite" }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff87" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#00ff87" />
                  </linearGradient>
                  <linearGradient id="pnlGradBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff87" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
                  </linearGradient>
                  <filter id="pnlGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="36" cy="36" r="32" fill="none" stroke="url(#pnlGradBg)" strokeWidth="2" />
                <circle cx="36" cy="36" r="32" fill="none" stroke="url(#pnlGrad)" strokeWidth="2.5"
                  strokeDasharray="45 156" strokeLinecap="round" filter="url(#pnlGlow)" />
              </svg>
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: totalPnl >= 0 ? "#00ff87" : "#ef4444",
                textShadow: totalPnl >= 0 ? "0 0 12px rgba(0,255,135,0.4)" : "0 0 12px rgba(239,68,68,0.4)",
                fontFamily: "var(--mono)", zIndex: 1,
              }}>{trades.length ? fmt(totalPnl) : "—"}</span>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 4 }}>Total P&L</div>
              <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "var(--mono)" }}>{trades.length} trades</div>
              <div style={{ fontSize: 10, color: "#374151", fontFamily: "var(--mono)", marginTop: 2 }}>{wins.length}W / {losses.length}L</div>
            </div>
          </div>
          <StatCard label="Avg Win" value={avgWin !== "—" ? `+$${avgWin}` : "—"} accent="#22c55e" sub={`${wins.length} wins`} icon="🟢" />
          <StatCard label="Avg Loss" value={avgLoss !== "—" ? `$${avgLoss}` : "—"} accent="#ef4444" sub={`${losses.length} losses`} icon="🔴" />
          <StatCard label="Profit Factor" value={pf} accent="#a855f7" icon="⚖️" />
          <StatCard label="Highest Win" value={highW !== "—" ? `+$${highW}` : "—"} accent="#34d399" icon="🏆" />
          <StatCard label="Highest Loss" value={highL !== "—" ? `$${highL}` : "—"} accent="#f87171" icon="💥" />
        </div>

        {/* Trade Report */}
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.03), rgba(124,58,237,0.03), rgba(192,38,211,0.02))",
          border: "1px solid rgba(0,212,255,0.08)",
          borderRadius: 14, padding: "20px 22px", marginBottom: 18,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: "40%", width: 100, height: 100, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative" }}>
            <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>Trade Report</div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15), transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, position: "relative" }}>
            {[
              { label: "Session", value: trades.length > 0 ? (() => { const hours = trades.map(t => { const d = new Date(t.date); return d.getHours ? d.getHours() : 12; }); return "London/NY"; })() : "—", sub: "most active", color: "#00d4ff" },
              { label: "Best Pair", value: trades.length > 0 ? (() => { const pairs = {}; trades.forEach(t => { if (!pairs[t.pair]) pairs[t.pair] = 0; pairs[t.pair] += t.pnl; }); const best = Object.entries(pairs).sort((a,b) => b[1]-a[1])[0]; return best ? best[0] : "—"; })() : "—", sub: "by total P&L", color: "#7c3aed" },
              { label: "Win Streak", value: (() => { let max = 0, cur = 0; [...trades].sort((a,b) => a.date.localeCompare(b.date)).forEach(t => { if (t.result === "win") { cur++; max = Math.max(max, cur); } else cur = 0; }); return max || "—"; })(), sub: "consecutive", color: "#00d4ff" },
              { label: "Avg R:R", value: (() => { const w = trades.filter(t => t.result === "win"); const l = trades.filter(t => t.result === "loss"); if (!w.length || !l.length) return "—"; const avgW = w.reduce((s,t) => s+Math.abs(t.pnl), 0)/w.length; const avgL = l.reduce((s,t) => s+Math.abs(t.pnl), 0)/l.length; return `1:${(avgW/avgL).toFixed(1)}`; })(), sub: "risk to reward", color: "#c026d3" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 10, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#4b5563", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 5 }}>{item.label}</div>
                <div style={{
                  fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)", lineHeight: 1.1,
                  background: `linear-gradient(135deg, ${item.color}, ${i % 2 === 0 ? '#7c3aed' : '#00d4ff'})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 3, fontFamily: "var(--mono)" }}>{item.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, position: "relative" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#4b5563", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 5 }}>Top Confluence</div>
              <div style={{
                fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)",
                background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {trades.length > 0 ? (() => {
                  const conf = {}; trades.filter(t => t.result === "win").forEach(t => t.confluences.forEach(c => { conf[c] = (conf[c]||0) + 1; }));
                  const top = Object.entries(conf).sort((a,b) => b[1]-a[1])[0];
                  return top ? top[0] : "—";
                })() : "—"}
              </div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 2, fontFamily: "var(--mono)" }}>highest win correlation</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#4b5563", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 5 }}>Best Emotion State</div>
              <div style={{
                fontSize: 14, fontWeight: 700, fontFamily: "var(--mono)", textTransform: "capitalize",
                background: "linear-gradient(135deg, #7c3aed, #c026d3)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {trades.length > 0 ? (() => {
                  const emo = {}; trades.filter(t => t.result === "win").forEach(t => { emo[t.emotion] = (emo[t.emotion]||0) + 1; });
                  const top = Object.entries(emo).sort((a,b) => b[1]-a[1])[0];
                  return top ? top[0] : "—";
                })() : "—"}
              </div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 2, fontFamily: "var(--mono)" }}>when you trade wins</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#4b5563", textTransform: "uppercase", fontFamily: "var(--mono)", marginBottom: 5 }}>Win Rate</div>
              <div style={{
                fontSize: 18, fontWeight: 700, fontFamily: "var(--mono)",
                background: "linear-gradient(135deg, #00d4ff, #c026d3)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {trades.length > 0 ? `${((trades.filter(t=>t.result==="win").length/trades.length)*100).toFixed(0)}%` : "—"}
              </div>
              <div style={{ fontSize: 10, color: "#374151", marginTop: 2, fontFamily: "var(--mono)" }}>overall accuracy</div>
            </div>
          </div>
        </div>

        {/* Middle: Equity + Emotion + Counter */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 10 }}>Equity Curve</div>
            <EquityChart trades={trades} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 10 }}>Emotion Distribution</div>
            <EmotionBar trades={trades} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: "20px 28px", display: "flex", alignItems: "center" }}>
            <TradeCounter count={tradeCount} onPress={onTradePress} onUndo={onTradeUndo} />
          </div>
        </div>

        {/* Nav Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {navCards.map(nc => (
            <div key={nc.key} onClick={() => navigate(nc.key)} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)",
              borderRadius: 12, padding: "18px 20px", cursor: "pointer", position: "relative", overflow: "hidden",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = nc.glow; e.currentTarget.style.borderColor = `${nc.color}30`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.055)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{nc.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb", fontFamily: "var(--display)", marginBottom: 2 }}>{nc.title}</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>{nc.sub}</div>
              <div style={{ marginTop: 10, fontSize: 11, color: nc.color, fontWeight: 600, fontFamily: "var(--mono)" }}>Open →</div>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--mono)" }}>Recent Trades</div>
            {trades.length > 0 && <button onClick={() => navigate("trades")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)" }}>View all →</button>}
          </div>
          {recent.length > 0 ? recent.map(t => (
            <div key={t.id} onClick={() => navigate("trades")} style={{
              display: "grid", gridTemplateColumns: "78px 90px 52px 1fr 90px",
              alignItems: "center", gap: 10, padding: "10px 10px", cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.1s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "var(--mono)" }}>{t.date}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{t.pair}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: t.direction === "LONG" ? "#22c55e" : "#ef4444", background: t.direction === "LONG" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", padding: "2px 7px", borderRadius: 4, textAlign: "center" }}>{t.direction}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {t.confluences.slice(0,2).map(c => <span key={c} style={{ fontSize: 9, color: "#7c3aed", background: "rgba(124,58,237,0.08)", padding: "1px 6px", borderRadius: 10 }}>{c}</span>)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", textAlign: "right", color: t.pnl >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(t.pnl)}</span>
            </div>
          )) : <EmptyState icon="📊" title="No trades yet" subtitle="Your recent trades will appear here" />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ACCOUNT DROPDOWN (for inside journal)
// ═══════════════════════════════════════
function AccountDropdownSmall({ accounts, activeId, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = accounts.find(a => a.id === activeId);
  return (
    <div ref={ref} style={{ position: "relative", zIndex: 100 }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
        {active?.name || active?.id}
        <span style={{ fontSize: 8, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}>▼</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 180, background: "#141519", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "fadeIn 0.1s" }}>
          {accounts.map(acc => (
            <div key={acc.id} onClick={() => { onSwitch(acc.id); setOpen(false); }} style={{ padding: "8px 12px", cursor: "pointer", background: acc.id === activeId ? "rgba(59,130,246,0.08)" : "transparent", fontSize: 12, color: acc.id === activeId ? "#e5e7eb" : "#6b7280" }}
              onMouseEnter={e => { if (acc.id !== activeId) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (acc.id !== activeId) e.currentTarget.style.background = "transparent"; }}
            >{acc.name} <span style={{ fontSize: 9, color: "#374151" }}>{acc.id}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// NEW HOMESCREEN (Account Overview)
// ═══════════════════════════════════════
function HomeScreen({ accounts, allData, onAddAccount, onDeleteAccount, onSelectAccount }) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");

  const handleAdd = () => {
    if (!newId.trim() || !newName.trim()) return;
    onAddAccount(newName.trim(), newId.trim(), parseFloat(newBalance) || 0);
    setNewId(""); setNewName(""); setNewBalance("");
  };

  const inp = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "10px 14px", color: "#e5e7eb", fontSize: 13, fontFamily: "var(--mono)",
    outline: "none", boxSizing: "border-box", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ height: 160, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 80%, #0f172a 100%)" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
          {Array.from({length: 24}, (_, i) => {
            const x = 20 + i * 42; const bull = i % 3 !== 0;
            const h = 18 + Math.sin(i * 0.7) * 35 + 25; const y = 80 - h/2;
            return (<g key={i}><line x1={x+8} y1={y-15} x2={x+8} y2={y+h+15} stroke={bull?"#22c55e":"#ef4444"} strokeWidth="1"/><rect x={x} y={y} width="16" height={h} rx="2" fill={bull?"#22c55e":"#ef4444"} opacity="0.7"/></g>);
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Logo size={46} />
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "var(--display)", letterSpacing: "-0.02em" }}>TradeLog</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--mono)" }}>Personal Trading Journal</div>
            </div>
          </div>
          {/* External Links */}
          <div style={{ display: "flex", gap: 8 }}>
            <a href="https://www.tradingview.com/chart/nNZCtpgP/" target="_blank" rel="noopener noreferrer" style={{
              padding: "7px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#e5e7eb", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "var(--display)",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >📊 TradingView</a>
            <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer" style={{
              padding: "7px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#e5e7eb", fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: "var(--display)",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.12)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >📅 Forex Factory</a>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, #0a0b0e)" }} />
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
        {/* Account Cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--mono)", marginBottom: 14 }}>
            Your Accounts {accounts.length > 0 && `(${accounts.length})`}
          </div>

          {accounts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {accounts.map(acc => {
                const d = allData[acc.id] || emptyAccountData();
                const pnl = d.trades.reduce((s, t) => s + t.pnl, 0);
                const balance = (acc.startBalance || 0) + pnl;
                const wins = d.trades.filter(t => t.result === "win").length;
                const losses = d.trades.filter(t => t.result === "loss").length;
                return (
                  <div key={acc.id} onClick={() => onSelectAccount(acc.id)} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "20px 22px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative", overflow: "hidden",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.06)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {/* Delete button */}
                    <button onClick={(e) => { e.stopPropagation(); onDeleteAccount(acc.id); }} style={{
                      position: "absolute", top: 10, right: 10, background: "none", border: "none",
                      color: "#1f2937", fontSize: 14, cursor: "pointer", padding: "2px 4px", borderRadius: 4,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#1f2937"; }}
                    >✕</button>

                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb", fontFamily: "var(--display)", marginBottom: 2 }}>{acc.name}</div>
                    <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", marginBottom: 14 }}>ID: {acc.id}</div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", marginBottom: 3 }}>BALANCE</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#e5e7eb", fontFamily: "var(--mono)" }}>${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", marginBottom: 3 }}>P&L</div>
                        <div style={{
                          fontSize: 16, fontWeight: 700, fontFamily: "var(--mono)",
                          color: pnl >= 0 ? "#22c55e" : "#ef4444",
                        }}>{fmt(pnl)}</div>
                      </div>
                    </div>

                    {d.trades.length > 0 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)" }}>
                        <span>{d.trades.length} trades</span>
                        <span style={{ color: "#22c55e" }}>{wins}W</span>
                        <span style={{ color: "#ef4444" }}>{losses}L</span>
                      </div>
                    )}

                    <div style={{ marginTop: 10, fontSize: 11, color: "#3b82f6", fontWeight: 600, fontFamily: "var(--mono)" }}>Open Journal →</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#374151", fontSize: 13 }}>No accounts yet. Add one below to get started.</div>
          )}
        </div>

        {/* Add Account Form */}
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "22px 24px",
        }}>
          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--mono)", marginBottom: 14 }}>Add Account</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>ACCOUNT ID</label>
              <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="FT4X8K2M" style={inp}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>ACCOUNT NAME</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="FTMO 100k" style={inp}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "#4b5563", fontFamily: "var(--mono)", display: "block", marginBottom: 4 }}>STARTING BALANCE</label>
              <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="100000" style={inp}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }} />
            </div>
            <button onClick={handleAdd} style={{
              padding: "10px 22px", borderRadius: 8, border: "none",
              background: newId.trim() && newName.trim() ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.04)",
              color: newId.trim() && newName.trim() ? "#fff" : "#374151",
              fontSize: 13, fontWeight: 600, cursor: newId.trim() && newName.trim() ? "pointer" : "default",
              fontFamily: "var(--display)", transition: "all 0.2s", whiteSpace: "nowrap", height: 42,
            }}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP (Multi-Account)
// ═══════════════════════════════════════

function emptyAccountData() {
  return { trades: [], projections: [], backtests: [], tradeCount: 0, tradeSystem: "" };
}

export default function App() {
  const [page, setPage] = useState("home");
  const [accounts, setAccounts] = useLocalState("accounts", []);
  const [activeAccountId, setActiveAccountId] = useLocalState("activeAccountId", null);
  const [allData, setAllData] = useLocalState("allAccountData", {});

  // Get current account data
  const data = (activeAccountId && allData[activeAccountId]) ? allData[activeAccountId] : emptyAccountData();

  // Direct setters that avoid stale closure issues
  const setTrades = (updater) => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, trades: typeof updater === "function" ? updater(acctData.trades) : updater } };
    });
  };
  const setProjections = (updater) => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, projections: typeof updater === "function" ? updater(acctData.projections) : updater } };
    });
  };
  const setBacktests = (updater) => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, backtests: typeof updater === "function" ? updater(acctData.backtests) : updater } };
    });
  };
  const incrementTradeCount = () => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, tradeCount: acctData.tradeCount + 1 } };
    });
  };
  const decrementTradeCount = () => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, tradeCount: Math.max(0, acctData.tradeCount - 1) } };
    });
  };
  const setTradeSystem = (val) => {
    setAllData(prev => {
      const acctData = prev[activeAccountId] || emptyAccountData();
      return { ...prev, [activeAccountId]: { ...acctData, tradeSystem: val } };
    });
  };

  const addAccount = (name, customId, startBalance) => {
    if (accounts.some(a => a.id === customId)) return;
    setAccounts(prev => [...prev, { id: customId, name, startBalance: startBalance || 0 }]);
    setAllData(prev => ({ ...prev, [customId]: emptyAccountData() }));
  };

  const deleteAccount = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setAllData(prev => { const next = { ...prev }; delete next[id]; return next; });
    if (activeAccountId === id) { setActiveAccountId(null); setPage("home"); }
  };

  const selectAccount = (id) => {
    setActiveAccountId(id);
    setPage("dashboard");
  };

  const goHome = () => { setPage("home"); setActiveAccountId(null); };

  const accountSwitcher = activeAccountId ? (
    <AccountDropdownSmall accounts={accounts} activeId={activeAccountId} onSwitch={(id) => { setActiveAccountId(id); setPage("dashboard"); }} />
  ) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b0e", color: "#e5e7eb", fontFamily: "'Inter', system-ui, sans-serif", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)", animation: "neonDrift1 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)", animation: "neonDrift2 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(192,38,211,0.025) 0%, transparent 70%)", transform: "translate(-50%, -50%)", animation: "neonDrift3 18s ease-in-out infinite" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
        :root { --mono: 'JetBrains Mono', monospace; --display: 'Outfit', sans-serif; --body: 'Inter', system-ui, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes neonDrift1 { 0%, 100% { transform: translate(0, 0); opacity: 0.6; } 50% { transform: translate(40px, 30px); opacity: 1; } }
        @keyframes neonDrift2 { 0%, 100% { transform: translate(0, 0); opacity: 0.7; } 50% { transform: translate(-50px, -20px); opacity: 1; } }
        @keyframes neonDrift3 { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        input:focus, select:focus, textarea:focus { border-color: rgba(59,130,246,0.4) !important; }
        ::selection { background: rgba(99,102,241,0.3); }
        a { text-decoration: none; }
      `}</style>

      {page === "home" && <HomeScreen accounts={accounts} allData={allData} onAddAccount={addAccount} onDeleteAccount={deleteAccount} onSelectAccount={selectAccount} />}
      {page === "dashboard" && activeAccountId && <Homepage trades={data.trades} tradeCount={data.tradeCount} onTradePress={incrementTradeCount} onTradeUndo={decrementTradeCount} navigate={setPage} accountDropdown={accountSwitcher} onHome={goHome} />}
      {page === "trades" && <TradeEntryPage trades={data.trades} setTrades={setTrades} onHome={() => setPage("dashboard")} />}
      {page === "system" && <TradeSystemPage content={data.tradeSystem} setContent={setTradeSystem} onHome={() => setPage("dashboard")} />}
      {page === "projections" && <WeeklyProjectionPage projections={data.projections} setProjections={setProjections} onHome={() => setPage("dashboard")} />}
      {page === "backtest" && <BacktestPage backtests={data.backtests} setBacktests={setBacktests} onHome={() => setPage("dashboard")} />}
      </div>
    </div>
  );
}
