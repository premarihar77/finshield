import { useEffect, useState } from 'react';

import api from '../api/api';
import AnalysisCard from '../components/AnalysisCard.jsx';
import Loader from '../components/Loader.jsx';
import Layout from './Layout.jsx';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analyze/history').then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="History" subtitle="Review previous fraud checks sorted by latest first.">
      {loading ? <Loader label="Loading history..." /> : <div className="grid gap-4 lg:grid-cols-2">{items.map((item) => <AnalysisCard key={item.id} item={item} />)}</div>}
      {!loading && !items.length && <p className="text-slate-500">No saved analysis yet.</p>}
    </Layout>
  );
}
