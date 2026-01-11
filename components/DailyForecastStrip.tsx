import React, { useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    Modal,
    Pressable,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import {ForecastPeriod, DailyForecastResponse, DailyForecastPeriod} from "@/constants/types";

/* ---------- helpers ---------- */

function dayKey(p: ForecastPeriod, idx: number) {
    const t = p.startTime ? new Date(p.startTime).getTime() : NaN;
    if (!Number.isNaN(t)) return `d${t}`;
    return `i${idx}`;
}

function fmtDay(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { weekday: "long" });
}

function pct(v: number | null | undefined) {
    if (v == null) return "—";
    return `${Math.round(v)}%`;
}

/* ---------- component ---------- */

type Props = {
    daily?: DailyForecastPeriod[];
};

export default function DailyForecastStrip({ daily }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const days = useMemo(() => daily ?? [], [daily]);

    // double-tap handling
    const lastTapRef = useRef<number>(0);
    const [selected, setSelected] = useState<ForecastPeriod | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handlePress = (period: ForecastPeriod) => {
        const now = Date.now();
        if (now - lastTapRef.current < 300 && period) {
            setSelected(period);
            setShowModal(true);
        }
        lastTapRef.current = now;
    };

    if (!days.length) {
        return (
            <View style={{ marginTop: 8, marginBottom: 16 }}>
                <Text style={[styles.panelSubtext, { fontWeight: "bold" }]}>
                    Daily Forecast
                </Text>
                <Text style={styles.infoText}>
                    Daily forecast temporarily unavailable.
                </Text>
            </View>
        );
    }

    return (
        <View style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={[styles.panelSubtext, { fontWeight: "bold" }]}>
                Daily Forecast
            </Text>

            <FlatList
                data={days}
                horizontal
                keyExtractor={(item, idx) => dayKey(item, idx)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
                renderItem={({ item }) => {
                    const day = fmtDay(item.startTime) || item.name;
                    const temp =
                        item.temperature != null
                            ? `${item.temperature}°${item.temperatureUnit || ""}`
                            : "—";
                    const pop = pct(item.probabilityOfPrecipitation?.value);

                    return (
                        <Pressable
                            onPress={() => handlePress(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Daily forecast for ${day}`}
                            style={{
                                width: 164, // 2x hourly width
                                marginLeft: 8,
                                padding: 12,
                                borderRadius: 14,
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: "#d0d7de",
                            }}
                        >
                            {/* Day */}
                            <Text
                                style={[
                                    styles.infoText,
                                    { fontSize: 14, fontWeight: "700", marginBottom: 4 },
                                ]}
                                numberOfLines={1}
                            >
                                {day}
                            </Text>

                            {/* Icon */}
                            {item.icon ? (
                                <Image
                                    source={{ uri: item.icon }}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        alignSelf: "center",
                                        marginVertical: 4,
                                    }}
                                    resizeMode="contain"
                                    onError={() => {
                                        // swallow icon failures silently
                                    }}
                                />
                            ) : null}

                            {/* Temp */}
                            <Text
                                style={[
                                    styles.infoText,
                                    {
                                        fontSize: 22,
                                        fontWeight: "800",
                                        textAlign: "center",
                                        marginTop: 4,
                                    },
                                ]}
                            >
                                {temp}
                            </Text>

                            {/* POP + Wind */}
                            <Text
                                style={[
                                    styles.infoText,
                                    { fontSize: 12, textAlign: "center", marginTop: 4 },
                                ]}
                                numberOfLines={1}
                            >
                                🌧 {pop}   💨 {item.windSpeed || "—"}
                            </Text>

                            {/* Short forecast */}
                            <Text
                                style={[
                                    styles.infoText,
                                    {
                                        fontSize: 13,
                                        opacity: 0.85,
                                        marginTop: 6,
                                        textAlign: "center",
                                    },
                                ]}
                                numberOfLines={3}
                            >
                                {item.shortForecast}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* ---------- modal ---------- */}

            <Modal
                visible={showModal && !!selected}
                transparent
                animationType="slide"
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
                            padding: 18,
                            maxHeight: "80%",
                        }}
                    >
                        {/* grab handle */}
                        <View style={{ alignItems: "center", marginBottom: 10 }}>
                            <View
                                style={{
                                    width: 40,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: colors.border || "#d0d7de",
                                }}
                            />
                        </View>

                        {/* header */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {selected?.icon ? (
                                <Image
                                    source={{ uri: selected.icon }}
                                    style={{ width: 48, height: 48, marginRight: 12 }}
                                    resizeMode="contain"
                                    onError={() => {
                                        // swallow icon failures silently
                                    }}
                                />
                            ) : null}

                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.infoText,
                                        { fontSize: 18, fontWeight: "800" },
                                    ]}
                                >
                                    {fmtDay(selected?.startTime) || selected?.name}
                                </Text>
                                <Text style={[styles.infoText, { fontSize: 14 }]}>
                                    {selected?.shortForecast}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Text style={{ fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* details */}
                        <ScrollView style={{ marginTop: 12 }}>
                            <Text
                                style={[
                                    styles.infoText,
                                    { fontSize: 14, lineHeight: 20 },
                                ]}
                            >
                                {selected?.detailedForecast}
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
