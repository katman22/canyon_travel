import React, { useState } from 'react';
import { View, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import type {ForecastPeriod, SunriseSunset} from "@/constants/types";


type Props = {
    id?: string | null;
    isTest?: boolean | true;
};


export default function LocationHeaderAd({id, isTest}:Props) {
    const [adLoaded, setAdLoaded] = useState(false);
    const adUnitId = id || TestIds.BANNER

    const currentId = isTest ? TestIds.BANNER : adUnitId
    // const adUnitId = __DEV__ ? TestIds.BANNER
    // : Platform.OS === 'ios'
    //     ? "ca-app-pub-6336863096491370/7351709503" // iOS banner unit ID
    //     : "ca-app-pub-6336863096491370/2870071842"; // Android Banner unit id

    return (
        <SafeAreaView style={[styles.container,{marginTop: 20, marginBottom: 20}]}>
            <View style={styles.adWrapper}>
                {adLoaded ? null : <View style={styles.placeholder} />}
                <BannerAd
                    unitId={currentId}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    onAdLoaded={() => {
                        if (__DEV__) console.log('✅ Ad loaded');
                        setAdLoaded(true);
                    }}
                    onAdFailedToLoad={error => {
                        if (__DEV__) console.log('❌ Ad failed:', error)
                        setAdLoaded(false);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    adWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60
    },
    placeholder: {
        height: 50
    },
});
