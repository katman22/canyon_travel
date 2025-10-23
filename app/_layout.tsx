// app/_layout.tsx
import 'react-native-reanimated';
import * as React from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@react-navigation/native';
import { ResortProvider } from '@/context/ResortContext';
import { FontAvailabilityProvider } from '@/context/FontAvailability';
import { LightNavTheme } from '@/constants/palette';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { useOrbitronFont } from '@/hooks/useOrbitronFont';
import { SubscriptionProvider } from "@/context/SubscriptionContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedStatusBar() {
    const { colors, dark } = useTheme();
    return <StatusBar style={dark ? 'light' : 'dark'} backgroundColor={colors.background} animated />;
}

function RootLayout() {
    const { orbitronAvailable } = useOrbitronFont();


    React.useEffect(() => {
        // Android nav bar setup (unchanged) …
        const bg =
            Platform.OS === 'android' && Platform.Version < 26 ? '#f2f2f2' : '#ffffff';
        if (Platform.OS === 'android') NavigationBar.setBackgroundColorAsync(bg).then();
        if (Number(Platform.Version) >= 26) NavigationBar.setButtonStyleAsync('dark').then();
    }, []);

    useEffect(() => {
        const ads = mobileAds();
        const isTest = process.env.NODE_ENV !== 'production';
        const config = { ...(isTest && { testDeviceIdentifiers: ['1467F1BDFF81A4281E42855FF433E086', 'EMULATOR'] }) };
        ads.setRequestConfiguration(config).then(() => ads.initialize()).then(() => {
            console.log('✅ AdMob initialized', isTest ? 'with test device config' : 'in production');
        }).catch(err => console.error('❌ AdMob initialization failed:', err));
    }, []);

    useEffect(() => {}, [orbitronAvailable]);


    return (
        <FontAvailabilityProvider orbitronAvailable={orbitronAvailable}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider value={LightNavTheme}>
                    <SubscriptionProvider>
                    <ResortProvider>
                        <ThemedStatusBar />
                        <Slot />
                    </ResortProvider>
                    </SubscriptionProvider>
                </ThemeProvider>
            </GestureHandlerRootView>
        </FontAvailabilityProvider>
    );
}

export default RootLayout;
