import {
  AlertTriangle,
  Building2,
  Camera,
  FileText,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Megaphone,
  MonitorX,
  ShieldCheck
} from 'lucide-react';

import Navbar from '../components/Navbar.jsx';

const cards = [
  {
    title: 'Never Share UPI PIN',
    description: 'Your UPI PIN is only used to approve payments. Never share it with anyone.',
    icon: KeyRound,
    tone: 'red'
  },
  {
    title: 'Never Share OTP',
    description: 'Do not share OTP or verification codes over calls, messages, emails, or links.',
    icon: LockKeyhole,
    tone: 'red'
  },
  {
    title: 'Avoid Random KYC Links',
    description: 'Banks do not ask users to complete KYC through unknown links or unofficial numbers.',
    icon: Building2,
    tone: 'blue'
  },
  {
    title: 'Avoid Remote Access Apps',
    description: 'Do not install AnyDesk, QuickSupport, or screen-sharing apps during payment support calls.',
    icon: MonitorX,
    tone: 'red'
  },
  {
    title: 'Verify Customer Care Numbers',
    description: 'Use only official bank apps, websites, or card numbers to contact support.',
    icon: LifeBuoy,
    tone: 'blue'
  },
  {
    title: 'Report Fraud Quickly',
    description: 'If you suspect fraud, contact your bank immediately and report it to the national cybercrime portal.',
    icon: Megaphone,
    tone: 'green'
  },
  {
    title: 'Save Evidence',
    description: 'Keep screenshots, transaction IDs, UTR numbers, phone numbers, and chat details.',
    icon: Camera,
    tone: 'blue'
  },
  {
    title: 'Secure Accounts After Scam',
    description: 'Change passwords, remove unknown apps, freeze cards if needed, and monitor bank statements.',
    icon: ShieldCheck,
    tone: 'green'
  }
];

const emergencySteps = [
  'Contact your bank immediately',
  'Block or freeze affected account/card',
  'Save screenshots and transaction details',
  'Report to cybercrime authorities'
];

const toneClasses = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600'
};

export default function Awareness() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <FileText className="h-4 w-4" /> UPI safety guide
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">UPI Fraud Awareness</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Learn practical safety rules for suspicious payment requests, scam links, fake support calls, and digital arrest threats.
          </p>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ title, description, icon: Icon, tone }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">What to do if you are scammed?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {emergencySteps.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</div>
                <p className="mt-4 font-semibold leading-6 text-slate-950">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="flex gap-3 text-sm leading-6 text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>FinShield provides awareness and risk-based guidance only. Always verify through official bank channels before taking action.</span>
          </p>
        </div>
      </main>
    </div>
  );
}
