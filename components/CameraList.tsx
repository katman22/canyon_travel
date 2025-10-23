// components/CameraList.tsx
import React, { useState, useMemo } from "react";
import { View, Text, Image, Modal, SafeAreaView, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import DoubleTap from "@/components/DoubleTap";
import type { UdotCamera } from "@/constants/types";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import BannerHeaderAd from "@/components/BannerHeaderAd";

type Props = {
    cameras: UdotCamera[];
    styles: any;

    // subscription gating
    isSubscribed: boolean;
    maxForFree?: number;           // kept for API compatibility; ignored for non-sub teaser logic
    maxForSubscribed?: number;     // undefined = show all

    // CTA when locked
    onUnlock?: () => void;
    refreshNonce?: number;
};

export default function CameraList({
                                       cameras,
                                       styles,
                                       isSubscribed,
                                       maxForFree = 2,
                                       maxForSubscribed,
                                       onUnlock,
                                       refreshNonce = 0
                                   }: Props) {
    const [fullscreen, setFullscreen] = useState<null | { id: number; imgUrl: string; pageUrl?: string }>(null);
    const [loading, setLoading] = useState(false);
    const imgUrlFor = (viewId: number) =>
        `https://www.udottraffic.utah.gov/map/Cctv/${viewId}?v=${refreshNonce}`;

    // Decide visible + teaser behavior
    const { visible, showLocked, teaser } = useMemo(() => {
        const total = cameras ?? [];

        // SUBSCRIBED: show up to maxForSubscribed (or all)
        if (isSubscribed) {
            const subscribedLimit = typeof maxForSubscribed === "number" ? maxForSubscribed : total.length;
            return {
                visible: total.slice(0, subscribedLimit),
                showLocked: false,
                teaser: undefined as UdotCamera | undefined,
            };
        }

        // NOT SUBSCRIBED:
        // Always show EXACTLY the first two real cards (or fewer if we don't have two),
        // then a *third* locked teaser that uses the SECOND camera's image when possible.
        const firstTwo = total.slice(0, Math.min(2, total.length));
        const useSecondAsTeaser = total[1] ?? total[0]; // prefer index 1; fallback to 0 if only one camera exists
        return {
            visible: firstTwo,
            showLocked: !!useSecondAsTeaser, // show teaser if there's at least one camera to base it on
            teaser: useSecondAsTeaser,
        };
    }, [cameras, isSubscribed, maxForSubscribed]);

    const lockLandscape = async () => {
        try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        } catch {}
    };
    const unlockDefault = async () => {
        try {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        } catch {}
    };

    const openFullscreen = async (cam: UdotCamera) => {
        const view = cam?.Views?.[0];
        if (!view) return;
        await lockLandscape();
        const imgUrl = `https://www.udottraffic.utah.gov/map/Cctv/${view.Id}?rand=${Date.now()}`;
        setFullscreen({ id: Number(cam.Id), imgUrl, pageUrl: view.Url });
    };

    const closeFullscreen = async () => {
        setFullscreen(null);
        await unlockDefault();
    };

    return (
        <>
            {/* visible cameras */}
            {visible.map((cam, idx) => {
                const view = cam.Views?.[0];
                const enabled = view?.Status === "Enabled";

                const card = (
                    <View key={`cam-${cam.Id ?? idx}`} style={styles.cameraCard}>
                        <Text style={styles.cameraLocation}>{cam.Location}</Text>
                        {enabled && (
                            <DoubleTap onDoubleTap={() => openFullscreen(cam)}>
                                <Image
                                    source={{ uri: imgUrlFor(view!.Id) }}   // ← stable unless refreshNonce changes
                                    style={styles.cameraImage}
                                    resizeMode="cover"
                                />
                            </DoubleTap>
                        )}
                    </View>
                );

                // Optional ad after the 3rd *real* card shown (idx===2).
                // For non-subs we only show two real cards, so this won’t trigger there (intentional).
                if (idx === 2 && (cameras?.length ?? 0) > 5) {
                    return (
                        <React.Fragment key={`camwrap-${cam.Id ?? idx}`}>
                            {card}
                            <View style={{ marginBottom: 15 }}>
                                <BannerHeaderAd />
                            </View>
                        </React.Fragment>
                    );
                }

                return card;
            })}

            {/* locked teaser card (non-subscribed): always use SECOND camera’s image when possible */}
            {!isSubscribed && showLocked && (
                <View
                    key={`locked-teaser-${teaser?.Id ?? "x"}`}
                    style={[styles.cameraCard, styles.lockedCamera]}
                    /* No DoubleTap here: it's intentionally *not* interactive */
                >
                    <Text style={styles.cameraLocation}>Subscribe to unlock more.</Text>

                    <View style={styles.lockedOverlay}>
                        <TouchableOpacity
                            onPress={onUnlock}
                            accessibilityRole="button"
                            accessibilityLabel="Subscriptions"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text
                                style={[styles.lockedText, { textDecorationLine: "underline" }]}
                                accessibilityRole="link"
                                accessibilityHint="Opens subscription options"
                            >
                                🔒 Subscribe to unlock more cameras
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!!teaser?.Views?.[0]?.Id && (
                        <Image
                            source={{ uri: `https://www.udottraffic.utah.gov/map/Cctv/${teaser.Views[0].Id}?rand=${Date.now()}` }}
                            style={[styles.cameraImage, { opacity: 0.2 }]}
                            resizeMode="cover"
                        />
                    )}
                </View>
            )}

            {/* Fullscreen modal */}
            <Modal
                visible={!!fullscreen}
                animationType="fade"
                onRequestClose={closeFullscreen}
                presentationStyle="fullScreen"
                statusBarTranslucent
            >
                <StatusBar hidden />
                <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
                    {/* close */}
                    <View style={{ position: "absolute", top: 8, right: 8, zIndex: 2, flexDirection: "row", gap: 12 }}>
                        <TouchableOpacity onPress={closeFullscreen} hitSlop={10} style={{ padding: 8 }}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* image */}
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
