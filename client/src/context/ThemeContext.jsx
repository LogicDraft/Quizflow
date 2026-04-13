import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "qf_ui_mode";
const DEFAULT_MODE = "minimal";

const ThemeContext = createContext({
  mode: DEFAULT_MODE,
  setMode: () => {},
  toggleMode: () => {},
});

function applyMode(mode) {
  document.documentElement.dataset.ui = mode;
  if (document.body) {
    document.body.dataset.ui = mode;
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_MODE;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
  });

  useEffect(() => {
    applyMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    applyMode(mode);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((current) => (current === "glass" ? "minimal" : "glass")),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
