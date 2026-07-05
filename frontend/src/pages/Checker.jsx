import { useState } from 'react';
import { Link2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../api/api';
import Loader from '../components/Loader.jsx';
import Navbar from '../components/Navbar.jsx';

function FindingCard({ title, items, keyName }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item[keyName]} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="break-all font-semibold text-slate-950">{item[keyName]}</p>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${item.risk === 'High Risk' ? 'bg-red-50 text-red-700' : item.risk === 'Suspicious' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{item.risk}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {item.reasons.map((reason) => <li key={reason}>- {reason}</li>)}
            </ul>
          </div>
        )) : <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">No items found.</p>}
      </div>
    </section>
  );
}

export default function Checker() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (text.trim().length < 2) return toast.error('Paste a URL, UPI ID, or message first');
    setLoading(true);
    try {
      const { data } = await api.post('/api/checker', { text });
      setResult(data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checker failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Link2 className="h-4 w-4" /> Public URL and UPI check
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">URL & UPI ID Checker</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Paste a suspicious link, UPI ID, or full message to inspect risky link and payment-handle signals.</p>
        </header>

        <form onSubmit={submit} className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <textarea className="field min-h-44" value={text} onChange={(event) => setText(event.target.value)} placeholder="Example: http://bank-kyc-verify.com or kycverify@ybl" />
          <button disabled={loading} className="btn-primary mt-5 inline-flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Check Risk
          </button>
          {loading && <div className="mt-4"><Loader label="Checking URL and UPI risk..." /></div>}
        </form>

        {result && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <FindingCard title="URL Risk" items={result.urls || []} keyName="url" />
            <FindingCard title="UPI ID Risk" items={result.upi_ids || []} keyName="upi_id" />
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 lg:col-span-2">
              <p className="font-semibold text-slate-950">{result.advice}</p>
              <p className="mt-2 text-sm text-slate-600">{result.disclaimer}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
