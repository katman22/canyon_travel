import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useTheme} from "@react-navigation/native";
import mobileAds from 'react-native-google-mobile-ads';

export default function TabLayout() {
    const { colors } = useTheme();
    const ads = mobileAds();

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'index') iconName = 'home';
                    else if (route.name === 'settings') iconName = 'settings';
                    else iconName = 'information-circle';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tabs.Screen
                name="to_resort"
                options={{
                    title: 'Home',
                    tabBarIcon: () => (
                        <FontAwesome5 name="skiing" size={18} color={colors.text} />
                    ),
                }}
                />
            <Tabs.Screen
                name="cameras"
                options={{
                    title: 'Cameras',
                    tabBarIcon: () => (
                        <AntDesign name="camera" size={18} color={colors.text} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts_events"
                options={{
                    title: 'Alerts',
                    tabBarIcon: () => (
                        <MaterialIcons name="taxi-alert" size={18} color={colors.text} />
                    ),
                }}
            />
            <Tabs.Screen
            name="weather"
            options={{
                title: 'Weather',
                tabBarIcon: () => (
                    <MaterialCommunityIcons name="weather-lightning-rainy" size={18} color={colors.text} />
                ),
            }}
            />
            <Tabs.Screen
                name="parking"
                options={{
                    title: 'Activities',
                    tabBarIcon: () => (
                        <AntDesign name="infocirlce" size={18} color={colors.text} />
                    ),
                }}
            />
            <Tabs.Screen
                name="locations"
                options={{
                    title: 'Resorts',
                    tabBarIcon: () => (
                        <MaterialCommunityIcons name="home-search-outline" size={18} color={colors.text} />
                    ),
                }}
            />
        </Tabs>
    );
}
