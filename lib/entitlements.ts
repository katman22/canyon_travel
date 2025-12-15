// lib/entitlements.ts
import { apiAuth } from "@/lib/apiAuth";

export type ServerEntitlements = {
    version: number;
    active: boolean;
    tier: "free" | "standard" | "pro" | "premium";
    valid_until?: string | null;
    features: string[];
    source_of_truth?: "store" | "override";
    sources?: {
        store?: {
            tier: string;
            expires: string | null;
            products: string[];
            platforms: string[];
        };
        override?: {
            tier: string;
            ends_at: string | null;
            id: string | null;
            reason: string | null;
        };
    };
};

export async function fetchEntitlements(): Promise<ServerEntitlements> {
    // apiAuth already adds Authorization: Bearer <jwt>
    return apiAuth.get("entitlements/index");
}
