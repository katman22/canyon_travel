import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView, ImageBackground
} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {fetchAlertsEvents, fetchSigns} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {AlertsEvents, SignResponse} from "@/constants/types";
import SignDisplay from "@/components/SignDisplay";
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
    const [alertsEvents, setAlertsEvents] = useState<AlertsEvents | null>(null);
    const [signResponse, setSigns] = useState<SignResponse | null>(null);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16); // tidy fallback
    const {progress, reset, next} = useStepProgress(4);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '95%'], []);

    const fetchAlertsAndEvents = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);
        reset();
        try {
            const alertsEventsResponse = await fetchAlertsEvents(resort);
            next();// 1/4
            setAlertsEvents(alertsEventsResponse.alerts_events);
            const udotSigns = await fetchSigns(resort);
            next();// 2/4
            setSigns(udotSigns);
            next();// 3/4
        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            next();// 4/4
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchAlertsAndEvents().then();
        }
    }, [resortLoading, resort]);


    if (loading || resortLoading) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Gathering Alerts and Events…"/>
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
            {/* Your background layer (map, image, etc.) can sit behind the sheet */}
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
                        <BannerHeaderAd />
                        <Header message={"Alerts:"} onRefresh={fetchAlertsAndEvents} colors={colors}
                                resort={resort?.resort_name}/>
                        <Text style={[styles.textSmall, {marginBottom: 10}]}>Alerts, Events, Construction, Seasonal Road
                            Info, In Route Service Vehicles, Overhead Signs, Closures and more.</Text>
                        <View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryText}>
                                    {alertsEvents && alertsEvents.summary}
                                </Text>
                            </View>
                            {alertsEvents && alertsEvents.alerts.length > 0 ? (
                                <View style={styles.alertSection}>
                                    {alertsEvents.alerts.map((alert, idx) => (
                                        <Text key={idx} style={styles.alertText}>
                                            ⚠️ {alert.title}
                                        </Text>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noAlertText}>✅ No alerts reported.</Text>
                            )}
                            <View style={styles.conditionsSection}>
                                {alertsEvents && alertsEvents.conditions.map((cond) => (
                                    <View key={cond.Id} style={styles.conditionCard}>
                                        <Text style={styles.roadName}>{cond.RoadwayName}</Text>
                                        <Text style={styles.conditionText}>Road: {cond.RoadCondition}</Text>
                                        <Text style={styles.conditionText}>Weather: {cond.WeatherCondition}</Text>
                                        <Text style={styles.conditionText}>Restriction: {cond.Restriction}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.eventSection}>
                                {alertsEvents && alertsEvents.events.map((event, index) => (
                                    <View key={index} style={styles.eventCard}>
                                        <Text style={styles.eventHeader}>
                                            🚧 {event.EventCategory} — {event.Location}
                                        </Text>
                                        <Text style={styles.eventDescription}>{event.Description}</Text>
                                        <Text style={styles.eventComment}>{event.Comment}</Text>
                                        <Text style={styles.eventMeta}>
                                            MP: {event.MPStart} to {event.MPEnd}
                                        </Text>
                                        {event.IsFullClosure && (
                                            <Text style={styles.closure}>🚫 Full road closure in effect</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                            <Text style={{fontSize: 14, fontWeight: "bold"}}>
                                OverHead Message Signs:
                            </Text>
                            <View style={{padding: 4}}>
                                {signResponse && (<SignDisplay signs={signResponse.signs}/>)}
                            </View>

                        </View>
                        <BannerHeaderAd />
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>
    );

}

