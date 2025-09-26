// app/Weather.tsx
// Show an hourly, current and extended forecasts
import 'react-native-reanimated';
import React, {useEffect,useState} from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import getStyles from '@/assets/styles/styles';
import {fetchAlerts, fetchDiscussion, fetchHourlyWeather, fetchSunriseSunSet} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext";
import {Alerts, LocationHourlyForecast, SunriseSunset} from "@/constants/types";
import {useTheme} from '@react-navigation/native';
import FullForecastSummary from "@/components/FullForecastSummary";
import FullHourlyForecastStrip from "@/components/FullHourlyForecastStrip";
import FullWeatherAlerts from "@/components/FullWeatherAlerts";
import {ScrollView} from 'react-native-gesture-handler';
import TopPillBackground from "@/components/TopPillbackground";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import Header from "@/components/Header";
import CurrentForecastCard from "@/components/CurrentForecastCard";
import BannerHeaderAd from "@/components/BannerHeaderAd";

export default function Weather() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const {progress, reset, next} = useStepProgress(5); // Setting 4 steps
    const [discussionShortData, setShortTerm] = useState<string>();
    const [discussionLongData, setLongTerm] = useState<string>();
    const [hourlyWeather, setHourly] = useState<LocationHourlyForecast | null>(null);
    const [weatherAlerts, setAlerts] = useState<Alerts | null>(null);
    const [sun_times, setSunrise] = useState<SunriseSunset | null>(null);

    const dateOpts: Intl.DateTimeFormatOptions = {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    };

    const fetchResortWeather = async () => {
        if (!resort) return;
        setLoading(true);
        reset();
        try {
            const weatherAlerts = await fetchAlerts(resort);
            setAlerts(weatherAlerts);
            next(); // 1/5
            const hourlyData = await fetchHourlyWeather(resort);
            setHourly(hourlyData);
            next(); // 2/5
            const discussionData = await fetchDiscussion(resort);
            setShortTerm(discussionData.discussion.short_term);
            next(); // 3/5
            setLongTerm(discussionData.discussion.long_range);
            next(); //4/5
            const sunriseSunset = await fetchSunriseSunSet(resort)
            setSunrise(sunriseSunset)
            next(); //5/5
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
                <BrandedLoader progress={progress} message="Collecting NOAA Weather data...."/>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#e6f3f8"}} edges={["top", "left", "right"]}>
            {/* Green rounded strip, no Bottom sheet due to issue with scrolling */}
            <TopPillBackground color="#71C476" height={12} radius={14}/>
            <ScrollView
                contentContainerStyle={styles.cameraContainer}
                showsVerticalScrollIndicator={false}
                style={{marginTop: 45}}
            >

                <BannerHeaderAd id={null} isTest={true}/>
                <Header message={"Weather:"} onRefresh={fetchResortWeather} colors={colors} resort={resort?.resort_name}/>
                {discussionLongData && discussionShortData && hourlyWeather && (

                    <View style={styles.travelInfoPanel} key="weather-panel">

                        <Text style={[styles.panelSubtext, {fontWeight: "bold", marginTop: 15}]}>Alerts:</Text>
                        <FullWeatherAlerts wAlerts={weatherAlerts}/>

                        <CurrentForecastCard
                            period={hourlyWeather?.periods?.[0]}
                            sun={sun_times} />

                        {/* Hourly weather */}
                        <FullHourlyForecastStrip hourly={hourlyWeather?.periods}/>
                        {/*<BannerHeaderAd />*/}

                        <Text style={[styles.panelSubtext, {marginTop: 10, fontWeight: "bold"}]}>Current
                            Forecast:</Text>
                        <FullForecastSummary text={discussionShortData}/>

                        <Text style={[styles.panelSubtext, {marginTop: 10, fontWeight: "bold"}]}>Extended
                            Forecast:</Text>
                        <FullForecastSummary text={discussionLongData}/>

                        <Text style={styles.footerText}>
                            Updated: {new Date().toLocaleString(undefined, dateOpts)}
                        </Text>
                    </View>
                )}
                <BannerHeaderAd />
            </ScrollView>
        </SafeAreaView>
    );
}
