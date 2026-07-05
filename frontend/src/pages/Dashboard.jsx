import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BarChart3, CheckCircle2, FileSearch, Flame, OctagonAlert, PieChart as PieChartIcon, Search, ShieldCheck, Sparkles } from 'lucide-react';

import api from '../api/api';
import AnalysisCard from '../components/AnalysisCard.jsx';
import Loader from '../components/Loader.jsx';
import StatCard from '../components/StatCard.jsx';
import { riskChartColor } from '../utils/riskUtils';
import Layout from './Layout.jsx';

function hasData(items = []) {
  return items.some((item) => Number(item.value) > 0);
}

function EmptyState({ title = 'No analysis data yet', message = 'Run your first scan to generate dashboard insights.' }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{message}</p>
        <Link to="/quick-scan" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Start Quick Scan
        </Link>
      </div>
    </div>
  );
}

function ChartCard({ title, description, icon: Icon, children, empty }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {empty ? <EmptyState /> : <div className="h-72">{children}</div>}
    </section>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({ stats: null, recent: [], risk: [], categories: [], trustTrend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/dashboard/stats'),
      api.get('/api/dashboard/recent'),
      api.get('/api/dashboard/risk-chart'),
      api.get('/api/dashboard/category-chart'),
      api.get('/api/dashboard/trust-trend')
    ])
      .then(([stats, recent, risk, categories, trustTrend]) => {
        setData({ stats: stats.data, recent: recent.data, risk: risk.data, categories: categories.data, trustTrend: trustTrend.data });
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Could not load dashboard data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = data.stats || {};
  const riskHasData = hasData(data.risk);
  const categoryHasData = hasData(data.categories);

  const statCards = useMemo(() => ([
    { icon: FileSearch, label: 'Total Analyses', value: stats.total_analyses ?? 0, tone: 'blue' },
    { icon: OctagonAlert, label: 'Critical Cases', value: stats.critical_cases ?? 0, tone: 'red' },
    { icon: Flame, label: 'High Risk Cases', value: stats.high_risk_cases ?? 0, tone: 'orange' },
    { icon: CheckCircle2, label: 'Safe Cases', value: stats.safe_cases ?? 0, tone: 'green' },
    { icon: ShieldCheck, label: 'Avg Trust Score', value: stats.average_trust_score ?? 0, tone: 'green' },
    { icon: Sparkles, label: 'Top AI Scam Type', value: stats.most_common_ai_scam_type || 'No analyses yet', tone: 'blue' }
  ]), [stats.total_analyses, stats.critical_cases, stats.high_risk_cases, stats.safe_cases, stats.average_trust_score, stats.most_common_ai_scam_type]);

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Monitor your UPI scam analyses, high-risk cases, and recent safety decisions.">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Loader label="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Dashboard"
      subtitle="Monitor your UPI scam analyses, high-risk cases, and recent safety decisions."
      action={
        <Link to="/quick-scan" className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          Start Quick Scan
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Risk Level Chart"
          description="Distribution of scans by risk severity."
          icon={PieChartIcon}
          empty={!riskHasData}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.risk} dataKey="value" nameKey="name" outerRadius={95} label>
                {data.risk.map((entry) => <Cell key={entry.name} fill={riskChartColor(entry.name)} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Scam Category Chart"
          description="Most common scam categories detected in your scans."
          icon={BarChart3}
          empty={!categoryHasData}
        >
          <ResponsiveContainer>
            <BarChart data={data.categories} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6">
        <ChartCard
          title="Trust Score Trend"
          description="Recent scans by trust score."
          icon={ShieldCheck}
          empty={!hasData(data.trustTrend)}
        >
          <ResponsiveContainer>
            <LineChart data={data.trustTrend} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Recent Analyses</h2>
            <p className="mt-1 text-sm text-slate-600">Latest scans, risk scores, and safety summaries.</p>
          </div>
          <Link to="/quick-scan" className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">
            Analyze suspicious message
          </Link>
        </div>

        <div className="mt-5">
          {data.recent.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {data.recent.map((item) => <AnalysisCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-950">Your recent scans will appear here.</p>
              <p className="mt-2 text-sm text-slate-600">Analyze a suspicious message to start building your history.</p>
              <Link to="/quick-scan" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                Analyze suspicious message
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
