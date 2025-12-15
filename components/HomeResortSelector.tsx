import * as React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useSelectedResort } from "@/context/ResortContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
    fetchHomeResorts,
    updateHomeResorts,
    type HomeResortsResponse,
} from "@/lib/homeResorts";
import getStyles from "@/assets/styles/styles";
import { PrefsEvents, EVENTS } from "@/lib/events";

type Row = { slug: string; key: string; name: string };

function useAllResortRows(): Row[] {
    const { allResorts } = useSelectedResort();

    return React.useMemo(() => {
        return (allResorts ?? [])
            .map((r: any) => ({
                slug: String(r.slug),       // logical ID
                key: String(r.id),          // ALWAYS UNIQUE
                name: String(
                    r.resort_name ??
                    r.name ??
                    `Resort ${r.slug}`
                ),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [allResorts]);
}

type CheckboxProps = {
    checked: boolean;
    onToggle: () => void;
    disabled?: boolean;
    label?: string;
};

function Checkbox({ checked, onToggle, disabled, label }: CheckboxProps) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            disabled={disabled}
            style={[
                styles.checkbox,
                disabled && { opacity: 0.4 },
                checked && styles.checkboxChecked,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled: !!disabled }}
            accessibilityLabel={label}
        >
            {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
        </TouchableOpacity>
    );
}

export default function HomeResortSelector() {
    const { colors } = useTheme();
    const stylesTheme = getStyles(colors as any);
    const rows = useAllResortRows();
    const { tier } = useSubscription();
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [homes, setHomes] = React.useState<HomeResortsResponse | null>(null);

    const [subsSet, setSubsSet] = React.useState<Set<string>>(new Set());
    const [freeSet, setFreeSet] = React.useState<Set<string>>(new Set());

    let subsCap = 0;
    let freeCap = Number(homes?.limits?.free ?? 0);

    if (tier === "free") {
        // free tier → NO subscribed homes
        subsCap = 0;
    }

    if (tier === "standard" || tier === "pro") {
        subsCap = Number(homes?.limits?.subscribed ?? 0);
    }

    if (tier === "premium") {
        subsCap = Infinity;
    }

    const subsCount = subsSet.size;
    const freeCount = freeSet.size;

    const canAddSubscribed = subsCount < subsCap;
    const canAddFree = freeCount < freeCap;

    // LOAD
    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchHomeResorts();

            console.log("🔥 Fetch homes:", res);

            setHomes(res);

            const subs = (res.subscribed_ids ?? []).map(String);
            const frees = (res.free_ids ?? []).map(String);

            setSubsSet(new Set(subs));
            setFreeSet(new Set(frees));
        } catch (e: any) {
            setError(e?.message ?? "Failed to load home resorts.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => void load(), [load]);

    // ----- TOGGLES -----
    const toggleSubscribed = (slug: string) => {
        const nextSubs = new Set(subsSet);
        const nextFree = new Set(freeSet);

        if (nextSubs.has(slug)) {
            nextSubs.delete(slug);
        } else {
            if (!canAddSubscribed) return;
            nextSubs.add(slug);
            nextFree.delete(slug);
        }

        setSubsSet(nextSubs);
        setFreeSet(nextFree);
    };

    const toggleFree = (slug: string) => {
        const nextSubs = new Set(subsSet);
        const nextFree = new Set(freeSet);

        if (nextFree.has(slug)) {
            nextFree.delete(slug);
        } else {
            if (!canAddFree) return;
            nextFree.add(slug);
            nextSubs.delete(slug);
        }

        setFreeSet(nextFree);
        setSubsSet(nextSubs);
    };

    // DIRTY CHECK
    const dirty =
        !!homes &&
        (
            JSON.stringify([...subsSet].sort()) !==
            JSON.stringify([...((homes.subscribed_ids ?? []).map(String))].sort())
            ||
            JSON.stringify([...freeSet].sort()) !==
            JSON.stringify([...((homes.free_ids ?? []).map(String))].sort())
        );

    // SAVE
    const onSave = async () => {
        if (!dirty) return;
        setSaving(true);
        setError(null);

        try {
            await updateHomeResorts({
                subscribed_ids: [...subsSet],
                free_ids: [...freeSet],
            });

            await load();
            PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
        } catch (e: any) {
            setError(e?.message ?? "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    // REVERT
    const onRevert = () => {
        if (!homes) return;

        const subs = (homes.subscribed_ids ?? []).map(String);
        const frees = (homes.free_ids ?? []).map(String);

        setSubsSet(new Set(subs));
        setFreeSet(new Set(frees));
    };

    // LISTEN FOR EVENTS
    React.useEffect(() => {
        const reload = () => void load();
        PrefsEvents.on(EVENTS.HOME_RESORTS_CHANGED, reload);
        PrefsEvents.on(EVENTS.HOME_QUOTA_RESET, reload);

        return () => {
            PrefsEvents.off(EVENTS.HOME_RESORTS_CHANGED, reload);
            PrefsEvents.off(EVENTS.HOME_QUOTA_RESET, reload);
        };
    }, [load]);

    // ----- UI -----

    if (loading) {
        return (
            <View style={[styles.container, { padding: 16 }]}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: colors.text }}>
                    Loading home resorts…
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.descriptionRow}>
                <Text style={styles.descriptionText}>Choose your Fave and Free Resorts</Text>
            </View>
            <View style={styles.headerRow}>
                <Text style={[styles.headerCell, { width: 100 }]}>Fave</Text>
                <Text style={[styles.headerCell, { width: 80 }]}>Free</Text>
                <Text style={[styles.headerCell, { flex: 1 }]}>Resort</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                {rows.map((r) => {
                    const isSub = subsSet.has(r.slug);
                    const isFree = freeSet.has(r.slug);

                    const subDisabled = !isSub && !canAddSubscribed;
                    const freeDisabled = !isFree && !canAddFree;

                    return (
                        <View key={r.key} style={styles.row}>
                            <View style={{ width: 100, alignItems: "center" }}>
                                <Checkbox
                                    checked={isSub}
                                    onToggle={() => toggleSubscribed(r.slug)}
                                    disabled={subDisabled}
                                    label={`${r.name} favorite`}
                                />
                            </View>

                            <View style={{ width: 80, alignItems: "center" }}>
                                <Checkbox
                                    checked={isFree}
                                    onToggle={() => toggleFree(r.slug)}
                                    disabled={freeDisabled}
                                    label={`${r.name} free`}
                                />
                            </View>

                            <View style={{ flex: 1, justifyContent: "center" }}>
                                <Text style={styles.nameText}>{r.name}</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {homes && (
                <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
                    <Text style={{ color: colors.text, opacity: 0.8 }}>
                        Fave:{" "}
                        {subsCap === Infinity ? "All allowed" : `${subsCount}/${subsCap}`}
                        {" • "}
                        Free: {freeCount}/{freeCap}
                    </Text>
                </View>
            )}

            {!!error && (
                <Text
                    style={{
                        color: "#B00020",
                        paddingHorizontal: 12,
                        marginBottom: 8,
                    }}
                >
                    {error}
                </Text>
            )}

            <View style={[styles.actionRow, { paddingHorizontal: 12 }]}>
                <TouchableOpacity
                    onPress={onRevert}
                    style={[stylesTheme.statusBtnSecondary, { minWidth: 120 }]}
                    disabled={saving || !dirty}
                >
                    <Text style={stylesTheme.statusBtnSecondaryText}>Revert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onSave}
                    style={[
                        stylesTheme.statusBtn,
                        { minWidth: 120, opacity: saving || !dirty ? 0.7 : 1 },
                    ]}
                    disabled={saving || !dirty}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={stylesTheme.statusBtnText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { borderRadius: 12, overflow: "hidden" },
    descriptionText:{
        color: "#2E7D32",
        fontWeight: "700",
    },
    descriptionRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#999",
        backgroundColor: "#E8F5E9",
    },
    headerRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#999",
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    headerCell: {
        fontWeight: "700",
        color: "#444",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        fontSize: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(0,0,0,0.08)",
    },
    nameText: { fontSize: 16, color: "#222" },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#6B7280",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    checkboxChecked: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    checkboxTick: {
        color: "#fff",
        fontWeight: "800",
        lineHeight: 18,
    },
    actionRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(0,0,0,0.08)",
    },
});
