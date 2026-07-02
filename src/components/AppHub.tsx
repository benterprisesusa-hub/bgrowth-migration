/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Car, Truck, Briefcase, Home, ShieldCheck, Heart, GraduationCap, 
  BarChart3, Zap, Layers, Play, CheckCircle2, Lock, Users, Receipt, Database, Plus, MailOpen, Utensils, PawPrint, Coins
} from 'lucide-react';
import { User, AppModule } from '../types';

interface DashboardProps {
  user: User;
  onLaunchModule: (moduleId: string) => void;
}

export const modulesData: AppModule[] = [
  // Gig Work
  { id: 'mileage', name: 'Mileage Tracker', category: 'Gig Work', ico: 'Car', color: 'blue', description: 'Log business miles and calculate automated tax deductions.', planRequired: 'Starter', available: true },
  { id: 'delivery', name: 'Delivery Tracker', category: 'Gig Work', ico: 'Truck', color: 'green', description: 'Track gig batch income, hours, tips and net earnings.', planRequired: 'Starter', available: true },
  { id: 'notary', name: 'Notary Manager', category: 'Professional Services', ico: 'Briefcase', color: 'amber', description: 'Digital notary book, appointment log and client journal.', planRequired: 'Starter', available: true },
  { id: 'buffet', name: 'Buffet & Catering Planner', category: 'Professional Services', ico: 'Utensils', color: 'indigo', description: 'Interactive estimate form, lead pipelines, ingredient volume scaling, and staff calculators.', planRequired: 'Starter', available: true },
  { id: 'babysitter', name: 'BGrowth Babysitter™', category: 'Professional Services', ico: 'ShieldCheck', color: 'rose', description: 'Complete Childcare Business Management Platform. Multi-role access for Families, Nannies, and Agencies with smart scheduling, timelines, daily reports, and Gemini childcare AI.', planRequired: 'Starter', available: true },
  { id: 'petcare', name: 'BGrowth Pet Care™', category: 'Professional Services', ico: 'PawPrint', color: 'teal', description: 'Complete Pet business management. Digital medical records (prontuários), visual timelines, custom checklists per pet, GPS check-in/out, key custody controls, and dedicated Client Portal.', planRequired: 'Starter', available: true },
  { id: 'cx', name: 'BGrowth Customer Experience™', category: 'Customer Management', ico: 'Heart', color: 'indigo', description: 'Universal client engagement platform. Manage packages, subscriptions, memberships, loyalty rewards, and interactive self-service portals.', planRequired: 'Starter', available: true },
  
  // Home Services
  { id: 'cleaning', name: 'Cleaning Management', category: 'Home Services', ico: 'Sparkles', color: 'teal', description: 'Schedules, smart assignment, digital checklists, and automated quotes.', planRequired: 'Starter', available: true },
  { id: 'handyman', name: 'Handyman Hub', category: 'Home Services', ico: 'Home', color: 'orange', description: 'Task dispatch, materials estimation, and maintenance scheduling.', planRequired: 'Starter', available: false },
  { id: 'landscape', name: 'Landscaping', category: 'Home Services', ico: 'Home', color: 'green', description: 'Mowing logs, yard measurements, and recurring client schedules.', planRequired: 'Starter', available: false },
  
  // Customer Management
  { id: 'crm', name: 'BGrowth CRM', category: 'Customer Management', ico: 'Users', color: 'blue', description: 'Manage sales pipelines, track prospective leads, and centralize profiles.', planRequired: 'Pro', available: false },
  
  // Financial
  { id: 'bgmoney', name: 'BGrowth Money™', category: 'Financial', ico: 'Coins', color: 'emerald', description: 'Complete financial education and dashboard. Set budgets, manage assets, solve quizzes, track your life timeline, and toggle between personal and corporate views in 3 languages.', planRequired: 'Starter', available: true },
  { id: 'financial', name: 'Financial Management', category: 'Financial', ico: 'Receipt', color: 'green', description: 'Comprehensive income trackers, Profit & Loss reports, and cash flow.', planRequired: 'Enterprise', available: false },
  { id: 'payroll', name: 'Payroll Engine', category: 'Financial', ico: 'Receipt', color: 'purple', description: 'Manage employee rates, hours, and commission pay slips.', planRequired: 'Enterprise', available: false },
  
  // AI
  { id: 'ai_assistant', name: 'BGrowth AI Assistant', category: 'AI', ico: 'Zap', color: 'purple', description: 'Generate smart reports, client predictions, and automatic scheduling templates.', planRequired: 'Pro', available: false },
  
  // Academy
  { id: 'academy', name: 'BGrowth Academy', category: 'Education', ico: 'GraduationCap', color: 'indigo', description: 'Create internal courses, certifications, and track team learning paths.', planRequired: 'Pro', available: false },
];

