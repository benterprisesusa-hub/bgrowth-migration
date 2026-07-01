import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Inbox, 
  Briefcase, 
  Users, 
  Settings, 
  UserSquare2, 
  TrendingUp,
  FileText,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  Truck,
  Car,
  UserCheck,
  Compass,
  ShieldAlert,
  Calendar
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount: number;
  openOffersCount: number;
  pendingAppsCount: number;
  bizName: string;
  enabledModules?: {
    cleaning: boolean;
    delivery: boolean;
    mileage: boolean;
  };
  userPerspective: 'admin' | 'owner' | 'staff' | 'client';
  setUserPerspective: (role: 'admin' | 'owner' | 'staff' | 'client') => void;
}

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  pendingRequestsCount, 
  openOffersCount, 
  pendingAppsCount,
  bizName,
  enabledModules = { cleaning: true, delivery: true, mileage: true },
  userPerspective,
  setUserPerspective
}: NavigationProps) {
  
  const showAdmin = userPerspective === 'admin';
  const showManagement = userPerspective === 'owner' || userPerspective === 'admin';

  const adminItems = showAdmin ? [
    { id: 'admin-console', label: 'SaaS Admin Console', icon: ShieldAlert }
  ] : [];

  const managementItems = (enabledModules.cleaning && showManagement) ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'booking-requests', label: 'Booking Requests', icon: Inbox, badge: pendingRequestsCount },
    { id: 'cleaning-schedule', label: 'Cleaning Schedule', icon: Calendar },
    { id: 'job-board', label: 'Job Board', icon: Briefcase, badge: openOffersCount },
    { id: 'team-payroll', label: 'Team & Payroll', icon: Users, badge: pendingAppsCount },
    { id: 'clients', label: 'Clients Database', icon: UserSquare2 },
  ] : [];

  const portalItems = enabledModules.cleaning ? [
    ...(userPerspective === 'owner' || userPerspective === 'admin' || userPerspective === 'client' ? [
      { id: 'booking-form', label: 'Client Booking Form', icon: PlusCircle },
      { id: 'live-portal', label: 'Client Live Portal', icon: MessageSquare }
    ] : []),
    ...(userPerspective === 'owner' || userPerspective === 'admin' ? [
      { id: 'recruitment', label: 'Join Our Team Portal', icon: UserPlus },
      { id: 'onboarding', label: 'Candidate Onboarding', icon: UserCheck }
    ] : []),
    ...(userPerspective === 'owner' || userPerspective === 'admin' || userPerspective === 'staff' ? [
      { id: 'worker-portal', label: 'Worker Portal', icon: ClipboardCheck }
    ] : [])
  ] : [];

  const utilityItems = [
    ...(enabledModules.delivery && (userPerspective === 'owner' || userPerspective === 'admin' || userPerspective === 'staff') ? [
      { id: 'delivery-tracker', label: 'Delivery Tracker', icon: Truck }
    ] : []),
    ...(enabledModules.mileage && (userPerspective === 'owner' || userPerspective === 'admin' || userPerspective === 'staff') ? [
      { id: 'mileage-tracker', label: 'Mileage Tracker', icon: Car }
    ] : []),
    ...(userPerspective === 'owner' || userPerspective === 'admin' ? [
      { id: 'settings', label: 'Business Settings', icon: Settings }
    ] : []),
  ];

  const renderNavGroup = (title: string, items: typeof managementItems) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1 pt-4 first:pt-0">
        <div className="px-3 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {title}
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                isActive 
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                  isActive 
                    ? 'bg-slate-950 text-teal-400' 
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      <div className="p-5 border-b border-slate-800 bg-slate-950 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-teal-500/20">
            💼
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
              {bizName || "BGrowth Platform"}
            </h1>
            <span className="text-[10px] text-teal-400 font-black tracking-wider uppercase">BGrowth Platform™</span>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="space-y-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block px-1">
            Perspectiva de Acesso:
          </label>
          <div className="grid grid-cols-2 gap-1">
            {/* Admin Role button */}
            <button
              type="button"
              onClick={() => {
                setUserPerspective('admin');
                setActiveTab('admin-console');
              }}
              title="Super Administrador do Sistema"
              className={`py-1.5 text-[9px] rounded font-black transition ${
                userPerspective === 'admin'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setUserPerspective('owner');
                setActiveTab('home');
              }}
              title="Dono do Negócio / Parceiro"
              className={`py-1.5 text-[9px] rounded font-black transition ${
                userPerspective === 'owner'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => {
                setUserPerspective('staff');
                setActiveTab('worker-portal');
              }}
              title="Prestador de Serviço / Colaborador"
              className={`py-1.5 text-[9px] rounded font-black transition ${
                userPerspective === 'staff'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setUserPerspective('client');
                setActiveTab('booking-form');
              }}
              title="Cliente Final"
              className={`py-1.5 text-[9px] rounded font-black transition ${
                userPerspective === 'client'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Cliente
            </button>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto divide-y divide-slate-800/40">
        <div className="pb-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-150 ${
              activeTab === 'home' 
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' 
                : 'text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Compass size={16} className={activeTab === 'home' ? 'text-slate-950' : 'text-teal-400'} />
              <span>Central de Apps</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-black bg-slate-950/20">
              HUB
            </span>
          </button>
        </div>
        {renderNavGroup('SaaS Super Admin', adminItems)}
        {renderNavGroup('Management', managementItems)}
        {renderNavGroup('Staff & Clients', portalItems)}
        {renderNavGroup('Finance & Settings', utilityItems)}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-black text-sm">
            {userPerspective === 'admin' ? '🛡️' : userPerspective === 'owner' ? '👑' : userPerspective === 'staff' ? '👷' : '👤'}
          </div>
          <div>
            <div className="text-xs font-black text-white">
              {userPerspective === 'admin' ? 'Super Admin' : userPerspective === 'owner' ? 'Dono do Sistema' : userPerspective === 'staff' ? 'Diarista / Driver' : 'Cliente Visitante'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {userPerspective === 'admin' ? 'Gerência do SaaS' : userPerspective === 'owner' ? 'Acesso Administrativo' : userPerspective === 'staff' ? 'BGrowth Team' : 'Portal de Autoatendimento'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
