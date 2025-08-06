import {Slot} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {ResortProvider} from '@/context/ResortContext';

export default function RootLayout() {
    return (
        <ResortProvider>
            <SafeAreaView style={{flex: 1}}>
                <StatusBar style="light"/>
                <Slot/>
            </SafeAreaView>
        </ResortProvider>
    );
}