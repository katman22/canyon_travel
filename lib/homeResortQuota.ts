import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_QUOTA = "prefs:home_resorts_quota"; // { windowStart:number(ms), used:number }
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const KEY_WINDOW_START = "homeResortQuota:windowStart";
const KEY_USED         = "homeResortQuota:used";
const KEY_WINDOW = "home_quota:windowStartMs";

export type Quota = { windowStart: number; used: number };

export async function loadQuota(): Promise<Quota> {
    try {
        const raw = await AsyncStorage.getItem(KEY_QUOTA);
        if (!raw) return { windowStart: 0, used: 0 };
        const parsed = JSON.parse(raw) as Partial<Quota>;
        return {
            windowStart: typeof parsed.windowStart === "number" ? parsed.windowStart : 0,
            used: typeof parsed.used === "number" ? parsed.used : 0,
        };
    } catch {
        return { windowStart: 0, used: 0 };
    }
}

export async function saveQuota(q: Quota): Promise<void> {
    await AsyncStorage.setItem(KEY_QUOTA, JSON.stringify(q));
}

/** Ensures the 7-day window is fresh; resets if expired. Returns the active quota. */
export async function getActiveQuota(now = Date.now()): Promise<Quota> {
    const q = await loadQuota();
    if (q.windowStart === 0 || now - q.windowStart >= WINDOW_MS) {
        const fresh: Quota = { windowStart: now, used: 0 };
        await saveQuota(fresh);
        return fresh;
    }
    return q;
}

/** Adds N changes into the current window (resets if window expired). */
export async function consumeChanges(n: number, now = Date.now()): Promise<Quota> {
    const q = await getActiveQuota(now);
    const next: Quota = { windowStart: q.windowStart, used: q.used + n };
    await saveQuota(next);
    return next;
}

/** When does the current window reset? */
export async function nextResetAt(now = Date.now()): Promise<number> {
    const q = await getActiveQuota(now);
    return q.windowStart + WINDOW_MS;
}

export async function resetChangesNow(): Promise<{ windowStart: number; used: number }> {
    const now = Date.now();
    // Option A (recommended): keep existing windowStart, only set used=0
    const rawStart = await AsyncStorage.getItem(KEY_WINDOW_START);
    const windowStart = rawStart ? Number(rawStart) : now;

    await AsyncStorage.setItem(KEY_WINDOW_START, String(windowStart));
    await AsyncStorage.setItem(KEY_USED, "0");

    return { windowStart, used: 0 };
}

export async function resetHomeResortQuota(): Promise<void> {
    const now = Date.now();
    // Start a fresh window with 0 used
    await AsyncStorage.multiSet([
        [KEY_USED, JSON.stringify(0)],
        [KEY_WINDOW, JSON.stringify(now)],
    ]);
}
