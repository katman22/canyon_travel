import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { ParkingRule } from "@/constants/types";

type Props = {
    rules?: ParkingRule[] | null;
    title?: string;
};

const ParkingRules: React.FC<Props> = ({ rules, title = "Rules & FAQs" }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!rules || rules.length === 0) return null;

    return (
        <View style={styles.detailsContainer}>
            <Text style={styles.panelSubtext}>{title}</Text>
            {rules.map((r, idx) => (
                <View key={`${r.topic}-${idx}`} style={{ marginBottom: 10 }}>
                    <Text style={[styles.infoLine, { fontWeight: "700" }]}>{r.topic}</Text>
                    <Text style={styles.textSmall}>{r.details}</Text>
                </View>
            ))}
        </View>
    );
};

export default ParkingRules;