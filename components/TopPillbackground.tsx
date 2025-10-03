// components/TopPillBackground.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    color?: string;   // bar color
    height?: number;  // visible bar height below the status bar
    radius?: number;  // bottom corner radius
};

export default function TopPillBackground({
                                              color = "#79C878",
                                              height = 56,
                                              radius = 28,
                                          }: Props) {
    const insets = useSafeAreaInsets();
    const totalH = insets.top + height;

    return (
        <View
            pointerEvents="none"
            style={[
                styles.bar,
                {
                    marginTop: 50,
                    height: totalH,
                    backgroundColor: color,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                    marginBottom: 10
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    bar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        // keep it behind your content but above any background image
        zIndex: 0,
    },
});
