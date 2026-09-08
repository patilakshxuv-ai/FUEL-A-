import React, { useState } from 'react';
import { CalculationResult, CurrencyCode, TripCalculationInput } from '../types';
import {
  CURRENCY_CONFIGS,
  convertCurrencyAmount,
  formatCurrencyAmount,
} from '../data/presets';
import {
  Copy,
  Check,
  Scale,
  Calendar,
  Users,
  BookmarkPlus,
  History,
  QrCode,
  Share2,
} from 'lucide-react';

interface CostSummaryCardProps {
  input: TripCalculationInput;
  result: CalculationResult;
  onOpenCompare: () => void;
  onOpenSplitPayment: () => void;
  onSaveTrip: () => void;
  onOpenTripHistory: () => void;
  savedTripCount: number;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  input,
  result,
  onOpenCompare,
  onOpenSplitPayment,
  onSaveTrip,
  onOpenTripHistory,
  savedTripCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const isImperial = input.unitSystem === 'imperial';
  const isINR = input.currency === 'INR';
  const distanceUnit = isImperial ? 'MI' : 'KM';
  const volumeUnit = isImperial ? 'Gallons' : 'Liters';
  const isCommute = input.calculationMode === 'commute';

  // Dual Currency calculations for comparison
  const secondaryCurrency: CurrencyCode = isINR ? 'USD' : 'INR';
  const secondaryInfo = CURRENCY_CONFIGS[secondaryCurrency];
  const secondaryTotalCost = convertCurrencyAmount(
    result.totalCost,
    input.currency,
    secondaryCurrency
  );

