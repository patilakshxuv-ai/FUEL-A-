import { CurrencyCode, FuelEfficiencyUnit, VehiclePreset } from '../types';

export interface CurrencyConfig {
  symbol: string;
  label: string;
  name: string;
  rateToUsd: number; // 1 Unit = X USD
  rateToInr: number; // 1 Unit = X INR
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  INR: { symbol: '₹', label: 'INR (₹)', name: 'Indian Rupee', rateToUsd: 0.0116, rateToInr: 1.0 },
  USD: { symbol: '$', label: 'USD ($)', name: 'US Dollar', rateToUsd: 1.0, rateToInr: 86.2 },
  EUR: { symbol: '€', label: 'EUR (€)', name: 'Euro', rateToUsd: 1.08, rateToInr: 93.1 },
  GBP: { symbol: '£', label: 'GBP (£)', name: 'British Pound', rateToUsd: 1.28, rateToInr: 110.3 },
  CAD: { symbol: 'C$', label: 'CAD (C$)', name: 'Canadian Dollar', rateToUsd: 0.74, rateToInr: 63.8 },
  AUD: { symbol: 'A$', label: 'AUD (A$)', name: 'Australian Dollar', rateToUsd: 0.65, rateToInr: 56.0 },
  AED: { symbol: 'AED', label: 'AED (د.إ)', name: 'UAE Dirham', rateToUsd: 0.272, rateToInr: 23.47 },
  JPY: { symbol: '¥', label: 'JPY (¥)', name: 'Japanese Yen', rateToUsd: 0.0067, rateToInr: 0.58 },
  NZD: { symbol: 'NZ$', label: 'NZD (NZ$)', name: 'New Zealand Dollar', rateToUsd: 0.61, rateToInr: 52.6 },
  CHF: { symbol: 'CHF', label: 'CHF (Fr.)', name: 'Swiss Franc', rateToUsd: 1.13, rateToInr: 97.4 },
};

// Backward compatibility helper
export const CURRENCY_SYMBOLS = CURRENCY_CONFIGS;

// Formatter with Indian numbering format support for INR and standard for others
export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  if (isNaN(amount) || !isFinite(amount)) return '0.00';
  
  if (currency === 'INR') {
    // Format using Indian Numbering (Lakhs / Crores)
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Convert amount between currencies for dual comparison
export function convertCurrencyAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const inUsd = amount * (CURRENCY_CONFIGS[from]?.rateToUsd || 1.0);
  const targetRate = CURRENCY_CONFIGS[to]?.rateToUsd || 1.0;
  return inUsd / targetRate;
}

export const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: 'motorcycle',
    name: '2-Wheeler / Bike / Scooter',
    category: '2-Wheeler',
    iconName: 'Bike',
    mpgUs: 129,
    l100km: 1.82,
    fuelType: 'gasoline',
    defaultTankCapacityL: 13,
  },
  {
    id: 'compact_hatch',
    name: 'Hatchback (Swift / i20 / Tiago)',
    category: 'Hatchback',
    iconName: 'Car',
    mpgUs: 47,
    l100km: 5.0,
    fuelType: 'gasoline',
    defaultTankCapacityL: 37,
  },
  {
    id: 'sedan',
    name: 'Sedan (City / Verna / Dzire)',
    category: 'Sedan',
    iconName: 'CarFront',
    mpgUs: 41,
    l100km: 5.71,
    fuelType: 'gasoline',
    defaultTankCapacityL: 45,
  },
  {
    id: 'compact_suv',
    name: 'Compact SUV (Creta / Nexon / Brezza)',
    category: 'Compact SUV',
    iconName: 'CarFront',
    mpgUs: 35.8,
    l100km: 6.58,
    fuelType: 'gasoline',
    defaultTankCapacityL: 50,
  },
  {
    id: 'heavy_suv',
    name: 'Full SUV / MPV (Innova / Fortuner)',
    category: 'Large SUV',
    iconName: 'Truck',
    mpgUs: 27.1,
    l100km: 8.7,
    fuelType: 'diesel',
    defaultTankCapacityL: 65,
  },
  {
    id: 'hybrid_eco',
    name: 'Hybrid / Eco (Prius / Hyryder)',
    category: 'Hybrid',
    iconName: 'Zap',
    mpgUs: 61.2,
    l100km: 3.85,
    fuelType: 'hybrid',
    defaultTankCapacityL: 43,
  },
  {
    id: 'commercial_van',
    name: 'Van / Pickup / LCV',
    category: 'Commercial',
    iconName: 'PackageCheck',
    mpgUs: 28.2,
    l100km: 8.33,
    fuelType: 'diesel',
    defaultTankCapacityL: 70,
  },
  {
    id: 'sports',
    name: 'Performance / Sports Car',
    category: 'Sports',
    iconName: 'Gauge',
    mpgUs: 20.0,
    l100km: 11.76,
    fuelType: 'premium',
    defaultTankCapacityL: 60,
  },
];

