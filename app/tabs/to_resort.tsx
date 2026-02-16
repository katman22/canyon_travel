import 'react-native-reanimated';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Button,
    TouchableOpacity,
    StatusBar,
} from 'react-native';

import MapView, { Polyline } from 'react-native-maps';
import { LatLng } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import getStyles from '@/assets/styles/styles';
import CameraList from '@/components/CameraList';
import YouTubeTile from '@/components/YouTubeTiles';
import YouTubeTileBlockedPlayer from '@/components/YouTubeTileBlockedPlayer';
import ParkingHours from '@/components/ParkingHours';
import BrandedLoader from '@/components/BrandedLoader';
import Header from '@/components/Header';
import { useStepProgress } from '@/utils/useStepProgress';
import BannerHeaderAdIos from '@/components/BannerHeaderAd.ios';
import ConditionsEventsBlock from '@/components/ConditionsEventsBlock';
import WeatherSection from '@/components/WeatherSection';
import FloatingSettingsButton from '@/components/FloatingSettingsButton';

import { useSelectedResort } from '@/context/ResortContext';
import { useSubscription } from '@/context/SubscriptionContext';

import {
    featuredCameras,
    parkingCameras,
    fetchAlertsEvents,
    fetchAlerts,
    fetchTravelData,
    fetchTravelDataTo,
    fetchTravelDataFrom, fetchSigns,
} from '@/hooks/UseRemoteService';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrefsEvents, EVENTS } from '@/lib/events';
import {
    fetchHomeResorts,
    type HomeResortsResponse,
} from '@/lib/homeResorts';
import { effectiveAccess } from '@/lib/access';
import {Alerts, AlertsEvents, TravelTimes, UdotCamera} from '@/constants/types';


type Direction = 'to' | 'from';

