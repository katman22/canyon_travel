type Tier = "free" | "standard" | "pro" | "premium";

export function weeklyChangeCap(tier: Tier): number | "unlimited" {
    switch (tier) {
        case "premium": return "unlimited";
        case "pro":     return 4;
        case "standard":return 2;
        default:        return 1; // free/none
    }
}
