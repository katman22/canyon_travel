import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";

import getStyles from "@/assets/styles/styles";
import {
    fetchAlerts,
    fetchDiscussion,
    fetchHourlyWeather,
    fetchSunriseSunSet,
} from "@/hooks/UseRemoteService";
import { useSelectedResort } from "@/context/ResortContext";
import { useSubscription } from "@/context/SubscriptionContext";

import type { Alerts, LocationHourlyForecast, SunriseSunset } from "@/constants/types";

import BannerHeaderAd from "@/components/BannerHeaderAd";
import BrandedLoader from "@/components/BrandedLoader";
import CurrentForecastCard from "@/components/CurrentForecastCard";
import FullForecastSummary from "@/components/FullForecastSummary";
import FullHourlyForecastStrip from "@/components/FullHourlyForecastStrip";
import FullWeatherAlerts from "@/components/FullWeatherAlerts";
import Header from "@/components/Header";
import TopPillBackground from "@/components/TopPillbackground";
import SubscriptionGate from "@/components/SubscriptionGate";
import WeatherSection from "@/components/WeatherSection";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import {useEffectiveAccess} from "@/hooks/useEffectiveAccess";

export default function WeatherScreen() {
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { resort, loading: resortLoading } = useSelectedResort();
    const { isSubscribed } = useSubscription();
    const { canUseSub } = useEffectiveAccess(resort?.resort_id, isSubscribed);

    const [discussionShortData, setShortTerm] = useState<string>();
    const [discussionLongData, setLongTerm] = useState<string>();
    const [hourlyWeather, setHourly] = useState<LocationHourlyForecast | null>(null);
    const [weatherAlerts, setAlerts] = useState<Alerts | null>(null);
    const [sunTimes, setSunTimes] = useState<SunriseSunset | null>(null);

    const goSubscribe = () => router.replace("/tabs/rc_subscriptions");

    const dateOpts: Intl.DateTimeFormatOptions = {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    };

    const fetchResortWeather = async () => {
        if (!resort) return;
        setLoading(true);
        try {
            const wa = await fetchAlerts(resort);              setAlerts(wa);
            const hw = await fetchHourlyWeather(resort);       setHourly(hw);
            const disc = await fetchDiscussion(resort);
            setShortTerm(disc.discussion.short_term);
            setLongTerm(disc.discussion.long_range);
            const ss = await fetchSunriseSunSet(resort);       setSunTimes(ss);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resortLoading && resort) fetchResortWeather().then();
    }, [resortLoading, resort]);

    if (loading || resortLoading) {
        return (
            <SafeAreaView style={styles.defaultBackground}>
                <BrandedLoader message="Collecting NOAA Weather data…" />
            </SafeAreaView>
        );
    }

    // PREVIEW for non-subs: identical to the home section
    const previewForNonSubs = (
        <ScrollView
            contentContainerStyle={styles.cameraContainer}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 45 }}
        >
            <BannerHeaderAd />
            <Header
                message="Weather:"
                onRefresh={fetchResortWeather}
                colors={colors}
                resort={resort?.resort_name}
            />
            <View style={styles.travelInfoPanel} key="weather-preview">
                <WeatherSection
                    alerts={weatherAlerts}
                    hourly={hourlyWeather?.periods}
                    summary={discussionShortData}
                    isSubscribed={canUseSub}        // ← force preview rules
                    showAll={false}
                    onPressSubscribe={goSubscribe}
                    onPressSeeMore={goSubscribe} // “See more” goes to subs flow here
                />
            </View>
            <BannerHeaderAd />
        </ScrollView>
    );
    // FULL content for subscribers (your existing standalone UI)
    const fullForSubs = (
        <ScrollView
            contentContainerStyle={styles.cameraContainer}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 45 }}
        >
            <BannerHeaderAd />
            <Header
                message="Weather:"
                onRefresh={fetchResortWeather}
                colors={colors}
                resort={resort?.resort_name}
            />
            {discussionLongData && discussionShortData && hourlyWeather && (
                <View style={styles.travelInfoPanel} key="weather-panel">
                    <Text style={[styles.panelSubtext, { fontWeight: "bold", marginTop: 15 }]}>
                        Alerts:
                    </Text>
                    <FullWeatherAlerts wAlerts={weatherAlerts} />

                    <CurrentForecastCard period={hourlyWeather?.periods?.[0]} sun={sunTimes} />

                    <FullHourlyForecastStrip hourly={hourlyWeather?.periods} />

                    <Text style={[styles.panelSubtext, { marginTop: 10, fontWeight: "bold" }]}>
                        Current Forecast:
                    </Text>
                    <FullForecastSummary text={discussionShortData} />

                    <Text style={[styles.panelSubtext, { marginTop: 10, fontWeight: "bold" }]}>
                        Extended Forecast:
                    </Text>
                    <FullForecastSummary text={discussionLongData} />

                    <Text style={styles.footerText}>
                        Updated: {new Date().toLocaleString(undefined, dateOpts)}
                    </Text>
                </View>
            )}

            <BannerHeaderAd />
        </ScrollView>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#e6f3f8" }} edges={["top", "left", "right"]}>
            <TopPillBackground color="#71C476" height={12} radius={14} />
            <FloatingSettingsButton />
            {canUseSub ? fullForSubs : previewForNonSubs}
        </SafeAreaView>
    );
}
