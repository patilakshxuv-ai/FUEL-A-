import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface GoogleAdSenseUnitProps {
  adSlot?: string;
  adLayout?: string;
  adLayoutKey?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  fluid?: boolean;
}

export const GoogleAdSenseUnit: React.FC<GoogleAdSenseUnitProps> = ({
  adSlot = '2458352341',
  adLayout,
  adLayoutKey,
  adFormat,
  fullWidthResponsive = false,
  fluid = false,
}) => {
  const adRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!adRef.current || adRef.current.dataset.adsbygoogleLoaded) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adRef.current.dataset.adsbygoogleLoaded = 'true';
    } catch (error) {
      console.warn('Google AdSense load error:', error);
    }
  }, []);

  return (
    <div className="w-full my-6 bg-white border-2 border-black p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sponsored Advertisement
        </span>
        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 border border-slate-200">
          ADSENSE
        </span>
      </div>
      <div className="overflow-hidden flex justify-center w-full">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={fluid
            ? { display: 'block', textAlign: 'center' }
            : { display: 'inline-block', width: '360px', height: '800px', maxWidth: '100%' }}
          data-ad-client="ca-pub-1968815211562572"
          data-ad-slot={adSlot}
          {...(adLayout ? { 'data-ad-layout': adLayout } : {})}
          {...(adLayoutKey ? { 'data-ad-layout-key': adLayoutKey } : {})}
          {...(adFormat ? { 'data-ad-format': adFormat } : {})}
          {...(fullWidthResponsive ? { 'data-full-width-responsive': 'true' } : {})}
        />
      </div>
    </div>
  );
};
