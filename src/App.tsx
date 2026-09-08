/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  CalculationMode,
  CurrencyCode,
  FuelEfficiencyUnit,
  SavedTripRecord,
  TripCalculationInput,
  UnitSystem,
  VehiclePreset,
} from './types';
import { CURRENCY_CONFIGS, VEHICLE_PRESETS, convertEfficiency } from './data/presets';
import { calculateFuelCost } from './utils/calculator';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { CostSummaryCard } from './components/CostSummaryCard';
import { CompareVehicles } from './components/CompareVehicles';
import { RoutePlanner } from './components/RoutePlanner';
import { CityFuelSelector } from './components/CityFuelSelector';
import { TankRangeCard } from './components/TankRangeCard';
import { RouteVisualizer } from './components/RouteVisualizer';
import { SplitPaymentModal } from './components/SplitPaymentModal';
import { TripHistoryModal } from './components/TripHistoryModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AdKeeperWidget } from './components/AdKeeperWidget';
import { PayPalPaymentSection } from './components/PayPalPaymentSection';
import { Analytics } from '@vercel/analytics/react';
import { SeoLandingPageView } from './components/SeoLandingPageView';
import { SeoDirectorySection } from './components/SeoDirectorySection';
import { SEO_LANDING_PAGES, SeoLandingPage, getSeoPageBySlug } from './data/seoLandingPages';
import { Activity, Download, Sparkles, Navigation, Layers, ShieldCheck, Compass } from 'lucide-react';
import { SiteInfoPage } from './components/SiteInfoPage';
import type { SitePageKey } from './components/SiteInfoPage';

const STORAGE_KEY = 'fuelpath_saved_trips_v1';

const getSitePageFromLocation = (): SitePageKey | null => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const allowed: SitePageKey[] = ['about', 'contact', 'privacy', 'terms', 'disclaimer', 'cookies', 'sitemap'];
  const key = path.slice(1) as SitePageKey;
  return allowed.includes(key) ? key : null;
};

const getSeoSlugFromLocation = () => {
  const pathMatch = window.location.pathname.match(/^\/(?:guide|route|city|fuel)\/([^/]+)\/?$/);
  if (pathMatch) return pathMatch[1];
  const hash = window.location.hash;
  if (hash.startsWith('#/guide/')) return hash.replace('#/guide/', '');
  if (hash.startsWith('#/route/')) return hash.replace('#/route/', '');
  if (hash.startsWith('#/city/')) return hash.replace('#/city/', '');
  if (hash.startsWith('#/fuel/')) return hash.replace('#/fuel/', '');
  const searchSlug = new URLSearchParams(window.location.search).get('guide');
  return searchSlug || null;
};

const DEFAULT_INPUT: TripCalculationInput = {
  distance: 150,
  unitSystem: 'metric',
  efficiencyUnit: 'km_l',
  efficiencyValue: 18.0,
  fuelPrice: 104.50,
  currency: 'INR',
  tripType: 'one_way',
  passengers: 1,
  tollsAndParking: 0,
  maintenancePerDistance: 0,
  calculationMode: 'trip',
  commuteDaysPerWeek: 5,
  originCity: 'New Delhi',
  destinationCity: 'Jaipur',
  tankCapacity: 45,
};

