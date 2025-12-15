// components/WeatherSection.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import WeatherAlerts from "@/components/WeatherAlerts";
import HourlyForecastStrip from "@/components/HourlyForecastStrip";
import ForecastSummary from "@/components/ForecastSummary";
import {Alerts, AlertWeather, ForecastPeriod, LocationHourlyForecast} from "@/constants/types";

// Props your main view will pass in
type Props = {
    alerts?: AlertWeather[] | [];
    hourly?: ForecastPeriod[] | LocationHourlyForecast | undefined;
    summary?: string | null;

    isSubscribed: boolean;
    showAll?: boolean;                 // if true and subscribed, show everything (alerts+hourly)
    onPressSubscribe?: () => void;     // for upsell CTA
    onPressSeeMore?: () => void;       // for “see more” when summary > 1400
};

function random3(): string {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    return Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
}

export default function WeatherSection({
                                           alerts,
                                           hourly,
                                           summary,
                                           isSubscribed,
                                           showAll = false,
                                           onPressSubscribe,
                                           onPressSeeMore,
                                       }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Alerts: show first only if NOT subscribed; else all (or capped only by showAll=false? you said “show all if subscription”)
    const alertsMaxToShow = isSubscribed ? 999 : 1;

    // Hourly: unauth -> show 3 hours + subscribe tile; auth -> show 4 (unless showAll==true, then bigger)
    const hourlyLimit = isSubscribed ? (showAll ? 24 : 4) : 4;
    const showSubscribeTile = !isSubscribed;

    // Stable random key suffix to avoid FlatList clashes
    const prefix = useMemo(() => random3(), [isSubscribed, showAll]);

    // Summary: if subscribed, still truncate at 1400 chars and show a “See more” link if longer
    const maxSummaryChars = isSubscribed ? 1400 : 700;
    const maxSummarySentences = isSubscribed ? 12 : 2;

    return (
        <View style={{ marginTop: 10 }}>
            <Text style={styles.panelHeader}>Weather:</Text>

            {/* Alerts (always show; count depends on subscription) */}
            <Text style={styles.panelSubtext}>Alerts:</Text>
            <WeatherAlerts alerts={alerts} maxToShow={alertsMaxToShow} showSampleWhenEmpty />

            {/* Hourly strip */}
            <HourlyForecastStrip
                hourly={hourly}
                limit={hourlyLimit}
                showSubscribeTile={showSubscribeTile}
                onPressSubscribe={onPressSubscribe}
                prefix={prefix}
            />

            {/* Summary */}
            <ForecastSummary
                text={summary ?? undefined}
                isSubscribed={isSubscribed}
                maxChars={maxSummaryChars}
                maxSentences={maxSummarySentences}
                onPressSubscribe={onPressSubscribe}
                onPressSeeMore={onPressSeeMore}
            />
        </View>
    );
}
