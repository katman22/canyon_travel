// components/BrandedLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Animated } from 'react-native';
import { LightPalette as Palette } from '@/constants/palette';

type Props = {
    progress?: number;       // 0..1 (if undefined, we auto-animate to look alive)
    message?: string;
};

export default function BrandedLoader({ progress, message }: Props) {
    const anim = useRef(new Animated.Value(0)).current;

    // Smooth progress animation
    useEffect(() => {
        const target = typeof progress === 'number' ? progress : 0.9;
        Animated.timing(anim, { toValue: target, duration: 600, useNativeDriver: false }).start();
    }, [progress]);

    const width = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={StyleSheet.absoluteFill}>
            <ImageBackground
                source={require('@/assets/canyon_travellers_v6.png')}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                imageStyle={{ opacity: 0.75 }}
            />
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Canyon Traveller</Text>
                    <View style={styles.barOuter}>
                        <Animated.View style={[styles.barInner, { width }]} />
                    </View>
                    {!!message && <Text style={styles.message}>{message}</Text>}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        padding: 24,
    },
    card: {
        backgroundColor: Palette.card,
        borderColor: Palette.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
    },
    title: {
        color: Palette.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    barOuter: {
        height: 10,
        borderRadius: 8,
        backgroundColor: '#00000040',
        borderColor: Palette.border,
        borderWidth: 1,
        overflow: 'hidden',
    },
    barInner: {
        height: '100%',
        backgroundColor: Palette.primary,
    },
    message: {
        color: Palette.muted,
        marginTop: 10,
        fontSize: 12,
    },
});
