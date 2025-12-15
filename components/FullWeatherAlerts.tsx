import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { Alerts, AlertWeather } from "@/constants/types";

type Props = {
    wAlerts?: AlertWeather[] | [];
    maxToShow?: number;              // default 3
    showSampleWhenEmpty?: boolean;   // default true
};

function fmtRange(startISO?: string, endISO?: string) {
    const start = startISO ? new Date(startISO) : undefined;
    const end = endISO ? new Date(endISO) : undefined;

    const dateOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    };

    if (start && end) {
        const sameDay =
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate();

        const s = start.toLocaleString(undefined, dateOpts);
        const e = end.toLocaleString(undefined, sameDay ? { hour: "numeric", minute: "2-digit" } : dateOpts);
        return `${s} – ${e}`;
    }
    if (start) return start.toLocaleString(undefined, dateOpts);
    if (end) return `until ${end.toLocaleString(undefined, dateOpts)}`;
    return "Timing TBA";
}

function severityColor(sev?: string) {
    const s = (sev || "").toLowerCase();
    if (s === "extreme") return "#8B0000";
    if (s === "severe") return "#C0392B";
    if (s === "moderate") return "#D35400";
    if (s === "minor") return "#F1C40F";
    return "#7F8C8D"; // unknown
}

export default function FullWeatherAlerts({ wAlerts }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const items = useMemo(() => {
        const alertsArr = Array.isArray(wAlerts) ? wAlerts : [];

        // sort: most urgent/severe first, then nearest end time
        const rankUrgency = (u?: string) =>
            ["immediate", "expected", "future", "past", "unknown"].indexOf((u || "").toLowerCase());
        const rankSeverity = (s?: string) =>
            ["extreme", "severe", "moderate", "minor", "unknown"].indexOf((s || "").toLowerCase());

        const sorted = [...alertsArr].sort((alert, bert) => {
            const u = rankUrgency(alert.urgency) - rankUrgency(bert.urgency);
            if (u !== 0) return u;
            const s = rankSeverity(alert.severity) - rankSeverity(bert.severity);
            if (s !== 0) return s;
            const aEnds = alert.ends ? Date.parse(alert.ends) : Number.MAX_SAFE_INTEGER;
            const bEnds = bert.ends ? Date.parse(bert.ends) : Number.MAX_SAFE_INTEGER;
            return aEnds - bEnds;
        });

        // de-dupe by event+headline (keeps first of sorted)
        const seen = new Set<string>();
        return sorted.filter((x) => {
            const key = `${x.event}|${x.headline}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [wAlerts]);

    return (
        <View style={{ gap: 8, marginBottom: 0}}>
            {items.length > 0
                ? items.map((a, idx) => (
                    <View
                        key={`${a.event}-${a.onset || a.effective || idx}`}
                        style={{
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: severityColor(a.severity),
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                            <View
                                style={{
                                    height: 8,
                                    width: 8,
                                    borderRadius: 4,
                                    backgroundColor: severityColor(a.severity),
                                    marginRight: 8,
                                }}
                            />
                            <Text style={[styles.title, { flex: 1 }]} numberOfLines={2}>
                                {a.event}
                            </Text>
                        </View>

                        <Text style={[styles.infoText, { opacity: 0.9 }]} numberOfLines={2}>
                            {a.headline || a.description?.split("\n")?.[0] || "Alert in effect"}
                        </Text>

                        <Text style={[styles.infoText, { opacity: 0.8, marginTop: 4 }]} numberOfLines={1}>
                            {fmtRange(a.onset || a.effective, a.ends || a.expires)}
                        </Text>
                        <Text style={[styles.infoText, { opacity: 0.7 }]} numberOfLines={1}>
                            {a.sender_name || a.sender}
                        </Text>
                    </View>
                ))
                : null}

            {items.length == 0 && (
                <View
                    style={{
                        borderRadius: 10,
                        padding: 10,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        marginBottom: 10,
                        borderColor: severityColor("green"),
                    }}
                >
                    <Text style={styles.noAlertText}>
                        No Weather Alerts.
                    </Text>
                </View>
            )}
        </View>
    );
}