export default function App() {
  const [input, setInput] = useState<TripCalculationInput>(DEFAULT_INPUT);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('compact_hatch');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(() => {
    return window.location.hash === '#privacy' || new URLSearchParams(window.location.search).get('privacy') === 'true';
  });
  const [activeSeoSlug, setActiveSeoSlug] = useState<string | null>(() => getSeoSlugFromLocation());
  const [activeSitePage, setActiveSitePage] = useState<SitePageKey | null>(() => getSitePageFromLocation());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Listen to hash changes (e.g. user opens #privacy, SEO routes, or navigates back)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#privacy') {
        setIsPrivacyOpen(true);
        setActiveSitePage('privacy');
        return;
      }
      setActiveSitePage(null);
      if (hash.startsWith('#/guide/')) {
        setActiveSeoSlug(hash.replace('#/guide/', ''));
      } else if (hash.startsWith('#/route/')) {
        setActiveSeoSlug(hash.replace('#/route/', ''));
      } else if (hash.startsWith('#/city/')) {
        setActiveSeoSlug(hash.replace('#/city/', ''));
      } else if (hash.startsWith('#/fuel/')) {
        setActiveSeoSlug(hash.replace('#/fuel/', ''));
      } else if (hash === '#calculator' || hash === '' || hash === '#') {
        setActiveSeoSlug(null);
      }
    };
    const handleLocationChange = () => {
      const hash = window.location.hash;
      if (hash === '#privacy') {
        setIsPrivacyOpen(true);
        return;
      }
      setActiveSitePage(getSitePageFromLocation());
      setActiveSeoSlug(getSeoSlugFromLocation());
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Persistent Trip History state
  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save trips to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips));
    } catch (e) {
      console.error('Failed to save trips to localStorage', e);
    }
  }, [savedTrips]);

  // Listen for PWA install prompt for Android (Google Play / Indus) and desktop
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  // Currency Switcher with seamless regional calibration
  const handleChangeCurrency = (newCurrency: CurrencyCode) => {
    if (newCurrency === input.currency) return;

    if (newCurrency === 'INR') {
      // Switch to INR & Metric if currently in imperial USD
      const newPrice = input.fuelPrice < 15 ? 104.50 : input.fuelPrice;
      const isCurrentlyImperial = input.unitSystem === 'imperial';

      if (isCurrentlyImperial) {
        const newDist = Math.round(input.distance * 1.60934);
        const newEff = convertEfficiency(input.efficiencyValue, input.efficiencyUnit, 'km_l');
        setInput({
          ...input,
          currency: 'INR',
          fuelPrice: newPrice,
          unitSystem: 'metric',
          efficiencyUnit: 'km_l',
          efficiencyValue: newEff || 18.0,
          distance: newDist || 150,
          tankCapacity: input.tankCapacity ? Math.round(input.tankCapacity * 3.78541) : 45,
        });
      } else {
        setInput({
          ...input,
          currency: 'INR',
          fuelPrice: newPrice,
        });
      }
    } else if (newCurrency === 'USD') {
      const newPrice = input.fuelPrice > 50 ? 3.45 : input.fuelPrice;
      const isCurrentlyMetric = input.unitSystem === 'metric';

      if (isCurrentlyMetric) {
        const newDist = Math.round(input.distance / 1.60934);
        const newEff = convertEfficiency(input.efficiencyValue, input.efficiencyUnit, 'mpg_us');
        setInput({
          ...input,
          currency: 'USD',
          fuelPrice: newPrice,
          unitSystem: 'imperial',
          efficiencyUnit: 'mpg_us',
          efficiencyValue: newEff || 32.0,
          distance: newDist || 100,
          tankCapacity: input.tankCapacity ? Math.round(input.tankCapacity / 3.78541) : 12,
        });
      } else {
        setInput({
          ...input,
          currency: 'USD',
          fuelPrice: newPrice,
        });
      }
    } else {
      // General currency switch
      setInput({
        ...input,
        currency: newCurrency,
      });
    }
  };

  // Switch between Imperial and Metric
  const handleToggleUnitSystem = (newUnitSystem: UnitSystem) => {
    if (newUnitSystem === input.unitSystem) return;

    if (newUnitSystem === 'metric') {
      // Imperial -> Metric
      const newDistance = Math.round(input.distance * 1.60934);
      const newEffUnit: FuelEfficiencyUnit = input.currency === 'INR' ? 'km_l' : 'l_100km';
      const newEffValue = convertEfficiency(input.efficiencyValue, input.efficiencyUnit, newEffUnit);
      const newFuelPrice =
        input.currency === 'INR'
          ? input.fuelPrice
          : Math.round((input.fuelPrice / 3.78541) * 100) / 100;
      const newMaintenance = Math.round((input.maintenancePerDistance / 1.60934) * 100) / 100;

      setInput({
        ...input,
        unitSystem: 'metric',
        distance: newDistance,
        efficiencyUnit: newEffUnit,
        efficiencyValue: newEffValue,
        fuelPrice: newFuelPrice,
        maintenancePerDistance: newMaintenance,
        tankCapacity: input.tankCapacity ? Math.round(input.tankCapacity * 3.78541) : 45,
      });
    } else {
      // Metric -> Imperial
      const newDistance = Math.round(input.distance / 1.60934);
      const newEffUnit: FuelEfficiencyUnit = 'mpg_us';
      const newEffValue = convertEfficiency(input.efficiencyValue, input.efficiencyUnit, newEffUnit);
      const newFuelPrice =
        input.currency === 'INR'
          ? input.fuelPrice
          : Math.round((input.fuelPrice * 3.78541) * 100) / 100;
      const newMaintenance = Math.round((input.maintenancePerDistance * 1.60934) * 100) / 100;

      setInput({
        ...input,
        unitSystem: 'imperial',
        distance: newDistance,
        efficiencyUnit: newEffUnit,
        efficiencyValue: newEffValue,
        fuelPrice: newFuelPrice,
        maintenancePerDistance: newMaintenance,
        tankCapacity: input.tankCapacity ? Math.round(input.tankCapacity / 3.78541) : 12,
      });
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setSelectedVehicleId('compact_hatch');
  };

  const handleSelectVehicle = (preset: VehiclePreset | null) => {
    if (preset) {
      setSelectedVehicleId(preset.id);
      if (preset.defaultTankCapacityL) {
        const isImperial = input.unitSystem === 'imperial';
        setInput((prev) => ({
          ...prev,
          tankCapacity: isImperial
            ? Math.round(preset.defaultTankCapacityL! / 3.78541)
            : preset.defaultTankCapacityL,
        }));
      }
    } else {
      setSelectedVehicleId('custom');
    }
  };

  const handleApplyEfficiencyFromCompare = (mpgUs: number, l100km: number) => {
    if (input.unitSystem === 'imperial') {
      setInput({
        ...input,
        efficiencyUnit: 'mpg_us',
        efficiencyValue: mpgUs,
      });
    } else if (input.efficiencyUnit === 'km_l') {
      setInput({
        ...input,
        efficiencyUnit: 'km_l',
        efficiencyValue: Math.round((100 / l100km) * 10) / 10,
      });
    } else {
      setInput({
        ...input,
        efficiencyUnit: 'l_100km',
        efficiencyValue: l100km,
      });
    }
    setSelectedVehicleId('custom');
  };

  const result = calculateFuelCost(input);

  // Save current calculation to history log
  const handleSaveTripToHistory = () => {
    const routeTitle =
      input.originCity && input.destinationCity
        ? `${input.originCity} to ${input.destinationCity}`
        : `Trip (${result.totalDistance} ${input.unitSystem === 'imperial' ? 'mi' : 'km'})`;

    const newRecord: SavedTripRecord = {
      id: 'trip_' + Date.now(),
      title: routeTitle,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      input: { ...input },
      result: { ...result },
    };

    setSavedTrips((prev) => [newRecord, ...prev]);
  };

  const handleLoadSavedTrip = (record: SavedTripRecord) => {
    setInput({ ...record.input });
  };

  const handleDeleteSavedTrip = (id: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAllTrips = () => {
    if (window.confirm('Are you sure you want to clear all saved trip history?')) {
      setSavedTrips([]);
    }
  };

  // SEO Page Lookup & Handlers
  const activeSeoPage = activeSeoSlug ? getSeoPageBySlug(activeSeoSlug) : undefined;

  const handleNavigateToSeoSlug = (slug: string) => {
    setActiveSitePage(null);
    setActiveSeoSlug(slug);
    window.history.pushState({}, '', `/guide/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCalculator = () => {
    setActiveSitePage(null);
    setActiveSeoSlug(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSeoIntoCalculator = (page: SeoLandingPage, vehicleEfficiency?: number) => {
    setActiveSitePage(null);
    setInput((prev) => ({
      ...prev,
      distance: page.calculatorDefaults.distance,
      originCity: page.calculatorDefaults.originCity || prev.originCity,
      destinationCity: page.calculatorDefaults.destinationCity || prev.destinationCity,
      fuelPrice: page.calculatorDefaults.fuelPrice,
      currency: page.currency,
      unitSystem: page.unitSystem,
      efficiencyValue: vehicleEfficiency ?? page.calculatorDefaults.efficiencyValue,
      efficiencyUnit: page.calculatorDefaults.efficiencyUnit,
      tollsAndParking: page.calculatorDefaults.tollsAndParking,
      passengers: page.calculatorDefaults.passengers,
      calculationMode: page.category === 'city' ? 'commute' : 'trip',
    }));

    setActiveSeoSlug(null);
    window.history.pushState({}, '', '/');
    setTimeout(() => {
      const calcEl = document.getElementById('calculator-form-container');
      if (calcEl) {
        calcEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 80);
  };

  const handleSitePage = (page: SitePageKey) => {
    setActiveSeoSlug(null);
    setActiveSitePage(page);
    window.history.pushState({}, '', `/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToGuides = () => {
    if (activeSitePage) {
      setActiveSitePage(null);
      window.history.pushState({}, '', '/');
      setTimeout(() => {
        const el = document.getElementById('seo-guides-directory');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    if (activeSeoSlug) {
      setActiveSeoSlug(null);
      window.location.hash = '#calculator';
      setTimeout(() => {
        const el = document.getElementById('seo-guides-directory');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('seo-guides-directory');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col font-sans selection:bg-black selection:text-[#10B981]">
      {/* Production Header */}
      <Header
        unitSystem={input.unitSystem}
        onToggleUnitSystem={handleToggleUnitSystem}
        currency={input.currency}
        onChangeCurrency={handleChangeCurrency}
        calculationMode={input.calculationMode}
        onChangeCalculationMode={(mode) => setInput({ ...input, calculationMode: mode })}
        onReset={handleReset}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenGuides={handleScrollToGuides}
      />

      {/* Main Single-View Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-8">
        {/* App Store / Indus / Play Store Ready Notice Banner */}
        <div className="mb-6 p-3 sm:p-4 bg-white border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-[#10B981] flex items-center justify-center font-black text-sm shrink-0">
              ₹/$
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm uppercase tracking-tight text-black">
                  App Store &amp; Indus Ready • Live Production PWA
                </span>
                <span className="text-[9px] bg-[#10B981] text-black font-black px-1.5 py-0.5 uppercase">
                  Live Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Real-time multi-currency calculator with GPS City routes, pump index, tank telemetry &amp; UPI split.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleScrollToGuides}
              className="px-3 py-1.5 bg-slate-100 hover:bg-black hover:text-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 border-black transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Route Guides ({SEO_LANDING_PAGES.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-black hover:text-white text-black text-xs font-black uppercase tracking-wider border-2 border-black transition-colors"
            >
              Saved Trips ({savedTrips.length})
            </button>

            {deferredPrompt && !isInstalled && (
              <button
                type="button"
                onClick={handleInstallPwa}
                className="px-3.5 py-1.5 bg-black text-[#10B981] hover:bg-slate-800 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
          </div>
        </div>

        {/* Top High-Visibility Sponsored Ad 2076062 */}
        <AdKeeperWidget widgetId="2076062" title="Featured Partner Offers & Travel Savings" />

        {/* View Switch: informational page, SEO guide, or interactive calculator */}
        {activeSitePage ? (
          <SiteInfoPage page={activeSitePage} onBack={() => {
            setActiveSitePage(null);
            window.history.pushState({}, '', '/');
          }} />
        ) : activeSeoPage ? (
          <div className="space-y-8">
            <SeoLandingPageView
              page={activeSeoPage}
              onBackToCalculator={handleBackToCalculator}
              onLoadIntoCalculator={handleLoadSeoIntoCalculator}
              onNavigateToSlug={handleNavigateToSeoSlug}
            />

            {/* Continuous Internal Directory Links */}
            <div className="pt-6 border-t-2 border-black">
              <SeoDirectorySection
                onSelectPage={handleNavigateToSeoSlug}
                onLoadIntoCalculator={handleLoadSeoIntoCalculator}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Calculation Parameters & Interactive Live Tools */}
              <div id="calculator-form-container" className="lg:col-span-7 space-y-6">
                {/* Live City-Wise Route Planner */}
                <RoutePlanner input={input} onChangeInput={setInput} />

                {/* AdKeeper Live Route & Navigation Deals 2076072 */}
                <AdKeeperWidget widgetId="2076072" title="Navigation, GPS & Highway Deals" />

                {/* Core Calculator Form */}
                <CalculatorForm
                  input={input}
                  onChangeInput={setInput}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={handleSelectVehicle}
                />

                {/* PayPal Visitor Payment Section */}
                <PayPalPaymentSection
                  input={input}
                  result={result}
                  accountEmail="7276121252avp@gmail.com"
                />

                {/* City-Wise Fuel Pump Index */}
                <CityFuelSelector input={input} onChangeInput={setInput} />

                {/* In-Content Sponsored Unit 2076064 */}
                <AdKeeperWidget widgetId="2076064" title="Special Driving & Fuel Offers" />

                {/* Tank Capacity & Range Autonomy */}
                <TankRangeCard input={input} result={result} onChangeInput={setInput} />

                {/* Visual Highway Route Trajectory */}
                <RouteVisualizer input={input} result={result} />

                {/* AdKeeper Route & Navigation Sponsored Unit 2076067 */}
                <AdKeeperWidget widgetId="2076067" title="Smart Route & Roadside Services" />
              </div>

              {/* Right Column: Output Summary & Projections */}
              <div className="lg:col-span-5 space-y-6">
                <CostSummaryCard
                  input={input}
                  result={result}
                  onOpenCompare={() => setIsCompareOpen(true)}
                  onOpenSplitPayment={() => setIsSplitModalOpen(true)}
                  onSaveTrip={handleSaveTripToHistory}
                  onOpenTripHistory={() => setIsHistoryModalOpen(true)}
                  savedTripCount={savedTrips.length}
                />

                {/* AdKeeper Sponsored Unit 2076060 */}
                <AdKeeperWidget widgetId="2076060" title="Trending Deals & Recommendations" />

                {/* AdKeeper 300px Display Widget 2076065 */}
                <AdKeeperWidget widgetId="2076065" title="Exclusive Travel & Partner Offers" minHeight="300px" />
              </div>
            </div>

            {/* AdKeeper Sponsored Unit 2076059 */}
            <AdKeeperWidget widgetId="2076059" title="Sponsored Recommendations" />

            {/* AdKeeper Sponsored Discovery Grid 2076069 */}
            <AdKeeperWidget widgetId="2076069" title="Trending Stories & Partner Highlights" />

            {/* Comprehensive SEO Route, City & Fuel Type Directory Hub */}
            <SeoDirectorySection
              onSelectPage={handleNavigateToSeoSlug}
              onLoadIntoCalculator={handleLoadSeoIntoCalculator}
            />

            {/* AdKeeper Sponsored Unit 2076075 */}
            <AdKeeperWidget widgetId="2076075" title="Verified Partner Promos & Automotive Deals" />

            {/* AdKeeper Sponsored Feed Unit 2076077 */}
            <AdKeeperWidget widgetId="2076077" title="Recommended Highway Services & Travel Extras" />

            {/* AdKeeper Sponsored Unit 2076078 */}
            <AdKeeperWidget widgetId="2076078" title="Featured Automotive & Travel Recommendations" />
          </>
        )}

        {/* Informational calculation notes footer banner */}
        <div className="mt-10 p-4 bg-white border-2 border-black text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 font-medium">
            <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45 shrink-0" />
            <span>
              Real-time volumetric telemetry calculation with precision multi-currency exchange rates and GPS distance heuristics.
            </span>
          </div>
          <div className="text-black font-black uppercase tracking-wider text-[11px] shrink-0">
            {input.currency === 'INR'
              ? '1 USD ≈ ₹86.20 INR • 100 KM ≈ 62.14 MI'
              : input.unitSystem === 'imperial'
              ? '1 US Gal ≈ 3.785 L • 1 USD ≈ ₹86.20 INR'
              : '100 KM ≈ 62.14 MI • 1 USD ≈ ₹86.20 INR'}
          </div>
        </div>
      </main>

      {/* Production Status Bar Footer */}
      <footer className="border-t-2 border-black bg-white flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400 px-6 sm:px-8 py-3.5 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-black font-black">
            <Activity className="w-3.5 h-3.5 text-[#10B981]" />
            PRODUCTION: LIVE (INDUS / PLAY / APP STORE)
          </span>
          <span>LATENCY: 0.01ms</span>
          <span className="hidden sm:inline">OFFLINE-FIRST PWA</span>
          <button type="button" onClick={() => handleSitePage('privacy')} className="text-black hover:text-[#10B981] font-black underline underline-offset-2">
            Privacy
          </button>
          <button type="button" onClick={() => handleSitePage('terms')} className="text-black hover:text-[#10B981] font-black underline underline-offset-2">
            Terms
          </button>
          <button type="button" onClick={() => handleSitePage('disclaimer')} className="text-black hover:text-[#10B981] font-black underline underline-offset-2">
            Disclaimer
          </button>
          <button type="button" onClick={() => handleSitePage('contact')} className="text-black hover:text-[#10B981] font-black underline underline-offset-2">
            Contact
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>₹ INR &amp; $ USD ENGINE</span>
          <span className="text-black">•</span>
          <span className="text-black font-black">FUELPATH PRO v2.5</span>
        </div>
      </footer>

      {/* Vehicle Comparison Modal */}
      <CompareVehicles
        input={input}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onSelectEfficiency={handleApplyEfficiencyFromCompare}
      />

      {/* Passenger Split & UPI Settlement Modal */}
      <SplitPaymentModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        input={input}
        result={result}
      />

      {/* Trip Log History & Export Modal */}
      <TripHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        savedTrips={savedTrips}
        onLoadTrip={handleLoadSavedTrip}
        onDeleteTrip={handleDeleteSavedTrip}
        onClearAllTrips={handleClearAllTrips}
      />

      {/* Official App Store & Google Play Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => {
          setIsPrivacyOpen(false);
          if (window.location.hash === '#privacy') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
