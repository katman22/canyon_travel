export type TierKey = "free" | "standard" | "pro" | "premium";

export const ENTITLEMENT_RANK: Record<TierKey, number> = {
    free: 0,
    standard: 1,
    pro: 2,
    premium: 3,
};

export function deriveCurrentTier(activeEntitlements: string[]): {
    tierKey: TierKey;
    rank: number;
} {
    if (activeEntitlements.includes("premium")) {
        return { tierKey: "premium", rank: ENTITLEMENT_RANK.premium };
    }
    if (activeEntitlements.includes("pro")) {
        return { tierKey: "pro", rank: ENTITLEMENT_RANK.pro };
    }
    if (activeEntitlements.includes("standard")) {
        return { tierKey: "standard", rank: ENTITLEMENT_RANK.standard };
    }
    return { tierKey: "free", rank: ENTITLEMENT_RANK.free };
}

export function rankForPlanKey(k: TierKey): number {
    return ENTITLEMENT_RANK[k];
}

