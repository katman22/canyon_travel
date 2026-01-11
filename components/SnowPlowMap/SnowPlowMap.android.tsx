import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useTheme } from '@react-navigation/native';
import type { SnowPlow } from '@/constants/types';

type Props = {
    plows: SnowPlow[];
    isPro: true;
    onUpgrade?: () => void;
    topOffset?: number;
};

export default function SnowPlowMap({
                                        plows,
                                        isPro,
                                        onUpgrade,
                                        topOffset = 120,
                                    }: Props) {
    const { colors } = useTheme();

    // ---------
    // NON-PRO VIEW (NO MAP)
    // ---------
    if (!isPro) {
        return (
            <View style={[StyleSheet.absoluteFillObject, styles.center]}>
                <View
                    pointerEvents="none"
                    style={[
                        styles.overlay,
                        { top: topOffset },
                    ]}
                >
                    <Text style={styles.title}>Snow Plow Routes</Text>
                    <Text style={styles.subtitle}>
                        Upgrade to Pro to view live snow plow locations and active routes.
                    </Text>

                    <TouchableOpacity onPress={onUpgrade}>
                        <Text style={[styles.upgradeLink, { color: colors.primary }]}>
                            Upgrade to Pro →
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ---------
    // PRO VIEW (MAP ALWAYS SHOWN)
    // ---------
    const initialRegion = {
        latitude: plows[0]?.latitude ?? 40.577,
        longitude: plows[0]?.longitude ?? -111.655,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    };

    const decodePolyline = (encoded?: string | null) =>
        encoded
            ? polyline.decode(encoded).map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
            }))
            : [];

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <MapView
                provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFillObject}
                initialRegion={initialRegion}
                // gestures explicitly enabled
                scrollEnabled
                zoomEnabled
                rotateEnabled
                pitchEnabled={false}
            >
                {plows.map((plow) => {
                    const coords = decodePolyline(plow.polyline);
                    return (
                        <React.Fragment key={plow.id}>
                            {coords.length > 1 && (
                                <Polyline
                                    coordinates={coords}
                                    strokeWidth={4}
                                    strokeColor="#1565C0"
                                />
                            )}
                            <Marker
                                coordinate={{
                                    latitude: plow.latitude,
                                    longitude: plow.longitude,
                                }}
                                title="Snow Plow"
                                description={`Bearing ${plow.bearing}°`}
                            />
                        </React.Fragment>
                    );
                })}
            </MapView>

            {/* Header overlay */}
            <View
                pointerEvents="none"
                style={[
                    styles.overlay,
                    { top: topOffset },
                ]}
            >
                <Text style={styles.title}>
                    {plows.length > 0 ? 'Active Snow Plows' : 'No Active Snow Plows'}
                </Text>
                <Text style={styles.subtitle}>
                    {plows.length > 0
                        ? 'Live UDOT service vehicles currently operating on this route'
                        : 'There are currently no plows reporting activity'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        left: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        elevation: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    upsellCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 24,
        alignItems: 'center',
        elevation: 4,
    },
    upgradeLink: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
    },
});
