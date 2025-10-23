import { Tabs } from 'expo-router';
import { Image, StyleSheet } from "react-native";
export default function TabLayout() {
    const styles = StyleSheet.create({
        icon: {
            // If you DON'T want the icon tinted by theme, remove tintColor above
            // and set a fixed opacity here instead.
        },
    });

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#111',   // ensure contrast
                tabBarInactiveTintColor: '#777',
            }}
        >
            <Tabs.Screen
                name="to_resort"
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/home_resort.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="cameras"
                options={{
                    title: "Cameras",
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/camera.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts_events"
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/alerts.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="weather"
                options={{
                    title: "Weather",
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/weather_tab.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="parking"
                options={{
                    title: "Activities",
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/activity.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="locations"
                options={{
                    title: "Resorts",
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                    tabBarIcon: ({ focused, size }) => (
                        <Image
                            source={require("@/assets/resorts_home.png")} // ← your PNG
                            style={[
                                styles.icon,
                                { width: size ?? 20, height: size ?? 20, opacity: focused ? 1 : 0.7 },
                            ]}
                            resizeMode="contain"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="rc_subscriptions"
                options={{ href: null, headerShown: false }}
            />
            <Tabs.Screen
                name="settings"
                options={{ href: null, headerShown: false }}
            />
        </Tabs>

    );
}
