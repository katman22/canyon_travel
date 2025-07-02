import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import 'react-native-reanimated';
import {LatLongProvider} from '@/components/LatLongContext';
import { AppThemeProvider as CustomThemeProvider, useThemeToggle } from '@/components/ThemedContext';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!loaded) return null;

    return (
        <LatLongProvider>
            <CustomThemeProvider>
                <ThemedNavigationWrapper />
            </CustomThemeProvider>
        </LatLongProvider>
    );
}

const ThemedNavigationWrapper = () => {
    const { theme, currentTheme } = useThemeToggle();

    return (
        <NavigationThemeProvider value={theme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={['dark', 'clock', 'poppy'].includes(currentTheme) ? 'light' : 'dark'} />
        </NavigationThemeProvider>
    );
};