export default function Dashboard({ user, onLaunchModule }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Gig Work', 'Professional Services', 'Home Services', 'Customer Management', 'Financial', 'AI', 'Education'];

  const filteredModules = activeCategory === 'All' 
    ? modulesData 
    : modulesData.filter(m => m.category === activeCategory);

  const getIcon = (name: string, color: string) => {
    const props = { className: `w-5 h-5 text-${color}-600` };
    switch (name) {
      case 'Car': return <Car {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Home': return <Home {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Receipt': return <Receipt {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'PawPrint': return <PawPrint {...props} />;
      case 'Coins': return <Coins {...props} />;
      case 'Layers': return <Layers {...props} />;
      default: return <Briefcase {...props} />;
    }
  };

  const theme = user.themeColor || 'indigo';
  const themeBgActive = {
    indigo: 'bg-indigo-600 text-white shadow-md shadow-indigo-100',
    emerald: 'bg-emerald-600 text-white shadow-md shadow-emerald-100',
    rose: 'bg-rose-600 text-white shadow-md shadow-rose-100',
    amber: 'bg-amber-600 text-white shadow-md shadow-amber-100',
    sky: 'bg-sky-500 text-white shadow-md shadow-sky-100',
    violet: 'bg-violet-600 text-white shadow-md shadow-violet-100',
    slate: 'bg-slate-800 text-white shadow-md shadow-slate-200'
  }[theme];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-slate-700 opacity-10 rounded-full -mr-12 -mt-12"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-slate-700 opacity-5 rounded-full -ml-8 -mb-8"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 text-indigo-400 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
            <Layers className="w-3.5 h-3.5" /> {user.companyName || 'BGrowth'} Ecosystem
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome, {user.name}! 👋
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl">
            Access your independent modules to manage schedules, track financials, coordinate your team, and accelerate business growth.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 ${
              activeCategory === cat
                ? themeBgActive
                : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const isLocked = !module.available && user.plan !== 'Enterprise' && user.plan !== 'Pro';
          
          return (
            <div
              key={module.id}
              onClick={() => module.available && onLaunchModule(module.id)}
              className={`bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all duration-200 relative group ${
                module.available 
                  ? 'cursor-pointer hover:border-slate-200 hover:shadow-md' 
                  : 'opacity-65 cursor-default'
              }`}
            >
              {/* Lock Badge */}
              {isLocked && (
                <div className="absolute top-4 right-4 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-600">{module.planRequired}</span>
                </div>
              )}

              {/* Module Content */}
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center`}>
                  {getIcon(module.ico, module.color)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {module.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {module.category}
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {module.description}
                </p>
              </div>

              {/* Launch / Upgrade Button */}
              <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                {module.available ? (
                  <>
                    <span className="text-emerald-600 font-extrabold text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Activated
                    </span>
                    <button className="bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 w-7 h-7 rounded-lg flex items-center justify-center transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-slate-400 font-extrabold text-[11px] inline-flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Premium Module
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-600 hover:underline">
                      Upgrade &rarr;
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick platform facts & instructions */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-indigo-900 font-extrabold text-xs">🛠️ Unlimited Multi-tenant Sheets & Drive Connection</h4>
          <p className="text-indigo-700 text-[11px] max-w-2xl leading-relaxed">
            BGrowth's architecture leverages fully-private isolated spreadsheets on Google Sheets and custom file-sharing pipelines on Google Drive, giving each enterprise customer maximum safety, storage, and performance.
          </p>
        </div>
        <div className="bg-white border border-indigo-200 px-3 py-1.5 rounded-lg text-center text-xs font-black text-indigo-700 shadow-sm whitespace-nowrap">
          🚀 100% Serverless
        </div>
      </div>
    </div>
  );
}
