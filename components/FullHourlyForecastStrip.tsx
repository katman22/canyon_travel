// components/HourlyForecastStrip.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, FlatList, Image, Modal, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { ForecastPeriod, LocationHourlyForecast } from "@/constants/types";

type Props = {
    hourly: ForecastPeriod[] | LocationHourlyForecast | undefined;
    limit?: number;               // how many hours to show before the subscribe card; default 6 (unused here but kept)
    onPressSubscribe?: () => void;
};

// 1) Add helpers near the top
function safeTimeKey(p: ForecastPeriod, idx: number) {
    const t = p.startTime ? new Date(p.startTime).getTime() : NaN;
    if (!Number.isNaN(t)) return `t${t}`;                 // unique by epoch ms
    if (p.name || p.number) return `n${p.name || ""}-${p.number || ""}`;
    return `i${idx}`;                                     // final fallback
}


function toArray(hourly: Props["hourly"]): ForecastPeriod[] {
    if (!hourly) return [];
    if (Array.isArray(hourly)) return hourly;
    // handle { periods: ForecastPeriod[] }
    // ts-expect-error tolerate shape differences
    return Array.isArray(hourly.periods) ? hourly.periods : [];
}

function fmtTime(isoOrName?: string) {
    if (!isoOrName) return "";
    const d = new Date(isoOrName);
    if (isNaN(d.getTime())) return isoOrName; // fallback for "1 PM", etc.
    return d.toLocaleTimeString(undefined, { hour: "numeric" });
}

function fmtDay(isoOrName?: string) {
    if (!isoOrName) return "";
    const d = new Date(isoOrName);
    if (isNaN(d.getTime())) return ""; // only show when it's a real date
    return d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue...
}

