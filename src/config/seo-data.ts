import { CurrencyInfo, ExchangeInfo } from "@/types/crypto";

export const SUPPORTED_BASE_CURRENCIES: Record<string, CurrencyInfo> = {
  btc: { symbol: "BTC", name: "Bitcoin", category: "crypto" },
  eth: { symbol: "ETH", name: "Ethereum", category: "crypto" },
  sol: { symbol: "SOL", name: "Solana", category: "crypto" },
  xrp: { symbol: "XRP", name: "XRP", category: "crypto" },
  doge: { symbol: "DOGE", name: "Dogecoin", category: "crypto" },
  ada: { symbol: "ADA", name: "Cardano", category: "crypto" },
  bnb: { symbol: "BNB", name: "BNB", category: "crypto" },
  avax: { symbol: "AVAX", name: "Avalanche", category: "crypto" },
  sui: { symbol: "SUI", name: "Sui", category: "crypto" },
  link: { symbol: "LINK", name: "Chainlink", category: "crypto" },
};

export const SUPPORTED_QUOTE_CURRENCIES: Record<string, CurrencyInfo> = {
  usd: { symbol: "USD", name: "US Dollar", category: "fiat" },
  usdt: { symbol: "USDT", name: "Tether USD", category: "stablecoin" },
  eur: { symbol: "EUR", name: "Euro", category: "fiat" },
  gbp: { symbol: "GBP", name: "British Pound", category: "fiat" },
  cad: { symbol: "CAD", name: "Canadian Dollar", category: "fiat" },
  aud: { symbol: "AUD", name: "Australian Dollar", category: "fiat" },
};

export const SUPPORTED_EXCHANGES: Record<string, ExchangeInfo> = {
  binance: {
    id: "binance",
    name: "Binance",
    defaultMakerFee: 0.1,
    defaultTakerFee: 0.1,
    taxReportingPolicy:
      "Binance provides complete CSV transaction history and Tax API integration for automated capital gains calculation. Depending on your jurisdiction (e.g. EU DAC8, UK HMRC, Australia ATO), Binance may share user data with local tax authorities.",
    affiliateParamKey: "ref",
    fallbackUrl: "https://binance.com",
  },
  coinbase: {
    id: "coinbase",
    name: "Coinbase",
    defaultMakerFee: 0.4,
    defaultTakerFee: 0.6,
    taxReportingPolicy:
      "Coinbase issues IRS Form 1099-DA (Digital Assets) and 1099-MISC for staking rewards over $600 to US residents. All spot trades and conversions trigger taxable disposal events requiring Form 8949 reporting.",
    affiliateParamKey: "code",
    fallbackUrl: "https://coinbase.com",
  },
  kraken: {
    id: "kraken",
    name: "Kraken",
    defaultMakerFee: 0.25,
    defaultTakerFee: 0.4,
    taxReportingPolicy:
      "Kraken enables direct ledger exports with timestamps and fee deductions. Kraken complies with regional legal requests and automated tax reporting regimes in the UK (HMRC), Canada (CRA), and Australia (ATO).",
    affiliateParamKey: "ref",
    fallbackUrl: "https://kraken.com",
  },
  bybit: {
    id: "bybit",
    name: "Bybit",
    defaultMakerFee: 0.1,
    defaultTakerFee: 0.1,
    taxReportingPolicy:
      "Bybit generates standard trade logs and derivatives funding rate reports. In non-US jurisdictions, taxpayers must self-report gains from Bybit spot and futures contracts.",
    affiliateParamKey: "affiliate",
    fallbackUrl: "https://bybit.com",
  },
};

/**
 * Pre-generate the highest volume combinations for Next.js static page generation
 */
export function getTopProgrammaticRoutes(): Array<{
  baseCurrency: string;
  quoteCurrency: string;
  exchange: string;
}> {
  const topBases = ["btc", "eth", "sol", "xrp", "doge"];
  const topQuotes = ["usd", "usdt", "eur"];
  const topExchanges = ["binance", "coinbase", "kraken", "bybit"];

  const routes: Array<{
    baseCurrency: string;
    quoteCurrency: string;
    exchange: string;
  }> = [];

  for (const base of topBases) {
    for (const quote of topQuotes) {
      for (const exchange of topExchanges) {
        routes.push({
          baseCurrency: base,
          quoteCurrency: quote,
          exchange: exchange,
        });
      }
    }
  }

  return routes;
}
