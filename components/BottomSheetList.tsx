// components/BottomSheetList.tsx
import * as React from 'react';
import {
    ViewStyle,
    StyleProp,
    ListRenderItem,
    View,
    Text,
    TouchableOpacity,
    StatusBar, Image,
} from 'react-native';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {useTheme} from '@react-navigation/native';
import type {ComponentType, ReactElement, ReactNode} from 'react';
import {useSelectedResort} from '@/context/ResortContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BannerHeaderAd from "@/components/BannerHeaderAd";

export type BottomSheetListHandle = {
    expand: () => void;
    collapse: () => void;
    close: () => void;
};

type SnapPoint = string | number;

/** What callers can pass in */
type SlotLike = ReactNode | ComponentType<any> | undefined;

/** Normalize to a ReactElement (or null) for FlatList props */
function toElement(node?: SlotLike): ReactElement | null {
    if (node == null) return null;                         // null/undefined → null
    if (React.isValidElement(node)) return node;           // already an element
    if (typeof node === 'function') {
        const Cmp = node as ComponentType<any>;
        return <Cmp/>;                                      // component type → <Cmp/>
    }
    // string/number/array/etc → wrap in a fragment
    return <>{node as ReactNode}</>;
}

type Props<T> = {
    data: T[] | null | undefined;
    keyExtractor: (item: T, index: number) => string;
    renderItem: ListRenderItem<T>;
    refreshing?: boolean;
    onRefresh?: () => void;

    /** Optional: shown under the header */
    topAccessory?: SlotLike;

    /** Optional: custom header (replaces default) */
    header?: SlotLike;

    /** Empty state content */
    empty?: SlotLike;

    /** Defaults to ['30%', '95%'] */
    snapPoints?: SnapPoint[];

    /** Light mode sheet background override */
    lightModeBackground?: string;

    /** Extra styles forwarded */
    contentContainerStyle?: StyleProp<ViewStyle>;
    backgroundStyle?: StyleProp<ViewStyle>;
    handleIndicatorStyle?: StyleProp<ViewStyle>;

    /** Start index (default: 0) */
    initialIndex?: number;
};

function InnerBottomSheetList<T>(
    {
        data,
        keyExtractor,
        renderItem,
        refreshing,
        onRefresh,
        empty,
        topAccessory,
        header: headerProp,
        snapPoints: snapPointsProp,
        lightModeBackground,
        contentContainerStyle,
        backgroundStyle,
        handleIndicatorStyle,
        initialIndex,
    }: Props<T>,
    ref: React.Ref<BottomSheetListHandle>
) {
    const {colors, dark} = useTheme();

    const sheetRef = React.useRef<BottomSheet>(null);
    React.useImperativeHandle(ref, () => ({
        expand: () => sheetRef.current?.expand(),
        collapse: () => sheetRef.current?.collapse(),
        close: () => sheetRef.current?.close(),
    }));

    const snapPoints = React.useMemo<SnapPoint[]>(
        () => snapPointsProp ?? ['30%', '95%'],
        [snapPointsProp]
    );

    const insets = useSafeAreaInsets();
    const topInset = insets.top || StatusBar.currentHeight || 20;
    const index = initialIndex ?? 0;
    const {refreshResorts} = useSelectedResort();

    const indicatorColor = colors.border || '#cfd8dc';
    const computedBackground = dark ? colors.card : (lightModeBackground ?? colors.card);
    const bottomInset = insets.bottom ?? 0;
    const [bannerH, setBannerH] = React.useState(0);

    const defaultHeader = (
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
            <Text style={{fontWeight: 'bold', fontSize: 18, color: colors.text}}>
                Choose Your Resort:
            </Text>
            <TouchableOpacity onPress={refreshResorts} style={{marginLeft: 12}}>
                <Image
                    source={require("@/assets/refresh.png")}
                    style={{ width: 30, height: 30, marginLeft: 150}}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );

    const headerEl = toElement(headerProp) ?? defaultHeader;
    const accessoryEl = toElement(topAccessory);
    const emptyEl = toElement(empty);

    const composedHeader =
        headerEl || accessoryEl ? (
            <View>
                {headerEl}
                {accessoryEl ? <View style={{marginTop: 8}}>{accessoryEl}</View> : null}
            </View>
        ) : null;

    const ListHeader = (
        <>
            <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/3525040945"} android_id={"ca-app-pub-6336863096491370/7271412245"}/>
            {composedHeader}
        </>
    );

    const ListFooter = (
        <View
            onLayout={(e) => setBannerH(e.nativeEvent.layout.height)}
        >
            <BannerHeaderAd ios_id={"ca-app-pub-6336863096491370/9698910518"} android_id={"ca-app-pub-6336863096491370/9023477617"}/>
        </View>
    );

    return (
        <BottomSheet
            ref={sheetRef}
            index={index}
            snapPoints={snapPoints}
            topInset={topInset}
            enablePanDownToClose={false}
            handleIndicatorStyle={[{backgroundColor: indicatorColor}, handleIndicatorStyle]}
            backgroundStyle={[{backgroundColor: computedBackground}, backgroundStyle]}
        >
            <BottomSheetFlatList
                data={(data ?? []).filter(Boolean) as T[]}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={emptyEl}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                contentContainerStyle={[
                    contentContainerStyle,
                    {paddingBottom: bannerH + bottomInset}]}
            />
        </BottomSheet>
    );
}

const BottomSheetList = React.forwardRef(InnerBottomSheetList) as <T>(
    p: Props<T> & { ref?: React.Ref<BottomSheetListHandle> }
) => React.ReactElement;

export default BottomSheetList;
