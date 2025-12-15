// components/ResortTile.tsx
import * as React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import type { Resort } from "@/constants/types";

function Badge({
                   label,
                   kind,
               }: {
    label: string;
    kind: "sub" | "free";
}) {
    const bg = kind === "sub" ? "#0B7" : "#666"; // slightly softer free color
    return (
        <View
            style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: bg,
                marginRight: 6,
            }}
        >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                {label}
            </Text>
        </View>
    );
}

export default function ResortTile({
                                       resort,
                                       isSelected,
                                       isLocked,
                                       onPress,
                                       showSubscribedBadge,
                                       showFreeBadge,
                                   }: {
    resort: Resort;
    isSelected: boolean;
    isLocked: boolean;
    onPress: () => void;
    showSubscribedBadge?: boolean;
    showFreeBadge?: boolean;
}) {
    const bg = isLocked
        ? "#9AAACE"
        : isSelected
            ? "#2E7D32"
            : "#4285F4";

    const opacity = isLocked ? 0.7 : 1;

    return (
        <TouchableOpacity
            onPress={onPress}
            // ❗ Do NOT disable locked resorts — they must trigger subscription flow
            disabled={false}
            style={{
                padding: 12,
                marginVertical: 8,
                backgroundColor: bg,
                borderRadius: 8,
                opacity,
            }}
            accessibilityRole="button"
            accessibilityLabel={resort.resort_name}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                {isLocked && <Text style={{ color: "#fff" }}>🔒</Text>}

                <Text
                    style={{
                        color: "#fff",
                        fontWeight: "700",
                        marginRight: 6,
                    }}
                >
                    {resort.resort_name}
                </Text>

                {showSubscribedBadge && (
                    <Badge kind="sub" label="Fave" />
                )}

                {showFreeBadge && (
                    <Badge kind="free" label="Free" />
                )}
            </View>

            <Text style={{ color: "#fff", opacity: 0.9 }}>
                {resort.location}
            </Text>

            {isLocked && (
                <Text
                    style={{
                        color: "#fff",
                        marginTop: 6,
                        fontStyle: "italic",
                    }}
                >
                    Upgrade to unlock this resort.
                </Text>
            )}
        </TouchableOpacity>
    );
}
