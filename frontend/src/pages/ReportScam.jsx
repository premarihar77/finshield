import { useState } from 'react';
import toast from 'react-hot-toast';

import api from '../api/api';
import Layout from './Layout.jsx';

export default function ReportScam() {
  const [form, setForm] = useState({ title: '', description: '', scammer_contact: '', platform: 'WhatsApp', amount_lost: 0 });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/reports', { ...form, amount_lost: Number(form.amount_lost) });
      toast.success('Scam report submitted');
      setForm({ title: '', description: '', scammer_contact: '', platform: 'WhatsApp', amount_lost: 0 });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not submit report');
    }
  };

  return (
    <Layout title="Report Scam" subtitle="Store details of suspicious contacts, platforms, and losses for your own record.">
      <form onSubmit={submit} className="glass max-w-2xl rounded-lg p-5">
        <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="field mt-4 min-h-40" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input className="field" placeholder="Scammer contact" value={form.scammer_contact} onChange={(e) => setForm({ ...form, scammer_contact: e.target.value })} />
          <input className="field" placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          <input className="field" type="number" min="0" placeholder="Amount lost" value={form.amount_lost} onChange={(e) => setForm({ ...form, amount_lost: e.target.value })} />
        </div>
        <button className="btn-primary mt-5">Submit Report</button>
      </form>
    </Layout>
  );
}
