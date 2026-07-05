import { CalendarDays, ShieldAlert } from 'lucide-react';
import { getRiskStyle } from '../utils/riskUtils';
import PdfReportButton from './PdfReportButton.jsx';
import { rememberLatestAnalysis } from '../utils/pdfReport';

export default function AnalysisCard({ item }) {
  const style = getRiskStyle(item.risk_level);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className={style.text} />
          <div>
            <h3 className="font-semibold text-slate-950">{item.scam_category}</h3>
            <p className="text-sm text-slate-500">{item.source_type || 'unknown source'}</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${style.bg} ${style.text}`}>{item.risk_score}/100 - {item.risk_level}</span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg bg-slate-50 p-2 text-sm font-semibold text-slate-700">Trust Score: {item.trust_score ?? Math.max(0, 100 - (item.risk_score || 0))}/100</p>
        <p className="rounded-lg bg-slate-50 p-2 text-sm font-semibold text-slate-700">AI Scam Type: {item.ml_predicted_category || item.scam_category}</p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{item.summary}</p>
      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays className="h-4 w-4" />
        {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <PdfReportButton result={item} inputType={item.source_type || 'History'} originalText={item.input_text || item.ocr_text || item.summary} />
        <button type="button" onClick={() => rememberLatestAnalysis(item)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Ask Assistant
        </button>
      </div>
    </div>
  );
}
