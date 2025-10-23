// components/ForecastSummary.tsx
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import PinchToZoomText from "@/components/PinchToZoomText";

type Props = {
    text?: string | null;
    isSubscribed: boolean;
    maxChars?: number;
    maxSentences?: number;
    onPressSubscribe?: () => void;
    onZoomStart?: () => void;
    onZoomEnd?: () => void;
    onPressSeeMore?: () => void;
};

function splitSentences(s: string): string[] {
    return s.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]?/g) ?? [s];
}

function makePreview(text: string, maxChars: number, maxSentences: number) {
    const sentences = splitSentences(text);
    let candidate = sentences.slice(0, maxSentences).join(" ").trim();
    if (!candidate) candidate = text;
    if (candidate.length > maxChars) {
        candidate = candidate.slice(0, maxChars).replace(/\s+\S*$/, "").trim();
    }
    const wasTruncated = candidate.length < text.length;
    return { preview: wasTruncated ? candidate + "…" : candidate, wasTruncated };
}

export default function ForecastSummary({
                                            text,
                                            isSubscribed,
                                            maxChars = 240,
                                            maxSentences = 2,
                                            onPressSubscribe,
                                            onZoomStart,
                                            onZoomEnd,
                                            onPressSeeMore,
                                        }: Props) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!text) {
        return <Text style={styles.infoText}>Forecast not available.</Text>;
    }

    // IMPORTANT: run this once, unconditionally
    const { preview, wasTruncated } = useMemo(
        () => makePreview(text, maxChars, maxSentences),
        [text, maxChars, maxSentences]
    );

    return (
        <View style={styles.weatherCard}>
            <Text style={styles.panelSubtext}>Forecast:</Text>
            <View style={{ gap: 6 }}>
                <PinchToZoomText
                    baseSize={styles.infoText.fontSize ?? 16}
                    onGestureStart={onZoomStart}
                    onGestureEnd={onZoomEnd}
                    style={styles.infoText}
                >
                    {preview}
                </PinchToZoomText>

                {isSubscribed ? (
                    wasTruncated && (
                        <TouchableOpacity onPress={onPressSeeMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={[styles.infoText, { color: colors.primary, fontWeight: "600" }]}>
                                See full forecast
                            </Text>
                        </TouchableOpacity>
                    )
                ) : (
                    wasTruncated && (
                        <TouchableOpacity
                            onPress={onPressSubscribe}
                            accessibilityRole="button"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={[styles.infoText, { color: colors.primary, fontWeight: "600" }]}>
                                Subscribe for full forecast
                            </Text>
                        </TouchableOpacity>
                    )
                )}
            </View>
        </View>
    );
}
