import React, { useMemo, useRef, useState} from 'react';
import {
    View,
    StatusBar,
    SafeAreaView, ImageBackground, StyleSheet,
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import BrandedLoader from '@/components/BrandedLoader';
import {useStepProgress} from '@/utils/useStepProgress';
import BannerHeaderAdIos from "@/components/BannerHeaderAd.ios";
import {useSubscription} from "@/context/SubscriptionContext";
import HomeResortSelector from "@/components/HomeResortSelector";
import SubscriptionStatusCard from "@/components/SubscriptionStatusCard";
// @ts-ignore
import StoreLinksCard from '@/components/StoreLinksCard';
import IdLoader from "@/components/IdLoader";
import {SubscriptionLegalFooter} from "@/components/SubscriptionLegalFooter";

export default function Settings() {
    const { ready, tier, allowedHomeResorts } = useSubscription();
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16); // tidy fallback
    const {progress, reset, next} = useStepProgress(2);

    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);

    if (!ready) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Collecting Subscription information…"/>
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
                        <BannerHeaderAdIos style={{marginBottom: 20}} ios_id={"ca-app-pub-6336863096491370/4750492703"}/>
                        <StoreLinksCard />
                        <SubscriptionStatusCard />
                        <HomeResortSelector />
                        <SubscriptionLegalFooter />
                        <IdLoader />
                        <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/9698910518"}/>
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>

    );

}
