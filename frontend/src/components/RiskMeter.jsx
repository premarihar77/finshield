import { getRiskStyle } from '../utils/riskUtils';

export default function RiskMeter({ risk_score = 0, risk_level = 'Safe', trust_score = null }) {
  const style = getRiskStyle(risk_level);
  const trustScore = trust_score ?? Math.max(0, 100 - risk_score);
  return (
    <div className={`rounded-2xl border ${style.border} bg-white p-5 shadow-sm`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-500">Risk Score</p>
            <p className={`text-5xl font-bold ${style.text}`}>{risk_score}<span className="text-xl text-slate-400">/100</span></p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Trust Score</p>
            <p className="text-5xl font-bold text-green-600">{trustScore}<span className="text-xl text-slate-400">/100</span></p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${style.bg} ${style.text}`}>{risk_level}</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${style.bar} transition-all duration-700`} style={{ width: `${risk_score}%` }} />
      </div>
      {trustScore < 50 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Low trust score. Do not proceed without official verification.
        </p>
      )}
      {['High Risk', 'Critical'].includes(risk_level) && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          Do not click links, share OTP/UPI PIN, or make payment.
        </p>
      )}
    </div>
  );
}
