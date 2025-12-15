// hooks/useResortListData.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelectedResort } from "@/context/ResortContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { fetchHomeResorts } from "@/lib/homeResorts";
import type { Resort } from "@/constants/types";
import { View, Text } from "react-native";
import { format } from "date-fns";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { PrefsEvents, EVENTS } from "@/lib/events";

export function useResortListData() {
    const {
        resort,
        allResorts,
        loading,
        refreshing,
        refreshResorts,
        handleResortSelection,
    } = useSelectedResort();

    const {
        tier,
        status,
        expiresAt,
        ready: subsReady,
    } = useSubscription();

    const [subSlugs, setSubSlugs] = useState<Set<string>>(new Set());
    const [freeSlugs, setFreeSlugs] = useState<Set<string>>(new Set());
    const router = useRouter();
    const planName =
        tier === "premium" ? "Premium" :
            tier === "pro"      ? "Pro" :
                tier === "standard" ? "Standard" :
                    "Free";

    // -----------------------------------------------------------
    // STATUS NOTICE
    // -----------------------------------------------------------
    const StatusNotice = useCallback(() => {
        if (!subsReady) return null;

        const Box = ({ children }: { children: React.ReactNode }) => (
            <View
                style={{
                    padding: 12,
                    marginTop: 70,
                    backgroundColor: "#FFF9E6",
                    borderBottomWidth: 1,
                    borderBottomColor: "#E0C97B",
                }}
            >
                <Text style={{ color: "#7A5E00", fontWeight: "600" }}>
                    {children}
                </Text>
            </View>
        );

        if (status === "scheduled_cancel" && expiresAt)
            return <Box>{planName} will end on {format(expiresAt, "PPP")}.</Box>;

        if (status === "billing_issue")
            return <Box>We’re having trouble with your {planName} payment. Please update billing.</Box>;

        if (tier !== "premium") {
            return (
                <Box>
                    {tier === "free"
                        ? "Free: your home resort + 1 extra are open. 🔒 Upgrade for more."
                        : `${planName}: your home resorts + 2 extra are open. 🔒 Upgrade for all.`}
                </Box>
            );
        }

        return <Box>Premium User: Everything for the user that demands the best.</Box>;
    }, [subsReady, tier, status, expiresAt, planName]);

    // -----------------------------------------------------------
    // HOME RESORTS (from server)
    // -----------------------------------------------------------
    const [homeSlugs, setHomeSlugs] = useState<Set<string>>(new Set());

    const loadHomeSlugs = useCallback(async () => {
        try {
            const result = await fetchHomeResorts();
            const subs = new Set(result.subscribed_ids ?? []);
            const frees = new Set(result.free_ids ?? []);

            setSubSlugs(subs);
            setFreeSlugs(frees);

            const merged = new Set([...subs, ...frees]);
            // homeSlugs = union for unlock logic
            setHomeSlugs(merged);

            // -----------------------------------------
            // REDIRECT IF NO HOME RESORTS SELECTED
            // -----------------------------------------
            if (subsReady && merged.size === 0) {
                // Delay so React Navigation is safe
                setTimeout(() => {
                    Alert.alert(
                        "Select Home Resorts",
                        "Please select your home resorts to continue.",
                        [{ text: "OK", onPress: () => router.push("/tabs/settings") }]
                    );
                }, 200);
            }

        } catch (e) {
            console.warn("Failed to load home resorts", e);
        }
    }, []);

    // Always reload when subscription state or refresh changes
    useEffect(() => {
        if (!subsReady) return;
        void loadHomeSlugs();
    }, [subsReady, tier, refreshing, loadHomeSlugs]);

    // Reload whenever the user modifies home resorts in settings
    useEffect(() => {
        const reload = () => { void loadHomeSlugs(); };

        PrefsEvents.on(EVENTS.HOME_RESORTS_CHANGED, reload);

        return () => {
            PrefsEvents.off(EVENTS.HOME_RESORTS_CHANGED, reload);
        };
    }, [loadHomeSlugs]);




    // -----------------------------------------------------------
// ORDER — Subscribed → Free → Rest (original order inside groups)
// -----------------------------------------------------------
    const prioritizedResorts = useMemo(() => {
        if (!allResorts?.length) return allResorts;

        return [...allResorts].sort((a, b) => {
            const aSub = subSlugs.has(a.slug);
            const bSub = subSlugs.has(b.slug);

            const aFree = freeSlugs.has(a.slug);
            const bFree = freeSlugs.has(b.slug);

            // 1) Subscribed first
            if (aSub && !bSub) return -1;
            if (bSub && !aSub) return 1;

            // 2) Then free
            if (aFree && !bFree) return -1;
            if (bFree && !aFree) return 1;

            // 3) Otherwise preserve original order
            return 0;
        });
    }, [allResorts, subSlugs, freeSlugs])

    // -----------------------------------------------------------
    // UNLOCK LOGIC — Always reflect server truth
    // -----------------------------------------------------------
    const unlockedMask = useMemo(() => {
        return prioritizedResorts.map((r) => {
            if (!r) return false;
            if (tier === "premium") return true;
            return homeSlugs.has(r.slug);
        });
    }, [prioritizedResorts, tier, homeSlugs]);

// const unlockedMask = true
    // -----------------------------------------------------------
    // ORDER — keep original order (no re-sorting)
    // -----------------------------------------------------------
    // const prioritizedResorts = allResorts;

    // -----------------------------------------------------------
    // BADGES
    // -----------------------------------------------------------
    const isSubscribedHome = (r: Resort) => subSlugs.has(r.slug);
    const isFreeHome = (r: Resort) => freeSlugs.has(r.slug);


    // -----------------------------------------------------------
    // OUTPUT
    // -----------------------------------------------------------
    return {
        resort,
        prioritizedResorts,
        unlockedMask,
        isSubscribedHome,
        isFreeHome,
        loading,
        refreshing,
        refreshResorts,
        StatusNotice,
        handleResortSelection,
    };
}
