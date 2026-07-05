import { useEffect, useState } from 'react';
import { UserCircle } from 'lucide-react';

import api from '../api/api';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from './Layout.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/api/dashboard/stats').then((res) => setTotal(res.data.total_analyses));
  }, []);

  return (
    <Layout title="Profile" subtitle="Your FinShield account and analysis activity.">
      <div className="glass max-w-xl rounded-lg p-6">
        <UserCircle className="h-16 w-16 text-red-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">{user?.name}</h2>
        <p className="text-slate-400">{user?.email}</p>
        <div className="mt-6 rounded-lg bg-white/5 p-4">
          <p className="text-sm text-slate-400">Total analyses</p>
          <p className="text-3xl font-bold text-red-400">{total}</p>
        </div>
      </div>
    </Layout>
  );
}
