import React from 'react';
import { ShieldCheck, X, Lock, EyeOff, Database, MapPin, Smartphone, Mail, Globe, CheckCircle2, Copy, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const privacyUrl = window.location.origin + window.location.pathname + '#privacy';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(privacyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border-2 border-black max-w-3xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-black text-white flex items-center justify-between border-b-2 border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981] flex items-center justify-center text-black shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  Privacy Policy
                </h2>
                <span className="text-[10px] bg-[#10B981] text-black font-black px-1.5 py-0.5 uppercase tracking-widest">
                  Official
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                FuelPath PRO • Fuel &amp; Trip Cost Telemetry Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Privacy Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live URL Bar for App Stores (Google Play / Indus / Apple App Store) */}
        <div className="bg-slate-100 border-b-2 border-slate-200 p-3 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 truncate">
            <Globe className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-bold text-black uppercase text-[10px] tracking-wider">Live URL:</span>
            <span className="truncate bg-white px-2 py-1 border border-slate-300 text-[11px] text-slate-800 select-all">
              {privacyUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors self-end sm:self-auto shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>

        {/* Policy Content Scrollable Area */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
          {/* Quick Summary Badge Card */}
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-emerald-950 uppercase tracking-wider text-xs">
                Zero-Tracking &amp; Privacy-First Guarantee
              </h4>
              <p className="text-xs text-emerald-900 mt-1 font-medium">
                FuelPath PRO is an offline-capable utility. We do NOT collect, sell, monitor, or transmit your personal data, trip calculations, location coordinates, or payment details to any external servers.
              </p>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10B981] rotate-45" />
              1. Introduction &amp; Scope
            </h3>
            <p className="text-slate-600">
              This Privacy Policy applies to the <strong>FuelPath PRO</strong> application across all platforms including Web, Progressive Web App (PWA), Android (Google Play Store, Indus Appstore), and iOS devices. This policy outlines our strict commitment to safeguarding user privacy and transparency regarding on-device data processing.
            </p>
            <p className="text-slate-500 font-mono text-[11px] mt-1">
              Effective Date: August 16, 2026 • Last Reviewed: August 2026
            </p>
          </div>

          {/* Section 2: Data We Do NOT Collect */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              2. Data We Do NOT Collect
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>No Personal Identifiable Information (PII):</strong> We do not require sign-in, email addresses, phone numbers, or account registrations.</li>
              <li><strong>No Server-Side Tracking:</strong> All calculation mathematics, distance estimations, and fuel formulas execute purely client-side inside your browser engine.</li>
              <li><strong>No Data Monetization or Brokerage:</strong> We never sell, lease, or distribute any user metrics to advertisers or third parties.</li>
            </ul>
          </div>

          {/* Section 3: Device Storage & Local Persistence */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              3. Local On-Device Storage (LocalStorage)
            </h3>
            <p className="text-slate-600">
              FuelPath PRO provides optional on-device trip logging. When you tap "Save Trip", the trip metrics (distance, origin, destination, vehicle efficiency, total cost, timestamp) are stored strictly inside your device’s local browser storage (<code className="bg-slate-100 px-1 py-0.5 border border-slate-300 font-mono text-[11px]">localStorage</code>).
            </p>
            <p className="text-slate-600 mt-1">
              You maintain 100% control over this data. You can export it as CSV or completely purge all saved trips at any time by tapping <strong>"Clear All"</strong> in the Trip History tab.
            </p>
          </div>

          {/* Section 4: Geolocation & GPS Permissions */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              4. Ephemeral GPS &amp; Location Usage
            </h3>
            <p className="text-slate-600">
              If you choose to use the <strong>"GPS Locate"</strong> feature in the Highway &amp; Route Planner, the application requests temporary access to your device's browser geolocation API.
            </p>
            <p className="text-slate-600 mt-1">
              <strong>How it works:</strong> The coordinates are processed purely in memory on your device to match you with the closest city in the pre-loaded city index. The raw coordinates are never transmitted over the internet, never logged to any database, and are immediately discarded.
            </p>
          </div>

          {/* Section 5: UPI Deep Links & Settlement Security */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              5. UPI Split &amp; Payment Deep Links
            </h3>
            <p className="text-slate-600">
              The passenger cost splitting feature generates standardized UPI intent deep links (e.g. <code className="bg-slate-100 px-1 py-0.5 font-mono text-[11px]">upi://pay?pa=...</code>) and client-side QR codes. FuelPath PRO is not a payment gateway and does not handle, process, or store bank credentials, UPI PINs, or financial transactions. The payment intent is handed off directly to your installed banking app (Google Pay, PhonePe, Paytm, BHIM).
            </p>
          </div>

          {/* Section 6: Offline PWA & Service Workers */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              6. Service Worker &amp; Offline Caching
            </h3>
            <p className="text-slate-600">
              The application utilizes standard Service Worker caching to ensure lightning-fast startup and complete offline functionality without requiring an active internet connection. Static assets (CSS, JS bundles, icons) are cached locally in your device cache.
            </p>
          </div>

          {/* Section 7: Developer Contact & App Store Compliance */}
          <div className="border-t-2 border-slate-200 pt-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              7. Contact Information &amp; App Store Inquiries
            </h3>
            <p className="text-slate-600">
              If you have any questions or inquiries regarding this Privacy Policy or compliance with Google Play Store, Indus Appstore, or Apple App Store policies, please contact the developer:
            </p>
            <div className="mt-3 p-3 bg-slate-50 border-2 border-black font-mono text-xs text-black flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong>Developer &amp; Support Contact:</strong> 7276121252avp@gmail.com
              </div>
              <a
                href="mailto:7276121252avp@gmail.com?subject=FuelPath%20PRO%20Privacy%20Inquiry"
                className="inline-flex items-center gap-1 text-[#10B981] bg-black px-2.5 py-1 font-sans font-black uppercase tracking-wider text-[11px] hover:bg-slate-800"
              >
                <Mail className="w-3 h-3" />
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t-2 border-black flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            FuelPath PRO • Version 2.5 (Store Release)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-black text-[#10B981] hover:bg-slate-800 text-xs font-black uppercase tracking-wider border-2 border-black transition-colors"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
