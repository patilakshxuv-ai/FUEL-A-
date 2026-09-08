import React from 'react';
import { CalculationResult, TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/presets';
import { Fuel, Gauge, ArrowUpRight, BatteryCharging, AlertCircle } from 'lucide-react';

interface TankRangeCardProps {
  input: TripCalculationInput;
  result: CalculationResult;
  onChangeInput: (newInput: TripCalculationInput) => void;
}

export const TankRangeCard: React.FC<TankRangeCardProps> = ({ input, result, onChangeInput }) => {
  const isImperial = input.unitSystem === 'imperial';
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const volumeUnit = isImperial ? 'Gallons' : 'Liters';
  const distanceUnit = isImperial ? 'Miles' : 'KM';

  const currentTank = input.tankCapacity || (isImperial ? 12 : 45);
  const tankPresets = isImperial ? [3, 10, 12, 16, 20] : [12, 35, 45, 55, 65, 80];

  const fuelPct = Math.min(
    100,
    Math.round((result.fuelVolumeNeeded / Math.max(1, currentTank)) * 100)
  );

  return (
    <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Fuel Tank Telemetry &amp; Range Autonomy</span>
          </h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-black text-[#10B981] px-2 py-0.5">
          Tank: {currentTank} {volumeUnit.slice(0, 3)}
        </span>
      </div>

      {/* Tank Capacity Adjuster */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-5">
        <div className="sm:col-span-6">
          <label
            htmlFor="tank-capacity-input"
            className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1"
          >
            Vehicle Tank Capacity ({volumeUnit})
          </label>
          <div className="relative">
            <input
              id="tank-capacity-input"
              type="number"
              min="1"
              max="200"
              step="1"
              value={currentTank}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeInput({ ...input, tankCapacity: isNaN(val) ? 10 : Math.max(1, val) });
              }}
              className="w-full border-b-2 border-black text-2xl font-black p-1.5 focus:outline-none focus:border-[#10B981] bg-transparent text-black"
            />
            <span className="absolute right-2 bottom-2 text-xs font-bold text-slate-400 uppercase">
              {volumeUnit}
            </span>
          </div>
        </div>

        {/* Quick Tank Preset buttons */}
        <div className="sm:col-span-6">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Standard Tanks:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tankPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeInput({ ...input, tankCapacity: preset })}
                className={`text-xs px-2.5 py-1 border-2 font-bold transition-colors ${
                  currentTank === preset
                    ? 'bg-black text-[#10B981] border-black shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-black hover:bg-white'
                }`}
              >
                {preset}
                {volumeUnit.slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tank Range Metric Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-2 border-slate-200 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Cost to Fill Tank
          </span>
          <div className="text-xl font-black text-black mt-0.5">
            {currencyInfo.symbol}
            {formatCurrencyAmount(result.fullTankCost, input.currency)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">100% full capacity</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Full Tank Range
          </span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">
            ~{result.fullTankRange} {distanceUnit}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">On single fill-up</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Refills for Trip
          </span>
          <div className="text-xl font-black text-black mt-0.5">
            {result.refillsNeeded}{' '}
            <span className="text-xs font-normal text-slate-500">
              {result.refillsNeeded > 1 ? 'Tanks' : 'Tank'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {result.refillsNeeded > 1
              ? `Requires ~${Math.ceil(result.refillsNeeded - 1)} fuel stop(s)`
              : 'Completed on 1 tank'}
          </span>
        </div>
      </div>

      {/* Fuel Consumption Progress Gauge */}
      <div>
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5">
          <span className="text-slate-600">Trip Fuel Drain vs Tank:</span>
          <span className="text-black font-black">
            {result.fuelVolumeNeeded} / {currentTank} {volumeUnit} ({fuelPct}%)
          </span>
        </div>
        <div className="h-3 bg-slate-200 border border-slate-300 w-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              fuelPct > 100 ? 'bg-rose-600' : fuelPct > 80 ? 'bg-amber-500' : 'bg-[#10B981]'
            }`}
            style={{ width: `${Math.min(100, fuelPct)}%` }}
          />
        </div>
        {fuelPct > 100 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Route exceeds single tank range by {(result.totalDistance - result.fullTankRange).toFixed(0)}{' '}
              {distanceUnit}. Plan a highway refuel stop.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
