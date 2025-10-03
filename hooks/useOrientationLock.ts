// useOrientationLock.ts
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export function useOrientationLock(locked: boolean) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (locked) {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        }
      } catch (e) {
        console.warn("Orientation lock failed:", e);
      }
    }

    run();
    return () => { if (!cancelled) ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT); };
  }, [locked]);
}