  const handleCopySummary = async () => {
    const tripTypeStr = input.tripType === 'round_trip' ? 'Round Trip (2x)' : 'One-way';
    let text = `⚡ FUELPATH PRO — FUEL BREAKDOWN\n`;
    text += `==========================================\n`;
    text += `• Route: ${input.originCity || 'Origin'} ➔ ${input.destinationCity || 'Destination'}\n`;
    text += `• Total Distance: ${result.totalDistance} ${distanceUnit} (${tripTypeStr})\n`;
    text += `• Fuel Required: ${result.fuelVolumeNeeded} ${volumeUnit}\n`;
    text += `• Fuel Price: ${currencyInfo.symbol}${input.fuelPrice.toFixed(2)} / ${volumeUnit}\n`;
    text += `• Fuel Subtotal: ${currencyInfo.symbol}${formatCurrencyAmount(result.fuelCost, input.currency)}\n`;

    if (result.tollsAndParkingCost > 0) {
      text += `• Tolls / Fastag & Parking: ${currencyInfo.symbol}${formatCurrencyAmount(result.tollsAndParkingCost, input.currency)}\n`;
    }
    if (result.wearTearCost > 0) {
      text += `• Maintenance / Wear: ${currencyInfo.symbol}${formatCurrencyAmount(result.wearTearCost, input.currency)}\n`;
    }

    text += `• TOTAL ESTIMATED COST: ${currencyInfo.symbol}${formatCurrencyAmount(result.totalCost, input.currency)} (≈ ${secondaryInfo.symbol}${formatCurrencyAmount(secondaryTotalCost, secondaryCurrency)})\n`;

    if (input.passengers > 1) {
      text += `• Split per Person (${input.passengers} pax): ${currencyInfo.symbol}${formatCurrencyAmount(result.costPerPerson, input.currency)}\n`;
    }

    text += `• Cost per ${distanceUnit}: ${currencyInfo.symbol}${formatCurrencyAmount(result.costPerDistanceUnit, input.currency)} / ${distanceUnit}\n`;
    text += `• Carbon Footprint: ${result.carbonEmissionKg} kg CO2\n`;

    if (isCommute && result.weeklyCost !== undefined) {
      text += `\n📅 COMMUTE FORECAST (${input.commuteDaysPerWeek} days/week):\n`;
      text += `• Weekly: ${currencyInfo.symbol}${formatCurrencyAmount(result.weeklyCost, input.currency)}\n`;
      text += `• Monthly: ${currencyInfo.symbol}${formatCurrencyAmount(result.monthlyCost ?? 0, input.currency)}\n`;
      text += `• Annual: ${currencyInfo.symbol}${formatCurrencyAmount(result.yearlyCost ?? 0, input.currency)}\n`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleSaveClick = () => {
    onSaveTrip();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isHighEfficiency =
    input.efficiencyUnit === 'km_l'
      ? input.efficiencyValue >= 18
      : input.efficiencyUnit === 'l_100km'
      ? input.efficiencyValue < 6.5
      : input.efficiencyValue >= 32;

  return (
    <div className="flex flex-col gap-6 sticky top-20">
      {/* Main High-Impact Cost Card: Deep Charcoal with Emerald Highlight */}
      <div className="bg-[#111827] text-white border-l-8 border-[#10B981] p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
        {/* Top Header & Copy Action */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#10B981]">
            {isCommute ? 'COMMUTE TOTAL COST' : 'ESTIMATED TRIP EXPENSE'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              id="copy-summary-btn"
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 border border-white/20 transition-all cursor-pointer"
              title="Copy trip breakdown to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>COPY</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-[#10B981] hover:text-white bg-[#10B981]/20 hover:bg-[#10B981]/40 px-2.5 py-1.5 border border-[#10B981]/40 transition-all cursor-pointer"
              title="Save trip to local history log"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVED!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>SAVE LOG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Big Total Price Display */}
        <div className="mb-6">
          <div className="text-[54px] sm:text-[72px] font-black leading-none flex items-start text-white tracking-tighter overflow-hidden">
            <span className="text-2xl sm:text-3xl mt-2 sm:mt-3 mr-1 text-slate-400 font-bold">
              {currencyInfo.symbol}
            </span>
            <span className="truncate">{formatCurrencyAmount(result.totalCost, input.currency)}</span>
          </div>

          {/* Real-time Dual Currency Live Converted Badge */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
              <span>Dual Rate:</span>
              <span className="font-black text-white">
                {secondaryInfo.symbol}
                {formatCurrencyAmount(secondaryTotalCost, secondaryCurrency)} {secondaryCurrency}
              </span>
            </div>

            {input.passengers > 1 && (
              <button
                type="button"
                onClick={onOpenSplitPayment}
                className="inline-flex items-center gap-1.5 bg-white text-black px-2.5 py-1 text-xs font-black uppercase tracking-wider hover:bg-[#10B981] transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-black" />
                <span>
                  {currencyInfo.symbol}
                  {formatCurrencyAmount(result.costPerPerson, input.currency)} / Pax • Split UPI
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Quick Split and History Action Bar */}
        <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={onOpenSplitPayment}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Split &amp; Settle</span>
          </button>

          <button
            type="button"
            onClick={onOpenTripHistory}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Log ({savedTripCount})</span>
          </button>
        </div>

        {/* Vertical Metric Blocks */}
        <div className="grid grid-cols-1 gap-3.5 pt-2">
          <div className="border-l-2 border-slate-700 pl-4 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Fuel Consumed
            </span>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {result.fuelVolumeNeeded} {volumeUnit}
            </p>
          </div>

          <div className="border-l-2 border-slate-700 pl-4 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Cost Per {distanceUnit}
            </span>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {currencyInfo.symbol}
              {formatCurrencyAmount(result.costPerDistanceUnit, input.currency)} / {distanceUnit}
            </p>
          </div>

          <div className="border-l-2 border-slate-700 pl-4 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Carbon Footprint (CO₂)
            </span>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {result.carbonEmissionKg} kg CO₂
            </p>
          </div>
        </div>

        {/* Route Efficiency Meter */}
        <div className="mt-6 bg-white/5 p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Efficiency Grade
            </span>
            <span className="text-[#10B981] font-black text-xs uppercase tracking-wider">
              {isHighEfficiency ? 'HIGH MILEAGE' : 'STANDARD'}
            </span>
          </div>
          <div className="h-2 bg-slate-800 w-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-500"
              style={{
                width: isHighEfficiency ? '90%' : '60%',
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-medium">
            Production volumetric calculation with IEEE-754 precision &amp; multi-currency conversions.
          </p>
        </div>
      </div>

      {/* Commute Projections Table / Card */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-black" />
            <h3 className="font-black uppercase tracking-wider text-black text-xs sm:text-sm">
              Commute &amp; Periodic Forecast
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#10B981] px-2 py-0.5">
            {input.commuteDaysPerWeek || 5} D/WK
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {/* Weekly */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Weekly Total
              </span>
              <div className="text-[10px] font-medium text-slate-500">
                {(result.fuelVolumeNeeded * (input.commuteDaysPerWeek || 5)).toFixed(1)} {volumeUnit}
              </div>
            </div>
            <div className="text-right font-black text-black text-base">
              {currencyInfo.symbol}
              {formatCurrencyAmount(result.weeklyCost ?? result.totalCost * 5, input.currency)}
            </div>
          </div>

          {/* Monthly */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Monthly Estimate
              </span>
              <div className="text-[10px] font-medium text-slate-500">~21.6 workdays</div>
            </div>
            <div className="text-right font-black text-black text-base">
              {currencyInfo.symbol}
              {formatCurrencyAmount(result.monthlyCost ?? result.totalCost * 5 * 4.333, input.currency)}
            </div>
          </div>

          {/* Yearly */}
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Annual Expenditure
              </span>
              <div className="text-[10px] font-medium text-slate-500">52 working weeks</div>
            </div>
            <div className="text-right font-black text-[#10B981] text-lg sm:text-xl">
              {currencyInfo.symbol}
              {formatCurrencyAmount(result.yearlyCost ?? result.totalCost * 5 * 52, input.currency)}
            </div>
          </div>
        </div>

        {/* Quick Vehicle Savings Comparison Trigger Button */}
        <div className="mt-5 pt-4 border-t-2 border-black">
          <button
            id="compare-vehicles-btn"
            type="button"
            onClick={onOpenCompare}
            className="w-full bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-[0.15em] hover:bg-slate-800 flex items-center justify-center gap-2 border-2 border-black transition-colors cursor-pointer"
          >
            <Scale className="w-4 h-4 text-[#10B981]" />
            <span>Compare Vehicle Mileage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
