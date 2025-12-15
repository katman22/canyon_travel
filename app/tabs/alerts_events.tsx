import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ImageBackground,
} from "react-native";
import getStyles from "@/assets/styles/styles";
import { useTheme } from "@react-navigation/native";
import { fetchAlertsEvents, fetchSigns } from "@/hooks/UseRemoteService";
import { useSelectedResort } from "@/context/ResortContext";
import { AlertsEvents, SignResponse } from "@/constants/types";
import SignDisplay from "@/components/SignDisplay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import BrandedLoader from "@/components/BrandedLoader";
import { useStepProgress } from "@/utils/useStepProgress";
import Header from "@/components/Header";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import ConditionsEventsBlock from "@/components/ConditionsEventsBlock";
import { router } from "expo-router";
import { useSubscription } from "@/context/SubscriptionContext";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import {effectiveAccess} from "@/lib/access";
import {fetchHomeResorts, type HomeResortsResponse} from "@/lib/homeResorts";

export default function Alerts_events() {
    const { tier, ready } = useSubscription();

    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const { resort, loading: resortLoading } = useSelectedResort();

    const [alertsEvents, setAlertsEvents] = useState<AlertsEvents | null>(null);
    const [signResponse, setSigns] = useState<SignResponse | null>(null);

    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16);

    const { progress, reset, next } = useStepProgress(4);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["30%", "95%"], []);
    const [homes, setHomes] = useState<HomeResortsResponse | null>(null);
    const { fullAccess } = effectiveAccess(resort, homes, tier);

    const getSubs = async () => {
        router.replace("/tabs/rc_subscriptions");
    };

    // Fetch Alerts / Signs data
    const fetchAlertsAndEvents = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);
        reset();
        try {
            const alertsEventsResponse = await fetchAlertsEvents(resort);
            next(); // 1/4
            setAlertsEvents(alertsEventsResponse.alerts_events);

            const udotSigns = await fetchSigns(resort);
            next(); // 2/4
            setSigns(udotSigns);

            next(); // 3/4
        } catch (err) {
            console.error("Error fetching alerts/events:", err);
        } finally {
            next(); // 4/4
            setLoading(false);
        }
    };

    // initial load when resort is ready
    useEffect(() => {
        if (!resortLoading && resort) {
            fetchAlertsAndEvents();
        }
    }, [resortLoading, resort]);

    // load current home resorts (for entitlement calc)
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!ready || !resort) return;
            const res = await fetchHomeResorts();
            if (mounted) setHomes(res);
        })();
        return () => { mounted = false; };
    }, [ready, resort]);


    if (loading || resortLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                <BrandedLoader progress={progress} message="Gathering Alerts and Events…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#e6f3f8" }}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.75 }}
            />

            <FloatingSettingsButton />

            <View style={{ flex: 1 }}>
                <BottomSheet
                    ref={sheetRef}
                    index={snapPoints.length - 1}
                    snapPoints={snapPoints}
                    topInset={topInset}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{ backgroundColor: colors.border || "#cfd8dc" }}
                    backgroundStyle={{ backgroundColor: "#8ec88e" }}
                >
                    <BottomSheetScrollView
                        contentContainerStyle={styles.cameraContainer}
                        showsVerticalScrollIndicator={false}
                        style={{ backgroundColor: "#fff" }}
                    >
                        <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>

                        <Header
                            message={"Alerts:"}
                            onRefresh={fetchAlertsAndEvents}
                            colors={colors}
                            resort={resort?.resort_name}
                            showRefresh={true}
                        />

                        <Text style={[styles.textSmall, { marginBottom: 10 }]}>
                            Alerts, Events, Construction, Seasonal Road Info, In Route
                            Service Vehicles, Overhead Signs, Closures and more.
                        </Text>

                        <View>
                            {/* High-level summary: ALWAYS show, even to free.
                               These are safety / situational awareness. */}
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryText}>
                                    {alertsEvents && alertsEvents.summary}
                                </Text>
                            </View>

                            {/* Bullet alert list: ALWAYS show (critical safety).
                               If there are no active alerts, we say so. */}
                            {alertsEvents && alertsEvents.alerts.length > 0 ? (
                                <View style={styles.alertSection}>
                                    {alertsEvents.alerts.map((alert, idx) => (
                                        <Text key={idx} style={styles.alertText}>
                                            ⚠️ {alert.title}
                                        </Text>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noAlertText}>
                                    ✅ No alerts reported.
                                </Text>
                            )}

                            {/* Conditions / Events block:
                                 - fullAccess -> showAll=true (full detail, full list)
                                 - !fullAccess -> teaser mode w/ CTA
                               NOTE: this matches the pattern in to_resort. */}
                            <ConditionsEventsBlock
                                data={alertsEvents}
                                isSubscribed={fullAccess}
                                showAll={fullAccess}
                                onPressSubscribe={getSubs}
                                styles={styles}
                            />

                            {/* Overhead Signs:
                               These are real-time road signs ("Chains required", "Lot full", etc.).
                               Treat them like live safety info. I'm keeping them ALWAYS visible.
                               If you want to lock them down later, wrap with fullAccess.
                            */}
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    marginTop: 10,
                                }}
                            >
                                OverHead Message Signs:
                            </Text>
                            <View style={{ padding: 4 }}>
                                {signResponse && (
                                    <SignDisplay
                                        signs={signResponse.signs}
                                        isSubscribed={fullAccess}
                                        onPressSubscribe={getSubs}
                                    />
                                )}
                            </View>
                        </View>

                        <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/4750492703"} android_id={"ca-app-pub-6336863096491370/1652254050"}/>
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>
    );
}
