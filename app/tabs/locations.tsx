// app/(whatever)/LocationsScreen.tsx
import * as React from 'react';
import {
    Text,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { useSelectedResort } from '@/context/ResortContext';
import { Resort } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import getStyles from '@/assets/styles/styles';
import BottomSheetList from '@/components/BottomSheetList';
import BrandedLoader from '@/components/BrandedLoader';


export default function LocationsScreen() {
    const { resort, allResorts, loading, refreshing, refreshResorts, handleResortSelection } = useSelectedResort();
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    const renderItem = ({ item }: { item: Resort | null }) => {
        if (!item) return null;
        const isSelected = resort?.resort_id === item.resort_id;
        return (
            <TouchableOpacity
                onPress={() => handleResortSelection(item)}
                style={{
                    padding: 12,
                    marginVertical: 8,
                    backgroundColor: isSelected ? '#2E7D32' : '#4285F4',
                    borderRadius: 6,
                }}
            >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{item.resort_name}</Text>
                <Text style={{ color: '#fff', opacity: 0.9 }}>{item.location}</Text>
            </TouchableOpacity>
        );
    };

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <BrandedLoader message="Loading reeeeesorts…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ImageBackground
                source={require('@/assets/canyon_travellers_v6.png')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.75 }}
            />
            <BottomSheetList<Resort>
                data={(allResorts ?? []).filter(Boolean)}
                keyExtractor={(item, index) => (item?.resort_id ? String(item.resort_id) : `__idx_${index}`)}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={refreshResorts}
                empty={
                    <TouchableOpacity onPress={refreshResorts} style={{ paddingVertical: 12 }}>
                        <Text style={{ color: colors.text }}>
                            No Resort Information is currently available, please refresh to check.
                        </Text>
                    </TouchableOpacity>
                }
                lightModeBackground="#8ec88e"
                contentContainerStyle={styles.cameraContainer}
                snapPoints={['30%', '90%']} // optional, default matches this
            />
        </SafeAreaView>
    );
}
