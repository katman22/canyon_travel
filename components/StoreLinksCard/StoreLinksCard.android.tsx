import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Alert,
    Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

/* =====================
   Android – Google Play
   ===================== */

const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.wharepumanawa.canyon_travel";

type BtnProps = {
    label: string;
    onPress: () => void;
    kind?: "primary" | "secondary";
};

export default function StoreLinksCard() {
    const { colors } = useTheme();
    const styles = getStyles(colors as any);
    const [busy, setBusy] = useState<false | "open" | "share" | "copy">(false);

    const Btn = ({ label, onPress, kind = "primary" }: BtnProps) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.scrollBtn,
                kind === "secondary" && styles.scrollBtnSecondary,
            ]}
            accessibilityRole="button"
            disabled={!!busy}
        >
            <Text
                style={[
                    styles.scrollBtnText,
                    kind === "secondary" && styles.scrollBtnSecondaryText,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    const openStore = async () => {
        try {
            setBusy("open");
            await Linking.openURL(PLAY_STORE_URL);
        } catch {
            Alert.alert("Oops", "Unable to open Google Play Store.");
        } finally {
            setBusy(false);
        }
    };

    const shareLink = async () => {
        try {
            setBusy("share");
            await Share.share({
                message: PLAY_STORE_URL,
                url: PLAY_STORE_URL,
            });
        } finally {
            setBusy(false);
        }
    };

    const copyLink = async () => {
        try {
            setBusy("copy");
            await Clipboard.setStringAsync(PLAY_STORE_URL);
            Alert.alert("Copied", "Play Store link copied to clipboard.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.settingsCard}>
            <Text style={styles.scrollTitle}>Get Canyon Traveller</Text>
            <Text style={styles.scrollBlurb}>
                Install Canyon Traveler from Google Play.
            </Text>

            <View style={styles.scrollRow}>
                <Btn
                    label={busy === "open" ? "Opening…" : "Open in Play Store"}
                    onPress={openStore}
                />
            </View>

            <View style={[styles.scrollRow, { marginTop: 8 }]}>
                <Btn
                    kind="secondary"
                    label={busy === "share" ? "Sharing…" : "Share Link"}
                    onPress={shareLink}
                />
                <Btn
                    kind="secondary"
                    label={busy === "copy" ? "Copying…" : "Copy Link"}
                    onPress={copyLink}
                />
            </View>
        </View>
    );
}
