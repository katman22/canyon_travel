// @/components/ParkingLinks.tsx
import React from "react";
import { View, Text, Linking, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import type { ParkingLink } from "@/constants/types";

type Props = {
    links?: ParkingLink[] | null;
    title?: string;
};

const ParkingLinks: React.FC<Props> = ({ links, title = "Useful Links" }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!links || links.length === 0) return null;

    return (
        <View style={{ marginTop: 12 }}>
            <Text style={styles.panelSubtext}>{title}</Text>
            {links.map((l, idx) => (
                <TouchableOpacity
                    key={`${l.url}-${idx}`}
                    onPress={() => Linking.openURL(l.url)}
                    style={{
                        paddingVertical: 8,
                        borderBottomWidth: idx === links.length - 1 ? 0 : 1,
                        borderColor: colors.border,
                    }}
                >
                    <Text style={[styles.buttonTextSm, { fontSize: 12 }]}>{l.label}</Text>
                    <Text style={[styles.textSmall, { opacity: 0.7 }]} numberOfLines={1}>
                        {l.url}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default ParkingLinks;
