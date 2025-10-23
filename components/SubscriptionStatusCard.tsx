import React, {useState} from "react";
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import {useSubscription} from "@/context/SubscriptionContext";
import {useRouter} from "expo-router";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

const BLURBS: Record<string, string> = {
    none: "Free plan: choose 1 home resort and weekly changes are limited.",
    standard: "Standard: up to 2 home resorts, 2 additions per week.",
    pro: "Pro: up to 4 home resorts, 4 additions per week.",
    premium: "Premium: all resorts and unlimited changes.",
};

export default function SubscriptionStatusCard() {
    const {ready, tier, entitlements, restore, refresh} = useSubscription();
    const router = useRouter();
    const [working, setWorking] = useState<"restore" | "refresh" | null>(null);

    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const doRestore = async () => {
        try {
            setWorking("restore");
            await restore();
        } finally {
            setWorking(null);
        }
    };

    const doRefresh = async () => {
        try {
            setWorking("refresh");
            await refresh();
        } finally {
            setWorking(null);
        }
    };

    const goManage = () => router.push("/tabs/rc_subscriptions");

    return (
        <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Your Subscription</Text>
            <Text style={styles.statusTier}>
                {ready ? tier.toUpperCase() : "Checking…"}
            </Text>
            <Text style={styles.statusBlurb}>{BLURBS[tier] ?? ""}</Text>

            {!!entitlements.length && (
                <Text style={styles.statusEntitlements}>
                    Active entitlements: {entitlements.join(", ")}
                </Text>
            )}

            <View style={[styles.statusRow, {marginBottom: 20}]}>
                <TouchableOpacity onPress={goManage} style={[styles.statusBtn, working === "restore" && {opacity: 0.7}]}>
                    <Text style={styles.statusBtnText}>Manage / Upgrade</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.statusRow}>
                <TouchableOpacity
                    onPress={doRestore}
                    disabled={working !== null}
                    style={[styles.statusBtn, working === "restore" && {opacity: 0.7}]}
                >
                    {working === "restore" ? (
                        <ActivityIndicator/>
                    ) : (
                        <Text style={styles.statusBtnText}>Restore Purchases</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={doRefresh}
                    disabled={working !== null}
                    style={[styles.statusBtnSecondary, working === "refresh" && {opacity: 0.7}]}
                >
                    {working === "refresh" ? (
                        <ActivityIndicator/>
                    ) : (
                        <Text style={styles.statusBtnSecondaryText}>Refresh Status</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
