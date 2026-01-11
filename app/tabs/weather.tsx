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
    fetchDailyWeather
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext";
import {useSubscription} from "@/context/SubscriptionContext";
import {
    Alerts, DailyForecastPeriod, DailyForecastResponse,
    LocationHourlyForecast,
    SunriseSunset,
} from "@/constants/types";
import BrandedLoader from "@/components/BrandedLoader";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";

import {fetchHomeResorts, type HomeResortsResponse} from "@/lib/homeResorts";
import {effectiveAccess} from "@/lib/access";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
// @ts-ignore
import FullSubs from "@/components/FullSubs";
// @ts-ignore
import PreviewSubs from "@/components/PreviewSubs";
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
    const [dailyWeather, setDaily] = useState<DailyForecastPeriod[] | null>(null);
    const [sunTimes, setSunTimes] = useState<SunriseSunset | null>(null);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16);
    const [homes, setHomes] = useState<HomeResortsResponse | undefined>(undefined);
    const goSubscribe = () => router.replace("/tabs/rc_subscriptions");
    const combinedForecast =
        (discussionShortData ?? "") +
        (discussionLongData ?? "");

    const withTimeout = <T,>(promise: Promise<T>, ms = 12000): Promise<T> =>
        Promise.race([
            promise,
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), ms)
            ),
        ]);

    const fetchResortWeather = async () => {
        if (!resort) return;

        setLoading(true);

        try {
            const [
                wa,
                hw,
                daily,
                disc,
                ss,
            ] = await Promise.allSettled([
                withTimeout(fetchAlerts(resort)),
                withTimeout(fetchHourlyWeather(resort)),
                withTimeout(fetchDailyWeather(resort)),
                withTimeout(fetchDiscussion(resort)),
                withTimeout(fetchSunriseSunSet(resort)),
            ]);

            if (wa.status === "fulfilled") setAlerts(wa.value);
            if (hw.status === "fulfilled") setHourly(hw.value);
            if (daily.status === "fulfilled") setDaily(daily.value.forecasts);

            if (disc.status === "fulfilled") {
                setShortTerm(disc.value.discussion.short_term);
                setLongTerm(disc.value.discussion.long_range);
            }

            if (ss.status === "fulfilled") setSunTimes(ss.value);

        } catch (e) {
            console.warn("fetchResortWeather error", e);
        } finally {
            setLoading(false); // ✅ GUARANTEED
        }
    };


    // Homes (server truth)
    useEffect(() => {
        let mounted = true;

        (async () => {
            if (!ready || !resort) return;
            try {
                const res = await fetchHomeResorts();
                console.log("home resorts result:", res, typeof res, Array.isArray(res));
                if (mounted) setHomes(res);
            } catch (e) {
                console.warn("fetchHomeResorts failed", e);
                if (mounted) setHomes(undefined);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [ready, resort?.resort_id]);

    // ---- ACCESS from homes + tier (no weather for FREE homes) ----
    const access = homes
        ? effectiveAccess(resort, homes, tier)
        : { fullAccess: false, weatherAccess: true }; // ← allow preview weather

    const {fullAccess, weatherAccess} = access;

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchResortWeather();
        }
    }, [resortLoading, resort]);

    if (resortLoading || loading){
        return (
            <SafeAreaView style={styles.defaultBackground}>
                <BrandedLoader message="Collecting NOAA Weather data…"/>
            </SafeAreaView>
        );
    }

    const fullForSubs = (
        <FullSubs
            resort_name={resort?.resort_name}
            discussionLongData={discussionLongData}
            discussionShortData={discussionShortData}
            combinedForecast={combinedForecast}
            fetchResortWeather={fetchResortWeather}
            weatherAlerts={weatherAlerts}
            sunTimes={sunTimes}
            hourlyWeather={hourlyWeather?.periods}
            dailyWeather={dailyWeather}
        />
    );

    const previewForNonSubs = (
        <PreviewSubs
            fetchResortWeather={fetchResortWeather}
            weatherAlerts={weatherAlerts}
            onPressSubscribe={goSubscribe}
            discussionShortData={discussionShortData}
            hourlyWeather={hourlyWeather?.periods}
            resort_name={resort?.resort_name}
        />
    );


    // If ANDROID → use Android-friendly view
    if (Platform.OS === "android") {
        return (
            <SafeAreaView
                style={{flex: 1, backgroundColor: "#e6f3f8"}}
                edges={["top", "left", "right"]}
            >
                <TopPillBackground color="#71C476" height={12} radius={14}/>
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
                    index={1}
                    snapPoints={snapPoints}
                    topInset={topInset}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{backgroundColor: colors.border || "#cfd8dc"}}
                    backgroundStyle={{backgroundColor: "#8ec88e"}}
                >
                    <BottomSheetScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 40,
                            backgroundColor: "#fff",
                        }}
                    >
                        {fullAccess && weatherAccess ? fullForSubs : previewForNonSubs}
                    </BottomSheetScrollView>
                </BottomSheet>

            </View>
        </SafeAreaView>
    );
}
