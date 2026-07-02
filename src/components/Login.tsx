import React, { useState } from 'react';
import { Mail, ArrowRight, Globe, BarChart2, Shield, Users } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function CleaningLogin({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = new URL(import.meta.env.VITE_GAS_URL || '');
      url.searchParams.set('page', 'api');
      url.searchParams.set('action', 'validateUser');
      url.searchParams.set('email', email.trim().toLowerCase());
      const response = await fetch(url.toString(), { redirect: 'follow' });
      const text = await response.text();
      const result = JSON.parse(text);
      if (result.success) {
        onLoginSuccess(email.trim().toLowerCase());
      } else {
        setError(result.error || 'Access not authorized.');
      }
    } catch (e) {
      setError('Connection error. Try again.');
    }
  };
  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-white relative overflow-hidden">
        
        {/* Background blob */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full -translate-x-1/2 translate-y-1/2 z-0" />
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center">
              <img src="/logo.jpg" alt="BGrowth" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-slate-900 font-extrabold text-lg tracking-tight">BGROWTH <span className="text-[#1d6fa4]">CLUB</span></span>
              <p className="text-slate-400 text-xs">Grow Anywhere. Win Everywhere.</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            All the tools you need<br />to <span className="text-[#1d6fa4]">grow</span> your business.
          </h1>
          <p className="text-slate-500 text-base mb-10">
            BGrowth Club is your all-in-one platform with powerful tools, resources and insights to help you scale with confidence.
          </p>

          {/* Features */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-[#1d6fa4]" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">Powerful Tools</p>
                <p className="text-slate-400 text-sm">Everything you need in one place to run and grow your business.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">Secure & Reliable</p>
                <p className="text-slate-400 text-sm">Your data is protected with enterprise grade security.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm">Built for Growth</p>
                <p className="text-slate-400 text-sm">Designed to help you scale, save time and increase your revenue.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom card */}
        <div className="relative z-10 bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm mt-10">
          <div className="w-10 h-10 bg-[#1d6fa4] rounded-full flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-slate-900 font-bold text-sm">Join thousands of entrepreneurs</p>
            <p className="text-slate-400 text-xs">who are already growing with BGrowth Club.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10">
          
          {/* Logo mobile */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img src="/logo.jpg" alt="BGrowth" className="w-full h-full object-contain" />
            </div>
          </div>

          <p className="text-center text-[#1d6fa4] text-xs font-bold uppercase tracking-widest mb-2">Welcome Back</p>
          <h2 className="text-center text-slate-900 text-2xl font-extrabold mb-2">Sign in to your account</h2>
          <p className="text-center text-slate-400 text-sm mb-8">Enter your email to access your BGrowth Club dashboard.</p>

          {/* Email field */}
          <div className="relative mb-4">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your email address"
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[#1d6fa4] transition-colors placeholder-slate-400"
            />
          </div>

          {error && <p className="text-rose-500 text-xs mb-3">{error}</p>}

          {/* Sign In button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#1d6fa4] hover:bg-[#155a85] text-white font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 mb-4"
          >
            {loading ? 'Verifying...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* BGrowth website button */}
          <button className="w-full border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors mb-8">
            <Globe className="w-4 h-4" />
            Continue via BGrowth website
          </button>

          {/* Bottom features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-xs">Secure & Reliable</p>
                <p className="text-slate-400 text-xs">Your data is safe and encrypted</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-xs">Grow Your Business</p>
                <p className="text-slate-400 text-xs">Powerful tools to scale</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-xs mt-8">
            By signing in, you agree to our{' '}
            <span className="text-[#1d6fa4] cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="text-[#1d6fa4] cursor-pointer">Privacy Policy</span>.
          </p>
          <p className="text-center text-slate-400 text-xs mt-1">
            © 2026 BGrowth Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}