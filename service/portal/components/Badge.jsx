// 定义小徽章组件
export default function Badge({label, tone="slate"}) {
    const color = {
        green: "bg-green-100 text-green-700 ring-green-200",
        red: "bg-red-100 text-red-700 ring-red-200",
        amber: "bg-amber-100 text-amber-800 ring-amber-200",
        slate: "bg-slate-100 text-slate-700 ring-slate-200",
        blue: "bg-blue-100 text-blue-700 ring-blue-200",
        violet: "bg-violet-100 text-violet-700 ring-violet-200",
    }[tone];
    return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color}`}>{label}</span>
    );
}