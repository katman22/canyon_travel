// app/index.tsx :Note we use this view
// as the FIRST page in the app. After a
// Resort is selected we can then on next load
// redirect to the stored last viewed resort.
import * as React from 'react';
import {
    Text,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useSelectedResort } from '@/context/ResortContext';
import { Resort } from '@/constants/types';
import getStyles from '@/assets/styles/styles';
import BottomSheetList from '@/components/BottomSheetList';
import {useTheme} from "@react-navigation/native";
import BrandedLoader from "@/components/BrandedLoader";

export default function IndexScreen() {
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    const { resort, allResorts, loading, refreshing, refreshResorts, handleResortSelection} = useSelectedResort();
    const pageBackground = colors.background;

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
                <BrandedLoader message="Loading resorts…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: pageBackground }}>
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
                            No Resorts are currently available, please refresh to check.
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
