import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@react-navigation/native';
import getStyles from '@/assets/styles/styles';

const YouTubeTile = ({
                         title,
                         streamId,
                         description,
                     }: {
    title: string;
    streamId: string;        // YouTube video id like "4a-3iEM7bHk"
    description?: string;
}) => {
    const h = Dimensions.get('window').width * 0.5625; // 16:9
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    // Use nocookie + a minimal param set; add modestbranding and rel=0
    const url = useMemo(() => (
        `https://www.youtube-nocookie.com/embed/${streamId}` +
        `?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
    ), [streamId]);

    return (
        <View style={styles.tile}>
            <Text style={styles.title}>{title}</Text>
            {!!description && <Text style={styles.description}>{description}</Text>}
            <WebView
                source={{ uri: url }}
                style={{ height: h, width: '100%', borderRadius: 10, overflow: 'hidden' }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
                // Keep only YouTube domains inside the WebView
                onShouldStartLoadWithRequest={(req) => {
                    const u = req.url || '';
                    return (
                        u.startsWith('about:blank') ||
                        u.includes('youtube.com') ||
                        u.includes('youtube-nocookie.com') ||
                        u.includes('ytimg.com') ||
                        u.includes('googleusercontent.com')
                    );
                }}
            />
        </View>
    );
};

export default YouTubeTile;
