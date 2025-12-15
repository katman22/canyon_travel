// lib/att.ts
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

export async function requestATT() {
    try {
        const { status } = await requestTrackingPermissionsAsync();
        console.log("ATT Status:", status);
        return status;
    } catch (err) {
        console.log("ATT Error:", err);
        return "unavailable";
    }
}
