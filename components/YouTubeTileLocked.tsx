// YouTubeTileLocked.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    title: string;
    streamId: string;       // e.g., "4a-3iEM7bHk"
    description?: string;
    showRefresh?: boolean;  // default true
};

export default function YouTubeTileLocked({
                                              title,
                                              streamId,
                                              description,
                                              showRefresh = true,
                                          }: Props) {
    const h = Dimensions.get("window").width * 0.5625; // 16:9
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // bump this to force a reload → updates the preview frame
    const [nonce, setNonce] = useState<number>(() => Date.now());

    const url = useMemo(() => {
        // Use nocookie domain; controls off; fullscreen off; keyboard off; autoplay off
        // Add cache-buster via nonce so refresh always pulls the latest frame
        return (
            `https://www.youtube-nocookie.com/embed/${streamId}` +
            `?playsinline=1&controls=0&rel=0&modestbranding=1&fs=1&_=${nonce}`
        );
    }, [streamId, nonce]);

    return (
        <View style={styles.tile}>
            <View style={{ marginBottom: 8 }}>
                <Text style={styles.title}>{title}</Text>
                {!!description && <Text style={styles.description}>{description}</Text>}
            </View>

            <View style={{ height: h, width: "100%", borderRadius: 10, overflow: "hidden" }}>
                <WebView
                    key={nonce}                           // ✅ force remount on refresh
                    source={{ uri: url }}
                    style={{ height: "100%", width: "100%" }}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    allowsFullscreenVideo={false}
                    mediaPlaybackRequiresUserAction       // autoplay=0 + user action (but we block touches below)
                    originWhitelist={["*"]}
                    // ✅ allow only YouTube internals so subsequent loads aren’t blocked
                    onShouldStartLoadWithRequest={(req) => {
                        const u = req.url || "";
                        if (u.startsWith("about:blank")) return true;
                        if (
                            u.includes("youtube.com") ||
                            u.includes("youtube-nocookie.com") ||
                            u.includes("ytimg.com") ||
                            u.includes("googleusercontent.com")
                        ) return true;
                        return false;
                    }}
                    // ✅ make the iframe non-interactive so users cannot start playback
                    pointerEvents="none"
                    scrollEnabled={false}
                />

                {/* Interaction layer (above WebView) */}
                <View
                    pointerEvents="auto"
                    style={{
                        position: "absolute",
                        inset: 0,
                        justifyContent: "space-between",
                        padding: 8,
                    }}
                >
                    {/* Refresh button (works every time) */}
                    {showRefresh && (
                        <TouchableOpacity
                            onPress={() => setNonce(Date.now())}
                            style={{ alignSelf: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", padding: 6, borderRadius: 8 }}
                            hitSlop={12}
                        >
                            <Ionicons name="refresh" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Center badge to cover any residual play icon */}
                    <View style={{ alignItems: "center" }}>
                        <View
                            style={{
                                backgroundColor: "rgba(0,0,0,0.55)",
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 12 }}>
                                Live view fffff — refresh to update
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
