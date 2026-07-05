import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      const ok = await login(form.email, form.password);
      if (ok) navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <div className="mx-auto flex max-w-md items-center px-4 py-16">
        <form onSubmit={submit} className="glass w-full rounded-lg p-6">
          <h1 className="text-3xl font-bold">Login</h1>
          <input className="field mt-6" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="field mt-4" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? 'Signing in...' : 'Login'}</button>
          <p className="mt-4 text-center text-sm text-slate-400">New here? <Link to="/register" className="text-red-400 hover:text-red-300">Create account</Link></p>
        </form>
      </div>
    </div>
  );
}
