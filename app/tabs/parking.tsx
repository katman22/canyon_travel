import 'react-native-reanimated';
import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    SafeAreaView, ScrollView, StatusBar, StyleSheet, ImageBackground, TouchableOpacity
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {
    parkingCameras,
    fetchTravelData, fetchParkingProfile
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {TravelTimes, UdotCamera, ParkingProfile} from "@/constants/types"
import {useTheme} from '@react-navigation/native';
import ParkingHours from "@/components/ParkingHours";
import YouTubeTile from "@/components/YouTubeTiles";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import ParkingRules from "@/components/ParkingRules";
import ParkingLinks from "@/components/ParkingLinks";
import ParkingFaqs from "@/components/ParkingFaqs";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import Header from "@/components/Header";
import BannerHeaderAd from "@/components/BannerHeaderAd";

export default function Parking() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [travelData, setTravelData] = useState<TravelTimes | null>(null);
    const [camerasParking, setParkingCameras] = useState<UdotCamera[]>([]);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16); // tidy fallback
    const [profile, setProfile] = useState<ParkingProfile | null>(null);
    const {progress, reset, next} = useStepProgress(5);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '100%'], []);

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
            const [cams, td, prof] = await Promise.all([
                parkingCameras(resort),
                fetchTravelData(resort),
                fetchParkingProfile(resort) // implement in your hook/service
            ]);
            next();
            setParkingCameras(cams.cameras);
            next();
            setTravelData(td);
            next();
            setProfile(prof.profile);
            next();
        } catch (err) {
            console.log("Error fetching directions:", err);
        } finally {
            setLoading(false);
            next();
        }
    };


    useEffect(() => {
        if (!resortLoading && resort) {
            fetchResortDirections();
        }
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
                    <BannerHeaderAd />
                    <Header message={"Activities:"} onRefresh={fetchResortDirections} colors={colors}
                            resort={resort?.resort_name}/>
                    <ScrollView contentContainerStyle={styles.cameraContainer}>
                        {travelData && (

                            <View key={23}>

                                {camerasParking.map((parkCam, i) => (
                                    <YouTubeTile
                                        key={`yt-sub-${String(parkCam.Id)}-${i}`}
                                        title={parkCam.Location}
                                        streamId={String(parkCam.Id)}
                                        description={parkCam.Location}
                                    />
                                ))}
                                <ParkingHours parking={travelData?.parking}/>
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
                        )
                        }
                    </ScrollView>
                    <BannerHeaderAd />
                </BottomSheetScrollView>
            </BottomSheet>
        </SafeAreaView>
    );

}
