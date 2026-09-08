import React, { useState } from 'react';
import { SeoLandingPage, SeoCategory, SEO_LANDING_PAGES } from '../data/seoLandingPages';
import {
  Compass,
  MapPin,
  Car,
  Fuel,
  ChevronRight,
  Calculator,
  Search,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface SeoDirectorySectionProps {
  onSelectPage: (slug: string) => void;
  onLoadIntoCalculator: (page: SeoLandingPage) => void;
}

export const SeoDirectorySection: React.FC<SeoDirectorySectionProps> = ({
  onSelectPage,
  onLoadIntoCalculator,
}) => {
  const [activeCategory, setActiveCategory] = useState<SeoCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = SEO_LANDING_PAGES.filter((page) => {
    const matchesCategory = activeCategory === 'all' || page.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      page.title.toLowerCase().includes(q) ||
      page.subtitle.toLowerCase().includes(q) ||
      page.slug.toLowerCase().includes(q) ||
      page.badge.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const routeCount = SEO_LANDING_PAGES.filter((p) => p.category === 'route').length;
  const cityCount = SEO_LANDING_PAGES.filter((p) => p.category === 'city').length;
  const fuelCount = SEO_LANDING_PAGES.filter((p) => p.category === 'fuel').length;

  return (
    <div id="seo-guides-directory" className="bg-white border-2 border-black p-5 sm:p-8 space-y-6 shadow-sm">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-[#10B981] flex items-center justify-center font-black">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Fuel Cost Guides &amp; Route Telemetry Hub
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Explore dedicated highway route guides, metro city fuel rates, and powertrain cost comparisons with real-world FASTag toll fees and mileage telemetry.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search route, city, or fuel..."
            className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-slate-50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 border-2 border-black transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-black text-[#10B981] shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Guides ({SEO_LANDING_PAGES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('route')}
          className={`px-3.5 py-2 border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'route'
              ? 'bg-black text-[#10B981] shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Highway Routes ({routeCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('city')}
          className={`px-3.5 py-2 border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'city'
              ? 'bg-black text-[#10B981] shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>City Fuel Rates ({cityCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('fuel')}
          className={`px-3.5 py-2 border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'fuel'
              ? 'bg-black text-[#10B981] shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          <span>Fuel Comparisons ({fuelCount})</span>
        </button>
      </div>

      {/* Guides Grid */}
      {filteredPages.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-300 space-y-2">
          <p className="text-sm font-bold text-slate-600">
            No guides found matching &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-xs font-black text-black underline uppercase"
          >
            Clear Search &amp; View All Guides
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => (
            <div
              key={page.slug}
              className="border-2 border-black bg-slate-50 flex flex-col justify-between hover:border-[#10B981] transition-all duration-150 group shadow-xs"
            >
              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black text-[#10B981]">
                    {page.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {page.currency}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectPage(page.slug)}
                  className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-black line-clamp-2 cursor-pointer hover:underline"
                >
                  {page.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {page.metaDescription}
                </p>

                {/* Key Metric Tags */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white p-2.5 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Distance</span>
                    <span className="font-bold text-slate-900">{page.metrics.distanceLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[9px]">Est. Cost</span>
                    <span className="font-black text-[#10B981]">{page.metrics.estimatedCostRange}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-white border-t-2 border-black grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onLoadIntoCalculator(page)}
                  className="py-2 px-2 bg-white hover:bg-slate-100 text-black text-[10px] font-black uppercase tracking-wider border border-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Load parameters directly into the live calculator"
                >
                  <Calculator className="w-3 h-3 text-[#10B981]" />
                  <span>Calculate</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPage(page.slug)}
                  className="py-2 px-2 bg-black hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider border border-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Read Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Internal Sitemaps Links Bar */}
      <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-slate-700">
          <span>Popular Fastag &amp; Highway Corridors:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          {SEO_LANDING_PAGES.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => onSelectPage(p.slug)}
              className="text-slate-600 hover:text-black hover:underline cursor-pointer"
            >
              {p.title.split(' ')[0]} {p.title.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
