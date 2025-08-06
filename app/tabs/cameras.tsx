import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {fetchCameras} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {UdotCamera} from "@/constants/types"

export default function Cameras() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [cameras, setCameras] = useState<UdotCamera[]>([]);

    const fetchCameraData = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);

        try {
            const udotCameraData = await fetchCameras(resort);
            setCameras(udotCameraData.cameras);
        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchCameraData();
        }
    }, [resortLoading, resort]);


    if (loading) {
        return <ActivityIndicator size="large" color="#000" style={styles.topLoading}/>;
    }
    if (resortLoading) {
        return <ActivityIndicator/>;
    }
    return (

        <ScrollView contentContainerStyle={styles.cameraContainer}>
            <Text style={styles.panelHeader}>{resort && resort.name}</Text>
            <TouchableOpacity onPress={fetchCameraData} style={styles.refreshButton}>
                <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>

            {/* Always show this camera first for Brighton */}
            {resort?.id === 'brighton' && (
                <View key="58010" style={styles.cameraCard}>
                    <Text style={styles.cameraLocation}>
                        Wasatch Blvd / SR-190/SR-210 @ Big Cottonwood Canyon Rd / Fort Union Blvd / SR-190, CWH
                    </Text>
                    <Image
                        source={{
                            uri: `https://www.udottraffic.utah.gov/map/Cctv/58010?rand=${Date.now()}`
                        }}
                        style={styles.cameraImage}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* All dynamic cameras */}
            {cameras.map((cam) => (
                <View key={cam.Id} style={styles.cameraCard}>
                    <Text style={styles.cameraLocation}>{cam.Location}</Text>
                    {cam.Views[0]?.Status === 'Enabled' && (
                        <Image
                            source={{
                                uri: `https://www.udottraffic.utah.gov/map/Cctv/${cam.Views[0].Id}?rand=${Date.now()}`
                            }}
                            style={styles.cameraImage}
                            resizeMode="cover"
                        />
                    )}
                </View>
            ))}
        </ScrollView>

    );

}
