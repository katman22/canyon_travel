import React from "react";
import {View, Text} from "react-native";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import {cleanForecastText} from "@/utils/text";

type Props = {
    text?: string | null;
};

export default function FullForecastSummary({
                                            text,
                                        }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);

    if (!text) {
        return <Text style={styles.infoText}>Forecast not available.</Text>;
    }

    return (
        <View style={styles.weatherCard}>
            <View>
                <Text style={styles.infoText}>{cleanForecastText(text)}</Text>
            </View>
        </View>
    );
}
