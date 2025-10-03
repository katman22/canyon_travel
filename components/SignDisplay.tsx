import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFontAvailability } from '@/context/FontAvailability'; // or relative
import { Sign } from '@/constants/types';

const SignDisplay: React.FC<{ signs: Sign[] }> = ({ signs }) => {
    const { orbitronAvailable } = useFontAvailability();

    if (!signs || signs.length === 0) {
        return <Text style={styles.noSignsText}>No signs available.</Text>;
    }

    return (
        <View style={styles.container}>
            {signs.map((sign) => (
                <View key={sign.Id} style={styles.signCard}>
                    <Text style={styles.signTitle}>{sign.Name}</Text>
                    {!!sign.DirectionOfTravel && (
                        <Text style={styles.direction}>Direction: {sign.DirectionOfTravel}</Text>
                    )}
                    <View style={styles.messageContainer}>
                        {(sign.Messages?.length ? sign.Messages : ['NO MESSAGE']).map((msg, idx) => (
                            <Text
                                key={idx}
                                style={[
                                    styles.orbitronMessageBase,
                                    orbitronAvailable && styles.orbitronFamily, // apply only if loaded
                                ]}
                            >
                                {msg}
                            </Text>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 10, paddingHorizontal: 0 },
    signCard: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
        padding: 5, marginBottom: 15, backgroundColor: '#f9f9f9',
    },
    signTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#222' },
    direction: { fontSize: 14, marginBottom: 8, color: '#666' },
    messageContainer: { paddingTop: 4, paddingBottom: 8 },
    orbitronMessageBase: { fontSize: 20, color: '#000' },
    orbitronFamily: { fontFamily: 'Orbitron' },
    noSignsText: { fontStyle: 'italic', textAlign: 'center', color: '#000' },
});

export default SignDisplay;
