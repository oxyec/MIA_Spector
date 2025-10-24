// Panel 面板组件

export default function Panel({ title, desc, children, footer }) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-slate-900 font-semibold">{title}</h3>
            {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
          </div>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="border-t border-slate-200 p-3 text-xs text-slate-500">{footer}</div>}
      </div>
    );
  }

/*
  使用示例：
    import Panel from "./Panel";
    import Button from "./Button";

    export default function Example() {
    return (
        <Panel
        title="API 密钥设置"
        desc="用于访问受限接口的凭证"
        footer="最后更新于 2025-10-24"
        >
        <p className="text-sm text-slate-700 mb-3">
            当前密钥：<span className="font-mono text-slate-900">sk-abcdef123456</span>
        </p>
        <Button tone="violet">重新生成密钥</Button>
        </Panel>
    );
    }
*/