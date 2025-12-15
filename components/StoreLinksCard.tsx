import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Platform, Linking, Alert, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

// iOS App Store
const IOS_APP_ID = "6752226942";
const IOS_URL = `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}`;

// Platform-neutral fallback (safe for iOS review)
const WEBSITE_URL = "https://www.canyontraveller.com";

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
            style={[styles.scrollBtn, kind === "secondary" && styles.scrollBtnSecondary]}
            accessibilityRole="button"
        >
            <Text
                style={[styles.scrollBtnText, kind === "secondary" && styles.scrollBtnSecondaryText]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    // Primary action: App Store on iOS, website otherwise
    const primary = useMemo(() => {
        if (Platform.OS === "ios") {
            return { label: "Open in App Store", url: IOS_URL };
        }
        return { label: "Visit CanyonTraveller.com", url: WEBSITE_URL };
    }, []);

    // Secondary action: always safe, always neutral
    const secondary = useMemo(() => {
        return { label: "Visit Website", url: WEBSITE_URL };
    }, []);

    const openUrl = async (url: string) => {
        try {
            setBusy("open");
            const supported = await Linking.canOpenURL(url);
            if (!supported) throw new Error("Unable to open link.");
            await Linking.openURL(url);
        } catch (e: any) {
            Alert.alert("Oops", e?.message ?? "Unable to open link.");
        } finally {
            setBusy(false);
        }
    };

    const shareLink = async (url: string) => {
        try {
            setBusy("share");
            await Share.share({ message: url, url });
        } catch {
            // user cancelled — ignore
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
            <Text style={styles.scrollTitle}>Get Canyon Traveller</Text>
            <Text style={styles.scrollBlurb}>
                Install the app or share the official link.
            </Text>

            <View style={styles.scrollRow}>
                <Btn
                    label={busy === "open" ? "Opening…" : primary.label}
                    onPress={() => openUrl(primary.url)}
                />
                <Btn
                    kind="secondary"
                    label={secondary.label}
                    onPress={() => openUrl(secondary.url)}
                />
            </View>

            <View style={[styles.scrollRow, { marginTop: 8 }]}>
                <Btn
                    kind="secondary"
                    label={busy === "share" ? "Sharing…" : "Share Link"}
                    onPress={() => shareLink(primary.url)}
                />
                <Btn
                    kind="secondary"
                    label={busy === "copy" ? "Copying…" : "Copy Link"}
                    onPress={() => copyLink(primary.url)}
                />
            </View>
        </View>
    );
}
