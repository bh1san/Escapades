export type HoldingPeriod = "short-term" | "long-term";

export type AccountingMethod = "FIFO" | "LIFO" | "HIFO";

export interface TaxBracketOption {
  label: string;
  shortTermRate: number; // percentage, e.g., 24
  longTermRate: number;  // percentage, e.g., 15
}

export interface TaxCalculationResult {
  totalCostBasis: number;
  grossProceeds: number;
  buyFeeAmount: number;
  sellFeeAmount: number;
  totalFees: number;
  capitalGain: number;
  isProfit: boolean;
  roiPercentage: number;
  applicableTaxRate: number;
  estimatedTaxOwed: number;
  netProfitAfterTax: number;
}

export interface ProgrammaticParams {
  baseCurrency: string;
  quoteCurrency: string;
  exchange: string;
}

export interface ExchangeInfo {
  id: string;
  name: string;
  defaultMakerFee: number; // percentage, e.g. 0.1 for 0.1%
  defaultTakerFee: number;
  taxReportingPolicy: string;
  affiliateParamKey: string;
  fallbackUrl: string;
}

export interface CurrencyInfo {
  symbol: string;
  name: string;
  category: "crypto" | "fiat" | "stablecoin";
}
