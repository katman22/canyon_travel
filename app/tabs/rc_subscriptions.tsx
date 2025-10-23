// app/iap-rc.tsx
import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Alert,
    ImageBackground, Platform,
    SafeAreaView,
    StatusBar, StyleSheet,
    Text,
    View
} from "react-native";
import {useRevenueCat} from "@/hooks/useRevenueCat";
import {SubscriptionPlanCard} from "@/components/SubscriptionPlanCard";
import {getPriceString, getUnit, getYearlySavingsPct} from "@/utils/pricing";
import BrandedLoader from "@/components/BrandedLoader";
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTheme} from "@react-navigation/native";
import getStyles from "@/assets/styles/styles";
import {SubscriptionFreePlanCard} from "@/components/SubscriptionFreePlanCard";
import FloatingSettingsButton from "@/components/FloatingSettingsButton";
import {clearHomeResorts} from "@/lib/userPrefs";

// --------- CONFIG ----------
const RC_API_KEY = Platform.select({
    ios: "appl_CGSkKUbeKLufJXnmTNildaLBClw",
    android: "goog_hDsZkRPwzRmXonNUoMkoWJHXUzd",
})!;
// Your explicit SKU map (keeps logic simple for toggling)
const SKUS = {
    standard: {monthly: "ct_standard_monthly", yearly: "ct_standard_yearly"},
    pro: {monthly: "ct_pro_monthly", yearly: "ct_pro_yearly"},
    premium: {monthly: "ct_premium_monthly", yearly: "ct_premium_yearly"},
};
const ALL_SKUS = Object.values(SKUS).flatMap(v => [v.monthly, v.yearly]);

