// app/(whatever)/LocationsScreen.tsx
import * as React from "react";
import {
    Text,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import {router, useFocusEffect} from "expo-router";
import {useTheme} from "@react-navigation/native";
import {useSubscription} from "@/context/SubscriptionContext";
import getStyles from "@/assets/styles/styles";
import BottomSheetList from "@/components/BottomSheetList";
import BrandedLoader from "@/components/BrandedLoader";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import ResortTile from "@/components/ResortTile";
import {useResortListData} from "@/hooks/useResortListData";
import type {Resort} from "@/constants/types";
import {useCallback, useRef} from "react";

export default function LocationsScreen() {
    const {
        resort,
        prioritizedResorts,
        unlockedMask,
        loading,
        refreshing,
        refreshResorts,
        StatusNotice,
        handleResortSelection,
        isSubscribedHome,
        isFreeHome,
    } = useResortListData();
    const {refresh, refreshServerEntitlements} = useSubscription();
    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const goSubscribe = () => router.push("/tabs/rc_subscriptions");
    const lastRefreshedAt = useRef<number>(0);

    // Note this is here ensuring we always check for latest state
    // in user subscription. It's our security gate to resort information
    // we never want this to be stale information.
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const now = Date.now();
                const secondsSinceLast = (now - lastRefreshedAt.current) / 1000;
                const THROTTLE_SECONDS = 15; // adjust as needed

                if (secondsSinceLast > THROTTLE_SECONDS) {
                    lastRefreshedAt.current = now;
                    await refresh();
                    await refreshResorts();
                    await refreshServerEntitlements();
                } else {
                    __DEV__ ? console.log(`[LocationsScreen] Skipping refresh - only ${secondsSinceLast}s since last.`): null;
                }
            };

            void load();
        }, [])
    );


    const renderItem = ({item, index}: { item: Resort | null; index: number }) => {
        if (!item) return null;
        const selected = resort?.slug === item.slug;
        const locked = !unlockedMask[index];
        const onPress = () => {
            if (locked) {
                goSubscribe();
            } else {
                handleResortSelection(item);
            }
        };

        return (
            <ResortTile
                resort={item}
                isSelected={selected}
                isLocked={locked}
                onPress={onPress}
                showSubscribedBadge={isSubscribedHome(item)}
                showFreeBadge={!isSubscribedHome(item) && isFreeHome(item)}
            />
        );
    };

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
                <BrandedLoader message="Our smartest squirrels are reloading the Resorts…"/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: 0.75}}
            />

            <StatusNotice />
            <FloatingSettingsButton/>

            <BottomSheetList<Resort>
                data={prioritizedResorts}
                keyExtractor={(item, index) =>
                    item?.slug ? String(item.slug) : `__idx_${index}`
                }
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={refreshResorts}
                empty={
                    <TouchableOpacity onPress={refreshResorts} style={{paddingVertical: 12}}>
                        <Text style={{color: colors.text}}>
                            No Resort Information is currently available, please refresh to check.
                        </Text>
                    </TouchableOpacity>
                }
                lightModeBackground="#8ec88e"
                contentContainerStyle={styles.cameraContainer}
                snapPoints={["30%", "90%"]}
            />
        </SafeAreaView>
    );
}
