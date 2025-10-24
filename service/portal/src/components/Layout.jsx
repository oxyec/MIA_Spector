import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-300">
      {/* 顶栏 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200
                         dark:bg-slate-900/70 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-violet-600 grid place-items-center text-white font-bold">M</div>
            <div>
              <div className="text-lg font-semibold">MIA-Inspector Console</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Frontend for your FastAPI service</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 主体：侧边栏 + 内容 */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* 侧边栏 */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-2">
            {[
              ["#connect","连接设置"],
              ["#meta","Models / Configs"],
              ["#decide","判定测试"],
              ["#logs","请求日志"],
            ].map(([href, text]) => (
              <a key={href}
                 className="block rounded-xl px-3 py-2 text-sm hover:bg-violet-50 hover:text-violet-700
                            dark:hover:bg-slate-800 dark:hover:text-violet-300 transition"
                 href={href}>{text}</a>
            ))}
          </nav>
        </aside>

        <main className="space-y-6 nice-scrollbar">{children}</main>
      </div>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500 dark:text-slate-400">
        提示：若返回 401，请确认 API Key；频繁 429 请调整 X-Client-Id 或降低频率。
      </footer>
    </div>
  );
}
