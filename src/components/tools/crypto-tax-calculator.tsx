"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Percent,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { getCoinTrackerAffiliateUrl, getExchangeAffiliateUrl } from "@/config/affiliates";

interface CryptoTaxCalculatorProps {
  initialBaseCurrency?: string;
  initialQuoteCurrency?: string;
  initialExchange?: string;
  defaultFeeRate?: number;
}

const TAX_BRACKETS = [
  { label: "US Federal: Standard Bracket (24% ST / 15% LT)", st: 24, lt: 15 },
  { label: "US Federal: High Earner (35% ST / 20% LT)", st: 35, lt: 20 },
  { label: "US Federal: Top Bracket (37% ST / 20% LT)", st: 37, lt: 20 },
  { label: "US Federal: Lower Bracket (12% ST / 0% LT)", st: 12, lt: 0 },
  { label: "UK HMRC: Capital Gains (20% flat)", st: 20, lt: 20 },
  { label: "Germany: Held > 1 Year (Tax Free / 26.375% ST)", st: 26.375, lt: 0 },
  { label: "Australia ATO: 50% CGT Discount (32.5% ST / 16.25% LT)", st: 32.5, lt: 16.25 },
  { label: "Custom Tax Rate", st: 25, lt: 15 },
];

export function CryptoTaxCalculator({
  initialBaseCurrency = "BTC",
  initialQuoteCurrency = "USD",
  initialExchange = "Binance",
  defaultFeeRate = 0.1,
}: CryptoTaxCalculatorProps) {
  // Input States
  const [baseCurrency] = useState(initialBaseCurrency.toUpperCase());
  const [quoteCurrency] = useState(initialQuoteCurrency.toUpperCase());
  const [exchange] = useState(initialExchange);

  const [buyPrice, setBuyPrice] = useState<string>("45000");
  const [sellPrice, setSellPrice] = useState<string>("68000");
  const [quantity, setQuantity] = useState<string>("1.5");
  const [holdingPeriod, setHoldingPeriod] = useState<"short-term" | "long-term">("short-term");
  const [selectedBracketIndex, setSelectedBracketIndex] = useState<number>(0);
  const [customTaxRate, setCustomTaxRate] = useState<string>("25");
  const [feeRate, setFeeRate] = useState<string>(String(defaultFeeRate));
  const [accountingMethod, setAccountingMethod] = useState<"FIFO" | "LIFO" | "HIFO">("FIFO");
  const [copied, setCopied] = useState<boolean>(false);

  // Math & Tax Computation Engine
  const calculations = useMemo(() => {
    const buyP = parseFloat(buyPrice) || 0;
    const sellP = parseFloat(sellPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    const feePct = (parseFloat(feeRate) || 0) / 100;

    // 1. Cost Basis with allowable acquisition fee
    const grossCost = qty * buyP;
    const buyFeeAmount = grossCost * feePct;
    const totalCostBasis = grossCost + buyFeeAmount;

    // 2. Disposal Proceeds with allowable disposal fee
    const grossProceeds = qty * sellP;
    const sellFeeAmount = grossProceeds * feePct;
    const netProceeds = grossProceeds - sellFeeAmount;

    // 3. Capital Gain or Loss
    const totalFees = buyFeeAmount + sellFeeAmount;
    const capitalGain = netProceeds - totalCostBasis;
    const isProfit = capitalGain > 0;
    const roiPercentage = totalCostBasis > 0 ? (capitalGain / totalCostBasis) * 100 : 0;

    // 4. Determine Tax Rate
    let applicableTaxRate = 0;
    if (selectedBracketIndex === TAX_BRACKETS.length - 1) {
      applicableTaxRate = parseFloat(customTaxRate) || 0;
    } else {
      const bracket = TAX_BRACKETS[selectedBracketIndex];
      applicableTaxRate = holdingPeriod === "short-term" ? bracket.st : bracket.lt;
    }

    // 5. Estimated Tax Liability
    const estimatedTaxOwed = isProfit ? capitalGain * (applicableTaxRate / 100) : 0;
    const netProfitAfterTax = isProfit ? capitalGain - estimatedTaxOwed : capitalGain;

    return {
      grossCost,
      buyFeeAmount,
      totalCostBasis,
      grossProceeds,
      sellFeeAmount,
      totalFees,
      capitalGain,
      isProfit,
      roiPercentage,
      applicableTaxRate,
      estimatedTaxOwed,
      netProfitAfterTax,
    };
  }, [
    buyPrice,
    sellPrice,
    quantity,
    feeRate,
    selectedBracketIndex,
    holdingPeriod,
    customTaxRate,
  ]);

  const copySnapshot = () => {
    const text = `Genesis Crypto Tax Report (${baseCurrency}/${quoteCurrency} on ${exchange})
Cost Basis: $${calculations.totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Gross Proceeds: $${calculations.grossProceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Total Exchange Fees: $${calculations.totalFees.toFixed(2)}
Net Capital Gain: $${calculations.capitalGain.toFixed(2)} (${calculations.roiPercentage.toFixed(2)}% ROI)
Estimated Tax (${calculations.applicableTaxRate}% ${holdingPeriod}): $${calculations.estimatedTaxOwed.toFixed(2)}
Net After-Tax Profit: $${calculations.netProfitAfterTax.toFixed(2)}
Generated by Project Genesis Crypto Tools`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const coinTrackerUrl = getCoinTrackerAffiliateUrl(`${baseCurrency}_${quoteCurrency}_${exchange}`.toLowerCase());
  const exchangeUrl = getExchangeAffiliateUrl(exchange, `${baseCurrency}_${quoteCurrency}`.toLowerCase());

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Calculator Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Controls */}
        <Card className="lg:col-span-7 shadow-md border-border/80 bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calculator className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  {baseCurrency} Tax & PnL Calculator
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                {exchange} Orderbook
              </Badge>
            </div>
            <CardDescription>
              Calculate capital gains tax, trading fees, and net take-home profit for {baseCurrency}/{quoteCurrency} trades.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            {/* Currency Quantity & Pair Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-semibold text-muted-foreground">
                  Quantity ({baseCurrency})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="1.0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="buyPrice" className="text-xs font-semibold text-muted-foreground">
                  Buy Price ({quoteCurrency})
                </Label>
                <Input
                  id="buyPrice"
                  type="number"
                  step="any"
                  placeholder="40000"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sellPrice" className="text-xs font-semibold text-muted-foreground">
                  Sell Price ({quoteCurrency})
                </Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="any"
                  placeholder="65000"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>
            </div>

            {/* Holding Period Tabs */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Holding Period Classification
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {holdingPeriod === "short-term" ? "Held < 1 Year (Ordinary Income)" : "Held ≥ 1 Year (Preferential Rate)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg border border-border/50">
                <button
                  type="button"
                  onClick={() => setHoldingPeriod("short-term")}
                  className={`py-2 text-xs font-medium rounded-md transition-all ${
                    holdingPeriod === "short-term"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Short-Term (&lt; 12 mo)
                </button>
                <button
                  type="button"
                  onClick={() => setHoldingPeriod("long-term")}
                  className={`py-2 text-xs font-medium rounded-md transition-all ${
                    holdingPeriod === "long-term"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Long-Term (≥ 12 mo)
                </button>
              </div>
            </div>

            {/* Tax Jurisdiction & Bracket */}
            <div className="space-y-1.5">
              <Label htmlFor="bracket" className="text-xs font-semibold text-muted-foreground">
                Tax Jurisdiction / Rate Preset
              </Label>
              <Select
                value={String(selectedBracketIndex)}
                onValueChange={(val) => setSelectedBracketIndex(Number(val))}
              >
                <SelectTrigger id="bracket" className="w-full text-xs">
                  <SelectValue placeholder="Select tax regime" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_BRACKETS.map((bracket, idx) => (
                    <SelectItem key={idx} value={String(idx)} className="text-xs">
                      {bracket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Tax Rate if selected */}
            {selectedBracketIndex === TAX_BRACKETS.length - 1 && (
              <div className="space-y-1.5 animate-in fade-in">
                <Label htmlFor="customTax" className="text-xs font-semibold text-muted-foreground">
                  Custom Tax Rate (%)
                </Label>
                <Input
                  id="customTax"
                  type="number"
                  min="0"
                  max="100"
                  value={customTaxRate}
                  onChange={(e) => setCustomTaxRate(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Fees and Accounting Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fees" className="text-xs font-semibold text-muted-foreground">
                    {exchange} Trading Fee (%)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Per order</span>
                </div>
                <div className="relative">
                  <Input
                    id="fees"
                    type="number"
                    step="0.01"
                    value={feeRate}
                    onChange={(e) => setFeeRate(e.target.value)}
                    className="font-mono text-xs pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="method" className="text-xs font-semibold text-muted-foreground">
                    Accounting Method
                  </Label>
                  <span className="text-[11px] text-muted-foreground">IRS Compliant</span>
                </div>
                <Select
                  value={accountingMethod}
                  onValueChange={(val: "FIFO" | "LIFO" | "HIFO") => setAccountingMethod(val)}
                >
                  <SelectTrigger id="method" className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO" className="text-xs">FIFO (First-In First-Out)</SelectItem>
                    <SelectItem value="LIFO" className="text-xs">LIFO (Last-In First-Out)</SelectItem>
                    <SelectItem value="HIFO" className="text-xs">HIFO (Highest-In First-Out)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex justify-between items-center border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Formula compliant with IRS Form 8949 rules
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySnapshot}
              className="text-xs h-8 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Breakdown
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: Calculations & Affiliate CTAs */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Results Card */}
          <Card className={`shadow-md border ${calculations.isProfit ? "border-emerald-500/30" : "border-rose-500/30"} bg-card`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Estimated Summary
                </span>
                <Badge
                  variant={calculations.isProfit ? "default" : "destructive"}
                  className={calculations.isProfit ? "bg-emerald-600 hover:bg-emerald-600 font-semibold" : "font-semibold"}
                >
                  {calculations.isProfit ? (
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 mr-1" />
                  )}
                  {calculations.roiPercentage >= 0 ? "+" : ""}
                  {calculations.roiPercentage.toFixed(2)}% ROI
                </Badge>
              </div>

              {/* Primary Net Gain / Loss Callout */}
              <div className="pt-2">
                <span className="text-xs text-muted-foreground font-medium">Net Profit After Tax & Fees</span>
                <div className={`text-3xl font-extrabold tracking-tight ${calculations.isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {calculations.isProfit ? "+" : "-"}${Math.abs(calculations.netProfitAfterTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 text-xs">
              <Separator />

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total Cost Basis (Buy + Fee)</span>
                <span className="font-mono font-medium">${calculations.totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Gross Proceeds (Sell Value)</span>
                <span className="font-mono font-medium">${calculations.grossProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total {exchange} Fees Paid</span>
                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">-${calculations.totalFees.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-1 font-semibold">
                <span className="text-foreground">Taxable Capital Gain / Loss</span>
                <span className={`font-mono ${calculations.isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  {calculations.capitalGain >= 0 ? "+" : "-"}${Math.abs(calculations.capitalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between py-1 bg-muted/40 p-2 rounded-md border border-border/40">
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground block">
                    Estimated Tax Owed ({calculations.applicableTaxRate}%)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Based on {holdingPeriod} tax classification
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 self-center">
                  ${calculations.estimatedTaxOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Primary Affiliate Monetization Block: Crypto Tax Software */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-background to-accent/20 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                  OFFICIAL PARTNER OFFER
                </Badge>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Save 20% Today
                </span>
              </div>
              <CardTitle className="text-base font-bold flex items-center gap-1.5 pt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Automate Your {exchange} Taxes
              </CardTitle>
              <CardDescription className="text-xs">
                Don&apos;t calculate thousands of transactions manually. Connect your {exchange} API to CoinTracker for instant IRS Form 8949 & TurboTax exports.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <a
                href={coinTrackerUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="w-full inline-flex"
              >
                <Button className="w-full font-semibold shadow-sm text-xs gap-1.5">
                  Claim 20% Off CoinTracker
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Secondary Affiliate Monetization Block: Exchange Sign-Up Discount */}
          <Card className="border-border/80 bg-card/60 shadow-sm">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <p className="text-xs font-semibold">Active {exchange} Trader?</p>
                <p className="text-[11px] text-muted-foreground">
                  Get up to 20% trading fee discount on spot & futures trades.
                </p>
              </div>
              <a
                href={exchangeUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="shrink-0"
              >
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  Trade on {exchange}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
