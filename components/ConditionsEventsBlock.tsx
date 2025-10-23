// components/ConditionsEventsBlock.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface RoadCondition {
    Id: string | number;
    RoadwayName: string;
    RoadCondition: string;
    WeatherCondition: string;
    Restriction: string;
}

export interface WeatherAlert {
    id?: string | number;
    title?: string;
    Description?: string;
}

export interface UdotEvent {
    RoadwayName: string;
    Organization: string;
    Description: string;
    Comment: string;
    IsFullClosure: boolean;
    EventCategory: string;
    Location: string;
    MPStart: string;
    MPEnd: string;
}

export interface AlertsEvents {
    conditions: RoadCondition[];
    events: UdotEvent[];
    alerts: WeatherAlert[];
    summary: string;
}

type Props = {
    data?: AlertsEvents | null;
    isSubscribed: boolean;
    showAll?: boolean;
    onPressSubscribe?: () => void;
    styles: any;
};

const ConditionsEventsBlock: React.FC<Props> = ({
                                                    data,
                                                    isSubscribed,
                                                    showAll = false,
                                                    onPressSubscribe,
                                                    styles,
                                                }) => {
    const allConditions = data?.conditions ?? [];
    const allEvents = data?.events ?? [];
    const allAlerts = data?.alerts ?? [];

    // Match your old inline behavior:
    // - Free: show exactly 1 condition (if any) + first event (if any)
    // - Sub:  show all OR just first, depending on showAll
    const visibleConditions = useMemo(() => {
        if (allConditions.length === 0) return [];
        if (isSubscribed) return showAll ? allConditions : allConditions.slice(0, 1);
        return allConditions.slice(0, 1);
    }, [allConditions, isSubscribed, showAll]);

    const visibleEventsOrAlerts = useMemo(() => {
        if (isSubscribed) {
            if (showAll) return [...allEvents, ...allAlerts];
            if (allEvents.length > 0) return [allEvents[0]];
            if (allAlerts.length > 0) return [allAlerts[0]];
            return [];
        } else {
            return allEvents.length > 0 ? [allEvents[0]] : [];
        }
    }, [allEvents, allAlerts, isSubscribed, showAll]);

    const moreExistsForFree =
        !isSubscribed &&
        (allConditions.length > visibleConditions.length ||
            allEvents.length > visibleEventsOrAlerts.length ||
            allAlerts.length > 0);

    return (
        <View
            style={[
                styles.conditionsSection,
                __DEV__ && { /* tiny debug frame so you see it while styling */
                    borderWidth: 0.5,
                    borderColor: "rgba(0,0,0,0.06)",
                },
            ]}
        >
            {/* Road Conditions */}
            <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5, marginTop: 10 }}>
                Road Conditions:
            </Text>

            {visibleConditions.length === 0 ? (
                <View style={styles.conditionCard}>
                    <Text style={styles.roadName}>No reported conditions</Text>
                </View>
            ) : (
                visibleConditions.map((cond) => (
                    <View key={String(cond.Id)} style={styles.conditionCard}>
                        <Text style={styles.roadName}>{cond.RoadwayName}</Text>
                        <Text style={styles.conditionText}>Road: {cond.RoadCondition}</Text>
                        <Text style={styles.conditionText}>Weather: {cond.WeatherCondition}</Text>
                        <Text style={styles.conditionText}>Restriction: {cond.Restriction}</Text>
                    </View>
                ))
            )}

            {moreExistsForFree && (
                <View style={styles.conditionCard}>
                    <Text style={styles.roadName}>See more with a subscription</Text>
                    <Text style={styles.conditionText}>
                        Full list of conditions, weather & restrictions
                    </Text>
                    {!!onPressSubscribe && (
                        <TouchableOpacity
                            onPress={onPressSubscribe}
                            accessibilityRole="button"
                            accessibilityLabel="Subscriptions"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={{ fontWeight: "bold", marginTop: 10, textDecorationLine: "underline" }}>
                                🔒 Subscribe for Alerts, Messages and more
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Events */}
            <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Events:</Text>

            {visibleEventsOrAlerts.length > 0 ? (
                <View key="event_holder" style={styles.eventCard}>
                    {"EventCategory" in visibleEventsOrAlerts[0] ? (
                        <>
                            <Text style={styles.eventHeader}>
                                🚧 {(visibleEventsOrAlerts[0] as UdotEvent).EventCategory}
                            </Text>
                            <Text style={styles.eventDescription}>
                                {(visibleEventsOrAlerts[0] as UdotEvent).Description}
                            </Text>
                            {!!(visibleEventsOrAlerts[0] as UdotEvent).Comment && (
                                <Text style={styles.eventComment}>
                                    {(visibleEventsOrAlerts[0] as UdotEvent).Comment}
                                </Text>
                            )}
                            <Text style={styles.eventMeta}>
                                {(visibleEventsOrAlerts[0] as UdotEvent).RoadwayName} •{" "}
                                {(visibleEventsOrAlerts[0] as UdotEvent).Location}
                                {(visibleEventsOrAlerts[0] as UdotEvent).MPStart
                                    ? ` • MP ${(visibleEventsOrAlerts[0] as UdotEvent).MPStart}`
                                    : ""}
                                {(visibleEventsOrAlerts[0] as UdotEvent).MPEnd
                                    ? `–${(visibleEventsOrAlerts[0] as UdotEvent).MPEnd}`
                                    : ""}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.eventHeader}>⚠️ Weather Alert</Text>
                            <Text style={styles.eventDescription}>
                                {(visibleEventsOrAlerts[0] as WeatherAlert).title ||
                                    (visibleEventsOrAlerts[0] as WeatherAlert).Description ||
                                    "Weather alert in effect"}
                            </Text>
                        </>
                    )}
                </View>
            ) : (
                isSubscribed ? (
                    <View style={styles.eventCard}>
                        <Text style={styles.eventHeader}>No current events</Text>
                        <Text style={styles.eventDescription}>We’ll post updates as soon as they come in.</Text>
                    </View>
                ) : (
                    <View style={styles.eventCard}>
                        <Text style={styles.eventHeader}>🚧 Events available with subscription</Text>
                        <Text style={styles.eventDescription}>
                            Closures, construction, community events, overhead signs & more.
                        </Text>
                        {!!onPressSubscribe && (
                            <TouchableOpacity onPress={onPressSubscribe}>
                                <Text style={{ fontWeight: "bold", marginTop: 10, textDecorationLine: "underline" }}>
                                    🔒 Subscribe for all Events and Conditions
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )
            )}
        </View>
    );
};

export default ConditionsEventsBlock;
