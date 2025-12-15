import { NativeModules, Platform } from 'react-native';

type SaveResult = { widgetId: number; key: string; resortId: string | null } | boolean;

type WidgetUpdaterModule = {
  saveResortToPrefs(resortId: string): Promise<boolean>;
  saveResortForWidget(widgetId: number, resortId: string): Promise<{ widgetId: number; key: string; resortId: string }>;
  getResortForWidget(widgetId: number): Promise<{ widgetId: number; key: string; resortId: string | null }>;
  updateWidgets(): Promise<boolean>;
  updateWidgetById(widgetId: number): Promise<boolean>;
  saveAuthForWidget(userId: string, jwt: string): Promise<boolean>;
};

const native = (Platform.OS === 'android' ? (NativeModules as any).WidgetUpdater : undefined) as
    | WidgetUpdaterModule
    | undefined;

export async function saveWidgetResortForId(widgetId: number, resortId: string) {
  if (Platform.OS !== 'android' || !native?.saveResortForWidget) {
    console.warn('[WidgetUpdater] unavailable');
    return;
  }

  console.log('About to save the resort ID');
  const res = await native.saveResortForWidget(widgetId, resortId);
  console.log('[WidgetUpdater] Saved the resort ID:', res);
  const check = await native.getResortForWidget(widgetId);
  console.log('[WidgetUpdater] read-back for save resort:', check);
  await (native.updateWidgetById?.(widgetId) ?? await native.updateWidgets());
}

export async function saveAuthForWidgetAndroid(userId: string, jwt: string) {
  if (Platform.OS !== 'android' || !native?.saveAuthForWidget) {
    console.warn('[WidgetUpdater] unavailable');
    return;
  }
  const res = await native.saveAuthForWidget(userId, jwt);
  console.log('[WidgetUpdater] Keys we saved:', userId, jwt, res);
}

export async function saveWidgetResort(resortId: string) {
  if (Platform.OS !== 'android' || !native?.saveResortToPrefs) return;
  const ok = await native.saveResortToPrefs(resortId);
  console.log('[WidgetUpdater] global save ok:', ok);
  await native.updateWidgets();
}
