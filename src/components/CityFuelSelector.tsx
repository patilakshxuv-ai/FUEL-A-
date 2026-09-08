import React, { useState, useMemo } from 'react';
import { TripCalculationInput } from '../types';
import { MAJOR_CITIES, CityInfo } from '../data/cities';
import { Fuel, MapPin, Check, Search, TrendingUp } from 'lucide-react';
import { CURRENCY_CONFIGS } from '../data/presets';

interface CityFuelSelectorProps {
  input: TripCalculationInput;
  onChangeInput: (newInput: TripCalculationInput) => void;
}

export const CityFuelSelector: React.FC<CityFuelSelectorProps> = ({ input, onChangeInput }) => {
  const [selectedCityName, setSelectedCityName] = useState<string>('New Delhi');
  const [selectedFuelGrade, setSelectedFuelGrade] = useState<'petrol' | 'diesel' | 'cng'>('petrol');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchCity, setSearchCity] = useState<string>('');

  const isINR = input.currency === 'INR';
  const isImperial = input.unitSystem === 'imperial';
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;

  const regions = isINR
    ? ['All', 'North India', 'South India', 'West India', 'East & Central India']
    : ['All', 'USA & Canada', 'Global & International', 'North India', 'South India'];

  const filteredCities = useMemo(() => {
    return MAJOR_CITIES.filter((c) => {
      // Currency context filter
      if (selectedRegion === 'All') {
        if (isINR && c.region === 'USA & Canada') return false;
      } else if (c.region !== selectedRegion) {
        return false;
      }

      if (searchCity.trim()) {
        const q = searchCity.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.stateCountry.toLowerCase().includes(q);
      }

      return true;
    });
  }, [isINR, selectedRegion, searchCity]);

  const handleApplyCityPrice = (city: CityInfo, grade: 'petrol' | 'diesel' | 'cng') => {
    setSelectedCityName(city.name);
    setSelectedFuelGrade(grade);

    let targetPrice = 0;
    if (isINR) {
      if (grade === 'diesel') targetPrice = city.dieselInr;
      else if (grade === 'cng') targetPrice = city.cngInr || 76.50;
      else targetPrice = city.petrolInr;
    } else {
      if (grade === 'diesel') {
        targetPrice = isImperial ? city.dieselUsdGal || 3.79 : 1.00;
      } else {
        targetPrice = isImperial ? city.gasUsdGal || 3.45 : 0.91;
      }
    }

    onChangeInput({
      ...input,
      fuelPrice: targetPrice,
      originCity: city.name,
    });
  };

  return (
    <div id="city-fuel-index" className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-[#10B981]" />
              <span>City-Wise Real-Time Fuel Price Index</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              1-tap live rates across all 50+ major Indian states, US metros, and global capitals
            </p>
          </div>
        </div>

        {/* Grade Selector: Petrol / Diesel / CNG */}
        <div className="border-2 border-black bg-slate-100 p-0.5 flex items-center text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const city = MAJOR_CITIES.find((c) => c.name === selectedCityName) || MAJOR_CITIES[0];
              handleApplyCityPrice(city, 'petrol');
            }}
            className={`px-3 py-1.5 transition-all ${
              selectedFuelGrade === 'petrol'
                ? 'bg-black text-[#10B981] shadow-xs'
                : 'text-slate-700 hover:text-black'
            }`}
          >
            {isINR ? 'Petrol' : 'Gasoline'}
          </button>
          <button
            type="button"
            onClick={() => {
              const city = MAJOR_CITIES.find((c) => c.name === selectedCityName) || MAJOR_CITIES[0];
              handleApplyCityPrice(city, 'diesel');
            }}
            className={`px-3 py-1.5 transition-all ${
              selectedFuelGrade === 'diesel'
                ? 'bg-black text-[#10B981] shadow-xs'
                : 'text-slate-700 hover:text-black'
            }`}
          >
            Diesel
          </button>
          {isINR && (
            <button
              type="button"
              onClick={() => {
                const city = MAJOR_CITIES.find((c) => c.name === selectedCityName) || MAJOR_CITIES[0];
                handleApplyCityPrice(city, 'cng');
              }}
              className={`px-3 py-1.5 transition-all ${
                selectedFuelGrade === 'cng'
                  ? 'bg-black text-[#10B981] shadow-xs'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              CNG
            </button>
          )}
        </div>
      </div>

      {/* Region Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 whitespace-nowrap border transition-all ${
                selectedRegion === reg
                  ? 'bg-black text-[#10B981] border-black shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-black hover:text-black'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search city fuel rates..."
            className="w-full text-[11px] font-medium bg-slate-50 border border-slate-300 pl-7 pr-2 py-1 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Grid of Metro Cities with Instant 1-Tap Price apply */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredCities.map((city) => {
          let price = isINR
            ? selectedFuelGrade === 'diesel'
              ? city.dieselInr
              : selectedFuelGrade === 'cng'
              ? city.cngInr || 76.50
              : city.petrolInr
            : isImperial
            ? selectedFuelGrade === 'diesel'
              ? city.dieselUsdGal || 3.79
              : city.gasUsdGal || 3.45
            : 0.91;

          const isSelected = Math.abs(input.fuelPrice - price) < 0.05 && (input.originCity?.toLowerCase().includes(city.name.toLowerCase()) || selectedCityName === city.name);

          return (
            <button
              key={city.name}
              type="button"
              onClick={() => handleApplyCityPrice(city, selectedFuelGrade)}
              className={`p-2.5 border-2 text-left transition-all relative ${
                isSelected
                  ? 'bg-black text-white border-black shadow-xs ring-2 ring-[#10B981]'
                  : 'bg-slate-50 hover:bg-white text-black border-slate-200 hover:border-black'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rotate-45" />
              )}
              <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-tight truncate">
                <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#10B981]' : 'text-slate-400'}`} />
                <span className="truncate">{city.name}</span>
              </div>
              <div className="text-[9px] text-slate-500 truncate font-medium">
                {city.stateCountry}
              </div>
              <div
                className={`text-sm font-black mt-1 font-mono ${
                  isSelected ? 'text-[#10B981]' : 'text-slate-900'
                }`}
              >
                {currencyInfo.symbol}
                {price.toFixed(2)}
                <span className="text-[10px] font-normal opacity-70 ml-0.5">
                  /{isImperial ? 'gal' : 'L'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
