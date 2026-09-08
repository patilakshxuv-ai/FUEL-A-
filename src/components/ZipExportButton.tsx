import React, { useState } from 'react';
import { downloadProjectZip } from '../utils/zipExporter';
import { FileArchive, Check, Loader2, Download } from 'lucide-react';

export const ZipExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownloadZip = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      setIsSuccess(false);
      setProgressText('Preparing ZIP...');

      await downloadProjectZip((_pct, status) => {
        setProgressText(status);
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setProgressText('');
      }, 3500);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      alert('Failed to generate project ZIP. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      id="btn-export-project-zip"
      type="button"
      onClick={handleDownloadZip}
      disabled={isExporting}
      title="Download entire project codebase as a production ZIP archive"
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
        isSuccess
          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
          : isExporting
          ? 'bg-slate-900 text-[#10B981] border-black cursor-wait'
          : 'bg-[#10B981] text-black hover:bg-emerald-400 border-black shadow-xs active:translate-y-0.5'
      }`}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
          <span className="truncate max-w-[120px]">{progressText || 'Zipping...'}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>ZIP Downloaded</span>
        </>
      ) : (
        <>
          <FileArchive className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1">
            <span>Project ZIP</span>
            <Download className="w-3 h-3 opacity-75" />
          </span>
        </>
      )}
    </button>
  );
};
