import { Link } from 'react-router-dom';
import RiskMeter from './RiskMeter.jsx';
import PdfReportButton from './PdfReportButton.jsx';

function EntityList({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-slate-500">{title}</h4>
      <p className="mt-2 break-words text-sm text-slate-700">{items?.length ? items.join(', ') : 'None found'}</p>
    </div>
  );
}

export default function ResultPanel({ result, children, inputType = 'Scan', originalText = '' }) {
  if (!result) return null;

  const entities = result.extracted_entities || {};
  const urlUpi = result.url_upi_analysis || { urls: [], upi_ids: [] };
  const entityFindings = [...(urlUpi.urls || []), ...(urlUpi.upi_ids || [])];

  return (
    <div className="space-y-5">
      <RiskMeter risk_score={result.risk_score} risk_level={result.risk_level} trust_score={result.trust_score} />
      {children}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">Trust Score</p>
          <p className="mt-2 text-4xl font-bold text-green-600">{result.trust_score ?? Math.max(0, 100 - result.risk_score)}<span className="text-xl text-slate-400">/100</span></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-500">AI Scam Type</p>
          <p className="mt-2 text-lg font-bold text-slate-950">{result.ml_predicted_category || result.scam_category}</p>
          <p className="mt-1 text-sm text-slate-500">ML Confidence: {result.ml_confidence ?? 0}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">{result.scam_category}</h3>
        <p className="mt-2 text-slate-600">{result.summary}</p>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{result.recommended_action}</p>
        {['High Risk', 'Critical'].includes(result.risk_level) && (
          <Link to="/emergency-guide" className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">View Emergency Steps</Link>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="font-semibold text-slate-950">Why this is risky</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {(result.explanation || result.detected_signals || []).map((signal) => <li key={signal}>- {signal}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="font-semibold text-slate-950">User decision</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">{result.decision || result.recommended_action}</p>
          <div className="mt-4"><PdfReportButton result={result} inputType={inputType} originalText={originalText} /></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EntityList title="Extracted URLs" items={entities.urls} />
        <EntityList title="Extracted UPI IDs" items={entities.upi_ids} />
        <EntityList title="Phone numbers" items={entities.phone_numbers} />
        <EntityList title="Amounts" items={entities.amounts} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-slate-950">Link & UPI ID Check</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {entityFindings.length ? (
            entityFindings.map((item) => (
              <div key={item.url || item.upi_id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="break-all font-semibold text-slate-950">{item.url || item.upi_id}</p>
                <p className="mt-1 text-sm font-bold text-blue-700">{item.risk}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {item.reasons.map((reason) => <li key={reason}>- {reason}</li>)}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No URL or UPI ID found in this content.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="font-semibold text-slate-950">Safety tips</h4>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          {(result.safety_tips || []).map((tip) => <li key={tip}>- {tip}</li>)}
        </ul>
        <p className="mt-4 text-xs text-slate-500">{result.disclaimer}</p>
      </div>
    </div>
  );
}
