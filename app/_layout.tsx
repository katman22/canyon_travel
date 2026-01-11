import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider, useTheme } from "@react-navigation/native";
import { FontAvailabilityProvider } from "@/context/FontAvailability";
import { LightNavTheme } from "@/constants/palette";
import * as NavigationBar from "expo-navigation-bar";
import { useOrbitronFont } from "@/hooks/useOrbitronFont";
import { SubscriptionProvider, useSubscription } from "@/context/SubscriptionContext";
import { bootstrapAuth } from "@/utils/bootstrapAuth";
import BrandedLoader from "@/components/BrandedLoader";
import { apiAuth } from "@/lib/apiAuth";
// @ts-ignore
import { UpdateRequiredScreen } from "@/context/UpdateRequiredScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const funMessages = {
    bootstrapping: [
        "Sharpening skis and checking your ID…",
        "Packing snacks and emergency flares…",
        "Dusting snow off your account info…",
        "🧤 Untangling ski poles…",
    ],
    entitlements: [
        "Reloading resort magic…",
        "Our squirrels are reviewing your lift pass…",
        "Confirming your favorite ski lodge still exists…",
        "🥶 Defrosting your trail mix…",
    ],
};

function randomMessage(phase: "bootstrapping" | "entitlements") {
    const options = funMessages[phase];
    return options[Math.floor(Math.random() * options.length)];
}

function Bootstrapper({ onDone }: { onDone: () => void }) {
    const { refreshServerEntitlements } = useSubscription();

    useEffect(() => {
        (async () => {
            try {
                await refreshServerEntitlements();
            } finally {
                onDone();
            }
        })();
    }, [refreshServerEntitlements, onDone]);

    return null;
}

function ThemedStatusBar() {
    const { colors, dark } = useTheme();
    return (
        <StatusBar
            style={dark ? "light" : "dark"}
            backgroundColor={colors.background}
            animated
        />
    );
}

export default function RootLayout() {
    const { orbitronAvailable } = useOrbitronFont();
    const [authReady, setAuthReady] = useState(false);
    const [entsReady, setEntsReady] = useState(false);
    const [loadingStage, setLoadingStage] =
        useState<"bootstrapping" | "entitlements" | null>("bootstrapping");

    const loadingMessage =
        loadingStage === "entitlements"
            ? randomMessage("entitlements")
            : randomMessage("bootstrapping");

    const loadingProgress = loadingStage === "entitlements" ? 0.9 : 0.3;
    const [updateRequired, setUpdateRequired] = useState<null | any>(null);


    // Android nav bar styling
    useEffect(() => {
        const bg = Platform.OS === "android" && Platform.Version < 26 ? "#f2f2f2" : "#ffffff";
        if (Platform.OS === "android") {
            NavigationBar.setBackgroundColorAsync(bg).then();
            if (Number(Platform.Version) >= 26) NavigationBar.setButtonStyleAsync("dark").then();
        }
    }, []);

    async function runUpdateGate() {
        try {
            await apiAuth.get("version-check");
        } catch (err: any) {
            if (err?.forceUpdate) {
                setUpdateRequired(err.forceUpdate);
            } else {
                console.error("Unexpected error during update check", err);
            }
        }
    }

    // Bootstrap auth + version check
    useEffect(() => {
        (async () => {
            try {
                setLoadingStage("bootstrapping");
                await bootstrapAuth();
                await runUpdateGate();
                setAuthReady(true);
            } catch (e) {
                console.error("❌ bootstrapAuth failed:", e);
            }
        })();
    }, [orbitronAvailable]);

    // Hide splash when ready
    useEffect(() => {
        if (authReady) SplashScreen.hideAsync().catch(() => {});
    }, [authReady]);

    if (updateRequired) {
        return <UpdateRequiredScreen payload={updateRequired} />;
    }

    if (!authReady) {
        return (
            <BrandedLoader
                message={randomMessage("bootstrapping")}
                progress={0.3}
            />
        );
    }

    return (
        <FontAvailabilityProvider orbitronAvailable={orbitronAvailable}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider value={LightNavTheme}>
                    <SubscriptionProvider>
                        {!entsReady && (
                            <BrandedLoader
                                message={loadingMessage}
                                progress={loadingProgress}
                            />
                        )}

                        {authReady && (
                            <Bootstrapper
                                onDone={() => {
                                    setLoadingStage("entitlements");
                                    setEntsReady(true);
                                }}
                            />
                        )}

                        {entsReady && (
                            <>
                                <ThemedStatusBar />
                                <Slot />
                            </>
                        )}
                    </SubscriptionProvider>
                </ThemeProvider>
            </GestureHandlerRootView>
        </FontAvailabilityProvider>
    );
}
