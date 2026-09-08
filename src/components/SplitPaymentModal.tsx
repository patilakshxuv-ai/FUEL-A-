import React, { useState } from 'react';
import { CalculationResult, TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/presets';
import {
  X,
  QrCode,
  Share2,
  Copy,
  Check,
  Send,
  Users,
  Smartphone,
  CreditCard,
} from 'lucide-react';

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: TripCalculationInput;
  result: CalculationResult;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  input,
  result,
}) => {
  const [upiId, setUpiId] = useState('');
  const [copied, setCopied] = useState(false);
  const isINR = input.currency === 'INR';
  const currencyInfo = CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
  const isImperial = input.unitSystem === 'imperial';
  const distanceUnit = isImperial ? 'miles' : 'km';

  if (!isOpen) return null;

  const perPersonAmount = result.costPerPerson.toFixed(2);
  const routeTitle = `${input.originCity || 'Start'} ➔ ${input.destinationCity || 'Destination'}`;

  // UPI deep link
  const cleanUpi = upiId.trim();
  const upiLink = cleanUpi
    ? `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=TripFuelSplit&am=${perPersonAmount}&cu=INR&tn=${encodeURIComponent('Fuel Split: ' + routeTitle)}`
    : '';

  // QR Code URL using standard qrserver API
  const qrData = isINR && upiLink ? upiLink : `Trip Fuel Split: ${currencyInfo.symbol}${perPersonAmount} each for ${routeTitle} (${result.totalDistance} ${distanceUnit})`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}&margin=10`;

  // WhatsApp Share Message
  const shareMessage = `🚗 *FUELPATH PRO — TRIP EXPENSE SPLIT*
📍 *Route:* ${routeTitle}
📏 *Total Distance:* ${result.totalDistance} ${distanceUnit} (${input.tripType === 'round_trip' ? 'Round Trip' : 'One-way'})
⛽ *Fuel Consumed:* ${result.fuelVolumeNeeded} ${isImperial ? 'Gallons' : 'Liters'}
💰 *Total Route Cost:* ${currencyInfo.symbol}${formatCurrencyAmount(result.totalCost, input.currency)}
👥 *Total Passengers:* ${input.passengers}
👉 *YOUR SPLIT AMOUNT:* ${currencyInfo.symbol}${formatCurrencyAmount(result.costPerPerson, input.currency)}

${cleanUpi ? `💳 *Pay via UPI:* ${upiLink}\n` : ''}🅿️ *Pay via PayPal:* https://www.paypal.com/paypalme/7276121252avp (7276121252avp@gmail.com)`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-[#10B981] flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-black">
                Passenger Split &amp; Settlement
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Instant UPI QR &amp; WhatsApp Settlement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-black hover:bg-black hover:text-white border-2 border-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Amount Card */}
          <div className="bg-[#111827] text-white p-5 border-l-4 border-[#10B981] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981]">
                Split Per Person ({input.passengers} Pax)
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {currencyInfo.symbol}
                {formatCurrencyAmount(result.costPerPerson, input.currency)}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Total: {currencyInfo.symbol}
                {formatCurrencyAmount(result.totalCost, input.currency)}
              </span>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Route</div>
              <div className="text-xs font-black text-slate-200 mt-1 max-w-[140px] truncate">
                {routeTitle}
              </div>
            </div>
          </div>

          {/* UPI ID Input (for Indian users) */}
          {isINR && (
            <div className="bg-slate-50 border-2 border-slate-200 p-4">
              <label
                htmlFor="upi-id-input"
                className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1"
              >
                Driver UPI ID / VPA (Optional for instant QR):
              </label>
              <div className="flex gap-2">
                <input
                  id="upi-id-input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  className="w-full border-2 border-black bg-white text-xs font-bold p-2 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter your UPI ID so passengers can scan and pay directly to your bank account with
                the exact pre-filled amount.
              </p>
            </div>
          )}

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 border-2 border-black bg-slate-50 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              {isINR && upiId
                ? 'Scan with GPay / PhonePe / Paytm / BHIM'
                : 'Trip Verification & Settlement QR Code'}
            </span>
            <div className="p-2 bg-white border-2 border-black shadow-xs">
              <img
                src={qrUrl}
                alt="Payment QR"
                className="w-44 h-44 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-black text-black mt-2">
              Amount: {currencyInfo.symbol}
              {formatCurrencyAmount(result.costPerPerson, input.currency)}
            </span>
          </div>

          {/* PayPal Settlement Option */}
          <div className="bg-[#0070BA]/5 border-2 border-[#0070BA] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 bg-[#0070BA] text-white text-xs font-black flex items-center justify-center border border-black shrink-0">
                P
              </span>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Settle via PayPal</span>
                <span className="text-[10px] text-slate-500 font-mono">Recipient: 7276121252avp@gmail.com</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                const el = document.getElementById('paypal-payment-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-3 py-1.5 bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-black uppercase tracking-wider border border-black transition-colors cursor-pointer text-center"
            >
              Open PayPal Checkout
            </button>
          </div>

          {/* Share Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareText}
              className="py-3 px-4 bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-xs transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Split Message</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t-2 border-black text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
