// components/CurrentForecastCard.tsx
import React, { useMemo } from "react";
import {View, Text, Image, TouchableOpacity, Linking} from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { ForecastPeriod, SunriseSunset } from "@/constants/types";

type Props = {
    period?: ForecastPeriod;
    sun?: SunriseSunset | null;
};

function fmtTemp(p?: ForecastPeriod) {
    if (!p || p.temperature == null) return "—";
    return `${p.temperature}°${p.temperatureUnit || ""}`;
}

function fmtPct(n: number | null | undefined) {
    if (n == null) return "—";
    return `${Math.round(n)}%`;
}


export default function CurrentForecastCard({ period, sun }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const iconUri = period?.icon;
    const temp = fmtTemp(period);
    const pop = fmtPct(period?.probabilityOfPrecipitation?.value);
    const humidity =
        period?.relativeHumidity?.value != null ? `${Math.round(period.relativeHumidity.value)}%` : "—";
    const dewpoint =
        period?.dewpoint?.value != null ? `${Math.round(period.dewpoint.value)}°` : "—";

    const wind = [period?.windDirection, period?.windSpeed].filter(Boolean).join(" ");

    const sunrise = sun?.sunrise_sunset.sunrise;
    const sunset  = sun?.sunrise_sunset.sunset;
    const dayLen  = sun?.sunrise_sunset.day_length || "—";

    // Title e.g. "Now" or the hour label
    const header = useMemo(() => {
        if (!period) return "Current Forecast";
        // Prefer name like "2pm" if present, else from startTime
        const t = period.startTime || period.name;
        const d = t ? new Date(t) : null;

        if (d && !isNaN(d.getTime())) {
            return `Current • ${d.toLocaleTimeString(undefined, { hour: "numeric" })}`;
        }
        return "Forecast Summary";
    }, [period]);

    return (
        <View
            style={{
                marginTop: 10,
                marginBottom:10,
                padding: 12,
                borderRadius: 14,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: "#d0d7de",
            }}
        >
            <Text style={[styles.panelSubtext, { fontWeight: "bold", marginBottom: 8 }]}>{header}</Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Left: Icon + Temp */}
                <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                    {iconUri ? (
                        <Image
                            source={{ uri: iconUri }}
                            style={{ width: 56, height: 56, marginRight: 10 }}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={{ width: 56, height: 56, marginRight: 10 }} />
                    )}

                    <View style={{ justifyContent: "center" }}>
                        <Text style={[styles.infoText, { fontSize: 22, fontWeight: "800" }]}>{temp}</Text>
                        <Text
                            style={[styles.infoText, { fontSize: 14, opacity: 0.9, width: 140 }]}
                            numberOfLines={4}
                        >
                            {period?.detailedForecast || ""}
                        </Text>
                    </View>
                </View>

                {/* Right: Key stats */}
                <View style={{ marginLeft: "auto", rowGap: 4 }}>
                    <Text style={[styles.infoText, { fontSize: 13 }]}>🌧 POP: <Text style={{ fontWeight: "700" }}>{pop}</Text></Text>
                    <Text style={[styles.infoText, { fontSize: 13 }]}>💨 Wind: <Text style={{ fontWeight: "700" }}>{wind || "—"}</Text></Text>
                </View>
            </View>

            {/* Sun times row */}
            <View
                style={{
                    flexDirection: "row",
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                    columnGap: 14,
                    flexWrap: "wrap",
                }}
            >
                <SunStat label="Sunrise" value={String(sunrise)} />
                <SunStat label="Sunset" value={String(sunset)} />
                {sun?.sunrise_sunset.golden_hour ? <SunStat label="Golden hour" value={sun.sunrise_sunset.golden_hour} /> : null}
                <TouchableOpacity
                    style={{ marginTop: 12 }}
                    onPress={() => Linking.openURL("https://sunrisesunset.io/")}
                >
                    <Text
                        style={[
                            styles.infoText,
                            {
                                fontSize: 12,
                                textAlign: "right",
                                color: colors.primary,
                                textDecorationLine: "underline",
                            },
                        ]}
                    >
                        Powered by SunriseSunset.io
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function SunStat({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>{label}</Text>
            <Text style={{ fontSize: 14, fontWeight: "700" }}>{value}</Text>
        </View>
    );
}
