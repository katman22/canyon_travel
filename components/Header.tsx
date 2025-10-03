import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type {Theme} from '@react-navigation/native';

type Props = {
    message: string;
    resort?: string;
    onRefresh: () => void | Promise<void>;
    colors: Theme['colors'];
    style?: ViewStyle;
};

export default function SectionHeader({
                                          message,
                                          resort,
                                          onRefresh,
                                          colors,
                                          style
                                      }: Props) {
    return (
        <View style={[styles.container, {borderBottomColor: colors.border}, style]}>
            {/* Top row: Resort name + refresh at far right */}
            <View style={styles.topRow}>
                <Text
                    style={[styles.resortName, {color: colors.text}]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {resort}
                </Text>

                <TouchableOpacity
                    onPress={onRefresh}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh"
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={styles.refreshBtn}
                >
                    <MaterialIcons name="refresh" size={20} color={colors.text}/>
                </TouchableOpacity>
            </View>
            <Text style={[styles.message, {color: colors.text}]} numberOfLines={2}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 6,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resortName: {
        flex: 1,                 // <-- ensures icon stays at the end
        fontSize: 16,
        fontWeight: '700',
    },
    refreshBtn: {
        padding: 4,
    },
    message: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.9,
    },
});