export default function RCSubscriptionsScreen() {
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['35%', '95%'], []);
    const insets = useSafeAreaInsets();
    const topInset = Math.max(insets.top, StatusBar.currentHeight ?? 0, 16);

    const getBySku = (sku: string) => {
        const direct =
            productsById[sku] ||
            productsById[sku.trim()] ||
            productsById[sku.toLowerCase()];
        if (direct) return direct;
        const keys = Object.keys(productsById);
        const prefixed = keys.find(k => k.startsWith(`${sku}:`) || k.split(":")[0].toLowerCase() === sku.toLowerCase());
        return prefixed ? productsById[prefixed] : undefined;
    };


    const {
        configured, loading, error,
        info, waitForActiveEntitlements,
        productsById,
        purchaseBySku, restore, refresh
    } = useRevenueCat({
        apiKey: RC_API_KEY,
        skuList: ALL_SKUS,
        logLevel: __DEV__ ? "DEBUG" : "ERROR",
    });

    // "ready" is when at least one of our SKUs is in the index
    const isReady = useMemo(() => {
        return !!(getBySku(SKUS.standard.monthly) || getBySku(SKUS.pro.monthly) || getBySku(SKUS.premium.monthly));
    }, [productsById]);

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isReady) return;                 // stop when ready
        setProgress(0);
        const id = setInterval(() => {
        setProgress((p) => (p >= 0.95 ? 0.95 : p + 0.05)); // creep to 95%
        }, 300);
        return () => clearInterval(id);
        }, [isReady]);


    const priceTextFor = (sku: string) => {
        const p = getBySku(sku);
        const price = getPriceString(p as any);
        if (!price) return "—";
        const unit = getUnit(p as any, sku);
        return price + unit;
    };

    const savingsText = (monthlySku: string, yearlySku: string) => {
        const monthly = getBySku(monthlySku);
        const yearly = getBySku(yearlySku);
        const pct = getYearlySavingsPct(monthly as any, yearly as any);
        return pct && pct > 0 ? `Save ${pct}%` : undefined;
    };

    const plans = [
        {
            key: "standard",
            title: "Standard",
            summary: "Step up to real-time precision. ",
            monthlySku: SKUS.standard.monthly,
            yearlySku: SKUS.standard.yearly,
            features: ["2 home resorts + 2 additional resorts ", "1 home resort change per week ", "2-minute traffic updates"],
            popular: false,
            tagLine: "💡Know the best canyon before you leave your driveway. "
        },
        {
            key: "pro",
            title: "Pro",
            summary: "Plan like a local — power tools for frequent riders. ",
            monthlySku: SKUS.pro.monthly,
            yearlySku: SKUS.pro.yearly,
            features: ["4 home resorts + 2 additional resorts", "2 home resort changes per week", "Real-time updates ", "1 Widget – To/From times + quick resort access"],
            popular: false,
            tagLine: "🔥Your mountain plan - skip guesswork, save time. "
        },
        {
            key: "premium",
            title: "Premium",
            summary: "Go unlimited — every canyon, every update, no limits. ",
            monthlySku: SKUS.premium.monthly,
            yearlySku: SKUS.premium.yearly,
            features: ["All Utah resorts", "Unlimited access", "Real-time updates"],
            popular: false,
            tagLine: "🏆Total Mountain freedom — anywhere, anytime. "
        },
    ] as const;

    const handleSelect = async (sku: string, label: string) => {
        try {
            // 1) Make the purchase
            await purchaseBySku(sku);

            // 2) Wait for RC to reflect the new active entitlement(s)
            //    If you know your entitlement ids, include them for faster/stricter matching:
            //    includeOneOf: ["premium","pro","standard"]
            const got = await waitForActiveEntitlements({
                minActive: 1,
                includeOneOf: ["premium", "pro", "standard"],
                tries: 10,
                delayMs: 300,
            });

            // 3) Clear homes so Locations recomputes unlocked/locked state
            await clearHomeResorts();

            Alert.alert(
                "Purchase completed",
                `Current Subscription: ${got.join(", ") || "none"}`
            );
        } catch (e: any) {
            if (!e?.userCancelled) {
                Alert.alert("Purchase failed", e?.message ?? String(e));
            }
        }
    };

    if (!isReady) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff' /* or LightPalette.background */}}>
                <BrandedLoader progress={progress} message="Getting current subscription options…"/>
            </SafeAreaView>
        )
    }

    return (

        <SafeAreaView style={{flex: 1, backgroundColor: "#e6f3f8"}}>
            <ImageBackground
                source={require("@/assets/canyon_travellers_v6.png")}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{opacity: 0.75}}
            />

            <FloatingSettingsButton />

            <View style={{flex: 1}}>
                <BottomSheet
                    ref={sheetRef}
                    index={1}
                    snapPoints={snapPoints}
                    topInset={topInset}
                    enablePanDownToClose={false}
                    handleIndicatorStyle={{backgroundColor: colors.border || "#cfd8dc"}}
                    backgroundStyle={{backgroundColor: "#8ec88e"}}
                >
                    <BottomSheetScrollView
                        contentContainerStyle={styles.cameraContainer}
                        showsVerticalScrollIndicator={false}
                        style={{backgroundColor: "#fff"}}
                    >
                        <Text style={styles.subscriptionPlan}>Choose Your Plan</Text>
                        <Text style={styles.subscriptionDescription}>Level up your ride - choose Standard, Pro, or Premium.</Text>
                        <SubscriptionFreePlanCard />
                        {plans.map((p) => (
                            <SubscriptionPlanCard
                                key={p.key}
                                title={p.title}
                                summary={p.summary}
                                popular={p.popular}
                                features={p.features}
                                tagLine={p.tagLine}
                                monthlyPriceText={priceTextFor(p.monthlySku)}
                                yearlyPriceText={priceTextFor(p.yearlySku)}
                                yearlySavingsText={savingsText(p.monthlySku, p.yearlySku)}
                                onPressMonthly={() => handleSelect(p.monthlySku, `${p.title} Monthly`)}
                                onPressYearly={() => handleSelect(p.yearlySku, `${p.title} Yearly`)}
                                monthlyDisabled={loading}
                                yearlyDisabled={loading}
                            />
                        ))}

                        <Text style={styles.subDetails}>
                            All plans include weather + road condition updates. Subscriptions auto-renew; cancel anytime
                            in your store settings.
                        </Text>
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </SafeAreaView>
    );
}
