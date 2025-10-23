import React, {memo, useMemo} from "react";
import {
    Image,
    ImageSourcePropType,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
    Platform,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {router, useRouter} from "expo-router";
import getStyles from "@/assets/styles/styles";
import {useTheme} from "@react-navigation/native";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type Props = {
    /** Which corner to pin to (default: "top-left") */
    position?: Corner;
    /** Pixel offset from edges, safe-area included (default: 12) */
    offset?: number;
    /** Size of the icon in px (default: 22) */
    size?: number;
    /** If provided, pressing will push to this route */
    route?: string;
    /** Custom press handler (runs after route push if both provided) */
    onPress?: () => void;
    /** Custom icon source (default: settings.png) */
    iconSource?: ImageSourcePropType;
    /** Make inner card translucent (default: true) */
    translucent?: boolean;
    /** Extra style for the outer container (rarely needed) */
    style?: StyleProp<ViewStyle>;
    /** Accessibility label (default: "Open settings") */
    accessibilityLabel?: string;
};

const FloatingSettingsButton = memo(({
                                     }: Props) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {colors} = useTheme();
    const styles = getStyles(colors);


    const handlePress = () => {
        router.push("/tabs/settings");
    };

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                onPress={handlePress}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                    styles.fab,
                    { top: insets.top + 8, left: 12 },
                ]}
            >
                <Image
                    source={require("@/assets/settings.png")}
                    style={styles.fabIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
});

export default FloatingSettingsButton;

