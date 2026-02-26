import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function AdminSignupPage() {
  const navigate = useNavigate();
  const { switchToAdmin, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
   
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await AuthApi.adminSignup(form);
      setUser(res.data?.user || null);
      switchToAdmin();
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Admin signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <main className="pt-24 px-4 pb-10 flex justify-center bg-linear-to-b from-blue-50 to-white min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-blue-100 p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-semibold text-blue-900">Admin Sign Up</h1>
        <p className="text-xs text-gray-500">
          Create an admin account to manage campus events.
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div>
          <label className="text-xs text-gray-600">
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div>
          <label className="text-xs text-gray-600">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div>
          <label className="text-xs text-gray-600">
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div>
          <label className="text-xs text-gray-600">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </label>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Signing up...' : 'Create Admin Account'}
        </button>
        <p className="text-[11px] text-gray-500 text-center">
          Already have an account?{' '}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => navigate('/login/admin')}
          >
            Log in
          </button>
        </p>
      </form>
    </main>
  );
}

export default AdminSignupPage;



