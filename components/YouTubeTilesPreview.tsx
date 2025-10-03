// YouTubeTilePreview.tsx
import React, {useEffect, useMemo, useRef, useState, useCallback} from "react";
import {View, Text, Dimensions, TouchableOpacity, Linking} from "react-native";
import YoutubePlayer, {YoutubeIframeRef} from "react-native-youtube-iframe";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import {Ionicons} from "@expo/vector-icons";

type Props = {
    title: string;
    streamId: string;          // e.g. "4a-3iEM7bHk"
    description?: string;
    limitSeconds?: number;     // preview length, default 60
    index?: number;
};

export default function YouTubeTilePreview({
                                               title,
                                               streamId,
                                               description,
                                               limitSeconds = 60,
                                               index
                                           }: Props) {
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const height = Dimensions.get("window").width * 0.5625;

    // at top of component
    const playerRef = useRef<YoutubeIframeRef>(null);
    const [isPlaying, setPlaying] = useState(true);
    const [previewOver, setPreviewOver] = useState(false);

    const baseTRef = useRef<number | null>(null); // baseline at start
    const lastTRef = useRef(0);

// optional: reset baseline when the player is ready
    const onReady = useCallback(() => {
        baseTRef.current = 0;    // let the poll set it on first tick
        lastTRef.current = 0;
        setPlaying(true);
    }, []);

    useEffect(() => {
        // if (previewOver) return;

        const id: ReturnType<typeof setInterval> = setInterval(async () => {
            const tPromise = playerRef.current?.getCurrentTime?.();
            if (!tPromise) return;                 // ref/method not ready yet

            const t = await tPromise;              // number
            if (Number.isNaN(t)) return;

            // establish baseline (first valid tick)
            if (baseTRef.current == null) {
                baseTRef.current = t;
                lastTRef.current = t;
                return;
            }

            const elapsed = t - baseTRef.current;

            // Stop at limit → unmount the player
            if (elapsed >= limitSeconds) {
                clearInterval(id);
                setPlaying(false);
                setPreviewOver(true);
                return;
            }

            // Anti-seek (non-fullscreen best-effort)
            if (Math.abs(t - lastTRef.current) > 1.0) {
                await playerRef.current?.seekTo?.(lastTRef.current, true);
                return;
            }

            lastTRef.current = t;
        }, 250);

        return () => clearInterval(id);
    }, [limitSeconds, previewOver]);

// replay handler
    const handleReplay = useCallback(() => {
        console.log("handling replay");
        baseTRef.current = 0;     // rebase on next tick
        lastTRef.current = 0;
        setPreviewOver(false);       // remount player
        setPlaying(true);
    }, []);


    const header = useMemo(() => (
        <View style={{marginBottom: 8}}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
    ), [title, description, styles.title, styles.description]);

    if (previewOver) {
        // Overlay after 60s: no player mounted, so the user can’t continue playback here
        return (
            <View style={styles.tile}>
                {header}
                <View style={{
                    height,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    backgroundColor: "#000"
                }}>
                    <Text style={{color: "#fff", marginBottom: 12}}>Preview ended</Text>
                    <View style={{flexDirection: "row", gap: 12}}>
                        <Text  style={{color: "#fff"}}>Subby for more</Text>
                        <TouchableOpacity
                            onPress={() => { // optional: replay preview from the top
                                lastTRef.current = 0;
                                setPreviewOver(false);
                                setPlaying(true);
                            }}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#fff"
                            }}
                        >
                            <Text style={{color: "#fff"}}>Replay Preview</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.tile} key={index}>
            {header}
            <YoutubePlayer
                ref={playerRef}
                height={height}
                width="100%"
                videoId={streamId}
                play={isPlaying}
                mute
                forceAndroidAutoplay
                onReady={onReady}
                onChangeState={(state: string) => setPlaying(state === "playing")}
                initialPlayerParams={{
                    controls: true, modestbranding: true, rel: false, playsinline: true,
                }}
            />

            {/* Overlay after preview */}
            {previewOver && (
                <View /* your overlay */>
                    <Text>DDD for more</Text>
                    <TouchableOpacity onPress={handleReplay}>
                        <Text>Replay</Text>
                    </TouchableOpacity>
                </View>
            )}


        </View>
    );
}
