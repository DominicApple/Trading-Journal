// ── Constants & Utilities ──
export const CONFLUENCES = ["HTF Orderflow","FVG","IFVG","Order Block","SMT","Breaker"];
export const EMOTIONS = ["confident","calm","anxious","frustrated","neutral","euphoric"];
export const EMOTION_META = {
  confident: { color:"#22c55e", bg:"rgba(34,197,94,0.18)",   label:"Confident" },
  calm:      { color:"#3b82f6", bg:"rgba(59,130,246,0.18)",  label:"Calm" },
  anxious:   { color:"#f59e0b", bg:"rgba(245,158,11,0.18)",  label:"Anxious" },
  frustrated:{ color:"#ef4444", bg:"rgba(239,68,68,0.18)",   label:"Frustrated" },
  neutral:   { color:"#94a3b8", bg:"rgba(148,163,184,0.18)", label:"Neutral" },
  euphoric:  { color:"#a855f7", bg:"rgba(168,85,247,0.18)",  label:"Euphoric" },
};
export const PAIRS = [
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "GBPJPY","EURJPY","EURGBP","US100","ES500","XAUUSD",
];
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const fmt     = v => `${v>=0?"+":""}$${Math.abs(v).toFixed(2)}`;
export const uid     = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
export const today   = () => new Date().toISOString().slice(0,10);
export const mkKey   = d  => { const dt=new Date(d+"T12:00:00"); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}`; };
export const keyLabel= k  => { const[y,m]=k.split("-"); return `${MONTHS[+m-1]} ${y}`; };
export const wordCount=arr=> arr.join(" ").trim().split(/\s+/).filter(Boolean).length;
