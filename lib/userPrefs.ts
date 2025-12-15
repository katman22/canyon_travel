// lib/userPrefs.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PrefsEvents, EVENTS } from "./events";

// legacy (v1) global key (kept for migration)
const LEGACY_KEY_HOME_RESORTS = "prefs:home_resorts";
const KEY_SUBS = "home_resorts:subscribed";
const KEY_FREE = "home_resorts:free";


// v2: per-user namespace
let CURRENT_APP_USER_ID = "anon";
export function setPrefsUser(id: string) {
    CURRENT_APP_USER_ID = id || "anon";
}
const keyFor = (userId = CURRENT_APP_USER_ID) => `ct:v2:${userId}:home_resorts`;


