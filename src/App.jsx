import { useState } from "react";
import { useLocalState } from "./hooks";
import { THEMES } from "./themes";
import { uid } from "./utils";
import { AccountDropdownSmall } from "./components/Shared";
import Homepage from "./pages/Homepage";
import TradeEntryPage from "./pages/TradeEntry";
import BacktestPage from "./pages/Backtest";
import SettingsPage from "./pages/Settings";
import { WeeklyProjectionPage, TradeSystemPage, HomeScreen } from "./pages/OtherPages";

/* ═══════════════════════════════════════════════════════
   TRADELOG — App Shell
   ═══════════════════════════════════════════════════════ */

function emptyAccountData() {
  return { trades:[], projections:[], backtests:[], tradeCount:0, tradeSystem:"" };
}

const DEFAULT_SETTINGS = {
  themeId:    "dark-default",
  customTheme: null,
  logoEmoji:  "⚡",
  logoG1:     "#3b82f6",
  logoG2:     "#7c3aed",
};

export default function App() {
  // ── Navigation history ──
  const [history, setHistory] = useState(["home"]);
  const page = history[history.length - 1];
  const navigate  = pg  => setHistory(prev => [...prev, pg]);
  const goBack    = ()  => setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  const goHome    = ()  => { setHistory(["home"]); setActiveAccountId(null); };
  const toDash    = ()  => setHistory(prev => {
    const idx = [...prev].reverse().findIndex(p => p === "dashboard");
    return idx >= 0 ? prev.slice(0, prev.length - idx) : ["home", "dashboard"];
  });

  // ── Persistent state ──
  const [accounts,         setAccounts]         = useLocalState("accounts",        []);
  const [activeAccountId,  setActiveAccountId]   = useLocalState("activeAccountId", null);
  const [allData,          setAllData]           = useLocalState("allAccountData",  {});
  const [settings,         setSettings]          = useLocalState("settings",        DEFAULT_SETTINGS);

  // ── Derived ──
  const data           = (activeAccountId && allData[activeAccountId]) ? allData[activeAccountId] : emptyAccountData();
  const currentAccount = accounts.find(a => a.id === activeAccountId);

  // ── Theme ──
  const theme = settings.customTheme
    ? settings.customTheme
    : (THEMES.find(t => t.id === settings.themeId) || THEMES[0]);

  const logoEmoji = settings.logoEmoji || "⚡";
  const logoG1    = settings.logoG1    || "#3b82f6";
  const logoG2    = settings.logoG2    || "#7c3aed";

  // ── Data updaters ──
  const setTrades = upd => setAllData(prev => {
    const d = prev[activeAccountId] || emptyAccountData();
    return { ...prev, [activeAccountId]: { ...d, trades: typeof upd === "function" ? upd(d.trades) : upd } };
  });
  const setProjections = upd => setAllData(prev => {
    const d = prev[activeAccountId] || emptyAccountData();
    return { ...prev, [activeAccountId]: { ...d, projections: typeof upd === "function" ? upd(d.projections) : upd } };
  });
  const setBacktests = upd => setAllData(prev => {
    const d = prev[activeAccountId] || emptyAccountData();
    return { ...prev, [activeAccountId]: { ...d, backtests: typeof upd === "function" ? upd(d.backtests) : upd } };
  });
  const setTradeSystem = val => setAllData(prev => {
    const d = prev[activeAccountId] || emptyAccountData();
    return { ...prev, [activeAccountId]: { ...d, tradeSystem: val } };
  });

  const addAccount = (name, customId, startBalance) => {
    if (accounts.some(a => a.id === customId)) return;
    setAccounts(prev => [...prev, { id: customId, name, startBalance: startBalance || 0 }]);
    setAllData(prev => ({ ...prev, [customId]: emptyAccountData() }));
  };
  const deleteAccount = id => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    setAllData(prev => { const n = {...prev}; delete n[id]; return n; });
    if (activeAccountId === id) { setActiveAccountId(null); setHistory(["home"]); }
  };
  const renameAccount = (id, name) => setAccounts(prev => prev.map(a => a.id===id ? {...a,name} : a));
  const selectAccount = id => { setActiveAccountId(id); setHistory(["home","dashboard"]); };
  const updateSettings = patch => setSettings(prev => ({ ...prev, ...patch }));

  const accountSwitcher = activeAccountId ? (
    <AccountDropdownSmall accounts={accounts} activeId={activeAccountId}
      onSwitch={id => { setActiveAccountId(id); setHistory(["home","dashboard"]); }}/>
  ) : null;

  // Common props injected to all pages
  const lp = { onHome: goHome, onBack: page!=="home"&&page!=="dashboard"?goBack:null, logoEmoji, logoG1, logoG2 };

  // ── CSS variable injection ──
  const cssVars = `
    :root {
      --bg:    ${theme.bg};
      --bg2:   ${theme.bg2};
      --bg3:   ${theme.bg3};
      --bord:  ${theme.bord};
      --t1:    ${theme.t1};
      --t2:    ${theme.t2};
      --t3:    ${theme.t3};
      --a1:    ${theme.a1};
      --a2:    ${theme.a2};
      --mono:    'JetBrains Mono', monospace;
      --display: 'Outfit', sans-serif;
      --body:    'Inter', system-ui, sans-serif;
    }
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
    @keyframes fadeIn    { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes neonDrift1{ 0%,100%{transform:translate(0,0);opacity:.6} 50%{transform:translate(40px,30px);opacity:1} }
    @keyframes neonDrift2{ 0%,100%{transform:translate(0,0);opacity:.7} 50%{transform:translate(-50px,-20px);opacity:1} }
    @keyframes neonDrift3{ 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5} 50%{transform:translate(-50%,-50%) scale(1.2);opacity:1} }
    *                    { box-sizing:border-box; margin:0; padding:0; }
    ::-webkit-scrollbar  { width:5px; }
    ::-webkit-scrollbar-track  { background:transparent; }
    ::-webkit-scrollbar-thumb  { background:rgba(255,255,255,0.06); border-radius:4px; }
    ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.12); }
    input:focus, select:focus, textarea:focus { border-color:${theme.a1}66 !important; }
    ::selection { background:${theme.a1}44; }
    a { text-decoration:none; }
    body { background:${theme.bg}; }
  `;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--t1)", fontFamily:"var(--body)", position:"relative" }}>
      <style>{cssVars}</style>

      {/* Ambient background blobs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"10%",left:"5%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${theme.a1}0a 0%,transparent 70%)`,animation:"neonDrift1 12s ease-in-out infinite"}}/>
        <div style={{position:"absolute",bottom:"15%",right:"8%",width:600,height:600,borderRadius:"50%",background:`radial-gradient(circle,${theme.a2}0a 0%,transparent 70%)`,animation:"neonDrift2 15s ease-in-out infinite"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${theme.a1}07 0%,transparent 70%)`,transform:"translate(-50%,-50%)",animation:"neonDrift3 18s ease-in-out infinite"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {page==="home" && (
          <HomeScreen accounts={accounts} allData={allData} onAddAccount={addAccount} onDeleteAccount={deleteAccount} onSelectAccount={selectAccount} logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}/>
        )}
        {page==="dashboard" && activeAccountId && (
          <Homepage
            trades={data.trades} navigate={navigate} accountDropdown={accountSwitcher}
            onHome={goHome} account={currentAccount}
            logoEmoji={logoEmoji} logoG1={logoG1} logoG2={logoG2}
            onOpenSettings={()=>navigate("settings")}
          />
        )}
        {page==="trades" && (
          <TradeEntryPage trades={data.trades} setTrades={setTrades} {...lp}/>
        )}
        {page==="system" && (
          <TradeSystemPage content={data.tradeSystem} setContent={setTradeSystem} {...lp}/>
        )}
        {page==="projections" && (
          <WeeklyProjectionPage projections={data.projections} setProjections={setProjections} {...lp}/>
        )}
        {page==="backtest" && (
          <BacktestPage backtests={data.backtests} setBacktests={setBacktests} trades={data.trades} {...lp}/>
        )}
        {page==="settings" && (
          <SettingsPage
            settings={settings} onUpdateSettings={updateSettings}
            accounts={accounts} onRenameAccount={renameAccount}
            trades={data.trades} projections={data.projections} backtests={data.backtests}
            {...lp}
          />
        )}
      </div>
    </div>
  );
}
