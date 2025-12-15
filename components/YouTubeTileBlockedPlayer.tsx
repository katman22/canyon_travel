import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    title: string;
    streamId: string;               // e.g., "4a-3iEM7bHk"
    description?: string;
    previewSeconds?: number;        // how long to play before blackout (default 60)
    showRefresh?: boolean;          // show refresh button (default true)
    ctaLabel?: string;              // text on CTA button
    onPressCTA?: () => void;        // handler for CTA (e.g., navigate to paywall)
};

export default function YouTubeTileBlockedPlayer({
                                                     title,
                                                     streamId,
                                                     description,
                                                     previewSeconds = 60,
                                                     showRefresh = true,
                                                     ctaLabel = "Subscribe to watch the full stream",
                                                     onPressCTA,
                                                 }: Props) {
    const h = Dimensions.get("window").width * 0.5625; // 16:9
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Force reload -> updates the stream frame when you tap refresh
    const [nonce, setNonce] = useState<number>(() => Date.now());

    // After previewSeconds, we blackout (hide player, show overlay)
    const [blackout, setBlackout] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build a minimal, non-interactive embed:
    // autoplay=1 (starts immediately), mute=1 (iOS autoplay), controls=0, fs=0, disablekb=1 (no UI)
    const url = useMemo(() => {
        // no autoplay, no mute, let controls show
        return (
                `https://www.youtube.com/watch/${streamId}?autoplay=1&playsinline=1&controls=1&fs=1`
        );
    }, [streamId, nonce]);

    // Start/Restart the preview timer whenever we (re)load the WebView
    const startTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setBlackout(false);
        timerRef.current = setTimeout(() => setBlackout(true), Math.max(0, Math.floor(previewSeconds)) * 1000);
    };

    useEffect(() => {
        startTimer(); // initial mount
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh: reload the WebView and restart the timer
    const handleRefresh = () => {
        setNonce(Date.now());
        startTimer();
    };

    return (
        <View style={styles.tile}>
            <View style={{ marginBottom: 8 }}>
                <Text style={styles.title}>{title}</Text>
                {!!description && <Text style={styles.description}>{description}</Text>}
            </View>

            <View style={{ height: h, width: "100%", borderRadius: 10, overflow: "hidden" }}>
                {/* Player (hidden once blackout=true) */}
                {!blackout && (
                    <WebView
                        key={nonce}
                        source={{ uri: url }}
                        style={{ height: "100%", width: "100%" }}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsInlineMediaPlayback
                        allowsFullscreenVideo={true}
                        mediaPlaybackRequiresUserAction={true} // user taps ▶ to start
                        originWhitelist={["*"]}
                        onLoadEnd={() => startTimer()}
                        onShouldStartLoadWithRequest={(req) => {
                            const u = req.url || "";
                            if (u.startsWith("about:blank")) return true;
                            if (
                                u.includes("youtube.com") ||
                                u.includes("youtube-nocookie.com") ||
                                u.includes("ytimg.com") ||
                                u.includes("googleusercontent.com")
                            )
                                return true;
                            return false;
                        }}
                    />
                )}

                {/* Touch-blocking layer (prevents interaction while playing) */}
                {!blackout && (
                    <View pointerEvents="auto" style={{ position: "absolute", inset: 0 }} />
                )}

                {/* Black overlay with CTA (shown after previewSeconds) */}
                {blackout && (
                    <View
                        pointerEvents="auto"
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "black",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            width: "100%",
                            gap: 8,
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 14, textAlign: "center" }}>
                            {ctaLabel}
                        </Text>

                        {!!onPressCTA && (
                            <TouchableOpacity
                                onPress={onPressCTA}
                                style={{
                                    backgroundColor: "#fff",
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <Text style={{ color: "#000" }}>Subscribe</Text>
                            </TouchableOpacity>
                        )}

                        {showRefresh && (
                            <TouchableOpacity
                                onPress={handleRefresh}
                                style={{
                                    marginTop: 6,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    borderColor: "#fff",
                                    borderWidth: 1,
                                }}
                                hitSlop={12}
                            >
                                <Text style={{ color: "#fff" }}>Refresh preview</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Optional top-right refresh while playing */}
                {!blackout && showRefresh && (
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            padding: 6,
                            borderRadius: 8,
                        }}
                        hitSlop={12}
                    >
                        <Ionicons name="refresh" size={18} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
