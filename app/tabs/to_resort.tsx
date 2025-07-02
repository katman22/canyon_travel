import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import polyline from '@mapbox/polyline';
import {LatLng} from 'react-native-maps';
import {Region} from 'react-native-maps';
import {fetchDirections} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/hooks/UseSelectedResort"

export default function ToResortMap() {
    const [coords, setCoords] = useState<LatLng[]>([]);
    const [region, setRegion] = useState<Region | null>(null);
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort} = useSelectedResort();


    const fetchResortDirections = async () => {
        setLoading(true);

        try {
            const googleResponse = await fetchDirections(resort);
            const route = googleResponse.routes[0]
            const points = decodePolyline(route.overview_polyline.points);
            setCoords(points);
            const first = points[0];
            setRegion({
                latitude: first.latitude,
                longitude: first.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchResortDirections();
    }, []);


    if (loading) {
        return <ActivityIndicator size="large" color="#000" style={styles.topLoading}/>;
    }
    return (
        <View style={styles.container}>
            {region && (
                <MapView
                    {...{
                        provider: 'google',
                        style: styles.map,
                        initialRegion: region,
                        showsTraffic: true,
                    } as any}>
                    <Polyline coordinates={coords} strokeWidth={6} strokeColor="#4285F4"/>
                </MapView>
            )}
        </View>
    );
}

function decodePolyline(encoded: string) {
    const points = polyline.decode(encoded);
    return points.map(([latitude, longitude]) => ({latitude, longitude}));
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

});
