// lib/homeResorts.ts
import { apiAuth } from "@/lib/apiAuth";
import { PrefsEvents, EVENTS } from "@/lib/events";

/** Server format (SLUGS, not numeric IDs) */
export type HomeResortsResponse = {
    subscribed_ids: string[]; // resort slugs
    free_ids: string[];       // resort slugs
    limits: { subscribed: number | "all"; free: number };
    remaining: { subscribed: number | "all"; free: number };
};

/** 1. Pull from Rails */
export async function fetchHomeResorts(): Promise<HomeResortsResponse> {
    const res = await apiAuth.get("home_resorts");

    const normalizeSlugArray = (arr: unknown): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr
            .map((v) => (v == null ? "" : String(v)))
            .filter((s) => s.length > 0);
    };

    const subscribed_ids = normalizeSlugArray(res?.subscribed_ids);
    const free_ids = normalizeSlugArray(res?.free_ids);

    return {
        subscribed_ids,
        free_ids,
        limits: {
            subscribed:
                res?.limits?.subscribed === "all"
                    ? "all"
                    : Number(res?.limits?.subscribed ?? 0),
            free: Number(res?.limits?.free ?? 0),
        },
        remaining: {
            subscribed:
                res?.remaining?.subscribed === "all"
                    ? "all"
                    : Number(res?.remaining?.subscribed ?? 0),
            free: Number(res?.remaining?.free ?? 0),
        },
    };
}

/** 2. Update home resort sets (slugs) */
export async function updateHomeResorts(payload: {
    subscribed_ids: string[]; // slugs
    free_ids: string[];       // slugs
}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
        await apiAuth.put("home_resorts", payload, {
            signal: controller.signal,
        });

        PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
    } finally {
        clearTimeout(timer);
    }
}

/** 3. Unified helper for LocationsScreen (slug-based Sets) */
export async function getUserHomeSlugs(): Promise<{
    subscribed: Set<string>; // slugs
    free: Set<string>;       // slugs
}> {
    const res = await fetchHomeResorts();
    return {
        subscribed: new Set(res.subscribed_ids),
        free: new Set(res.free_ids),
    };
}

/** 4. Helpers for checking membership by resort.slug */
export function isSubscribedHome(
    resort: { slug: string },
    home: { subscribed: Set<string> }
): boolean {
    return home.subscribed.has(resort.slug);
}

export function isFreeHome(
    resort: { slug: string },
    home: { free: Set<string> }
): boolean {
    return home.free.has(resort.slug);
}

/** 5. Legacy compatibility: still returns slugs */
export async function getHomeResortSlugs(): Promise<string[]> {
    const res = await fetchHomeResorts();
    return [...res.subscribed_ids, ...res.free_ids];
}

/**
 * Legacy update helper: treat given slugs as "free" homes.
 * Kept for backwards compatibility.
 */
export async function updateHomeResortSlugs(ids: string[]) {
    await updateHomeResorts({ subscribed_ids: [], free_ids: ids });
}
