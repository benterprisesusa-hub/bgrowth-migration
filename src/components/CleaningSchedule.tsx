import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle2, 
  X, 
  XCircle, 
  AlertCircle,
  Users,
  Briefcase,
  HelpCircle,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { JobOffer, AppSettings, TeamMember, Client } from '../types';

interface CleaningScheduleProps {
  offers: JobOffer[];
  settings: AppSettings;
  members: TeamMember[];
  clients: Client[];
  onCreateOffer: (offer: JobOffer) => void;
  onCancelOffer: (offerId: string) => void;
  onAssignWorker: (offerId: string, email: string, name: string) => void;
  onUpdateJobStatus?: (jobId: string, status: 'open' | 'assigned' | 'expired' | 'cancelled' | 'done') => void;
}

type TabType = 'day' | 'week' | 'month';

export default function CleaningSchedule({
  offers,
  settings,
  members,
  clients,
  onCreateOffer,
  onCancelOffer,
  onAssignWorker,
  onUpdateJobStatus
}: CleaningScheduleProps) {
  
  // Date states - centered around 2026-07-02 to match mock data
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 2)); // July 2, 2026
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('week');

  // Mini-calendar month/year tracking
  const [miniCalDate, setMiniCalDate] = useState<Date>(new Date(2026, 6, 1)); // July 2026

  // New job state variables
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  
  const [jobTitle, setJobTitle] = useState('');
  const [jobDate, setJobDate] = useState('2026-07-02');
  const [jobTime, setJobTime] = useState('09:00');
  const [serviceType, setServiceType] = useState('house');
  const [cleanType, setCleanType] = useState<'standard' | 'deep'>('standard');
  const [pricingMethod, setPricingMethod] = useState<'hour' | 'sqft' | 'rooms'>('hour');
  
  // Pricing parameters
  const [duration, setDuration] = useState(3);
  const [sqft, setSqft] = useState(1200);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [overridePrice, setOverridePrice] = useState(false);

  // Staff and dispatch settings
  const [assignedCleaner, setAssignedCleaner] = useState<string>('');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Synchronize base pricing method with settings on load
  useEffect(() => {
    if (settings) {
      setPricingMethod(settings.requestFormMethod || 'hour');
    }
  }, [settings]);

  // Date converters / formatters
  const formatDateToISO = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseISOToDate = (isoStr: string): Date => {
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateToLocale = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const selectedDateISO = formatDateToISO(selectedDate);

  // Get start of week (Sunday) for a given date
  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Generate 7 days of the active week
  const getActiveWeekDays = (): Date[] => {
    const sunday = getStartOfWeek(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getActiveWeekDays();
  const startOfWeekISO = formatDateToISO(weekDays[0]);
  const endOfWeekISO = formatDateToISO(weekDays[6]);

  // Handle previous/next navigating depending on the active tab
  const handlePrevRange = () => {
    const nextDate = new Date(selectedDate);
    if (activeTab === 'day') {
      nextDate.setDate(selectedDate.getDate() - 1);
    } else if (activeTab === 'week') {
      nextDate.setDate(selectedDate.getDate() - 7);
    } else {
      nextDate.setMonth(selectedDate.getMonth() - 1);
    }
    setSelectedDate(nextDate);
  };

  const handleNextRange = () => {
    const nextDate = new Date(selectedDate);
    if (activeTab === 'day') {
      nextDate.setDate(selectedDate.getDate() + 1);
    } else if (activeTab === 'week') {
      nextDate.setDate(selectedDate.getDate() + 7);
    } else {
      nextDate.setMonth(selectedDate.getMonth() + 1);
    }
    setSelectedDate(nextDate);
  };

  const handleGoToday = () => {
    setSelectedDate(new Date(2026, 6, 2)); // Anchored to July 2nd, 2026 (for our mock data context)
  };

  // Get active clients for selects
  const activeClients = clients || [];
  const availableCleaners = members.filter(m => m.status === 'Active' && m.role === 'Cleaner');

  // Format decimal time back to a human friendly 12h representation
  const formatDecimalTo12h = (decimalHour: number): string => {
    const h = Math.floor(decimalHour);
    const m = Math.round((decimalHour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m === 0 ? '' : `:${String(m).padStart(2, '0')}`;
    return `${displayHour}${displayMin} ${period}`;
  };

  // Parse time string e.g. "08:30" or "14:15" to decimal decimal hour (e.g. 8.5 or 14.25)
  const parseTimeToDecimal = (timeStr: string): number => {
    if (!timeStr) return 9.0;
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    return h + m / 60;
  };

  // Color generator for cleaners to matches the colorful UI in screenshots
  const getCleanerColors = (cleanerName?: string) => {
    if (!cleanerName) {
      // Unassigned / open offer styling
      return {
        bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-900',
        stripe: 'bg-amber-400',
        pill: 'bg-amber-100 border border-amber-200 text-amber-700'
      };
    }
    const colors = [
      {
        bg: 'bg-sky-50 hover:bg-sky-100 border-sky-100 text-sky-950',
        stripe: 'bg-sky-500',
        pill: 'bg-sky-100 border-sky-200 text-sky-800'
      },
      {
        bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-950',
        stripe: 'bg-purple-500',
        pill: 'bg-purple-100 border-purple-200 text-purple-800'
      },
      {
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-950',
        stripe: 'bg-amber-500',
        pill: 'bg-amber-100 border-amber-200 text-amber-800'
      },
      {
        bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-950',
        stripe: 'bg-emerald-500',
        pill: 'bg-emerald-100 border-emerald-200 text-emerald-800'
      },
      {
        bg: 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-950',
        stripe: 'bg-rose-500',
        pill: 'bg-rose-100 border-rose-200 text-rose-800'
      },
      {
        bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-950',
        stripe: 'bg-indigo-500',
        pill: 'bg-indigo-100 border-indigo-200 text-indigo-800'
      }
    ];
    let hash = 0;
    for (let i = 0; i < cleanerName.length; i++) {
      hash += cleanerName.charCodeAt(i);
    }
    return colors[hash % colors.length];
  };

  // Filter and compute statistics for the selected timeframe
  const getJobsInSelectedRange = (): JobOffer[] => {
    if (activeTab === 'day') {
      return offers.filter(o => o.date === selectedDateISO && o.status !== 'cancelled');
    } else if (activeTab === 'week') {
      const isoDays = weekDays.map(formatDateToISO);
      return offers.filter(o => isoDays.includes(o.date) && o.status !== 'cancelled');
    } else {
      // Month
      const activeMonth = selectedDate.getMonth();
      const activeYear = selectedDate.getFullYear();
      return offers.filter(o => {
        const d = parseISOToDate(o.date);
        return d.getMonth() === activeMonth && d.getFullYear() === activeYear && o.status !== 'cancelled';
      });
    }
  };

  const rangeJobs = getJobsInSelectedRange();
  const rangeRevenue = rangeJobs.reduce((acc, j) => acc + j.clientValue, 0);
  const rangeHours = rangeJobs.reduce((acc, j) => acc + j.duration, 0);

  // Cleaner metrics for active day / week tags (e.g. Andreia 1 jobs - 1.0h)
  const getCleanerMetrics = (cleanerName: string) => {
    const cleanerJobs = rangeJobs.filter(j => j.assignedTo === cleanerName);
    const jobsCount = cleanerJobs.length;
    const hoursSum = cleanerJobs.reduce((acc, j) => acc + j.duration, 0);
    return { jobsCount, hoursSum };
  };

  // Handle client selection change to prefill address
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const cli = activeClients.find(c => c.id === clientId);
    if (cli) {
      setAddress(cli.address || '');
      setJobTitle(`Faxina — ${cli.name}`);
    }
  };

  // New Job Booking Formula Estimator
  const calculateEstimatedTotal = () => {
    if (overridePrice && customPrice !== '') {
      return parseFloat(customPrice) || 0;
    }

    let base = 0;
    const pricing = settings.pricing[serviceType] || { hourRate: 45, sqftRate: 0.12, minCharge: 120 };

    if (pricingMethod === 'hour') {
      base = duration * pricing.hourRate;
    } else if (pricingMethod === 'sqft') {
      base = sqft * pricing.sqftRate;
    } else if (pricingMethod === 'rooms') {
      const rp = settings.roomPricing || { studio: { price: 130 }, bedroom: { price: 40 }, bathroom: { price: 60 }, minimum: 120 };
      const studioPrice = rp.studio?.price || 130;
      const bedPrice = 2 * (rp.bedroom?.price || 40); 
      const bathPrice = 2 * (rp.bathroom?.price || 60); 
      base = studioPrice + bedPrice + bathPrice;
    }

    if (cleanType === 'deep' && settings.deepClean) {
      const dc = settings.deepClean;
      base += dc.type === 'percent' ? base * (dc.value / 100) : dc.value;
    }

    selectedExtras.forEach((extraId) => {
      const fee = settings.extraFees.find(f => f.id === extraId);
      if (fee) base += fee.price;
    });

    const finalMin = settings.roomPricing?.minimum || pricing.minCharge || 120;
    return Math.max(finalMin, Math.round(base));
  };

  const finalPrice = calculateEstimatedTotal();

  // Create Job Dispatcher
  const handleScheduleNewJob = (e: React.FormEvent) => {
    e.preventDefault();

    let finalClientName = '';
    if (clientType === 'existing') {
      const cli = activeClients.find(c => c.id === selectedClientId);
      finalClientName = cli ? cli.name : 'Unknown Client';
    } else {
      if (!newClientName.trim()) {
        alert('Por favor, informe o nome do cliente.');
        return;
      }
      finalClientName = newClientName;
    }

    if (!address.trim()) {
      alert('Por favor, informe o endereço de atendimento.');
      return;
    }

    const matchedCleaner = availableCleaners.find(c => c.id === assignedCleaner);
    const assignedName = matchedCleaner ? matchedCleaner.name : undefined;
    const workerEmails = matchedCleaner ? [matchedCleaner.email] : [];

    const extraFeesArray = selectedExtras.map(id => {
      const fee = settings.extraFees.find(f => f.id === id);
      return {
        id,
        name: fee?.name || id,
        ico: fee?.ico || '➕',
        price: fee?.price || 0,
        qty: 1,
        total: fee?.price || 0
      };
    });

    const newOffer: JobOffer = {
      id: `off_${Date.now()}`,
      title: jobTitle.trim() || `Serviço de Limpeza - ${finalClientName}`,
      date: jobDate,
      time: jobTime,
      client: finalClientName,
      serviceType,
      cleanType,
      pricingMethod,
      clientValue: finalPrice,
      duration,
      extraFees: extraFeesArray,
      extraFeesTotal: extraFeesArray.reduce((acc, f) => acc + f.total, 0),
      payment: Math.round(finalPrice * 0.6), 
      bonus: 0,
      workersNeeded,
      address,
      notes,
      urgency: jobDate === new Date().toISOString().slice(0, 10) ? 'urgent' : 'scheduled',
      workerEmails,
      validityHours: 24,
      autoResend: true,
      resendMax: 3,
      status: matchedCleaner ? 'assigned' : 'open',
      assignedTo: assignedName,
      responses: matchedCleaner ? [{ email: matchedCleaner.email, name: matchedCleaner.name, status: 'available' }] : [],
      ticked: []
    };

    onCreateOffer(newOffer);
    
    // Auto sync active calendar center date
    setSelectedDate(parseISOToDate(jobDate));
    setShowNewJobModal(false);
    resetForm();
  };

  const resetForm = () => {
    setJobTitle('');
    setAddress('');
    setNotes('');
    setSelectedExtras([]);
    setAssignedCleaner('');
    setOverridePrice(false);
    setCustomPrice('');
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  // Mini-calendar render helpers
  const miniCalYear = miniCalDate.getFullYear();
  const miniCalMonth = miniCalDate.getMonth();
  const miniCalDaysCount = new Date(miniCalYear, miniCalMonth + 1, 0).getDate();
  const miniCalFirstDayIdx = new Date(miniCalYear, miniCalMonth, 1).getDay();

  const handleMiniCalPrevMonth = () => {
    setMiniCalDate(new Date(miniCalYear, miniCalMonth - 1, 1));
  };

  const handleMiniCalNextMonth = () => {
    setMiniCalDate(new Date(miniCalYear, miniCalMonth + 1, 1));
  };

  const getMiniCalDayISOString = (dayNum: number): string => {
    const formattedMonth = String(miniCalMonth + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    return `${miniCalYear}-${formattedMonth}-${formattedDay}`;
  };

  // Static list of hours for Day/Week grids (7 AM to 7 PM)
  const gridHours = Array.from({ length: 13 }, (_, i) => i + 7); // [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

  // Month Names
  const monthNamesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthNamesEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDayNamesPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Render Job block helper (Absolute positioned inside relative columns)
  const renderAbsoluteJobCard = (job: JobOffer, isDayViewCol = false) => {
    const startDecimal = parseTimeToDecimal(job.time);
    const topOffset = (startDecimal - 7) * 44; // 44px per hour row
    const cardHeight = job.duration * 44;
    const colors = getCleanerColors(job.assignedTo);

    return (
      <div
        key={job.id}
        className={`absolute left-1.5 right-1.5 rounded-lg border p-2.5 transition shadow-sm overflow-hidden flex flex-col justify-between ${colors.bg} ${colors.stripe}`}
        style={{
          top: `${topOffset}px`,
          height: `${cardHeight}px`,
          borderLeftWidth: '4px',
        }}
      >
        <div className="space-y-0.5 min-h-0 overflow-hidden">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] font-black tracking-tight truncate leading-tight uppercase block max-w-[85%]">
              {job.client}
            </span>
            <span className="text-[9px] font-black bg-white/70 px-1 py-0.2 rounded shrink-0">
              ${job.clientValue}
            </span>
          </div>
          <div className="text-[9px] font-extrabold text-slate-500 flex items-center gap-1">
            <Clock size={10} className="shrink-0" />
            <span>{job.time} · {job.duration}h</span>
          </div>
          {!isDayViewCol && (
            <div className="text-[9px] font-bold text-teal-700 truncate mt-0.5">
              👤 {job.assignedTo || 'Pendente Dispatch'}
            </div>
          )}
          {cardHeight > 70 && (
            <div className="text-[8px] font-medium text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <MapPin size={9} className="shrink-0" />
              <span className="truncate">{job.address}</span>
            </div>
          )}
        </div>

        {cardHeight > 90 && (
          <div className="pt-1.5 border-t border-slate-200/55 flex items-center gap-2 justify-between mt-auto">
            {job.status === 'open' && (
              <select
                onChange={(e) => {
                  const email = e.target.value;
                  const name = members.find(m => m.email === email)?.name || '';
                  if (email) onAssignWorker(job.id, email, name);
                }}
                className="text-[8px] bg-white border border-slate-200 rounded p-0.5 font-bold outline-none text-slate-600 max-w-[100px]"
              >
                <option value="">Atribuir...</option>
                {availableCleaners.map(c => (
                  <option key={c.id} value={c.email}>{c.name}</option>
                ))}
              </select>
            )}

            {job.status === 'assigned' && onUpdateJobStatus && (
              <button
                onClick={() => onUpdateJobStatus(job.id, 'done')}
                className="text-[8px] font-black text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition"
              >
                ✓ Concluir
              </button>
            )}

            <button
              onClick={() => onCancelOffer(job.id)}
              className="text-[8px] font-black text-slate-400 hover:text-rose-500 transition ml-auto"
              title="Cancelar"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Main Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <CalendarIcon size={18} />
            </span>
            <h2 id="schedule-title" className="text-xl font-black text-slate-900 tracking-tight">Schedule / Agenda</h2>
          </div>
          <p className="text-xs text-slate-400">Controle completo da escala de limpezas em visualizações diárias, semanais e mensais.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Day / Week / Month selector tabs (matches right-aligned buttons on screenshot) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab('day')}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                activeTab === 'day' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setActiveTab('week')}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                activeTab === 'week' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                activeTab === 'month' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>

          <button
            id="btn-new-job"
            onClick={() => {
              resetForm();
              setShowNewJobModal(true);
            }}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
          >
            <Plus size={15} />
            + New Job
          </button>
        </div>
      </div>

      {/* 2. Interactive Range Navigator & Cleaner Pills Bar (matches top of screenshots) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Chevron selectors */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevRange}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Inline Date Display / Date picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDateISO}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(parseISOToDate(e.target.value));
                }
              }}
              className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-teal-500 cursor-pointer text-center bg-slate-50/50"
            />
          </div>

          <button 
            onClick={handleNextRange}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
          >
            <ChevronRight size={16} />
          </button>

          <button 
            onClick={handleGoToday}
            className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-lg text-xs hover:bg-slate-200 transition"
          >
            Today
          </button>
        </div>

        {/* Middle/Right Side: Cleaner tags showing total hours & jobs */}
        <div className="flex items-center gap-2 flex-wrap">
          {availableCleaners.slice(0, 5).map((cleaner) => {
            const metrics = getCleanerMetrics(cleaner.name);
            const style = getCleanerColors(cleaner.name);
            return (
              <div 
                key={cleaner.id}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${style.pill}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${style.stripe}`} />
                <span>{cleaner.firstName || cleaner.name.split(' ')[0]}</span>
                <span className="text-[10px] font-black opacity-80 bg-white/70 px-1 rounded-sm">
                  {metrics.jobsCount} jobs · {metrics.hoursSum}h
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* 3. Summary Stat Blocks (matches middle statistic row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-1">
          <span className="text-xl font-black text-amber-500">${rangeRevenue}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {activeTab === 'day' ? 'Revenue Today' : activeTab === 'week' ? 'Revenue Week' : 'Revenue Month'}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-1">
          <span className="text-xl font-black text-sky-500">{rangeJobs.length}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {activeTab === 'day' ? 'Jobs Today' : activeTab === 'week' ? 'Jobs Week' : 'Jobs Month'}
          </span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-1">
          <span className="text-xl font-black text-emerald-500">{rangeHours}h</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {activeTab === 'day' ? 'Hours Today' : activeTab === 'week' ? 'Hours Week' : 'Hours Month'}
          </span>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE / VIEWS LAYOUT */}

      {/* ======================================================= */}
      {/* A. WEEK VIEW ( matches Screenshot 1 )                  */}
      {/* ======================================================= */}
      {activeTab === 'week' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Grid Area (9 Columns) */}
          <div className="xl:col-span-9 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-x-auto">
            <div className="min-w-[800px]">
              
              {/* Day header cells */}
              <div className="grid grid-cols-8 border-b border-slate-100 pb-3 text-center">
                <div className="text-[10px] font-black uppercase text-slate-400 self-end text-left pl-2">
                  Time
                </div>
                {weekDays.map((day, idx) => {
                  const isDayToday = formatDateToISO(day) === '2026-07-02';
                  const isDaySelected = formatDateToISO(day) === selectedDateISO;
                  const dayJobs = offers.filter(o => o.date === formatDateToISO(day) && o.status !== 'cancelled');

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isDaySelected 
                          ? 'bg-teal-500/10 text-teal-800 ring-1 ring-teal-500/30' 
                          : isDayToday
                          ? 'bg-slate-900 text-white shadow'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-85">{weekDayNamesShort[day.getDay()]}</span>
                      <span className="text-sm font-black leading-tight">{day.getDate()}</span>
                      {dayJobs.length > 0 && (
                        <span className="text-[8px] px-1 py-0.2 rounded-full mt-1 font-bold bg-teal-500 text-slate-950">
                          {dayJobs.length} jobs
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Grid Body */}
              <div className="relative mt-2" style={{ height: `${gridHours.length * 44}px` }}>
                
                {/* Horizontal row line dividers background */}
                <div className="absolute inset-0 pointer-events-none">
                  {gridHours.map((hour, idx) => (
                    <div 
                      key={hour} 
                      className="border-b border-slate-100 flex items-center" 
                      style={{ height: '44px', top: `${idx * 44}px` }}
                    >
                      <span className="text-[9px] font-black text-slate-400 pl-1">
                        {formatDecimalTo12h(hour)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Vertical Day Columns Grid */}
                <div className="absolute inset-0 grid grid-cols-8 pl-14">
                  {weekDays.map((day) => {
                    const dayISO = formatDateToISO(day);
                    const dayJobs = offers.filter(o => o.date === dayISO && o.status !== 'cancelled');

                    return (
                      <div 
                        key={dayISO} 
                        className="relative border-r border-slate-100/50 h-full"
                      >
                        {dayJobs.map((job) => renderAbsoluteJobCard(job))}
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          </div>

          {/* Right Sidebar Area: Week Summary (matches Right Sidebar in Screenshot 1) */}
          <div className="xl:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> Week Summary
              </h3>
              <p className="text-[10px] text-slate-400">Totalizadores diários do período.</p>
            </div>

            <div className="divide-y divide-slate-100 text-xs font-bold">
              {weekDays.map((day) => {
                const dayISO = formatDateToISO(day);
                const dayJobs = offers.filter(o => o.date === dayISO && o.status !== 'cancelled');
                const dayRev = dayJobs.reduce((acc, j) => acc + j.clientValue, 0);

                return (
                  <div key={dayISO} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-slate-800">{weekDayNamesPt[day.getDay()]} {day.getDate()}</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono">{dayISO}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-900">{dayJobs.length} jobs</div>
                      <div className="text-[11px] text-teal-600 font-black">${dayRev}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* B. DAY VIEW ( matches Screenshot 2 )                    */}
      {/* ======================================================= */}
      {activeTab === 'day' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Day Grid Area (9 Columns) - Cleaner Columns */}
          <div className="xl:col-span-9 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm overflow-x-auto">
            <div className="min-w-[800px]">
              
              {/* Cleaner headers */}
              <div className="grid grid-cols-5 border-b border-slate-100 pb-3 text-center text-xs font-black text-slate-800">
                <div className="text-[10px] font-black uppercase text-slate-400 self-end text-left pl-2 col-span-1">
                  Time
                </div>
                
                {/* 4 cleaner columns + 1 open/unassigned column */}
                {availableCleaners.slice(0, 3).map((cleaner) => {
                  const colors = getCleanerColors(cleaner.name);
                  return (
                    <div key={cleaner.id} className="flex items-center justify-center gap-2 py-1">
                      <div className={`w-2 h-2 rounded-full ${colors.stripe}`} />
                      <span>{cleaner.name}</span>
                    </div>
                  );
                })}
                <div className="text-amber-600 bg-amber-50 rounded-lg py-1 flex items-center justify-center gap-1.5 border border-amber-100">
                  <span>⚠️ Unassigned / Aberto</span>
                </div>
              </div>

              {/* Day Grid Body */}
              <div className="relative mt-2" style={{ height: `${gridHours.length * 44}px` }}>
                
                {/* Hour Grid Dividers */}
                <div className="absolute inset-0 pointer-events-none">
                  {gridHours.map((hour, idx) => (
                    <div 
                      key={hour} 
                      className="border-b border-slate-100 flex items-center" 
                      style={{ height: '44px', top: `${idx * 44}px` }}
                    >
                      <span className="text-[9px] font-black text-slate-400 pl-1">
                        {formatDecimalTo12h(hour)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day columns mapping for each cleaner */}
                <div className="absolute inset-0 grid grid-cols-5 pl-14">
                  
                  {/* Empty cell spacer to align with Time column */}
                  <div className="relative h-full pointer-events-none col-span-1" />

                  {/* Cleaner column jobs */}
                  {availableCleaners.slice(0, 3).map((cleaner) => {
                    const cleanerJobs = offers.filter(
                      o => o.date === selectedDateISO && 
                      o.assignedTo === cleaner.name && 
                      o.status !== 'cancelled'
                    );

                    return (
                      <div key={cleaner.id} className="relative border-r border-slate-100/50 h-full">
                        {cleanerJobs.map((job) => renderAbsoluteJobCard(job, true))}
                      </div>
                    );
                  })}

                  {/* Open / Unassigned jobs column */}
                  <div className="relative h-full bg-amber-50/10">
                    {offers
                      .filter(o => o.date === selectedDateISO && o.status === 'open')
                      .map((job) => renderAbsoluteJobCard(job, true))}
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Right Sidebar Area: Mini Calendar & Details (matches Right Sidebar in Screenshot 2) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* 1. Mini Monthly Calendar Widget */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {monthNamesPt[miniCalMonth]} {miniCalYear}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleMiniCalPrevMonth}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button 
                    onClick={handleMiniCalNextMonth}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Mini Calendar table */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="font-bold text-slate-400 uppercase">{d}</span>
                ))}
                
                {Array.from({ length: miniCalFirstDayIdx }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}

                {Array.from({ length: miniCalDaysCount }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayISO = getMiniCalDayISOString(dayNum);
                  const isSelected = dayISO === selectedDateISO;
                  const hasJobs = offers.some(o => o.date === dayISO && o.status !== 'cancelled');

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDate(parseISOToDate(dayISO))}
                      className={`w-6 h-6 rounded-full font-bold transition flex items-center justify-center relative mx-auto ${
                        isSelected 
                          ? 'bg-teal-500 text-slate-950 font-black' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {dayNum}
                      {hasJobs && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Day Details */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider block">📅 Day Details</span>
                <span className="text-xs font-extrabold text-slate-800">{formatDateToLocale(selectedDate)}</span>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Total Jobs:</span>
                  <span className="text-slate-900">{rangeJobs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hours Booked:</span>
                  <span className="text-slate-900">{rangeHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Revenue:</span>
                  <span className="text-teal-600 font-black">${rangeRevenue}</span>
                </div>
              </div>
            </div>

            {/* 3. Upcoming List */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">🔔 Upcoming Jobs</span>
                <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">Próximos</span>
              </div>

              <div className="space-y-2.5">
                {offers
                  .filter(o => o.status !== 'cancelled' && o.status !== 'done')
                  .slice(0, 3)
                  .map((job) => (
                    <div key={job.id} className="border-l-2 border-indigo-400 pl-2 py-0.5">
                      <div className="text-[11px] font-black text-slate-900 truncate">{job.client}</div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                        <span>{job.date.split('-').reverse().slice(0, 2).join('/')} · {job.time}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================= */}
      {/* C. MONTH VIEW                                           */}
      {/* ======================================================= */}
      {activeTab === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Monthly Calendar Board (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🗓️</span> {monthNamesPt[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h3>
            </div>

            {/* Calendar Table Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDayNamesPt.map((day) => (
                <div key={day} className="text-[10px] font-black uppercase text-slate-400 py-2">
                  {day}
                </div>
              ))}

              {/* Offset empty slots before first day of month */}
              {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-100/30"></div>
              ))}

              {/* Days matching this month */}
              {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }).map((_, idx) => {
                const dayNum = idx + 1;
                const formattedM = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const formattedD = String(dayNum).padStart(2, '0');
                const dateISO = `${selectedDate.getFullYear()}-${formattedM}-${formattedD}`;
                
                const isSelected = dateISO === selectedDateISO;
                const isToday = dateISO === '2026-07-02'; 
                const dayJobs = offers.filter(o => o.date === dateISO && o.status !== 'cancelled');

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDate(parseISOToDate(dateISO))}
                    className={`h-20 p-2 text-left flex flex-col justify-between rounded-xl border transition-all relative ${
                      isSelected 
                        ? 'bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20 shadow-sm' 
                        : isToday 
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <span className={`text-xs font-bold leading-none ${isToday ? 'bg-slate-50 text-slate-950 w-5 h-5 flex items-center justify-center rounded-full -mt-0.5 -ml-0.5 text-[10px]' : ''}`}>
                      {dayNum}
                    </span>

                    {/* Jobs Indicators */}
                    <div className="space-y-1 w-full overflow-hidden mt-1">
                      {dayJobs.slice(0, 2).map((job) => {
                        const style = getCleanerColors(job.assignedTo);
                        return (
                          <div 
                            key={job.id} 
                            className="text-[8px] font-black truncate px-1 py-0.5 rounded leading-tight w-full text-left"
                            style={{
                              backgroundColor: job.status === 'done' ? '#f0fdf4' : job.status === 'assigned' ? '#f5f3ff' : '#fffbeb',
                              color: job.status === 'done' ? '#166534' : job.status === 'assigned' ? '#5b21b6' : '#92400e'
                            }}
                          >
                            {job.client.split(' ')[0]} - {job.time}
                          </div>
                        );
                      })}
                      {dayJobs.length > 2 && (
                        <div className="text-[7px] font-black text-slate-400 text-right pr-1">
                          +{dayJobs.length - 2} mais
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Column for Selected Day (4 Columns) */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase text-teal-600 tracking-wider">Agendamentos</span>
                <h3 className="text-sm font-black text-slate-950">
                  Dia {formatDateToLocale(selectedDate)}
                </h3>
              </div>

              {offers.filter(o => o.date === selectedDateISO).length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <span className="text-3xl block">🍃</span>
                  <p className="text-xs text-slate-400 font-bold">Nenhum job escalado para este dia.</p>
                  <button
                    onClick={() => {
                      setJobDate(selectedDateISO);
                      setShowNewJobModal(true);
                    }}
                    className="text-[11px] font-black text-teal-500 hover:text-teal-600 underline"
                  >
                    Agendar agora
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {offers
                    .filter(o => o.date === selectedDateISO)
                    .map((job) => {
                      const colors = getCleanerColors(job.assignedTo);
                      return (
                        <div 
                          key={job.id}
                          className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                              job.status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              job.status === 'assigned' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                              'bg-amber-50 border-amber-200 text-amber-800'
                            }`}>
                              {job.status === 'done' ? 'Concluido' : job.status === 'assigned' ? 'Escalado' : 'Aberto'}
                            </span>
                            <span className="text-xs font-black text-slate-950">${job.clientValue}</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900 truncate">{job.title}</h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                              <Clock size={11} />
                              <span>{job.time} ({job.duration}h)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <MapPin size={11} className="shrink-0" />
                              <span className="truncate">{job.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-black mt-1.5">
                              <User size={11} />
                              <span>Cleaner: {job.assignedTo || 'Pendente (Job Board)'}</span>
                            </div>
                          </div>

                          {/* Fast Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100/60">
                            {job.status === 'open' && (
                              <select
                                onChange={(e) => {
                                  const email = e.target.value;
                                  const name = members.find(m => m.email === email)?.name || '';
                                  if (email) onAssignWorker(job.id, email, name);
                                }}
                                className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 w-full font-bold outline-none text-slate-600"
                              >
                                <option value="">Atribuir profissional...</option>
                                {availableCleaners.map(c => (
                                  <option key={c.id} value={c.email}>{c.name}</option>
                                ))}
                              </select>
                            )}

                            {job.status === 'assigned' && onUpdateJobStatus && (
                              <button
                                onClick={() => onUpdateJobStatus(job.id, 'done')}
                                className="w-full py-1 text-[9px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded text-center transition"
                              >
                                ✓ Finalizar Serviço
                              </button>
                            )}

                            {job.status !== 'cancelled' && job.status !== 'done' && (
                              <button
                                onClick={() => onCancelOffer(job.id)}
                                className="px-2 py-1 text-[9px] font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition ml-auto"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Estimado do Dia:</span>
                <span className="text-sm font-black text-slate-900">
                  ${offers.filter(o => o.date === selectedDateISO && o.status !== 'cancelled').reduce((acc, j) => acc + j.clientValue, 0)}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ======================================================= */}
      {/* E. NEW JOB MODAL (For manual clean booking/scheduling)  */}
      {/* ======================================================= */}
      {showNewJobModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                  <span>✨</span> Agendar Faxina / Novo Job
                </h3>
                <p className="text-[11px] text-slate-400">Insira as informações do cliente e configure a precificação para escalar o serviço.</p>
              </div>
              <button 
                onClick={() => setShowNewJobModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleScheduleNewJob} className="p-6 space-y-6 flex-1">
              
              {/* 1. Client selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="clientType" 
                      checked={clientType === 'existing'} 
                      onChange={() => setClientType('existing')}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                    Cliente Cadastrado
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="clientType" 
                      checked={clientType === 'new'} 
                      onChange={() => setClientType('new')}
                      className="text-teal-500 focus:ring-teal-500"
                    />
                    Novo Cliente Avulso
                  </label>
                </div>

                {clientType === 'existing' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Selecionar Cliente Database *</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      required={clientType === 'existing'}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="">-- Escolha um cliente cadastrado --</option>
                      {activeClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Nome do Cliente *</label>
                      <input
                        type="text"
                        value={newClientName}
                        onChange={(e) => {
                          setNewClientName(e.target.value);
                          setJobTitle(`Faxina — ${e.target.value}`);
                        }}
                        placeholder="Nome completo"
                        required={clientType === 'new'}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Telefone</label>
                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="(305) 555-0100"
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">E-mail</label>
                      <input
                        type="email"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        placeholder="cliente@exemplo.com"
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Service specifics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Título do Job *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="ex. Faxina Residencial Padrão"
                    required
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Endereço de Atendimento *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Apto, Bairro"
                    required
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Data Preferencial *</label>
                  <input
                    type="date"
                    value={jobDate}
                    onChange={(e) => setJobDate(e.target.value)}
                    required
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Horário de Chegada *</label>
                  <input
                    type="time"
                    value={jobTime}
                    onChange={(e) => setJobTime(e.target.value)}
                    required
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* 3. Category & Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Categoria de Serviço</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  >
                    <option value="house">Residencial (House)</option>
                    <option value="commercial">Comercial (Commercial)</option>
                    <option value="moveinout">Mudança (Move In/Out)</option>
                    <option value="construction">Pós-Obra (Construction)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Tipo de Limpeza</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCleanType('standard')}
                      className={`py-1 text-xs font-extrabold rounded-md transition ${
                        cleanType === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Padrão
                    </button>
                    <button
                      type="button"
                      onClick={() => setCleanType('deep')}
                      className={`py-1 text-xs font-extrabold rounded-md transition ${
                        cleanType === 'deep' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Pesada/Deep
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Cálculo Base</label>
                  <select
                    value={pricingMethod}
                    onChange={(e) => setPricingMethod(e.target.value as any)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  >
                    <option value="hour">Por Hora</option>
                    <option value="sqft">Por Sqft (Metragem)</option>
                    <option value="rooms">Por Cômodo / Fixo</option>
                  </select>
                </div>
              </div>

              {/* 4. Pricing details input */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Parâmetros de Medição & Valores</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingMethod === 'hour' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Duração Estimada (Horas): {duration}h</label>
                      <input 
                        type="range" 
                        min="1" 
                        max="12" 
                        step="0.5"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  )}

                  {pricingMethod === 'sqft' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Tamanho da Propriedade (Sqft)</label>
                      <input 
                        type="number" 
                        value={sqft}
                        onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  {pricingMethod === 'rooms' && (
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-[11px] text-slate-400 font-bold">Configuração automática de cômodos do template padrão (2 Quartos, 2 Banheiros + Studio).</p>
                    </div>
                  )}

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={overridePrice}
                        onChange={(e) => setOverridePrice(e.target.checked)}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      Customizar Valor do Serviço Manualmente
                    </label>

                    {overridePrice && (
                      <div className="relative mt-2">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          placeholder="Digite o valor final em dólares"
                          className="w-full pl-7 text-xs font-medium border border-slate-200 rounded-lg p-2 outline-none focus:border-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimate box */}
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                    <span>Estimativa de Cobrança:</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                      {overridePrice ? 'Customizado' : 'Fórmula'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">${finalPrice}</span>
                </div>
              </div>

              {/* 5. Extras checkboxes */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Adicionais Extras (Extra Fees)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {settings.extraFees.map((fee) => {
                    const isSelected = selectedExtras.includes(fee.id);
                    return (
                      <button
                        key={fee.id}
                        type="button"
                        onClick={() => toggleExtra(fee.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-teal-50/50 border-teal-500 text-slate-900' 
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span className="text-sm">{fee.ico}</span>
                        <div className="truncate">
                          <div className="font-extrabold leading-tight text-slate-950 truncate">{fee.name}</div>
                          <div className="text-[10px] text-teal-600 font-extrabold mt-0.5">+${fee.price}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Cleaner Dispatch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Escalar Diarista Imediatamente</label>
                  <select
                    value={assignedCleaner}
                    onChange={(e) => setAssignedCleaner(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  >
                    <option value="">Não Escalar (Lançar no Job Board como Aberto)</option>
                    {availableCleaners.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.memberType === 'fixed' ? 'Contratado' : 'On-Demand'})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Se selecionado, o status será "Escalado". Caso contrário, a vaga irá aberta para o Quadro de Serviços.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Observações de Serviço</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instruções de entrada, presença de pets, áreas críticas..."
                    rows={2}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-lg text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Agendar & Salvar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
