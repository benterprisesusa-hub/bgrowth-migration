import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Search, 
  UserPlus, 
  ShieldAlert, 
  TrendingUp, 
  Coins, 
  Sparkles,
  Check, 
  Power, 
  ArrowRight,
  Plus,
  Trash2,
  X,
  CreditCard,
  Settings,
  Users,
  LayoutDashboard,
  Brush,
  Car,
  Truck,
  Edit2,
  FileText,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AppSettings } from '../types';

// Admin User definition matching Image 2
interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'owner' | 'member';
  apps: string;
  plan: 'Free' | 'Starter' | 'Pro' | 'Enterprise' | 'No Plan (apps only)';
  status: 'ACTIVE' | 'INACTIVE';
}

// Cleaning Category definition matching Image 3
interface GlobalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  color: string;
  appliesTo: 'both' | 'standard' | 'deep';
  active: boolean;
  showInPortal: boolean;
  requiresAddress: boolean;
  defaultDuration: number;
  displayOrder: number;
}

// Checklist Item definition matching Image 4
interface ChecklistItem {
  id: string;
  serviceType: string;
  name: string;
  standard: boolean;
  deep: boolean;
}

// Extra Fee definition matching Image 5
interface ExtraFee {
  id: string;
  emoji: string;
  name: string;
  suggestedPrice: number;
}

// Service Type definition matching Image 7
interface GlobalServiceType {
  id: string;
  name: string;
  emoji: string;
}

const INITIAL_ADMIN_USERS: AdminUser[] = [
  { email: 'benterprisesusa@gmail.com', name: 'Administrator', role: 'admin', apps: '—', plan: 'Enterprise', status: 'ACTIVE' },
  { email: 'agmosp46@gmail.com', name: 'Andreia Gomes', role: 'owner', apps: '—', plan: 'Enterprise', status: 'ACTIVE' },
  { email: 'andreiamagalhaes892@gmail.com', name: 'Teste', role: 'owner', apps: '—', plan: 'Pro', status: 'ACTIVE' },
  { email: 'editepgomes@gmail.com', name: 'Edite', role: 'member', apps: 'mileage', plan: 'Enterprise', status: 'ACTIVE' },
  { email: 'brunoppgomes@gmail.com', name: 'Bruno', role: 'member', apps: '—', plan: 'Enterprise', status: 'ACTIVE' },
  { email: 'malucasporsapatilhasof@gmail.com', name: 'andre', role: 'owner', apps: 'mileage', plan: 'Starter', status: 'ACTIVE' },
  { email: 'teste@teste.com', name: 'Teste', role: 'member', apps: 'cleaning', plan: 'Enterprise', status: 'ACTIVE' },
];

const INITIAL_CATEGORIES: GlobalCategory[] = [
  {
    id: 'cat_1',
    name: 'Teste',
    slug: 'teste',
    description: 'Global testing category for basic inspection lists',
    emoji: '🧹',
    color: '#0ea5e9',
    appliesTo: 'both',
    active: true,
    showInPortal: true,
    requiresAddress: true,
    defaultDuration: 120,
    displayOrder: 1
  }
];

const INITIAL_CHECKLISTS: ChecklistItem[] = [
  { id: 'chk_1', serviceType: 'House', name: 'Limpar poeira de superfícies e móveis', standard: true, deep: true },
  { id: 'chk_2', serviceType: 'House', name: 'Aspirar e passar pano nos pisos', standard: true, deep: true },
  { id: 'chk_3', serviceType: 'House', name: 'jj', standard: true, deep: true },
  { id: 'chk_4', serviceType: 'House', name: 'Limpar atrás da geladeira e fogão', standard: false, deep: true },
  { id: 'chk_5', serviceType: 'Commercial', name: 'Esvaziar lixeiras e higienizar recipientes', standard: true, deep: true },
  { id: 'chk_6', serviceType: 'Commercial', name: 'Limpar recepção e mesas de trabalho', standard: true, deep: false },
  { id: 'chk_7', serviceType: 'Move In/Out', name: 'Limpeza profunda de gavetas e armários vazios', standard: true, deep: true },
];

const INITIAL_EXTRA_FEES: ExtraFee[] = [
  { id: 'fee_1', emoji: '🧊', name: 'Inside the Fridge', suggestedPrice: 0.00 },
  { id: 'fee_2', emoji: '🔥', name: 'Inside the Oven', suggestedPrice: 0.00 },
  { id: 'fee_3', emoji: '🐾', name: 'Pets', suggestedPrice: 0.00 },
  { id: 'fee_4', emoji: '🚪', name: 'Inside Cabinets', suggestedPrice: 0.00 },
  { id: 'fee_5', emoji: '🔥', name: 'Inside the Oven (Deep)', suggestedPrice: 15.00 },
];

