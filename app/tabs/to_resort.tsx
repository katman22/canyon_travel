import 'react-native-reanimated';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Button,
    Image,
    Platform, TouchableOpacity
} from 'react-native';
import MapView, {Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import getStyles from '@/assets/styles/styles';
import polyline from '@mapbox/polyline';
import {LatLng} from 'react-native-maps';
import CameraList from '@/components/CameraList'
import {Link, router} from "expo-router";
import {
    parkingCameras,
    featuredCameras,
    fetchAlertsEvents,
    fetchDirections,
    fetchAlerts,
    fetchTravelData, fetchTravelDataTo, fetchTravelDataFrom
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {Alerts, AlertsEvents, TravelTimes, UdotCamera} from "@/constants/types"
import {useTheme} from '@react-navigation/native';
import YouTubeTileBlockedPlayer from "@/components/YouTubeTileBlockedPlayer";
import ParkingHours from "@/components/ParkingHours";
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import BrandedLoader from '@/components/BrandedLoader';
import Header from '@/components/Header';
import {useStepProgress} from '@/utils/useStepProgress';
import BannerHeaderAd from "@/components/BannerHeaderAd";
import {useSubscription} from "@/context/SubscriptionContext";
import YouTubeTile from "@/components/YouTubeTiles";
import ConditionsEventsBlock from "@/components/ConditionsEventsBlock";
import WeatherSection from "@/components/WeatherSection";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import { loadHomeResorts } from "@/lib/userPrefs";
import {useEffectiveAccess} from "@/hooks/useEffectiveAccess";

export default function ToResortMap() {

    const {isSubscribed} = useSubscription();
    const [coords, setCoords] = useState<LatLng[]>([]);
    const [loading, setLoading] = useState(false);
    const {progress, reset, next} = useStepProgress(6);
    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [travelData, setTravelData] = useState<TravelTimes | null>(null);
    const mapRef = useRef<MapView | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['28%', '50%', '90%'], []);
    const [cameras, setCameras] = useState<UdotCamera[]>([]);
    const [camerasParking, setParkingCameras] = useState<UdotCamera[]>([]);
    const [alertsEvents, setAlertsEvents] = useState<AlertsEvents | null>(null);
    const [weatherAlerts, setAlerts] = useState<Alerts | null>(null);
    const handleCollapse = () => {
        sheetRef.current?.snapToIndex(0);
    };
    const [camNonce, setCamNonce] = useState(0);
    type Direction = "to" | "from";
    const [selectedDir, setSelectedDir] = useState<Direction>("to");
    const COOLDOWN_MS = 5 * 60 * 1000;
    const [lastFromSwitchAt, setLastFromSwitchAt] = useState<number | null>(null);
    const [nowTs, setNowTs] = useState<number>(Date.now());

    const { canUseSub } = useEffectiveAccess(resort?.resort_id, isSubscribed);

    useEffect(() => {
        const id = setInterval(() => setNowTs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);



    const remainingMs =
        !canUseSub && lastFromSwitchAt
            ? Math.max(0, lastFromSwitchAt + COOLDOWN_MS - nowTs)
            : 0;

    const toggleDisabled = remainingMs > 0;

    function mergeTravel(
        prev: TravelTimes | null | undefined,
        patch: Partial<TravelTimes>,
        dir?: Direction
    ): TravelTimes {
        const base: TravelTimes = {
            to_resort: prev?.to_resort ?? 0,
            from_resort: prev?.from_resort ?? 0,
            traffic: prev?.traffic,
            departure_point: prev?.departure_point,
            parking: prev?.parking,
            weather: prev?.weather,
        } as TravelTimes;

        // meta fields (always refresh from patch if present)
        if (patch.traffic !== undefined) base.traffic = patch.traffic as any;
        if (patch.departure_point !== undefined) base.departure_point = patch.departure_point as any;
        if (patch.parking !== undefined) base.parking = patch.parking as any;
        if (patch.weather !== undefined) base.weather = patch.weather as any;

        // times
        if (dir === "to" && patch.to_resort !== undefined) {
            base.to_resort = String(patch.to_resort);
        } else if (dir === "from" && patch.from_resort !== undefined) {
            base.from_resort = String(patch.from_resort);
        } else {
            // full payload (subscribed case)
            if (patch.to_resort !== undefined) base.to_resort = String(patch.to_resort);
            if (patch.from_resort !== undefined) base.from_resort = String(patch.from_resort);
        }

        return base;
    }

    const onSelectDir = async (dir: Direction) => {
        if (!resort) return;
        if (canUseSub) {
            setSelectedDir(dir);
            return;
        }
        if (toggleDisabled) return;

        setSelectedDir(dir);

        if (dir === "to") {
            // if we don't have it yet or you want fresh
            if (travelData?.to_resort == null) {
                const v = await fetchTravelDataTo(resort);
                setTravelData(prev => mergeTravel(prev, {to_resort: v.to_resort}, "to"));
            }
        } else {
            if (travelData?.from_resort == null) {
                const v = await fetchTravelDataFrom(resort);
                setTravelData(prev => mergeTravel(prev, {from_resort: v.from_resort}, "from"));
            }
            // start your 8-min cooldown here if you haven't already
            setLastFromSwitchAt(Date.now());
        }
    };

    function fmt(ms: number) {
        const s = Math.ceil(ms / 1000);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
    }

    const FALLBACK_REGION = {
        latitude: 40.577,
        longitude: -111.655,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    const [sheetScrollEnabled, setSheetScrollEnabled] = useState(true);
    const onTextZoomStart = () => setSheetScrollEnabled(false);
    const onTextZoomEnd = () => setSheetScrollEnabled(true);

    const insets = useSafeAreaInsets();
    const topInset = insets.top || StatusBar.currentHeight || 20;
    const dateOpts: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    };

    const getSubs = async () => {
        router.replace('/tabs/rc_subscriptions');
    };

    const fetchResortDirections = async () => {
        if (!resort) return;
        setLoading(true);
        reset();

        try {
            // 1) Directions + other panels (unchanged)
            const googleResponse = await fetchDirections(resort);
            const route = googleResponse.routes[0];
            const points = decodePolyline(route.overview_polyline.points);
            setCoords(points);
            next(); // 1/6

            const udotCameraData = await featuredCameras(resort);
            setCameras(udotCameraData.cameras);
            setCamNonce((n) => n + 1);
            next(); // 2/6

            const parkingCameraData = await parkingCameras(resort);
            setParkingCameras(parkingCameraData.cameras);
            next(); // 3/6

            const alertsEventsResponse = await fetchAlertsEvents(resort);
            setAlertsEvents(alertsEventsResponse.alerts_events);
            next(); // 4/6

            const wa = await fetchAlerts(resort);
            setAlerts(wa);
            next(); // 5/6

            // 2) Travel times/meta
            if (canUseSub) {
                const v = await fetchTravelData(resort); // full payload (both directions)
                setTravelData(v);
                next();
            } else {
                // meta + ONLY selected direction
                const meta = await fetchTravelData(resort);
                setTravelData(prev => mergeTravel(prev, meta));

                if (selectedDir === "to") {
                    const v = await fetchTravelDataTo(resort);
                    setTravelData(prev => mergeTravel(prev, { to_resort: v.to_resort }, "to"));
                } else {
                    const v = await fetchTravelDataFrom(resort);
                    setTravelData(prev => mergeTravel(prev, { from_resort: v.from_resort }, "from"));
                }
                next();
            }
        } catch (err) {
            console.log("Error fetching directions:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!mapReady || !coords.length) return;
        const id = requestAnimationFrame(() =>
            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: {top: 80, right: 24, bottom: 220, left: 24},
                animated: true,
            })
        );
        return () => cancelAnimationFrame(id);
    }, [mapReady, coords]);

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchResortDirections().then();
        }
    }, [resortLoading, resort]);


    if (resortLoading || loading) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Sending fastest runners to prepare route…"/>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#e6f3f8'}}>
            <View style={[styles.map_view, {flex: 1}]}>
                <MapView
                    ref={mapRef}
                    provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}              // ← enum, not "google"
                    style={StyleSheet.absoluteFillObject}
                    showsTraffic
                    initialRegion={{
                        latitude: coords[0]?.latitude ?? FALLBACK_REGION.latitude,
                        longitude: coords[0]?.longitude ?? FALLBACK_REGION.longitude,
                        latitudeDelta: FALLBACK_REGION.latitudeDelta,
                        longitudeDelta: FALLBACK_REGION.longitudeDelta,
                    }}
                    onMapLoaded={() => {
                        setMapReady(true);
                        if (coords.length) {
                            requestAnimationFrame(() =>
                                mapRef.current?.fitToCoordinates(coords, {
                                    edgePadding: {top: 80, right: 24, bottom: 220, left: 24},
                                    animated: true,
                                })
                            );
                        }
                    }}
                >
                    <Polyline coordinates={coords} strokeWidth={6} strokeColor="#4285F4"/>
                </MapView>
            </View>
            <FloatingSettingsButton />
            <BottomSheet
                ref={sheetRef}
                index={0}
                snapPoints={snapPoints}
                topInset={topInset}
                enablePanDownToClose={false}
                enableContentPanningGesture={sheetScrollEnabled}
                handleIndicatorStyle={{backgroundColor: colors.border || '#cfd8dc'}}
                backgroundStyle={[styles.sheetBackground, {backgroundColor: '#8ec88e'}]}
            >
                <BottomSheetScrollView contentContainerStyle={styles.cameraContainer}
                                       showsVerticalScrollIndicator={false}
                                       scrollEnabled={sheetScrollEnabled}
                                       style={{backgroundColor: "#fff"}}>
                    <BannerHeaderAd/>
                    <Header message={"Travel Times:"} onRefresh={fetchResortDirections} colors={colors}
                            resort={resort?.resort_name} showRefresh={canUseSub}/>
                    {travelData && (
                        <View style={styles.travelInfoPanel} key={23}>
                            {!canUseSub && (
                                <>
                                    <View style={[styles.row, {marginTop: 8, gap: 8}]}>
                                        <TouchableOpacity
                                            onPress={() => onSelectDir("to")}
                                            disabled={toggleDisabled}
                                            style={{
                                                paddingVertical: 6,
                                                paddingHorizontal: 12,
                                                borderRadius: 16,
                                                backgroundColor:
                                                    selectedDir === "to" ? "#4285F4" : toggleDisabled ? "#eceff1" : "#cfd8dc",
                                                opacity: toggleDisabled ? 0.7 : 1,
                                            }}
                                        >
                                            <Text style={{color: selectedDir === "to" ? "#fff" : "#000"}}>To
                                                resort</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => onSelectDir("from")}
                                            disabled={toggleDisabled}
                                            style={{
                                                paddingVertical: 6,
                                                paddingHorizontal: 12,
                                                borderRadius: 16,
                                                backgroundColor:
                                                    selectedDir === "from" ? "#4285F4" : toggleDisabled ? "#eceff1" : "#cfd8dc",
                                                opacity: toggleDisabled ? 0.7 : 1,
                                            }}
                                        >
                                            <Text style={{color: selectedDir === "from" ? "#fff" : "#000"}}>From
                                                resort</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {toggleDisabled && (
                                        <Text style={[styles.panelSubtext, {marginTop: 6}]}>
                                            🔒 Switching disabled for {fmt(remainingMs)}
                                        </Text>
                                    )}
                                </>
                            )}
                            <View style={styles.row}>
                                {canUseSub ? (
                                    <>
                                        <Text style={styles.label}>To:</Text>
                                        <Text style={styles.timeValue}>{travelData?.to_resort ?? "—"} mins</Text>
                                        <Text style={styles.label}>From:</Text>
                                        <Text style={styles.timeValue}>{travelData?.from_resort ?? "—"} mins</Text>
                                    </>
                                ) : selectedDir === "to" ? (
                                    <>
                                        <Text style={styles.label}>To:</Text>
                                        <Text style={styles.timeValue}>{travelData?.to_resort ?? "—"} mins</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.label}>From:</Text>
                                        <Text style={styles.timeValue}>{travelData?.from_resort ?? "—"} mins</Text>
                                    </>
                                )}

                            </View>

                            <Text style={styles.panelHeader}>Traffic Information:</Text>
                            {travelData.traffic && (
                                <View>

                                    <Text style={{fontSize: 14, fontWeight: "bold", marginBottom: 5}}>
                                        Alerts:
                                    </Text>
                                    {alertsEvents && alertsEvents.alerts.length > 0 ? (
                                        <View style={styles.alertSection}>
                                            {alertsEvents.alerts.map((alert, idx) => (
                                                <Text key={idx} style={styles.alertText}>
                                                    ⚠️ {alert.title}
                                                </Text>
                                            ))}
                                        </View>
                                    ) : (
                                        <View>
                                            <View style={styles.summaryCard}>
                                                <Text style={styles.panelSubtext}>
                                                    Traffic Highlights:
                                                </Text>
                                                <Text style={styles.infoText}>{travelData.traffic}</Text>
                                            </View>
                                            <Text style={styles.noAlertText}>
                                                ✅ No alerts reported.
                                            </Text>
                                            <Text style={styles.exAlertText}>
                                                Alert Example: Roads open at ..., Avalanche closure... Moose on road ...
                                            </Text>
                                        </View>
                                    )}

                                    <View style={{marginTop: 20}}>
                                        <Text style={styles.panelHeader}>Live Cameras</Text>

                                        <CameraList
                                            cameras={cameras}
                                            styles={styles}
                                            isSubscribed={canUseSub}
                                            maxForSubscribed={3} // show all when subscribed (default). Set a number to cap.
                                            onUnlock={getSubs}
                                            refreshNonce={camNonce}
                                        />
                                    </View>
                                    <BannerHeaderAd/>
                                    <ConditionsEventsBlock
                                        data={alertsEvents}
                                        isSubscribed={canUseSub}
                                        showAll={false}               // or true, if you want to reveal everything for subs
                                        onPressSubscribe={getSubs}
                                        styles={styles}
                                    />

                                </View>
                            )}
                            <Text style={styles.panelHeader}>Parking:</Text>
                            {(camerasParking ?? []).map((parkCam, i) =>
                                canUseSub ? (
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


                            <ParkingHours parking={travelData?.parking}/>
                            <BannerHeaderAd style={{marginTop: 10, marginBottom: 10}}/>
                            <WeatherSection
                                alerts={weatherAlerts}
                                hourly={travelData.weather?.hourly}
                                summary={travelData.weather?.summary}
                                isSubscribed={canUseSub}
                                showAll={false}                         // set true to show more hourly rows for subs
                                onPressSubscribe={getSubs}
                                onPressSeeMore={() => router.push("/tabs/weather")}  // or your weather route
                            />

                            <Text
                                style={styles.footerText}>Updated: {new Date().toLocaleString(undefined, dateOpts)}</Text>
                        </View>
                    )
                    }
                    {/* Controls */}
                    <View style={[styles.buttonRowBottom, {marginBottom: 50, marginLeft: 10}]}>
                        <Button title="Collapse" onPress={handleCollapse}/>
                    </View>
                    <BannerHeaderAd/>
                </BottomSheetScrollView>
            </BottomSheet>
        </SafeAreaView>
    );

}

function decodePolyline(encoded: string) {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({latitude, longitude}));
}
