// lib/apiAuth.ts
type ClientMeta = { appVersion?: string; build?: string; platform?: string; };

const API_URL = process.env.API_URL!;
let _jwt: string | undefined;
let _meta: ClientMeta = {};

export const apiAuth = {
    setToken(jwt?: string) { _jwt = jwt; },
    setClientMeta(meta: ClientMeta) { _meta = meta; },

    async _fetch(path: string, init: RequestInit = {}) {
        // ---- Normalize headers safely into a Record<string,string> ----
        const normalized: Record<string, string> = {};

        // Start with any headers passed by caller
        const incoming = init.headers;
        if (incoming instanceof Headers) {
            incoming.forEach((v, k) => { normalized[k] = v; });
        } else if (Array.isArray(incoming)) {
            // Array of [key, value]
            incoming.forEach(([k, v]) => { normalized[k] = v; });
        } else if (incoming && typeof incoming === "object") {
            Object.entries(incoming).forEach(([k, v]) => {
                normalized[k] = String(v);
            });
        }

        // ---- Add our defaults (they overwrite caller headers) ----
        normalized["Accept"] = "application/json";
        normalized["Content-Type"] = "application/json";

        if (_jwt) normalized["Authorization"] = `Bearer ${_jwt}`;
        if (_meta.platform) normalized["X-Platform"] = _meta.platform;
        if (_meta.appVersion) normalized["X-App-Version"] = _meta.appVersion;
        if (_meta.build) normalized["X-Build"] = _meta.build;

        const res = await fetch(`${API_URL}${path}`, {
            ...init,
            headers: normalized,
        });

        if (res.status === 426) {
            const body = await res.json().catch(() => ({}));
            throw { forceUpdate: body };
        }

        if (!res.ok) {
            const err = await res.text().catch(() => "");
            throw new Error(`${res.status} ${err}`);
        }

        return res.headers.get("content-type")?.includes("json")
            ? res.json()
            : res.text();
    },

    get(path: string, params?: Record<string, string | number | boolean>) {
        let url = path;
        if (params && Object.keys(params).length) {
            const qs = new URLSearchParams(
                Object.entries(params).reduce((acc, [k, v]) => {
                    acc[k] = String(v);
                    return acc;
                }, {} as Record<string, string>)
            ).toString();
            url += (path.includes("?") ? "&" : "?") + qs;
        }
        return this._fetch(url, { method: "GET" });
    },
    post(path: string, body?: unknown) {
        return this._fetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
    },

    async put(path: string, body?: any, options: RequestInit = {}) {
        return this._fetch(path, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
            ...options,  // <-- merges signal, headers override, etc.
        });
    }
};

