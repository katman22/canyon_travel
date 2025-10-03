import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from "react-native";
import { useTheme } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import getStyles from "@/assets/styles/styles";
import type { ParkingFAQ } from "@/constants/types";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
    faqs?: ParkingFAQ[] | null;
    title?: string;
};

const ParkingFaqs: React.FC<Props> = ({ faqs, title = "FAQs" }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!faqs || faqs.length === 0) return null;

    const [openIndexes, setOpenIndexes] = useState<number[]>([]);

    const toggle = (idx: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndexes((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    return (
        <View style={styles.detailsContainer}>
            <Text style={styles.panelSubtext}>{title}</Text>
            {faqs.map((faq, idx) => {
                const isOpen = openIndexes.includes(idx);
                return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                        <TouchableOpacity
                            onPress={() => toggle(idx)}
                            accessibilityRole="button"
                            accessibilityLabel={`FAQ ${idx + 1}. ${faq.q}. ${isOpen ? "Collapse" : "Expand"}`}
                            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
                        >
                            <MaterialIcons
                                name={isOpen ? "expand-less" : "expand-more"}
                                size={20}
                                color={colors.text}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.infoLine, { fontWeight: "700", flex: 1 }]}>
                                {faq.q}
                            </Text>
                        </TouchableOpacity>

                        {isOpen && (
                            <Text style={[styles.textSmall, { marginTop: 4 }]}>{faq.a}</Text>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

export default ParkingFaqs;
