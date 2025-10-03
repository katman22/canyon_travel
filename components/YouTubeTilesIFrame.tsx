import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";

const YouTubeTileIFrame = ({ title, streamId, description }: {
    title: string;
    streamId: string;
    description?: string;
}) => {
    const videoHeight = Dimensions.get('window').width * 0.5625; // 16:9

    const {colors} = useTheme();
    const styles = getStyles(colors);
    return (
        <View style={styles.tile}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            <WebView
                source={{
                    uri: `https://www.youtube.com/embed/${streamId}?autoplay=1&mute=1&playsinline=1&rel=0&showinfo=0`,
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                allowsFullscreenVideo={true} // ✅ enables fullscreen on iOS
                mediaPlaybackRequiresUserAction={false}
                style={{ height: videoHeight, width: '100%', borderRadius: 10 }}
                originWhitelist={['*']}
                allowsBackForwardNavigationGestures={true}
                automaticallyAdjustContentInsets={false}
                useWebKit={true}
                // Fullscreen note: works by default on Android, enabled via `allowsFullscreenVideo` on iOS
            />
        </View>
    );
};

export default YouTubeTileIFrame;
