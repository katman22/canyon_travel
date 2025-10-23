// components/SubscriptionGate.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type GateProps = {
    isSubscribed: boolean;
    children?: React.ReactNode;   // full content (subs)
    preview?: React.ReactNode;    // limited content (non-subs)
    onPressSubscribe: () => void;
};

function asElement(node: React.ReactNode): React.ReactNode {
    if (node === null || node === undefined || node === false) return null;
    if (typeof node === "string" || typeof node === "number") {
        return <Text>{String(node)}</Text>;
    }
    return node; // assume valid React element(s)
}

export default function SubscriptionGate({
                                             isSubscribed,
                                             children,
                                             preview,
                                             onPressSubscribe,
                                         }: GateProps) {
    if (isSubscribed) {
        return <>{asElement(children)}</>;
    }

    return (
        <View style={{ padding: 0 }}>
            {preview
                ? asElement(preview)
                : (
                    <View style={{ padding: 16 }}>
                        <Text style={{ fontSize: 16, marginBottom: 8 }}>
                            This view requires a subscription.
                        </Text>
                        <TouchableOpacity onPress={onPressSubscribe}>
                            <Text style={{ fontWeight: "600", textDecorationLine: "underline" }}>
                                Subscribe to unlock full weather details
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
        </View>
    );
}
