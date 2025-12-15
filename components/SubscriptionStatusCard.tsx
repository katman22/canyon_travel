import React, {useEffect, useState} from "react";
import {View, Text, TouchableOpacity, ActivityIndicator} from "react-native";
import {useSubscription} from "@/context/SubscriptionContext";
import {useRouter} from "expo-router";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

const BLURBS: Record<string, string> = {
    free: "Free plan: Try it out and see how smooth your drive can be. Two free resorts of your choice.",
    standard: "Standard: Know the best canyon before you leave. Two favorites two free.",
    pro: "Pro: Your mountain, your plan, no guesswork. Four favorites, two free. Add a home screen widget for canyon conditions.",
    premium: "Premium: Unlimited, all information, all resorts. Add widgets to your home screen.",
};

export default function SubscriptionStatusCard() {
    const {ready, tier, entitlements, restore, refresh, afterPurchaseOrRestore} = useSubscription();
    const router = useRouter();
    const [working, setWorking] = useState<"restore" | "refresh" | null>(null);

    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const doRestore = async () => {
        try {
            setWorking("restore");
            await restore();
            await doRefresh();
        } finally {
            setWorking(null);
        }
    };

    const doRefresh = async () => {
        try {
            setWorking("refresh");

            // Step 1: refresh RevenueCat
            await afterPurchaseOrRestore();


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
