// settings.tsx
import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useDeviceUserId } from "@/utils/identity";
import getStyles from "@/assets/styles/styles";
import { useTheme } from "@react-navigation/native";

function shortId(id: string) {
    return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default function IdLoader() {
    const userId = useDeviceUserId();
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    return (
        /* inside your BottomSheetScrollView content */
        <View style={{ padding: 14, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, backgroundColor: "#fff", marginBottom: 16 }}>
            <Text style={{ fontWeight: "700", fontSize: 16, color: "#000" }}>Support User ID (Public)</Text>
            <Text selectable style={{ marginTop: 6, color: "#111" }}>
                {userId ? userId : "—"}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                    onPress={async () => {
                        if (!userId) return;
                        await Clipboard.setStringAsync(userId);
                        Alert.alert("Copied", "Your Support User ID was copied to the clipboard.");
                    }}
                    style={{
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 999,
                        backgroundColor: "#2563eb",
                        alignSelf: "flex-start",
                    }}
                >
                    <Text style={{ color: "white", fontWeight: "700" }}>Copy ID</Text>
                </TouchableOpacity>

                {/* Optional: show a shorter version inline */}
                {userId && (
                    <View style={{ justifyContent: "center" }}>
                        <Text style={{ color: "#555" }}>Short: {shortId(userId)}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
