// hooks/useEffectiveAccess.ts
import * as React from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { loadHomeResorts } from "@/lib/userPrefs";
import { PrefsEvents, EVENTS } from "@/lib/events";

export function useEffectiveAccess(resortId?: string | null, isSubscribed?: boolean) {
  const { tier } = useSubscription();

  const [homeIds, setHomeIds] = React.useState<string[]>([]);
  const id = resortId != null ? String(resortId) : null;

  // hydrate + keep in sync with changes elsewhere
  const reloadHomes = React.useCallback(async () => {
    setHomeIds(await loadHomeResorts());
  }, []);
  React.useEffect(() => {
    reloadHomes().catch(() => {});
  }, [reloadHomes]);

  React.useEffect(() => {
    const h = () => {
      reloadHomes().catch(() => {});
    };
    PrefsEvents.on(EVENTS.HOME_RESORTS_CHANGED, h);
    return () => {
      PrefsEvents.off(EVENTS.HOME_RESORTS_CHANGED, h);
    };
  }, [reloadHomes]);


  const canUseSub = React.useMemo(() => {
    // 🔒 Premium override: can see/use everything
    if (tier === "premium") return true;

    // ⤵️ keep your existing semantics below
    if (!id) return false;

    // Homes are always accessible (free or paid)
    if (homeIds.includes(id)) return true;

    // If you previously allowed "extras" when subscribed, keep that:
    // (If your original logic differed, leave it; this shows the intent.)
    return !!isSubscribed;
  }, [tier, id, homeIds, isSubscribed]);

  return { canUseSub, homeIds };
}
