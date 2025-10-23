// app/(whatever)/LocationsScreen.tsx
import * as React from 'react';
import {
    Text,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
    SafeAreaView,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { useSelectedResort } from '@/context/ResortContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Resort } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import getStyles from '@/assets/styles/styles';
import BottomSheetList from '@/components/BottomSheetList';
import BrandedLoader from '@/components/BrandedLoader';
import FloatingSettingsButton from '@/components/FloatingSettingsButton';
import { loadHomeResorts } from '@/lib/userPrefs';
import { format } from 'date-fns';

export default function LocationsScreen() {
    const { resort, allResorts, loading, refreshing, refreshResorts, handleResortSelection } = useSelectedResort();
    const { tier, status, expiresAt, entitlements } = useSubscription(); // <-- added fields
    const { colors } = useTheme();
    const styles = getStyles(colors as any);

    const [homeIds, setHomeIds] = React.useState<string[]>([]);
    React.useEffect(() => { (async () => setHomeIds(await loadHomeResorts()))(); }, []);

    // 🔑 Reload when subscription tier changes (still useful)
    React.useEffect(() => { (async () => setHomeIds(await loadHomeResorts()))(); }, [tier]);

    // Pretty plan label from entitlement id (fallback to "Free")
    const planName = React.useMemo(() => {
        const id = entitlements?.[0];
        if (!id) return 'Free';
        return id
            .split(/[_-]/)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');
    }, [entitlements]);

    // StatusNotice replaces LockNotice, keeps same styling
    const StatusNotice = (() => {
        // status warnings (shown for any tier)
        if (status === 'scheduled_cancel' && expiresAt) {
            return (
                <View style={{
                    padding: 12, marginTop: 70, backgroundColor: '#FFF9E6',
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0C97B'
                }}>
                    <Text style={{ color: '#7A5E00', fontWeight: '600' }}>
                        {planName} will end on {format(expiresAt, 'PPP')}. You’ll keep access until then.
                    </Text>
                </View>
            );
        }
        if (status === 'billing_issue') {
            return (
                <View style={{
                    padding: 12, marginTop: 70, backgroundColor: '#FFF9E6',
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0C97B'
                }}>
                    <Text style={{ color: '#7A5E00', fontWeight: '600' }}>
                        We’re having trouble with your {planName} payment. Please update billing to keep access.
                    </Text>
                </View>
            );
        }
        if (status === 'expired') {
            return (
                <View style={{
                    padding: 12, marginTop: 70, backgroundColor: '#FFF9E6',
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0C97B'
                }}>
                    <Text style={{ color: '#7A5E00', fontWeight: '600' }}>
                        Your {planName} subscription has ended. Tap any locked resort to subscribe again.
                    </Text>
                </View>
            );
        }

        // healthy state: show unlock blurb for non-premium tiers
        if (tier !== 'premium') {
            return (
                <View style={{
                    padding: 12, marginTop: 70, backgroundColor: '#FFF9E6',
                    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0C97B'
                }}>
                    <Text style={{ color: '#7A5E00', fontWeight: '600' }}>
                        {tier === 'none'
                            ? 'Free: your home resort + 1 extra are open. 🔒 Upgrade for more.'
                            : `${planName}: your home resorts + 2 extra are open. 🔒 Upgrade for all.`}
                    </Text>
                </View>
            );
        }

        // premium + healthy → no banner
        return null;
    })();

    // 1) order: selected home first -> other homes -> others
    const prioritizedResorts = React.useMemo(() => {
        const list = (allResorts ?? []).filter(Boolean);
        if (list.length === 0) return [];
        const selId = resort?.resort_id ? String(resort.resort_id) : null;
        const homeSet = new Set(homeIds);

        const selectedHome = selId && homeSet.has(selId)
            ? list.filter(r => String(r.resort_id) === selId)
            : [];

        const otherHomes = list.filter(
            r => homeSet.has(String(r.resort_id)) && (!selId || String(r.resort_id) !== selId)
        );

        const others = list.filter(r => !homeSet.has(String(r.resort_id)));

        return [...selectedHome, ...otherHomes, ...others];
    }, [allResorts, homeIds.join('|'), resort?.resort_id]);

    // 2) extra allowance by tier (homes are always unlocked)
    const extraAllowance = React.useMemo(() => {
        switch (tier) {
            case 'premium': return Infinity;
            case 'pro': return 2;
            case 'standard': return 2;
            case 'none':
            default: return 1; // free
        }
    }, [tier]);

    // 3) build an "unlocked" mask: all homes + first N others by allowance
    const unlockedMask = React.useMemo(() => {
        const homeSet = new Set(homeIds);
        let extrasLeft = extraAllowance;
        return prioritizedResorts.map((r) => {
            const id = String(r.resort_id);
            if (homeSet.has(id)) return true; // homes always unlocked
            if (extrasLeft > 0) { extrasLeft -= 1; return true; }
            return tier === 'premium'; // premium unlocks all anyway
        });
    }, [prioritizedResorts, homeIds.join('|'), extraAllowance, tier]);

    const goSubscribe = () => router.push('/tabs/rc_subscriptions');

    const renderItem = ({ item, index }: { item: Resort | null; index: number }) => {
        if (!item) return null;

        const isSelected = resort?.resort_id === item.resort_id;
        const isLocked = !unlockedMask[index];

        const bg = isLocked ? '#9AAACE' : isSelected ? '#2E7D32' : '#4285F4';
        const opacity = isLocked ? 0.7 : 1;

        const onPress = () => {
            if (isLocked) {
                goSubscribe();
            } else {
                handleResortSelection(item);
            }
        };

        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={false}
                style={{ padding: 12, marginVertical: 8, backgroundColor: bg, borderRadius: 8, opacity }}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLocked }}
                accessibilityLabel={item.resort_name}
                accessibilityHint={isLocked ? 'Locked. Opens subscription options.' : 'Select resort.'}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isLocked && <Text style={{ color: '#fff' }}>🔒</Text>}
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{item.resort_name}</Text>
                </View>
                <Text style={{ color: '#fff', opacity: 0.9 }}>{item.location}</Text>

                {isLocked && (
                    <Text style={{ color: '#fff', marginTop: 6, fontStyle: 'italic' }}>
                        {tier === 'none' ? 'Upgrade to Standard for more resorts.'
                            : (tier === 'standard' || tier === 'pro') ? 'Upgrade to Premium for all resorts.'
                                : ''}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (loading || refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <BrandedLoader message="Our smartest squirrels are reloading the Resorts…" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ImageBackground
                source={require('@/assets/canyon_travellers_v6.png')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.75 }}
            />
            {StatusNotice}
            <FloatingSettingsButton />
            <BottomSheetList<Resort>
                data={prioritizedResorts}
                keyExtractor={(item, index) => (item?.resort_id ? String(item.resort_id) : `__idx_${index}`)}
                renderItem={renderItem}
                refreshing={refreshing}
                onRefresh={refreshResorts}
                empty={
                    <TouchableOpacity onPress={refreshResorts} style={{ paddingVertical: 12 }}>
                        <Text style={{ color: colors.text }}>
                            No Resort Information is currently available, please refresh to check.
                        </Text>
                    </TouchableOpacity>
                }
                lightModeBackground="#8ec88e"
                contentContainerStyle={styles.cameraContainer}
                snapPoints={['30%', '90%']}
            />
        </SafeAreaView>
    );
}
