import React, { useState } from 'react';
import { 
  Sparkles, Car, Truck, Briefcase, Home, ShieldCheck, Heart, GraduationCap, 
  BarChart3, Zap, Layers, Play, CheckCircle2, Lock, Users, Receipt, Database, Plus, MailOpen, Utensils, PawPrint, Coins
} from 'lucide-react';

interface AppHubProps {
  userEmail: string;
  setActiveTab: (tab: string) => void;
}

const modulesData = [
  { id: 'dashboard', name: 'Cleaning Management', category: 'Home Services', ico: 'Sparkles', color: 'teal', description: 'Schedules, smart assignment, digital checklists, and automated quotes.', available: true },
  { id: 'mileage-tracker', name: 'Mileage Tracker', category: 'Gig Work', ico: 'Car', color: 'blue', description: 'Log business miles and calculate automated tax deductions.', available: true },
  { id: 'delivery-tracker', name: 'Delivery Tracker', category: 'Gig Work', ico: 'Truck', color: 'green', description: 'Track gig batch income, hours, tips and net earnings.', available: true },
  { id: 'notary', name: 'Notary Manager', category: 'Professional Services', ico: 'Briefcase', color: 'amber', description: 'Digital notary book, appointment log and client journal.', available: false },
  { id: 'buffet', name: 'Buffet & Catering Planner', category: 'Professional Services', ico: 'Utensils', color: 'indigo', description: 'Interactive estimate form, lead pipelines, ingredient volume scaling.', available: false },
  { id: 'crm', name: 'BGrowth CRM', category: 'Customer Management', ico: 'Users', color: 'blue', description: 'Manage sales pipelines, track prospective leads, and centralize profiles.', available: false },
  { id: 'bgmoney', name: 'BGrowth Money™', category: 'Financial', ico: 'Coins', color: 'emerald', description: 'Complete financial education and dashboard.', available: false },
];

const getIcon = (name: string, color: string) => {
  const props = { className: `w-5 h-5 text-${color}-600` };
  switch (name) {
    case 'Car': return <Car {...props} />;
    case 'Truck': return <Truck {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Utensils': return <Utensils {...props} />;
    case 'Coins': return <Coins {...props} />;
    default: return <Briefcase {...props} />;
  }
};

export default function AppHub({ userEmail, setActiveTab }: AppHubProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Home Services', 'Gig Work', 'Professional Services', 'Customer Management', 'Financial'];
  const filtered = activeCategory === 'All' ? modulesData : modulesData.filter(m => m.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 text-indigo-400 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
            <Layers className="w-3.5 h-3.5" /> BGrowth Ecosystem
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back! 👋</h1>
          <p className="text-slate-400 text-xs max-w-xl">Access your independent modules to manage schedules, track financials and grow your business.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              activeCategory === cat ? 'bg-teal-500 text-slate-950 shadow-md' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(module => (
          <div
            key={module.id}
            onClick={() => module.available && setActiveTab(module.id)}
            className={`bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all duration-200 relative group ${
              module.available ? 'cursor-pointer hover:border-slate-200 hover:shadow-md' : 'opacity-65 cursor-default'
            }`}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                {getIcon(module.ico, module.color)}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-teal-600 transition-colors">{module.name}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{module.category}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">{module.description}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
              {module.available ? (
                <>
                  <span className="text-emerald-600 font-extrabold text-[11px] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activated
                  </span>
                  <button className="bg-slate-100 group-hover:bg-teal-500 group-hover:text-white text-slate-700 w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-slate-400 font-extrabold text-[11px] inline-flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Coming Soon
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}