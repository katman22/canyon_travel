import 'dotenv/config';

export default {
    expo: {
        name: "canyon_travel",
        slug: "canyon_travel",
        scheme: "canyontravel",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: false,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: false,
            bundleIdentifier: "com.wharepumanawa.canyontravel"
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: false,
            package: "com.wharepumanawa.canyon_travel",
            config: {
                googleMaps: {
                    apiKey: 'AIzaSyALGiMGxmRvVA84ADB7GqQKzqPpQ7S6Pzc'
                }
            }
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: ["expo-router"],
        extra: {
            router: {},
            eas: {
                projectId: "2d0b1c29-5c9b-441e-98f0-2da0618edaea"
            },
            apiUrl: 'http://192.168.11.60:3000/api/v1',
            apiJwtToken: 'eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJtb2JpbGUiLCJleHAiOjIwNjIyODY1MzZ9.SeN6BWPJtm-_dADD37jqFKWoVkgjq_bnwbDWza-JEdc',
            easSkipAutoFingerprint: 1
        }
    }
};
