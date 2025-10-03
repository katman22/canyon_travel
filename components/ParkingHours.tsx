import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { ParkingData, OperatingDays, OperatingHolidays } from "@/constants/types";

type Props = {
    parking?: ParkingData | null;
};

const sortByOrder = <T extends { order?: number }>(arr?: T[]) =>
    [...(arr ?? [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

function formatHoliday(dateStr?: string) {
    if (!dateStr) return "";
    // Expecting M-D-YYYY (e.g., "09-1-2025"); fall back to raw string if parse fails
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [m, d, y] = parts.map((n) => parseInt(n, 10));
    if (!m || !d || !y) return dateStr;
    const dt = new Date(y, m - 1, d);
    const formatted = dt.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    return formatted;
}

export default function ParkingHours({ parking }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const ops = parking?.operations;
    const days: OperatingDays[] = sortByOrder(ops?.operating_days);
    const holidays: OperatingHolidays[] = sortByOrder(ops?.holiday_open_days);

    const hasDays = days.length > 0;
    const hasHolidays = holidays.length > 0;

    return (
        <View style={{ gap: 8 }}>
            {/* Operating Hours */}
            <Text style={styles.panelHeader}>Operating Hours</Text>
            {hasDays ? (
                <View style={{ marginBottom: 8 }}>
                    {days.map((d, idx) => (
                        <Text key={`${d.day}-${idx}`} style={styles.infoText}>
                            {/* Show only the days as requested */}
                            {d.day} {d.hours}
                        </Text>
                    ))}
                </View>
            ) : (
                <Text style={styles.infoText}>Operating hours not available.</Text>
            )}

            {/* Holidays */}
            <Text style={styles.panelHeader}>Holidays</Text>
            {hasHolidays ? (
                <View style={{ marginBottom: 8 }}>
                    {holidays.map((h, idx) => {
                        const dateStr = formatHoliday(h.date);
                        // Optional hours support: if you later add `hours?: string` to OperatingHolidays
                        // @ts-ignore – only if you haven’t added `hours` to the type yet
                        const hours: string | undefined = h.hours;
                        return (
                            <Text key={`${h.label ?? "holiday"}-${h.date}-${idx}`} style={styles.infoText}>
                                {dateStr}
                                {h.label ? ` — ${h.label}` : ""}
                                {hours ? ` — ${hours}` : " — hours not listed"}
                            </Text>
                        );
                    })}
                </View>
            ) : (
                <Text style={styles.infoText}>No holiday openings posted.</Text>
            )}
        </View>
    );
}
