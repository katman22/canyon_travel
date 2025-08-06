import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSelectedResort } from '@/context/ResortContext';
import { useRouter } from 'expo-router';
import {ResortId} from "@/context/ResortListContext";

export default function WidgetSetupScreen() {
    const { selectResort, allResorts } = useSelectedResort();
    const router = useRouter();

    const handleSelect = async (resortId: ResortId) => {
        await selectResort(resortId);

        // Optional: notify native module
        // NativeModules.WidgetUpdater?.updateWidgets?.();

        // Return to main app or exit
        router.replace('/tabs');
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Select a resort for your widget</Text>
            <FlatList
                data={allResorts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleSelect(item.id)}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}