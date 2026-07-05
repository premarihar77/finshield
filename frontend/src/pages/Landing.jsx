import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  FileImage,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    title: 'Message & Link Scan',
    description: 'Analyze UPI messages and links for scam indicators.',
    icon: MessageSquareText,
    action: 'quick-scan'
  },
  {
    title: 'Screenshot Analysis',
    description: 'Detect fake payment proofs and manipulated screenshots.',
    icon: FileImage,
    action: 'screenshot'
  },
  {
    title: 'Safety Guidance',
    description: 'Get risk score, key reasons, and recommended actions.',
    icon: ShieldCheck,
    action: 'awareness'
  }
];

const steps = [
  ['Paste message or link', 'Paste suspicious UPI message, link, or upload screenshot.'],
  ['Get risk analysis', 'FinShield analyzes content and detects risky patterns.'],
  ['Decide safely', 'Review risk score, reasons, and take the right action.']
];

const trustPoints = [
  ['No OTP/PIN Required', 'We never ask for OTP, PIN, or bank details.', LockKeyhole],
  ['Privacy Focused', 'Your data is secure and never shared.', BadgeCheck],
  ['Advisory Tool Only', 'FinShield provides risk insights, not final verdicts.', AlertTriangle]
];

export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!location.state?.scrollTo) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById(location.state.scrollTo)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [location]);

  const handleFeatureClick = (action) => {
    if (action === 'quick-scan') {
      navigate('/quick-scan');
      return;
    }
    if (action === 'screenshot') {
      if (isAuthenticated) {
        navigate('/analyze-image');
        return;
      }
      toast('Please login to use screenshot analysis.');
      navigate('/login');
      return;
    }
    if (action === 'awareness') {
      navigate('/awareness');
    }
  };

  const handleFeatureKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFeatureClick(action);
    }
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <Navbar />

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <ShieldCheck className="h-4 w-4" /> AI-Powered UPI Scam Risk Analysis
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Verify Suspicious UPI Messages Before You Act
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              FinShield checks suspicious UPI messages, links, and screenshots to provide a risk score and safety guidance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate('/quick-scan')} className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Start Quick Scan
              </button>
              <button type="button" onClick={scrollToHowItWorks} className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                How It Works
              </button>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="flex text-amber-400">
                {[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
              </span>
              Trusted by 10,000+ users
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Analysis Preview</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Critical Sample Alert</h2>
              </div>
              <div className="rounded-full bg-red-50 p-3 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-slate-700">
              Your bank KYC will be blocked today. Click http://bank-kyc-verify.com and pay Rs 10.
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Risk Score</p>
                <p className="mt-2 text-4xl font-bold text-red-600">92/100</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-slate-500">Risk Level</p>
                <p className="mt-2 text-2xl font-bold text-red-600">High Risk</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Main Reason</p>
                <p className="mt-1 font-semibold text-slate-950">KYC threat + suspicious link + payment request</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-700">Advice</p>
                <p className="mt-1 text-slate-700">Do not proceed. This message is highly suspicious.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft md:grid-cols-3">
            {features.map(({ title, description, icon: Icon, action }) => (
              <div
                key={title}
                role="button"
                tabIndex={0}
                onClick={() => handleFeatureClick(action)}
                onKeyDown={(event) => handleFeatureKeyDown(event, action)}
                className="cursor-pointer rounded-xl border border-transparent p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Open ${title}`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-2 leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-3xl font-bold text-slate-950">How it works</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            {steps.map(([title, description], index) => (
              <div key={title} className="contents">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</div>
                  <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 leading-6 text-slate-600">{description}</p>
                </div>
                {index < steps.length - 1 && <ArrowRight className="hidden h-6 w-6 text-slate-300 lg:block" />}
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 pb-16">
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-3">
            {trustPoints.map(([title, description, Icon]) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
