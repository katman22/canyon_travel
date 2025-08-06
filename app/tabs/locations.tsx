import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSelectedResort } from '@/context/ResortContext';
import React from 'react';
import { useRouter } from 'expo-router';
import {ResortId} from "@/context/ResortListContext";

export default function LocationsScreen() {
    const { resort, selectResort, allResorts } = useSelectedResort();
    const router = useRouter();

    const handleSelect = async (resortId: ResortId) => {
        await selectResort(resortId);
        router.replace('/tabs/to_resort'); // Optionally redirect to map after selecting
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Choose Your Resort</Text>
            <FlatList
                data={allResorts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelect(item.id)}
                        style={{
                            padding: 12,
                            marginVertical: 8,
                            backgroundColor: item.id === resort?.id ? '#4285F4' : '#eee',
                            borderRadius: 6,
                        }}
                    >
                        <Text style={{ color: item.id === resort?.id ? '#fff' : '#000' }}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
