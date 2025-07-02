import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Slot />
        </SafeAreaView>
    );
}