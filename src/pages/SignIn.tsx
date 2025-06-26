import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const TESTIMONIALS = [
  {
    quote: 'SuitCraft AI gave me the confidence to ace my job interview. The recommendations were spot-on!',
    name: 'Alex Johnson',
    handle: '@alexj',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'I never thought AI could help me dress better, but here I am, looking sharp every day.',
    name: 'Maria Lee',
    handle: '@marialee',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'The style notes and explanations are so helpful. Highly recommend for anyone wanting to upgrade their wardrobe.',
    name: 'Chris Evans',
    handle: '@chrisevans',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
  {
    quote: 'Easy, fast, and surprisingly creative. SuitCraft AI is my new go-to for big events.',
    name: 'Priya Patel',
    handle: '@priyapatel',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const SignIn: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Shuffle testimonial on each load
  const testimonial = useMemo(() => {
    const idx = Math.floor(Math.random() * TESTIMONIALS.length);
    return TESTIMONIALS[idx];
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      const redirectTo = (location.state && (location.state as any).from) || '/';
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* Logo at top left */}
      <div className="absolute top-0 left-0 p-8 z-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <span className="inline-block bg-blue-700 rounded-full p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fff"/></svg>
        </span>
        <span className="text-2xl font-bold text-blue-900">SuitCraft AI</span>
      </div>
      {/* Left: Sign In Form */}
      <div className="flex flex-col justify-center items-center w-full max-w-lg px-8 py-12 mx-auto ml-24">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-light mb-1 text-black">Welcome back</h2>
          <p className="text-slate-600 mb-6 text-sm">Sign in to your account</p>
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          <button
            type="button"
            className="w-full border border-slate-300 py-2 rounded-full flex items-center justify-center gap-2 text-slate-700 font-semibold mb-4 bg-white hover:bg-slate-50 transition"
            disabled
          >
            <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.87-6.87C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.48 2.69 13.44l8.01 6.22C12.33 13.13 17.68 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.7 28.13c-1.01-2.99-1.01-6.27 0-9.26l-8.01-6.22C.7 16.7 0 20.27 0 24c0 3.73.7 7.3 1.99 10.35l8.01-6.22z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.32 0-11.67-3.63-13.3-8.87l-8.01 6.22C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Continue with Google
          </button>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="mx-2 text-slate-400 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-slate-700 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex items-center justify-between mt-2">
              <label className="text-slate-700 text-sm">Password</label>
              <button type="button" className="text-blue-700 text-xs hover:underline" tabIndex={-1}>Forgot Password?</button>
            </div>
            <div className="relative mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 text-xs font-semibold focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? 'hide' : 'show'}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-full font-semibold text-base mt-2 transition"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="text-center mt-4 text-sm">
            Don't have an account?{' '}
            <button type="button" className="text-blue-700 font-semibold hover:underline" onClick={() => navigate('/signup')}>
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
      {/* Right: Testimonial */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 border-l border-slate-100 shadow-inner shadow-slate-200">
        <div className="max-w-lg px-8 py-12">
          <div className="text-4xl text-slate-400 mb-4">“</div>
          <blockquote className="text-2xl font-light mb-6 text-black">{testimonial.quote}</blockquote>
          <div className="flex items-center gap-3">
            <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full border-2 border-blue-200" />
            <div>
              <div className="font-semibold text-slate-800">{testimonial.name}</div>
              <div className="text-slate-500 text-sm">{testimonial.handle}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 