import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSelectedResort } from "@/context/ResortContext";

export default function ResortSelectorScreen() {
    const { allResorts, selectResort } = useSelectedResort();

    return (
        <View>
            <Text>Select Your Resort</Text>
            <FlatList
                data={allResorts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => selectResort(item.id)}>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
