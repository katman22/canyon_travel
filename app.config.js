// app.config.js
import 'dotenv/config';

export default {
    expo: {
        name: "Canyon Traveller",
        slug: 'canyon_travel',
        scheme: 'canyontravel',
        version: "3",
        orientation: 'default',
        icon: './assets/canyon_travellers_v4.png',
        userInterfaceStyle: 'light',
        newArchEnabled: false,
        splash: {
            image: "./assets/canyon_travellers_v4.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
            dark: {
                image: './assets/canyon_travellers_v4.png',
                resizeMode: 'contain',
                backgroundColor: '#000000'
            }
        },
        ios: {
            supportsTablet: false,
            bundleIdentifier: "com.wharepumanawa.canyontravel",
            userInterfaceStyle: 'light',
            buildNumber: "4",
            config: {
                googleMapsApiKey: "AIzaSyBifu6VZKsaLr03cGLKt6sfsQEHpPnU_nU"
            },
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "Canyon Traveler uses your location to show local weather, canyon traffic times, and resort travel data.",
                NSAppTransportSecurity: {
                    NSAllowsArbitraryLoads: true,
                    NSExceptionDomains: {
                        "localhost": {NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
                            NSTemporaryExceptionAllowsInsecureHTTPLoads_TransferOnly: true
                        },
                        "192.168.11.61": {NSTemporaryExceptionAllowsInsecureHTTPLoads: true}
                    }
                }
            }
        },
        android: {
            icon: "./assets/canyon_travellers_v4.png",
            adaptiveIcon: {
                foregroundImage: "./assets/canyon_travellers_v4.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            userInterfaceStyle: 'light',
            package: "com.wharepumanawa.canyon_travel",
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY
                }
            },
            permissions: [
                "com.google.android.gms.permission.AD_ID"
            ]
        },
        web: {
            favicon: "./assets/canyon_travellers_v4.png"
        },
        plugins: [
            "expo-router", "expo-font", "expo-asset",
            [
                "react-native-google-mobile-ads",
                {
                    androidAppId: "ca-app-pub-6336863096491370~8630432238",
                    iosAppId:    "ca-app-pub-6336863096491370~8008481671",
                }
            ]
        ],
        extra: {
            router: {},
            eas: {
                projectId: "2d0b1c29-5c9b-441e-98f0-2da0618edaea"
            },
            reactNativeGoogleMobileAds: {
                android_app_id: "ca-app-pub-6336863096491370~8630432238",
                ios_app_id: "ca-app-pub-6336863096491370~8008481671"
            },
            apiUrl: process.env.API_URL ?? "https://pumanawa-kam.onrender.com/api/v1/",
            apiJwtToken: process.env.API_JWT_TOKEN,
            easSkipAutoFingerprint: 1
        }
    }
};
