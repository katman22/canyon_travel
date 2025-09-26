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
    Platform
} from 'react-native';
import MapView, {Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import getStyles from '@/assets/styles/styles';
import polyline from '@mapbox/polyline';
import {LatLng} from 'react-native-maps';
import CameraList from '@/components/CameraList'
import {
    parkingCameras,
    featuredCameras,
    fetchAlertsEvents,
    fetchDirections,
    fetchAlerts,
    fetchTravelData
} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {Alerts, AlertsEvents, TravelTimes, UdotCamera} from "@/constants/types"
import {useTheme} from '@react-navigation/native';
import YouTubeTileBlockedPlayer from "@/components/YouTubeTileBlockedPlayer";
import ParkingHours from "@/components/ParkingHours";
import WeatherAlerts from "@/components/WeatherAlerts";
import HourlyForecastStrip from "@/components/HourlyForecastStrip";
import ForecastSummary from "@/components/ForecastSummary";
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import BrandedLoader from '@/components/BrandedLoader';
import Header from '@/components/Header';
import {useStepProgress} from '@/utils/useStepProgress';
import BannerHeaderAd from "@/components/BannerHeaderAd";

export default function ToResortMap() {
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

    const fetchResortDirections = async () => {
        if (!resort) return;
        setLoading(true);
        reset();

        try {
            const googleResponse = await fetchDirections(resort);
            const route = googleResponse.routes[0];
            const points = decodePolyline(route.overview_polyline.points);
            setCoords(points);
            next(); // 1/6

            const udotCameraData = await featuredCameras(resort);
            setCameras(udotCameraData.cameras);
            next(); // 2/6

            const parkingCameraData = await parkingCameras(resort);
            setParkingCameras(parkingCameraData.cameras);
            next(); // 3/6

            const alertsEventsResponse = await fetchAlertsEvents(resort);
            setAlertsEvents(alertsEventsResponse.alerts_events);
            next(); // 4/6

            const weatherAlerts = await fetchAlerts(resort);
            setAlerts(weatherAlerts);
            next(); // 5/6

            fetchTravelData(resort).then(v => {
                setTravelData(v);
                next(); // 6/6
            }).catch(console.error);
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
                            resort={resort?.resort_name}/>
                    {travelData && (
                        <View style={styles.travelInfoPanel} key={23}>

                            <View style={styles.row}>
                                <Text style={styles.label}>To:</Text>
                                <Text style={styles.timeValue}>{travelData.to_resort} mins</Text>
                                <Text style={styles.label}>From:</Text>
                                <Text style={styles.timeValue}>{travelData.from_resort} mins</Text>
                            </View>
                            <Text style={styles.panelSubtext}>
                                From {travelData.departure_point} to {resort?.resort_name}
                            </Text>

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
                                        <CameraList cameras={cameras} styles={styles}/>
                                        {cameras.length > 1 && (
                                            <View key={cameras[1].Id} style={[styles.cameraCard, styles.lockedCamera]}>
                                                <Text style={styles.cameraLocation}>Subscribe to unlock more.</Text>
                                                <View style={styles.lockedOverlay}>
                                                    <Text style={styles.lockedText}>🔒 Subscribe to unlock more
                                                        cameras</Text>
                                                </View>
                                                <Image
                                                    source={{uri: `https://www.udottraffic.utah.gov/map/Cctv/${cameras[1].Views[0]?.Id}?rand=${Date.now()}`}}
                                                    style={[styles.cameraImage, {opacity: 0.2}]}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <BannerHeaderAd/>
                                    <Text style={{fontSize: 14, fontWeight: "bold", marginBottom: 5, marginTop: 10}}>
                                        Road Conditions:
                                    </Text>
                                    <View style={styles.conditionsSection}>
                                        {alertsEvents && alertsEvents.conditions?.slice(0, 2).map((cond) => (
                                            <View key={cond.Id} style={styles.conditionCard}>
                                                <Text style={styles.roadName}>{cond.RoadwayName}</Text>
                                                <Text style={styles.conditionText}>Road: {cond.RoadCondition}</Text>
                                                <Text
                                                    style={styles.conditionText}>Weather: {cond.WeatherCondition}</Text>
                                                <Text
                                                    style={styles.conditionText}>Restriction: {cond.Restriction}</Text>
                                            </View>
                                        ))}
                                        <View style={styles.conditionCard}>
                                            <Text style={styles.roadName}>See All Conditions With Subscription</Text>
                                            <Text style={styles.conditionText}>Road: Wet. Dry, Snow</Text>
                                            <Text
                                                style={styles.conditionText}>Weather: Fair, Rain, Snow</Text>
                                            <Text
                                                style={styles.conditionText}>Restriction: 4x4 only, Open, Closed for
                                                Avalanche ...</Text>
                                        </View>
                                        <Text style={{fontSize: 14, fontWeight: "bold", marginBottom: 5}}>
                                            Events:
                                        </Text>
                                        <View key="event_holder" style={styles.eventCard}>
                                            <Text style={styles.eventHeader}>
                                                🚧 Events Available with subscription
                                            </Text>
                                            <Text style={styles.eventDescription}>Events will describe road closures,
                                                construction, community events and more</Text>
                                            <Text style={[styles.eventComment, {marginBottom: 20}]}>Also included
                                                Overhead signs (parking & avalanche closures, times to destinations).
                                                Seasonal Road information. Service vehicles in routes. </Text>
                                            <Text style={styles.eventMeta}>
                                                MileMarkers: Events pinpoint mile markers, you can know before you go!
                                            </Text>
                                        </View>
                                    </View>

                                </View>
                            )}
                            <Text style={styles.panelHeader}>Parking:</Text>
                            {camerasParking.map((parkCam, i) => (
                                <YouTubeTileBlockedPlayer
                                    key={`yt-${String(parkCam.Id)}-${i}`}
                                    title={parkCam.Location}
                                    streamId={String(parkCam.Id)}
                                    description={parkCam.Location}
                                    previewSeconds={30}                 // or 120, your call
                                    showRefresh={false}
                                    ctaLabel="Subscribe for the full stream"
                                    onPressCTA={() => {/* navigate to paywall / pricing screen */
                                    }}
                                />
                            ))}
                            <ParkingHours parking={travelData?.parking}/>
                            <Text style={[styles.panelHeader,{marginTop: 10}]}>Weather:</Text>
                            <Text style={styles.panelSubtext}>Alerts:</Text>
                            <WeatherAlerts alerts={weatherAlerts}/>
                            <HourlyForecastStrip
                                hourly={travelData.weather?.hourly}
                                limit={3}
                                prefix={'xfy'}
                            />
                            {travelData.weather &&
                                <ForecastSummary
                                    text={travelData.weather?.summary}
                                    isSubscribed={false}
                                    maxChars={700}
                                    maxSentences={12}
                                    onZoomStart={onTextZoomStart}
                                    onZoomEnd={onTextZoomEnd}
                                />
                            }

                            <Text
                                style={styles.footerText}>Updated: {new Date().toLocaleString(undefined, dateOpts)}</Text>
                        </View>
                    )
                    }
                    {/* Controls */}
                    <View style={[styles.buttonRowBottom, {marginBottom: 50, marginLeft: 10}]}>
                        <Button title="Collapse" onPress={handleCollapse}/>
                    </View>
                    <BannerHeaderAd />
                </BottomSheetScrollView>
            </BottomSheet>
        </SafeAreaView>
    );

}

function decodePolyline(encoded: string) {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({latitude, longitude}));
}
