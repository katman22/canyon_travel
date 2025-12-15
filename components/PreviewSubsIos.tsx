import React from "react";
import {
    View,
    Text
} from "react-native";
import {
    Alerts, type ForecastPeriod
} from "@/constants/types";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import Header from "@/components/Header";
import {ScrollView} from "react-native-gesture-handler";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import WeatherSection from "@/components/WeatherSection";

type Props = {
    resort_name?: string;
    hourlyWeather?: ForecastPeriod[];
    discussionShortData?: string;
    fetchResortWeather: () => void;
    weatherAlerts: Alerts | null;
    onPressSubscribe?: () => void;
};

export default function PreviewSubsIos({
                                            resort_name,
                                            hourlyWeather,
                                            weatherAlerts,
                                            discussionShortData,
                                            fetchResortWeather,
                                               onPressSubscribe
                                        }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    return (
        <ScrollView
            contentContainerStyle={styles.cameraContainer}
            showsVerticalScrollIndicator={false}
            style={{marginTop: 10}}
        >
            <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/4750492703"} android_id={"ca-app-pub-6336863096491370/1652254050"}/>
            <Header
                message="Weather:"
                onRefresh={fetchResortWeather}
                colors={colors}
                resort={resort_name}
                showRefresh={true}
            />
            <View style={styles.travelInfoPanel} key="weather-preview">
                <WeatherSection
                    alerts={weatherAlerts?.alerts ?? []}
                    hourly={hourlyWeather}
                    summary={discussionShortData}
                    isSubscribed={false}
                    showAll={false}
                    onPressSubscribe={onPressSubscribe}
                    onPressSeeMore={onPressSubscribe}
                />
                <Text style={styles.footerText}>
                    Updated: {new Date().toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                })}
                </Text>
            </View>
            <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>
        </ScrollView>
    );
}

