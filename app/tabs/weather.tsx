import "react-native-reanimated";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {View, ImageBackground, StyleSheet, StatusBar} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {useTheme} from "@react-navigation/native";
import {router} from "expo-router";
import getStyles from "@/assets/styles/styles";
import {
    fetchAlerts,
    fetchDiscussion,
    fetchHourlyWeather,
    fetchSunriseSunSet,
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext";
import {useSubscription} from "@/context/SubscriptionContext";
import type {
    Alerts,
    LocationHourlyForecast,
    SunriseSunset,
} from "@/constants/types";
import BrandedLoader from "@/components/BrandedLoader";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";

import {fetchHomeResorts, type HomeResortsResponse} from "@/lib/homeResorts";
import {effectiveAccess} from "@/lib/access";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import FullSubsAndroid from "@/components/FullSubsAndroid";
import PreviewSubsAndroid from "@/components/PreviewSubsAndroid";
import FullSubsIos from "@/components/FullSubsIos";
import PreviewSubsIos from "@/components/PreviewSubsIos";
import {Platform} from "react-native";
import TopPillBackground from "@/components/TopPillbackground";

export default function WeatherScreen() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const {tier, ready} = useSubscription();
    const [discussionShortData, setShortTerm] = useState<string>();
    const [discussionLongData, setLongTerm] = useState<string>();
    const [hourlyWeather, setHourly] = useState<LocationHourlyForecast | null>(null);
    const [weatherAlerts, setAlerts] = useState<Alerts | null>(null);
    const [sunTimes, setSunTimes] = useState<SunriseSunset | null>(null);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16);
    const [homes, setHomes] = useState<HomeResortsResponse | null>(null);
    const goSubscribe = () => router.replace("/tabs/rc_subscriptions");
    // ---- ACCESS from homes + tier (no weather for FREE homes) ----
    const access = homes
        ? effectiveAccess(resort, homes, tier)
        : { fullAccess: false, weatherAccess: false };

    const { fullAccess, weatherAccess } = access;


    const fetchResortWeather = async () => {
        if (!resort) return;
        setLoading(true);
        try {
            const wa = await fetchAlerts(resort);
            setAlerts(wa);

            const hw = await fetchHourlyWeather(resort);
            setHourly(hw);

            const disc = await fetchDiscussion(resort);
            setShortTerm(disc.discussion.short_term);
            setLongTerm(disc.discussion.long_range);
            const ss = await fetchSunriseSunSet(resort);
            setSunTimes(ss);
        } finally {
            setLoading(false);
        }
    };

    // Homes (server truth)
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!ready || !resort) return;
            const res = await fetchHomeResorts();
            if (mounted) setHomes(res);
        })();
        return () => {
            mounted = false;
        };
    }, [ready, resort]);

    useEffect(() => {
        if (!resortLoading && resort && homes) {
            fetchResortWeather().then();
        }
    }, [resortLoading, resort]);

    if (loading || resortLoading) {
        return (
            <SafeAreaView style={styles.defaultBackground}>
                <BrandedLoader message="Collecting NOAA Weather data…"/>
            </SafeAreaView>
        );
    }

    // Restricted preview (FREE homes)
    const previewForRestricted = (
        <PreviewSubsIos weatherAlerts={weatherAlerts}
                        hourlyWeather={hourlyWeather?.periods}
                        fetchResortWeather={fetchResortWeather}
                        discussionShortData={discussionShortData}
                        onPressSubscribe={goSubscribe}
                        resort_name={resort?.resort_name}
        />
    );

    // Full weather Android(Premium or subscribed home)
    const fullForSubs = (

        <FullSubsAndroid resort_name={resort?.resort_name}
                         discussionLongData={discussionLongData}
                         discussionShortData={discussionShortData}
                         fetchResortWeather={fetchResortWeather}
                         weatherAlerts={weatherAlerts} sunTimes={sunTimes} hourlyWeather={hourlyWeather?.periods}/>
    )
    // Preview weather Android
    const previewForNonSubs = (
        <PreviewSubsAndroid fetchResortWeather={fetchResortWeather}
                            weatherAlerts={weatherAlerts}
                            onPressSubscribe={goSubscribe}
                            discussionShortData={discussionShortData}
                            hourlyWeather={hourlyWeather?.periods}
                            resort_name={resort?.resort_name}
        />
    );

    // Full weather IOS(Premium or subscribed favorite)
    const fullForFullAccess = (
        <FullSubsIos resort_name={resort?.resort_name}
                     discussionLongData={discussionLongData}
                     discussionShortData={discussionShortData}
                     fetchResortWeather={fetchResortWeather}
                     weatherAlerts={weatherAlerts} sunTimes={sunTimes} hourlyWeather={hourlyWeather?.periods}/>

    );


    // If ANDROID → use Android-friendly view
    if (Platform.OS === "android") {
        return (
            <SafeAreaView
                style={{flex: 1, backgroundColor: "#e6f3f8"}}
                edges={["top", "left", "right"]}
            >
                <TopPillBackground color="#71C476" height={12} radius={14} />
                <FloatingSettingsButton/>
                {fullAccess && weatherAccess ? fullForSubs : previewForNonSubs}
            </SafeAreaView>
        );
    }

// Otherwise → iOS view
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#e6f3f8'}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: .75}}
            />

            <FloatingSettingsButton/>

            <View style={{flex: 1}}>
                <BottomSheet
                    ref={sheetRef}
                    index={snapPoints.length - 1}
                    snapPoints={snapPoints}
                    topInset={topInset}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{backgroundColor: colors.border || '#cfd8dc'}}
                    backgroundStyle={{backgroundColor: '#8ec88e'}}
                >
                    <BottomSheetScrollView
                        contentContainerStyle={styles.cameraContainer}
                        showsVerticalScrollIndicator={false}
                        style={{backgroundColor: "#fff"}}
                    >
                        {fullAccess && weatherAccess ? fullForFullAccess : previewForRestricted}
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>
    );
}
