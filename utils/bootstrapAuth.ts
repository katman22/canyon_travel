// lib/bootstrapAuth.ts
import * as SecureStore from "expo-secure-store";
import { NativeModules, Platform } from "react-native";
import Purchases from "react-native-purchases";
import * as Application from "expo-application";
import { apiAuth } from "@/lib/apiAuth";
import { setPrefsUser } from "@/lib/userPrefs";
import { configureRevenueCat } from "@/lib/revenueCatSetup";
import {saveAuthForIOS} from "@/native/WidgetUpdater.ios";
import {saveAuthForWidgetAndroid} from "@/native/WidgetUpdater";
const { WidgetUpdater } = NativeModules;
const KEY_UID = "ct_user_id";
const KEY_JWT = "ct_jwt";

async function getSecureItem(key: string) {
  try { return await SecureStore.getItemAsync(key); } catch { return null; }
}
async function setSecureItem(key: string, val: string) {
  try { await SecureStore.setItemAsync(key, val); } catch {}
}

export async function bootstrapAuth() {
  console.log("starting bootstrap process.")
  // --- 0) Add metadata to API client (version, build, platform)
  apiAuth.setClientMeta({
    appVersion: Application.nativeApplicationVersion ?? "0.0.0",
    build: Application.nativeBuildVersion ?? "",
    platform: Platform.OS,
  });

  // --- 1) Configure RevenueCat anonymously
  await configureRevenueCat();

  // --- 2) Immediately check RevenueCat customer info
  // This detects restores and previous purchases BEFORE we get a Rails user
  let initialCustomerInfo = null;
  try {
    initialCustomerInfo = await Purchases.getCustomerInfo();
  } catch (err) {
    console.warn("⚠️ Failed to fetch RC customer info early:", err);
  }

  // --- 3) Get existing stored public_id (if reinstall → blank)
  let storedUserId = await getSecureItem(KEY_UID);

  // --- 4) Call the server to get the *real* public_id + JWT
  const body = storedUserId ? { auth: { user_id: storedUserId } } : {};
  const out = await apiAuth.post("auth/device", body);
  const { user_id: publicId, jwt } = out;


  // Save new identity if changed (or first install)
  if (!storedUserId || storedUserId !== publicId) {
    await setSecureItem(KEY_UID, publicId);
    storedUserId = publicId;
  }

  await setSecureItem(KEY_JWT, jwt);

  if (Platform.OS === "ios") {
    try {
      saveAuthForIOS(publicId, jwt);
    } catch (e) {
      console.warn("Failed to save auth for widget:", e);
    }
  }

  // inside bootstrapAuth(), after storing JWT:
  if (Platform.OS === "android") {
    try {
      console.log("Saving keys", publicId, jwt)
      await saveAuthForWidgetAndroid(publicId, jwt);
    } catch (e) {
      console.warn("Android widget auth save failed:", e);
    }
  }

  apiAuth.setToken(jwt);

  // --- 5) Now log into RevenueCat using the authoritative server identity
  try {
    const rcResult = await Purchases.logIn(String(publicId));
    console.log("🟢 RC login result:", rcResult);
    console.log("🟢 RC new app user id:", await Purchases.getAppUserID());

    // If the subscription was transferred, RevenueCat returns:
    // rcResult.created (new user) or rcResult.transferred (restore)
  } catch (err) {
    console.warn("⚠️ RevenueCat logIn failed:", err);
  }

  // --- 6) Now we have a stable, correct user identity for prefs
  setPrefsUser(String(publicId));

  console.log("🎯 Final RC app user:", await Purchases.getAppUserID());
  console.log("🎯 Final Rails public_id:", publicId);


  console.log("Finished Bootstrap process.")

  return { userId: publicId, jwt };
}
