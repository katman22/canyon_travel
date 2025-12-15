// hooks/useAdsAllowed.ts
import { Platform } from "react-native";
import { useAds } from "@/context/AdsContext";

export function useAdsAllowed() {
    const { attStatus } = useAds();

    // Android: ATT doesn’t apply → tracking allowed by default
    if (Platform.OS === "android") return true;

    // iOS: tracking allowed only if ATT authorized
    return attStatus === "authorized";
}
