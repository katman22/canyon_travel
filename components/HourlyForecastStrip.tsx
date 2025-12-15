// components/HourlyForecastStrip.tsx
import React, {useMemo} from "react";
import {View, Text, FlatList, Image, TouchableOpacity} from "react-native";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type {ForecastPeriod, LocationHourlyForecast} from "@/constants/types";

type Props = {
    hourly: ForecastPeriod[] | LocationHourlyForecast | undefined;
    limit?: number;               // how many hours to show before the subscribe card; default 6
    onPressSubscribe?: () => void;
    prefix?: string | 'default';
    showSubscribeTile?: boolean;
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
    // inputs may be in 'name' or 'startTime'
    const d = new Date(isoOrName);
    if (isNaN(d.getTime())) return isoOrName; // fallback
    return d.toLocaleTimeString(undefined, {hour: "numeric"});
}

function pct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Math.round(v)}%`;
}

export default function HourlyForecastStrip({
                                                hourly,
                                                limit = 6,
                                                onPressSubscribe,
                                                prefix,
                                                showSubscribeTile
                                            }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    const hours = useMemo(() => {
        const arr = toArray(hourly);

        const sorted = [...arr].sort((a, b) => {
            const aT = new Date(a.startTime || a.name || 0).getTime();
            const bT = new Date(b.startTime || b.name || 0).getTime();
            return aT - bT;
        });

        // de-dupe by startTime
        const seen = new Set<string>();
        const unique = sorted.filter(h => {
            const key = h.startTime || `${h.name}-${h.number}`;
            if (!key) return true; // keep if we can't identify
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return unique.slice(0, limit); // <- show first N, no dup hours
    }, [hourly, limit]);

    // Data for FlatList: hourly tiles + one "subscribe" tile at the end
    type Row = { type: "hour"; item: ForecastPeriod } | { type: "subscribe" };
    const data: Row[] = useMemo(() => {
        const rows: Row[] = hours.map((h) => ({ type: "hour", item: h }));
        if (showSubscribeTile) rows.push({ type: "subscribe" });   // ← only append when showSubscribeTile
        return rows;
    }, [hours, showSubscribeTile]);

    return (
        <View style={{marginTop: 6, marginLeft: -10, marginBottom: 20}}>
            <FlatList
                data={data}
                keyExtractor={(row, i) => {
                    if (row.type === "subscribe") {
                        return `subscribe-${i}-short-strip-${prefix}`;
                    }
                    // row.type === "hour"
                    const h = row.item;
                    // make a stable-ish base from time or name/number
                    const base = safeTimeKey(h, i); // t<epoch> or n<name>-<number> or i<idx>
                    // then append index + prefix so that even duplicate startTimes become unique
                    return `${base}-${i}-short-strip-${prefix}`;
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled   // helps Android inside BottomSheet
                directionalLockEnabled
                contentContainerStyle={{paddingRight: 8}}
                renderItem={({item}) => {
                    if (item.type === "subscribe") {
                        return (
                            <View
                                style={{
                                    width: 90,
                                    marginLeft: 6,
                                    padding: 5,
                                    borderRadius: 12,
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: "#d0d7de",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <TouchableOpacity
                                    onPress={onPressSubscribe}
                                    accessibilityRole="button"
                                    accessibilityLabel="Subscriptions"
                                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                                >
                                    <Text style={[styles.infoText, {fontWeight: "600", textAlign: "center"}]}>
                                        🔒 5-Day Forecast
                                    </Text>
                                    <Text style={[styles.infoText, {
                                        fontSize: 12,
                                        opacity: 0.8,
                                        textAlign: "center",
                                        marginTop: 4
                                    }]}>
                                        Subscribe to view extended outlook
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    const h = item.item;
                    const time =
                        fmtTime(h.startTime || h.name) ||
                        (typeof h.number === "string" ? `+${h.number}h` : "");
                    const temp =
                        h.temperature != null
                            ? `${h.temperature}°${h.temperatureUnit || ""}`
                            : "—";
                    const pop = pct(h.probabilityOfPrecipitation?.value);
                    const wind = h.windSpeed || "";

                    return (
                        <View
                            style={{
                                width: 90,
                                marginLeft: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 8,
                                borderRadius: 12,
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: "#d0d7de",
                                alignItems: "center",
                            }}
                        >
                            <Text style={[styles.infoText, {fontWeight: "600"}]} numberOfLines={1}>
                                {time}
                            </Text>

                            {/* Weather icon */}
                            {h.icon ? (
                                <Image
                                    source={{uri: h.icon}}
                                    style={{width: 48, height: 48, marginVertical: 6}}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={{width: 48, height: 48, marginVertical: 6}}/>
                            )}

                            {/* Temp */}
                            <Text style={[styles.infoText, {fontSize: 16, fontWeight: "700"}]}>
                                {temp}
                            </Text>

                            {/* POP + Wind */}
                            <Text style={[styles.infoText, {fontSize: 12, marginTop: 2}]} numberOfLines={1}>
                                🌧 {pop}
                            </Text>
                            <Text style={[styles.infoText, {fontSize: 12}]} numberOfLines={1}>
                                💨 {wind}
                            </Text>

                            {/* Short label */}
                            <Text
                                style={[styles.infoText, {
                                    fontSize: 12,
                                    opacity: 0.8,
                                    textAlign: "center",
                                    marginTop: 2
                                }]}
                                numberOfLines={2}
                            >
                                {h.shortForecast || ""}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}
