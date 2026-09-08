import React from 'react';
import { CalculationMode, CurrencyCode, UnitSystem } from '../types';
import { CURRENCY_CONFIGS } from '../data/presets';
import { RotateCcw, Compass, CalendarRange, ChevronDown, Smartphone, ShieldCheck, FileArchive } from 'lucide-react';
import { ZipExportButton } from './ZipExportButton';

interface HeaderProps {
  unitSystem: UnitSystem;
  onToggleUnitSystem: (unit: UnitSystem) => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  calculationMode: CalculationMode;
  onChangeCalculationMode: (mode: CalculationMode) => void;
  onReset: () => void;
  onOpenPrivacy?: () => void;
  onOpenGuides?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unitSystem,
  onToggleUnitSystem,
  currency,
  onChangeCurrency,
  calculationMode,
  onChangeCalculationMode,
  onReset,
  onOpenPrivacy,
  onOpenGuides,
}) => {
  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* App Title, Brand Icon & Store Ready Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            {/* Geometric diamond logo */}
            <div className="w-9 h-9 bg-black flex items-center justify-center shadow-xs shrink-0">
              <div className="w-4 h-4 border-2 border-[#10B981] rotate-45 bg-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tighter uppercase text-black">
                  FuelPath
                </span>
                <span className="text-[10px] font-black tracking-widest bg-black text-[#10B981] px-1.5 py-0.5 uppercase">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <span>PWA • Android • iOS • Indus</span>
              </div>
            </div>
          </div>

          {/* Mobile Fast Currency, ZIP export & Reset buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onOpenGuides && (
              <button
                id="btn-guides-mobile"
                type="button"
                onClick={onOpenGuides}
                title="Browse Highway & Fuel Guides"
                className="p-1.5 text-black bg-slate-100 hover:bg-black hover:text-[#10B981] border border-black transition-colors"
              >
                <Compass className="w-4 h-4" />
              </button>
            )}
            <ZipExportButton />
            <div className="border border-black bg-slate-100 flex items-center text-xs font-black">
              <button
                type="button"
                onClick={() => onChangeCurrency('INR')}
                className={`px-2 py-1.5 ${
                  currency === 'INR' ? 'bg-black text-[#10B981]' : 'text-slate-700'
                }`}
              >
                ₹
              </button>
              <button
                type="button"
                onClick={() => onChangeCurrency('USD')}
                className={`px-2 py-1.5 ${
                  currency === 'USD' ? 'bg-black text-[#10B981]' : 'text-slate-700'
                }`}
              >
                $
              </button>
            </div>
            <button
              id="btn-reset-mobile"
              onClick={onReset}
              title="Reset to defaults"
              className="p-2 text-black hover:bg-slate-100 border border-black transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Controls & Currency Switcher */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Mode Switcher: Trip vs Commute */}
          <div className="border-2 border-black bg-slate-100 p-0.5 flex items-center text-xs font-bold uppercase tracking-wider">
            <button
              id="mode-trip-btn"
              onClick={() => onChangeCalculationMode('trip')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                calculationMode === 'trip'
                  ? 'bg-black text-white font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Trip Mode</span>
            </button>
            <button
              id="mode-commute-btn"
              onClick={() => onChangeCalculationMode('commute')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-all ${
                calculationMode === 'commute'
                  ? 'bg-black text-white font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Commute</span>
            </button>
          </div>

          {/* Unit System Toggle (Imperial / Metric) */}
          <div className="border-2 border-black bg-slate-100 p-0.5 flex items-center text-xs font-bold uppercase tracking-wider">
            <button
              id="unit-imperial-btn"
              onClick={() => onToggleUnitSystem('imperial')}
              className={`px-2.5 py-1.5 transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-black text-white font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
              title="Miles, Gallons, MPG"
            >
              Imperial
            </button>
            <button
              id="unit-metric-btn"
              onClick={() => onToggleUnitSystem('metric')}
              className={`px-2.5 py-1.5 transition-all ${
                unitSystem === 'metric'
                  ? 'bg-black text-white font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
              title="Kilometers, Liters, km/L"
            >
              Metric
            </button>
          </div>

          {/* Fast Currency Toggle: INR ₹ & USD $ (Desktop) */}
          <div className="hidden sm:flex items-center border-2 border-black bg-slate-100 p-0.5 text-xs font-bold uppercase tracking-wider">
            <button
              id="currency-quick-inr"
              type="button"
              onClick={() => onChangeCurrency('INR')}
              className={`px-2.5 py-1.5 transition-all ${
                currency === 'INR'
                  ? 'bg-black text-[#10B981] font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              ₹ INR
            </button>
            <button
              id="currency-quick-usd"
              type="button"
              onClick={() => onChangeCurrency('USD')}
              className={`px-2.5 py-1.5 transition-all ${
                currency === 'USD'
                  ? 'bg-black text-[#10B981] font-black shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* All Currencies Dropdown */}
          <div className="relative">
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="appearance-none bg-white border-2 border-black text-black text-xs font-black uppercase tracking-wider py-1.5 pl-3 pr-7 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {Object.keys(CURRENCY_CONFIGS).map((code) => (
                <option key={code} value={code}>
                  {CURRENCY_CONFIGS[code as CurrencyCode].label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black" />
          </div>

          {/* SEO Route & Fuel Guides Button */}
          {onOpenGuides && (
            <button
              id="btn-guides-desktop"
              type="button"
              onClick={onOpenGuides}
              title="SEO Route, City & Fuel Type Guides"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-800 hover:text-black hover:bg-slate-100 border-2 border-slate-300 hover:border-black transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden lg:inline">Guides</span>
            </button>
          )}

          {/* Privacy Policy Trigger Button */}
          {onOpenPrivacy && (
            <button
              id="btn-privacy-header"
              type="button"
              onClick={onOpenPrivacy}
              title="Official Privacy Policy (Google Play & App Store Compliance)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 hover:text-black hover:bg-slate-100 border-2 border-slate-300 hover:border-black transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="hidden lg:inline">Privacy</span>
            </button>
          )}

          {/* Project ZIP Codebase Exporter */}
          <div className="hidden sm:block">
            <ZipExportButton />
          </div>

          {/* Reset button (Desktop) */}
          <button
            id="btn-reset-desktop"
            onClick={onReset}
            title="Reset all values to defaults"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
