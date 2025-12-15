// src/lib/http.ts
import Axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

type CfgWithRetry = InternalAxiosRequestConfig & {
    __retryCount?: number;
    __t0?: number;
};

const API_BASE =
    Constants.expoConfig?.extra?.apiUrl ??
    "http://localhost:3000/api/v1"; // safe fallback

const TIMEOUT_MS = 20000;
const SHOULD_LOG = (Constants.expoConfig?.extra as any)?.logApi ?? __DEV__;

const appVersion =
    (Constants.expoConfig?.version as string | undefined) ?? "0";
const releaseChannel =
    (Constants.expoConfig?.extra as any)?.releaseChannel ?? "unknown";

function log(...args: any[]) {
    if (SHOULD_LOG) console.log(...args);
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export const http = Axios.create({
    baseURL: API_BASE,
    timeout: TIMEOUT_MS,
    headers: {
        // strong client-side cache kill
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",

        Accept: "application/json",
        "X-Client-Platform": Platform.OS,
        "X-Client-Version": appVersion,
        "X-Release-Channel": releaseChannel,
    },
    validateStatus: () => true, // never hang on non-2xx
});

// ---- Request interceptor: auth + cache-buster + timing
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = Constants.expoConfig?.extra?.apiJwtToken ?? "";

    // Ensure headers is AxiosHeaders
    if (!config.headers) {
        config.headers = new AxiosHeaders();
    } else if (!(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
    }

    const h = config.headers as AxiosHeaders;

    // auth
    if (token) h.set("Authorization", `Bearer ${token}`);

    // accept + anti-cache
    h.set("Accept", "application/json");
    h.set("Cache-Control", "no-store, no-cache, must-revalidate");
    h.set("Pragma", "no-cache");
    h.set("Expires", "0");

    // IMPORTANT: iOS-only workaround for stale HTTP/2 connection reuse after relaunch
    if (Platform.OS === "ios") {
        h.set("Connection", "close");
    }

    // Add a small cache-buster for GETs
    const method = (config.method ?? "get").toLowerCase();
    if (method === "get") {
        config.params = {
            ...(config.params as Record<string, unknown> | undefined),
            _: Date.now(),
        };
    }

    // Timestamp for latency logging
    (config as CfgWithRetry).__t0 = Date.now();

    return config;
});

// ---- Retry logic
function shouldRetry(error: AxiosError): boolean {
    const status = error.response?.status ?? 0;
    const msg = (error.message || "").toLowerCase();

    // Network/timeout/5xx/408 are retryable; 429 is handled with Retry-After below
    return (
        error.code === "ECONNABORTED" ||
        msg.includes("network") ||
        status === 408 ||
        (status >= 500 && status !== 501) // 5xx except Not Implemented
    );
}

function backoff(attempt: number) {
    const base = Math.min(1000 * 2 ** (attempt - 1), 8000);
    return base + Math.floor(Math.random() * 250);
}

// ---- Response interceptor: log + retry + surface errors
http.interceptors.response.use(
    (res) => {
        const cfg = res.config as CfgWithRetry;
        const ms = cfg.__t0 ? Date.now() - cfg.__t0 : -1;
        const url = (cfg.baseURL ?? "") + (cfg.url ?? "");
        log("API", res.status, ms + "ms", url);
        return res;
    },
    async (error: AxiosError) => {
        const cfg = (error.config ?? {}) as CfgWithRetry;
        const url = (cfg.baseURL ?? "") + (cfg.url ?? "");
        const ms = cfg.__t0 ? Date.now() - cfg.__t0 : -1;

        // Normalize retry count
        const prev = typeof cfg.__retryCount === "number" ? cfg.__retryCount : 0;
        const attempt = prev + 1;
        cfg.__retryCount = attempt;

        const status = error.response?.status ?? 0;

        // 429: respect Retry-After when present
        if (status === 429 && attempt <= 3) {
            const ra = error.response?.headers?.["retry-after"];
            const wait =
                ra && !isNaN(Number(ra)) ? Number(ra) * 1000 : backoff(attempt);
            log("API_ERR 429 retry-after", wait + "ms", url);
            await sleep(wait);
            return http.request(cfg);
        }

        if (attempt <= 3 && shouldRetry(error)) {
            const wait = backoff(attempt);
            log("API_ERR retry", attempt, wait + "ms", status, url, ms + "ms");
            await sleep(wait);
            return http.request(cfg);
        }

        // Final log before surfacing
        log("API_ERR", {
            url,
            status,
            code: error.code,
            msg: String(error.message),
            ms,
        });
        return Promise.reject(error);
    }
);
