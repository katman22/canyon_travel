// DoubleTap.tsx
import React, { PropsWithChildren, useRef } from "react";
import { Pressable, GestureResponderEvent } from "react-native";

type Props = PropsWithChildren<{
    onDoubleTap: (e: GestureResponderEvent) => void;
    onSingleTap?: (e: GestureResponderEvent) => void;
    delay?: number; // ms between taps
}>;

export default function DoubleTap({ children, onDoubleTap, onSingleTap, delay = 250 }: Props) {
    const lastTap = useRef<number>(0);

    function handlePress(e: GestureResponderEvent) {
        const now = Date.now();
        if (now - lastTap.current < delay) {
            onDoubleTap(e);
        } else {
            if (onSingleTap) onSingleTap(e);
        }
        lastTap.current = now;
    }

    return (
        <Pressable onPress={handlePress}>
            {children}
        </Pressable>
    );
}
