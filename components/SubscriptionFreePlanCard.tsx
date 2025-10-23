// components/SubscriptionPlanCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";


export function SubscriptionFreePlanCard() {
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
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: "700" }}>Free Plan </Text>
                    <Text style={{color: '#000',  marginTop: 4 }}>Start exploring – get a taste of real-time canyon access.</Text>
                </View>
            </View>

            {/* Features */}
            <View style={{ marginTop: 10 }}>
                <Text style={{ color: '#000', marginTop: 2 }}>• 1 home resort + 1 additional resort </Text>
                <Text style={{ color: '#000', marginTop: 2 }}>• 1 home resort change per week  </Text>
                <Text style={{ color: '#000', marginTop: 2 }}>• 5-min traffic updates  </Text>
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
                    <Text style={{ color: '#000', fontSize: 18, fontWeight: "700" }}>$0 / Free</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4, marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{color: '#000',  marginTop: 4 }}>🟢Try it out and see how smooth your drive can be.</Text>
                </View>
            </View>
        </View>
    );
}
