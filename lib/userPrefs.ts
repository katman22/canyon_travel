// lib/userPrefs.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PrefsEvents, EVENTS } from "./events";

const KEY_HOME_RESORTS = "prefs:home_resorts"; // array of resort_id as strings

export async function loadHomeResorts(): Promise<string[]> {
    try {
        const raw = await AsyncStorage.getItem(KEY_HOME_RESORTS);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
        return [];
    }
}

export async function saveHomeResorts(ids: string[]): Promise<void> {
    await AsyncStorage.setItem(KEY_HOME_RESORTS, JSON.stringify(ids.map(String)));
    PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
}

export async function clearHomeResorts(): Promise<void> {
    try {
        await AsyncStorage.removeItem(KEY_HOME_RESORTS);
    } finally {
        PrefsEvents.emit(EVENTS.HOME_RESORTS_CHANGED);
    }
}
