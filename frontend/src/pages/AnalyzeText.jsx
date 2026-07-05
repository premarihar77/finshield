import { useState } from 'react';
import toast from 'react-hot-toast';

import api from '../api/api';
import Loader from '../components/Loader.jsx';
import ResultPanel from '../components/ResultPanel.jsx';
import { rememberLatestAnalysis } from '../utils/pdfReport';
import Layout from './Layout.jsx';

export default function AnalyzeText() {
  const [inputText, setInputText] = useState('');
  const [sourceType, setSourceType] = useState('sms');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (inputText.trim().length < 3) return toast.error('Please paste a suspicious message first');
    setLoading(true);
    try {
      const { data } = await api.post('/api/analyze/text', { input_text: inputText, source_type: sourceType });
      setResult(data);
      rememberLatestAnalysis(data);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Analyze Text" subtitle="Paste suspicious SMS, WhatsApp, email, UPI request, KYC warning, reward message, or scam text.">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={submit} className="glass rounded-lg p-5">
          <label className="text-sm text-slate-400">Source type</label>
          <select className="field mt-2" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="upi_message">UPI Message</option>
            <option value="other">Other</option>
          </select>
          <label className="mt-5 block text-sm text-slate-400">Suspicious text</label>
          <textarea className="field mt-2 min-h-72" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Paste message here..." />
          <button className="btn-primary mt-5 w-full">Analyze Risk</button>
          {loading && <div className="mt-4"><Loader /></div>}
        </form>
        <ResultPanel result={result} inputType={sourceType} originalText={inputText} />
      </div>
    </Layout>
  );
}
