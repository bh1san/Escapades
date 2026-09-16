/**
 * Project Genesis - Central Affiliate Configuration & Tracking Layer
 * 
 * Manages all partner affiliate IDs, dynamic link generation with sub-IDs,
 * and UTM tracking across programmatic sub-pages.
 */

export interface AffiliatePartner {
  id: string;
  name: string;
  category: "tax_software" | "exchange" | "hardware_wallet";
  headline: string;
  subtext: string;
  badge: string;
  ctaText: string;
  discountNote?: string;
  generateUrl: (subId?: string) => string;
}

export const AFFILIATE_CONFIG = {
  // Tax Software
  coinTracker: {
    partnerId: process.env.NEXT_PUBLIC_COINTRACKER_AFFILIATE_ID || "GENESIS_DEMO",
    baseUrl: "https://www.cointracker.io/a",
    defaultDiscount: "20% OFF",
  },
  koinly: {
    partnerId: process.env.NEXT_PUBLIC_KOINLY_AFFILIATE_ID || "GENESIS_DEMO",
    baseUrl: "https://koinly.io",
    defaultDiscount: "30% OFF",
  },
  // Exchanges
  binance: {
    refCode: process.env.NEXT_PUBLIC_BINANCE_REF_CODE || "GENESIS_REF",
    baseUrl: "https://accounts.binance.com/register",
    feeKickback: "20% Fee Kickback",
  },
  bybit: {
    refCode: process.env.NEXT_PUBLIC_BYBIT_REF_CODE || "GENESIS_REF",
    baseUrl: "https://partner.bybit.com/b",
    feeKickback: "$30,000 Deposit Bonus",
  },
  coinbase: {
    refCode: process.env.NEXT_PUBLIC_COINBASE_REF_CODE || "GENESIS_REF",
    baseUrl: "https://coinbase.com/join",
    feeKickback: "$10 Free Bitcoin",
  },
  kraken: {
    refCode: process.env.NEXT_PUBLIC_KRAKEN_REF_CODE || "GENESIS_REF",
    baseUrl: "https://r.kraken.com",
    feeKickback: "Zero Fee Starter",
  },
};

/**
 * Generates tracked affiliate URLs with sub-tracking IDs and UTM parameters
 */
export function buildAffiliateUrl(
  base: string,
  params: Record<string, string | undefined>
): string {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  } catch {
    // Fallback if base is a relative or shorthand path
    const query = Object.entries(params)
      .filter(([_, v]) => Boolean(v))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join("&");
    return `${base}${base.includes("?") ? "&" : "?"}${query}`;
  }
}

export function getCoinTrackerAffiliateUrl(pageSubId = "calculator_cta"): string {
  const { baseUrl, partnerId } = AFFILIATE_CONFIG.coinTracker;
  return `${baseUrl}/${partnerId}?utm_source=genesis_network&utm_medium=microtool&utm_campaign=crypto_tax&subid=${pageSubId}`;
}

export function getKoinlyAffiliateUrl(pageSubId = "calculator_cta"): string {
  const { baseUrl, partnerId } = AFFILIATE_CONFIG.koinly;
  return `${baseUrl}?via=${partnerId}&utm_source=genesis_network&utm_medium=microtool&subid=${pageSubId}`;
}

export function getExchangeAffiliateUrl(exchangeId: string, pageSubId = "exchange_cta"): string {
  const key = exchangeId.toLowerCase();

  switch (key) {
    case "binance":
      return buildAffiliateUrl(AFFILIATE_CONFIG.binance.baseUrl, {
        ref: AFFILIATE_CONFIG.binance.refCode,
        utm_source: "genesis_network",
        subId: pageSubId,
      });
    case "bybit":
      return `${AFFILIATE_CONFIG.bybit.baseUrl}/${AFFILIATE_CONFIG.bybit.refCode}?subid=${pageSubId}`;
    case "coinbase":
      return `${AFFILIATE_CONFIG.coinbase.baseUrl}/${AFFILIATE_CONFIG.coinbase.refCode}?src=genesis_network`;
    case "kraken":
      return `${AFFILIATE_CONFIG.kraken.baseUrl}/${AFFILIATE_CONFIG.kraken.refCode}?subid=${pageSubId}`;
    default:
      return buildAffiliateUrl("https://accounts.binance.com/register", {
        ref: AFFILIATE_CONFIG.binance.refCode,
        utm_source: "genesis_fallback",
        subId: pageSubId,
      });
  }
}