// Fuel Benchmarks for both INR (₹/L) and USD ($/Gal, $/L)
export const FUEL_BENCHMARKS = {
  INR: [
    { id: 'inr_petrol', label: 'Petrol', price: 104.50, unit: '₹/L' },
    { id: 'inr_diesel', label: 'Diesel', price: 89.80, unit: '₹/L' },
    { id: 'inr_cng', label: 'CNG', price: 76.50, unit: '₹/kg' },
    { id: 'inr_speed', label: 'XP95 / Speed', price: 111.80, unit: '₹/L' },
  ],
  USD_IMPERIAL: [
    { id: 'usd_regular', label: 'Regular Gas', price: 3.45, unit: '$/Gal' },
    { id: 'usd_midgrade', label: 'Mid-Grade', price: 3.89, unit: '$/Gal' },
    { id: 'usd_premium', label: 'Premium 93', price: 4.29, unit: '$/Gal' },
    { id: 'usd_diesel', label: 'Diesel #2', price: 3.79, unit: '$/Gal' },
  ],
  USD_METRIC: [
    { id: 'usd_regular_l', label: 'Regular Gas', price: 0.91, unit: '$/L' },
    { id: 'usd_midgrade_l', label: 'Mid-Grade', price: 1.03, unit: '$/L' },
    { id: 'usd_premium_l', label: 'Premium 93', price: 1.13, unit: '$/L' },
    { id: 'usd_diesel_l', label: 'Diesel #2', price: 1.00, unit: '$/L' },
  ],
};

export const DISTANCE_QUICK_PRESETS_MILES = [10, 25, 50, 100, 250, 500];
export const DISTANCE_QUICK_PRESETS_KM = [15, 35, 75, 150, 300, 600];

// Conversion utilities
export function convertEfficiency(
  value: number,
  from: FuelEfficiencyUnit,
  to: FuelEfficiencyUnit
): number {
  if (value <= 0) return 0;
  if (from === to) return value;

  // Convert everything to MPG US first
  let mpgUs = 0;
  switch (from) {
    case 'mpg_us':
      mpgUs = value;
      break;
    case 'mpg_uk':
      mpgUs = value * 0.832674; // 1 UK gal = 1.20095 US gal -> 1 mpg UK = 0.832674 mpg US
      break;
    case 'l_100km':
      mpgUs = 235.214583 / value;
      break;
    case 'km_l':
      mpgUs = value * 2.35214583;
      break;
  }

  // Convert MPG US to target
  switch (to) {
    case 'mpg_us':
      return Math.round(mpgUs * 10) / 10;
    case 'mpg_uk':
      return Math.round((mpgUs / 0.832674) * 10) / 10;
    case 'l_100km':
      return Math.round((235.214583 / mpgUs) * 10) / 10;
    case 'km_l':
      return Math.round((mpgUs / 2.35214583) * 10) / 10;
  }
}
