import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    ImageBackground,
    StyleSheet,
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {fetchCameras} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {UdotCamera} from "@/constants/types"
import CameraList from "@/components/CameraList";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import Header from "@/components/Header";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import {useSubscription} from "@/context/SubscriptionContext";
import {router} from "expo-router";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";

import { PrefsEvents, EVENTS } from "@/lib/events";
import {effectiveAccess} from "@/lib/access";
import {fetchHomeResorts, HomeResortsResponse} from "@/lib/homeResorts";

export default function Cameras() {
    const { tier, ready } = useSubscription();
    const { resort, loading: resortLoading } = useSelectedResort();

    const [loading, setLoading] = useState(false);
    const [cameras, setCameras] = useState<UdotCamera[]>([]);

    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16);

    const {colors} = useTheme();
    const styles = getStyles(colors);

    const {progress, reset, next} = useStepProgress(2);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);

    const [homes, setHomes] = useState<HomeResortsResponse | null>(null);
    const { fullAccess } = effectiveAccess(resort, homes, tier);


    const [cameraRefreshNonce, setCameraRefreshNonce] = useState(0);

    // navigate to subs
    const getSubs = async () => {
        router.replace('/tabs/rc_subscriptions');
    };

    // --- FETCH CAMERAS FOR CURRENT RESORT ---
    const fetchCameraData = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);
        reset();

        try {
            const udotCameraData = await fetchCameras(resort);
            next();
            setCameras(udotCameraData.cameras);
            setCameraRefreshNonce((n) => n + 1);
        } catch (err) {
            console.error("Error fetching cameras:", err);
        } finally {
            next();
            setLoading(false);
        }
    };

    // load cameras whenever resort changes
    useEffect(() => {
        if (!resortLoading && resort) {
            fetchCameraData();
        }
    }, [resortLoading, resort]);

    // --- LOAD HOME RESORT IDS JUST LIKE to_resort.tsx ---
    useEffect(() => {
        let mounted = true;
        const loadHomes = async () => {
            try {
                const r = await fetchHomeResorts();
                if (mounted) setHomes(r);
            } catch (e) {
                // ignore; UI still functions
            }
        };
        if (ready && resort) loadHomes();

        const onChange = () => { void loadHomes(); };
        PrefsEvents.on(EVENTS.HOME_RESORTS_CHANGED, onChange);
        return () => {
            mounted = false;
            PrefsEvents.off(EVENTS.HOME_RESORTS_CHANGED, onChange);
        };
    }, [ready, resort]);


    if (loading || resortLoading) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                <BrandedLoader progress={progress} message="Collecting current online Cameras…"/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#e6f3f8'}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: .75}}
            />

            <FloatingSettingsButton />

            <View style={{flex: 1}}>
                <BottomSheet
                    ref={sheetRef}
                    index={snapPoints.length - 1}
                    snapPoints={snapPoints}
                    topInset={topInset}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{backgroundColor: colors.border || '#cfd8dc'}}
                    backgroundStyle={{backgroundColor: '#8ec88e'}}
                >
                    <BottomSheetScrollView
                        contentContainerStyle={styles.cameraContainer}
                        showsVerticalScrollIndicator={false}
                        style={{backgroundColor: "#fff"}}
                    >
                        <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>

                        <Header
                            message={"Cameras:"}
                            onRefresh={fetchCameraData}
                            colors={colors}
                            resort={resort?.resort_name}
                            // Only show the manual refresh button if they actually have full access,
                            // same pattern as to_resort.tsx
                            showRefresh={fullAccess}
                        />

                        <CameraList
                            cameras={cameras}
                            styles={styles}
                            // IMPORTANT:
                            // Pass fullAccess here, not generic "subscribed".
                            // CameraList will treat false as "locked/free preview"
                            isSubscribed={fullAccess}
                            refreshNonce={cameraRefreshNonce}
                            onUnlock={getSubs}
                        />

                        <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/9698910518"} android_id={"ca-app-pub-6336863096491370/9023477617"}/>
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>
    );
}
