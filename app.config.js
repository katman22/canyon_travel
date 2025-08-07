import 'dotenv/config';

export default {
    expo: {
        name: "Canyon Traveller",
        slug: "canyon_travel",
        scheme: "canyontravel",
        version: "1.0.0",
        // orientation: "portrait",
        // icon: "./assets/canyon_travellers_v4.png",
        // userInterfaceStyle: "light",
        newArchEnabled: false,
        // splash: {
        //     image: "./assets/canyon_travellers_v4.png",
        //     resizeMode: "contain",
        //     backgroundColor: "#ffffff"
        // },
        // ios: {
        //     supportsTablet: false,
        //     bundleIdentifier: "com.wharepumanawa.canyontravel"
        // },
        // android: {
        //     icon: "./assets/canyon_travellers_v4.png",
        //     adaptiveIcon: {
        //         foregroundImage: "./assets/canyon_travellers_v4.png",
        //         backgroundColor: "#ffffff"
        //     },
        //     edgeToEdgeEnabled: false,
        //     package: "com.wharepumanawa.canyon_travel",
        //     config: {
        //         googleMaps: {
        //             apiKey: 'AIzaSyALGiMGxmRvVA84ADB7GqQKzqPpQ7S6Pzc'
        //         }
        //     }
        // },
        // web: {
        //     favicon: "./assets/canyon_travellers_v4.png"
        // },
        plugins: [
            "expo-router",
            "react-native-reanimated/plugin"
        ],
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
