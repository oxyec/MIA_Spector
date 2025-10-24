// fetch + 429回退

// 带指数退避重试
export async function fetchWithBackoff(url, opts = {}, { maxRetries = 2, base = 200, jitter = 0.15 } = {}) {
    let attempt = 0
    while (true) {
        const res = await fetch(url, opts);
        if (res.status !== 429 || attempt >= maxRetries) return res;
        attempt += 1
        const wait = base * Math.pow(2, attempt - 1) * (1 + Math.random() * jitter);
        await new Promise(r => setTimeout(r, wait))
    }
}

// 封装网络请求逻辑，自动附带认证头
export function makeApi(baseUrl, apiKey, clientId) {
    const base = (baseUrl || "").replace(/\/$/, "");
    const commonHeaders = {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...(clientId ? { "X-Client-Id": clientId } : {}),
    };
    
    async function get(path) {
        const res = await fetchWithBackoff(`${base}${path}`, { headers: commonHeaders });
        const text = await res.text();
        let data = null; try { data = text ? JSON.parse(text) : null; } catch {}
        return { ok: res.ok, status: res.status, data: data ?? text };
    }

    async function post(path, body) {
        const res = await fetchWithBackoff(`${base}${path}`, {
            method: "POST",
            headers: { ...commonHeaders, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const text = await res.text()
        let data = null; 
        try { data = text ? JSON.parse(text) : null; } catch {}
        return { ok: res.ok, status: res.status, data: data ?? text };
    }
    return {get, post}
}