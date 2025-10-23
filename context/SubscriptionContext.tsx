// context/SubscriptionContext.tsx
import React, { createContext, useContext, useMemo, useRef, useEffect } from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { clearHomeResorts, loadHomeResorts } from "@/lib/userPrefs";
import { PrefsEvents, EVENTS } from "@/lib/events";
import { resetHomeResortQuota } from "@/lib/homeResortQuota";
type Tier = "none" | "standard" | "pro" | "premium";
type SubStatus = "none" | "active" | "scheduled_cancel" | "billing_issue" | "expired";

type SubscriptionState = {
    ready: boolean;
    isSubscribed: boolean;
    tier: Tier;
    entitlements: string[];
    status: SubStatus;
    expiresAt?: Date | null;       // present for scheduled_cancel / active with known expiration
    willRenew?: boolean | null;    // mirrors RC’s willRenew for the picked entitlement
    allowedHomeResorts: number | "all";
    refresh: () => Promise<void>;
    restore: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

const RC_API_KEY = Platform.select({
    ios:     "appl_CGSkKUbeKLufJXnmTNildaLBClw",
    android: "goog_hDsZkRPwzRmXonNUoMkoWJHXUzd",
})!;

const tierFrom = (ents: string[]): Tier => {
    const k = ents.map(s => s.toLowerCase());
    if (k.some(x => x.includes("premium"))) return "premium";
    if (k.some(x => x.includes("pro")))     return "pro";
    if (k.some(x => x.includes("standard")))return "standard";
    return "none";
};

const capFromTier = (tier: Tier): number | "all" => {
    switch (tier) {
        case "premium": return "all";
        case "pro":     return 4;
        case "standard":return 2;
        default:        return 1;
    }
};

// Pull the highest-priority active entitlement info from RC CustomerInfo
function pickEntitlementInfo(info: any /* Purchases.CustomerInfo | null */) {
    const all = info?.entitlements?.all ?? {};
    // all is a map: { [entitlementId]: EntitlementInfo }
    // Prefer highest plan first
    const order = ["premium", "pro", "standard"];
    for (const id of order) {
        const e = all[id];
        if (!e) continue;
        // e.isActive covers current access; we still want this one for scheduled_cancel too
        if (e.isActive || e.willRenew === false || e.billingIssueDetectedAt) {
            return { id, info: e };
        }
    }
    // fallback: if none matched, return the first active if any
    const activeKey = Object.keys(all).find(k => all[k]?.isActive);
    if (activeKey) return { id: activeKey, info: all[activeKey] };
    return null;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { configured, info, activeEntitlements, refresh, restore } = useRevenueCat({
        apiKey: RC_API_KEY,
        skuList: [],
        logLevel: __DEV__ ? "DEBUG" : "ERROR",
    });

    const prevTierRef = useRef<Tier>("none");

    const value = useMemo<SubscriptionState>(() => {
        const ents = activeEntitlements ?? [];
        const tier = tierFrom(ents);

        let status: SubStatus = "none";
        let expiresAt: Date | null | undefined = null;
        let willRenew: boolean | null | undefined = null;

        const chosen = pickEntitlementInfo(info);
        if (chosen?.info) {
            const e = chosen.info;
            const isActive = !!e.isActive;
            willRenew = e.willRenew ?? null;
            expiresAt = e.expirationDate ? new Date(e.expirationDate) : null;

            // 🚩 If there are NO active entitlements, prefer the steady "none" state.
            const noEntitlements = ents.length === 0;

            if (isActive && willRenew === true) {
                status = "active";
            } else if (isActive && willRenew === false) {
                status = "scheduled_cancel";
            } else if (e.billingIssueDetectedAt) {
                status = "billing_issue";
            } else if (noEntitlements) {
                // Was expired earlier, but RC no longer shows any active entitlement → treat as "none"
                status = "none";
            } else if (!isActive && expiresAt && expiresAt <= new Date()) {
                status = "expired"; // transient; will become "none" when ents array empties
            } else {
                status = ents.length > 0 ? "active" : "none";
            }
        } else {
            status = ents.length > 0 ? "active" : "none";
        }

        return {
            ready: configured && !!info,
            isSubscribed: ents.length > 0,
            tier,
            entitlements: ents,
            status,
            expiresAt,
            willRenew,
            allowedHomeResorts: capFromTier(tier),
            refresh,
            restore,
        };
    }, [configured, info, activeEntitlements, refresh, restore]);


    // A) If tier DROPS while app is running, clear homes (you already had this)
    useEffect(() => {
        const prev = prevTierRef.current;
        const curr = value.tier;
        const rank = (t: Tier) => ({ none:0, standard:1, pro:2, premium:3 }[t]);
        if (rank(curr) < rank(prev)) {
            (async () => {
                const homes = await loadHomeResorts();
                if (homes.length > 1) {
                    await clearHomeResorts();
                    await resetHomeResortQuota();                      // ⬅️ reset weekly changes
                    PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
                    PrefsEvents.emit(EVENTS.HOME_QUOTA_RESET);         // ⬅️ notify UI
                }
            })();
        }
        prevTierRef.current = curr;
    }, [value.tier]);

    // B) If the app is reopened AFTER cancellation and the sub has *ended*,
    //    refresh RC and enforce free rules.
    useEffect(() => {
        let mounted = true;
        const onChange = async (state: AppStateStatus) => {
            if (!mounted || state !== "active") return;
            try { await refresh(); } catch {}
            const isExpiredNow =
                value.status === "expired" || (!value.isSubscribed && value.tier === "none");

            if (isExpiredNow) {
                const homes = await loadHomeResorts();
                if (homes.length > 1) {
                    await clearHomeResorts();
                    await resetHomeResortQuota();                      // ⬅️ reset weekly changes
                    PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
                    PrefsEvents.emit(EVENTS.HOME_QUOTA_RESET);         // ⬅️ notify UI
                }
            }
        };
        const sub = AppState.addEventListener("change", onChange);
        return () => { mounted = false; sub.remove(); };
    }, [refresh, value.status, value.isSubscribed, value.tier]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
    return ctx;
}
