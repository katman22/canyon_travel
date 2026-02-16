import React, { useState, useMemo, useCallback } from "react";
import {
    View,
    Text,
    Image,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
} from "react-native";
import DoubleTap from "@/components/DoubleTap";
import type { UdotCamera } from "@/constants/types";
import { Ionicons } from "@expo/vector-icons";
import * as ScreenOrientation from "expo-screen-orientation";
import BannerHeaderAdIos from "@/components/BannerHeaderAd.ios";

type Props = {
    cameras: UdotCamera[];
    styles: any;

    // subscription gating
    isSubscribed: boolean;
    maxForFree?: number;
    maxForSubscribed?: number;

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
                                       refreshNonce = 0,
                                   }: Props) {
    const [fullscreen, setFullscreen] = useState<null | { id: number; imgUrl: string; pageUrl?: string }>(null);
    const [loading, setLoading] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // prevent double-close race
    const cacheBuster = useMemo(() => Date.now(), [refreshNonce]);
    const imgUrlFor = (viewId: number) =>
        `https://www.udottraffic.utah.gov/map/Cctv/${viewId}?_=${cacheBuster}`;

    // Decide visible + teaser behavior
    const { visible, showLocked, teaser } = useMemo(() => {
        const total = cameras ?? [];

        if (isSubscribed) {
            const subscribedLimit =
                typeof maxForSubscribed === "number" ? maxForSubscribed : total.length;
            return {
                visible: total.slice(0, subscribedLimit),
                showLocked: false,
                teaser: undefined as UdotCamera | undefined,
            };
        }

        // free tier:
        const firstTwo = total.slice(0, Math.min(2, total.length));
        const useSecondAsTeaser = total[1] ?? total[0];
        return {
            visible: firstTwo,
            showLocked: !!useSecondAsTeaser,
            teaser: useSecondAsTeaser,
        };
    }, [cameras, isSubscribed, maxForSubscribed]);

    // Lock device to landscape when opening fullscreen
    const lockLandscape = useCallback(async () => {
        try {
            // LANDSCAPE_LEFT is generally reliable across iOS/Android
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
            );
        } catch {
            // ignore; not fatal
        }
    }, []);

    // Try to restore portrait (preferred), and if that fails, fall back to DEFAULT
    const restorePortrait = useCallback(async () => {
        try {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
            return;
        } catch {
            // portrait lock might be invalid on some form factors (iPad multitask modes etc.)
        }
        try {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.DEFAULT
            );
        } catch {
            // still ignore; worst case user stays landscape but app doesn't crash
        }
    }, []);

    const openFullscreen = useCallback(
        async (cam: UdotCamera) => {
            const view = cam?.Views?.[0];
            if (!view) return;
            await lockLandscape();
            const imgUrl = `https://www.udottraffic.utah.gov/map/Cctv/${view.Id}?rand=${Date.now()}`;
            setFullscreen({
                id: Number(cam.Id),
                imgUrl,
                pageUrl: view.Url,
            });
            setIsClosing(false);
        },
        [lockLandscape]
    );

    const actuallyCloseFullscreen = useCallback(() => {
        // hide modal content
        setFullscreen(null);
        // restore status bar, orientation handled already by closeFullscreen()
    }, []);

    // Close handler that:
    // 1. makes sure we don't run twice
    // 2. unlocks orientation BEFORE unmounting modal content (iOS stability)
    const closeFullscreen = useCallback(async () => {
        if (isClosing) return;
        setIsClosing(true);

        // bring device back to portrait/default while modal is still mounted
        await restorePortrait();

        // now actually dismiss modal
        actuallyCloseFullscreen();
    }, [isClosing, restorePortrait, actuallyCloseFullscreen]);

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
                                    source={{ uri: `${imgUrlFor(view!.Id)}` }}
                                    style={styles.cameraImage}
                                    resizeMode="cover"
                                />
                            </DoubleTap>
                        )}
                    </View>
                );

                // drop an ad after 3rd real card if there are a bunch of cams
                if (idx === 2 && (cameras?.length ?? 0) > 5) {
                    return (
                        <React.Fragment key={`camwrap-${cam.Id ?? idx}`}>
                            {card}
                            <View style={{ marginBottom: 15 }}>
                                <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/4750492703"}/>
                            </View>
                        </React.Fragment>
                    );
                }

                return card;
            })}

            {/* locked teaser card for non-full-access users */}
            {!isSubscribed && showLocked && (
                <View
                    key={`locked-teaser-${teaser?.Id ?? "x"}`}
                    style={[styles.cameraCard, styles.lockedCamera]}
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
                                style={[
                                    styles.lockedText,
                                    { textDecorationLine: "underline" },
                                ]}
                                accessibilityRole="link"
                                accessibilityHint="Opens subscription options"
                            >
                                🔒 Subscribe to unlock more cameras
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {!!teaser?.Views?.[0]?.Id && (
                        <Image
                            source={{
                                uri: `https://www.udottraffic.utah.gov/map/Cctv/${teaser.Views[0].Id}?rand=${cacheBuster}`,
                            }}
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
                onRequestClose={closeFullscreen} // Android back button, iOS swipe-down on some modals
                presentationStyle="fullScreen"
                statusBarTranslucent
            >
                {/* While fullscreen is open, hide the system status bar for immersion */}
                <StatusBar hidden />

                <SafeAreaView
                    style={{
                        flex: 1,
                        backgroundColor: "black",
                    }}
                >
                    {/* top bar with close button.
                       We give it its own solid hit area so it's obvious and tappable
                       in landscape on both platforms. */}
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: "rgba(0,0,0,0.4)",
                            zIndex: 10,
                            flexDirection: "row",
                            justifyContent: "flex-end",
                        }}
                    >
                        <TouchableOpacity
                            onPress={closeFullscreen}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: "rgba(0,0,0,0.6)",
                            }}
                        >
                            <Image
                                source={require("@/assets/cross_delete.png")} // ← your PNG
                                style={[
                                    styles.icon,
                                    { width: 20, height: 20, opacity: 1 },
                                ]}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* camera image body */}
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "black",
                        }}
                    >
                        {loading && <ActivityIndicator size="large" color="#fff" />}

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
