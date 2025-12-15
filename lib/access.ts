// lib/access.ts
import type { Resort } from "@/constants/types";
import type { HomeResortsResponse } from "@/lib/homeResorts";

export type Tier = "free" | "standard" | "pro" | "premium";

function getResortKey(resort?: Resort | null): string {
    if (!resort) return "";
    return resort.slug ?? String(resort.resort_id ?? "");
}

export function effectiveAccess(
    resort: Resort | null | undefined,
    homes: HomeResortsResponse | null | undefined,
    tier: Tier
) {
    const key = getResortKey(resort);

    // Server returns SLUGS — these arrays already contain slugs.
    const subscribedSlugs = homes?.subscribed_ids ?? [];
    const freeSlugs       = homes?.free_ids ?? [];

    const isSubscribedHome = subscribedSlugs.includes(key);
    const isFreeHome       = freeSlugs.includes(key);

    // ---- ACCESS RULES ----
    // Premium: everything unlocked
    // Standard/Pro: unlocked on subscribed homes
    // Free tier: unlocked only on selected resort (if you decide), otherwise locked
    // Free homes: NO extra access unless you explicitly decide they get travel/weather

    // Current rule from your description:
    const fullAccess =
        tier === "premium" ||
        isSubscribedHome;

    // Weather is same as full access (for now)
    const weatherAccess = fullAccess;

    // Travel view is same as full access (for now)
    const travelAccess = fullAccess;

    return {
        key,
        tier,
        isSubscribedHome,
        isFreeHome,
        fullAccess,
        weatherAccess,
        travelAccess,
        paid: tier !== "free",
    };
}
