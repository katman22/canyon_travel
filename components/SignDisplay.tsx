import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFontAvailability } from '@/context/FontAvailability';
import type { Sign } from '@/constants/types';

type Props = {
    signs: Sign[];
    isSubscribed: boolean;
    onPressSubscribe: () => void;
};

const SignDisplay: React.FC<Props> = ({ signs, isSubscribed, onPressSubscribe }) => {
    const { orbitronAvailable } = useFontAvailability();

    if (!signs || signs.length === 0) {
        return <Text style={styles.noSignsText}>No signs available.</Text>;
    }

    // FREE → only first sign
    const signsToShow = isSubscribed ? signs : signs.slice(0, 1);

    return (
        <View style={styles.container}>
            {signsToShow.map((sign) => (
                <View key={sign.Id} style={styles.signCard}>
                    <Text style={styles.signTitle}>{sign.Name}</Text>

                    {!!sign.DirectionOfTravel && (
                        <Text style={styles.direction}>
                            Direction: {sign.DirectionOfTravel}
                        </Text>
                    )}

                    <View style={styles.messageContainer}>
                        {(sign.Messages?.length ? sign.Messages : ['NO MESSAGE']).map(
                            (msg, idx) => (
                                <Text
                                    key={idx}
                                    style={[
                                        styles.orbitronMessageBase,
                                        orbitronAvailable && styles.orbitronFamily,
                                    ]}
                                >
                                    {msg}
                                </Text>
                            )
                        )}
                    </View>
                </View>
            ))}

            {/* CTA block for FREE tier */}
            {!isSubscribed && signs.length > 1 && (
                <TouchableOpacity style={styles.ctaCard} onPress={onPressSubscribe}>
                    <Text style={styles.ctaText}>
                        More signs available with subscription →
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 10, paddingHorizontal: 0 },

    signCard: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 6,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    signTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#222' },
    direction: { fontSize: 14, marginBottom: 8, color: '#666' },

    messageContainer: { paddingTop: 4, paddingBottom: 8 },
    orbitronMessageBase: { fontSize: 20, color: '#000' },
    orbitronFamily: { fontFamily: 'Orbitron' },

    noSignsText: { fontStyle: 'italic', textAlign: 'center', color: '#000' },

    ctaCard: {
        marginTop: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#def4e8',
        borderWidth: 1,
        borderColor: '#7bbfa1',
    },
    ctaText: {
        fontWeight: '600',
        textAlign: 'center',
        color: '#3a7f5b',
        fontSize: 14,
    },
});

export default SignDisplay;
