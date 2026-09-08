import React from 'react';
import { TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, VEHICLE_PRESETS, formatCurrencyAmount } from '../data/presets';
import { calculateFuelCost } from '../utils/calculator';
import { X, TrendingDown, TrendingUp, Scale } from 'lucide-react';

interface CompareVehiclesProps {
  input: TripCalculationInput;
  isOpen: boolean;
  onClose: () => void;
  onSelectEfficiency: (mpgUs: number, l100km: number) => void;
}

export const CompareVehicles: React.FC<CompareVehiclesProps> = ({
  input,
  isOpen,
  onClose,
  onSelectEfficiency,
}) => {
  if (!isOpen) return null;

  const isImperial = input.unitSystem === 'imperial';
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const distanceUnit = isImperial ? 'MI' : 'KM';
  const currentResult = calculateFuelCost(input);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-[#10B981] rotate-45" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-black">
                Vehicle Efficiency Labs
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Comparative analysis for {input.distance} {distanceUnit} @ {currencyInfo.symbol}
                {formatCurrencyAmount(input.fuelPrice, input.currency)}/unit
              </p>
            </div>
          </div>
          <button
            id="btn-close-compare"
            type="button"
            onClick={onClose}
            className="p-1.5 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Vehicle Baseline */}
        <div className="bg-[#111827] text-white p-4 mx-5 mt-4 border-l-4 border-[#10B981] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981]">
              Active Baseline
            </span>
            <div className="text-sm font-black text-white mt-0.5">
              {input.efficiencyValue}{' '}
              {input.efficiencyUnit === 'mpg_us'
                ? 'US MPG'
                : input.efficiencyUnit === 'mpg_uk'
                ? 'UK MPG'
                : input.efficiencyUnit === 'l_100km'
                ? 'L/100KM'
                : 'KM/L'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Baseline Cost</div>
            <div className="text-2xl font-black text-[#10B981]">
              {currencyInfo.symbol}
              {formatCurrencyAmount(currentResult.totalCost, input.currency)}
            </div>
          </div>
        </div>

        {/* Comparison List */}
        <div className="p-5 overflow-y-auto divide-y-2 divide-slate-100 flex-1">
          {VEHICLE_PRESETS.map((preset) => {
            const presetEffValue =
              input.efficiencyUnit === 'mpg_us'
                ? preset.mpgUs
                : input.efficiencyUnit === 'mpg_uk'
                ? Math.round(preset.mpgUs / 0.832674)
                : input.efficiencyUnit === 'l_100km'
                ? preset.l100km
                : Math.round((100 / preset.l100km) * 10) / 10;

            const presetInput: TripCalculationInput = {
              ...input,
              efficiencyValue: presetEffValue,
            };
            const presetResult = calculateFuelCost(presetInput);
            const costDiff = presetResult.totalCost - currentResult.totalCost;
            const annualDiff =
              (presetResult.totalCost - currentResult.totalCost) * (input.commuteDaysPerWeek || 5) * 52;
            const isCheaper = costDiff < -0.01;
            const isMoreExpensive = costDiff > 0.01;

            return (
              <div
                key={preset.id}
                className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-black text-sm uppercase tracking-tight">
                      {preset.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-black text-white font-black uppercase tracking-wider">
                      {input.efficiencyUnit === 'km_l'
                        ? `${Math.round((100 / preset.l100km) * 10) / 10} KM/L`
                        : isImperial
                        ? `${preset.mpgUs} MPG`
                        : `${preset.l100km} L/100KM`}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">
                    Category: {preset.category} • CO₂: {presetResult.carbonEmissionKg} kg
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="font-black text-black text-base">
                      {currencyInfo.symbol}
                      {formatCurrencyAmount(presetResult.totalCost, input.currency)}
                    </div>
                    {isCheaper ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#10B981] font-black uppercase tracking-tight">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Saves {currencyInfo.symbol}
                        {formatCurrencyAmount(Math.abs(costDiff), input.currency)} ({currencyInfo.symbol}
                        {formatCurrencyAmount(Math.abs(annualDiff), input.currency)}/yr)
                      </span>
                    ) : isMoreExpensive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold uppercase tracking-tight">
                        <TrendingUp className="w-3.5 h-3.5" />+{currencyInfo.symbol}
                        {formatCurrencyAmount(costDiff, input.currency)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        Equivalent
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectEfficiency(preset.mpgUs, preset.l100km);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-black hover:bg-[#10B981] hover:text-black text-white text-xs font-black uppercase tracking-wider border-2 border-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t-2 border-black text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
