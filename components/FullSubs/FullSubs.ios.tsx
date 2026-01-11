import React from "react";
import {
    View,
    Text
} from "react-native";
import {
    Alerts, DailyForecastPeriod, type ForecastPeriod,
    type SunriseSunset,
} from "@/constants/types";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import Header from "@/components/Header";
import FullWeatherAlerts from "@/components/FullWeatherAlerts";
import CurrentForecastCard from "@/components/CurrentForecastCard";
import FullHourlyForecastStrip from "@/components/FullHourlyForecastStrip";
import FullForecastSummary from "@/components/FullForecastSummary";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import DailyForecastStrip from "@/components/DailyForecastStrip";

type Props = {
    dailyWeather?: DailyForecastPeriod[]
    resort_name?: string;
    hourlyWeather?: ForecastPeriod[];
    discussionLongData?: string;
    discussionShortData?: string;
    combinedForecast?: string;
    fetchResortWeather: () => void;
    weatherAlerts: Alerts | null;
    sunTimes: SunriseSunset | null
};

export default function FullSubsIos({
                                            resort_name,
                                            sunTimes,
                                            hourlyWeather,
                                            weatherAlerts,
                                            discussionShortData,
                                            discussionLongData,
                                            fetchResortWeather,
                                        dailyWeather,
                                        combinedForecast
                                        }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    return (
        <View>
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
                    <Text style={[styles.panelSubtext, {fontWeight: "bold", marginTop: 15}]}>
                        Alerts:
                    </Text>
                    <FullWeatherAlerts wAlerts={weatherAlerts?.alerts ?? []}/>

                    <CurrentForecastCard
                        period={hourlyWeather[0]}
                        sun={sunTimes ?? undefined}
                    />

                    <DailyForecastStrip daily={dailyWeather} />

                    <FullHourlyForecastStrip hourly={hourlyWeather}/>

                    {combinedForecast ? (
                        <>
                            <Text style={[styles.panelSubtext, { marginTop: 10, fontWeight: "bold" }]}>
                                Forecast Discussion:
                            </Text>
                            <FullForecastSummary text={combinedForecast} />
                        </>
                    ) : (
                        <Text style={styles.infoText}>
                            Forecast discussion temporarily unavailable.
                        </Text>
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
        </View>
    );
}

