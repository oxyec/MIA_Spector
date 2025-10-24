// 表单组件

/*
    label：字段标题（如“用户名”）；
    children：输入组件（比如 <input>）；
    hint：提示文字（可选，比如“密码至少 8 位”）
*/

export default function Field({label, children, hint}) {
    return (
        <label className="block">
        <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
        {children}
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </label>
    );
}