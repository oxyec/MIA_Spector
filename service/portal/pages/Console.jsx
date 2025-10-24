import React, { useEffect, useMemo, useState } from "react";
import usePersistedState from "../hooks/usePersistedState";
import useApi from "../hooks/useApi";
import Panel from "../components/Panel";
import Field from "../components/Field";
import Button from "../components/Button";
import Badge from "../components/Badge";

/*
    React + Tailwind前端控制台
*/

const defaultBaseUrl = "http://localhost:8080";
const LS_KEYS = {
  baseUrl: "mia.baseUrl",
  apiKey: "mia.apiKey",
  clientId: "mia.clientId",
};

function randClientId() {
  const n = Math.random().toString(36).slice(2, 8);
  return `web-${n}`;
}

function TextInput(props) {
  return (
    <input {...props} className={`w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm ${props.className||""}`} />
  );
}

export default function ConsolePage() {
  const [baseUrl, setBaseUrl] = usePersistedState(LS_KEYS.baseUrl, defaultBaseUrl);
  const [apiKey, setApiKey] = usePersistedState(LS_KEYS.apiKey, "");
  const [clientId, setClientId] = usePersistedState(LS_KEYS.clientId, randClientId());

  const api = useApi(baseUrl, apiKey, clientId);
  const [health, setHealth] = useState(null);
  const [models, setModels] = useState(null);
  const [configs, setConfigs] = useState(null);

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

  async function runHealth() {
    const r = await api.get("/healthz");
    setHealth(r);
    pushLog("GET /healthz", r);
  }

  async function loadMeta() {
    const r1 = await api.get("/v1/models");
    pushLog("GET /v1/models", r1);
    setModels(r1);
    const r2 = await api.get("/v1/configs");
    pushLog("GET /v1/configs", r2);
    setConfigs(r2);
  }

  // 向后端 API 请求模型列表与配置列表，并把结果保存到页面状态中，同时记录到日志
  async function runDecide() {
    setLoading(true);
    setResp(null);
    const payload = {
      text,
      family,
      model,
      cfg,
      metric_group: metricGroup,
      subkey: isNaN(Number(subkey)) ? subkey : Number(subkey),
      mode,
      abstain_margin: abstain ? Number(abstain) : null,
    };
    const r = await api.post("/v1/decide", payload);
    pushLog("POST /v1/decide", r, payload);
    setResp(r);
    setLoading(false);
  }

  function pushLog(name, r, payload) {
    setLog(prev => [{
      ts: new Date().toLocaleTimeString(),
      name,
      status: r.status,
      ok: r.ok,
      payload,
      data: r.data,
    }, ...prev].slice(0, 100));
  }

  useEffect(() => { runHealth(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-violet-600 grid place-items-center text-white font-bold">M</div>
            <div>
              <div className="text-lg font-semibold">MIA-Inspector Console</div>
              <div className="text-xs text-slate-500">Frontend for your FastAPI service</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {health?.ok ? <Badge tone="green" label="Healthy"/> : <Badge tone="red" label="Unknown"/>}
            <Badge tone="slate" label={`Client: ${clientId}`}/>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Panel title="连接设置" desc="配置后端地址与鉴权">
            <div className="space-y-4">
              <Field label="API Base URL" hint="如 http://localhost:8080">
                <TextInput value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder={defaultBaseUrl} />
              </Field>
              <Field label="API Key (Authorization: Bearer ...)" hint="来自你的 .env 配置(API_KEYS) 或其他密钥系统">
                <TextInput value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="abc123" />
              </Field>
              <Field label="X-Client-Id" hint="用于令牌桶按客户端限流">
                <div className="flex gap-2">
                  <TextInput value={clientId} onChange={e=>setClientId(e.target.value)} />
                  <Button tone="white" onClick={()=>setClientId(randClientId())}>随机</Button>
                </div>
              </Field>
              <div className="flex gap-2">
                <Button onClick={runHealth}>健康检查</Button>
                <Button tone="slate" onClick={loadMeta}>加载 Models/Configs</Button>
              </div>
            </div>
          </Panel>

          <Panel title="可用模型" desc="来自 /v1/models">
            <pre className="text-xs bg-slate-50 rounded-xl p-3 overflow-auto max-h-60">{models ? JSON.stringify(models.data, null, 2) : "(未加载)"}</pre>
          </Panel>

          <Panel title="可用配置" desc="来自 /v1/configs">
            <pre className="text-xs bg-slate-50 rounded-xl p-3 overflow-auto max-h-60">{configs ? JSON.stringify(configs.data, null, 2) : "(未加载)"}</pre>
          </Panel>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Panel title="/v1/decide 测试" desc="填写参数并发送一次判定">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Text">
                <textarea className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm min-h-[88px]" value={text} onChange={e=>setText(e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Family">
                  <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm" value={family} onChange={e=>setFamily(e.target.value)}>
                    <option value="pythia">pythia</option>
                    <option value="llama">llama</option>
                  </select>
                </Field>
                <Field label="Model">
                  <TextInput value={model} onChange={e=>setModel(e.target.value)} placeholder="pythia-410m" />
                </Field>
                <Field label="Cfg">
                  <TextInput value={cfg} onChange={e=>setCfg(e.target.value)} placeholder="WikiMIA_length128" />
                </Field>
                <Field label="Metric Group">
                  <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm" value={metricGroup} onChange={e=>setMetricGroup(e.target.value)}>
                    <option>mink</option>
                    <option>mink++</option>
                    <option>perplexity</option>
                  </select>
                </Field>
                <Field label="Subkey">
                  <TextInput value={subkey} onChange={e=>setSubkey(e.target.value)} placeholder="0.3 或 variance" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mode">
                    <select className="w-full rounded-xl border-slate-300 focus:border-violet-400 focus:ring-violet-300 shadow-sm" value={mode} onChange={e=>setMode(e.target.value)}>
                      <option>bestJ</option>
                      <option>fpr_alpha</option>
                    </select>
                  </Field>
                  <Field label="Abstain Margin">
                    <TextInput value={abstain} onChange={e=>setAbstain(e.target.value)} placeholder="0.2" />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Button onClick={runDecide} disabled={loading}>{loading ? "运行中..." : "发送请求"}</Button>
                  {resp && <Badge tone={resp.ok ? "green" : "red"} label={resp.ok ? `HTTP ${resp.status}` : `Err ${resp.status}`} />}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-700 mb-1">响应</div>
              <pre className="text-xs bg-slate-50 rounded-xl p-3 overflow-auto max-h-64">{resp ? JSON.stringify(resp.data, null, 2) : "(暂无)"}</pre>
            </div>
          </Panel>

          <Panel title="请求日志" desc="最近 100 条（含 429 退避处理）">
            <div className="space-y-2 max-h-80 overflow-auto">
              {log.length === 0 && <div className="text-sm text-slate-500">(暂无)</div>}
              {log.map((x, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 flex justify-between items-start">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800">{x.ts} · {x.name}</div>
                    {x.payload && <pre className="mt-1 text-[11px] text-slate-600">{JSON.stringify(x.payload)}</pre>}
                    <pre className="mt-1 text-[11px] text-slate-600 overflow-auto max-h-32">{typeof x.data === 'string' ? x.data : JSON.stringify(x.data, null, 2)}</pre>
                  </div>
                  <div>{x.ok ? <Badge tone="green" label={`HTTP ${x.status}`} /> : <Badge tone="red" label={`HTTP ${x.status}`} />}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
        提示：若接口返回 401，请确认 API Key 与后端一致；若频繁 429，请调整 X-Client-Id 或降低请求频率/并发。
      </footer>
    </div>
  );
}