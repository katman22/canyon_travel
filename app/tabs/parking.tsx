import 'react-native-reanimated';
import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
    View,
    Text,
    SafeAreaView, ScrollView, StatusBar, StyleSheet, ImageBackground
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {
    parkingCameras, fetchParkingProfile
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {UdotCamera, ParkingProfile} from "@/constants/types"
import {useTheme} from '@react-navigation/native';
import ParkingHours from "@/components/ParkingHours";
import YouTubeTile from "@/components/YouTubeTiles";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import ParkingRules from "@/components/ParkingRules";
import ParkingLinks from "@/components/ParkingLinks";
import ParkingFaqs from "@/components/ParkingFaqs";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import Header from "@/components/Header";
import BannerHeaderAd from "@/components/BannerHeaderAd";
import YouTubeTileBlockedPlayer from "@/components/YouTubeTileBlockedPlayer";
import {router} from "expo-router";
import {useSubscription} from "@/context/SubscriptionContext";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import {EMPTY_OPS} from "@/constants/types"
import {fetchHomeResorts, HomeResortsResponse} from "@/lib/homeResorts";
import {effectiveAccess} from "@/lib/access";
import {PrefsEvents, EVENTS} from "@/lib/events";


export default function Parking() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [camerasParking, setParkingCameras] = useState<UdotCamera[]>([]);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16); // tidy fallback
    const [profile, setProfile] = useState<ParkingProfile | null>(null);
    const {progress, reset, next} = useStepProgress(4);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '100%'], []);

    const { tier, ready } = useSubscription();
    const [homes, setHomes] = useState<HomeResortsResponse | null>(null);
    const fullAccess = homes ? effectiveAccess(resort, homes, tier).fullAccess : false;

    const dateOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    };

    const fetchResortDirections = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);
        reset();
        try {
            const [cams, prof] = await Promise.all([
                parkingCameras(resort),
                fetchParkingProfile(resort) // implement in your hook/service
            ]);
            next();
            setParkingCameras(cams.cameras);
            next();
            setProfile(prof.profile);
            next();
        } catch (err) {
            console.log("Error fetching parking information:", err);
        } finally {
            setLoading(false);
            next();
        }
    };


    // Homes loader
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


    useEffect(() => {
        if (resortLoading || !resort) return;
        fetchResortDirections();
    }, [resortLoading, resort]);


    if (loading || resortLoading) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Reaching out for resort information…"/>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#e6f3f8'}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: .75}} // soften for readability
            />

            <FloatingSettingsButton />

            <BottomSheet
                ref={sheetRef}
                index={snapPoints.length - 1}
                snapPoints={snapPoints}
                topInset={topInset}
                enablePanDownToClose={false}
                handleIndicatorStyle={{backgroundColor: colors.border || '#cfd8dc'}}
                backgroundStyle={[styles.sheetBackground, {backgroundColor: '#8ec88e'}]}
            >
                <BottomSheetScrollView contentContainerStyle={styles.cameraContainer}
                                       showsVerticalScrollIndicator={false}
                                       style={{backgroundColor: "#fff"}}>
                    <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/9698910518"} android_id={"ca-app-pub-6336863096491370/9023477617"}/>
                    <Header message={"Activities:"} onRefresh={fetchResortDirections} colors={colors}
                            resort={resort?.resort_name} showRefresh={true}/>
                    <ScrollView contentContainerStyle={styles.cameraContainer}>
                            <View key={23}>
                                {(camerasParking ?? []).map((parkCam, i) =>
                                    fullAccess ? (
                                        <YouTubeTile
                                            key={`yt-sub-${String(parkCam.Id)}-${i}`}
                                            title={parkCam.Location}
                                            streamId={String(parkCam.Id)}
                                            description={parkCam.Location}
                                        />
                                    ) : (
                                        <YouTubeTileBlockedPlayer
                                            key={`yt-${String(parkCam.Id)}-${i}`}
                                            title={parkCam.Location}
                                            streamId={String(parkCam.Id)}
                                            description={parkCam.Location}
                                            previewSeconds={30}
                                            showRefresh={false}
                                            ctaLabel="Subscribe for the full stream"
                                            onPressCTA={() => router.replace("/tabs/rc_subscriptions")}
                                        />
                                    )
                                )}
                                <ParkingHours parking={{ operations: profile?.operations ?? EMPTY_OPS }}/>
                                {/* RULES */}
                                <ParkingRules rules={profile?.rules} title="Parking Rules"/>

                                {/* FAQs */}
                                <ParkingFaqs faqs={profile?.faqs} title="FAQs"/>

                                {/* LINKS */}
                                <ParkingLinks links={profile?.links} title="Official Resources"/>

                                {/* UPDATED */}
                                <Text style={styles.footerText}>
                                    Updated: {profile?.updated_at
                                    ? new Date(profile.updated_at).toLocaleString(undefined, dateOpts)
                                    : new Date().toLocaleString(undefined, dateOpts)}
                                </Text>
                            </View>
                    </ScrollView>
                    <BannerHeaderAd  ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>
                </BottomSheetScrollView>
            </BottomSheet>
        </SafeAreaView>
    );

}
