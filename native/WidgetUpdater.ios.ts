// app/native/WidgetUpdater.ios.ts
import { NativeModules, Platform } from 'react-native';

const { WidgetUpdater } = NativeModules ?? {};

export function saveWidgetResortForIOS(resortId: string) {
    if (Platform.OS === 'ios' && WidgetUpdater?.saveResort) {
        console.log("Update the widget");
        console.log(NativeModules)
        WidgetUpdater.saveResort(resortId);
    } else {
        console.warn('WidgetUpdater.saveResort not available');
    }
}

export function reloadWidgetsIOS() {
    if (Platform.OS === 'ios' && WidgetUpdater?.reloadAll) {
        WidgetUpdater.reloadAll();
    } else {
        console.warn('WidgetUpdater.reloadAll not available');
    }
}

export function saveAuthForIOS(userId: string, jwt: string) {
    if (Platform.OS === "ios" && WidgetUpdater?.saveAuth) {
        console.log("[WidgetUpdater] saveAuthForIOS", { userId, jwt: jwt.substring(0, 10) + "..." });
        WidgetUpdater.saveAuth(userId, jwt);
    } else {
        console.warn("WidgetUpdater.saveAuth not available");
    }
}

export async function getInstalledCountIOS(): Promise<number> {
    try {
        const n = await WidgetUpdater.getInstalledCount();
        return typeof n === 'number' ? n : 0;
    } catch {
        return 0;
    }
}
