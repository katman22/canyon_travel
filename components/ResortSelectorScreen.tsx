import React from "react";
import {View, Text, FlatList, TouchableOpacity} from "react-native";
import {useSelectedResort} from "@/context/ResortContext";
import {Resort} from "@/constants/types";
import {router} from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Props = {
    onSelectOverride?: (item: Resort) => Promise<void> | void;
    nextRouteOnSelect?: string | null; // default '/tabs/to_resort'
};


export default function ResortSelectorScreen({
                                                 onSelectOverride,
                                                 nextRouteOnSelect = '/tabs/to_resort',
                                             }: Props) {

    const {resort, allResorts, refreshing, selectResort, refreshResorts} = useSelectedResort();
    const handleSelect = async (item: Resort) => {
        await selectResort(item);
        if (onSelectOverride) return onSelectOverride(item);
        if (nextRouteOnSelect) router.replace(nextRouteOnSelect);
    };

    return (
        <View>
            <Text>Select Your Resort</Text>
            <FlatList
                data={(allResorts ?? []).filter(Boolean)} // 4) guard out nulls/undefined
                keyExtractor={(item, index) => item?.resort_id ? String(item.resort_id) : `__idx_${index}`} // 1) & fallback
                refreshing={refreshing}
                onRefresh={refreshResorts}
                renderItem={({item}) => {
                    if (!item) return null; // extra safety
                    const isSelected = resort?.resort_id === item.resort_id;
                    return (
                        <TouchableOpacity
                            key={String(item.resort_id)}   // add an explicit key on the root 3)
                            onPress={() => handleSelect(item)}
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
                }}
                ListEmptyComponent={
                    <View>
                        <Text>No resorts available yet. Pull to refresh to try again.</Text>
                        <TouchableOpacity onPress={refreshResorts}>
                            <MaterialIcons name="refresh" size={24} color="black"
                                           style={{marginLeft: 20, paddingTop: 0, marginBottom: -5}}/>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}
