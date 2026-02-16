// context/SubscriptionContext.tsx
import React, {
    createContext,
    useContext,
    useMemo,
    useRef,
    useEffect,
    useState,
    useCallback,
} from "react";
import {Platform, AppState, AppStateStatus} from "react-native";
import {useRevenueCat} from "@/hooks/useRevenueCat";
import {PrefsEvents, EVENTS} from "@/lib/events";
import {fetchEntitlements, type ServerEntitlements} from "@/lib/entitlements";
import {updateHomeResorts} from "@/lib/homeResorts";
import Purchases from "react-native-purchases";
import {apiAuth} from "@/lib/apiAuth";

export type Tier = "free" | "standard" | "pro" | "premium";
export type SubStatus = "none" | "active" | "scheduled_cancel" | "billing_issue" | "expired";

type SubscriptionState = {
    ready: boolean;
    isSubscribed: boolean;
    tier: Tier;
    entitlements: string[];
    status: SubStatus;
    expiresAt?: Date | null;
    willRenew?: boolean | null;
    allowedHomeResorts: number | "all";
    refresh: () => Promise<void>;
    restore: () => Promise<void>;
    serverEntitlements?: ServerEntitlements;
    setServerEntitlements: (e: ServerEntitlements | undefined) => void;
    setEntitlementsFromSync: (e: ServerEntitlements) => void;
    refreshServerEntitlements: () => Promise<void>;
    afterPurchaseOrRestore: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

const RC_API_KEY = "appl_CGSkKUbeKLufJXnmTNildaLBClw";

// ---------------- HELPER FUNCTIONS -----------------

const tierFromRC = (ents: string[] | undefined): Tier => {
    const k = (ents ?? []).map((s) => s.toLowerCase());
    if (k.some((x) => x.includes("premium"))) return "premium";
    if (k.some((x) => x.includes("pro"))) return "pro";
    if (k.some((x) => x.includes("standard"))) return "standard";
    return "free";
};

function pickEntitlementInfo(info: any) {
    const all = info?.entitlements?.all ?? {};
    const order = ["premium", "pro", "standard"];

    // Prefer our known products first
    for (const id of order) {
        const e = all[id];
        if (!e) continue;
        if (e.isActive || e.willRenew === false || e.billingIssueDetectedAt) {
            return {id, info: e};
        }
    }

    // Fallback: any active key
    const activeKey = Object.keys(all).find((k) => all[k]?.isActive);
    if (activeKey) return {id: activeKey, info: all[activeKey]};

    return null;
}

const capFromServer = (server?: ServerEntitlements): number | "all" | undefined => {
    if (!server) return undefined;

    const homes = server.features.find((f) => f.startsWith("homes:"));
    if (homes) {
        const raw = homes.split(":")[1];
        const n = Number(raw);
        return Number.isFinite(n) ? n : "all";
    }

    switch (server.tier) {
        case "premium":
            return "all";
        case "pro":
            return 4;
        case "standard":
            return 2;
        default:
            return 1;
    }
};

const capFromTier = (tier: Tier): number | "all" => {
    switch (tier) {
        case "premium":
            return "all";
        case "pro":
            return 4;
        case "standard":
            return 2;
        default:
            return 1;
    }
};

const rank = (t: Tier): number =>
    ({free: 0, standard: 1, pro: 2, premium: 3}[t]);

export function SubscriptionProvider({children}: { children: React.ReactNode, attStatus?: string | null }) {
    const {
        hasLoadedInfo,
        info,
        activeEntitlements,
        refresh,
        restore,
    } = useRevenueCat({
        apiKey: RC_API_KEY,
        skuList: [],
        logLevel: __DEV__ ? "DEBUG" : "ERROR",
    });

    const [serverEntitlements, setServerEntitlements] =
        useState<ServerEntitlements | undefined>(undefined);

    // Track prior tier to detect REAL transitions
    const prevTierRef = useRef<Tier>("free");
    const [initialized, setInitialized] = useState(false);

    // --------- SERVER ENTITLEMENTS HELPERS ----------

    const refreshServerEntitlements = useCallback(async () => {
        try {
            const e = await fetchEntitlements();
            setServerEntitlements(e);
        } catch (err) {
            console.warn("[Subscription] refreshServerEntitlements failed:", err);
        }
    }, []);

    const setEntitlementsFromSync = useCallback((entitlements: ServerEntitlements) => {
        setServerEntitlements(entitlements);
    }, []);

    // --------- AFTER PURCHASE / RESTORE ---------

    const afterPurchaseOrRestore = useCallback(async () => {
        try {
            const oldTier = serverEntitlements?.tier ?? "free";

            // 1) Refresh RevenueCat + sync
            await refresh();

            // 2) Fetch server entitlements
            const updated = await fetchEntitlements();
            setServerEntitlements(updated);

            const newTier = updated?.tier ?? "free";

            if (newTier !== oldTier) {
                // 3) Clear home resorts ONLY — no quotas anymore
                await updateHomeResorts({
                    subscribed_ids: [],
                    free_ids: [],
                });

                PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
            }

        } catch (err) {
            console.error("afterPurchaseOrRestore FAILED:", err);
        }
    }, [refresh, serverEntitlements]);




    // ---------- DERIVED SUBSCRIPTION STATE ----------

    const value = useMemo<SubscriptionState>(() => {
        const rcEnts = activeEntitlements ?? [];
        const rcTier = tierFromRC(rcEnts);
        const effTier: Tier = (serverEntitlements?.tier ?? rcTier) as Tier;

        // Status
        const chosen = pickEntitlementInfo(info);
        let status: SubStatus = "none";
        let expiresAt: Date | null | undefined = null;
        let willRenew: boolean | null | undefined = null;

        if (chosen?.info) {
            const e = chosen.info;
            const isActive = !!e.isActive;
            const billingIssue = !!e.billingIssueDetectedAt;
            expiresAt = e.expirationDate ? new Date(e.expirationDate) : null;
            willRenew = e.willRenew ?? null;

            if (billingIssue) status = "billing_issue";
            else if (isActive && e.willRenew === true) status = "active";
            else if (isActive && e.willRenew === false) status = "scheduled_cancel";
            else if (expiresAt && expiresAt <= new Date()) status = "expired";
            else if (rcEnts.length > 0) status = "active";
            else status = "none";
        } else {
            status = rcEnts.length > 0 ? "active" : "none";
        }

        const isSubscribed = effTier !== "free" || rcEnts.length > 0;

        return {
            ready: hasLoadedInfo && !!info,
            isSubscribed,
            tier: effTier,
            entitlements: rcEnts,
            status,
            expiresAt,
            willRenew,
            allowedHomeResorts:
                capFromServer(serverEntitlements) ?? capFromTier(effTier),
            refresh,
            restore,
            serverEntitlements,
            setServerEntitlements,
            refreshServerEntitlements,
            setEntitlementsFromSync,
            afterPurchaseOrRestore,
        };
    }, [
        info,
        activeEntitlements,
        serverEntitlements,
        hasLoadedInfo,
        refresh,
        restore,
        afterPurchaseOrRestore,
        refreshServerEntitlements,
    ]);

    // ---------- INITIALIZE PREV TIER ONCE ----------

    useEffect(() => {
        if (!hasLoadedInfo || !info) return;
        if (!initialized) {
            prevTierRef.current = value.tier;
            setInitialized(true);
        }
    }, [hasLoadedInfo, info, value.tier, initialized]);

    // ---------- REAL DOWNGRADES ONLY (paid -> free) ----------

    useEffect(() => {
        if (!initialized) return;

        const prev = prevTierRef.current;
        const curr = value.tier;

        if (curr === prev) return;

        if (rank(curr) < rank(prev)) {
            (async () => {
                console.log("[Subscription] REAL downgrade:", prev, "→", curr);

                try {
                    await updateHomeResorts({
                        subscribed_ids: [],
                        free_ids: [],
                    });

                    PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);

                    await refreshServerEntitlements();

                    console.log("[Subscription] Downgrade cleanup complete.");
                } catch (err) {
                    console.error("[Subscription] Downgrade cleanup failed:", err);
                }
            })();
        }

        prevTierRef.current = curr;
    }, [value.tier, initialized, refreshServerEntitlements]);


    // ---------- REFRESH RC ON FOREGROUND ----------

    useEffect(() => {
        let mounted = true;

        const onChange = async (state: AppStateStatus) => {
            if (!mounted || state !== "active") return;
            try {
                await refresh();
            } catch (err) {
                console.warn("[Subscription] refresh on foreground failed:", err);
            }
        };

        const sub = AppState.addEventListener("change", onChange);
        return () => {
            mounted = false;
            sub.remove();
        };
    }, [refresh]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) {
        throw new Error("useSubscription must be used within SubscriptionProvider");
    }
    return ctx;
}
