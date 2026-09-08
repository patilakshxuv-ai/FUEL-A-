import React, { useEffect } from 'react';
import { SeoLandingPage, SEO_LANDING_PAGES, getSeoPageBySlug } from '../data/seoLandingPages';
import { TripCalculationInput } from '../types';
import { AdKeeperWidget } from './AdKeeperWidget';
import {
  ArrowLeft,
  Calculator,
  Compass,
  MapPin,
  Clock,
  Coins,
  Fuel,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Car,
  Zap,
  TrendingDown,
  Navigation,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface SeoLandingPageViewProps {
  page: SeoLandingPage;
  onBackToCalculator: () => void;
  onLoadIntoCalculator: (page: SeoLandingPage, vehicleEfficiency?: number) => void;
  onNavigateToSlug: (slug: string) => void;
}

export const SeoLandingPageView: React.FC<SeoLandingPageViewProps> = ({
  page,
  onBackToCalculator,
  onLoadIntoCalculator,
  onNavigateToSlug,
}) => {
  // Synchronize SEO Document Title & Meta Description
  useEffect(() => {
    const originalTitle = document.title;
    const metaDescEl = document.querySelector('meta[name="description"]');
    const originalDesc = metaDescEl ? metaDescEl.getAttribute('content') : '';
    const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonical = canonicalEl?.href || '';

    // Set page-specific SEO metadata and a crawlable canonical URL.
    document.title = `${page.metaTitle} | FuelPath PRO`;
    if (metaDescEl) {
      metaDescEl.setAttribute('content', page.metaDescription);
    }
    if (canonicalEl) {
      canonicalEl.href = `${window.location.origin}/guide/${page.slug}`;
    }

    // Scroll to top upon opening page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDescEl && originalDesc) {
        metaDescEl.setAttribute('content', originalDesc);
      }
      if (canonicalEl && originalCanonical) {
        canonicalEl.href = originalCanonical;
      }
    };
  }, [page]);

  const relatedPages = page.relatedSlugs
    .map((slug) => getSeoPageBySlug(slug))
    .filter((p): p is SeoLandingPage => p !== undefined);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'route':
        return 'Highway Route Guide';
      case 'city':
        return 'City Fuel & Commute Guide';
      case 'fuel':
        return 'Fuel Type & Powertrain Economics';
      default:
        return 'Fuel Guide';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Navigation Top Bar & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-black p-4 shadow-xs">
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={onBackToCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-slate-800 text-white uppercase text-[11px] font-black tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Calculator</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 uppercase tracking-wider text-[11px]">
            {getCategoryLabel(page.category)}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-black font-black uppercase tracking-wider text-[11px] truncate max-w-[200px] sm:max-w-none">
            {page.title}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onLoadIntoCalculator(page)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#0da271] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-xs transition-all cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>Load Into Live Calculator</span>
        </button>
      </div>

      {/* Hero Header Section */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-1 bg-black text-[#10B981] text-[10px] font-black uppercase tracking-widest border border-black">
            {page.badge}
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest border border-slate-300">
            {page.unitSystem === 'metric' ? 'Metric (km & Liters)' : 'Imperial (Miles & Gallons)'}
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest border border-emerald-300">
            Verified Rates ({page.currency})
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900 leading-tight">
          {page.title}
        </h1>

        <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed max-w-4xl">
          {page.subtitle}
        </p>

        {/* Primary Callout CTA Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => onLoadIntoCalculator(page)}
            className="px-6 py-3.5 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-black shadow-md hover:shadow-none transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#10B981]" />
            <span>Customize with Your Exact Car & Fuel Price</span>
          </button>
          <span className="text-xs text-slate-500 font-medium self-center sm:self-auto text-center sm:text-left">
            Pre-fills route distance ({page.calculatorDefaults.distance}{' '}
            {page.unitSystem === 'metric' ? 'km' : 'mi'}), tolls, and current pump rates.
          </span>
        </div>
      </div>

      {/* Top Ad Unit */}
      <AdKeeperWidget widgetId="2076062" title="Travel & Driving Services" />

      {/* Key Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border-2 border-black p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-black" />
            <span>Distance / Span</span>
          </div>
          <p className="text-sm sm:text-base font-black text-black">
            {page.metrics.distanceLabel}
          </p>
        </div>

        <div className="bg-white border-2 border-black p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>Drive Time / Speed</span>
          </div>
          <p className="text-sm sm:text-base font-black text-black">
            {page.metrics.typicalDuration}
          </p>
        </div>

        <div className="bg-white border-2 border-black p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-black" />
            <span>Tolls & Fastag</span>
          </div>
          <p className="text-sm sm:text-base font-black text-black">
            {page.metrics.tollsCost}
          </p>
        </div>

        <div className="bg-white border-2 border-black p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <Fuel className="w-3.5 h-3.5 text-black" />
            <span>Fuel Needed</span>
          </div>
          <p className="text-sm sm:text-base font-black text-black">
            {page.metrics.avgFuelUsed}
          </p>
        </div>

        <div className="bg-white border-2 border-black p-4 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-wider">
            <TrendingDown className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Trip Cost Range</span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#10B981]">
            {page.metrics.estimatedCostRange}
          </p>
        </div>
      </div>

      {/* Vehicle Economy & Expenditure Comparison Table */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#10B981]" />
              <span>Vehicle Class & Powertrain Cost Comparison</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Realistic mileage figures accounting for highway cruising, elevation gradients, and traffic deceleration.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 px-2.5 py-1 border border-slate-300 self-start sm:self-auto">
            1-Click Calculator Sync
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-black">
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Vehicle Category</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Benchmark Model</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Avg Economy</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Fuel Volume</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Est. Fuel Cost</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700">Total with Tolls</th>
                <th className="p-3 font-black uppercase tracking-wider text-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {page.vehicleComparison.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-black text-slate-900">{item.category}</td>
                  <td className="p-3 font-medium text-slate-700">{item.name}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{item.avgMileage}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{item.fuelNeeded}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{item.fuelCost}</td>
                  <td className="p-3 font-mono font-black text-[#10B981]">{item.totalCostWithTolls}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onLoadIntoCalculator(page)}
                      className="px-2.5 py-1.5 bg-black hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider border border-black transition-colors cursor-pointer"
                    >
                      Calculate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Stack View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {page.vehicleComparison.map((item, index) => (
            <div key={index} className="border-2 border-black p-3.5 space-y-2.5 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-black uppercase">{item.category}</span>
                <span className="text-xs font-black text-[#10B981]">{item.totalCostWithTolls}</span>
              </div>
              <p className="text-xs font-medium text-slate-600">{item.name}</p>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-white p-2 border border-slate-200">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Economy</span>
                  <span className="font-bold">{item.avgMileage}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Fuel</span>
                  <span className="font-bold">{item.fuelNeeded}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Fuel Cost</span>
                  <span className="font-bold">{item.fuelCost}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">{item.highlights}</p>
              <button
                type="button"
                onClick={() => onLoadIntoCalculator(page)}
                className="w-full py-2 bg-black text-white text-[11px] font-black uppercase tracking-wider border border-black hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Calculate with this Vehicle
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mid Ad Unit */}
      <AdKeeperWidget widgetId="2076067" title="Smart Route & Roadside Services" />

      {/* Route & Geographic Context Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Overview & Toll Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-2 border-black p-6 space-y-4">
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-black" />
              <span>Route &amp; Operational Overview</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {page.routeOrCityDetails.overview}
            </p>

            {/* Key Technical Highlights */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block">
                Key Route Takeaways:
              </span>
              <ul className="space-y-2">
                {page.keyHighlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Toll Plazas & Rate Factors */}
          <div className="bg-white border-2 border-black p-6 space-y-4">
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#10B981]" />
              <span>Toll Plazas &amp; Price Drivers</span>
            </h2>
            <div className="space-y-2.5">
              {page.routeOrCityDetails.tollPlazasOrPriceFactors.map((toll, i) => (
                <div
                  key={i}
                  className="p-3 border-2 border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{toll.name}</span>
                    <span className="text-[11px] text-slate-500">{toll.note}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-black px-2.5 py-1 bg-white border border-black self-start sm:self-auto">
                    {toll.costOrRate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Driving Tips & Refuel Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-2 border-black p-6 space-y-4">
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Fuel Economy &amp; Driving Tips</span>
            </h2>
            <div className="space-y-3">
              {page.routeOrCityDetails.drivingTips.map((tip, i) => (
                <div key={i} className="p-3 bg-slate-50 border-l-4 border-black text-xs text-slate-700 leading-relaxed">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Calculator Action Card */}
          <div className="bg-[#111827] text-white border-2 border-black p-6 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981] block">
              Instant Estimation
            </span>
            <h3 className="text-lg font-black uppercase tracking-tight text-white">
              Ready to Calculate Your Exact Trip?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open the interactive calculator to adjust vehicle MPG or km/L, toggle passenger splitting, calculate commute days, or customize fuel pump rates.
            </p>
            <button
              type="button"
              onClick={() => onLoadIntoCalculator(page)}
              className="w-full py-3 bg-[#10B981] hover:bg-[#0da271] text-black font-black text-xs uppercase tracking-widest border-2 border-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Calculator With This Route</span>
            </button>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ Section for SEO) */}
      <div className="bg-white border-2 border-black p-6 sm:p-8 space-y-5">
        <div className="border-b-2 border-black pb-3">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-black" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Key travel insights, pump recommendations, and toll details.
          </p>
        </div>

        <div className="space-y-4">
          {page.faqs.map((faq, index) => (
            <div key={index} className="border-2 border-black p-4 space-y-2 bg-slate-50">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Guides & Internal Links Hub */}
      {relatedPages.length > 0 && (
        <div className="bg-white border-2 border-black p-6 space-y-4">
          <div className="border-b-2 border-black pb-3 flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#10B981]" />
              <span>Related Route &amp; Fuel Guides</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Internal Directory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedPages.map((relPage) => (
              <button
                key={relPage.slug}
                type="button"
                onClick={() => onNavigateToSlug(relPage.slug)}
                className="p-4 border-2 border-black hover:border-[#10B981] bg-slate-50 hover:bg-emerald-50/20 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-black text-[#10B981]">
                      {relPage.badge}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-colors" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-black line-clamp-2">
                    {relPage.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {relPage.metaDescription}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span>{relPage.metrics.distanceLabel}</span>
                  <span className="text-[#10B981] font-black">{relPage.metrics.estimatedCostRange}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Return Bar */}
      <div className="p-4 bg-slate-100 border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
            Ready to compute custom routes or split passenger costs?
          </span>
          <span className="text-[11px] text-slate-500">
            Use the complete FuelPath PRO engine with real-time currency conversion and live pump rates.
          </span>
        </div>
        <button
          type="button"
          onClick={onBackToCalculator}
          className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors shrink-0 cursor-pointer"
        >
          Return to Live Calculator
        </button>
      </div>
    </div>
  );
};
