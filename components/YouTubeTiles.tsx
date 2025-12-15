import React from "react";
import { View, Text, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
    title: string;
    streamId: string;        // Just "4a-3iEM7bHk"
    description?: string;
};

export default function YouTubeTile({ title, streamId, description }: Props) {
    // Bigger video: 70% of screen width
    const w = Dimensions.get("window").width;
    const h = w * 0.55; // taller than 16:9 for better readability

    // Clean streamId (remove any ?si)
    const cleanId = streamId.split("?")[0];

    const liveUrl = `https://www.youtube.com/watch/${cleanId}?autoplay=1&playsinline=1&controls=1&fs=1`;

    return (
        <View style={{ paddingVertical: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 6 }}>
                {title}
            </Text>
            <WebView
                source={{ uri: liveUrl }}
                style={{
                    width: "100%",
                    height: h,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "black",
                }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={["*"]}
                allowsProtectedMedia
                mixedContentMode="always"
            />
        </View>
    );
}
