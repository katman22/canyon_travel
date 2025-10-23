// @/utils/pricing.ts
import type Purchases from "react-native-purchases";
export type RCProduct = Awaited<ReturnType<typeof Purchases.getProducts>>[number];

type Any = Record<string, any>;

const candidates = (p: Any) => [
  p,
  p?.defaultOption,
  Array.isArray(p?.subscriptionOptions) ? p.subscriptionOptions[0] : undefined,
  p?.product,                 // some SDK shapes
  p?.productDetails,          // some SDK shapes
  p?.googleProduct,           // some SDK shapes
  p?.googleProductDetails,    // some SDK shapes
  p?.storeProduct,            // some SDK shapes
].filter(Boolean);

// Try both GPB v6 “offer → phases” and older shapes
const firstPhase = (obj: Any) => {
  // GPB v6 via ProductDetails
  const viaOffer = obj?.subscriptionOfferDetails?.[0]?.pricingPhases;
  if (Array.isArray(viaOffer) && viaOffer.length) return viaOffer[0];

  // RC StoreProduct option style
  const phases = obj?.pricingPhases;
  if (Array.isArray(phases) && phases.length) return phases[0];

  // Some shapes nest phases under { pricingPhases: { phases: [...] } }
  const nested = obj?.pricingPhases?.phases;
  if (Array.isArray(nested) && nested.length) return nested[0];

  return undefined;
};

/** "$7.99" | "$49.99" | undefined */
export function getPriceString(p?: RCProduct): string | undefined {
  if (!p) return undefined;

  // Legacy/simple path
  const top = (p as Any).priceString as string | undefined;
  if (top) return top;

  // Look through likely nests
  for (const obj of candidates(p as Any)) {
    const phase = firstPhase(obj);
    const fp = phase?.formattedPrice as string | undefined;
    if (fp) return fp;
  }

  // Numeric fallback (format ourselves)
  const price = (p as Any).price as number | undefined;
  const cc = (p as Any).currencyCode as string | undefined;
  if (typeof price === "number" && cc) {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cc }).format(price);
    } catch {
      return `${price.toFixed(2)} ${cc}`;
    }
  }

  return undefined;
}

/** "USD" | undefined */
export function getCurrencyCode(p?: RCProduct): string | undefined {
  if (!p) return undefined;
  const top = (p as Any).currencyCode as string | undefined;
  if (top) return top;

  for (const obj of candidates(p as Any)) {
    const phase = firstPhase(obj);
    const code = phase?.priceCurrencyCode as string | undefined;
    if (code) return code;
  }
  return undefined;
}

/** "/mo" | "/yr" | "" — prefer billingPeriod; fallback to SKU suffix if needed */
export function getUnit(p?: RCProduct, skuFallback?: string): "/mo" | "/yr" | "" {
  if (p) {
    for (const obj of candidates(p as Any)) {
      const phase = firstPhase(obj);
      const period = phase?.billingPeriod || obj?.billingPeriod;
      if (period === "P1M") return "/mo";
      if (period === "P1Y") return "/yr";
    }
  }
  // fallback from identifier naming
  if (skuFallback?.includes("_monthly")) return "/mo";
  if (skuFallback?.includes("_yearly")) return "/yr";
  return "";
}

/** Optional: quick shape probe while debugging */
export function debugDescribeProduct(p?: RCProduct) {
  if (!p) return {};
  const a = p as Any;
  return {
    id: a.identifier,
    hasPriceString: !!a.priceString,
    hasDefaultOption: !!a.defaultOption,
    subOptionsLen: Array.isArray(a.subscriptionOptions) ? a.subscriptionOptions.length : 0,
    keys: Object.keys(a),
  };
}

export function getNumericPrice(p?: RCProduct): number | undefined {
  if (!p) return undefined;

  // Try any candidate’s first phase → priceAmountMicros
  for (const obj of candidates(p as Any)) {
    const phase = firstPhase(obj);
    const micros = phase?.priceAmountMicros as number | undefined;
    if (typeof micros === "number" && Number.isFinite(micros)) {
      return micros / 1e6; // USD 4_990_000 → 4.99
    }
  }

  // Fallback: older RC shapes sometimes expose .price directly
  const fallback = (p as Any).price as number | undefined;
  return typeof fallback === "number" ? fallback : undefined;
}

export function getYearlySavingsPct(
    monthly?: RCProduct,
    yearly?: RCProduct
): number | undefined {
  const m = getNumericPrice(monthly);
  const y = getNumericPrice(yearly);
  if (!m || !y) return undefined;

  const pct = (1 - y / (m * 12)) * 100;
  const rounded = Math.round(pct);
  return Number.isFinite(rounded) ? Math.max(0, rounded) : undefined;
}