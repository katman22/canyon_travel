import * as React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ViewStyle,
    StyleProp,
    ListRenderItem
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BannerHeaderAdIos from "@/components/BannerHeaderAd.ios";
import ResortTile from "@/components/ResortTile";
import type { Resort } from "@/constants/types";

type Props = {
    selectedResort?: Resort | null;
    otherResorts: Resort[];
    onPressSelected: () => void;
    onPressOther: (resort: Resort) => void;

    refreshing?: boolean;
    onRefresh?: () => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    snapPoints?: (string | number)[];
};

export default function WidgetResortBottomSheet({
                                                    selectedResort,
                                                    otherResorts,
                                                    onPressSelected,
                                                    onPressOther,
                                                    refreshing,
                                                    onRefresh,
                                                    contentContainerStyle,
                                                    snapPoints
                                                }: Props) {
    const { colors, dark } = useTheme();
    const insets = useSafeAreaInsets();
    const topInset = insets.top || StatusBar.currentHeight || 20;
    const bottomInset = insets.bottom ?? 0;

    const sheetRef = React.useRef<BottomSheet>(null);
    const [bannerH, setBannerH] = React.useState(0);

    const computedBackground = '#2E7D32';

    const finalSnap = React.useMemo(
        () => snapPoints ?? ["35%", "95%"],
        [snapPoints]
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={0}
            snapPoints={finalSnap}
            enablePanDownToClose={false}
            topInset={topInset}
            backgroundStyle={{ backgroundColor: computedBackground }}
            handleIndicatorStyle={{ backgroundColor: colors.border }}
        >
            <BottomSheetFlatList
                data={otherResorts}
                keyExtractor={(item) => String(item.resort_id)}
                refreshing={refreshing}
                onRefresh={onRefresh}
                contentContainerStyle={[
                    contentContainerStyle,
                    { paddingBottom: bannerH + bottomInset }
                ]}
                ListHeaderComponent={
                    <>
                        <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/3525040945"}/>

                        {selectedResort && (
                            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                                <Text
                                    style={{
                                        fontWeight: "700",
                                        fontSize: 16,
                                        marginBottom: 8,
                                        color: colors.text
                                    }}
                                >
                                    Current Widget Resort
                                </Text>

                                <ResortTile
                                    resort={selectedResort}
                                    isSelected={true}
                                    isLocked={false}
                                    onPress={onPressSelected}
                                />
                            </View>
                        )}

                        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
                            <Text
                                style={{
                                    fontWeight: "700",
                                    fontSize: 16,
                                    marginBottom: 6,
                                    color: colors.text
                                }}
                            >
                                Choose a Different Resort
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <ResortTile
                        resort={item}
                        isSelected={false}
                        isLocked={false}
                        onPress={() => onPressOther(item)}
                    />
                )}
                ListFooterComponent={
                    <View
                        onLayout={(e) => setBannerH(e.nativeEvent.layout.height)}
                    >
                        <BannerHeaderAdIos ios_id={"ca-app-pub-6336863096491370/4750492703"}/>
                    </View>
                }
            />
        </BottomSheet>
    );
}
