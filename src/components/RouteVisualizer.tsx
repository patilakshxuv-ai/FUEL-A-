import React from 'react';
import { CalculationResult, TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/presets';
import { MapPin, Fuel, ShieldCheck, Milestone, Compass } from 'lucide-react';

interface RouteVisualizerProps {
  input: TripCalculationInput;
  result: CalculationResult;
}

export const RouteVisualizer: React.FC<RouteVisualizerProps> = ({ input, result }) => {
  const isImperial = input.unitSystem === 'imperial';
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const distUnit = isImperial ? 'mi' : 'km';
  const volumeUnit = isImperial ? 'gal' : 'L';

  const originName = input.originCity || 'Origin (A)';
  const destName = input.destinationCity || 'Destination (B)';

  const fuelPct = result.totalCost > 0 ? (result.fuelCost / result.totalCost) * 100 : 100;
  const tollPct = result.totalCost > 0 ? (result.tollsAndParkingCost / result.totalCost) * 100 : 0;
  const wearPct = result.totalCost > 0 ? (result.wearTearCost / result.totalCost) * 100 : 0;

  return (
    <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Live Route Trajectory &amp; Cost Composition</span>
          </h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#10B981] px-2 py-0.5">
          {input.tripType === 'round_trip' ? 'Round Trip (2x)' : 'One-way Direct'}
        </span>
      </div>

      {/* Schematic Highway Route Diagram */}
      <div className="relative py-4 px-2 sm:px-6 my-2 bg-slate-50 border-2 border-slate-200">
        {/* Highway road line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-2 bg-slate-300 border-y border-slate-400">
          <div className="w-full h-full border-t border-dashed border-white/80" />
        </div>

        {/* Route checkpoints */}
        <div className="relative flex justify-between items-center z-10">
          {/* Origin */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-black text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight text-black mt-1.5 max-w-[90px] truncate text-center">
              {originName}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">0 {distUnit}</span>
          </div>

          {/* Midway checkpoint */}
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-black border-2 border-[#10B981] text-[#10B981] flex items-center justify-center shadow-xs">
              <Fuel className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 mt-1.5 text-center">
              Midway Burn
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">
              {(result.totalDistance / 2).toFixed(0)} {distUnit}
            </span>
          </div>

          {/* Destination */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-black text-white flex items-center justify-center shadow-xs">
              <Milestone className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight text-black mt-1.5 max-w-[90px] truncate text-center">
              {destName}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">
              {result.totalDistance} {distUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Split Progress Breakdown */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
          <span className="text-slate-600">Cost Distribution Ratio</span>
          <span className="text-black">
            Total: {currencyInfo.symbol}
            {formatCurrencyAmount(result.totalCost, input.currency)}
          </span>
        </div>

        {/* Multi-segment bar */}
        <div className="h-4 w-full bg-slate-200 border border-slate-300 flex overflow-hidden">
          <div
            title={`Fuel Cost: ${currencyInfo.symbol}${result.fuelCost}`}
            className="h-full bg-black flex items-center justify-center text-[9px] font-black text-[#10B981]"
            style={{ width: `${fuelPct}%` }}
          >
            {fuelPct > 20 && `${fuelPct.toFixed(0)}% Fuel`}
          </div>
          {tollPct > 0 && (
            <div
              title={`Tolls: ${currencyInfo.symbol}${result.tollsAndParkingCost}`}
              className="h-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-black"
              style={{ width: `${tollPct}%` }}
            >
              {tollPct > 15 && `${tollPct.toFixed(0)}% Tolls`}
            </div>
          )}
          {wearPct > 0 && (
            <div
              title={`Wear & Tear: ${currencyInfo.symbol}${result.wearTearCost}`}
              className="h-full bg-indigo-500 flex items-center justify-center text-[9px] font-black text-white"
              style={{ width: `${wearPct}%` }}
            >
              {wearPct > 15 && `${wearPct.toFixed(0)}% Wear`}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 mt-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-black border border-black" />
            <span>
              Fuel: {currencyInfo.symbol}
              {formatCurrencyAmount(result.fuelCost, input.currency)} ({fuelPct.toFixed(0)}%)
            </span>
          </div>
          {result.tollsAndParkingCost > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-500 border border-black" />
              <span>
                Tolls &amp; Fastag: {currencyInfo.symbol}
                {formatCurrencyAmount(result.tollsAndParkingCost, input.currency)} ({tollPct.toFixed(0)}%)
              </span>
            </div>
          )}
          {result.wearTearCost > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500 border border-black" />
              <span>
                Wear &amp; Tear: {currencyInfo.symbol}
                {formatCurrencyAmount(result.wearTearCost, input.currency)} ({wearPct.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
