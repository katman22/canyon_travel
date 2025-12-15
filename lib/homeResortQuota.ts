// homeResortQuota.ts
// Clean, entitlement-driven logic only.
// No weekly windows, no reset timestamps, no quotas.

import type { Tier } from "@/context/SubscriptionContext";

// -----------------------------------------------------
// 1. Allowed home resort counts per subscription tier
// -----------------------------------------------------
export function allowedHomeResortCount(tier: Tier): number {
    switch (tier) {
        case "free":
            return 1;

        case "standard":
            return 2;

        case "pro":
            return 4;

        case "premium":
            return 8;

        default:
            return 1;
    }
}

// -----------------------------------------------------
// 2. Can the user add more home resorts?
// -----------------------------------------------------
export function canAddHomeResort(
    currentHomeResorts: Set<string>,
    tier: Tier
): boolean {
    return currentHomeResorts.size < allowedHomeResortCount(tier);
}

// -----------------------------------------------------
// 3. Remaining available home resort slots
// -----------------------------------------------------
export function remainingHomeResortSlots(
    currentHomeResorts: Set<string>,
    tier: Tier
): number {
    return Math.max(
        0,
        allowedHomeResortCount(tier) - currentHomeResorts.size
    );
}

// -----------------------------------------------------
// 4. Is the user at maximum capacity?
// -----------------------------------------------------
export function isAtHomeResortLimit(
    currentHomeResorts: Set<string>,
    tier: Tier
): boolean {
    return currentHomeResorts.size >= allowedHomeResortCount(tier);
}

// -----------------------------------------------------
// 5. Should we show informational text in UI?
// -----------------------------------------------------
export function homeResortLimitDescription(tier: Tier): string {
    const count = allowedHomeResortCount(tier);

    if (tier === "free") {
        return "Your free plan allows selecting 1 home resort.";
    }

    return `Your ${tier} plan allows selecting up to ${count} home resorts.`;
}