function pct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Math.round(v)}%`;
}

export default function FullHourlyForecastStrip({ hourly }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const hours = useMemo(() => {
        const arr = toArray(hourly);

        // build [period, idx] so we can use idx in fallback keys
        const withIdx = arr.map((p, i) => [p, i] as const);

        // de-dupe by our base key
        const seen = new Set<string>();
        const uniq: ForecastPeriod[] = [];
        for (const [p, i] of withIdx) {
            const base = safeTimeKey(p, i); // uses epoch/name/number
            if (!seen.has(base)) {
                seen.add(base);
                uniq.push(p);
            }
        }

        // sort by startTime/name for display order
        return uniq.sort((a, b) => {
            const aT = new Date(a.startTime || a.name || 0).getTime();
            const bT = new Date(b.startTime || b.name || 0).getTime();
            return aT - bT;
        });
    }, [hourly]);

    if (!hours || hours.length === 0) {
        return (
            <View style={{ marginTop: 6, marginBottom: 15 }}>
                <Text style={[styles.panelSubtext, { fontWeight: "bold" }]}>
                    Hourly Forecast
                </Text>
                <Text style={styles.infoText}>
                    Hourly forecast temporarily unavailable.
                </Text>
            </View>
        );
    }


    // Double-tap + modal state
    const lastTapRef = useRef<number>(0);
    const [selected, setSelected] = useState<ForecastPeriod | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleTilePress = (period: ForecastPeriod) => {
        const now = Date.now();
        if (now - lastTapRef.current < 300 && period) {
            setSelected(period);
            setShowModal(true);
        }
        lastTapRef.current = now;
    };

    type Row = { type: "hour"; item: ForecastPeriod; key: string };

    const data: Row[] = useMemo(() => {
        const seenCounts = new Map<string, number>();
        return hours.map((h, idx) => {
            const base = safeTimeKey(h, idx);
            const count = (seenCounts.get(base) ?? 0) + 1;
            seenCounts.set(base, count);
            // if base repeats, suffix to guarantee uniqueness
            const key = count === 1 ? base : `${base}~${count}`;
            return { type: "hour", item: h, key };
        });
    }, [hours]);

    return (
        <View style={{ marginTop: 6, marginBottom: 15}}>
            <Text style={[styles.panelSubtext, { fontWeight: "bold" }]}>
                Hourly Forecast
            </Text>
            <FlatList
                data={data}
                keyExtractor={(row) => row.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                directionalLockEnabled
                contentContainerStyle={{ paddingRight: 8 }}
                renderItem={({ item }) => {
                    const hour = item.item;
                    const time =
                        fmtTime(hour.startTime || hour.name) ||
                        (typeof hour.number === "string" ? `+${hour.number}h` : "");
                    const day = fmtDay(hour.startTime || hour.name);
                    const temp =
                        hour.temperature != null
                            ? `${hour.temperature}°${hour.temperatureUnit || ""}`
                            : "—";
                    const pop = pct(hour.probabilityOfPrecipitation?.value);
                    const wind = hour.windSpeed || "";

                    return (
                        <Pressable
                            onPress={() => handleTilePress(hour)}
                            accessibilityRole="button"
                            accessibilityLabel={`Hourly forecast ${day ? `${day} ` : ""}${time}`}
                            style={{
                                width: 82,                 // slightly narrower
                                marginLeft: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 8,
                                borderRadius: 12,
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: "#d0d7de",
                                alignItems: "center",
                            }}
                        >
                            {/* Day (small) */}
                            {!!day && (
                                <Text
                                    style={[
                                        styles.infoText,
                                        { fontSize: 10, opacity: 0.75, marginBottom: 2 }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {day}
                                </Text>
                            )}

                            {/* Time */}
                            <Text
                                style={[styles.infoText, { fontWeight: "600", fontSize: 12 }]}
                                numberOfLines={1}
                            >
                                {time}
                            </Text>

                            {/* Weather icon */}
                            {hour.icon ? (
                                <Image
                                    source={{ uri: hour.icon }}
                                    style={{ width: 40, height: 40, marginVertical: 6 }}
                                    resizeMode="contain"
                                    onError={() => {
                                        // swallow icon failures silently
                                    }}
                                />
                            ) : (
                                <View style={{ width: 40, height: 40, marginVertical: 6 }} />
                            )}

                            {/* Temp */}
                            <Text style={[styles.infoText, { fontSize: 15, fontWeight: "700" }]}>
                                {temp}
                            </Text>

                            {/* POP + Wind */}
                            <Text style={[styles.infoText, { fontSize: 11, marginTop: 2 }]} numberOfLines={1}>
                                🌧 {pop}
                            </Text>
                            <Text style={[styles.infoText, { fontSize: 11 }]} numberOfLines={1}>
                                💨 {wind}
                            </Text>

                            {/* Short label */}
                            <Text
                                style={[
                                    styles.infoText,
                                    { fontSize: 11, opacity: 0.8, textAlign: "center", marginTop: 2 }
                                ]}
                                numberOfLines={2}
                            >
                                {hour.shortForecast || ""}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* Details Modal on double-tap */}
            <Modal
                visible={showModal && !!selected}
                animationType="slide"
                transparent
                onRequestClose={() => setShowModal(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        justifyContent: "flex-end",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: colors.background,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            paddingHorizontal: 16,
                            paddingTop: 12,
                            paddingBottom: 20,
                            maxHeight: "80%",
                        }}
                    >
                        <View style={{ alignItems: "center", marginBottom: 12 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: colors.border || "#d0d7de",
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                            {selected?.icon ? (
                                <Image
                                    source={{ uri: selected.icon }}
                                    style={{ width: 48, height: 48, marginRight: 10 }}
                                    resizeMode="contain"
                                />
                            ) : null}
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.infoText,
                                        { fontSize: 16, fontWeight: "700" }
                                    ]}
                                >
                                    {fmtDay(selected?.startTime || selected?.name)} {fmtTime(selected?.startTime || selected?.name)}
                                </Text>
                                <Text style={[styles.infoText, { fontSize: 14 }]}>
                                    {selected?.shortForecast}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={[styles.infoText, { fontSize: 16 }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={{ rowGap: 8 }}>
                                <InfoRow label="Temperature" value={
                                    selected?.temperature != null
                                        ? `${selected.temperature}°${selected?.temperatureUnit || ""}`
                                        : "—"
                                } />
                                <InfoRow label="Wind" value={`${selected?.windDirection || ""} ${selected?.windSpeed || ""}`} />
                                <InfoRow label="Precip Probability" value={pct(selected?.probabilityOfPrecipitation?.value)} />
                                <InfoRow label="Humidity" value={
                                    selected?.relativeHumidity?.value != null
                                        ? `${Math.round(selected.relativeHumidity.value)}%`
                                        : "—"
                                } />
                                <InfoRow label="Dew Point" value={
                                    selected?.dewpoint?.value != null
                                        ? `${Math.round(selected.dewpoint.value)}°`
                                        : "—"
                                } />
                                {!!selected?.detailedForecast && (
                                    <View style={{ marginTop: 6 }}>
                                        <Text style={[styles.infoText, { fontSize: 14, fontWeight: "700", marginBottom: 4 }]}>
                                            Details
                                        </Text>
                                        <Text style={[styles.infoText, { fontSize: 14, lineHeight: 20 }]}>
                                            {selected.detailedForecast}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, opacity: 0.7 }}>{label}</Text>
            <Text style={{ fontSize: 14, fontWeight: "600" }}>{value}</Text>
        </View>
    );
}
