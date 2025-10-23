// components/SubscriptionPlanCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
    title: string;
    summary?: string;

    monthlyPriceText: string;   // "$4.99/mo"
    onPressMonthly: () => void;
    monthlyDisabled?: boolean;

    yearlyPriceText: string;    // "$29.99/yr"
    onPressYearly: () => void;
    yearlyDisabled?: boolean;

    features: ReadonlyArray<string>;
    popular?: boolean;
    yearlySavingsText?: string; // "Save 50%"
    tagLine?: string
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
                                         tagLine
                                     }: Props) {
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
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: "700" }}>{title}</Text>
                    {!!summary && <Text style={{color: '#000',  marginTop: 4 }}>{summary}</Text>}
                </View>
            </View>

            {/* Features */}
            <View style={{ marginTop: 10 }}>
                {features.map((f) => (
                    <Text key={f} style={{ color: '#000', marginTop: 2 }}>• {f}</Text>
                ))}
            </View>

            {/* Prices row: monthly (left) and yearly (right), bottom-aligned by buttons */}
            <View
                style={{
                    marginTop: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end", // <- bottom-align both columns by the buttons
                    gap: 16,
                }}
            >
                {/* Monthly column */}
                <View style={{ flexShrink: 1 }}>
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: "700" }}>{monthlyPriceText}</Text>
                    <TouchableOpacity
                        disabled={monthlyDisabled}
                        onPress={onPressMonthly}
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
                        <Text style={{ color: "white", fontWeight: "700" }}>Select Monthly</Text>
                    </TouchableOpacity>
                </View>

                {/* Yearly column */}
                <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
                    {!!yearlySavingsText && (
                        <View
                            style={{
                                alignSelf: "flex-start",     // slight left bias so it sits to the left of the price block
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

                    <Text style={{ fontSize: 18, fontWeight: "700" }}>{yearlyPriceText}</Text>

                    <TouchableOpacity
                        disabled={yearlyDisabled}
                        onPress={onPressYearly}
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
                        <Text style={{ color: "white", fontWeight: "700" }}>Select Yearly</Text>
                    </TouchableOpacity>
                </View>


            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4, marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{color: '#000',  marginTop: 4 }}>{tagLine}</Text>
                </View>
            </View>
        </View>
    );
}
