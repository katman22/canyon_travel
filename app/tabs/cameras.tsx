import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    SafeAreaView, ImageBackground, StyleSheet
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {fetchCameras} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {UdotCamera} from "@/constants/types"
import CameraList from "@/components/CameraList";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import Header from "@/components/Header";
import BannerHeaderAd from "@/components/BannerHeaderAd";

export default function Cameras() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [cameras, setCameras] = useState<UdotCamera[]>([]);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16); // tidy fallback
    const {progress, reset, next} = useStepProgress(2);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);

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
        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            next();
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchCameraData().then();
        }
    }, [resortLoading, resort]);


    if (loading || resortLoading) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Collecting current online Cameras…"/>
            </SafeAreaView>
        )
    }

    return (

        <SafeAreaView style={{flex: 1, backgroundColor: '#e6f3f8'}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: .75}}
            />
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
                        <BannerHeaderAd/>
                        <Header message={"Cameras:"} onRefresh={fetchCameraData} colors={colors}
                                resort={resort?.resort_name}/>
                        <CameraList cameras={cameras} styles={styles}/>
                        <BannerHeaderAd />
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>

    );

}
