// utils/identity.ts
import * as SecureStore from "expo-secure-store";

const KEY_UID = "ct_user_id"; // same key you use in bootstrapAuth

export async function getDeviceUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_UID);
}

// Optional: a small hook for components
import { useEffect, useState } from "react";
export function useDeviceUserId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => { getDeviceUserId().then(setId); }, []);
  return id;
}
