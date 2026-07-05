import { FileDown } from 'lucide-react';

import { downloadScamReport } from '../utils/pdfReport';

export default function PdfReportButton({ result, inputType = 'Scan', originalText = '', className = '' }) {
  if (!result) return null;
  return (
    <button
      type="button"
      onClick={() => downloadScamReport(result, inputType, originalText)}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      <FileDown className="h-4 w-4" />
      Download Scam Report
    </button>
  );
}
