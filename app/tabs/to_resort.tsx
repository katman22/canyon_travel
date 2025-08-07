import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

export default function TestBottomSheetScreen() {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    return (
        <View style={{ flex: 1, backgroundColor: 'skyblue' }}>
            <BottomSheet
                ref={sheetRef}
                index={1}
                style={{ zIndex: 99}}
                snapPoints={snapPoints}
                enablePanDownToClose={false}
                handleIndicatorStyle={{ backgroundColor: 'black', width: 60 }}
                backgroundStyle={{ backgroundColor: 'white' }}
            >
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Text style={{ fontSize: 30, backgroundColor: 'red' }}>🔥 SHEET WORKS 🔥</Text>
                    <Text style={{ fontSize: 20 }}>If you see this, it’s rendering correctly.</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                    <Text style={{ fontSize: 18 }}>Keep scrolling...</Text>
                </ScrollView>
            </BottomSheet>
        </View>
    );
}
