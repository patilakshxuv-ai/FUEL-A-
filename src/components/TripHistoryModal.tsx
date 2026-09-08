import React, { useState } from 'react';
import { SavedTripRecord, TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/presets';
import {
  X,
  History,
  Trash2,
  Download,
  Printer,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: SavedTripRecord[];
  onLoadTrip: (trip: SavedTripRecord) => void;
  onDeleteTrip: (id: string) => void;
  onClearAllTrips: () => void;
}

export const TripHistoryModal: React.FC<TripHistoryModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onLoadTrip,
  onDeleteTrip,
  onClearAllTrips,
}) => {
  if (!isOpen) return null;

  const handleExportCsv = () => {
    if (savedTrips.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Title,Origin,Destination,Distance,Unit,Efficiency,FuelPrice,Currency,FuelCost,Tolls,TotalCost,CostPerPerson,Passengers,CO2_kg\n';

    savedTrips.forEach((t) => {
      const isImp = t.input.unitSystem === 'imperial';
      const row = [
        `"${t.date}"`,
        `"${t.title}"`,
        `"${t.input.originCity || ''}"`,
        `"${t.input.destinationCity || ''}"`,
        t.result.totalDistance,
        isImp ? 'Miles' : 'KM',
        `${t.input.efficiencyValue} ${t.input.efficiencyUnit}`,
        t.input.fuelPrice,
        t.input.currency,
        t.result.fuelCost,
        t.result.tollsAndParkingCost,
        t.result.totalCost,
        t.result.costPerPerson,
        t.input.passengers,
        t.result.carbonEmissionKg,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fuelpath-trip-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSpentInHistory = savedTrips.reduce((acc, t) => acc + t.result.totalCost, 0);
  const totalKmInHistory = savedTrips.reduce((acc, t) => acc + t.result.totalDistance, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-[#10B981] flex items-center justify-center font-black">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-black">
                Trip History &amp; Expense Log
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {savedTrips.length} Saved Trip{savedTrips.length === 1 ? '' : 's'} • Offline Persistent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedTrips.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="p-1.5 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
                  title="Export CSV"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1.5 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
                  title="Print Log"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Stats Banner */}
        {savedTrips.length > 0 && (
          <div className="bg-[#111827] text-white p-4 mx-5 mt-4 border-l-4 border-[#10B981] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981]">
                Cumulative Log Telemetry
              </span>
              <div className="text-xs text-slate-300 mt-0.5">
                Total Logged Distance: <strong className="text-white">{totalKmInHistory.toFixed(0)} units</strong>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={onClearAllTrips}
                className="text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-300 underline"
              >
                Clear Log
              </button>
            </div>
          </div>
        )}

        {/* Trips List */}
        <div className="p-5 overflow-y-auto divide-y-2 divide-slate-100 flex-1">
          {savedTrips.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-600">
                No Saved Trips Yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Calculate any route and click &quot;Save Trip to Log&quot; on the summary card to keep an offline
                history of your road trips and commutes.
              </p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const currInfo = CURRENCY_CONFIGS[trip.input.currency] || CURRENCY_CONFIGS.INR;
              const isImp = trip.input.unitSystem === 'imperial';
              const distUnit = isImp ? 'mi' : 'km';

              return (
                <div
                  key={trip.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-black text-sm uppercase tracking-tight">
                        {trip.title}
                      </span>
                      <span className="text-[9px] bg-slate-200 text-black font-black px-1.5 py-0.5 uppercase">
                        {trip.date}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-600 flex items-center gap-2 flex-wrap">
                      <span>
                        {trip.result.totalDistance} {distUnit}
                      </span>
                      <span>•</span>
                      <span>
                        {trip.result.fuelVolumeNeeded} {isImp ? 'gal' : 'L'} fuel
                      </span>
                      <span>•</span>
                      <span>{trip.input.passengers} Pax</span>
                      <span>•</span>
                      <span>{trip.result.carbonEmissionKg} kg CO₂</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="font-black text-black text-base">
                        {currInfo.symbol}
                        {formatCurrencyAmount(trip.result.totalCost, trip.input.currency)}
                      </div>
                      {trip.input.passengers > 1 && (
                        <div className="text-[10px] text-slate-500 font-bold">
                          {currInfo.symbol}
                          {formatCurrencyAmount(trip.result.costPerPerson, trip.input.currency)} / pax
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadTrip(trip);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-black hover:bg-[#10B981] hover:text-black text-white text-xs font-black uppercase tracking-wider border-2 border-black transition-colors"
                    >
                      Load
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t-2 border-black flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            FuelPath Offline SQLite/LocalStorage Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
