import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    _mgq?: any[];
  }
}

interface AdKeeperWidgetProps {
  widgetId?: string;
  title?: string;
  minHeight?: number | string;
}

export const AdKeeperWidget: React.FC<AdKeeperWidgetProps> = ({
  widgetId = "2076059",
  title = "Sponsored Recommendations",
  minHeight = "100px"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerLoad = () => {
      try {
        window._mgq = window._mgq || [];
        window._mgq.push(["_mgc.load"]);
      } catch (e) {
        console.warn('AdKeeper widget load error:', e);
      }
    };

    // Trigger immediately
    triggerLoad();

    // Trigger after tick and slight delay to ensure DOM is fully rendered in React SPA
    const t1 = setTimeout(triggerLoad, 300);
    const t2 = setTimeout(triggerLoad, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [widgetId]);

  return (
    <div className="w-full my-6 bg-white border-2 border-black p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 border border-slate-200">
          ADVERTISEMENT
        </span>
      </div>
      <div 
        ref={containerRef} 
        className="overflow-hidden flex items-center justify-center w-full"
        style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
      >
        <div 
          data-type="_mgwidget" 
          data-widget-id={widgetId} 
          style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight, width: '100%' }}
        ></div>
      </div>
    </div>
  );
};

