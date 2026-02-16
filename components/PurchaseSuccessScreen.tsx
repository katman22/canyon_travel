import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
    tierLabel: string;              // "Standard" | "Pro" | "Premium"
    onContinue: () => void;
};

export function PurchaseSuccessScreen({ tierLabel, onContinue }: Props) {
    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.icon}>✅</Text>

                <Text style={styles.title}>
                    Subscription Activated
                </Text>

                <Text style={styles.subtitle}>
                    You now have <Text style={styles.tier}>{tierLabel}</Text> access.
                </Text>

                <Text style={styles.body}>
                    Premium features have been unlocked successfully.
                </Text>

                <TouchableOpacity
                    onPress={onContinue}
                    accessibilityRole="button"
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
    },
    icon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#000",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#000",
        marginBottom: 12,
        textAlign: "center",
    },
    tier: {
        fontWeight: "800",
    },
    body: {
        fontSize: 14,
        color: "#374151",
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 999,
        minWidth: 160,
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "800",
        textAlign: "center",
        fontSize: 16,
    },
});
