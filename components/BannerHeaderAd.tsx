// components/BannerHeaderAd.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Image, Linking, ViewStyle, useWindowDimensions, Text } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

type Props = {
    id?: string | null;
    isTest?: boolean | true;
    // optional: override campaigns or styles
    campaigns?: HouseCampaign[];
    style?: ViewStyle;
};

type HouseCampaign = {
    id: string;
    title: string;
    image: any;        // require('...') or { uri }
    url: string;       // external deep link or in-app route handled by your nav
    cta?: string;
};

const DEFAULT_CAMPAIGNS: HouseCampaign[] = [
    {
        id: 'aura_promo_ad',
        title: 'Aura Weather - Ultimate weather companion',
        image: require('@/assets/ads/aura_house_one.png'),
        url: 'https://play.google.com/store/apps/details?id=com.onrender.pumanawa_kam'
    },
    {
        id: 'aura_promo_ad_2',
        title: 'Aura Weather isn’t just another weather app — it’s your smart, fast, and distraction-free forecast companion',
        image: require('@/assets/ads/aura_house_two.png'),
        url: 'https://play.google.com/store/apps/details?id=com.onrender.pumanawa_kam'
    },
    {
        id: 'ct_promo_ad1',
        title: 'Canyon Traveler - Smooth Drives, Epic Rides',
        image: require('@/assets/ads/canyon_travel_house_1.png'),
        url: 'https://play.google.com/store/apps/details?id=com.wharepumanawa.canyon_travel'
    }
];

// Simple rotating “house ad” for fallback
function HouseBanner({
                         campaigns = DEFAULT_CAMPAIGNS,
                         height = 50
                     }: {
    campaigns?: HouseCampaign[];
    height?: number;
}) {
    const [idx, setIdx] = useState(0);
    const current = campaigns[idx % campaigns.length];

    useEffect(() => {
        if (campaigns.length <= 1) return;
        const t = setInterval(() => setIdx((i) => i + 1), 10000);
        return () => clearInterval(t);
    }, [campaigns.length]);

    const onPress = useCallback(async () => {
        try {
            await Linking.openURL(current.url);
        } catch {}
    }, [current]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[styles.houseContainer, { height }]}
            accessibilityRole="button"
            accessibilityLabel={current.title}
        >
            <Image source={current.image} resizeMode="cover" style={styles.houseImage} />
        </TouchableOpacity>
    );
}

export default function BannerHeaderAd({ id, isTest, campaigns, style }: Props) {
    const { width } = useWindowDimensions();

    // Ad unit id (test by default unless you pass isTest=false & a real id)
    const adUnitId = id || TestIds.BANNER;
    const unitId = isTest ? TestIds.BANNER : adUnitId;

    // Track ad lifecycle
    const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

    // Re-mount <BannerAd> to trigger a reload after failure (cooldown to be polite)
    const [adKey, setAdKey] = useState(0);
    const retryTimer = useRef<NodeJS.Timeout | null>(null);

    // Anchored adaptive banners have dynamic height; reserve sensible fallback space
    const fallbackHeight = useMemo(() => {
        // rough heuristic: small phones ~50dp, large/tablets ~90dp
        return width >= 600 ? 50 : 50;
    }, [width]);

    const scheduleRetry = useCallback(() => {
        if (retryTimer.current) return;
        retryTimer.current = setTimeout(() => {
            retryTimer.current && clearTimeout(retryTimer.current);
            retryTimer.current = null;
            setStatus('loading');
            setAdKey((k) => k + 1); // re-mount BannerAd
        }, 50000); // ~50s cooldown (avoid aggressive reloads)
    }, []);

    useEffect(() => {
        return () => {
            if (retryTimer.current) clearTimeout(retryTimer.current);
        };
    }, []);

    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={[styles.adWrapper, { minHeight: 20 }]}>
                {/* Fallback shows while loading or failed; hidden once an ad loads */}
                {status === 'loaded' ? null : <HouseBanner campaigns={campaigns} height={fallbackHeight} />}

                <BannerAd
                    key={adKey}
                    unitId={unitId}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    // Keep requests non-personalized by default; you can adjust based on ATT/consent
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    onAdLoaded={() => {
                        if (__DEV__) console.log('✅ Ad loaded');
                        setStatus('loaded');
                    }}
                    onAdFailedToLoad={(error) => {
                        if (__DEV__) console.log('❌ Ad failed:', error);
                        setStatus('failed');
                        scheduleRetry();
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    adWrapper: { alignItems: 'center', justifyContent: 'center' },

    // House banner
    houseContainer: {
        width: '100%',
        backgroundColor: '#0b4d2f',
        borderRadius: 8,
        overflow: 'hidden'
    },
    houseImage: { width: '100%', height: '100%' },
    houseOverlay: {
        position: 'absolute',
        left: 8, right: 8, bottom: 6,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: 6,
        paddingHorizontal: 8, paddingVertical: 4
    },
    houseTitle: { color: '#fff', fontWeight: '600' },
    houseCta: { color: '#c8facc', fontWeight: '500', marginTop: 2 }
});
