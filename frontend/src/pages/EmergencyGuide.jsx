import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import Navbar from '../components/Navbar.jsx';

const steps = [
  ['Contact your bank immediately', 'Call official bank support or use bank app to report fraud.'],
  ['Block or freeze account/card', 'Temporarily block affected card, UPI, or account if needed.'],
  ['Save evidence', 'Save screenshots, transaction ID, UTR, phone number, UPI ID, links, and chat details.'],
  ['Report cybercrime', 'Report to the official national cybercrime portal or local cyber police.'],
  ['Change security details', 'Change UPI PIN, banking password, email password, and remove unknown apps.'],
  ['Monitor statements', 'Check bank statements and report unknown transactions immediately.'],
];

export default function EmergencyGuide() {
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('finshield_emergency_checklist') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('finshield_emergency_checklist', JSON.stringify(checked));
  }, [checked]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" /> Emergency response
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">What to do if you are scammed?</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Follow these steps quickly, keep evidence safe, and use official channels only.</p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(([title, description], index) => (
            <label key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-4">
                <input type="checkbox" checked={Boolean(checked[title])} onChange={(event) => setChecked((current) => ({ ...current, [title]: event.target.checked }))} className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h2 className="font-bold text-slate-950">{index + 1}. {title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            </label>
          ))}
        </section>
      </main>
    </div>
  );
}
