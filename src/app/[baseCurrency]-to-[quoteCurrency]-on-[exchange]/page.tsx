import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CryptoTaxCalculator } from "@/components/tools/crypto-tax-calculator";
import {
  SUPPORTED_BASE_CURRENCIES,
  SUPPORTED_QUOTE_CURRENCIES,
  SUPPORTED_EXCHANGES,
  getTopProgrammaticRoutes,
} from "@/config/seo-data";
import { getCoinTrackerAffiliateUrl, getExchangeAffiliateUrl } from "@/config/affiliates";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Coins,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    baseCurrency: string;
    quoteCurrency: string;
    exchange: string;
  }>;
}

// 1. Programmatic SEO: Generate static params for SSG
export async function generateStaticParams() {
  return getTopProgrammaticRoutes();
}

// 2. Programmatic SEO: High-intent Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { baseCurrency, quoteCurrency, exchange } = await params;

  const base = SUPPORTED_BASE_CURRENCIES[baseCurrency.toLowerCase()] || {
    symbol: baseCurrency.toUpperCase(),
    name: baseCurrency.toUpperCase(),
  };
  const quote = SUPPORTED_QUOTE_CURRENCIES[quoteCurrency.toLowerCase()] || {
    symbol: quoteCurrency.toUpperCase(),
    name: quoteCurrency.toUpperCase(),
  };
  const ex = SUPPORTED_EXCHANGES[exchange.toLowerCase()] || {
    name: exchange.charAt(0).toUpperCase() + exchange.slice(1),
  };

  const title = `${base.name} (${base.symbol}) to ${quote.symbol} Tax Calculator on ${ex.name} | 2025/2026 Guide`;
  const description = `Calculate your capital gains tax and trading fees when trading ${base.symbol}/${quote.symbol} on ${ex.name}. Form 8949 compliance, short vs long-term rates, and fee deduction guide.`;

  return {
    title,
    description,
    keywords: [
      `${base.symbol} to ${quote.symbol} tax`,
      `${base.symbol} ${ex.name} taxes`,
      `${base.symbol} capital gains calculator`,
      `calculate ${base.symbol} tax on ${ex.name}`,
      `crypto tax calculator 2025`,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Project Genesis Crypto Tools",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/${baseCurrency.toLowerCase()}-to-${quoteCurrency.toLowerCase()}-on-${exchange.toLowerCase()}`,
    },
  };
}

