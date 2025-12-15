import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { Alerts, AlertWeather } from "@/constants/types";

type Props = {
    alerts?: AlertWeather[] | [];
    maxToShow?: number;              // default 3
    showSampleWhenEmpty?: boolean;   // default true
};

const SAMPLE_ALERT: AlertWeather = {
    event: "SAMPLE: Winter Storm Warning",
    headline: "SAMPLE: Heavy snow expected, travel will be difficult at times.",
    description:
        "SAMPLE: * WHAT...Heavy snow with blowing and drifting.\n* WHERE...Upper Cottonwood Canyons and adjacent peaks.\n* WHEN...From 5 AM to 6 PM TODAY.\n* IMPACTS...Snow-covered roads and reduced visibility.",
    instruction:
        "SAMPLE: Avoid unnecessary travel. If you must travel, keep an emergency kit in your vehicle.",
    status: "SAMPLE: Actual",
    severity: "SAMPLE: Severe",
    category: "Met",
    certainty: "SAMPLE: Likely",
    urgency: "SAMPLE: Expected",
    message_type: "SAMPLE: Alert",
    response: "SAMPLE: Prepare",
    sender_name: "SAMPLE: NWS Salt Lake City UT",
    sender: "SAMPLE: NWS Salt Lake City UT",
    effective: new Date().toISOString(),
    onset: new Date().toISOString(),
    // show 6pm local today as an example end
    expires: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    ends: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
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

export default function WeatherAlerts({
                                          alerts,
                                          maxToShow = 3,
                                          showSampleWhenEmpty = true,
                                      }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const items = useMemo(() => {
        const arr = Array.isArray(alerts) ? alerts : [];
        // sort: most urgent/severe first, then nearest end time
        const rankUrgency = (u?: string) =>
            ["immediate", "expected", "future", "past", "unknown"].indexOf((u || "").toLowerCase());
        const rankSeverity = (s?: string) =>
            ["extreme", "severe", "moderate", "minor", "unknown"].indexOf((s || "").toLowerCase());

        const sorted = [...arr].sort((a, b) => {
            const u = rankUrgency(a.urgency) - rankUrgency(b.urgency);
            if (u !== 0) return u;
            const s = rankSeverity(a.severity) - rankSeverity(b.severity);
            if (s !== 0) return s;
            const aEnds = a.ends ? Date.parse(a.ends) : Number.MAX_SAFE_INTEGER;
            const bEnds = b.ends ? Date.parse(b.ends) : Number.MAX_SAFE_INTEGER;
            return aEnds - bEnds;
        });

        // de-dupe by event+headline (keeps first of sorted)
        const seen = new Set<string>();
        const unique = sorted.filter((x) => {
            const key = `${x.event}|${x.headline}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return unique.slice(0, maxToShow);
    }, [alerts, maxToShow]);

    const showSample = showSampleWhenEmpty && items.length === 0;

    return (
        <View style={{ gap: 8 }}>
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

            {showSample && (
                <View
                    style={{
                        borderRadius: 10,
                        padding: 10,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        marginBottom: 20,
                        borderColor: severityColor(SAMPLE_ALERT.severity),
                    }}
                >
                    <Text style={styles.noAlertText}>
                        No Weather Alerts. The following is a sample.
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <View
                            style={{
                                height: 8,
                                width: 8,
                                borderRadius: 4,
                                backgroundColor: severityColor(SAMPLE_ALERT.severity),
                                marginRight: 8,
                            }}
                        />
                        <Text style={[styles.title, { flex: 1 }]} numberOfLines={2}>
                            {SAMPLE_ALERT.event}
                        </Text>
                    </View>

                    <Text style={[styles.infoText, { opacity: 0.9 }]} numberOfLines={2}>
                        {SAMPLE_ALERT.headline}
                    </Text>

                    <Text style={[styles.infoText, { opacity: 0.8, marginTop: 4 }]} numberOfLines={1}>
                        {fmtRange(SAMPLE_ALERT.onset, SAMPLE_ALERT.ends)}
                    </Text>
                    <Text style={[styles.infoText, { opacity: 0.7 }]} numberOfLines={1}>
                        {SAMPLE_ALERT.sender_name}
                    </Text>
                </View>
            )}
        </View>
    );
}