const INITIAL_SERVICES: GlobalServiceType[] = [
  { id: 'srv_1', name: 'House Cleaning', emoji: '🏠' },
  { id: 'srv_2', name: 'Commercial', emoji: '🏢' },
  { id: 'srv_3', name: 'Move In/Out', emoji: '🚚' },
  { id: 'srv_4', name: 'Post-Construction', emoji: '👷' },
  { id: 'srv_5', name: 'Upholstery', emoji: '🛋️' },
  { id: 'srv_6', name: 'Carpet Cleaning', emoji: '💧' },
];

interface AdminConsoleProps {
  settings: AppSettings;
  onUpdateGlobalModules: (modules: { cleaning: boolean; delivery: boolean; mileage: boolean }) => void;
  setActiveTab: (tab: string) => void;
}

export default function AdminConsole({ settings, onUpdateGlobalModules, setActiveTab, activeTab: externalTab }: AdminConsoleProps & { activeTab?: string }) {
  const tabMap: Record<string, 'overview' | 'users' | 'cleaning' | 'mileage-delivery' | 'settings'> = {
    'admin-overview': 'overview',
    'admin-users': 'users',
    'admin-cleaning': 'cleaning',
    'admin-mileage': 'mileage-delivery',
    'admin-settings': 'settings',
    'admin-console': 'overview',
  };
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'cleaning' | 'mileage-delivery' | 'settings'>(
    externalTab ? (tabMap[externalTab] || 'overview') : 'overview'
  );

  React.useEffect(() => {
    if (externalTab && tabMap[externalTab]) setAdminTab(tabMap[externalTab]);
  }, [externalTab]);

  // React State for all legacy screens
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [categories, setCategories] = useState<GlobalCategory[]>(INITIAL_CATEGORIES);
  const [checklists, setChecklists] = useState<ChecklistItem[]>(INITIAL_CHECKLISTS);
  const [extraFees, setExtraFees] = useState<ExtraFee[]>(INITIAL_EXTRA_FEES);  const [services, setServices] = useState<GlobalServiceType[]>(INITIAL_SERVICES);

  // Users Tab Add User State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'owner' | 'member'>('owner');
  const [newPlan, setNewPlan] = useState<'Free' | 'Starter' | 'Pro' | 'Enterprise' | 'No Plan (apps only)'>('Enterprise');
  const [newIndividualApps, setNewIndividualApps] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Cleaning Tab horizontal sub-navigation
  // Value: 'checklist-categories' | 'checklist' | 'extra-fees' | 'receipt' | 'service-types'
  const [cleaningSubTab, setCleaningSubTab] = useState<'checklist-categories' | 'checklist' | 'extra-fees' | 'receipt' | 'service-types'>('checklist-categories');

  // Checklist categories form state
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catEmoji, setCatEmoji] = useState('🧹');
  const [catColor, setCatColor] = useState('#0ea5e9');
  const [catApplies, setCatApplies] = useState<'both' | 'standard' | 'deep'>('both');
  const [catActive, setCatActive] = useState(true);
  const [catShowInPortal, setCatShowInPortal] = useState(true);
  const [catRequiresAddress, setCatRequiresAddress] = useState(true);
  const [catDuration, setCatDuration] = useState(120);
  const [catOrder, setCatOrder] = useState(1);

  // Checklist service type state
  const [selectedServiceType, setSelectedServiceType] = useState('House');
  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  // Extra Fees Form State
  const [feeEmoji, setFeeEmoji] = useState('🧊');
  const [feeName, setFeeName] = useState('');
  const [feePrice, setFeePrice] = useState(0);

  // Receipt form state
  const [footerMsg, setFooterMsg] = useState('Thank you for choosing our service!');
  const [thankYouMsg, setThankYouMsg] = useState('We look forward to serving you again!');

  // Service Type form state
  const [srvEmoji, setSrvEmoji] = useState('🧹');
  const [srvName, setSrvName] = useState('');

  // Mileage & Delivery lists state
  const [mileagePlatforms, setMileagePlatforms] = useState<string[]>(['Uber', 'Lyft', 'Amazon Flex', 'DoorDash', 'Personal', 'Other']);
  const [newMilPlatform, setNewMilPlatform] = useState('');
  const [mileageCostCategories, setMileageCostCategories] = useState<string[]>(['Gas', 'Insurance', 'Maintenance', 'Car Payment', 'Depreciation', 'Other']);
  const [newMilCostCat, setNewMilCostCat] = useState('');
  const [deliveryApps, setDeliveryApps] = useState<string[]>(['DoorDash', 'Uber Eats', 'Instacart', 'Amazon Flex', 'Grubhub', 'Shipt', 'Other']);
  const [newDelApp, setNewDelApp] = useState('');

  // Platform settings state
  const [maxMembers, setMaxMembers] = useState(6);
  const [mileageRate, setMileageRate] = useState(0.725);
  const [proOnDemand, setProOnDemand] = useState(1);
  const [entOnDemand, setEntOnDemand] = useState(2);

  // Dynamic Metrics for Overview Tab
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const totalAccounts = users.filter(u => u.role === 'owner').length;
  const totalMembers = users.filter(u => u.role === 'member').length;

  const planCounts = {
    Free: users.filter(u => u.plan === 'Free').length,
    Starter: users.filter(u => u.plan === 'Starter').length,
    Pro: users.filter(u => u.plan === 'Pro').length,
    Enterprise: users.filter(u => u.plan === 'Enterprise').length,
  };

  // HANDLERS

  // User list actions
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    const newUser: AdminUser = {
      email: newEmail,
      name: newName,
      role: newRole,
      apps: newIndividualApps || '—',
      plan: newPlan,
      status: 'ACTIVE'
    };
    setUsers([...users, newUser]);
    setNewEmail('');
    setNewName('');
    setNewRole('owner');
    setNewPlan('Enterprise');
    setNewIndividualApps('');
  };

  const handleToggleUserStatus = (email: string) => {
    setUsers(users.map(u => u.email === email ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
  };

  const handleUpdateUserPlan = (email: string, plan: AdminUser['plan']) => {
    setUsers(users.map(u => u.email === email ? { ...u, plan } : u));
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Tem certeza que deseja remover o usuário ${email}?`)) {
      setUsers(users.filter(u => u.email !== email));
    }
  };

  // Cleaning Checklist Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    const newCat: GlobalCategory = {
      id: `cat_${Date.now()}`,
      name: catName,
      slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catDesc,
      emoji: catEmoji,
      color: catColor,
      appliesTo: catApplies,
      active: catActive,
      showInPortal: catShowInPortal,
      requiresAddress: catRequiresAddress,
      defaultDuration: Number(catDuration),
      displayOrder: Number(catOrder)
    };
    setCategories([...categories, newCat]);
    // Reset form
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatEmoji('🧹');
    setCatColor('#0ea5e9');
    setCatApplies('both');
    setCatActive(true);
    setCatShowInPortal(true);
    setCatRequiresAddress(true);
    setCatDuration(120);
    setCatOrder(1);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  // Checklist Items Handlers
  const handleAddChecklistItem = () => {
    if (!newChecklistItemText) return;
    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      serviceType: selectedServiceType,
      name: newChecklistItemText,
      standard: true,
      deep: true
    };
    setChecklists([...checklists, newItem]);
    setNewChecklistItemText('');
  };

  const handleToggleChecklistField = (id: string, field: 'standard' | 'deep') => {
    setChecklists(checklists.map(c => c.id === id ? { ...c, [field]: !c[field] } : c));
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklists(checklists.filter(c => c.id !== id));
  };

  const handleSaveChecklist = () => {
    alert('As alterações da lista de verificação (checklist) foram salvas com sucesso em memória!');
  };

  // Extra Fees Handlers
  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName) return;
    const newFee: ExtraFee = {
      id: `fee_${Date.now()}`,
      emoji: feeEmoji,
      name: feeName,
      suggestedPrice: Number(feePrice)
    };
    setExtraFees([...extraFees, newFee]);
    setFeeEmoji('🧊');
    setFeeName('');
    setFeePrice(0);
  };

  const handleDeleteFee = (id: string) => {
    setExtraFees(extraFees.filter(f => f.id !== id));
  };

  // Service types handlers
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName) return;
    const newSrv: GlobalServiceType = {
      id: `srv_${Date.now()}`,
      name: srvName,
      emoji: srvEmoji
    };
    setServices([...services, newSrv]);
    setSrvName('');
    setSrvEmoji('🧹');
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Receipt Template saver
  const handleSaveReceiptTemplate = () => {
    alert('Modelo de recibo global salvo com sucesso!');
  };

  // Save specific settings
  const handleSaveSetting = (label: string, val: any) => {
    alert(`Configuração "${label}" salva com sucesso com o valor: ${val}`);
  };

  // Filter Users
  const filteredUsers = users.filter(u => {
    return u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
           u.name.toLowerCase().includes(userSearch.toLowerCase());
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* LEFT ADMIN SIDEBAR - Replicating exactly the design from the screenshots */}

      {/* RIGHT SIDE MAIN PANEL - LIGHT BG */}
      <section className="bg-slate-50 p-6 md:p-8 space-y-6">

        {/* Super Admin Header Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-sky-100 text-sky-800 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                SaaS Super Control
              </span>
              <span className="text-slate-400 text-xs font-bold font-mono">BGrowth Club</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-1">
              {adminTab === 'overview' && 'Dashboard Overview'}
              {adminTab === 'users' && 'Users Directory'}
              {adminTab === 'cleaning' && 'Cleaning Business Global Core'}
              {adminTab === 'mileage-delivery' && 'Mileage & Delivery Logistics'}
              {adminTab === 'settings' && 'System Parameters'}
            </h2>
          </div>
          <span className="bg-slate-200/60 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Admin Mode
          </span>
        </div>

        {/* TAB CONTENT 1: OVERVIEW (Dashboard) */}
        {adminTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Welcome Banner from Image 1 */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
                <ShieldAlert size={200} className="text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">BGROWTH CLUB — PLATFORM OVERVIEW</span>
                <h1 className="text-2xl font-black tracking-tight text-white mt-1">Welcome back, Administrator 👋</h1>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Manage your platform users, modules and settings</p>
              </div>
            </div>

            {/* Metrics cards from Image 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs text-center space-y-1">
                <h3 className="text-3xl font-black text-slate-900">{totalUsers}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TOTAL USERS</span>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs text-center space-y-1">
                <h3 className="text-3xl font-black text-green-600">{activeUsers}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ACTIVE</span>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs text-center space-y-1">
                <h3 className="text-3xl font-black text-slate-900">{totalAccounts}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">ACCOUNTS</span>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs text-center space-y-1">
                <h3 className="text-3xl font-black text-slate-900">{totalMembers}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">TEAM MEMBERS</span>
              </div>
            </div>

            {/* Users by Plan display matching Image 1 */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">USERS BY PLAN</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Free Plan */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">FREE</span>
                    <h5 className="text-2xl font-black text-slate-900">{planCounts.Free}</h5>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-300" />
                </div>

                {/* Starter Plan */}
                <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-sky-500 uppercase">STARTER</span>
                    <h5 className="text-2xl font-black text-sky-900">{planCounts.Starter}</h5>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500" />
                </div>

                {/* Pro Plan */}
                <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-amber-500 uppercase">PRO</span>
                    <h5 className="text-2xl font-black text-slate-900">{planCounts.Pro}</h5>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                {/* Enterprise Plan */}
                <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 shadow-xs relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-purple-500 uppercase">ENTERPRISE</span>
                    <h5 className="text-2xl font-black text-slate-900">{planCounts.Enterprise}</h5>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
                </div>

              </div>
            </div>

            {/* Recent Users table from Image 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50/60 border-b border-slate-100">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">RECENT USERS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="p-4">Email</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/40 transition">
                        <td className="p-4 font-semibold text-slate-900 font-mono">{u.email}</td>
                        <td className="p-4 text-slate-700 font-semibold">{u.name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            u.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                            u.plan === 'Pro' ? 'bg-amber-100 text-amber-700' :
                            u.plan === 'Starter' ? 'bg-sky-100 text-sky-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: USERS (Admin Users Panel) */}
        {adminTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Add New User Widget matching Image 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <UserPlus size={14} />
                + Add New User
              </h3>
              
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Email field */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase text-[9px]">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full font-semibold p-3 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>

                {/* Name field */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase text-[9px]">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full font-semibold p-3 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>

                {/* Plan dropdown */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase text-[9px]">Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e: any) => setNewPlan(e.target.value)}
                    className="w-full font-semibold p-3 border border-slate-200 rounded-2xl outline-none bg-slate-50/50 focus:border-sky-500"
                  >
                    <option value="No Plan (apps only)">— No Plan (apps only) —</option>
                    <option value="Free">Free</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Role field */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-500 uppercase text-[9px]">Role type</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full font-semibold p-3 border border-slate-200 rounded-2xl outline-none bg-slate-50/50 focus:border-sky-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="owner">Business Owner</option>
                    <option value="member">Staff Member / Worker</option>
                  </select>
                </div>

                {/* Apps list field */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-extrabold text-slate-500 uppercase text-[9px]">Individual Apps (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. cleaning, mileage, notary..."
                    value={newIndividualApps}
                    onChange={(e) => setNewIndividualApps(e.target.value)}
                    className="w-full font-semibold p-3 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-50/50"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Add User
                  </button>
                </div>

              </form>
            </div>

            {/* All Users directory table matching Image 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4 p-5">
              
              {/* Header filter row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">All Users ({filteredUsers.length})</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl w-full md:w-64">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="bg-transparent text-xs outline-none font-semibold text-slate-800 w-full"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="text-slate-400 hover:text-slate-600">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Email</th>
                      <th className="p-4">Name</th>
                      <th className="p-4 text-center">Role</th>
                      <th className="p-4 text-center">Apps</th>
                      <th className="p-4 text-center">Plan</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 transition">
                        <td className="p-4 font-semibold text-slate-900 font-mono">{u.email}</td>
                        <td className="p-4 font-semibold text-slate-700">{u.name}</td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-100 text-slate-700 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-500 font-semibold">{u.apps}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            u.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                            u.plan === 'Pro' ? 'bg-amber-100 text-amber-700' :
                            u.plan === 'Starter' ? 'bg-sky-100 text-sky-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Inline Plan Changer Selector */}
                            <select
                              value={u.plan}
                              onChange={(e: any) => handleUpdateUserPlan(u.email, e.target.value)}
                              className="text-[10px] font-bold p-1 bg-white border border-slate-200 rounded outline-none focus:border-indigo-500"
                            >
                              <option value="Enterprise">Enterprise</option>
                              <option value="Pro">Pro</option>
                              <option value="Starter">Starter</option>
                              <option value="Free">Free</option>
                              <option value="No Plan (apps only)">No Plan</option>
                            </select>

                            {/* Status toggle button */}
                            <button
                              onClick={() => handleToggleUserStatus(u.email)}
                              title="Toggle Active Status"
                              className={`px-2 py-1 rounded text-[10px] font-black transition uppercase ${
                                u.status === 'ACTIVE' 
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200' 
                                  : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? 'Off' : 'On'}
                            </button>

                            {/* Edit indicator */}
                            <button 
                              onClick={() => {
                                setNewEmail(u.email);
                                setNewName(u.name);
                                setNewRole(u.role);
                                setNewPlan(u.plan);
                                setNewIndividualApps(u.apps !== '—' ? u.apps : '');
                              }}
                              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                              title="Load into Form"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Trash button */}
                            <button
                              onClick={() => handleDeleteUser(u.email)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Delete User"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT 3: CLEANING MODULE SETTINGS (With 5 Sub-tabs) */}
        {adminTab === 'cleaning' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* 5 Horizontal Sub-Tabs matching Image 3 */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 bg-white p-2 rounded-2xl">
              <button
                onClick={() => setCleaningSubTab('checklist-categories')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  cleaningSubTab === 'checklist-categories' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📁 Checklist Categories
              </button>
              <button
                onClick={() => setCleaningSubTab('checklist')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  cleaningSubTab === 'checklist' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✅ Checklist
              </button>
              <button
                onClick={() => setCleaningSubTab('extra-fees')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  cleaningSubTab === 'extra-fees' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ➕ Extra Fees
              </button>
              <button
                onClick={() => setCleaningSubTab('receipt')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  cleaningSubTab === 'receipt' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                📄 Receipt
              </button>
              <button
                onClick={() => setCleaningSubTab('service-types')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  cleaningSubTab === 'service-types' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🔧 Service Types
              </button>
            </div>

            {/* Sub-tab A: Checklist Categories */}
            {cleaningSubTab === 'checklist-categories' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Global Categories List */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      📁 Global Categories
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">Categories available to all owners. Click to manage items.</p>
                  </div>

                  <div className="space-y-2.5">
                    {categories.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold text-center py-6">No global categories added yet.</p>
                    ) : (
                      categories.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <span className="text-xl bg-white p-2 rounded-xl shadow-xs border border-slate-100">{c.emoji}</span>
                            <div>
                              <span className="font-extrabold text-slate-950 block text-xs">{c.name}</span>
                              <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono block">Slug: {c.slug}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-extrabold text-[9px] uppercase">
                              {c.appliesTo}
                            </span>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Add New Category Form matching Image 3 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wide">+ Add New Category</h3>
                    <p className="text-[9px] text-slate-400 font-bold">Create a new checklist category</p>
                  </div>

                  <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Category Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kitchen"
                          value={catName}
                          onChange={(e) => {
                            setCatName(e.target.value);
                            setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                          }}
                          className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold bg-slate-50/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Slug *</label>
                        <input
                          type="text"
                          required
                          placeholder="Auto-generated"
                          value={catSlug}
                          onChange={(e) => setCatSlug(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold bg-slate-50/30"
                        />
                        <span className="text-[8px] text-slate-400 block font-semibold leading-none">Auto-generated from name</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">Description</label>
                      <textarea
                        placeholder="Enter category description..."
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold bg-slate-50/30 h-16 resize-none"
                      />
                    </div>

                    {/* Emoji selection matching Image 3 */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px] block">Emoji Icon</label>
                      <div className="grid grid-cols-8 gap-1 p-2 border border-slate-100 bg-slate-50/40 rounded-xl">
                        {['🧹', '🏠', '🏢', '🧼', '🚰', '📅', '🗑️', '🪴', '🍼', '🚪', '🛋️', '💧', '🧱', '⭐', '✔️'].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setCatEmoji(em)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition ${
                              catEmoji === em ? 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-300' : 'hover:bg-slate-100'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Or Type Emoji:</span>
                        <input
                          type="text"
                          maxLength={2}
                          value={catEmoji}
                          onChange={(e) => setCatEmoji(e.target.value)}
                          className="w-12 p-1.5 border border-slate-200 rounded-lg font-black text-center text-xs"
                        />
                      </div>
                    </div>

                    {/* Color selection matching Image 3 */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px] block">Color Theme</label>
                      <div className="flex items-center gap-2 p-1">
                        {['#0ea5e9', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#64748b'].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setCatColor(col)}
                            style={{ backgroundColor: col }}
                            className={`w-6 h-6 rounded-full transition relative shrink-0 ${
                              catColor === col ? 'ring-2 ring-slate-900 ring-offset-2' : ''
                            }`}
                          >
                            {catColor === col && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Applies to Radios matching Image 3 */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px] block">Applies To</label>
                      <div className="flex items-center gap-4 p-1">
                        <label className="flex items-center gap-1.5 font-bold text-slate-700">
                          <input
                            type="radio"
                            name="appliesTo"
                            checked={catApplies === 'both'}
                            onChange={() => setCatApplies('both')}
                            className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                          />
                          Both
                        </label>
                        <label className="flex items-center gap-1.5 font-bold text-slate-700">
                          <input
                            type="radio"
                            name="appliesTo"
                            checked={catApplies === 'standard'}
                            onChange={() => setCatApplies('standard')}
                            className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                          />
                          Standard only
                        </label>
                        <label className="flex items-center gap-1.5 font-bold text-slate-700">
                          <input
                            type="radio"
                            name="appliesTo"
                            checked={catApplies === 'deep'}
                            onChange={() => setCatApplies('deep')}
                            className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                          />
                          Deep only
                        </label>
                      </div>
                    </div>

                    {/* Settings Toggles matching Image 3 */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-400 uppercase text-[8px] block tracking-wider">SETTINGS</label>
                      
                      {/* Active toggle */}
                      <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span>Active</span>
                        <button
                          type="button"
                          onClick={() => setCatActive(!catActive)}
                          className="text-slate-500"
                        >
                          {catActive ? <ToggleRight size={30} className="text-sky-500" /> : <ToggleLeft size={30} />}
                        </button>
                      </div>

                      {/* Show in client portal */}
                      <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span>Show in Client Portal</span>
                        <button
                          type="button"
                          onClick={() => setCatShowInPortal(!catShowInPortal)}
                          className="text-slate-500"
                        >
                          {catShowInPortal ? <ToggleRight size={30} className="text-sky-500" /> : <ToggleLeft size={30} />}
                        </button>
                      </div>

                      {/* Requires Address */}
                      <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span>Requires Address</span>
                        <button
                          type="button"
                          onClick={() => setCatRequiresAddress(!catRequiresAddress)}
                          className="text-slate-500"
                        >
                          {catRequiresAddress ? <ToggleRight size={30} className="text-sky-500" /> : <ToggleLeft size={30} />}
                        </button>
                      </div>
                    </div>

                    {/* Default Duration & Order matching Image 3 */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Default Duration (Min)</label>
                        <input
                          type="number"
                          value={catDuration}
                          onChange={(e) => setCatDuration(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[9px]">Display Order</label>
                        <input
                          type="number"
                          value={catOrder}
                          onChange={(e) => setCatOrder(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl outline-none font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition"
                    >
                      + Add Category
                    </button>

                  </form>
                </div>

              </div>
            )}

            {/* Sub-tab B: Checklist builder matching Image 4 */}
            {cleaningSubTab === 'checklist' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    🛠️ Checklist per Service Type
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Default checklist items for each service type.</p>
                </div>

                {/* Sub-tab horizontal header selector for service types */}
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl">
                  {['House', 'Commercial', 'Move In/Out', 'Post-Const.', 'Upholstery', 'Carpet'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedServiceType(type)}
                      className={`px-4 py-2 text-xs font-extrabold rounded-xl transition ${
                        selectedServiceType === type 
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

                {/* Checklist table from Image 4 */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-4 pl-6">Item</th>
                        <th className="p-4 text-center w-24">Standard</th>
                        <th className="p-4 text-center w-24">Deep</th>
                        <th className="p-4 text-right pr-6 w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {checklists.filter(c => c.serviceType === selectedServiceType).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                            Nenhum item na lista de verificação cadastrado para {selectedServiceType}.
                          </td>
                        </tr>
                      ) : (
                        checklists.filter(c => c.serviceType === selectedServiceType).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/40 transition">
                            <td className="p-4 pl-6 font-semibold text-slate-900">{item.name}</td>
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={item.standard}
                                onChange={() => handleToggleChecklistField(item.id, 'standard')}
                                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mx-auto"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={item.deep}
                                onChange={() => handleToggleChecklistField(item.id, 'deep')}
                                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mx-auto"
                              />
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button
                                onClick={() => handleDeleteChecklistItem(item.id)}
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Input row matching Image 4 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New checklist item..."
                    value={newChecklistItemText}
                    onChange={(e) => setNewChecklistItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddChecklistItem();
                    }}
                    className="flex-1 p-3 border border-slate-200 rounded-xl outline-none font-semibold text-xs"
                  />
                  <button
                    onClick={handleAddChecklistItem}
                    className="px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Save checklist button matching Image 4 */}
                <div className="pt-2">
                  <button
                    onClick={handleSaveChecklist}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                  >
                    💾 Save Checklist
                  </button>
                </div>

              </div>
            )}

            {/* Sub-tab C: Extra Fees matching Image 5 */}
            {cleaningSubTab === 'extra-fees' && (
              <div className="space-y-6">
                
                {/* Global fee list */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      ➕ Extra Fees (Global)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">Fees available to all owners. Each owner sets their own price.</p>
                  </div>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="p-4 pl-6">Fee</th>
                          <th className="p-4">Suggested Price</th>
                          <th className="p-4 text-right pr-6 w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {extraFees.map((fee) => (
                          <tr key={fee.id} className="hover:bg-slate-50/40 transition">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{fee.emoji}</span>
                                <span className="font-semibold text-slate-900">{fee.name}</span>
                              </div>
                            </td>
                            <td className="p-4 font-black font-mono text-indigo-600">
                              ${fee.suggestedPrice.toFixed(2)}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button
                                onClick={() => handleDeleteFee(fee.id)}
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add fee form matching Image 5 */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">ADD NEW GLOBAL EXTRA FEE</h4>
                  <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">EMOJI</label>
                      <input
                        type="text"
                        required
                        value={feeEmoji}
                        onChange={(e) => setFeeEmoji(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-bold text-center text-lg bg-slate-50/40"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">FEE NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Inside the Fridge"
                        value={feeName}
                        onChange={(e) => setFeeName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold bg-slate-50/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">SUGGESTED PRICE ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={feePrice}
                        onChange={(e) => setFeePrice(Number(e.target.value))}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-bold bg-slate-50/40"
                      />
                    </div>

                    <div className="md:col-span-4 pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition"
                      >
                        + Add Fee
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            )}

            {/* Sub-tab D: Receipt template matching Image 6 */}
            {cleaningSubTab === 'receipt' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    📄 Default Receipt Template
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Default footer shown on all receipts when owner hasn't customized.</p>
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] block">FOOTER MESSAGE</label>
                    <textarea
                      value={footerMsg}
                      onChange={(e) => setFooterMsg(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-2xl outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] block">THANK YOU MESSAGE</label>
                    <input
                      type="text"
                      value={thankYouMsg}
                      onChange={(e) => setThankYouMsg(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-2xl outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveReceiptTemplate}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5"
                    >
                      💾 Save Template
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* Sub-tab E: Service Types matching Image 7 */}
            {cleaningSubTab === 'service-types' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    🔧 Service Types
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Service types available in the Cleaning module.</p>
                </div>

                {/* Service Types List */}
                <div className="space-y-2">
                  {services.map((srv) => (
                    <div key={srv.id} className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{srv.emoji}</span>
                        <span className="font-extrabold text-slate-800 text-xs">{srv.name}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Service type creator form */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Service Type</h4>
                  <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">EMOJI ICON</label>
                      <input
                        type="text"
                        required
                        value={srvEmoji}
                        onChange={(e) => setSrvEmoji(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-bold text-center text-lg"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="font-bold text-slate-500 uppercase text-[9px]">SERVICE NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Window Cleaning"
                        value={srvName}
                        onChange={(e) => setSrvName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition"
                      >
                        + Add Service Type
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB CONTENT 4: MILEAGE & DELIVERY LOGISTICS (Matching Image 8) */}
        {adminTab === 'mileage-delivery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            
            {/* Left Column: Platforms & Cost Categories */}
            <div className="space-y-6">
              
              {/* Card 1: Mileage Platforms */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    🚗 Mileage — Platforms
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold">Platforms available when logging trips.</p>
                </div>

                <div className="space-y-1">
                  {mileagePlatforms.map((plat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs font-semibold">
                      <span>{plat}</span>
                      <button
                        onClick={() => setMileagePlatforms(mileagePlatforms.filter(p => p !== plat))}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Uber, Amazon Flex..."
                    value={newMilPlatform}
                    onChange={(e) => setNewMilPlatform(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMilPlatform) {
                        setMileagePlatforms([...mileagePlatforms, newMilPlatform]);
                        setNewMilPlatform('');
                      }
                    }}
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      if (newMilPlatform) {
                        setMileagePlatforms([...mileagePlatforms, newMilPlatform]);
                        setNewMilPlatform('');
                      }
                    }}
                    className="px-3 bg-indigo-600 text-white font-extrabold text-xs rounded-xl transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Card 2: Mileage Cost Categories */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    💰 Mileage — Cost Categories
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold">Cost categories in Mileage Performance tab.</p>
                </div>

                <div className="space-y-1">
                  {mileageCostCategories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs font-semibold">
                      <span>{cat}</span>
                      <button
                        onClick={() => setMileageCostCategories(mileageCostCategories.filter(c => c !== cat))}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Insurance, Maintenance..."
                    value={newMilCostCat}
                    onChange={(e) => setNewMilCostCat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMilCostCat) {
                        setMileageCostCategories([...mileageCostCategories, newMilCostCat]);
                        setNewMilCostCat('');
                      }
                    }}
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      if (newMilCostCat) {
                        setMileageCostCategories([...mileageCostCategories, newMilCostCat]);
                        setNewMilCostCat('');
                      }
                    }}
                    className="px-3 bg-indigo-600 text-white font-extrabold text-xs rounded-xl transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Delivery Apps & Plan Limits Table */}
            <div className="space-y-6">
              
              {/* Card 3: Delivery Apps */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    📦 Delivery — Apps & Stores
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold">Apps and stores available when logging batches.</p>
                </div>

                <div className="space-y-1">
                  {deliveryApps.map((app, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs font-semibold">
                      <span>{app}</span>
                      <button
                        onClick={() => setDeliveryApps(deliveryApps.filter(a => a !== app))}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DoorDash, Uber Eats..."
                    value={newDelApp}
                    onChange={(e) => setNewDelApp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDelApp) {
                        setDeliveryApps([...deliveryApps, newDelApp]);
                        setNewDelApp('');
                      }
                    }}
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      if (newDelApp) {
                        setDeliveryApps([...deliveryApps, newDelApp]);
                        setNewDelApp('');
                      }
                    }}
                    className="px-3 bg-indigo-600 text-white font-extrabold text-xs rounded-xl transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Card 4: Module Limits by Plan */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    📋 Module Limits by Plan
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold font-mono">Plan limits parameters matrix</p>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-[11px] font-bold">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="p-3">Plan</th>
                        <th className="p-3 text-center">Records</th>
                        <th className="p-3 text-center">CSV</th>
                        <th className="p-3 text-center">PDF</th>
                        <th className="p-3 text-center">Charts</th>
                        <th className="p-3 text-center">Team</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="p-3 font-bold text-slate-400">FREE</td>
                        <td className="p-3 text-center font-mono">0</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-sky-500">STARTER</td>
                        <td className="p-3 text-center font-mono">150</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-500">PRO</td>
                        <td className="p-3 text-center font-mono">∞</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-red-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-purple-500">ENTERPRISE</td>
                        <td className="p-3 text-center font-mono">∞</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                        <td className="p-3 text-center text-green-500">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT 5: SYSTEM SETTINGS (Matching Image 9) */}
        {adminTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            
            {/* Left Column: Platform Settings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  ⚙️ Platform Settings
                </h3>
                <p className="text-[10px] text-slate-400 font-bold">Global SaaS operation constants</p>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Setting 1 */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block text-xs">Max Team Members (Enterprise)</span>
                    <span className="text-[9px] text-slate-400 font-bold block">Including account owner</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(Number(e.target.value))}
                      className="w-16 p-2 text-center border border-slate-200 rounded-xl font-bold bg-white outline-none"
                    />
                    <button
                      onClick={() => handleSaveSetting('Max Team Members (Enterprise)', maxMembers)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Setting 2 */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block text-xs">🚗 IRS Mileage Rate</span>
                    <span className="text-[9px] text-slate-400 font-bold block">Global rate used by all modules ($/mile)</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden px-1 w-20">
                      <span className="text-slate-400 font-bold pl-1">$</span>
                      <input
                        type="number"
                        step="0.001"
                        value={mileageRate}
                        onChange={(e) => setMileageRate(Number(e.target.value))}
                        className="w-full p-2 text-right font-bold outline-none border-none"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveSetting('IRS Mileage Rate', mileageRate)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Setting 3 */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block text-xs">Pro — Max On Demand Members</span>
                    <span className="text-[9px] text-slate-400 font-bold block">On demand access slots for Pro plan</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={proOnDemand}
                      onChange={(e) => setProOnDemand(Number(e.target.value))}
                      className="w-16 p-2 text-center border border-slate-200 rounded-xl font-bold bg-white outline-none"
                    />
                    <button
                      onClick={() => handleSaveSetting('Pro — Max On Demand Members', proOnDemand)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Setting 4 */}
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 block text-xs">Enterprise — Max On Demand Members</span>
                    <span className="text-[9px] text-slate-400 font-bold block">On demand access slots for Enterprise plan</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={entOnDemand}
                      onChange={(e) => setEntOnDemand(Number(e.target.value))}
                      className="w-16 p-2 text-center border border-slate-200 rounded-xl font-bold bg-white outline-none"
                    />
                    <button
                      onClick={() => handleSaveSetting('Enterprise — Max On Demand Members', entOnDemand)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-xl transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* App Version */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50/20 rounded-2xl border border-slate-200 border-dashed">
                  <span className="font-bold text-slate-600">App Version</span>
                  <span className="font-black text-slate-900 font-mono">v1.0.0</span>
                </div>

              </div>

            </div>

            {/* Right Column: Admin Accounts Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  🔒 Admin Accounts
                </h3>
                <p className="text-[10px] text-slate-400 font-bold font-mono">Authentication & super admin configuration rules</p>
              </div>

              {/* Box replicating the exact instructions from Image 9 */}
              <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl space-y-3">
                <span className="text-xl">⚠️</span>
                <p className="text-xs text-sky-950 font-bold leading-relaxed">
                  Admin emails are configured in <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-black">Codigo.gs</code> inside the <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-black">ADMIN_EMAILS</code> array. Redeploy after any changes.
                </p>
                <div className="text-[10px] text-sky-800 font-semibold leading-relaxed pt-2 border-t border-sky-100">
                  No ambiente de simulação SaaS da BGrowth, qualquer alteração e validação de conta é refletida em tempo real instantaneamente, sem custos e sem complicação de deploy!
                </div>
              </div>

            </div>

          </div>
        )}

      </section>

    </div>
  );
}
