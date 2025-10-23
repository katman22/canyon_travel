// hooks/useOrbitronFont.ts
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export function useOrbitronFont() {
    const [fontsLoaded, fontError] = useFonts({
        // Use a RELATIVE path so Metro resolves a static asset at build time
        // (aliases can work, but static relative paths are the least fragile)
        Orbitron: require('../assets/fonts/Orbitron-VariableFont_wght.ttf'),
        'Orbitron-Bold': require('../assets/fonts/Orbitron-VariableFont_wght.ttf'),
    });

    // You can choose to not gate the app behind the splash — optional:
    useEffect(() => {
        // If you're using SplashScreen.preventAutoHideAsync() somewhere, be sure to hide when ready
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [fontsLoaded, fontError]);

    return {
        ready: true,                                   // always render app
        orbitronAvailable: fontsLoaded && !fontError,  // toggle styles off if not loaded
        error: fontError ?? null,
    };
}
