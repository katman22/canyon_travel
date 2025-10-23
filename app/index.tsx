import { Redirect, useRootNavigationState } from "expo-router";

export default function IndexScreen() {
    const state = useRootNavigationState();
    if (!state?.key) return null; // wait until the root nav is mounted
    return <Redirect href="/tabs/locations" />;
}