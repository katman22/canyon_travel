// WidgetSetupScreen.tsx

import * as React from "react";
import {
    Platform,
    BackHandler,
    ImageBackground,
    StyleSheet,
    SafeAreaView
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import BrandedLoader from "@/components/BrandedLoader";
import { useResortListData } from "@/hooks/useResortListData";
import { useSelectedResort } from "@/context/ResortContext";
import { useSubscription } from "@/context/SubscriptionContext";
import {
    saveWidgetResortForIOS,
    reloadWidgetsIOS,
    getInstalledCountIOS,
} from "@/native/WidgetUpdater.ios";

import { saveWidgetResortForId } from "@/native/WidgetUpdater";

import type { Resort } from "@/constants/types";
import WidgetResortBottomSheet from "@/components/WidgetResortBottomSheet";
import { ResortProvider } from "@/context/ResortContext";

export default function WidgetSetupScreenWrapper() {
    return (
        <ResortProvider>
            <WidgetSetupScreen />
        </ResortProvider>
    );
}

function WidgetSetupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ widgetId?: string; source?: string }>();

    // Identify widget
    const widgetId = Number(params.widgetId ?? NaN);
    const isWidgetConfig = params.source === "widget" || Number.isFinite(widgetId);

    const {
        resort,
        prioritizedResorts,
        loading,
        refreshing,
        refreshResorts,
        isSubscribedHome
    } = useResortListData();

    const { selectResort } = useSelectedResort();
    const { tier } = useSubscription();

    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    // Widget limits
    const allowed = React.useMemo(() => {
        switch (tier) {
            case "premium":
                return 2;
            case "pro":
                return 1;
            default:
                return 0;
        }
    }, [tier]);

    const [installedCount, setInstalledCount] = React.useState(0);
    const atLimit = installedCount >= allowed;

    // Read widget count
    useFocusEffect(
        React.useCallback(() => {
            let cancelled = false;

            (async () => {
                if (Platform.OS === "ios") {
                    const n = await getInstalledCountIOS();
                    if (!cancelled) setInstalledCount(n);
                } else {
                    setInstalledCount(0);
                }
            })();

            return () => {
                cancelled = true;
            };
        }, [tier])
    );

    // Redirect if selecting resort normally
    useFocusEffect(
        React.useCallback(() => {
            if (!isWidgetConfig && resort) {
                router.replace("/tabs/to_resort");
            }
        }, [isWidgetConfig, resort, router])
    );

    // Auto-apply for widget config
    useFocusEffect(
        React.useCallback(() => {
            let cancelled = false;

            (async () => {
                if (!isWidgetConfig) return;
                if (!resort) return;

                if (Platform.OS === "ios") {
                    saveWidgetResortForIOS(String(resort.resort_id));
                    reloadWidgetsIOS();
                } else if (Number.isFinite(widgetId)) {
                    await saveWidgetResortForId(widgetId, String(resort.resort_id));
                }
            })();

            return () => {
                cancelled = true;
            };
        }, [isWidgetConfig, resort, widgetId])
    );

    const finalizeAndExit = () => {
        if (router.canGoBack()) return router.back();
        if (Platform.OS === "android") return BackHandler.exitApp();
    };

    const onSelectForWidget = async (r: Resort) => {
        console.log("We made it here");
        // Apply to widget
        if (Platform.OS === "ios") {
            saveWidgetResortForIOS(String(r.slug));
            reloadWidgetsIOS();
        } else if (Number.isFinite(widgetId)) {
            console.log("2nd We made it here");
            await saveWidgetResortForId(widgetId, String(r.slug));
        }

        await selectResort(r);
        finalizeAndExit();
    };

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <BrandedLoader message="Loading resorts…" />
            </SafeAreaView>
        );
    }

    const filteredResorts = prioritizedResorts.filter((r) =>
        isSubscribedHome(r)
    );

    // const finalResorts = resort
    //     ? filteredResorts.filter((r) => r.resort_id !== resort.resort_id)
    //     : filteredResorts;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.75 }}
            />

            <WidgetResortBottomSheet
                selectedResort={resort}
                otherResorts={filteredResorts}
                onPressSelected={() => router.push("/tabs/to_resort")}
                onPressOther={(item) => onSelectForWidget(item)}
                refreshing={refreshing}
                onRefresh={refreshResorts}
                contentContainerStyle={styles.cameraContainer}
            />
        </SafeAreaView>
    );
}
