export type UnitSystem = 'imperial' | 'metric';

export type FuelEfficiencyUnit = 'mpg_us' | 'mpg_uk' | 'l_100km' | 'km_l';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'AED' | 'JPY' | 'NZD' | 'CHF';

export type TripType = 'one_way' | 'round_trip';

export type CalculationMode = 'trip' | 'commute';

export interface VehiclePreset {
  id: string;
  name: string;
  category: string;
  iconName: string;
  mpgUs: number;
  l100km: number;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'premium';
  defaultTankCapacityL?: number;
}

export interface FuelPricePreset {
  id: string;
  label: string;
  pricePerGalUsd: number;
  pricePerLiterUsd: number;
}

export interface TripCalculationInput {
  distance: number; // in miles or km depending on unitSystem
  unitSystem: UnitSystem;
  efficiencyUnit: FuelEfficiencyUnit;
  efficiencyValue: number;
  fuelPrice: number; // per gallon or per liter
  currency: CurrencyCode;
  tripType: TripType;
  passengers: number;
  tollsAndParking: number;
  maintenancePerDistance: number; // wear & tear per mile/km
  
  // Live Route info
  originCity?: string;
  destinationCity?: string;
  tankCapacity?: number; // Liters or Gallons

  // Commute specific
  calculationMode: CalculationMode;
  commuteDaysPerWeek: number;
}

export interface CalculationResult {
  totalDistance: number; // actual total distance traveled (accounting for round trip)
  fuelVolumeNeeded: number; // in Gallons or Liters
  fuelCost: number;
  tollsAndParkingCost: number;
  wearTearCost: number;
  totalCost: number;
  costPerDistanceUnit: number; // per mile or km
  costPerPerson: number;
  fuelVolumePerDistance: number;
  carbonEmissionKg: number; // estimated CO2 in kg
  
  // Tank Telemetry
  fullTankCost: number;
  fullTankRange: number;
  refillsNeeded: number;

  // Projections for commute
  weeklyCost?: number;
  monthlyCost?: number;
  yearlyCost?: number;
  weeklyFuelVolume?: number;
  monthlyFuelVolume?: number;
  yearlyFuelVolume?: number;
}

export interface SavedTripRecord {
  id: string;
  title: string;
  date: string;
  input: TripCalculationInput;
  result: CalculationResult;
}

