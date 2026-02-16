import React, { useMemo } from "react";
import {StyleSheet, View} from "react-native";
import { WebView } from "react-native-webview";
import { useSelectedResort } from "@/context/ResortContext";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";

export default function Radar() {
    const { resort, loading: resortLoading } = useSelectedResort();

    const url = useMemo(() => {
        if (!resort) return null;
        const lat = encodeURIComponent(String(resort.latitude));
        const lng = encodeURIComponent(String(resort.longitude));
        const type = "radar"; // default
        const locale = "en";
        return `https://www.auraweatherforecasts.com/forecast/radar_webview?lat=${lat}&lng=${lng}&type=${type}&locale=${locale}`;
    }, [resort?.latitude, resort?.longitude]);

    return (
        <View style={{ flex: 1 }}>
            {url && !resortLoading && (
                <WebView
                    source={{ uri: url }}
                    style={StyleSheet.absoluteFill}
                    javaScriptEnabled
                    domStorageEnabled
                    allowsInlineMediaPlayback
                    // important for map gestures:
                    scrollEnabled={false}
                    bounces={false}
                />
            )}
            <FloatingSettingsButton />
        </View>
    );
}
