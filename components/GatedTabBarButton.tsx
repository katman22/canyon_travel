// components/GatedTabBarButton.tsx
import React from "react";
import { View, Pressable, ViewStyle } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useSubscription } from "@/context/SubscriptionContext";

type Props = BottomTabBarButtonProps & {
    requireSub?: boolean;
    fallbackHref?: string;
};

export default function GatedTabBarButton({
                                              requireSub = true,
                                              fallbackHref = "/tabs/rc_subscriptions",
                                              onPress,
                                              children,
                                              style,
                                              accessibilityHint,
                                              accessibilityLabel,
                                              accessibilityState,
                                              testID,
                                              hitSlop,
                                          }: Props) {
    const { isSubscribed } = useSubscription();

    const handlePress: NonNullable<BottomTabBarButtonProps["onPress"]> = (e) => {
        if (requireSub && !isSubscribed) {
            e.preventDefault?.();
            router.push(fallbackHref);
            return;
        }
        onPress?.(e);
    };

    return (
        <View style={style as ViewStyle}>
            <Pressable
                onPress={handlePress}
                accessibilityHint={
                    requireSub && !isSubscribed ? "Opens subscription options" : accessibilityHint
                }
                accessibilityLabel={accessibilityLabel}
                accessibilityState={accessibilityState}
                testID={testID}
                hitSlop={hitSlop}
            >
                {children}
            </Pressable>
        </View>
    );
}
