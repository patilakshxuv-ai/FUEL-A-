import { CalculationResult, TripCalculationInput } from '../types';

export function calculateFuelCost(input: TripCalculationInput): CalculationResult {
  const isImperial = input.unitSystem === 'imperial';
  const multiplier = input.tripType === 'round_trip' ? 2 : 1;
  const totalDistance = Math.max(0, input.distance) * multiplier;

  if (totalDistance === 0 || input.efficiencyValue <= 0 || input.fuelPrice <= 0) {
    return {
      totalDistance,
      fuelVolumeNeeded: 0,
      fuelCost: 0,
      tollsAndParkingCost: 0,
      wearTearCost: 0,
      totalCost: 0,
      costPerDistanceUnit: 0,
      costPerPerson: 0,
      fuelVolumePerDistance: 0,
      carbonEmissionKg: 0,
      fullTankCost: 0,
      fullTankRange: 0,
      refillsNeeded: 0,
    };
  }

  // Calculate distance in both miles and km
  const distanceMiles = isImperial ? totalDistance : totalDistance * 0.621371;
  const distanceKm = isImperial ? totalDistance * 1.60934 : totalDistance;

  // Calculate fuel consumed in Liters and US Gallons based on efficiency unit
  let fuelInLiters = 0;
  let fuelInUsGallons = 0;

  switch (input.efficiencyUnit) {
    case 'mpg_us': {
      fuelInUsGallons = distanceMiles / input.efficiencyValue;
      fuelInLiters = fuelInUsGallons * 3.785411784;
      break;
    }
    case 'mpg_uk': {
      const fuelInUkGallons = distanceMiles / input.efficiencyValue;
      fuelInLiters = fuelInUkGallons * 4.54609;
      fuelInUsGallons = fuelInLiters / 3.785411784;
      break;
    }
    case 'l_100km': {
      fuelInLiters = (distanceKm / 100) * input.efficiencyValue;
      fuelInUsGallons = fuelInLiters / 3.785411784;
      break;
    }
    case 'km_l': {
      fuelInLiters = distanceKm / input.efficiencyValue;
      fuelInUsGallons = fuelInLiters / 3.785411784;
      break;
    }
  }

  // Fuel volume needed in the user's active unit system
  const fuelVolumeNeeded = isImperial ? fuelInUsGallons : fuelInLiters;

  // Fuel Cost:
  // If imperial, fuelPrice is considered per US Gallon. If metric, fuelPrice is considered per Liter.
  let fuelCost = 0;
  if (isImperial) {
    fuelCost = fuelInUsGallons * input.fuelPrice;
  } else {
    fuelCost = fuelInLiters * input.fuelPrice;
  }

  // Extra costs
  const tollsAndParkingCost = Math.max(0, input.tollsAndParking || 0) * (input.tripType === 'round_trip' ? 2 : 1);
  const wearTearCost = Math.max(0, input.maintenancePerDistance || 0) * totalDistance;
  const totalCost = fuelCost + tollsAndParkingCost + wearTearCost;

  const passengers = Math.max(1, input.passengers || 1);
  const costPerPerson = totalCost / passengers;
  const costPerDistanceUnit = totalDistance > 0 ? totalCost / totalDistance : 0;
  const fuelVolumePerDistance = totalDistance > 0 ? fuelVolumeNeeded / totalDistance : 0;

  // Average gasoline CO2 emission: ~2.31 kg per Liter (approx 8.74 kg per US gallon)
  const carbonEmissionKg = fuelInLiters * 2.31;

  // Commute calculations if in commute mode
  let weeklyCost: number | undefined;
  let monthlyCost: number | undefined;
  let yearlyCost: number | undefined;
  let weeklyFuelVolume: number | undefined;
  let monthlyFuelVolume: number | undefined;
  let yearlyFuelVolume: number | undefined;

  if (input.calculationMode === 'commute') {
    const days = Math.max(1, Math.min(7, input.commuteDaysPerWeek || 5));
    weeklyCost = totalCost * days;
    monthlyCost = weeklyCost * 4.333; // Average weeks per month
    yearlyCost = weeklyCost * 52;

    weeklyFuelVolume = fuelVolumeNeeded * days;
    monthlyFuelVolume = weeklyFuelVolume * 4.333;
    yearlyFuelVolume = weeklyFuelVolume * 52;
  }

  // Tank Telemetry calculations
  const effectiveTankLiters = input.tankCapacity
    ? isImperial
      ? input.tankCapacity * 3.78541
      : input.tankCapacity
    : 45; // default 45 Liters

  const effectiveTankGallons = effectiveTankLiters / 3.785411784;
  const tankVolumeInCurrentUnits = isImperial ? effectiveTankGallons : effectiveTankLiters;
  const fullTankCost = tankVolumeInCurrentUnits * input.fuelPrice;

  // Range on full tank
  let fullTankRangeKm = 0;
  switch (input.efficiencyUnit) {
    case 'km_l':
      fullTankRangeKm = effectiveTankLiters * input.efficiencyValue;
      break;
    case 'l_100km':
      fullTankRangeKm = (effectiveTankLiters / Math.max(0.1, input.efficiencyValue)) * 100;
      break;
    case 'mpg_us':
      fullTankRangeKm = (effectiveTankGallons * input.efficiencyValue) * 1.60934;
      break;
    case 'mpg_uk':
      fullTankRangeKm = ((effectiveTankLiters / 4.54609) * input.efficiencyValue) * 1.60934;
      break;
  }

  const fullTankRange = isImperial ? fullTankRangeKm * 0.621371 : fullTankRangeKm;
  const refillsNeeded = fullTankRange > 0 ? totalDistance / fullTankRange : 0;

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    fuelVolumeNeeded: Math.round(fuelVolumeNeeded * 100) / 100,
    fuelCost: Math.round(fuelCost * 100) / 100,
    tollsAndParkingCost: Math.round(tollsAndParkingCost * 100) / 100,
    wearTearCost: Math.round(wearTearCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerDistanceUnit: Math.round(costPerDistanceUnit * 100) / 100,
    costPerPerson: Math.round(costPerPerson * 100) / 100,
    fuelVolumePerDistance: Math.round(fuelVolumePerDistance * 1000) / 1000,
    carbonEmissionKg: Math.round(carbonEmissionKg * 10) / 10,
    fullTankCost: Math.round(fullTankCost * 100) / 100,
    fullTankRange: Math.round(fullTankRange),
    refillsNeeded: Math.round(refillsNeeded * 10) / 10,
    weeklyCost: weeklyCost !== undefined ? Math.round(weeklyCost * 100) / 100 : undefined,
    monthlyCost: monthlyCost !== undefined ? Math.round(monthlyCost * 100) / 100 : undefined,
    yearlyCost: yearlyCost !== undefined ? Math.round(yearlyCost * 100) / 100 : undefined,
    weeklyFuelVolume: weeklyFuelVolume !== undefined ? Math.round(weeklyFuelVolume * 10) / 10 : undefined,
    monthlyFuelVolume: monthlyFuelVolume !== undefined ? Math.round(monthlyFuelVolume * 10) / 10 : undefined,
    yearlyFuelVolume: yearlyFuelVolume !== undefined ? Math.round(yearlyFuelVolume * 10) / 10 : undefined,
  };
}
