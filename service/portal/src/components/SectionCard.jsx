export default function SectionCard({ id, title, desc, right, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm
                dark:border-slate-700 dark:bg-slate-850/70">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3
                        dark:border-slate-800">
          <div>
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold">{title}</h3>
            {desc && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>}
          </div>
          {right}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}