export default function ToResortMap() {
    const { ready, tier, isSubscribed, status } = useSubscription();
    const { resort, loading: resortLoading } = useSelectedResort();
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    // Map & UI
    const mapRef = useRef<MapView | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [coords, setCoords] = useState<LatLng[]>([]);
    const [loading, setLoading] = useState(false);
    const { progress, reset, next } = useStepProgress(5);

    // Data
    const [travelData, setTravelData] = useState<TravelTimes | null>(null);
    const [cameras, setCameras] = useState<UdotCamera[]>([]);
    const [camerasParking, setParkingCameras] = useState<UdotCamera[]>([]);
    const [cameraRefreshNonce, setCameraRefreshNonce] = useState(0);
    const [alertsEvents, setAlertsEvents] = useState<AlertsEvents | null>(null);
    const [weatherAlerts, setAlerts] = useState<Alerts | null>(null);

    // Homes from server (truth)
    const [homes, setHomes] = useState<HomeResortsResponse | null>(null);

    // Access rules (SINGLE SOURCE OF TRUTH),
    // but guard until homes have finished loading.
    const access = homes
        ? effectiveAccess(resort, homes, tier)
        : { fullAccess: false, weatherAccess: false, travelAccess: false };

    const { fullAccess, weatherAccess, travelAccess } = access;

    // only premium or subscribed home may see both directions
    const canSeeBothDirections = fullAccess;

    // Direction toggle + cooldown (for non-full access)
    const [selectedDir, setSelectedDir] = useState<Direction>('to');
    const COOLDOWN_MS = 5 * 60 * 1000;
    const [lastFromSwitchAt, setLastFromSwitchAt] = useState<number | null>(null);
    const [nowTs, setNowTs] = useState<number>(Date.now());
    const remainingMs =
        !fullAccess && lastFromSwitchAt
            ? Math.max(0, lastFromSwitchAt + COOLDOWN_MS - nowTs)
            : 0;
    const toggleDisabled = remainingMs > 0;

    // Sheet
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['28%', '50%', '90%'], []);
    const handleCollapse = () => sheetRef.current?.snapToIndex(0);
    const [sheetScrollEnabled, setSheetScrollEnabled] = useState(true);
    const onTextZoomStart = () => setSheetScrollEnabled(false);
    const onTextZoomEnd = () => setSheetScrollEnabled(true);

    // Insets / time display
    const insets = useSafeAreaInsets();
    const topInset = insets.top || StatusBar.currentHeight || 20;
    const dateOpts: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    };

    const FALLBACK_REGION = {
        latitude: 40.577,
        longitude: -111.655,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    const fmt = (ms: number) => {
        const s = Math.ceil(ms / 1000);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    };

    const getSubs = () => router.replace('/tabs/rc_subscriptions');

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

    const refreshCameras = async () => {
        if (!resort) return;

        try {
            const udot = await featuredCameras(resort);
            setCameras(udot.cameras);
            next();

            const park = await parkingCameras(resort);
            setParkingCameras(park.cameras);
            next();

            // bump nonce so CameraList reloads images
            setCameraRefreshNonce((n) => n + 1);
        } catch (err) {
            console.warn("Camera refresh failed:", err);
        }
    };

    // Fetch resort data bundle
    const fetchResortDirections = async () => {
        if (!resort) return;
        setLoading(true);
        reset();

        try {
            await refreshCameras();

            const ae = await fetchAlertsEvents(resort);
            setAlertsEvents(ae.alerts_events);
            next();

            const wa = await fetchAlerts(resort);
            setAlerts(wa);
            next();

            // Travel times/meta
            if (fullAccess) {
                const v = await fetchTravelData(resort, 'all'); // both directions at once
                setTravelData(v);
                if ((v as any).overview_polyline) {
                    setCoords(decodePolyline((v as any).overview_polyline));
                }
                next();
            } else {
                if (selectedDir === 'to') {
                    const v = await fetchTravelDataTo(resort);
                    setTravelData(v);
                    if ((v as any).overview_polyline) setCoords(decodePolyline((v as any).overview_polyline));
                } else {
                    const v = await fetchTravelDataFrom(resort);
                    setTravelData(v);
                    if ((v as any).overview_polyline) setCoords(decodePolyline((v as any).overview_polyline));
                }
                next();
            }
        } catch (err) {
            console.log('Error fetching directions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Map fit
    useEffect(() => {
        if (!mapReady || !coords.length) return;
        const id = requestAnimationFrame(() =>
            mapRef.current?.fitToCoordinates(coords, {
                edgePadding: { top: 80, right: 24, bottom: 220, left: 24 },
                animated: true,
            }),
        );
        return () => cancelAnimationFrame(id);
    }, [mapReady, coords]);

    // Initial fetch when ready
    useEffect(() => {
        if (ready && !resortLoading && resort && homes) {
            void fetchResortDirections();
        }
    }, [ready, resortLoading, resort, homes, fullAccess, selectedDir]);

    // Cooldown ticker
    useEffect(() => {
        const id = setInterval(() => setNowTs(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    // Direction choose (non-full only)
    const onSelectDir = async (dir: Direction) => {
        if (!resort) return;
        if (canSeeBothDirections) {
            setSelectedDir(dir);
            return;
        }
        if (toggleDisabled) return;

        setSelectedDir(dir);

        try {
            if (dir === 'to') {
                if (travelData?.to_resort == null) {
                    const v = await fetchTravelDataTo(resort);
                    setTravelData(v);
                    if ((v as any).overview_polyline) setCoords(decodePolyline((v as any).overview_polyline));
                }
            } else {
                if (travelData?.from_resort == null) {
                    const v = await fetchTravelDataFrom(resort);
                    setTravelData(v);
                    if ((v as any).overview_polyline) setCoords(decodePolyline((v as any).overview_polyline));
                }
                setLastFromSwitchAt(Date.now());
            }
        } catch {
            // ignore
        }
    };

    if (resortLoading || loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <BrandedLoader progress={progress} message="Sending fastest runners to prepare route…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f3f8' }}>
            <View style={[styles.map_view, { flex: 1 }]}>
                <MapView
                    ref={mapRef}
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
                                    edgePadding: { top: 80, right: 24, bottom: 220, left: 24 },
                                    animated: true,
                                }),
                            );
                        }
                    }}
                >
                    <Polyline coordinates={coords} strokeWidth={6} strokeColor="#4285F4" />
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
                handleIndicatorStyle={{ backgroundColor: colors.border || '#cfd8dc' }}
                backgroundStyle={[styles.sheetBackground, { backgroundColor: '#8ec88e' }]}
            >
                <BottomSheetScrollView
                    contentContainerStyle={styles.cameraContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={sheetScrollEnabled}
                    style={{ backgroundColor: '#fff' }}
                >
                    <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/9698910518"}/>
                    <Header
                        message={'Travel Times:'}
                        onRefresh={fetchResortDirections}
                        colors={colors}
                        resort={resort?.resort_name}
                        showRefresh={fullAccess}
                    />

                    {travelData && (
                        <View style={styles.travelInfoPanel} key="travel">
                            {/* FREE: direction toggle + cooldown (no access) */}
                            {!canSeeBothDirections && (
                                <>
                                    <View style={[styles.row, { marginTop: 8, gap: 8 }]}>
                                        <TouchableOpacity
                                            onPress={() => onSelectDir('to')}
                                            disabled={toggleDisabled}
                                            style={[
                                                styles.dirBtn,
                                                selectedDir === 'to'
                                                    ? styles.dirBtnActive
                                                    : toggleDisabled
                                                        ? styles.dirBtnDisabled
                                                        : styles.dirBtnIdle,
                                                toggleDisabled && { opacity: 0.7 },
                                            ]}
                                        >
                                            <Text style={{ color: selectedDir === 'to' ? '#fff' : '#000' }}>To resort</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => onSelectDir('from')}
                                            disabled={toggleDisabled}
                                            style={[
                                                styles.dirBtn,
                                                selectedDir === 'from'
                                                    ? styles.dirBtnActive
                                                    : toggleDisabled
                                                        ? styles.dirBtnDisabled
                                                        : styles.dirBtnIdle,
                                                toggleDisabled && { opacity: 0.7 },
                                            ]}
                                        >
                                            <Text style={{ color: selectedDir === 'from' ? '#fff' : '#000' }}>From resort</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {toggleDisabled && (
                                        <Text style={[styles.panelSubtext, { marginTop: 6 }]}>
                                            🔒 Switching disabled for {fmt(remainingMs)}
                                        </Text>
                                    )}
                                </>
                            )}

                            {/* Single row display */}
                            <View style={styles.row}>
                                {canSeeBothDirections ? (
                                    <>
                                        <Text style={styles.label}>To:</Text>
                                        <Text style={styles.timeValue}>{travelData?.to_resort ?? '—'} mins</Text>
                                        <Text style={styles.label}>From:</Text>
                                        <Text style={styles.timeValue}>{travelData?.from_resort ?? '—'} mins</Text>
                                    </>
                                ) : selectedDir === 'to' ? (
                                    <>
                                        <Text style={styles.label}>To:</Text>
                                        <Text style={styles.timeValue}>{travelData?.to_resort ?? '—'} mins</Text>
                                        <Text style={styles.label}>From:</Text>
                                        <Text style={styles.timeValue}>{travelData?.from_resort ?? '—'} mins</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.label}>To:</Text>
                                        <Text style={styles.timeValue}>{travelData?.to_resort ?? '—'} mins</Text>
                                        <Text style={styles.label}>From:</Text>
                                        <Text style={styles.timeValue}>{travelData?.from_resort ?? '—'} mins</Text>
                                    </>
                                )}
                            </View>

                            <Text style={styles.panelHeader}>Traffic Information:</Text>
                            {travelData.traffic && (
                                <View>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>Alerts:</Text>

                                    {alertsEvents && alertsEvents.alerts.length > 0 ? (
                                        <View style={styles.alertSectionResort}>
                                            {alertsEvents.alerts.map((alert, idx) => (
                                                <Text key={idx} style={styles.alertText}>
                                                    ⚠️ {alert.title}
                                                </Text>
                                            ))}
                                        </View>
                                    ) : (
                                        <View>
                                            <View style={styles.summaryCard}>
                                                <Text style={styles.panelSubtext}>Traffic Highlights:</Text>
                                                <Text style={styles.infoText}>{travelData.traffic}</Text>
                                            </View>
                                            <Text style={styles.noAlertText}>✅ No alerts reported.</Text>
                                            <Text style={styles.exAlertText}>
                                                Alert Example: Roads open at ..., Avalanche closure... Moose on road ...
                                            </Text>
                                        </View>
                                    )}

                                    <View style={{ marginTop: 20 }}>
                                        <Text style={styles.panelHeader}>Live Cameras</Text>

                                        <CameraList
                                            cameras={cameras}
                                            styles={styles}
                                            isSubscribed={travelAccess}     // free homes: false
                                            maxForSubscribed={3}
                                            onUnlock={getSubs}
                                            refreshNonce={cameraRefreshNonce}
                                        />
                                    </View>

                                    <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/4750492703"}/>

                                    <ConditionsEventsBlock
                                        data={alertsEvents}
                                        isSubscribed={travelAccess}       // free homes: false
                                        showAll={travelAccess}
                                        onPressSubscribe={getSubs}
                                        styles={styles}
                                    />
                                </View>
                            )}

                            <Text style={styles.panelHeader}>Parking:</Text>
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
                                        onPressCTA={() => router.replace('/tabs/rc_subscriptions')}
                                    />
                                )
                            )}

                            <ParkingHours parking={travelData?.parking} />

                            <BannerHeaderAdIos style={{ marginTop: 10, marginBottom: 10 }} ios_id={"ca-app-pub-6336863096491370/5184950439"}/>

                            <WeatherSection
                                alerts={weatherAlerts?.alerts ?? []}
                                hourly={travelData.weather?.hourly}
                                summary={travelData.weather?.summary}
                                isSubscribed={weatherAccess}          // free homes: false
                                showAll={weatherAccess}
                                onPressSubscribe={getSubs}
                                onPressSeeMore={() => router.push('/tabs/weather')}
                            />

                            <Text style={styles.footerText}>
                                Updated: {new Date().toLocaleString(undefined, dateOpts)}
                            </Text>
                        </View>
                    )}

                    {/* Controls */}
                    <View style={[styles.buttonRowBottom, { marginBottom: 50, marginLeft: 10 }]}>
                        <Button title="Collapse" onPress={handleCollapse} />
                    </View>
                    <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/3525040945"}/>
                </BottomSheetScrollView>
            </BottomSheet>
        </SafeAreaView>
    );
}

function decodePolyline(encoded: string) {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({ latitude, longitude }));
}

