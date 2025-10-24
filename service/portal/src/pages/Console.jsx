<div className="h-3 bg-red-500"></div>

import React, { useEffect, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import useApi from "../hooks/useApi";
import Layout from "../components/Layout";
import SectionCard from "../components/SectionCard";

const defaultBaseUrl = "/api"; // 开发态建议用代理前缀
const LS_KEYS = { baseUrl: "mia.baseUrl", apiKey: "mia.apiKey", clientId: "mia.clientId" };

function randClientId() {
  const n = Math.random().toString(36).slice(2, 8);
  return `web-${n}`;
}
function TextInput(props) {
  return (
    <input
    className="w-full rounded-lg border border-slate-400/40 bg-slate-100 text-slate-800
               placeholder-slate-500 focus:border-violet-400 focus:ring-violet-300
               dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500
               dark:border-slate-700 dark:focus:border-violet-500 dark:focus:ring-violet-500/30"
  />
  
  );
}
function Button({ children, tone="violet", className="", ...rest }) {
  const cls = {
    violet: "bg-violet-600 hover:bg-violet-700 text-white",
    slate: "bg-slate-700 hover:bg-slate-800 text-white",
    white: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
  }[tone];
  return (
    <button {...rest}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold shadow-sm ${cls} disabled:opacity-60 ${className}`} >
      {children}
    </button>
  );
}
function Badge({ label, tone="slate" }) {
  const color = {
    green: "bg-green-100 text-green-700 ring-green-200",
    red: "bg-red-100 text-red-700 ring-red-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-100 text-blue-700 ring-blue-200",
    violet: "bg-violet-100 text-violet-700 ring-violet-200",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color}`}>{label}</span>;
}

export default function ConsolePage() {
  // 连接&状态
  const [baseUrl, setBaseUrl] = usePersistedState(LS_KEYS.baseUrl, defaultBaseUrl);
  const [apiKey, setApiKey]   = usePersistedState(LS_KEYS.apiKey, "");
  const [clientId, setClientId] = usePersistedState(LS_KEYS.clientId, randClientId());

  const api = useApi(baseUrl, apiKey, clientId);
  const [health, setHealth] = useState(null);
  const [models, setModels] = useState(null);
  const [configs, setConfigs] = useState(null);

  // 判定表单
  const [text, setText] = useState("The mitochondrion is the powerhouse of the cell.");
  const [family, setFamily] = useState("pythia");
  const [model, setModel] = useState("pythia-410m");
  const [cfg, setCfg] = useState("WikiMIA_length128");
  const [metricGroup, setMetricGroup] = useState("mink++");
  const [subkey, setSubkey] = useState("0.3");
  const [mode, setMode] = useState("bestJ");
  const [abstain, setAbstain] = useState("0.2");

  const [resp, setResp] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  function pushLog(name, r, payload) {
    setLog(prev => [{
      ts: new Date().toLocaleTimeString(),
      name, status: r.status, ok: r.ok, payload, data: r.data,
    }, ...prev].slice(0, 100));
  }

  async function runHealth() {
    const r = await api.get("/healthz");
    setHealth(r); pushLog("GET /healthz", r);
  }
  async function loadMeta() {
    const r1 = await api.get("/v1/models"); setModels(r1); pushLog("GET /v1/models", r1);
    const r2 = await api.get("/v1/configs"); setConfigs(r2); pushLog("GET /v1/configs", r2);
  }
  async function runDecide() {
    setLoading(true); setResp(null);
    const payload = {
      text, family, model, cfg,
      metric_group: metricGroup,
      subkey: isNaN(Number(subkey)) ? subkey : Number(subkey),
      mode,
      abstain_margin: abstain ? Number(abstain) : null,
    };
    const r = await api.post("/v1/decide", payload);
    pushLog("POST /v1/decide", r, payload); setResp(r);
    setLoading(false);
  }

  useEffect(() => { runHealth(); }, []);

  return (
    <Layout>
      {/* 连接设置 */}
      <SectionCard id="connect" title="连接设置" desc="配置后端地址与鉴权"
        right={<div className="flex items-center gap-2">
          {health?.ok ? <Badge tone="green" label={`Healthy: ${clientId}`} /> : <Badge tone="red" label="Unknown" />}
        </div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">API Base URL</div>
            <TextInput value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="/api" />
            <div className="mt-1 text-xs text-slate-500">开发态建议填 /api（由 Vite 代理到 8080）</div>
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">API Key (Authorization: Bearer ...)</div>
            <TextInput value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="abc123" />
            <div className="mt-1 text-xs text-slate-500">来自 .env 的 API_KEYS</div>
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">X-Client-Id</div>
            <div className="flex gap-2">
              <TextInput value={clientId} onChange={e=>setClientId(e.target.value)} />
              <Button tone="white" onClick={()=>setClientId(randClientId())}>随机</Button>
            </div>
            <div className="mt-1 text-xs text-slate-500">令牌桶按客户端限流</div>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={runHealth}>健康检查</Button>
          <Button tone="slate" onClick={loadMeta}>加载 Models/Configs</Button>
        </div>
      </SectionCard>

      {/* 元数据 */}
      <SectionCard id="meta" title="可用模型" desc="来自 /v1/models">
        <pre className="text-xs rounded-xl p-3 overflow-auto max-h-60
                        bg-slate-100 text-slate-800
                        dark:bg-slate-800 dark:text-slate-200
                        border border-slate-300/30 dark:border-slate-700/50">
          {models ? JSON.stringify(models.data, null, 2) : "(未加载)"}
        </pre>
      </SectionCard>

      <SectionCard title="可用配置" desc="来自 /v1/configs">
        <pre className="text-xs rounded-xl p-3 overflow-auto max-h-60
                        bg-slate-100 text-slate-800
                        dark:bg-slate-800 dark:text-slate-200
                        border border-slate-300/30 dark:border-slate-700/50">
          {configs ? JSON.stringify(configs.data, null, 2) : "(未加载)"}
        </pre>
      </SectionCard>


      {/* 判定 */}
      <SectionCard id="decide" title="/v1/decide 测试" desc="填写参数并发送一次判定"
        right={resp && <Badge tone={resp.ok ? "green" : "red"} label={resp.ok ? `HTTP ${resp.status}` : `Err ${resp.status}`} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-1">
            <div className="mb-1 text-sm font-medium text-slate-700">Text</div>
            <textarea className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm min-h-[120px]"
                      value={text} onChange={e=>setText(e.target.value)} />
          </label>
          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Family</div>
              <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm"
                      value={family} onChange={e=>setFamily(e.target.value)}>
                <option value="pythia">pythia</option>
                <option value="llama">llama</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Model</div>
              <TextInput value={model} onChange={e=>setModel(e.target.value)} placeholder="pythia-410m" />
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Cfg</div>
              <TextInput value={cfg} onChange={e=>setCfg(e.target.value)} placeholder="WikiMIA_length128" />
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Metric Group</div>
              <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm"
                      value={metricGroup} onChange={e=>setMetricGroup(e.target.value)}>
                <option>mink</option>
                <option>mink++</option>
                <option>perplexity</option>
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Subkey</div>
              <TextInput value={subkey} onChange={e=>setSubkey(e.target.value)} placeholder="0.3 或 variance" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="mb-1 text-sm font-medium text-slate-700">Mode</div>
                <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm"
                        value={mode} onChange={e=>setMode(e.target.value)}>
                  <option>bestJ</option>
                  <option>fpr_alpha</option>
                </select>
              </label>
              <label className="block">
                <div className="mb-1 text-sm font-medium text-slate-700">Abstain Margin</div>
                <TextInput value={abstain} onChange={e=>setAbstain(e.target.value)} placeholder="0.2" />
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={runDecide} disabled={loading}>{loading ? "运行中..." : "发送请求"}</Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            响应
          </div>

          <div className="rounded-xl border border-slate-300/30 dark:border-slate-700/50 
                          bg-slate-100 dark:bg-slate-800/80 shadow-inner">
            <pre className="text-xs font-mono leading-relaxed p-4 overflow-auto max-h-64
                            text-slate-800 dark:text-slate-200">
              {resp ? JSON.stringify(resp.data, null, 2) : "(暂无)"}
            </pre>
          </div>
        </div>

      </SectionCard>

      {/* 日志 */}
      <SectionCard id="logs" title="请求日志" desc="最近 100 条（含 429 退避处理）">
        <div className="space-y-2 max-h-80 overflow-auto">
          {log.length === 0 && <div className="text-sm text-slate-500">(暂无)</div>}
          {log.map((x, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 flex justify-between items-start">
              <div className="text-xs">
                <div className="font-semibold text-slate-800">{x.ts} · {x.name}</div>
                {x.payload && <pre className="mt-1 text-[11px] text-slate-600">{JSON.stringify(x.payload)}</pre>}
                <pre className="mt-1 text-[11px] text-slate-600 overflow-auto max-h-32">
                  {typeof x.data === 'string' ? x.data : JSON.stringify(x.data, null, 2)}
                </pre>
              </div>
              <div>{x.ok ? <Badge tone="green" label={`HTTP ${x.status}`} /> : <Badge tone="red" label={`HTTP ${x.status}`} />}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </Layout>
  );
}