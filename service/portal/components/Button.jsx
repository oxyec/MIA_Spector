// 可复用的React按钮组件

export default function Button({ children, tone = "violet", className = "", ...rest }) {
    const cls = {
      violet: "bg-violet-600 hover:bg-violet-700 text-white",
      slate: "bg-slate-700 hover:bg-slate-800 text-white",
      white: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
      green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    }[tone];   // 多种颜色

    /*
        根据 tone 选择对应配色方案；
            每种配色定义了：
            背景颜色（bg-*）；
            悬停效果（hover:*）；
            字体颜色（text-*）；
            有的还有边框（border）；

        示例：
            "violet"：紫色主按钮；
            "slate"：深灰；
            "white"：浅灰背景 + 深文字；
            "green"：绿色确认按钮。
    */

    return (
      <button {...rest} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm focus:outline-none ${cls} disabled:opacity-60 disabled:cursor-not-allowed ${className}`}>
        {children}
      </button>
    );
  }