export default async function ProgrammaticCryptoTaxPage({ params }: PageProps) {
  const { baseCurrency, quoteCurrency, exchange } = await params;

  const base = SUPPORTED_BASE_CURRENCIES[baseCurrency.toLowerCase()] || {
    symbol: baseCurrency.toUpperCase(),
    name: baseCurrency.toUpperCase(),
  };
  const quote = SUPPORTED_QUOTE_CURRENCIES[quoteCurrency.toLowerCase()] || {
    symbol: quoteCurrency.toUpperCase(),
    name: quoteCurrency.toUpperCase(),
  };
  const ex = SUPPORTED_EXCHANGES[exchange.toLowerCase()] || {
    id: exchange.toLowerCase(),
    name: exchange.charAt(0).toUpperCase() + exchange.slice(1),
    defaultMakerFee: 0.1,
    defaultTakerFee: 0.1,
    taxReportingPolicy: `Users trading on ${exchange} must export their CSV trade history or connect an automated tax platform to reconcile taxable gain/loss events.`,
    fallbackUrl: `https://${exchange.toLowerCase()}.com`,
    affiliateParamKey: "ref",
  };

  const coinTrackerUrl = getCoinTrackerAffiliateUrl(
    `${base.symbol}_${quote.symbol}_${ex.name}`.toLowerCase()
  );
  const exchangeAffiliateUrl = getExchangeAffiliateUrl(
    ex.id,
    `${base.symbol}_${quote.symbol}`.toLowerCase()
  );

  // JSON-LD Structured Data Schema for Google Search Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": `${base.symbol} to ${quote.symbol} Tax Calculator on ${ex.name}`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "description": `Interactive tax calculator for ${base.name} (${base.symbol}) trades in ${quote.symbol} on ${ex.name}.`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "/",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Crypto Tax Calculators",
            "item": "/calculators",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": `${base.symbol} to ${quote.symbol} on ${ex.name}`,
            "item": `/${baseCurrency.toLowerCase()}-to-${quoteCurrency.toLowerCase()}-on-${exchange.toLowerCase()}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Is selling ${base.symbol} for ${quote.symbol} on ${ex.name} a taxable event?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes. In almost all jurisdictions including the US, UK, Canada, and Australia, disposing of ${base.symbol} (whether selling for fiat ${quote.symbol}, trading for a stablecoin, or swapping for another cryptocurrency) is a taxable event that triggers capital gains tax.`,
            },
          },
          {
            "@type": "Question",
            "name": `Can I deduct ${ex.name} trading fees from my ${base.symbol} taxes?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes. Exchange fees paid when purchasing ${base.symbol} can be added to your cost basis, and fees paid when selling can be deducted from your gross proceeds, effectively reducing your overall taxable capital gain.`,
            },
          },
          {
            "@type": "Question",
            "name": `Does ${ex.name} report ${base.symbol} trades directly to the IRS?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${ex.taxReportingPolicy}`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Banner / Breadcrumbs */}
      <header className="border-b border-border/60 bg-muted/20 py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Tools
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="hover:text-foreground cursor-pointer">
              Tax Calculators
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-foreground">
              {base.symbol} / {quote.symbol} ({ex.name})
            </span>
          </nav>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              Tax Year 2025/2026 Ready
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <div className="space-y-3 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-1">
            <Coins className="h-3.5 w-3.5" />
            Programmatic Tax Engine
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {base.name} ({base.symbol}) to {quote.symbol} Tax Calculator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Estimate your capital gains tax, deduct {ex.name} maker/taker fees, and calculate net profit after taxes for your <span className="font-semibold text-foreground">{base.symbol}/{quote.symbol}</span> trades.
          </p>
        </div>

        {/* The Interactive Tool Component */}
        <section aria-label="Tax Calculator">
          <CryptoTaxCalculator
            initialBaseCurrency={base.symbol}
            initialQuoteCurrency={quote.symbol}
            initialExchange={ex.name}
            defaultFeeRate={ex.defaultMakerFee}
          />
        </section>

        {/* Programmatic SEO Deep-Dive Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          {/* Exchange Fee Deductibility Card */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-primary">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-base font-bold">
                  {ex.name} Fee Deductions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                Standard maker/taker fees on {ex.name} average around <span className="font-semibold text-foreground">{ex.defaultMakerFee}%</span>. Under IRS Notice 2014-21, acquisition trading fees are added to your <strong className="text-foreground">cost basis</strong>, while disposition trading fees reduce your <strong className="text-foreground">gross proceeds</strong>.
              </p>
              <p>
                This double deduction reduces your net capital gains, saving you money on your tax bill.
              </p>
            </CardContent>
          </Card>

          {/* Tax Reporting Obligations Card */}
          <Card className="border-border/70 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
                <CardTitle className="text-base font-bold">
                  IRS & Global Reporting
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                {ex.taxReportingPolicy}
              </p>
              <p>
                Every disposal of {base.symbol} must be reported on <strong className="text-foreground">IRS Form 8949</strong> (Sales and Other Dispositions of Capital Assets) and summarized on Schedule D.
              </p>
            </CardContent>
          </Card>

          {/* Automated Solution Promo */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-card to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <CardTitle className="text-base font-bold">
                  1-Click {ex.name} Tax Sync
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                Tired of tracking every single buy, sell, and transfer? Automatically sync your {ex.name} wallet via read-only API or CSV upload.
              </p>
              <a
                href={coinTrackerUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-block w-full"
              >
                <Button size="sm" className="w-full text-xs font-semibold gap-1">
                  Claim 20% Discount
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Programmatic FAQ Accordion (Targets Long-Tail Search Intent) */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">
              Frequently Asked Questions: {base.symbol} on {ex.name}
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full bg-card rounded-lg border border-border/80 px-4">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                How do I report my {base.symbol} trades on {ex.name} to the IRS?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                You must list each individual trade or aggregate summarized disposals on Form 8949. You need to record the date acquired, date sold, gross proceeds in {quote.symbol}, cost basis, and total gain or loss. If held for less than 365 days, it is taxed as short-term capital gains at your ordinary income tax rate.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                What accounting method should I use: FIFO, LIFO, or HIFO?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                The default method recognized by the IRS is First-In, First-Out (FIFO). However, specific identification methods like HIFO (Highest-In, First-Out) can legally minimize your short-term taxable gain if you can provide adequate records showing specific lot IDs and purchase timestamps.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                Does {ex.name} automatically withhold taxes on my trades?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                No. Cryptocurrency exchanges do not withhold taxes on crypto spot trades. Taxpayers are solely responsible for calculating their net gains, making estimated quarterly tax payments if required, and paying any liability at tax filing time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Programmatic Internal Link Grid (Spiders & PageRank Distribution) */}
        <section className="space-y-4 pt-4 border-t border-border/60">
          <h2 className="text-lg font-bold tracking-tight">
            Explore Related {base.symbol} & {ex.name} Calculators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(SUPPORTED_QUOTE_CURRENCIES)
              .filter(([qKey]) => qKey !== quoteCurrency.toLowerCase())
              .slice(0, 4)
              .map(([qKey, qInfo]) => (
                <Link
                  key={qKey}
                  href={`/${baseCurrency.toLowerCase()}-to-${qKey}-on-${exchange.toLowerCase()}`}
                  className="p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-muted/30 transition-all text-xs flex items-center justify-between group"
                >
                  <span>{base.symbol} to {qInfo.symbol} ({ex.name})</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              ))}

            {Object.entries(SUPPORTED_EXCHANGES)
              .filter(([exKey]) => exKey !== exchange.toLowerCase())
              .slice(0, 4)
              .map(([exKey, exInfo]) => (
                <Link
                  key={exKey}
                  href={`/${baseCurrency.toLowerCase()}-to-${quoteCurrency.toLowerCase()}-on-${exKey}`}
                  className="p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-muted/30 transition-all text-xs flex items-center justify-between group"
                >
                  <span>{base.symbol}/{quote.symbol} on {exInfo.name}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </Link>
              ))}
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="text-center text-[11px] text-muted-foreground pt-8 pb-4 border-t border-border/40">
          <p>
            Disclaimer: This tool and programmatic guide are for informational and educational purposes only and do not constitute formal legal or financial tax advice. Consult a certified public accountant (CPA) or tax attorney for your specific tax jurisdiction.
          </p>
        </footer>
      </main>
    </div>
  );
}
