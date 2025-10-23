// hooks/useRevenueCat.ts
import React, { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, LOG_LEVEL } from "react-native-purchases";

let __rcConfiguredKey: string | null = null; // remember which key actually configured

type RCProduct = Awaited<ReturnType<typeof Purchases.getProducts>>[number];

type UseRevenueCatOpts = {
    apiKey: string;                    // appl_… on iOS, goog_… on Android
    skuList?: string[];
    logLevel?: keyof typeof LOG_LEVEL;
};

export function useRevenueCat({
                                  apiKey,
                                  skuList = [],
                                  logLevel = (__DEV__ ? "DEBUG" : "ERROR"),
                              }: UseRevenueCatOpts) {
    const [configured, setConfigured] = useState(false);
    const [products, setProducts] = useState<RCProduct[]>([]);
    const [info, setInfo] = useState<CustomerInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const skuKey = React.useMemo(() => (skuList ?? []).join("|"), [skuList]);

    // Sanity checks (dev only)
    useEffect(() => {
        if (__DEV__) {
            const expectPrefix = Platform.OS === "ios" ? "appl_" : "goog_";
            if (!apiKey?.startsWith(expectPrefix)) {
                console.warn(
                    `[RevenueCat] Suspicious API key for ${Platform.OS}. Got "${apiKey?.slice(0,5)}…", expected prefix "${expectPrefix}".`
                );
            }
        }
    }, [apiKey]);

    // Configure (and reconfigure if key differs)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                await Purchases.setLogLevel(LOG_LEVEL[logLevel]);

                if (!__rcConfiguredKey || __rcConfiguredKey !== apiKey) {
                    // If some earlier screen configured with a wrong key, reconfigure now.
                    await Purchases.configure({ apiKey });
                    __rcConfiguredKey = apiKey;
                }

                if (mounted) setConfigured(true);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? String(e));
                console.error("[RevenueCat] configure failed:", e);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [apiKey, logLevel]);

    // Load products + customer info, listen for updates
    useEffect(() => {
        if (!configured) return;
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                const wantProducts = Array.isArray(skuList) && skuList.length > 0;
                const prodsPromise = wantProducts
                    ? Purchases.getProducts(skuList, "subs" as any)
                    : Promise.resolve<RCProduct[]>([]);
                const [prods, ci] = await Promise.all([prodsPromise, Purchases.getCustomerInfo()]);
                if (!mounted) return;
                setProducts(prods ?? []);
                setInfo(ci);
                setError(null);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? String(e));
                console.error("[RevenueCat] load failed:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        const onUpdate = (ci: CustomerInfo) => mounted && setInfo(ci);
        Purchases.addCustomerInfoUpdateListener(onUpdate);

        return () => {
            mounted = false;
            (Purchases as any).removeCustomerInfoUpdateListener?.(onUpdate);
        };
    }, [configured, skuKey]);

    // Map of products by id/sku
    const productsById = useMemo(() => {
        const map: Record<string, RCProduct> = {};
        const put = (k: string | undefined, p: RCProduct) => {
            if (!k) return;
            map[k] = p; map[k.trim()] = p; map[k.toLowerCase()] = p;
        };
        for (const p of products) {
            const a: any = p;
            const id = a.identifier as string | undefined;
            put(id, p);
            if (id?.includes(":")) {
                const [sku, basePlan] = id.split(":");
                put(sku, p); put(`${sku}:${basePlan}`, p);
            }
            put(a.productId, p);
            put(a?.productDetails?.productId, p);
            put(a?.googleProductDetails?.productId, p);
        }
        return map;
    }, [products]);

    const activeEntitlements = useMemo(
        () => Object.keys(info?.entitlements?.active ?? {}),
        [info]
    );

    const refresh = async () => {
        try {
            setLoading(true);
            const wantProducts = Array.isArray(skuList) && skuList.length > 0;
            const prodsPromise = wantProducts
                ? Purchases.getProducts(skuList, "subs" as any)
                : Promise.resolve<RCProduct[]>([]);
            const [prods, ci] = await Promise.all([prodsPromise, Purchases.getCustomerInfo()]);
            setProducts(prods ?? []);
            setInfo(ci);
            setError(null);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            console.error("[RevenueCat] refresh failed:", e);
        } finally {
            setLoading(false);
        }
    };

    const getBySkuFromMap = (sku: string) => {
        const direct =
            productsById[sku] ||
            productsById[sku?.trim?.()] ||
            productsById[sku?.toLowerCase?.()];
        if (direct) return direct;
        const keys = Object.keys(productsById);
        const prefixed = keys.find(
            (k) => k.startsWith(`${sku}:`) || k.split(":")[0].toLowerCase() === sku.toLowerCase()
        );
        return prefixed ? productsById[prefixed] : undefined;
    };

    const purchaseProduct = async (product: RCProduct) => {
        try {
            setLoading(true);
            if (typeof (Purchases as any).purchaseStoreProduct === "function") {
                const { customerInfo } = await (Purchases as any).purchaseStoreProduct(product);
                setInfo(customerInfo);
            } else {
                const { customerInfo } = await Purchases.purchaseProduct(product.identifier);
                setInfo(customerInfo);
            }
            setError(null);
        } catch (e: any) {
            if (!e?.userCancelled) setError(e?.message ?? String(e));
            console.error("[RevenueCat] purchase failed:", e);
        } finally {
            setLoading(false);
        }
    };

    const purchaseBySku = async (sku: string) => {
        const prod = getBySkuFromMap(sku);
        if (!prod) throw new Error(`Product not loaded: ${sku}`);
        return purchaseProduct(prod);
    };

    const restore = async () => {
        try {
            setLoading(true);
            const ci = await Purchases.restorePurchases();
            setInfo(ci);
            setError(null);
        } catch (e: any) {
            setError(e?.message ?? String(e));
            console.error("[RevenueCat] restore failed:", e);
        } finally {
            setLoading(false);
        }
    };

    const getCustomerInfoFresh = async () => {
        const ci = await Purchases.getCustomerInfo();
        setInfo(ci);
        return ci;
    };

    type WaitOpts = {
        minActive?: number;          // default 1
        includeOneOf?: string[];     // e.g. ["premium","pro","standard"]
        tries?: number;              // default 8
        delayMs?: number;            // default 300
    };

    const waitForActiveEntitlements = async ({
                                                 minActive = 1,
                                                 includeOneOf,
                                                 tries = 8,
                                                 delayMs = 300,
                                             }: WaitOpts = {}) => {
        let last: CustomerInfo | null = null;

        for (let i = 0; i < tries; i++) {
            const ci = await Purchases.getCustomerInfo();
            last = ci;
            const active = ci?.entitlements?.active ?? {};
            const keys = Object.keys(active);

            const okCount = keys.length >= minActive;
            const okInclude =
                !includeOneOf || includeOneOf.some((k) => keys.includes(k));

            if (okCount && okInclude) {
                setInfo(ci);
                return keys;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }

        // Fall back: commit whatever we have so UI is consistent
        if (last) setInfo(last);
        return Object.keys(last?.entitlements?.active ?? {});
    };


    return {
        configured,
        loading,
        error,
        info,
        activeEntitlements,
        products,
        productsById,
        refresh,
        purchaseProduct,
        purchaseBySku,
        restore,
        getCustomerInfoFresh,
        waitForActiveEntitlements
    };
}
