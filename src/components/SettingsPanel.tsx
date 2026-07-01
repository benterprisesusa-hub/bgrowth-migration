import React, { useState } from 'react';
import { 
  Building2, 
  Settings, 
  DollarSign, 
  Clock, 
  Plus, 
  Save, 
  Check, 
  FileText, 
  Lock,
  Layers,
  Crown,
  Trash2,
  Calendar,
  User,
  Bell,
  Target,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { AppSettings, ServicePrice, RoomConfig, ExtraFee, TeamMember, SpecialHour } from '../types';
import { CP_TYPES, INITIAL_SPECIAL_HOURS } from '../data';

interface SettingsPanelProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  members?: TeamMember[];
  onUpdateMembers?: (members: TeamMember[]) => void;
}

interface ChecklistItem {
  id: string;
  name: string;
  serviceType: string;
  standard: boolean;
  deep: boolean;
}

const INITIAL_CHECKLISTS: ChecklistItem[] = [
  { id: 'ch1', name: 'Dust and wipe all accessible surfaces', serviceType: 'House', standard: true, deep: true },
  { id: 'ch2', name: 'Vacuum and mop all hard floors', serviceType: 'House', standard: true, deep: true },
  { id: 'ch3', name: 'Sanitize toilet, bathtub, shower, and sinks', serviceType: 'House', standard: true, deep: true },
  { id: 'ch4', name: 'Empty all trash cans and replace liners', serviceType: 'House', standard: true, deep: true },
  { id: 'ch5', name: 'Wipe down baseboards and doors', serviceType: 'House', standard: false, deep: true },
  { id: 'ch6', name: 'Clean inside window sills and tracks', serviceType: 'House', standard: false, deep: true },
  { id: 'ch7', name: 'Disinfect high-touch office areas', serviceType: 'Commercial', standard: true, deep: true },
  { id: 'ch8', name: 'Clean kitchen/breakroom and refill dispensers', serviceType: 'Commercial', standard: true, deep: true },
];

