// lib/revenueCatSetup.ts
import Purchases, { LOG_LEVEL }  from "react-native-purchases";
import { Platform } from "react-native";

const RC_API_KEY = Platform.select({
    ios: "appl_CGSkKUbeKLufJXnmTNildaLBClw",
    android: "goog_hDsZkRPwzRmXonNUoMkoWJHXUzd",
})!;

let configured = false;

/**
 * Configure RevenueCat *without* appUserID so that we start in anonymous mode.
 * This allows restore-on-reinstall and subscription transfer automatically.
 */
export async function configureRevenueCat() {
    if (configured) return;

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

    Purchases.configure({
        apiKey: RC_API_KEY
    });

    configured = true;
}
