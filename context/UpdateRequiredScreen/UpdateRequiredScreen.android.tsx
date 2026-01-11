import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

// @ts-ignore
export default function UpdateRequiredScreen({ payload }) {
    const storeUrl =
        payload?.url ||
        "https://play.google.com/store/apps/details?id=com.wharepumanawa.canyon_travel";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Update Required</Text>
            <Text style={styles.message}>
                {payload?.message || "Please update Canyon Traveller to continue."}
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL(storeUrl)}
            >
                <Text style={styles.buttonText}>Update App</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 12,
    },
    message: {
        color: "#ddd",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    button: {
        backgroundColor: "#3BA6F2",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
