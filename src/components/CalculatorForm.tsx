import React, { useState } from 'react';
import {
  CurrencyCode,
  FuelEfficiencyUnit,
  TripCalculationInput,
  TripType,
  VehiclePreset,
} from '../types';
import {
  CURRENCY_CONFIGS,
  DISTANCE_QUICK_PRESETS_KM,
  DISTANCE_QUICK_PRESETS_MILES,
  FUEL_BENCHMARKS,
  VEHICLE_PRESETS,
  convertCurrencyAmount,
  convertEfficiency,
  formatCurrencyAmount,
} from '../data/presets';
import {
  Car,
  CarFront,
  Truck,
  Zap,
  Bike,
  PackageCheck,
  Gauge,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  ArrowRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CalculatorFormProps {
  input: TripCalculationInput;
  onChangeInput: (newInput: TripCalculationInput) => void;
  selectedVehicleId: string;
  onSelectVehicle: (preset: VehiclePreset | null) => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  input,
  onChangeInput,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const isImperial = input.unitSystem === 'imperial';
  const isINR = input.currency === 'INR';
  const isUSD = input.currency === 'USD';
  const distancePresets = isImperial ? DISTANCE_QUICK_PRESETS_MILES : DISTANCE_QUICK_PRESETS_KM;
  const distanceUnitLabel = isImperial ? 'MI' : 'KM';
  const volumeUnitLabel = isImperial ? 'GAL' : 'L';

  const getVehicleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike':
        return <Bike className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'CarFront':
        return <CarFront className="w-4 h-4" />;
      case 'Truck':
        return <Truck className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'PackageCheck':
        return <PackageCheck className="w-4 h-4" />;
      case 'Gauge':
        return <Gauge className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const handleEfficiencyUnitChange = (newUnit: FuelEfficiencyUnit) => {
    const converted = convertEfficiency(input.efficiencyValue, input.efficiencyUnit, newUnit);
    onChangeInput({
      ...input,
      efficiencyUnit: newUnit,
      efficiencyValue: converted,
    });
  };

  // Convert fuel price for secondary currency live hint
  const secondaryCurrency: CurrencyCode = isINR ? 'USD' : 'INR';
  const secondaryFuelPriceConverted = convertCurrencyAmount(
    input.fuelPrice,
    input.currency,
    secondaryCurrency
  );
  const secondarySymbol = CURRENCY_CONFIGS[secondaryCurrency].symbol;

  return (
    <div className="flex flex-col gap-6">
      {/* Section Header with Quick Currency Notice */}
      <div className="border-b-2 border-black pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111827]">
            Trip Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Optimized for Indian (₹ INR) and Global ($ USD) road & fuel conditions.
          </p>
        </div>

        {/* Currency Quick Banner */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">
            Mode:
          </span>
          <button
            type="button"
            onClick={() => {
              if (input.currency !== 'INR') {
                onChangeInput({
                  ...input,
                  currency: 'INR',
                  fuelPrice: input.fuelPrice < 10 ? 104.50 : input.fuelPrice,
                  unitSystem: 'metric',
                  efficiencyUnit: 'km_l',
                  efficiencyValue: input.efficiencyUnit === 'mpg_us' ? 18 : input.efficiencyValue,
                });
              }
            }}
            className={`px-2.5 py-1 text-xs font-black border-2 transition-all ${
              isINR
                ? 'bg-black text-[#10B981] border-black shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-black'
            }`}
          >
            ₹ INR (India)
          </button>
          <button
            type="button"
            onClick={() => {
              if (input.currency !== 'USD') {
                onChangeInput({
                  ...input,
                  currency: 'USD',
                  fuelPrice: input.fuelPrice > 50 ? 3.45 : input.fuelPrice,
                });
              }
            }}
            className={`px-2.5 py-1 text-xs font-black border-2 transition-all ${
              isUSD
                ? 'bg-black text-[#10B981] border-black shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-black'
            }`}
          >
            $ USD (Global)
          </button>
        </div>
      </div>

      {/* 1. Distance & Trip Direction Card */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
            <label
              htmlFor="trip-distance-input"
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Travel Distance ({distanceUnitLabel})
            </label>
          </div>

          {/* Trip Type toggle (One-way vs Round Trip) */}
          <div className="border-2 border-black bg-slate-100 p-0.5 flex items-center text-xs font-bold uppercase tracking-wider">
            <button
              id="trip-type-oneway"
              type="button"
              onClick={() => onChangeInput({ ...input, tripType: 'one_way' as TripType })}
              className={`flex items-center gap-1.5 px-3 py-1 transition-all ${
                input.tripType === 'one_way'
                  ? 'bg-black text-white font-black'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#10B981]" />
              <span>One-way</span>
            </button>
            <button
              id="trip-type-roundtrip"
              type="button"
              onClick={() => onChangeInput({ ...input, tripType: 'round_trip' as TripType })}
              className={`flex items-center gap-1.5 px-3 py-1 transition-all ${
                input.tripType === 'round_trip'
                  ? 'bg-black text-white font-black'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Round Trip (2x)</span>
            </button>
          </div>
        </div>

        {/* Distance Main Numeric Input */}
        <div className="relative mb-4">
          <input
            id="trip-distance-input"
            type="number"
            min="0"
            step="any"
            value={input.distance === 0 ? '' : input.distance}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChangeInput({ ...input, distance: isNaN(val) ? 0 : Math.max(0, val) });
            }}
            placeholder="0.00"
            className="w-full border-b-4 border-black text-4xl sm:text-5xl font-black p-2 pr-16 focus:outline-none focus:border-[#10B981] bg-transparent text-[#111827] transition-colors"
          />
          <div className="absolute right-2 bottom-3 text-slate-400 font-black text-lg tracking-wider">
            {distanceUnitLabel}
          </div>
        </div>

        {/* Distance Slider */}
        <div className="mb-4 pt-1">
          <input
            id="trip-distance-slider"
            type="range"
            min="1"
            max={isImperial ? 1000 : 1600}
            step={isImperial ? 5 : 10}
            value={Math.min(input.distance, isImperial ? 1000 : 1600)}
            onChange={(e) => {
              onChangeInput({ ...input, distance: parseFloat(e.target.value) });
            }}
            className="w-full h-2.5 bg-slate-200 appearance-none cursor-pointer accent-black"
          />
        </div>

        {/* Quick Distance Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Quick Routes:
          </span>
          {distancePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeInput({ ...input, distance: preset })}
              className={`text-xs px-3 py-1 border-2 font-bold transition-colors ${
                input.distance === preset
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-black'
              }`}
            >
              {preset} {distanceUnitLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Fuel Price Card with INR / USD Presets */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
            <label
              htmlFor="fuel-price-input"
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Fuel Price ({currencyInfo.symbol} / {volumeUnitLabel})
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {input.currency} Rate
            </span>
          </div>
        </div>

        {/* Fuel Price Input */}
        <div className="relative mb-3">
          <input
            id="fuel-price-input"
            type="number"
            min="0"
            step="0.01"
            value={input.fuelPrice === 0 ? '' : input.fuelPrice}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChangeInput({ ...input, fuelPrice: isNaN(val) ? 0 : Math.max(0, val) });
            }}
            placeholder={isINR ? '104.50' : '3.45'}
            className="w-full border-b-4 border-black text-4xl sm:text-5xl font-black p-2 pl-10 sm:pl-12 pr-16 focus:outline-none focus:border-[#10B981] bg-transparent text-[#111827]"
          />
          <span className="absolute left-2 bottom-3 text-3xl sm:text-4xl font-black text-slate-400">
            {currencyInfo.symbol}
          </span>
          <div className="absolute right-2 bottom-3 text-slate-400 font-bold text-base uppercase">
            /{volumeUnitLabel}
          </div>
        </div>

        {/* Dual Live Currency Price Hint */}
        <div className="mb-4 text-xs font-semibold text-slate-500 flex items-center justify-between">
          <span>
            Equivalent: {secondarySymbol}
            {secondaryFuelPriceConverted.toFixed(2)} / {volumeUnitLabel} ({secondaryCurrency})
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Live Conversion</span>
        </div>

        {/* Fuel Type Presets (INR Petrol/Diesel/CNG vs USD Gas/Diesel) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {isINR
            ? FUEL_BENCHMARKS.INR.map((item) => {
                const isMatch = Math.abs(input.fuelPrice - item.price) < 0.2;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeInput({ ...input, fuelPrice: item.price })}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      isMatch
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-slate-300 bg-white hover:border-black text-[#111827]'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                        isMatch ? 'text-[#10B981]' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="font-black text-sm mt-0.5">
                      ₹{item.price.toFixed(2)}
                    </div>
                  </button>
                );
              })
            : isImperial
            ? FUEL_BENCHMARKS.USD_IMPERIAL.map((item) => {
                const isMatch = Math.abs(input.fuelPrice - item.price) < 0.05;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeInput({ ...input, fuelPrice: item.price })}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      isMatch
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-slate-300 bg-white hover:border-black text-[#111827]'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                        isMatch ? 'text-[#10B981]' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="font-black text-sm mt-0.5">
                      {currencyInfo.symbol}
                      {item.price.toFixed(2)}
                    </div>
                  </button>
                );
              })
            : FUEL_BENCHMARKS.USD_METRIC.map((item) => {
                const isMatch = Math.abs(input.fuelPrice - item.price) < 0.05;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeInput({ ...input, fuelPrice: item.price })}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      isMatch
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-slate-300 bg-white hover:border-black text-[#111827]'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                        isMatch ? 'text-[#10B981]' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="font-black text-sm mt-0.5">
                      {currencyInfo.symbol}
                      {item.price.toFixed(2)}
                    </div>
                  </button>
                );
              })}
        </div>
      </div>

      {/* 3. Vehicle Archetype & Fuel Efficiency Card */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
            <label
              htmlFor="fuel-efficiency-input"
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Vehicle Archetype & Mileage
            </label>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            India & Global Models
          </span>
        </div>

        {/* Vehicle Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {VEHICLE_PRESETS.map((preset) => {
            const isSelected = selectedVehicleId === preset.id;
            const efficiencyDisplay =
              input.efficiencyUnit === 'km_l'
                ? `${Math.round((100 / preset.l100km) * 10) / 10} km/L`
                : input.efficiencyUnit === 'l_100km'
                ? `${preset.l100km} L/100km`
                : `${preset.mpgUs} MPG`;

            return (
              <button
                key={preset.id}
                id={`vehicle-preset-${preset.id}`}
                type="button"
                onClick={() => {
                  onSelectVehicle(preset);
                  const effValue =
                    input.efficiencyUnit === 'mpg_us'
                      ? preset.mpgUs
                      : input.efficiencyUnit === 'mpg_uk'
                      ? Math.round(preset.mpgUs / 0.832674)
                      : input.efficiencyUnit === 'l_100km'
                      ? preset.l100km
                      : Math.round((100 / preset.l100km) * 10) / 10;

                  onChangeInput({
                    ...input,
                    efficiencyValue: effValue,
                  });
                }}
                className={`flex flex-col items-start p-3 border-2 text-left transition-all relative ${
                  isSelected
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-slate-300 bg-white hover:border-black text-[#111827]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rotate-45" />
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={isSelected ? 'text-[#10B981]' : 'text-slate-500'}>
                    {getVehicleIcon(preset.iconName)}
                  </span>
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider truncate ${
                      isSelected ? 'text-white' : 'text-black'
                    }`}
                  >
                    {preset.category}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-medium truncate w-full ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {preset.name}
                </div>
                <div
                  className={`mt-1.5 text-xs font-black tracking-tight ${
                    isSelected ? 'text-[#10B981]' : 'text-black'
                  }`}
                >
                  {efficiencyDisplay}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Efficiency Input & Unit Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-2 border-t border-slate-100">
          <div className="sm:col-span-7">
            <label
              htmlFor="fuel-efficiency-input"
              className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1"
            >
              Custom Efficiency / Mileage Value
            </label>
            <div className="relative">
              <input
                id="fuel-efficiency-input"
                type="number"
                min="0.1"
                step="0.1"
                value={input.efficiencyValue === 0 ? '' : input.efficiencyValue}
                onChange={(e) => {
                  onSelectVehicle(null);
                  const val = parseFloat(e.target.value);
                  onChangeInput({ ...input, efficiencyValue: isNaN(val) ? 0 : Math.max(0, val) });
                }}
                placeholder="18.5"
                className="w-full border-b-4 border-black text-3xl font-black p-2 pr-12 focus:outline-none focus:border-[#10B981] bg-transparent text-[#111827]"
              />
              <div className="absolute right-2 bottom-3 text-slate-400 font-bold text-sm">
                AVG
              </div>
            </div>
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="efficiency-unit-selector"
              className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1"
            >
              Efficiency Unit
            </label>
            <select
              id="efficiency-unit-selector"
              value={input.efficiencyUnit}
              onChange={(e) => handleEfficiencyUnitChange(e.target.value as FuelEfficiencyUnit)}
              className="w-full border-2 border-black bg-white text-black text-xs font-black uppercase tracking-wider py-3 px-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="km_l">km/L (Kilometers per Liter - India / Asia)</option>
              <option value="mpg_us">MPG US (Miles per Gallon - USA)</option>
              <option value="l_100km">L/100km (Liters per 100km - Europe)</option>
              <option value="mpg_uk">MPG UK (Miles per UK Gallon - UK)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Commute Frequency (If Commute Mode active) */}
      {input.calculationMode === 'commute' && (
        <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs relative">
          <div className="absolute top-0 left-0 h-full w-2 bg-[#10B981]" />
          <div className="pl-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-black" />
                <h3 className="font-black uppercase tracking-wider text-black text-sm">
                  Commute Weekly Schedule
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Workday recurrence multiplier for periodic budget modeling.
              </p>
            </div>

            <div className="flex items-center gap-1.5 border-2 border-black bg-slate-100 p-1">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onChangeInput({ ...input, commuteDaysPerWeek: days })}
                  className={`w-8 h-8 text-xs font-black uppercase transition-all ${
                    input.commuteDaysPerWeek === days
                      ? 'bg-black text-[#10B981] shadow-xs'
                      : 'bg-white text-slate-700 hover:text-black'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Passenger Split & Tolls */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Occupancy / Split (Persons)
              </label>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Even division of total route expenses
            </div>
          </div>

          <div className="flex items-center border-2 border-black bg-white">
            <button
              id="passenger-minus-btn"
              type="button"
              onClick={() =>
                onChangeInput({
                  ...input,
                  passengers: Math.max(1, (input.passengers || 1) - 1),
                })
              }
              className="w-10 h-10 bg-slate-100 hover:bg-black hover:text-white text-black font-black flex items-center justify-center transition-colors text-base"
            >
              -
            </button>
            <span className="w-10 text-center font-black text-black text-lg">
              {input.passengers < 10 ? `0${input.passengers || 1}` : input.passengers}
            </span>
            <button
              id="passenger-plus-btn"
              type="button"
              onClick={() =>
                onChangeInput({
                  ...input,
                  passengers: Math.min(10, (input.passengers || 1) + 1),
                })
              }
              className="w-10 h-10 bg-slate-100 hover:bg-black hover:text-white text-black font-black flex items-center justify-center transition-colors text-base"
            >
              +
            </button>
          </div>
        </div>

        {/* Collapsible Tolls, Parking, & Wear and Tear */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black py-1 transition-colors"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Secondary Costs (Fastag / Tolls, Parking, Maintenance)</span>
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-black" />
            ) : (
              <ChevronDown className="w-4 h-4 text-black" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-slate-100">
              <div>
                <label
                  htmlFor="tolls-parking-input"
                  className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1"
                >
                  Tolls / Fastag & Parking ({currencyInfo.symbol})
                </label>
                <div className="relative">
                  <input
                    id="tolls-parking-input"
                    type="number"
                    min="0"
                    step="1"
                    value={input.tollsAndParking === 0 ? '' : input.tollsAndParking}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeInput({
                        ...input,
                        tollsAndParking: isNaN(val) ? 0 : Math.max(0, val),
                      });
                    }}
                    placeholder="0.00"
                    className="w-full border-b-2 border-black text-xl font-bold p-1.5 pl-7 focus:outline-none focus:border-[#10B981] bg-transparent text-black"
                  />
                  <span className="absolute left-1 bottom-2 text-base font-bold text-slate-400">
                    {currencyInfo.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="maintenance-input"
                  className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1"
                >
                  Wear & Tear ({currencyInfo.symbol} / {distanceUnitLabel})
                </label>
                <div className="relative">
                  <input
                    id="maintenance-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      input.maintenancePerDistance === 0 ? '' : input.maintenancePerDistance
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeInput({
                        ...input,
                        maintenancePerDistance: isNaN(val) ? 0 : Math.max(0, val),
                      });
                    }}
                    placeholder={isINR ? '1.50' : '0.08'}
                    className="w-full border-b-2 border-black text-xl font-bold p-1.5 pl-7 focus:outline-none focus:border-[#10B981] bg-transparent text-black"
                  />
                  <span className="absolute left-1 bottom-2 text-base font-bold text-slate-400">
                    {currencyInfo.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
