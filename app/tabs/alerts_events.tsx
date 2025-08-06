import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Image} from 'react-native';
import getStyles from '@/assets/styles/styles';
import {useTheme} from "@react-navigation/native";
import {fetchAlertsEvents} from "@/hooks/UseRemoteService";
import {useSelectedResort} from "@/context/ResortContext"
import {AlertEventResponse, AlertsEvents} from "@/constants/types";

export default function Cameras() {
    const [loading, setLoading] = useState(false);
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const {resort, loading: resortLoading} = useSelectedResort();
    const [alertsEvents, setAlertsEvents] = useState<AlertsEvents | null>(null);
    const fetchAlertsAndEvents = async () => {
        if (!resort) {
            console.warn("No resort selected. Skipping fetch.");
            return;
        }

        setLoading(true);

        try {
            const alertsEventsResponse = await fetchAlertsEvents(resort);
            setAlertsEvents(alertsEventsResponse.alerts_events);
        } catch (err) {
            console.error("Error fetching directions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resortLoading && resort) {
            fetchAlertsAndEvents();
        }
    }, [resortLoading, resort]);


    if (loading) {
        return <ActivityIndicator size="large" color="#000" style={styles.topLoading}/>;
    }
    if (resortLoading) {
        return <ActivityIndicator/>;
    }
    return (
        <ScrollView contentContainerStyle={styles.cameraContainer}>
            <Text style={styles.panelHeader}>{resort && resort.name}</Text>
            <TouchableOpacity onPress={fetchAlertsAndEvents} style={styles.refreshButton}>
                <Text style={styles.refreshText}>🔄 Refresh</Text>
            </TouchableOpacity>

            <View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                        {alertsEvents && alertsEvents.summary}
                    </Text>
                </View>
                {alertsEvents && alertsEvents.alerts.length > 0 ? (
                    <View style={styles.alertSection}>
                        {alertsEvents.alerts.map((alert, idx) => (
                            <Text key={idx} style={styles.alertText}>
                                ⚠️ {alert.title}
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noAlertText}>✅ No alerts reported.</Text>
                )}
                <View style={styles.conditionsSection}>
                    {alertsEvents && alertsEvents.conditions.map((cond) => (
                        <View key={cond.Id} style={styles.conditionCard}>
                            <Text style={styles.roadName}>{cond.RoadwayName}</Text>
                            <Text style={styles.conditionText}>Road: {cond.RoadCondition}</Text>
                            <Text style={styles.conditionText}>Weather: {cond.WeatherCondition}</Text>
                            <Text style={styles.conditionText}>Restriction: {cond.Restriction}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.eventSection}>
                    {alertsEvents && alertsEvents.events.map((event, index) => (
                        <View key={index} style={styles.eventCard}>
                            <Text style={styles.eventHeader}>
                                🚧 {event.EventCategory} — {event.Location}
                            </Text>
                            <Text style={styles.eventDescription}>{event.Description}</Text>
                            <Text style={styles.eventComment}>{event.Comment}</Text>
                            <Text style={styles.eventMeta}>
                                MP: {event.MPStart} to {event.MPEnd}
                            </Text>
                            {event.IsFullClosure && (
                                <Text style={styles.closure}>🚫 Full road closure in effect</Text>
                            )}
                        </View>
                    ))}
                </View>

            </View>
        </ScrollView>
    );

}
