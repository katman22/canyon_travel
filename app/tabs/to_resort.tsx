import React, {useEffect, useRef, useState} from 'react';
import {View, Text, ActivityIndicator, TouchableOpacity} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import polyline from '@mapbox/polyline';
import {LatLng} from 'react-native-maps';
import {fetchDirections, fetchTravelData} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {TravelTimes} from "@/constants/types"

export default function ToResortMap() {
    const [coords, setCoords] = useState<LatLng[]>([]);
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [travelData, setTravelData] = useState<TravelTimes | null>(null);
    const [showTravelPanel, setShowTravelPanel] = useState(true);
    const mapRef = useRef<MapView | null>(null);
    const [mapReady, setMapReady] = useState(false);

    const fetchResortDirections = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);

        try {
            const googleResponse = await fetchDirections(resort);
            const route = googleResponse.routes[0];
            const points = decodePolyline(route.overview_polyline.points);
            setCoords(points);

        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mapReady && mapRef.current && coords.length > 0) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                },
                animated: true,
            });
        } else {
            console.log("⏳ Waiting to fit route (conditions not met)");
        }
    }, [mapReady, coords, mapRef.current]);

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchResortDirections();
            fetchTravelData(resort).then(setTravelData).catch(console.error);
        }
    }, [resortLoading, resort]);


    if (loading) {
        return <ActivityIndicator size="large" color="#000" style={styles.topLoading}/>;
    }
    if (resortLoading) {
        return <ActivityIndicator/>;
    }
    return (
        <View style={styles.container}>

            <Text style={styles.panelHeader}>{resort && resort.name}</Text>
            <TouchableOpacity onPress={fetchResortDirections} style={styles.refreshButton}>
                <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>
            <MapView
                ref={mapRef}
                provider="google"
                style={styles.map}
                showsTraffic={true}
                onMapReady={() => setMapReady(true)}
            >
                <Polyline coordinates={coords} strokeWidth={6} strokeColor="#4285F4" />
            </MapView>

            <TouchableOpacity onPress={() => setShowTravelPanel(prev => !prev)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>
                    {showTravelPanel ? "Hide Travel Info" : "Show Travel Info"}
                </Text>
            </TouchableOpacity>

            {showTravelPanel && travelData && resort && (
                <View style={styles.travelInfoPanel}>
                    <Text style={styles.panelHeader}>Travel Times</Text>
                    <Text style={styles.panelSubtext}>
                        From {travelData.departure_point} to {resort.name}
                    </Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>To:</Text>
                        <Text style={styles.timeValue}>{travelData.to_resort} mins</Text>
                        <Text style={styles.label}>From:</Text>
                        <Text style={styles.timeValue}>{travelData.from_resort} mins</Text>
                    </View>

                    {travelData.parking && <Text style={styles.infoText}>{travelData.parking}</Text>}
                    {travelData.traffic && <Text style={styles.infoText}>{travelData.traffic}</Text>}
                    {travelData.weather && <Text style={styles.infoText}>{travelData.weather}</Text>}

                    <Text style={styles.footerText}>Updated: {travelData.updated_at}</Text>
                </View>
            )}
        </View>
    );

}

function decodePolyline(encoded: string) {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({latitude, longitude}));
}
