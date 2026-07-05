import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    try {
      await register(form.name, form.email, form.password);
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <div className="mx-auto flex max-w-md items-center px-4 py-16">
        <form onSubmit={submit} className="glass w-full rounded-lg p-6">
          <h1 className="text-3xl font-bold">Create account</h1>
          <input className="field mt-6" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field mt-4" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="field mt-4" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="field mt-4" placeholder="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          <button className="btn-primary mt-6 w-full">Register</button>
          <p className="mt-4 text-center text-sm text-slate-400">Already registered? <Link to="/login" className="text-red-400 hover:text-red-300">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
