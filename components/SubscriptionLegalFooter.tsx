import React from "react";
import { View, Text, Linking, TouchableOpacity, StyleSheet } from "react-native";

const PRIVACY_URL = "https://www.canyontraveller.com/privacy";
const TERMS_URL   = "https://www.canyontraveller.com/terms";

export function SubscriptionLegalFooter() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period.
            </Text>

            {/* Inline links row */}
            <View style={styles.inlineRow}>
                <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                    <Text style={styles.link}>Privacy Policy</Text>
                </TouchableOpacity>

                <Text style={styles.separator}> | </Text>

                <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                    <Text style={styles.link}>Terms of Use</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 12,
        color: "#666",
        marginBottom: 10,
        textAlign: "left",
    },
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    separator: {
        marginHorizontal: 6,
        fontSize: 13,
        color: "#666",
    },
    link: {
        fontSize: 13,
        color: "#0057ff",
        textDecorationLine: "underline",
    },
});
