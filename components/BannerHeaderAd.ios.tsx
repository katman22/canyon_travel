// components/BannerHeaderAd.ios.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Linking,
    ViewStyle,
    useWindowDimensions,
} from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

type Props = {
    ios_id?: string | null;
    campaigns?: HouseCampaign[];
    style?: ViewStyle;
};

type HouseCampaign = {
    id: string;
    title: string;
    image: any;
    url: string;
    cta?: string;
};

const DEFAULT_CAMPAIGNS: HouseCampaign[] = [
    {
        id: "aura_promo_ad",
        title: "Aura Weather - Ultimate weather companion",
        image: require("@/assets/ads/aura_house_one.png"),
        url: "https://www.auraweatherforecasts.com/",
    },
    {
        id: "aura_promo_ad_2",
        title: "Aura Weather – smart, fast, distraction-free forecasts",
        image: require("@/assets/ads/aura_house_two.png"),
        url: "https://www.auraweatherforecasts.com/",
    },
    {
        id: "ct_promo_ad1",
        title: "Canyon Traveller - Smooth Drives, Epic Rides",
        image: require("@/assets/ads/canyon_travel_house_1.png"),
        url: "https://www.canyontraveller.com/",
    },
];

function HouseBanner({
                         campaigns = DEFAULT_CAMPAIGNS,
                         height = 50,
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
        } catch {
            // ignore
        }
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

export default function BannerHeaderAdIos({ ios_id, campaigns, style }: Props) {
    const { width } = useWindowDimensions();

    const REAL_UNIT = ios_id
        ? {
            ios: ios_id ?? undefined,
        }
        : undefined;

    const adUnitId = REAL_UNIT?.ios || TestIds.BANNER;
    const unitId = __DEV__ ? TestIds.BANNER : adUnitId;

    const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
    const [adKey, setAdKey] = useState(0);
    const retryTimer = useRef<NodeJS.Timeout | null>(null);

    const fallbackHeight = useMemo(() => {
        return width >= 600 ? 50 : 50;
    }, [width]);

    const scheduleRetry = useCallback(() => {
        if (retryTimer.current) return;
        retryTimer.current = setTimeout(() => {
            retryTimer.current && clearTimeout(retryTimer.current);
            retryTimer.current = null;
            setStatus("loading");
            setAdKey((k) => k + 1);
        }, 50000);
    }, []);

    useEffect(() => {
        return () => {
            if (retryTimer.current) clearTimeout(retryTimer.current);
        };
    }, []);

    return (
        <SafeAreaView style={[styles.container, style]}>
            <View style={[styles.adWrapper, { minHeight: 20 }]}>
                {/* While loading / failed, show your own house banner */}
                {status === "loaded" ? null : (
                    <HouseBanner campaigns={campaigns} height={fallbackHeight} />
                )}

                <BannerAd
                    key={adKey}
                    unitId={unitId}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        // ATT authorized → can be personalized
                        // ATT denied / not authorized → non-personalized only
                        requestNonPersonalizedAdsOnly: true,
                    }}
                    onAdLoaded={() => {
                        setStatus("loaded");
                    }}
                    onAdFailedToLoad={(error) => {
                        if (__DEV__) console.log("❌ Ad failed:", error);
                        setStatus("failed");
                        scheduleRetry();
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: "#fff" },
    adWrapper: { alignItems: "center", justifyContent: "center" },

    houseContainer: {
        width: "100%",
        backgroundColor: "#0b4d2f",
        borderRadius: 8,
        overflow: "hidden",
    },
    houseImage: { width: "100%", height: "100%" },
});
