import React from "react";
import {
    View,
    Text
} from "react-native";
import {
    Alerts, type ForecastPeriod,
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

type Props = {
    resort_name?: string;
    hourlyWeather?: ForecastPeriod[];
    discussionLongData?: string;
    discussionShortData?: string;
    fetchResortWeather: () => void;
    weatherAlerts: Alerts | null;
    sunTimes: SunriseSunset | null
};

export default function FullSubsAndroid({
                                            resort_name,
                                            sunTimes,
                                            hourlyWeather,
                                            weatherAlerts,
                                            discussionShortData,
                                            discussionLongData,
                                            fetchResortWeather
                                        }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    return (
        <ScrollView
            contentContainerStyle={styles.cameraContainer}
            showsVerticalScrollIndicator={false}
            style={{marginTop: 45}}
        >
            <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>
            <Header
                message="Weather:"
                onRefresh={fetchResortWeather}
                colors={colors}
                resort={resort_name}
                showRefresh={true}
            />
            {discussionLongData && discussionShortData && hourlyWeather && (
                <View style={styles.travelInfoPanel} key="weather-panel">
                    <Text style={[styles.panelSubtext, {fontWeight: "bold", marginTop: 15}]}>
                        Alerts:
                    </Text>
                    <FullWeatherAlerts wAlerts={weatherAlerts?.alerts ?? []}/>

                    <CurrentForecastCard period={hourlyWeather[0]} sun={sunTimes}/>

                    <FullHourlyForecastStrip hourly={hourlyWeather}/>

                    <Text style={[styles.panelSubtext, {marginTop: 10, fontWeight: "bold"}]}>
                        Current Forecast:
                    </Text>
                    <FullForecastSummary text={discussionShortData}/>

                    <Text style={[styles.panelSubtext, {marginTop: 10, fontWeight: "bold"}]}>
                        Extended Forecast:
                    </Text>
                    <FullForecastSummary text={discussionLongData}/>

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

