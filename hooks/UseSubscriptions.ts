// /hooks/useSubscriptions.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import * as RNIap from "react-native-iap";

type Purchase = RNIap.Purchase;

// Local proration constants (Google BillingClient)
const PRORATION = {
  IMMEDIATE_WITH_TIME_PRORATION: 2,
  IMMEDIATE_AND_CHARGE_PRORATED_PRICE: 3,
  IMMEDIATE_WITHOUT_PRORATION: 4,
  DEFERRED: 5,
} as const;
type AndroidProration = (typeof PRORATION)[keyof typeof PRORATION];

export type Entitlement = {
  active: boolean;
  productId?: string;
  purchaseToken?: string;   // Android
  transactionId?: string;   // iOS
  autoRenewing?: boolean;   // Android
  platform: "android" | "ios" | null;
};

export type UseSubscriptionsOptions = {
  productIds: string[];                 // e.g. ['ct_premium_month','ct_premium_year']
  prorationModeAndroid?: AndroidProration; // default IMMEDIATE_WITH_TIME_PRORATION
};

export type UseSubscriptions = {
  ready: boolean;
  loading: boolean;
  error?: string;
  products: any[]; // keep loose to avoid version-specific typings
  entitlement: Entitlement;
  refreshEntitlements: () => Promise<void>;
  restore: () => Promise<void>;
  subscribe: (productId: string) => Promise<void>;
  changePlan: (toProductId: string) => Promise<void>;
};

// ---- helpers ---------------------------------------------------------------

const pickAndroidOfferToken = (product: any) => {
  // Some versions expose subscriptionOfferDetails; keep loose.
  // @ts-ignore
  const details = product?.subscriptionOfferDetails as Array<{ offerToken?: string }> | undefined;
  return details?.[0]?.offerToken;
};

const toEntitlement = (p?: Purchase, knownIds: string[] = []): Entitlement => {
  if (!p) return { active: false, platform: null };

  const productId = (p as any).productId as string | undefined;
  const platform = Platform.OS as "android" | "ios";
  const purchaseToken = platform === "android" ? (p as any).purchaseToken : undefined;
  const transactionId = platform === "ios" ? (p as any).transactionId : undefined;
  const autoRenewing = platform === "android" ? (p as any).autoRenewingAndroid : undefined;

  return {
    active: !!productId && knownIds.includes(productId),
    productId,
    purchaseToken,
    transactionId,
    autoRenewing,
    platform,
  };
};

// Try getSubscriptions first; fall back to getProducts for older/newer APIs.
const fetchSubscriptions = async (ids: string[]): Promise<any[]> => {
  const api: any = RNIap as any;
  if (typeof api.getSubscriptions === "function") {
    return await api.getSubscriptions(ids);
  }
  if (typeof api.getProducts === "function") {
    return await api.getProducts(ids);
  }
  throw new Error("react-native-iap: no method to fetch subscriptions (getSubscriptions/getProducts missing)");
};

// ---- hook ------------------------------------------------------------------

export function useSubscriptions(opts: UseSubscriptionsOptions): UseSubscriptions {
  const {
    productIds,
    prorationModeAndroid = PRORATION.IMMEDIATE_WITH_TIME_PRORATION,
  } = opts;

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [products, setProducts] = useState<any[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement>({ active: false, platform: null });

  const subUpdateRef = useRef<ReturnType<typeof RNIap.purchaseUpdatedListener> | null>(null);
  const subErrorRef  = useRef<ReturnType<typeof RNIap.purchaseErrorListener> | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await RNIap.initConnection();

        if (Platform.OS === "android") {
          try {
            // Only call if this version exposes it
            await (RNIap as any).flushFailedPurchasesCachedAsPendingAndroid?.();
          } catch {}
        }

        const subs = await fetchSubscriptions(productIds);
        if (mounted) setProducts(subs);

        await refreshEntitlementsSafe();

        subUpdateRef.current = RNIap.purchaseUpdatedListener(async (purchase) => {
          try {
            await RNIap.finishTransaction(purchase, true); // acknowledge ASAP
          } catch {}
          await refreshEntitlementsSafe();
        });

        subErrorRef.current = RNIap.purchaseErrorListener((e) => {
          setError(e?.message ?? "Purchase error");
        });

        if (mounted) setReady(true);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      try { subUpdateRef.current?.remove(); } catch {}
      try { subErrorRef.current?.remove(); } catch {}
      RNIap.endConnection();
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join("|")]);

  const refreshEntitlements = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const match = purchases.find((p) => productIds.includes((p as any).productId));
      setEntitlement(toEntitlement(match as any, productIds));
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const refreshEntitlementsSafe = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const match = purchases.find((p) => productIds.includes((p as any).productId));
      setEntitlement(toEntitlement(match as any, productIds));
    } catch {}
  };

  const subscribe = async (productId: string) => {
    setError(undefined);
    const product = products.find((p) => p.productId === productId);
    if (!product) { setError("Product not loaded"); return; }

    if (Platform.OS === "android") {
      const offerToken = pickAndroidOfferToken(product);
      // @ts-ignore (older iap typings may not include subscriptionOffers)
      await RNIap.requestSubscription({
        sku: productId,
        subscriptionOffers: offerToken ? [{ sku: productId, offerToken }] : undefined,
      });
    } else {
      await RNIap.requestSubscription({ sku: productId });
    }
  };

  const changePlan = async (toProductId: string) => {
    setError(undefined);

    if (!entitlement.active) {
      return subscribe(toProductId);
    }

    if (Platform.OS === "android") {
      const product = products.find((p) => p.productId === toProductId);
      const offerToken = product ? pickAndroidOfferToken(product) : undefined;

      // @ts-ignore typings vary across versions
      await RNIap.requestSubscription({
        sku: toProductId,
        purchaseTokenAndroid: entitlement.purchaseToken,
        prorationModeAndroid, // numeric constant
        subscriptionOffers: offerToken ? [{ sku: toProductId, offerToken }] : undefined,
      });
    } else {
      await RNIap.requestSubscription({ sku: toProductId });
    }
  };

  const restore = async () => {
    setError(undefined);
    await refreshEntitlements();
  };

  const api: UseSubscriptions = useMemo(
      () => ({
        ready,
        loading,
        error,
        products,
        entitlement,
        refreshEntitlements,
        restore,
        subscribe,
        changePlan,
      }),
      [ready, loading, error, products, entitlement]
  );

  return api;
}
