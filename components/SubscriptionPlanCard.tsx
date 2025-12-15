// components/SubscriptionPlanCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
    title: string;
    summary?: string;

    monthlyPriceText: string;
    onPressMonthly?: () => void;
    monthlyDisabled?: boolean;

    yearlyPriceText: string;
    onPressYearly?: () => void;
    yearlyDisabled?: boolean;

    features: ReadonlyArray<string>;
    popular?: boolean;
    yearlySavingsText?: string;
    tagLine?: string;
    statusLabel?: string;

    // NEW
    monthlyCtaLabel?: string;
    yearlyCtaLabel?: string;
};

export function SubscriptionPlanCard({
                                         title,
                                         summary,
                                         monthlyPriceText,
                                         yearlyPriceText,
                                         features,
                                         popular,
                                         yearlySavingsText,
                                         onPressMonthly,
                                         onPressYearly,
                                         monthlyDisabled,
                                         yearlyDisabled,
                                         tagLine,
                                         statusLabel,
                                         monthlyCtaLabel,
                                         yearlyCtaLabel,
                                     }: Props) {
    const showCtas = !!onPressMonthly || !!onPressYearly; // hide buttons if status label is present

    return (
        <View
            style={{
                padding: 14,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 14,
                marginBottom: 12,
                backgroundColor: "#fff",
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    {popular && (
                        <View
                            style={{
                                alignSelf: "flex-start",
                                backgroundColor: "#fde68a",
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 8,
                                marginBottom: 8,
                            }}
                        >
                            <Text style={{ fontWeight: "700" }}>Most Popular</Text>
                        </View>
                    )}

                    <Text style={{ color: "#000", fontSize: 18, fontWeight: "700" }}>{title}</Text>
                    {!!summary && <Text style={{ color: "#000", marginTop: 4 }}>{summary}</Text>}

                    {!!statusLabel && (
                        <View
                            style={{
                                alignSelf: "flex-start",
                                backgroundColor: "#eef2ff",
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                borderRadius: 999,
                                marginTop: 8,
                            }}
                        >
                            <Text style={{ color: "#3730a3", fontWeight: "700" }}>{statusLabel}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Features */}
            <View style={{ marginTop: 10 }}>
                {features.map((f, i) => (
                    <Text key={i} style={{ color: "#000", marginTop: 2 }}>
                        • {f}
                    </Text>
                ))}
            </View>

            {/* Prices / CTAs */}
            <View
                style={{
                    marginTop: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: 16,
                }}
            >
                {/* Monthly */}
                <View style={{ flexShrink: 1 }}>
                    <Text style={{ color: "#000", fontSize: 18, fontWeight: "700" }}>{monthlyPriceText}</Text>

                    {showCtas && onPressMonthly && (
                        <TouchableOpacity
                            disabled={monthlyDisabled}
                            onPress={onPressMonthly}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !!monthlyDisabled }}
                            style={{
                                marginTop: 10,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 999,
                                backgroundColor: "#2563eb",
                                opacity: monthlyDisabled ? 0.5 : 1,
                                alignSelf: "flex-start",
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "700" }}>
                                {monthlyCtaLabel ?? "Select Monthly"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Yearly */}
                <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
                    {!!yearlySavingsText && (
                        <View
                            style={{
                                alignSelf: "flex-start",
                                backgroundColor: "#e8f5e9",
                                borderRadius: 999,
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                marginBottom: 6,
                            }}
                        >
                            <Text style={{ fontWeight: "800", color: "#166534" }}>{yearlySavingsText}</Text>
                        </View>
                    )}

                    <Text style={{ color: "#000", fontSize: 18, fontWeight: "700" }}>{yearlyPriceText}</Text>

                    {showCtas && onPressYearly && (
                        <TouchableOpacity
                            disabled={yearlyDisabled}
                            onPress={onPressYearly}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !!yearlyDisabled }}
                            style={{
                                marginTop: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 999,
                                backgroundColor: "#66bb6a",
                                opacity: yearlyDisabled ? 0.5 : 1,
                                alignSelf: "flex-end",
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "700" }}>
                                {yearlyCtaLabel ?? "Select Yearly"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {!!tagLine && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4, marginTop: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: "#000", marginTop: 4 }}>{tagLine}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}
