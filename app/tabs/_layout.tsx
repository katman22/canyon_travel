import React, {useContext} from 'react';
import {Platform} from 'react-native';
import {LatLongContext} from "@/components/LatLongContext";
import {useRouter, Tabs} from 'expo-router';
import {HapticTab} from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import {Colors} from '@/constants/Colors';
import {useColorScheme} from '@/hooks/useColorScheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const { lat, long, forecast_locale} = useContext(LatLongContext);

    return (
            <Tabs
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    tabBarButton: HapticTab,
                    tabBarBackground: TabBarBackground,
                    tabBarStyle: [
                        Platform.select({
                            ios: {
                                position: 'absolute',
                            },
                            default: {},
                        }),
                        // 👇 Conditionally hide tab bar on specific screens
                        route.name === 'period-forecast' && { display: 'none' },
                    ],
                })}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarStyle: {display: 'none'},
                        tabBarIcon: () => <MaterialCommunityIcons name="weather-sunny" size={24} color="black"/>
                    }}
                />
                <Tabs.Screen
                    name="period-forecast"
                    options={{
                        href: null,
                        // tabBarButton: () => null, // This also ensures no space is reserved
                        headerShown: false,
                    }}
                />
                <Tabs.Screen
                    name="full-forecast"
                    options={{
                        title: 'Full Forecast',
                        tabBarIcon: () => <MaterialCommunityIcons name="weather-partly-cloudy" size={24}
                                                                  color="black"/>,
                    }}
                    listeners={{
                    tabPress: (e) => {
                        e.preventDefault();

                        if (lat && long) {
                            router.push({
                                pathname: '/full-forecast',
                                params: {
                                    lat: lat.toString(),
                                    long: long.toString(),
                                    forecast_locale: forecast_locale.toString()
                                },
                            });
                        } else {
                            console.log('Lat/Long not available');
                        }
                    },
                }}
                />
                <Tabs.Screen
                    name="satellite"
                    options={{
                        title: 'Satellite',
                        tabBarIcon: () => (
                            <MaterialCommunityIcons name="satellite-uplink" size={24} color="black"/>
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();

                            if (lat && long) {
                                router.push({
                                    pathname: '/satellite',
                                    params: {
                                        lat: lat.toString(),
                                        long: long.toString(),
                                        forecast_locale: forecast_locale.toString()
                                    },
                                });
                            } else {
                                console.log('Lat/Long not available');
                            }
                        },
                    }}
                />
                <Tabs.Screen
                    name="radar"
                    options={{
                        href: null,
                        // tabBarButton: () => null, // This also ensures no space is reserved
                        headerShown: false,
                    }}
                />
            </Tabs>
    );
}
