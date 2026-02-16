import React from "react";
import {
    View,
    Text, TouchableOpacity
} from "react-native";
import {
    Alerts, DailyForecastPeriod, DailyForecastResponse, type ForecastPeriod,
    type SunriseSunset,
} from "@/constants/types";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import Header from "@/components/Header";
import FullWeatherAlerts from "@/components/FullWeatherAlerts";
import CurrentForecastCard from "@/components/CurrentForecastCard";
import FullHourlyForecastStrip from "@/components/FullHourlyForecastStrip";
import FullForecastSummary from "@/components/FullForecastSummary";
import {ScrollView} from "react-native-gesture-handler";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import DailyForecastStrip from "@/components/DailyForecastStrip";
import {router} from "expo-router";

type Props = {
    resort_name?: string;
    hourlyWeather?: ForecastPeriod[];
    discussionLongData?: string;
    discussionShortData?: string;
    fetchResortWeather: () => void;
    weatherAlerts: Alerts | null;
    combinedForecast?: string;
    sunTimes: SunriseSunset | null
    dailyWeather?: DailyForecastPeriod[]
    hasRadarAccess: boolean
};

export default function FullSubsAndroid({
                                            resort_name,
                                            sunTimes,
                                            hourlyWeather,
                                            weatherAlerts,
                                            fetchResortWeather,
                                            dailyWeather,
                                            combinedForecast,
                                            hasRadarAccess
                                        }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                backgroundColor: '#fff',
                paddingBottom: 60,
            }}
            style={{ marginTop: 45 }}
        >
            <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>
            <Header
                message="Weather:"
                onRefresh={fetchResortWeather}
                colors={colors}
                resort={resort_name}
                showRefresh={true}
            />
            {hourlyWeather && (
                <View style={styles.travelInfoPanel} key="weather-panel">

                    <TouchableOpacity
                        onPress={() => {
                            if (hasRadarAccess) {
                                router.push("/tabs/radar");
                            } else {
                                router.push("/tabs/rc_subscriptions");
                            }
                        }}
                        activeOpacity={hasRadarAccess ? 0.85 : 0.9}
                        style={{
                            marginHorizontal: 16,
                            marginTop: 12,
                            marginBottom: 8,
                            paddingVertical: 12,
                            borderRadius: 10,
                            backgroundColor: hasRadarAccess ? "#1e88e5" : "#b0bec5",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        >
                            {hasRadarAccess ? "🛰 View Live Radar" : "🔒 Upgrade to Pro for Radar"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.panelSubtext, { fontWeight: "bold", marginTop: 15 }]}>
                        Alerts:
                    </Text>
                    <FullWeatherAlerts wAlerts={weatherAlerts?.alerts ?? []} />

                    <CurrentForecastCard period={hourlyWeather[0]} sun={sunTimes} />

                    <FullHourlyForecastStrip hourly={hourlyWeather} />

                    <DailyForecastStrip daily={dailyWeather} />

                    {combinedForecast && (
                        <>
                            <Text style={[styles.panelSubtext, { marginTop: 10, fontWeight: "bold" }]}>
                                Forecast Discussion:
                            </Text>
                            <FullForecastSummary text={combinedForecast} />
                        </>
                    )}

                    <Text style={styles.footerText}>
                        Updated: {new Date().toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                    })}
                    </Text>
                </View>
            )}

            <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/4750492703"} android_id={"ca-app-pub-6336863096491370/1652254050"}/>
        </ScrollView>
    );
}

