import { useState, useEffect } from "react";

export function useLocalState(key, initial) {
  const storageKey = `tradelog_${key}`;
  const isElectron  = typeof window !== "undefined" && window.electronStore;

  const [val, setVal] = useState(() => {
    if (!isElectron) {
      try {
        const s = localStorage.getItem(storageKey);
        if (s !== null) return JSON.parse(s);
      } catch {}
    }
    return initial;
  });

  const [loaded, setLoaded] = useState(!isElectron);

  useEffect(() => {
    if (!isElectron) return;
    (async () => {
      try {
        const s = await window.electronStore.get(storageKey);
        if (s !== undefined && s !== null) setVal(s);
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (isElectron) {
      window.electronStore.set(storageKey, val).catch(() => {});
    } else {
      try { localStorage.setItem(storageKey, JSON.stringify(val)); } catch {}
    }
  }, [val, loaded]);

  return [val, setVal];
}
