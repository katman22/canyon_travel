// CamerasList.tsx
import React, { useState } from "react";
import { View, Text, Image, Modal, SafeAreaView, TouchableOpacity, ActivityIndicator, StatusBar, Linking } from "react-native";
import DoubleTap from "@/components/DoubleTap";
import {useOrientationLock} from "@/hooks/useOrientationLock";
import type { UdotCamera } from "@/constants/types"; // your interfaces
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import BannerHeaderAd from "@/components/BannerHeaderAd";
type Props = {
    cameras: UdotCamera[];
    styles: any; // your existing styles object
};

export default function CameraList({ cameras, styles }: Props) {
    const [fullscreen, setFullscreen] = useState<null | { id: number; imgUrl: string; pageUrl?: string }>(null);
    const [loading, setLoading] = useState(false);
    useOrientationLock(!!fullscreen);

    // Optional: make this async if you want a deterministic lock BEFORE the modal appears
    const openFullscreen = async (cam: UdotCamera) => {
        const view = cam.Views?.[0];
        // Optional fallback (helps some simulators): lock immediately
        try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        } catch {}

        const imgUrl = `https://www.udottraffic.utah.gov/map/Cctv/${view.Id}?rand=${Date.now()}`;
        setFullscreen({ id: Number(cam.Id), imgUrl, pageUrl: view.Url });
    };

    const closeFullscreen = async () => {
        setFullscreen(null);
        // Optional fallback: immediately restore
        try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        } catch {}
    };

    return (
        <>
            {cameras.map((cam, idx) => {
                const view = cam.Views?.[0];
                const enabled = view?.Status === "Enabled";

                const card = (
                    <View key={`cam-${cam.Id}`} style={styles.cameraCard}>
                        <Text style={styles.cameraLocation}>{cam.Location}</Text>

                        {enabled && (
                            <DoubleTap onDoubleTap={() => openFullscreen(cam)}>
                                <Image
                                    source={{ uri: `https://www.udottraffic.utah.gov/map/Cctv/${view!.Id}?rand=${Date.now()}` }}
                                    style={styles.cameraImage}
                                    resizeMode="cover"
                                />
                            </DoubleTap>
                        )}
                    </View>
                );

                // Insert the banner AFTER the 3rd card (idx === 2) only if there are more than 5 cameras
                if (idx === 2 && cameras.length > 5) {
                    return (
                        <React.Fragment key={`camwrap-${cam.Id}`}>
                            {card}
                            <View style={{marginBottom: 15}}>
                            <BannerHeaderAd />
                            </View>
                        </React.Fragment>
                    );
                }

                return card;
            })}


            {/* Fullscreen viewer */}
            <Modal
                visible={!!fullscreen}
                animationType="fade"
                onRequestClose={closeFullscreen}
                presentationStyle="fullScreen"
                statusBarTranslucent
            >
                <StatusBar hidden />
                <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
                    {/* Top bar */}
                    <View style={{ position: "absolute", top: 8, right: 8, zIndex: 2, flexDirection: "row", gap: 12 }}>
                        <TouchableOpacity onPress={closeFullscreen} hitSlop={10} style={{ padding: 8 }}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Image */}
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
                        {loading && <ActivityIndicator size="large" />}
                        {fullscreen && (
                            <Image
                                source={{ uri: fullscreen.imgUrl }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                                onLoadStart={() => setLoading(true)}
                                onLoadEnd={() => setLoading(false)}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}
