import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Foundation from '@expo/vector-icons/Foundation';

export default function TabLayout() {
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
                    title: 'Resort',
                    tabBarIcon: () => (
                        <FontAwesome5 name="skiing" size={12} color="black" />
                    ),
                }}
                />
            <Tabs.Screen
                name="cameras"
                options={{
                    title: 'UDot Cameras',
                    tabBarIcon: () => (
                        <AntDesign name="camera" size={12} color="black" />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts_events"
                options={{
                    title: 'Travel Alerts',
                    tabBarIcon: () => (
                        <MaterialIcons name="taxi-alert" size={12} color="black" />
                    ),
                }}
            />
            <Tabs.Screen
                name="locations"
                options={{
                    title: 'Locations',
                    tabBarIcon: () => (
                        <Foundation name="target" size={12} color="black" />
                    ),
                }}
            />
        </Tabs>
    );
}
