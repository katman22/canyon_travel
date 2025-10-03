// PinchToZoomText.tsx
import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

const AText = Animated.createAnimatedComponent(Text);

type Props = {
    children: React.ReactNode;
    baseSize: number;        // e.g., styles.infoText.fontSize
    minScale?: number;       // default 1
    maxScale?: number;       // default 2.5
    onGestureStart?: () => void;
    onGestureEnd?: () => void;
    style?: TextStyle | TextStyle[];
};

export default function PinchToZoomText({
                                            children,
                                            baseSize,
                                            minScale = 1,
                                            maxScale = 2.5,
                                            onGestureStart,
                                            onGestureEnd,
                                            style,
                                        }: Props) {
    const startScale = useSharedValue(1);
    const scale = useSharedValue(1);

    const pinch = Gesture.Pinch()
        .onStart(() => { /* runOnJS(onGestureStart)?.() */ })
        .onUpdate((e) => {
            'worklet';
            // clamp scale; keep it in the worklet
            const next = Math.max(minScale, Math.min(maxScale, startScale.value * e.scale));
            scale.value = next;
        })
        .onEnd(() => { /* runOnJS(onGestureEnd)?.() */ });

    const animatedStyle = useAnimatedStyle(() => ({
        fontSize: baseSize * scale.value,
        // Optional: keep line height in proportion if you want tighter layout
        // lineHeight: (baseSize * 1.4) * scale.value,
    }));

    return (
        <GestureDetector gesture={pinch}>
            <AText style={[style, animatedStyle]}>
                {children}
            </AText>
        </GestureDetector>
    );
}
