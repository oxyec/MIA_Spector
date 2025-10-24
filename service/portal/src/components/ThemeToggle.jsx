import { useEffect, useState } from "react";

const KEY = "mia.theme"; // 'dark' | 'light' | 'system'

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else if (theme === "light") root.classList.remove("dark");
  else { // system
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    m.matches ? root.classList.add("dark") : root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState(localStorage.getItem(KEY) || "system");

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [mode]);

  return (
    <div className="inline-flex items-center gap-1">
      <select
        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800
                   text-slate-700 dark:text-slate-200 text-sm px-2 py-1"
        value={mode}
        onChange={e => setMode(e.target.value)}
        title="主题（浅色/深色/跟随系统）"
      >
        <option value="light">浅色</option>
        <option value="dark">深色</option>
        <option value="system">系统</option>
      </select>
    </div>
  );
}
