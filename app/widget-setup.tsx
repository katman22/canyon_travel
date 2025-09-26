import {
    View,
    Text,
    Platform,
    BackHandler,
    TouchableOpacity,
    SafeAreaView, ImageBackground, StyleSheet
} from 'react-native';
import {useRouter, useLocalSearchParams} from "expo-router";
import {saveWidgetResortForId} from "@/native/WidgetUpdater";
import {useSelectedResort} from '@/context/ResortContext';
import {Resort} from "@/constants/types";
import React, {useEffect, useState} from "react";
import {fetchResorts} from "@/hooks/UseRemoteService";
import BottomSheetList from "@/components/BottomSheetList";
import BrandedLoader from "@/components/BrandedLoader";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import { saveWidgetResortForIOS, reloadWidgetsIOS } from '@/native/WidgetUpdater.ios';

export default function WidgetSetupScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ widgetId?: string }>();
    const widgetId = Number(params.widgetId ?? NaN);

    const [allResorts, setAllResorts] = useState<Resort[]>([]);
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors as any);
    const pageBackground = colors.background;
    const {resort, refreshing, selectResort, refreshResorts} = useSelectedResort();

    useEffect(() => {
        let isMounted = true;           // prevent setState after unmount
        (async () => {
            try {
                setLoading(true);
                const resp = await fetchResorts();
                if (isMounted) setAllResorts(resp?.resorts ?? []);
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []); // ← run once

    const onSelectForWidget = async (resort: Resort) => {
        if (Platform.OS === 'ios') {
            saveWidgetResortForIOS(String(resort.resort_id));
            reloadWidgetsIOS();
            await selectResort(resort);
        } else {
                if (Number.isFinite(widgetId)){
            await saveWidgetResortForId(widgetId, String(resort.resort_id));
            await selectResort(resort);}
        }
        if (router.canGoBack()) {
            router.back();
            return;
        }
        if (Platform.OS === 'android') {
            BackHandler.exitApp();
            return;
        }
        // router.replace('/'); // optional iOS fallback
    };

    const handleResortSelection = async () => {
        if (resort) {
            await selectResort(resort);
            router.replace('/tabs/to_resort');
        } else {
            router.replace('/tabs/locations');
        }
    };
    const renderLink = (resort: Resort) => {
        if (!resort) return null;
        return (
            <TouchableOpacity
                onPress={() => handleResortSelection()}
                style={{
                    padding: 12,
                    marginVertical: 8,
                    backgroundColor: '#000',
                    borderRadius: 6,
                }}
            >
                <Text style={{color: '#fff', fontWeight: '600'}}>Visit {resort?.resort_name}</Text>
            </TouchableOpacity>
        );
    };
    const renderItem = ({item}: { item: Resort | null }) => {
        if (!item) return null;
        const isSelected = resort?.resort_id === item.resort_id;
        return (
            <TouchableOpacity
                onPress={() => onSelectForWidget(item)}
                style={{
                    padding: 12,
                    marginVertical: 8,
                    backgroundColor: isSelected ? '#2E7D32' : '#4285F4',
                    borderRadius: 6,
                }}
            >
                <Text style={{color: '#fff', fontWeight: '600'}}>{item.resort_name}</Text>
                <Text style={{color: '#fff', opacity: 0.9}}>{item.location}</Text>
            </TouchableOpacity>
        );
    };

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
                <BrandedLoader message="Loading resorts…"/>
            </SafeAreaView>
        );
    }
    const linkEl = resort ? renderLink(resort) : undefined;

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: pageBackground}}>
            <ImageBackground
                source={require('@/assets/canyon_travellers_v6.png')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: 0.75}}
            />

            <BottomSheetList<Resort>
                data={(allResorts ?? []).filter(Boolean)}
                keyExtractor={(item, index) => (item?.resort_id ? String(item.resort_id) : `__idx_${index}`)}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={refreshResorts}
                empty={
                    <TouchableOpacity onPress={refreshResorts} style={{paddingVertical: 12}}>
                        <Text style={{color: colors.text}}>
                            No Resorts are currently available, please refresh to check.
                        </Text>
                    </TouchableOpacity>
                }
                lightModeBackground="#8ec88e"
                contentContainerStyle={styles.cameraContainer}
                snapPoints={['30%', '90%']} // optional, default matches this
                topAccessory={linkEl}
            />


        </SafeAreaView>
    );
}
