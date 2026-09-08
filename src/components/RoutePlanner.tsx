import React, { useState, useMemo } from 'react';
import { TripCalculationInput } from '../types';
import {
  MAJOR_CITIES,
  POPULAR_ROUTES,
  calculateRoadDistanceBetweenCoords,
  CityInfo,
  PopularRoutePreset,
} from '../data/cities';
import {
  MapPin,
  Navigation,
  ArrowRightLeft,
  LocateFixed,
  Check,
  Search,
  Clock,
  Car,
  Receipt,
  Route,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface RoutePlannerProps {
  input: TripCalculationInput;
  onChangeInput: (newInput: TripCalculationInput) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ input, onChangeInput }) => {
  const [origin, setOrigin] = useState(input.originCity || 'New Delhi');
  const [destination, setDestination] = useState(input.destinationCity || 'Jaipur');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const isImperial = input.unitSystem === 'imperial';
  const isINR = input.currency === 'INR';

  // Categories list
  const categories = isINR
    ? ['All', 'Expressway', 'North India', 'South India', 'West India', 'East & Central', 'Scenic Corridors']
    : ['All', 'USA Interstates', 'Scenic Corridors', 'Expressway', 'North India', 'South India'];

  // Filter routes based on currency / region preference, category, and search query
  const filteredRoutes = useMemo(() => {
    return POPULAR_ROUTES.filter((r) => {
      // Region filter
      if (selectedCategory === 'All') {
        if (isINR && r.region === 'US') return false;
      } else if (r.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesOrigin = r.origin.toLowerCase().includes(q);
        const matchesDest = r.destination.toLowerCase().includes(q);
        const matchesHwy = r.highwayCode.toLowerCase().includes(q);
        const matchesWaypoints = r.keyWaypoints?.toLowerCase().includes(q) || false;
        return matchesName || matchesOrigin || matchesDest || matchesHwy || matchesWaypoints;
      }

      return true;
    });
  }, [isINR, selectedCategory, searchQuery]);

  // Find currently active route preset if any
  const matchedRoute = useMemo(() => {
    return POPULAR_ROUTES.find(
      (r) =>
        (r.origin.toLowerCase().includes(origin.toLowerCase()) || origin.toLowerCase().includes(r.origin.toLowerCase())) &&
        (r.destination.toLowerCase().includes(destination.toLowerCase()) || destination.toLowerCase().includes(r.destination.toLowerCase()))
    );
  }, [origin, destination]);

  const handleSelectPopularRoute = (route: PopularRoutePreset) => {
    setOrigin(route.origin);
    setDestination(route.destination);

    const baseDistance = isImperial ? route.distanceMiles : route.distanceKm;
    const finalDistance = isRoundTrip ? baseDistance * 2 : baseDistance;
    const tollAmount = isINR ? route.tollsEstimated : Math.round(route.tollsEstimated / 86);
    const finalTolls = isRoundTrip ? Math.round(tollAmount * 1.8) : tollAmount; // Fastag round trip discount approx 10-20%

    // Check if origin city has fuel price info to auto sync
    const originCityObj = MAJOR_CITIES.find(
      (c) => c.name.toLowerCase() === route.origin.toLowerCase()
    );

    let newFuelPrice = input.fuelPrice;
    if (originCityObj) {
      if (isINR) {
        newFuelPrice = input.fuelType === 'diesel' ? originCityObj.dieselInr : input.fuelType === 'cng' ? originCityObj.cngInr || 76.5 : originCityObj.petrolInr;
      } else {
        newFuelPrice = isImperial ? (input.fuelType === 'diesel' ? originCityObj.dieselUsdGal || 3.79 : originCityObj.gasUsdGal || 3.45) : input.fuelPrice;
      }
    }

    onChangeInput({
      ...input,
      originCity: route.origin,
      destinationCity: route.destination,
      distance: finalDistance,
      tollsAndParking: finalTolls,
      fuelPrice: newFuelPrice,
    });
  };

  const handleCalculateDistanceBetweenCities = (fromName: string, toName: string, roundTrip = isRoundTrip) => {
    const city1 = MAJOR_CITIES.find(
      (c) =>
        c.name.toLowerCase() === fromName.toLowerCase() ||
        fromName.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(fromName.toLowerCase())
    );
    const city2 = MAJOR_CITIES.find(
      (c) =>
        c.name.toLowerCase() === toName.toLowerCase() ||
        toName.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(toName.toLowerCase())
    );

    if (city1 && city2 && city1.name !== city2.name) {
      const calc = calculateRoadDistanceBetweenCoords(
        city1.lat,
        city1.lng,
        city2.lat,
        city2.lng
      );
      const baseDistance = isImperial ? calc.distanceMiles : calc.distanceKm;
      const finalDistance = roundTrip ? baseDistance * 2 : baseDistance;

      // Estimate tolls (~ ₹1.4 per km on Indian highways)
      const estimatedTolls = isINR
        ? Math.round(calc.distanceKm * 1.35 * (roundTrip ? 1.8 : 1.0))
        : Math.round((calc.distanceKm * 1.35 * (roundTrip ? 1.8 : 1.0)) / 86);

      // Auto update fuel price from start city if available
      let updatedFuelPrice = input.fuelPrice;
      if (isINR) {
        updatedFuelPrice = input.fuelType === 'diesel' ? city1.dieselInr : input.fuelType === 'cng' ? city1.cngInr || 76.5 : city1.petrolInr;
      }

      onChangeInput({
        ...input,
        originCity: city1.name,
        destinationCity: city2.name,
        distance: finalDistance,
        tollsAndParking: estimatedTolls,
        fuelPrice: updatedFuelPrice,
      });
    }
  };

  const handleSwapCities = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    setOrigin(prevDest);
    setDestination(prevOrigin);
    handleCalculateDistanceBetweenCities(prevDest, prevOrigin);
  };

  const handleToggleRoundTrip = () => {
    const newRoundTrip = !isRoundTrip;
    setIsRoundTrip(newRoundTrip);

    if (newRoundTrip) {
      onChangeInput({
        ...input,
        distance: Math.round(input.distance * 2),
        tollsAndParking: Math.round(input.tollsAndParking * 1.8),
      });
    } else {
      onChangeInput({
        ...input,
        distance: Math.max(10, Math.round(input.distance / 2)),
        tollsAndParking: Math.round(input.tollsAndParking / 1.8),
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Find nearest city in database
        let nearest: CityInfo = MAJOR_CITIES[0];
        let minDistance = Infinity;

        MAJOR_CITIES.forEach((c) => {
          const d = Math.hypot(c.lat - lat, c.lng - lng);
          if (d < minDistance) {
            minDistance = d;
            nearest = c;
          }
        });

        const newOrigin = nearest.name;
        setOrigin(newOrigin);
        handleCalculateDistanceBetweenCities(nearest.name, destination);
      },
      () => {
        setIsLocating(false);
        setOrigin('New Delhi');
      },
      { timeout: 8000 }
    );
  };

  // Group cities by region for select dropdowns
  const groupedCities = useMemo<Record<string, CityInfo[]>>(() => {
    const map: Record<string, CityInfo[]> = {};
    MAJOR_CITIES.forEach((c) => {
      if (!map[c.region]) map[c.region] = [];
      map[c.region].push(c);
    });
    return map;
  }, []);

  return (
    <div id="route-planner-section" className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#10B981] rotate-45" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#10B981]" />
              <span>Live Highway &amp; Inter-City Route Planner</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Instant distance, toll estimates, driving duration, and auto fuel sync across 50+ cities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Round Trip Toggle */}
          <button
            type="button"
            onClick={handleToggleRoundTrip}
            className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 border-2 transition-all ${
              isRoundTrip
                ? 'bg-black text-[#10B981] border-black shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-black'
            }`}
            title="Toggle between One-Way and Round-Trip calculation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isRoundTrip ? 'Round Trip (2x)' : 'One Way'}</span>
          </button>

          {/* GPS Auto-Locate */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-black bg-slate-100 hover:bg-black hover:text-white px-2.5 py-1.5 border-2 border-black transition-colors"
            title="Use GPS to set starting location"
          >
            {isLocating ? (
              <span>Locating...</span>
            ) : locationSuccess ? (
              <>
                <Check className="w-3 h-3 text-[#10B981]" />
                <span>Found!</span>
              </>
            ) : (
              <>
                <LocateFixed className="w-3 h-3 text-[#10B981]" />
                <span>GPS Locate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Origin & Destination Interactive Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center mb-4">
        {/* Origin input / selector */}
        <div className="sm:col-span-5 relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Origin / Starting Point
            </label>
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
              START
            </span>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              list="all-cities-datalist"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                handleCalculateDistanceBetweenCities(e.target.value, destination);
              }}
              placeholder="e.g. New Delhi, Mumbai, Bengaluru..."
              className="w-full border-2 border-black bg-slate-50 text-black text-xs font-black uppercase tracking-wider pl-9 pr-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#10B981]"
            />
          </div>
        </div>

        {/* Swap button */}
        <div className="sm:col-span-1 flex justify-center sm:pt-4">
          <button
            type="button"
            onClick={handleSwapCities}
            title="Swap Origin and Destination"
            className="p-2 border-2 border-black bg-white hover:bg-black hover:text-[#10B981] text-black transition-all shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Destination input / selector */}
        <div className="sm:col-span-5 relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Destination City
            </label>
            <span className="text-[9px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 border border-rose-200">
              END
            </span>
          </div>
          <div className="relative">
            <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              list="all-cities-datalist"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                handleCalculateDistanceBetweenCities(origin, e.target.value);
              }}
              placeholder="e.g. Jaipur, Pune, Hyderabad..."
              className="w-full border-2 border-black bg-slate-50 text-black text-xs font-black uppercase tracking-wider pl-9 pr-3 py-2.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#10B981]"
            />
          </div>
        </div>
      </div>

      {/* Datalist for fast autocomplete across all 50+ cities */}
      <datalist id="all-cities-datalist">
        {MAJOR_CITIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.stateCountry} • {c.region}
          </option>
        ))}
      </datalist>

      {/* Active Route Telemetry & Waypoints Banner */}
      {matchedRoute && (
        <div className="mb-4 p-3.5 bg-slate-900 text-white border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#10B981] text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                {matchedRoute.highwayCode}
              </span>
              <span className="text-xs font-black text-white">{matchedRoute.name}</span>
              {isRoundTrip && (
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 font-black uppercase">
                  Round Trip
                </span>
              )}
            </div>
            {matchedRoute.keyWaypoints && (
              <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
                <Route className="w-3 h-3 text-[#10B981] shrink-0" />
                <span className="truncate">Key Waypoints: {matchedRoute.keyWaypoints}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#10B981]" />
              <span>
                ~{isRoundTrip ? (matchedRoute.approxDriveTimeHours * 2).toFixed(1) : matchedRoute.approxDriveTimeHours}h
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-300">
              <Receipt className="w-3.5 h-3.5" />
              <span>
                {isINR ? '₹' : '$'}
                {isRoundTrip ? Math.round(matchedRoute.tollsEstimated * 1.8) : matchedRoute.tollsEstimated} Tolls
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#10B981] font-black">
              <Car className="w-3.5 h-3.5" />
              <span>
                {isRoundTrip ? (isImperial ? matchedRoute.distanceMiles * 2 : matchedRoute.distanceKm * 2) : (isImperial ? matchedRoute.distanceMiles : matchedRoute.distanceKm)}{' '}
                {isImperial ? 'mi' : 'km'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Popular Highway Corridor Quick Presets Filter & Search */}
      <div className="pt-3 border-t-2 border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Select Popular Highway / Expressway Corridor:</span>
          </span>

          {/* Quick Route Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search highway, corridor or city..."
              className="w-full text-[11px] font-medium bg-slate-50 border border-slate-300 pl-7 pr-2 py-1 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-[#10B981] border-black shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Route Preset Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
          {filteredRoutes.map((route) => {
            const isMatch =
              origin.toLowerCase().includes(route.origin.toLowerCase()) &&
              destination.toLowerCase().includes(route.destination.toLowerCase());

            const dist = isImperial ? route.distanceMiles : route.distanceKm;

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => handleSelectPopularRoute(route)}
                className={`text-left p-2.5 border-2 font-bold transition-all relative flex flex-col justify-between ${
                  isMatch
                    ? 'bg-black text-white border-black shadow-xs ring-2 ring-[#10B981]'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-black hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 font-mono ${
                    isMatch ? 'bg-[#10B981] text-black' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {route.highwayCode}
                  </span>
                  <span className={`text-[10px] font-mono ${isMatch ? 'text-[#10B981]' : 'text-slate-500'}`}>
                    ~{route.approxDriveTimeHours}h drive
                  </span>
                </div>

                <div className={`text-xs font-black truncate ${isMatch ? 'text-white' : 'text-slate-900'}`}>
                  {route.name}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 pt-1 border-t border-slate-200/50">
                  <span className={isMatch ? 'text-slate-300' : 'text-slate-600'}>
                    {dist} {isImperial ? 'mi' : 'km'}
                  </span>
                  <span className={isMatch ? 'text-amber-300' : 'text-slate-700'}>
                    Toll: {isINR ? '₹' : '$'}{route.tollsEstimated}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200">
            No route presets match "{searchQuery}". You can still enter custom origin &amp; destination cities above.
          </div>
        )}
      </div>
    </div>
  );
};
