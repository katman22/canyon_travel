import {Slot} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {ResortProvider} from '@/context/ResortContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ResortProvider>
                <StatusBar style="light" />
                <Slot />
            </ResortProvider>
        </GestureHandlerRootView>
    );
}