// app/native/WidgetUpdater.ios.ts
import { NativeModules, Platform } from 'react-native';

const { WidgetUpdater } = NativeModules ?? {};

export function saveWidgetResortForIOS(resortId: string) {
    if (Platform.OS === 'ios' && WidgetUpdater?.saveResort) {
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
