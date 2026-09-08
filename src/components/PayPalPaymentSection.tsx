import React, { useEffect, useRef, useState } from 'react';
import { CalculationResult, CurrencyCode, TripCalculationInput } from '../types';
import { CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/presets';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Receipt,
  Users,
  Fuel,
  Info,
} from 'lucide-react';

interface PayPalPaymentSectionProps {
  input: TripCalculationInput;
  result: CalculationResult;
  accountEmail?: string;
}

interface ConfirmedPaymentDetails {
  id: string;
  captureId: string;
  amount: string;
  currency: string;
  payerName: string;
  payerEmail: string;
  payeeEmail: string;
  date: string;
  time: string;
}

// Currencies natively supported by PayPal JS SDK
const PAYPAL_SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
];

export const PayPalPaymentSection: React.FC<PayPalPaymentSectionProps> = ({
  input,
  result,
  accountEmail = '7276121252avp@gmail.com',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonInstanceRef = useRef<any>(null);

  // Payee account from env or prop (defaults to user's account 7276121252avp@gmail.com)
  const payeeEmail =
    import.meta.env.VITE_PAYPAL_PAYEE_EMAIL || accountEmail || '7276121252avp@gmail.com';
  const paypalClientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

  // Currency selection: if app currency is supported by PayPal, use it; otherwise default to USD
  const initialCurrency: CurrencyCode = PAYPAL_SUPPORTED_CURRENCIES.includes(
    input.currency
  )
    ? input.currency
    : 'USD';

  const [paymentCurrency, setPaymentCurrency] =
    useState<CurrencyCode>(initialCurrency);
  const [paymentMode, setPaymentMode] = useState<
    'full' | 'split' | 'custom'
  >('full');
  const [customAmountStr, setCustomAmountStr] = useState<string>('5.00');

  const [sdkLoading, setSdkLoading] = useState<boolean>(true);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedPayment, setConfirmedPayment] =
    useState<ConfirmedPaymentDetails | null>(null);

  // Calculate equivalent payment amount in chosen PayPal currency
  const getAmountInCurrency = (rawAmountInAppCurrency: number): number => {
    if (input.currency === paymentCurrency) {
      return Math.max(0.5, rawAmountInAppCurrency);
    }
    const appCurrencyConfig =
      CURRENCY_CONFIGS[input.currency] || CURRENCY_CONFIGS.INR;
    const paymentCurrencyConfig =
      CURRENCY_CONFIGS[paymentCurrency] || CURRENCY_CONFIGS.USD;

    // Convert through USD rate
    const amountInUsd = rawAmountInAppCurrency * appCurrencyConfig.rateToUsd;
    const finalAmount = amountInUsd / paymentCurrencyConfig.rateToUsd;
    return Math.max(0.5, Math.round(finalAmount * 100) / 100);
  };

  const calculatedFullAmount = getAmountInCurrency(result.totalCost);
  const calculatedSplitAmount = getAmountInCurrency(result.costPerPerson);

  const activeAmount =
    paymentMode === 'full'
      ? calculatedFullAmount
      : paymentMode === 'split'
      ? calculatedSplitAmount
      : Math.max(0.5, parseFloat(customAmountStr) || 5.0);

  const currencySymbol =
    CURRENCY_CONFIGS[paymentCurrency]?.symbol || '$';

  // Load PayPal SDK dynamically
  useEffect(() => {
    let isMounted = true;
    setSdkLoading(true);
    setSdkError(null);

    const scriptId = 'paypal-sdk-script';
    const existingScript = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const currentCurrency = existingScript.getAttribute('data-currency');
      if (
        currentCurrency === paymentCurrency &&
        (window as any).paypal
      ) {
        if (isMounted) setSdkLoading(false);
        return;
      }
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      paypalClientId
    )}&currency=${encodeURIComponent(paymentCurrency)}&intent=capture`;
    script.setAttribute('data-currency', paymentCurrency);
    script.async = true;

    script.onload = () => {
      if (isMounted) {
        if ((window as any).paypal) {
          setSdkLoading(false);
        } else {
          setSdkError('PayPal SDK loaded but global object was unavailable.');
        }
      }
    };

    script.onerror = () => {
      if (isMounted) {
        setSdkLoading(false);
        setSdkError(
          'Could not load PayPal SDK script. This may be caused by an ad-blocker or offline network.'
        );
      }
    };

    document.head.appendChild(script);

    return () => {
      isMounted = false;
    };
  }, [paymentCurrency, paypalClientId]);

  // Render PayPal buttons once SDK is loaded and container is ready
  useEffect(() => {
    if (sdkLoading || sdkError || confirmedPayment) return;
    if (!containerRef.current || !(window as any).paypal?.Buttons) return;

    // Clean up previous buttons
    if (buttonInstanceRef.current?.close) {
      try {
        buttonInstanceRef.current.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    containerRef.current.innerHTML = '';

    try {
      const buttons = (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
          tagline: false,
        },
        createOrder: (_data: any, actions: any) => {
          setPaymentError(null);
          setNoticeMessage('');

          const routeDesc =
            input.originCity && input.destinationCity
              ? `Trip: ${input.originCity} to ${input.destinationCity}`
              : 'Trip Fuel Expense';

          const purchaseUnit: any = {
            description: `${routeDesc} (Recipient: ${payeeEmail})`,
            amount: {
              currency_code: paymentCurrency,
              value: activeAmount.toFixed(2),
            },
          };

          // If not running purely on generic sandbox test client, attach payee email
          if (paypalClientId !== 'test' && payeeEmail) {
            purchaseUnit.payee = { email_address: payeeEmail };
          }

          return actions.order.create({
            purchase_units: [purchaseUnit],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
          });
        },
        onApprove: async (_data: any, actions: any) => {
          setIsConfirming(true);
          setPaymentError(null);
          try {
            // STRICT REQUIREMENT: Only mark payment successful after PayPal confirms it!
            const order = await actions.order.capture();

            if (
              order &&
              (order.status === 'COMPLETED' || order.status === 'APPROVED')
            ) {
              const capture =
                order.purchase_units?.[0]?.payments?.captures?.[0];
              const confirmedId = capture?.id || order.id;
              const payer = order.payer;
              const fullName =
                `${payer?.name?.given_name || ''} ${
                  payer?.name?.surname || ''
                }`.trim() ||
                payer?.email_address ||
                'Verified Payer';

              setConfirmedPayment({
                id: confirmedId,
                captureId: order.id,
                amount:
                  order.purchase_units?.[0]?.amount?.value ||
                  activeAmount.toFixed(2),
                currency:
                  order.purchase_units?.[0]?.amount?.currency_code ||
                  paymentCurrency,
                payerName: fullName,
                payerEmail: payer?.email_address || 'Anonymous',
                payeeEmail: payeeEmail,
                date: new Date().toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
                time: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
              });
            } else {
              setPaymentError(
                `PayPal order status is '${order?.status || 'UNCONFIRMED'}'. The payment was not finalized.`
              );
            }
          } catch (err: any) {
            console.error('PayPal capture error:', err);
            setPaymentError(
              err.message ||
                'PayPal confirmation capture failed. Please check your account.'
            );
          } finally {
            setIsConfirming(false);
          }
        },
        onCancel: () => {
          setIsConfirming(false);
          setNoticeMessage(
            'Payment window closed. No charges were made to your PayPal account.'
          );
          setTimeout(() => setNoticeMessage(''), 7000);
        },
        onError: (err: any) => {
          setIsConfirming(false);
          console.error('PayPal Buttons runtime error:', err);
          setPaymentError(
            'PayPal payment could not be processed. Please check your connection or try again.'
          );
        },
      });

      buttonInstanceRef.current = buttons;
      buttons.render(containerRef.current);
    } catch (err: any) {
      console.error('Failed to render PayPal Buttons:', err);
      setSdkError(err.message || 'Error rendering PayPal button widget.');
    }

    return () => {
      if (buttonInstanceRef.current?.close) {
        try {
          buttonInstanceRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [
    sdkLoading,
    sdkError,
    paymentCurrency,
    activeAmount,
    confirmedPayment,
    payeeEmail,
    paypalClientId,
    input.originCity,
    input.destinationCity,
  ]);

  const handleResetPayment = () => {
    setConfirmedPayment(null);
    setPaymentError(null);
    setNoticeMessage('');
    setIsConfirming(false);
  };

  return (
    <div
      id="paypal-payment-section"
      className="bg-white border-2 border-black p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      {/* Visual Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0070BA]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0070BA] text-white flex items-center justify-center border-2 border-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#111827]">
                PayPal Visitor Payment
              </h3>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Pay trip fuel share, driver reimbursement, or site contribution
            </p>
          </div>
        </div>

        {/* Account Info Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-black px-3 py-1.5 text-xs font-mono">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Recipient:</span>
          <span className="font-bold text-slate-900 truncate max-w-[200px]" title={payeeEmail}>
            {payeeEmail}
          </span>
        </div>
      </div>

      {/* Zero Card Storage / Security Guarantee Notice */}
      <div className="bg-[#F8FAFC] border-2 border-black p-3 mb-5 flex items-start gap-2.5 text-xs text-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-black text-slate-900 uppercase tracking-wide">
            Zero Card Details Stored:
          </span>{' '}
          This site does not collect, process, or store credit/debit card numbers. All payments are authenticated and processed directly within PayPal's encrypted infrastructure.
        </div>
      </div>

      {/* SUCCESS STATE: Confirmed by PayPal */}
      {confirmedPayment ? (
        <div className="border-2 border-black bg-emerald-50 p-5 sm:p-6 space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-3 border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white flex items-center justify-center border-2 border-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="bg-emerald-600 text-white font-mono text-[10px] font-black uppercase px-2 py-0.5 tracking-wider border border-black">
                  Confirmed by PayPal
                </span>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
                  Payment Successful!
                </h4>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-800">
                {confirmedPayment.currency} {confirmedPayment.amount}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {confirmedPayment.date} • {confirmedPayment.time}
              </div>
            </div>
          </div>

          {/* Receipt Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white border border-black p-3.5 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                PayPal Capture / Order ID:
              </span>
              <span className="font-bold text-slate-900 break-all select-all">
                {confirmedPayment.id}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Recipient Account:
              </span>
              <span className="font-bold text-slate-900">
                {confirmedPayment.payeeEmail}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Payer Name:
              </span>
              <span className="font-bold text-slate-900">
                {confirmedPayment.payerName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Payer Email:
              </span>
              <span className="font-bold text-slate-900 truncate block" title={confirmedPayment.payerEmail}>
                {confirmedPayment.payerEmail}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <Receipt className="w-4 h-4" />
              <span>A confirmation receipt has also been logged by PayPal.</span>
            </div>
            <button
              onClick={handleResetPayment}
              className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Make Another Payment</span>
            </button>
          </div>
        </div>
      ) : (
        /* PAYMENT FORM & BUTTONS */
        <div className="space-y-5">
          {/* Amount Mode Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Select Payment / Fuel Share Amount:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Full Trip Cost */}
              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                className={`p-3 border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                  paymentMode === 'full'
                    ? 'border-black bg-[#FEF08A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-slate-300 bg-slate-50 hover:border-black text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Full Trip Cost
                  </span>
                  {paymentMode === 'full' && (
                    <span className="w-2 h-2 bg-black rounded-full" />
                  )}
                </div>
                <div className="text-lg font-black text-black">
                  {currencySymbol}
                  {formatCurrencyAmount(calculatedFullAmount, paymentCurrency)}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  Total route calculated
                </div>
              </button>

              {/* Per-Person Share */}
              <button
                type="button"
                onClick={() => setPaymentMode('split')}
                className={`p-3 border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                  paymentMode === 'split'
                    ? 'border-black bg-[#FEF08A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-slate-300 bg-slate-50 hover:border-black text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1">
                    <Users className="w-3 h-3" /> Passenger Share
                  </span>
                  {paymentMode === 'split' && (
                    <span className="w-2 h-2 bg-black rounded-full" />
                  )}
                </div>
                <div className="text-lg font-black text-black">
                  {currencySymbol}
                  {formatCurrencyAmount(calculatedSplitAmount, paymentCurrency)}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  1 of {input.passengers} passenger(s)
                </div>
              </button>

              {/* Custom Tip / Amount */}
              <button
                type="button"
                onClick={() => setPaymentMode('custom')}
                className={`p-3 border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-1 ${
                  paymentMode === 'custom'
                    ? 'border-black bg-[#FEF08A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-slate-300 bg-slate-50 hover:border-black text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Custom Amount
                  </span>
                  {paymentMode === 'custom' && (
                    <span className="w-2 h-2 bg-black rounded-full" />
                  )}
                </div>
                <div className="text-lg font-black text-black">
                  {currencySymbol}
                  {customAmountStr || '0.00'}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  Tip or custom share
                </div>
              </button>
            </div>
          </div>

          {/* If Custom Amount is selected */}
          {paymentMode === 'custom' && (
            <div className="p-3 bg-slate-50 border-2 border-black flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold uppercase text-slate-700">
                Enter Custom Amount:
              </label>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.50"
                  min="0.50"
                  max="5000"
                  value={customAmountStr}
                  onChange={(e) => setCustomAmountStr(e.target.value)}
                  className="w-28 px-2.5 py-1.5 bg-white border-2 border-black font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {[5, 10, 20, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomAmountStr(preset.toFixed(2))}
                    className="px-2 py-1 bg-white border border-black text-xs font-bold hover:bg-yellow-100 transition-colors"
                  >
                    +{currencySymbol}{preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Currency Switcher & Conversion Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-200 pt-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 uppercase text-[11px]">
                Payment Currency:
              </span>
              <div className="flex items-center gap-1">
                {PAYPAL_SUPPORTED_CURRENCIES.map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setPaymentCurrency(curr)}
                    className={`px-2 py-1 text-xs font-bold border ${
                      paymentCurrency === curr
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-black'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {input.currency !== paymentCurrency && (
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>
                  Converted from {input.currency} ({CURRENCY_CONFIGS[input.currency]?.symbol || ''}
                  {formatCurrencyAmount(
                    paymentMode === 'full'
                      ? result.totalCost
                      : result.costPerPerson,
                    input.currency
                  )})
                </span>
              </div>
            )}
          </div>

          {/* Status and Notifications */}
          {noticeMessage && (
            <div className="p-3 bg-amber-50 border-2 border-amber-600 text-amber-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 text-amber-700" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {paymentError && (
            <div className="p-3 bg-red-50 border-2 border-red-600 text-red-900 text-xs font-medium flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <span className="font-bold uppercase">Payment Failed: </span>
                {paymentError}
              </div>
            </div>
          )}

          {isConfirming && (
            <div className="p-4 bg-blue-50 border-2 border-[#0070BA] text-[#0070BA] text-xs font-bold flex items-center justify-center gap-2.5 animate-pulse">
              <div className="w-4 h-4 border-2 border-[#0070BA] border-t-transparent rounded-full animate-spin" />
              <span>Verifying transaction with PayPal... Please do not close this window.</span>
            </div>
          )}

          {/* PAYPAL SMART BUTTON CONTAINER */}
          <div className="pt-2">
            {sdkLoading ? (
              <div className="p-8 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-50">
                <div className="w-5 h-5 border-2 border-[#0070BA] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Loading Secure PayPal Checkout...
                </span>
              </div>
            ) : sdkError ? (
              <div className="p-4 bg-amber-50 border-2 border-black space-y-3">
                <div className="flex items-start gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase">PayPal Script Notice: </span>
                    {sdkError}
                  </div>
                </div>
                <div className="border-t border-amber-200 pt-2">
                  <p className="text-xs text-slate-700 mb-2 font-medium">
                    You can still send directly via PayPal to recipient{' '}
                    <strong>{payeeEmail}</strong>:
                  </p>
                  <a
                    href={`https://www.paypal.com/paypalme/${payeeEmail.split('@')[0]}/${activeAmount.toFixed(2)}${paymentCurrency}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0070BA] text-white text-xs font-bold uppercase border border-black hover:bg-[#005ea6] transition-colors"
                  >
                    <span>Pay {currencySymbol}{activeAmount.toFixed(2)} on PayPal.me</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div
                  ref={containerRef}
                  id="paypal-button-container"
                  className="min-h-[50px] relative z-0"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    256-bit SSL encrypted checkout
                  </span>
                  <span>
                    Recipient: <strong className="text-slate-800">{payeeEmail}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Direct Link fallback */}
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              PayPal confirmation will automatically verify and display your receipt above.
            </span>
            <a
              href={`https://www.paypal.com/paypalme/${payeeEmail.split('@')[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0070BA] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Direct PayPal.me link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