export default function SettingsPanel({ settings, onSaveSettings, members = [], onUpdateMembers }: SettingsPanelProps) {
  // Tabs exactly as shown: Business Profile, Pricing & Fees, Request Form, Checklists, Goals, Notifications, My Hours
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'request-form' | 'checklists' | 'goals' | 'notifications' | 'hours'>('profile');
  
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // My Hours special states
  const [specialRules, setSpecialRules] = useState<SpecialHour[]>(INITIAL_SPECIAL_HOURS);
  
  // Special days form inputs
  const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>(members[0]?.email || 'admin@bgrowth.com');
  const [specialDate, setSpecialDate] = useState<string>('');
  const [specialStart, setSpecialStart] = useState<string>('08:00');
  const [specialEnd, setSpecialEnd] = useState<string>('17:00');

  // Checklists tab state
  const [checklists, setChecklists] = useState<ChecklistItem[]>(INITIAL_CHECKLISTS);
  const [selectedChecklistService, setSelectedChecklistService] = useState<string>('House');
  const [newChecklistItemText, setNewChecklistItemText] = useState<string>('');

  // Receipt fields checkbox state
  const [receiptFields, setReceiptFields] = useState({
    dateTime: true,
    serviceType: true,
    cleanerName: true,
    duration: false,
    discount: true,
    extraFee: true,
    notes: true
  });

  const triggerSuccess = (sectionName: string) => {
    setSavedSuccess(sectionName);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  const handleSaveAllSettings = (sectionName: string, updatedSettings: AppSettings = localSettings) => {
    onSaveSettings(updatedSettings);
    triggerSuccess(sectionName);
  };

  // Profile handlings
  const handleProfileChange = (key: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      bizProfile: {
        ...localSettings.bizProfile,
        [key]: value
      }
    });
  };

  // Pricing Table change
  const handlePricingChange = (svcId: string, key: keyof ServicePrice, value: number) => {
    setLocalSettings({
      ...localSettings,
      pricing: {
        ...localSettings.pricing,
        [svcId]: {
          ...(localSettings.pricing[svcId] || { hourRate: 45, sqftRate: 0.12, minCharge: 120 }),
          [key as string]: value
        }
      }
    });
  };

  const handleToggleActiveService = (svcId: string) => {
    const isCurrentlyActive = localSettings.activeServices.includes(svcId);
    let nextActive = [...localSettings.activeServices];
    if (isCurrentlyActive) {
      nextActive = nextActive.filter(id => id !== svcId);
    } else {
      nextActive.push(svcId);
    }
    setLocalSettings({
      ...localSettings,
      activeServices: nextActive
    });
  };

  // Sqft times change
  const handleSqftTimeChange = (svcId: string, field: 'std' | 'deep', value: number) => {
    setLocalSettings({
      ...localSettings,
      sqftTime: {
        ...localSettings.sqftTime,
        [svcId]: {
          ...(localSettings.sqftTime[svcId] || { std: 0.25, deep: 0.40 }),
          [field]: value
        }
      }
    });
  };

  // Extra fees handlers
  const handleExtraFeeChange = (feeId: string, key: keyof ExtraFee, value: any) => {
    // update allExtraFees as catalog
    const nextCatalog = localSettings.allExtraFees.map(f => {
      if (f.id === feeId) {
        return { ...f, [key as string]: value };
      }
      return f;
    });

    // synchronize active list
    const isCurrentlyActive = localSettings.extraFees.some(f => f.id === feeId);
    let nextActive = [...localSettings.extraFees];
    if (isCurrentlyActive) {
      nextActive = nextActive.map(f => {
        if (f.id === feeId) {
          return { ...f, [key as string]: value };
        }
        return f;
      });
    }

    setLocalSettings({
      ...localSettings,
      allExtraFees: nextCatalog,
      extraFees: nextActive
    });
  };

  const handleToggleExtraFee = (feeId: string) => {
    const isCurrentlyActive = localSettings.extraFees.some(f => f.id === feeId);
    let nextActive = [...localSettings.extraFees];
    if (isCurrentlyActive) {
      nextActive = nextActive.filter(f => f.id !== feeId);
    } else {
      const original = localSettings.allExtraFees.find(f => f.id === feeId);
      if (original) {
        nextActive.push(original);
      }
    }
    setLocalSettings({
      ...localSettings,
      extraFees: nextActive
    });
  };

  // Rooms handle
  const handleRoomConfigChange = (roomType: 'studio' | 'bedroom' | 'bathroom', key: keyof RoomConfig, value: any) => {
    setLocalSettings({
      ...localSettings,
      roomPricing: {
        ...localSettings.roomPricing,
        [roomType]: {
          ...(localSettings.roomPricing[roomType] || { price: 0, stdTime: 0, deepTime: 0, description: '', includes: '' }),
          [key as string]: value
        }
      }
    });
  };

  // My Hours start/end hours configuration per member
  const handleUpdateMemberHours = (memberEmail: string, start: string, end: string) => {
    const nextWorkHours = {
      ...(localSettings.workHours || {}),
      [memberEmail]: { start, end }
    };
    const nextSettings = {
      ...localSettings,
      workHours: nextWorkHours
    };
    setLocalSettings(nextSettings);
    handleSaveAllSettings('Work Hours', nextSettings);
  };

  // My Hours special days additions
  const handleAddSpecialDay = (type: 'Off' | 'Extra' | 'Partial') => {
    if (!specialDate) {
      alert('Please select a valid date first.');
      return;
    }

    const member = members.find(m => m.email === selectedMemberEmail) || { name: 'Myself', email: selectedMemberEmail };
    const newRule: SpecialHour = {
      id: `rule_${Date.now()}`,
      memberEmail: selectedMemberEmail,
      memberName: member.name,
      date: specialDate,
      start: type === 'Off' ? '' : specialStart,
      end: type === 'Off' ? '' : specialEnd,
      type: type
    };

    const nextRules = [newRule, ...specialRules];
    setSpecialRules(nextRules);
    triggerSuccess('Special Day Added');
  };

  const handleDeleteRule = (id: string) => {
    setSpecialRules(specialRules.filter(r => r.id !== id));
    triggerSuccess('Rule Deleted');
  };

  // Checklists Tab Handlers
  const handleToggleChecklistField = (id: string, field: 'standard' | 'deep') => {
    setChecklists(checklists.map(c => c.id === id ? { ...c, [field]: !c[field] } : c));
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklists(checklists.filter(c => c.id !== id));
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `cli_${Date.now()}`,
      name: newChecklistItemText,
      serviceType: selectedChecklistService,
      standard: true,
      deep: true
    };
    setChecklists([...checklists, newItem]);
    setNewChecklistItemText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-4">
      {/* Upper header section */}
      <div className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-3xl shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full">Owner Settings Console</span>
          <h1 className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            ⚙️ Business Configuration Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Maintain service pricing models, catalog schedules, operational parameters, and staff guidelines</p>
        </div>
        
        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xs animate-pulse">
            <Check size={14} className="text-emerald-600" />
            <span>Successfully Saved: <strong>{savedSuccess}</strong></span>
          </div>
        )}
      </div>

      {/* Navigation tabs row exactly matching horizontal style in the screens */}
      <div className="flex flex-wrap gap-1 bg-white border border-slate-100 p-1.5 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>🏢</span> Business Profile
        </button>
        
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>💰</span> Pricing & Fees
        </button>

        <button
          onClick={() => setActiveTab('request-form')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'request-form'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>📋</span> Request Form
        </button>

        <button
          onClick={() => setActiveTab('checklists')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'checklists'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>☑️</span> Checklists
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'goals'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>🎯</span> Goals
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>🔔</span> Notifications
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
            activeTab === 'hours'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span>⏰</span> My Hours
        </button>
      </div>

      {/* Primary content grids based on selected horizontal tab */}
      <div className="space-y-6">

        {/* Tab 1: Business Profile (Screenshot 1) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Business Profile inputs */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Business Profile</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Configure your company's public identity, branding, and billing profile details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Business Name</label>
                  <input
                    type="text"
                    value={localSettings.bizProfile?.name || ''}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Address</label>
                  <input
                    type="text"
                    value={localSettings.bizProfile?.address || ''}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={localSettings.bizProfile?.phone || ''}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Contact Email</label>
                  <input
                    type="email"
                    value={localSettings.bizProfile?.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">ZIP Code</label>
                  <input
                    type="text"
                    value={localSettings.bizProfile?.zip || ''}
                    onChange={(e) => handleProfileChange('zip', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Logo URL (Link Direto da Imagem)</label>
                  <input
                    type="text"
                    value={localSettings.bizProfile?.logo || ''}
                    onChange={(e) => handleProfileChange('logo', e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Business Profile')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/10 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={14} /> Save Profile
                </button>
              </div>
            </div>

            {/* Receipt Fields checkboxes card (Right column of screenshot 1) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-5 shadow-xs">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Receipt Fields</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle receipt field inclusions for customer transaction vouchers.</p>
              </div>

              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {(['dateTime', 'serviceType', 'cleanerName', 'duration', 'discount', 'extraFee', 'notes'] as const).map((field) => {
                  const labelMap: Record<string, string> = {
                    dateTime: 'Date & Time',
                    serviceType: 'Service Type',
                    cleanerName: 'Cleaner Name',
                    duration: 'Duration',
                    discount: 'Discount',
                    extraFee: 'Extra Fee',
                    notes: 'Notes'
                  };

                  return (
                    <label key={field} className="flex items-center gap-3 cursor-pointer py-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition">
                      <input
                        type="checkbox"
                        checked={receiptFields[field]}
                        onChange={(e) => setReceiptFields({ ...receiptFields, [field]: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{labelMap[field]}</span>
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => triggerSuccess('Receipt Fields')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Save size={14} /> Save
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing & Fees (Screenshots 2 and 3) */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">

            {/* Section A: PRICING TABLE */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Pricing Table</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Set your flat or hourly rates per square foot and minimum charges for each service category.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Pricing Table')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={13} /> Save Pricing
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4 pl-6">Service Category</th>
                      <th className="p-4">$/Hour</th>
                      <th className="p-4">$/Sqft</th>
                      <th className="p-4">Min Charge</th>
                      <th className="p-4 text-center w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {CP_TYPES.map((svc) => {
                      const isActive = localSettings.activeServices.includes(svc.id);
                      const price = localSettings.pricing[svc.id] || { hourRate: 45, sqftRate: 0.12, minCharge: 120 };

                      return (
                        <tr key={svc.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-6 font-bold text-slate-900">
                            <span className="text-lg mr-2">{svc.ico}</span>
                            {svc.name}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                value={price.hourRate}
                                onChange={(e) => handlePricingChange(svc.id, 'hourRate', parseInt(e.target.value) || 0)}
                                className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={price.sqftRate}
                                onChange={(e) => handlePricingChange(svc.id, 'sqftRate', parseFloat(e.target.value) || 0)}
                                className="w-20 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                value={price.minCharge}
                                onChange={(e) => handlePricingChange(svc.id, 'minCharge', parseInt(e.target.value) || 0)}
                                className="w-20 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                              />
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActiveService(svc.id)}
                              className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-wider transition ${
                                isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isActive ? '● Active' : 'Disabled'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: Cleaning Time (min/sqft) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Cleaning Time (min/sqft)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Configure how many minutes are needed for each service and cleaning type.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Cleaning Times')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={13} /> Save
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4 pl-6">Service</th>
                      <th className="p-4">Standard (Min/Sqft)</th>
                      <th className="p-4">Deep (Min/Sqft)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {CP_TYPES.map((svc) => {
                      const time = localSettings.sqftTime?.[svc.id] || { std: 0.25, deep: 0.40 };
                      return (
                        <tr key={svc.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-6 font-bold text-slate-900">{svc.ico} {svc.name}</td>
                          <td className="p-4">
                            <input
                              type="number"
                              step="0.01"
                              value={time.std}
                              onChange={(e) => handleSqftTimeChange(svc.id, 'std', parseFloat(e.target.value) || 0)}
                              className="w-24 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              step="0.01"
                              value={time.deep}
                              onChange={(e) => handleSqftTimeChange(svc.id, 'deep', parseFloat(e.target.value) || 0)}
                              className="w-24 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section C: Extra Fees */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Extra Fees</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Activate additional fees you offer and set your prices.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Extra Fees')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={13} /> Save Fees
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4 pl-6">Extra Fee</th>
                      <th className="p-4">Price ($)</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">What's Included</th>
                      <th className="p-4">Std (Min)</th>
                      <th className="p-4">Deep (Min)</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {localSettings.allExtraFees?.map((fee) => {
                      const isActive = localSettings.extraFees.some(f => f.id === fee.id);
                      return (
                        <tr key={fee.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-6 font-bold text-slate-900">{fee.ico} {fee.name}</td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={fee.price}
                              onChange={(e) => handleExtraFeeChange(fee.id, 'price', parseInt(e.target.value) || 0)}
                              className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={fee.description || ''}
                              onChange={(e) => handleExtraFeeChange(fee.id, 'description', e.target.value)}
                              className="w-32 p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={fee.includes || ''}
                              onChange={(e) => handleExtraFeeChange(fee.id, 'includes', e.target.value)}
                              className="w-40 p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={fee.stdMin || 0}
                              onChange={(e) => handleExtraFeeChange(fee.id, 'stdMin', parseInt(e.target.value) || 0)}
                              className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="number"
                              value={fee.deepMin || 0}
                              onChange={(e) => handleExtraFeeChange(fee.id, 'deepMin', parseInt(e.target.value) || 0)}
                              className="w-16 p-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleExtraFee(fee.id)}
                              className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-wider transition ${
                                isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isActive ? '● Enabled' : 'Disabled'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section D: Room Pricing */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Room Pricing</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Set pricing and standard/deep times per room type.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Room Pricing')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={13} /> Save
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Studio / Base */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">🏢 Studio / Base</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Price ($)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.studio?.price || 120}
                          onChange={(e) => handleRoomConfigChange('studio', 'price', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Std (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.studio?.stdTime || 2}
                          onChange={(e) => handleRoomConfigChange('studio', 'stdTime', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Deep (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.studio?.deepTime || 3}
                          onChange={(e) => handleRoomConfigChange('studio', 'deepTime', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">Description</span>
                      <textarea
                        value={localSettings.roomPricing?.studio?.description || ''}
                        onChange={(e) => handleRoomConfigChange('studio', 'description', e.target.value)}
                        rows={1}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">What's Included</span>
                      <textarea
                        value={localSettings.roomPricing?.studio?.includes || ''}
                        onChange={(e) => handleRoomConfigChange('studio', 'includes', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bedroom */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">🛏️ Bedroom</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Price ($)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bedroom?.price || 60}
                          onChange={(e) => handleRoomConfigChange('bedroom', 'price', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Std (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bedroom?.stdTime || 60}
                          onChange={(e) => handleRoomConfigChange('bedroom', 'stdTime', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Deep (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bedroom?.deepTime || 75}
                          onChange={(e) => handleRoomConfigChange('bedroom', 'deepTime', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">Description</span>
                      <textarea
                        value={localSettings.roomPricing?.bedroom?.description || ''}
                        onChange={(e) => handleRoomConfigChange('bedroom', 'description', e.target.value)}
                        rows={1}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">What's Included</span>
                      <textarea
                        value={localSettings.roomPricing?.bedroom?.includes || ''}
                        onChange={(e) => handleRoomConfigChange('bedroom', 'includes', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bathroom */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">🚽 Bathroom</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Price ($)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bathroom?.price || 30}
                          onChange={(e) => handleRoomConfigChange('bathroom', 'price', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Std (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bathroom?.stdTime || 30}
                          onChange={(e) => handleRoomConfigChange('bathroom', 'stdTime', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400">Deep (Min)</span>
                        <input
                          type="number"
                          value={localSettings.roomPricing?.bathroom?.deepTime || 50}
                          onChange={(e) => handleRoomConfigChange('bathroom', 'deepTime', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">Description</span>
                      <textarea
                        value={localSettings.roomPricing?.bathroom?.description || ''}
                        onChange={(e) => handleRoomConfigChange('bathroom', 'description', e.target.value)}
                        rows={1}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400">What's Included</span>
                      <textarea
                        value={localSettings.roomPricing?.bathroom?.includes || ''}
                        onChange={(e) => handleRoomConfigChange('bathroom', 'includes', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-slate-200 rounded-xl text-xs font-medium bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section E: Deep Clean Surcharge */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Deep Clean Surcharge</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Additional charge for Deep Clean jobs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveAllSettings('Deep Surcharge')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
                >
                  <Save size={13} /> Save
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="surchargetype"
                      checked={localSettings.deepClean?.type === 'percent'}
                      onChange={() => setLocalSettings({
                        ...localSettings,
                        deepClean: { ...(localSettings.deepClean || { type: 'percent', value: 25 }), type: 'percent' }
                      })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Percentage (%)
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="surchargetype"
                      checked={localSettings.deepClean?.type === 'fixed'}
                      onChange={() => setLocalSettings({
                        ...localSettings,
                        deepClean: { ...(localSettings.deepClean || { type: 'percent', value: 25 }), type: 'fixed' }
                      })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Fixed Value ($)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Value</span>
                  <input
                    type="number"
                    value={localSettings.deepClean?.value || 25}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      deepClean: { ...(localSettings.deepClean || { type: 'percent', value: 25 }), value: parseInt(e.target.value) || 0 }
                    })}
                    className="w-20 p-2 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                  />
                </div>

                <div className="ml-auto text-xs font-black text-slate-700 bg-blue-50 text-blue-800 border border-blue-200 px-3.5 py-2 rounded-xl">
                  Preview: <span className="text-blue-600">Deep = Base + {localSettings.deepClean?.value || 25}{localSettings.deepClean?.type === 'percent' ? '%' : '$'}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Request Form Settings (Screenshots 4 and 5) */}
        {activeTab === 'request-form' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs max-w-2xl">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Request Form Settings</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure how the public booking request form estimates pricing for clients.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Pricing Method For Estimate</label>
                <select
                  value={localSettings.requestFormMethod || 'hour'}
                  onChange={(e) => setLocalSettings({ ...localSettings, requestFormMethod: e.target.value as any })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50 cursor-pointer"
                >
                  <option value="hour">By Hour</option>
                  <option value="sqft">By Sq Footage</option>
                  <option value="rooms">By Rooms</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Display Estimate As</label>
                <select
                  value={localSettings.requestFormDisplay || 'range'}
                  onChange={(e) => setLocalSettings({ ...localSettings, requestFormDisplay: e.target.value as any })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50 cursor-pointer"
                >
                  <option value="range">Range (e.g. $90-$120)</option>
                  <option value="fixed">Fixed Value</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAllSettings('Request Form')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Save size={14} /> Save Settings
            </button>
          </div>
        )}

        {/* Tab 4: Checklists (Custom interactive checklist manager) */}
        {activeTab === 'checklists' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs">
            
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">☑️ Service Checklists</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Configure standard and deep cleaning checklists required for each service tier.</p>
              </div>
              <button
                type="button"
                onClick={() => triggerSuccess('Checklists')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/15 flex items-center gap-2 uppercase tracking-wider"
              >
                <Save size={13} /> Save Checklists
              </button>
            </div>

            {/* Sub-tab horizontal header selector for checklist services */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl">
              {['House', 'Commercial', 'Move In/Out', 'Post-Const.', 'Upholstery', 'Carpet'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedChecklistService(type)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition ${
                    selectedChecklistService === type 
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'House' && '🏠 House'}
                  {type === 'Commercial' && '🏢 Commercial'}
                  {type === 'Move In/Out' && '🚚 Move In/Out'}
                  {type === 'Post-Const.' && '🏗️ Post-Const.'}
                  {type === 'Upholstery' && '🛋️ Upholstery'}
                  {type === 'Carpet' && '🌀 Carpet'}
                </button>
              ))}
            </div>

            {/* Checklist Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-4 pl-6">Item</th>
                    <th className="p-4 text-center w-28">Standard</th>
                    <th className="p-4 text-center w-28">Deep</th>
                    <th className="p-4 text-right pr-6 w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {checklists.filter(c => c.serviceType === selectedChecklistService).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                        No checklist items configured for {selectedChecklistService}. Add some below!
                      </td>
                    </tr>
                  ) : (
                    checklists.filter(c => c.serviceType === selectedChecklistService).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 pl-6 font-bold text-slate-900">{item.name}</td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.standard}
                            onChange={() => handleToggleChecklistField(item.id, 'standard')}
                            className="h-4.5 w-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mx-auto"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.deep}
                            onChange={() => handleToggleChecklistField(item.id, 'deep')}
                            className="h-4.5 w-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mx-auto"
                          />
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input row */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New checklist item description..."
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddChecklistItem();
                }}
                className="flex-1 p-3 border border-slate-200 rounded-xl outline-none font-semibold text-xs"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition shrink-0 uppercase tracking-wider"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Goals (Screenshot 6) */}
        {activeTab === 'goals' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs max-w-md">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">My Goals</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Set your weekly or monthly goals to track revenue and job progress on your dashboard.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Revenue Goal ($)</label>
                <input
                  type="number"
                  value={localSettings.goals?.revenue || 5000}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    goals: { ...(localSettings.goals || { revenue: 5000, jobs: 20 }), revenue: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Jobs Goal (#)</label>
                <input
                  type="number"
                  value={localSettings.goals?.jobs || 20}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    goals: { ...(localSettings.goals || { revenue: 5000, jobs: 20 }), jobs: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAllSettings('My Goals')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Save size={14} /> Save Goals
            </button>
          </div>
        )}

        {/* Tab 6: Notifications & Templates (Screenshot 7) */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-xs max-w-4xl">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Email Templates</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Customize the text sent in each email. Leave blank to use default template text.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Confirmation Email — Extra Message</label>
                <textarea
                  value={localSettings.confirmationText}
                  onChange={(e) => setLocalSettings({ ...localSettings, confirmationText: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50/50"
                  placeholder="e.g. Please make sure someone is home 10 minutes before the appointment."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Reminder 24H — Extra Message</label>
                <textarea
                  value={localSettings.reminderText24}
                  onChange={(e) => setLocalSettings({ ...localSettings, reminderText24: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50/50"
                  placeholder="e.g. Remember to leave access to the property."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Reminder 2H — Extra Message</label>
                <textarea
                  value={localSettings.reminderText2}
                  onChange={(e) => setLocalSettings({ ...localSettings, reminderText2: e.target.value })}
                  rows={3}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 bg-slate-50/50"
                  placeholder="e.g. Our team is on the way!"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveAllSettings('Email Templates')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Save size={14} /> Save Templates
            </button>
          </div>
        )}

        {/* Tab 7: My Hours (Screenshots 8 and 9) */}
        {activeTab === 'hours' && (
          <div className="space-y-6">

            {/* Section 1: WORK HOURS */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Work Hours</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Set up the default start and end times for each member, add extra available hours, or block specific dates.</p>
              </div>

              <div className="space-y-3">
                {/* Always include a default Myself if empty */}
                {(members.length === 0 ? [{ name: 'Myself', email: 'admin@bgrowth.com' }] : members).map((m) => {
                  const hours = localSettings.workHours?.[m.email] || { start: '08:00', end: '17:00' };

                  return (
                    <div key={m.email} className="flex flex-wrap items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">👤</span>
                        <div className="text-xs font-bold text-slate-900">
                          {m.name} <span className="text-[10px] text-slate-400 font-semibold">({m.email})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400">Start</span>
                          <input
                            type="time"
                            value={hours.start}
                            onChange={(e) => {
                              const nextWorkHours = {
                                ...(localSettings.workHours || {}),
                                [m.email]: { ...hours, start: e.target.value }
                              };
                              setLocalSettings({ ...localSettings, workHours: nextWorkHours });
                            }}
                            className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400">End</span>
                          <input
                            type="time"
                            value={hours.end}
                            onChange={(e) => {
                              const nextWorkHours = {
                                ...(localSettings.workHours || {}),
                                [m.email]: { ...hours, end: e.target.value }
                              };
                              setLocalSettings({ ...localSettings, workHours: nextWorkHours });
                            }}
                            className="p-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateMemberHours(m.email, hours.start, hours.end)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[10px] transition shadow-md shadow-blue-600/10 flex items-center gap-1.5 uppercase"
                        >
                          <Save size={11} /> Save
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: SPECIAL DAYS form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add rule card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Special Days</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Schedule exception dates like vacations or blocks.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">For Member</label>
                    <select
                      value={selectedMemberEmail}
                      onChange={(e) => setSelectedMemberEmail(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 cursor-pointer"
                    >
                      {(members.length === 0 ? [{ name: 'Myself', email: 'admin@bgrowth.com' }] : members).map(m => (
                        <option key={m.email} value={m.email}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                    <input
                      type="date"
                      value={specialDate}
                      onChange={(e) => setSpecialDate(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Start Time</label>
                      <input
                        type="time"
                        value={specialStart}
                        onChange={(e) => setSpecialStart(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">End Time</label>
                      <input
                        type="time"
                        value={specialEnd}
                        onChange={(e) => setSpecialEnd(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddSpecialDay('Extra')}
                      className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[10px] transition shadow-md shadow-blue-600/10 flex items-center justify-center gap-1 uppercase tracking-wider"
                    >
                      + Extra Hours
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleAddSpecialDay('Off')}
                      className="py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold rounded-xl text-[10px] transition flex items-center justify-center gap-1 uppercase tracking-wider"
                    >
                      🛑 Block Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Rules active list (Column 2 & 3) */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Rules</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active scheduling blocks and extra hours exceptions configured for your team.</p>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {specialRules.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl">
                      No special days exceptions configured currently.
                    </div>
                  ) : (
                    specialRules.map((rule) => {
                      const isBlocked = rule.type === 'Off';
                      const isExtra = rule.type === 'Extra';
                      const isPartial = rule.type === 'Partial';

                      return (
                        <div key={rule.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:shadow-xs transition">
                          <div className="flex items-center gap-3">
                            <span className="text-base">{isBlocked ? '🛑' : isExtra ? '⚡' : '⏳'}</span>
                            <div className="text-xs font-semibold text-slate-800">
                              <span className={`font-black ${isBlocked ? 'text-rose-600' : isExtra ? 'text-indigo-600' : 'text-amber-600'}`}>
                                {isBlocked ? 'Blocked' : isExtra ? 'Extra' : 'Partial'}
                              </span>
                              {' — '}
                              <span className="font-bold text-slate-900">{rule.date}</span>
                              {!isBlocked && ` ${rule.start} - ${rule.end}`}
                              <span className="text-slate-400 text-[10px] ml-1">({rule.memberEmail})</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
