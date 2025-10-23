import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Platform, Linking, Alert, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.wharepumanawa.canyon_travel";
const IOS_APP_ID = "6752226942";
const IOS_FALLBACK_SEARCH = `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/search?term=com.wharepumanawa.canyontravel`;
const IOS_URL = IOS_APP_ID
    ? `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}`
    : IOS_FALLBACK_SEARCH;

type BtnProps = { label: string; onPress: () => void; kind?: "primary" | "secondary" };


export default function StoreLinksCard() {

    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const [busy, setBusy] = useState<false | "open" | "share" | "copy">(false);

    const Btn = ({ label, onPress, kind = "primary" }: BtnProps) => (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.scrollBtn, kind === "secondary" && styles.scrollBtnSecondary]}
            accessibilityRole="button"
        >
            <Text style={[styles.scrollBtnText, kind === "secondary" && styles.scrollBtnSecondaryText]}>{label}</Text>
        </TouchableOpacity>
    );

    const primary = useMemo(() => {
        if (Platform.OS === "android") {
            return { label: "Open in Google Play", url: ANDROID_URL };
        }
        return { label: "Open in App Store", url: IOS_URL };
    }, []);

    const secondary = useMemo(() => {
        if (Platform.OS === "android") {
            return { label: "Open in Apple App Store", url: IOS_URL };
        }
        return { label: "Open in Google Play", url: ANDROID_URL };
    }, []);

    const openUrl = async (url: string) => {
        try {
            setBusy("open");
            const supported = await Linking.canOpenURL(url);
            if (!supported) throw new Error("Cannot open store URL");
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert("Oops", e?.message ?? "Unable to open the store.");
        } finally {
            setBusy(false);
        }
    };

    const shareLink = async (url: string) => {
        try {
            setBusy("share");
            await Share.share({ message: url, url });
        } catch {
            // ignore cancel
        } finally {
            setBusy(false);
        }
    };

    const copyLink = async (url: string) => {
        try {
            setBusy("copy");
            await Clipboard.setStringAsync(url);
            Alert.alert("Copied", "Link copied to clipboard.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.settingsCard}>
            <Text style={styles.scrollTitle}>Get Canyon Travelers</Text>
            <Text style={styles.scrollBlurb}>
                Install or share the app from your preferred store.
            </Text>

            <View style={styles.scrollRow}>
                <Btn label={busy === "open" ? "Opening…" : primary.label} onPress={() => openUrl(primary.url)} />
                <Btn kind="secondary" label={secondary.label} onPress={() => openUrl(secondary.url)} />
            </View>

            <View style={[styles.scrollRow, { marginTop: 8 }]}>
                <Btn kind="secondary" label={busy === "share" ? "Sharing…" : "Share link"} onPress={() => shareLink(primary.url)} />
                <Btn kind="secondary" label={busy === "copy" ? "Copying…" : "Copy link"} onPress={() => copyLink(primary.url)} />
            </View>

            {Platform.OS === "ios" && !IOS_APP_ID && (
                <Text style={styles.scrollNote}>
                    Tip: Set your App Store ID in <Text style={{ fontWeight: "700" }}>StoreLinksCard.tsx</Text> to deep-link directly to your app page.
                </Text>
            )}
        </View>
    );
}
