import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function StudentLoginPage() {
  const navigate = useNavigate();
  const { loginStudent } = useAuth(); // ✅ use loginStudent
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await AuthApi.studentLogin(form);
      loginStudent(res.data); // ✅ automatically sets user, role and stores token
      navigate('/student');
    } catch (err) {
      console.error(err);
      setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 px-4 pb-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold">Student Login</h1>
        {error && <p className="text-xs text-red-500">{error}</p>}
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
          className="w-full bg-black text-white text-sm py-2 rounded-md hover:bg-gray-900 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="text-[11px] text-gray-500 text-center">
          New here?{' '}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => navigate('/signup/student')}
          >
            Create a student account
          </button>
        </p>
      </form>
    </main>
  );
}

export default StudentLoginPage;