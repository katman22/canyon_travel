import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Checkbox from "expo-checkbox";
import { useSelectedResort } from "@/context/ResortContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { loadHomeResorts, saveHomeResorts } from "@/lib/userPrefs";
import { getActiveQuota, consumeChanges, nextResetAt } from "@/lib/homeResortQuota";
import { weeklyChangeCap } from "@/lib/weeklyChangeCap";
// NEW ⬇️ listen for resets fired by SubscriptionContext on expiry/downgrade
import { PrefsEvents, EVENTS } from "@/lib/events";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

export default function HomeResortSelector() {
    const { allResorts } = useSelectedResort();
    const { tier, allowedHomeResorts } = useSubscription();

    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const [selected, setSelected] = useState<string[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [used, setUsed] = useState(0);
    const [resetTs, setResetTs] = useState<number | null>(null);

    // hydrate saved selection + quota on mount
    useEffect(() => {
        (async () => {
            const ids = await loadHomeResorts();
            setSavedIds(ids);
            setSelected(ids);
            const q = await getActiveQuota();
            setUsed(q.used);
            setResetTs(await nextResetAt());
        })();
    }, []);

    // NEW ⬇️ react to quota/home resets (e.g., after subscription expiry)
    useEffect(() => {
        const reloadQuota = async () => {
            const q = await getActiveQuota();
            setUsed(q.used);
            setResetTs(await nextResetAt());
        };
        const reloadHomes = async () => {
            const ids = await loadHomeResorts();
            setSavedIds(ids);
            setSelected(ids);
        };

        const onQuotaReset = () => { void reloadQuota(); };
        const onHomesChanged = () => { void reloadQuota(); void reloadHomes(); };

        PrefsEvents.on(EVENTS.HOME_QUOTA_RESET, onQuotaReset);
        PrefsEvents.on(EVENTS.HOME_RESORTS_CHANGED, onHomesChanged);
        return () => {
            PrefsEvents.off(EVENTS.HOME_QUOTA_RESET, onQuotaReset);
            PrefsEvents.off(EVENTS.HOME_RESORTS_CHANGED, onHomesChanged);
        };
    }, []);

    const maxHomes = useMemo(
        () => (allowedHomeResorts === "all" ? Infinity : allowedHomeResorts),
        [allowedHomeResorts]
    );

    // Premium can have all homes; auto-select all if empty
    useEffect(() => {
        if (maxHomes === Infinity && (allResorts?.length ?? 0) > 0 && selected.length === 0) {
            setSelected((allResorts ?? []).map(r => String(r.resort_id)));
        }
    }, [maxHomes, allResorts?.length]);

    const toggle = (id: string) => {
        setSelected(prev => {
            const has = prev.includes(id);
            if (has) return prev.filter(r => r !== id);
            if (maxHomes !== Infinity && prev.length >= maxHomes) {
                Alert.alert(
                    "Limit reached",
                    `Your ${tier.toUpperCase()} plan allows ${maxHomes} home resort${maxHomes > 1 ? "s" : ""}.`
                );
                return prev;
            }
            return [...prev, id];
        });
    };

    // --- Weekly change enforcement on SAVE ---
    const cap = weeklyChangeCap(tier as any);
    const remaining =
        cap === "unlimited" ? Infinity : Math.max(0, cap - used);

    const mustAllowOne =
        tier === "none" && savedIds.length === 0; // no subscription + no saved home
    const effectiveRemaining =
        cap === "unlimited"
            ? Infinity
            : Math.max(mustAllowOne ? 1 : 0, remaining);
    // additions only (symmetric diff subset we care about)
    const pendingChanges = useMemo(() => {
        const saved = new Set(savedIds);
        let adds = 0;
        for (const id of selected) {
            if (!saved.has(id)) adds++;
        }
        return adds;
    }, [savedIds.join("|"), selected.join("|")]);


    const handleSave = async () => {
        // ⬇️ use effectiveRemaining instead of remaining
        if (cap !== "unlimited" && pendingChanges > effectiveRemaining) {
            const resetDate = resetTs ? new Date(resetTs) : null;
            const nice = resetDate
                ? resetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "soon";
            Alert.alert(
                "Weekly limit reached",
                `You have ${effectiveRemaining} addition${
                    effectiveRemaining === 1 ? "" : "s"
                } left this week, but this update needs ${pendingChanges}. You can add more after ${nice}.`
            );
            return;
        }

        try {
            setSaving(true);
            await saveHomeResorts(selected);
            setSavedIds(selected);

            if (cap !== "unlimited" && pendingChanges > 0) {
                const q = await consumeChanges(pendingChanges);
                setUsed(q.used);
                setResetTs(q.windowStart + 7 * 24 * 60 * 60 * 1000);
            }

            Alert.alert("Saved!", "Your home resort preferences have been updated.");
        } finally {
            setSaving(false);
        }
    };

    const resorts = (allResorts ?? []).filter(Boolean);
    const atHomesCap = maxHomes !== Infinity && selected.length >= maxHomes;

    return (
        <View style={styles.homeResWrap}>
            <Text style={styles.homeResHeading}>
                Choose your Home Resort{maxHomes === Infinity ? "s" : ""}
            </Text>

            <Text style={styles.homeResSubheading}>
                {tier === "none"
                    ? "Free users may select one home resort."
                    : tier === "standard"
                        ? "Standard users can select up to two."
                        : tier === "pro"
                            ? "Pro users can select up to four."
                            : "Premium users have all resorts."}
            </Text>

            <View style={styles.homeResChangesPill}>
                <Text style={styles.homeResChangesText}>
                    Changes left this week: {effectiveRemaining === Infinity ? "∞" : effectiveRemaining}
                    {resetTs
                        ? ` • Resets ${new Date(resetTs).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                        })}`
                        : ""}
                </Text>
            </View>

            <View>
                {resorts.map((item) => {
                    const id = String(item.resort_id);
                    const checked = selected.includes(id);
                    const lockAdd = !checked && atHomesCap;
                    return (
                        <TouchableOpacity
                            key={id}
                            onPress={() => !lockAdd && toggle(id)}
                            style={[styles.row, lockAdd && { opacity: 0.5 }]}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked, disabled: lockAdd }}
                        >
                            <Checkbox
                                value={checked}
                                onValueChange={() => toggle(id)}
                                color={checked ? "#2E7D32" : undefined}
                                disabled={lockAdd}
                            />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.homeResName}>{item.resort_name}</Text>
                                <Text style={styles.homeResSubText}>{item.location}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={handleSave}
                style={[styles.homeResSaveBtn, saving && { opacity: 0.7 }]}
                disabled={saving}
            >
                <Text style={styles.homeResSaveText}>
                    {saving ? "Saving…" : `Save (${pendingChanges} change${pendingChanges === 1 ? "" : "s"})`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
