// utils/network.ts
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';


export async function waitForInternet(maxMs = 12000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
        const s = await NetInfo.fetch();

        // Be strict: only proceed when we *know* we have internet
        // (iOS can report isConnected=true while isInternetReachable=null)
        if (s.isConnected && s.isInternetReachable === true) {
            // tiny grace so sockets/DNS fully wake up after app resume
            await new Promise(r => setTimeout(r, 300));
            return true;
        }

        await new Promise(r => setTimeout(r, 350));
    }
    return false;
}
