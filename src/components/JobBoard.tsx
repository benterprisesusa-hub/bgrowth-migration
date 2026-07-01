import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  User, 
  Sparkles, 
  X, 
  Check, 
  ChevronRight, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { JobOffer, AppSettings, TeamMember, BookingRequest, Client, ExtraFee } from '../types';
import { CP_TYPES } from '../data';
import PrintOverlay from './PrintOverlay';

interface JobBoardProps {
  offers: JobOffer[];
  settings: AppSettings;
  members: TeamMember[];
  clients: Client[];
  onCreateOffer: (offer: JobOffer) => void;
  onCancelOffer: (offerId: string) => void;
  onAssignWorker: (offerId: string, email: string, name: string) => void;
  preFillRequest: BookingRequest | null;
  setPreFillRequest: (req: BookingRequest | null) => void;
}

export default function JobBoard({
  offers,
  settings,
  members,
  clients,
  onCreateOffer,
  onCancelOffer,
  onAssignWorker,
  preFillRequest,
  setPreFillRequest
}: JobBoardProps) {
  
  const [activeTab, setActiveTab] = useState<'open' | 'sent' | 'responses' | 'history'>('open');
  const [printTarget, setPrintTarget] = useState<{ job: JobOffer; type: 'receipt' | 'checklist' } | null>(null);
  const [showCreateForm, setShowShowCreateForm] = useState(preFillRequest !== null);
  const [showSmartAssign, setShowSmartAssign] = useState(false);
  
  // Create Job Offer Form fields
  const [title, setTitle] = useState(preFillRequest ? `${settings.pricing[preFillRequest.serviceType]?.minCharge ? CP_NAME(preFillRequest.serviceType) : "Cleaning"} — ${preFillRequest.name}` : '');
  const [date, setDate] = useState(preFillRequest ? preFillRequest.preferredDate : new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(preFillRequest ? preFillRequest.preferredTime : '09:00');
  const [selectedClient, setSelectedClient] = useState(preFillRequest ? preFillRequest.name : '');
  const [serviceType, setServiceType] = useState(preFillRequest ? preFillRequest.serviceType : 'house');
  const [cleanType, setCleanType] = useState<'standard' | 'deep'>(preFillRequest ? preFillRequest.cleanType : 'standard');
  const [pricingMethod, setPricingMethod] = useState<'hour' | 'sqft' | 'rooms'>(settings.requestFormMethod || 'hour');
  
  // Pricing inputs
  const [dur, setDur] = useState(3);
  const [hRate, setHRate] = useState(settings.pricing.house?.hourRate || 45);
  const [sqft, setSqft] = useState(1200);
  const [sqftRate, setSqftRate] = useState(settings.pricing.house?.sqftRate || 0.12);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(preFillRequest ? preFillRequest.extras.map(e => e.id) : []);
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [validityHours, setValidityHours] = useState(24);
  const [address, setAddress] = useState(preFillRequest ? preFillRequest.address : '');
  const [notes, setNotes] = useState(preFillRequest ? preFillRequest.notes : '');
  const [payRateInput, setPayRateInput] = useState(80);
  const [bonusInput, setBonusInput] = useState(10);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);

  // Room pricing state
  const [studioCount, setStudioCount] = useState(preFillRequest ? preFillRequest.studio : false);
  const [bedroomCount, setBedroomCount] = useState(preFillRequest ? preFillRequest.bedrooms : 0);
  const [bathroomCount, setBathroomCount] = useState(preFillRequest ? preFillRequest.bathrooms : 0);

  // Sync with preFillRequest when changed
  React.useEffect(() => {
    if (preFillRequest) {
      setTitle(`${CP_NAME(preFillRequest.serviceType)} — ${preFillRequest.name}`);
      setDate(preFillRequest.preferredDate);
      setTime(preFillRequest.preferredTime);
      setSelectedClient(preFillRequest.name);
      setServiceType(preFillRequest.serviceType);
      setCleanType(preFillRequest.cleanType);
      setAddress(preFillRequest.address);
      setNotes(preFillRequest.notes);
      setStudioCount(preFillRequest.studio);
      setBedroomCount(preFillRequest.bedrooms);
      setBathroomCount(preFillRequest.bathrooms);
      setSelectedExtras(preFillRequest.extras.map(e => e.id));
      setShowShowCreateForm(true);
    }
  }, [preFillRequest]);

  function CP_NAME(id: string) {
    if (id === 'house') return 'House Cleaning';
    if (id === 'commercial') return 'Commercial Cleaning';
    if (id === 'moveinout') return 'Move In/Out';
    if (id === 'construction') return 'Post-Construction';
    if (id === 'upholstery') return 'Upholstery';
    if (id === 'carpet') return 'Carpet Cleaning';
    return id;
  }

  // Calculate client cost
  const getCalculatedClientValue = () => {
    let base = 0;
    const pricing = settings.pricing[serviceType] || { hourRate: 45, sqftRate: 0.12, minCharge: 120 };

    if (pricingMethod === 'hour') {
      base = dur * hRate;
    } else if (pricingMethod === 'sqft') {
      base = sqft * sqftRate;
    } else if (pricingMethod === 'rooms') {
      const rp = settings.roomPricing;
      const studioPrice = studioCount ? (rp.studio?.price || 130) : 0;
      const bedPrice = bedroomCount * (rp.bedroom?.price || 40);
      const bathPrice = bathroomCount * (rp.bathroom?.price || 60);
      base = studioPrice + bedPrice + bathPrice;
    }

    if (cleanType === 'deep' && settings.deepClean) {
      const dc = settings.deepClean;
      base += dc.type === 'percent' ? base * (dc.value / 100) : dc.value;
    }

    // Extras
    selectedExtras.forEach((id) => {
      const fee = settings.extraFees.find(f => f.id === id);
      if (fee) base += fee.price;
    });

    const finalMin = settings.roomPricing?.minimum || pricing.minCharge || 120;
    return Math.max(finalMin, Math.round(base));
  };

  const clientValueCalculated = getCalculatedClientValue();

  const handleCreateOffer = () => {
    if (!title.trim()) return alert('Please enter a job title');
    if (!date) return alert('Please choose a date');
    
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

    const extraFeesTotal = extraFeesArray.reduce((sum, x) => sum + x.total, 0);

    const offer: JobOffer = {
      id: `off_${Date.now()}`,
      title,
      date,
      time,
      client: selectedClient || 'Walk-in Client',
      serviceType,
      cleanType,
      pricingMethod,
      clientValue: clientValueCalculated,
      duration: dur,
      extraFees: extraFeesArray,
      extraFeesTotal,
      payment: payRateInput,
      bonus: bonusInput,
      workersNeeded,
      address,
      notes,
      urgency: date === new Date().toISOString().slice(0, 10) ? 'urgent' : 'scheduled',
      workerEmails: selectedWorkers.length > 0 ? selectedWorkers : members.map(m => m.email),
      validityHours,
      autoResend: true,
      resendMax: 2,
      status: 'open',
      responses: selectedWorkers.map(email => {
        const worker = members.find(m => m.email === email);
        return {
          email,
          name: worker?.name || email,
          status: 'available',
          location: 'Match coordinates set'
        };
      })
    };

    onCreateOffer(offer);
    setShowShowCreateForm(false);
    setPreFillRequest(null);
    setSelectedWorkers([]);
    setSelectedExtras([]);
  };

  // Smart dispatch candidates filter matching ZIP/Service
  const getCandidates = () => {
    return members
      .filter((m) => m.status === 'Active')
      .map((m, index) => {
        const matchesZip = address.toLowerCase().includes(m.zipcode);
        const matchesSvc = true; // Simulating matches specialty
        const isEmerg = m.emergencyJobs;
        const dist = matchesZip ? 1.5 : 4.8 + index * 2.3;
        
        return {
          ...m,
          distance: dist,
          travelMinutes: Math.round(dist * 3),
          isBest: index === 0,
          hasService: matchesSvc,
          rating: 5.0 - index * 0.1
        };
      })
      .sort((a, b) => {
        if (a.isBest) return -1;
        if (b.isBest) return 1;
        return a.distance - b.distance;
      });
  };

  const candidates = getCandidates();

  const handleSelectWorker = (email: string) => {
    if (selectedWorkers.includes(email)) {
      setSelectedWorkers(selectedWorkers.filter(e => e !== email));
    } else {
      setSelectedWorkers([...selectedWorkers, email]);
    }
  };

  const handleSelectAllWorkers = () => {
    setSelectedWorkers(members.map(m => m.email));
  };

  const filteredOffers = offers.filter(o => {
    if (activeTab === 'open') return o.status === 'open';
    if (activeTab === 'sent') return o.status === 'open'; // Offers broadcasted
    if (activeTab === 'responses') return o.status === 'open' && (o.responses && o.responses.length > 0);
    if (activeTab === 'history') return o.status === 'assigned' || o.status === 'cancelled' || o.status === 'expired';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Job Board & Dispatch</h2>
          <p className="text-xs text-slate-400">Broadcast jobs to cleaners and assign claimed offers</p>
        </div>
        
        <button
          onClick={() => {
            setShowShowCreateForm(!showCreateForm);
            if (showCreateForm) setPreFillRequest(null);
          }}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
        >
          <PlusCircle size={14} />
          {showCreateForm ? 'View Job Board' : 'Create Job Offer'}
        </button>
      </div>

      {showCreateForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          
          {/* Create Offer Form */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>📢</span> Create Cleaning Job Offer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Offer Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Standard House Clean - Sarah J."
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Preferred Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Arrival Time *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                >
                  <option value="">Choose Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Service Category</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                >
                  {CP_TYPES.filter(t => settings.activeServices.includes(t.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Pricing selection methods */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800">Pricing Method for Quote</h4>
                  <div className="flex gap-1">
                    {(['hour', 'sqft', 'rooms'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setPricingMethod(method)}
                        className={`px-3 py-1 rounded text-[10px] font-black uppercase transition ${
                          pricingMethod === method 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        By {method}
                      </button>
                    ))}
                  </div>
                </div>

                {pricingMethod === 'hour' && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Duration (Hours)</label>
                      <input
                        type="number"
                        value={dur}
                        step="0.5"
                        onChange={(e) => setDur(parseFloat(e.target.value) || 1)}
                        className="w-full text-xs font-medium border border-slate-200 bg-white rounded-lg p-2 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Rate ($ / Hour)</label>
                      <input
                        type="number"
                        value={hRate}
                        onChange={(e) => setHRate(parseInt(e.target.value) || 45)}
                        className="w-full text-xs font-medium border border-slate-200 bg-white rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>
                )}

                {pricingMethod === 'sqft' && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Sq Footage</label>
                      <input
                        type="number"
                        value={sqft}
                        onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-medium border border-slate-200 bg-white rounded-lg p-2 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase text-slate-400">Rate ($ / Sqft)</label>
                      <input
                        type="number"
                        value={sqftRate}
                        step="0.01"
                        onChange={(e) => setSqftRate(parseFloat(e.target.value) || 0.1)}
                        className="w-full text-xs font-medium border border-slate-200 bg-white rounded-lg p-2 outline-none"
                      />
                    </div>
                  </div>
                )}

                {pricingMethod === 'rooms' && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl">
                    <div className="text-center p-2 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Studio</span>
                      <button 
                        onClick={() => setStudioCount(!studioCount)}
                        className={`w-full mt-1.5 py-1 text-[10px] font-extrabold border rounded transition ${
                          studioCount ? 'bg-teal-500 border-teal-500 text-slate-950' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {studioCount ? 'Added' : 'Add'}
                      </button>
                    </div>
                    <div className="text-center p-2 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Bedrooms</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button onClick={() => setBedroomCount(Math.max(0, bedroomCount - 1))} className="w-5 h-5 rounded-full bg-slate-100 font-bold text-xs">-</button>
                        <span className="text-xs font-black">{bedroomCount}</span>
                        <button onClick={() => setBedroomCount(bedroomCount + 1)} className="w-5 h-5 rounded-full bg-slate-100 font-bold text-xs">+</button>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white border border-slate-100 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Bathrooms</span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <button onClick={() => setBathroomCount(Math.max(0, bathroomCount - 1))} className="w-5 h-5 rounded-full bg-slate-100 font-bold text-xs">-</button>
                        <span className="text-xs font-black">{bathroomCount}</span>
                        <button onClick={() => setBathroomCount(bathroomCount + 1)} className="w-5 h-5 rounded-full bg-slate-100 font-bold text-xs">+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Intensity & Extras */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Intensity & Extra Surcharges</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCleanType(cleanType === 'standard' ? 'deep' : 'standard')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition flex items-center gap-1.5 ${
                      cleanType === 'deep' ? 'border-teal-500 bg-teal-500/5 text-teal-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ✨ Deep Clean (+{settings.deepClean?.value}%)
                  </button>
                  {settings.extraFees.map(fee => {
                    const active = selectedExtras.includes(fee.id);
                    return (
                      <button
                        key={fee.id}
                        onClick={() => {
                          if (active) setSelectedExtras(selectedExtras.filter(id => id !== fee.id));
                          else setSelectedExtras([...selectedExtras, fee.id]);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold transition flex items-center gap-1.5 ${
                          active ? 'border-teal-500 bg-teal-500/5 text-teal-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {fee.ico} {fee.name} (+${fee.price})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workers and broadcating */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Workers Needed *</label>
                <input
                  type="number"
                  value={workersNeeded}
                  onChange={(e) => setWorkersNeeded(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Offer Claim Window (hours)</label>
                <input
                  type="number"
                  value={validityHours}
                  onChange={(e) => setValidityHours(parseInt(e.target.value) || 24)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Job Payout Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, City, State ZIP"
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Worker Instructions & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter details visible to workers..."
                  rows={2}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none resize-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                onClick={() => { setShowShowCreateForm(false); setPreFillRequest(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateOffer}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition shadow-md shadow-teal-500/10"
              >
                Broadcast Offer 📤
              </button>
            </div>
          </div>

          {/* Smart dispatch side panel */}
          <div className="space-y-4">
            
            {/* Live Pricing Estimator Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4 shadow-sm">
              <h3 className="text-[10px] font-extrabold uppercase text-teal-400 tracking-wider">Live Pricing & Margins</h3>
              
              <div className="space-y-2.5 divide-y divide-slate-800">
                <div className="flex justify-between items-center text-xs py-1.5">
                  <span className="text-slate-400">Calculated Client Value</span>
                  <span className="font-extrabold text-teal-400">${clientValueCalculated}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Worker Payout ($)</span>
                    <input
                      type="number"
                      value={payRateInput}
                      onChange={(e) => setPayRateInput(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Bonus / Tips ($)</span>
                    <input
                      type="number"
                      value={bonusInput}
                      onChange={(e) => setBonusInput(parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold border border-slate-800 bg-slate-950 rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-extrabold uppercase">Calculated Profit Margin</span>
                <span className={`font-black text-sm ${
                  clientValueCalculated - (payRateInput + bonusInput) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  ${(clientValueCalculated - (payRateInput + bonusInput)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Smart Dispatch Panel */}
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>🤖</span> Smart Dispatch Pool
                  </h4>
                  <p className="text-[9px] text-slate-400">Matched active cleaners for this address</p>
                </div>
                <button 
                  onClick={handleSelectAllWorkers}
                  className="text-[10px] text-teal-600 hover:text-teal-700 font-bold"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {candidates.map((worker) => {
                  const isSelected = selectedWorkers.includes(worker.email);
                  return (
                    <div 
                      key={worker.id}
                      onClick={() => handleSelectWorker(worker.email)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-500/5' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 font-black text-xs flex items-center justify-center shrink-0">
                          {worker.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                            {worker.name}
                            {worker.isBest && (
                              <span className="text-[8px] bg-teal-500 text-slate-900 font-extrabold px-1 rounded">Best</span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400">
                            📍 {worker.distance.toFixed(1)} mi away · Rating: ⭐{worker.rating.toFixed(1)}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                        isSelected ? 'border-teal-500 bg-teal-500 text-slate-950' : 'border-slate-200'
                      }`}>
                        {isSelected && <Check size={10} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-slate-100">
            <div className="flex gap-2">
              {(['open', 'sent', 'responses', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-black capitalize transition-all border-b-2 px-4 ${
                    activeTab === tab 
                      ? 'border-teal-500 text-slate-950 font-black' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Job Offers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.length === 0 ? (
              <div className="col-span-2 bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
                <span className="text-4xl block">📋</span>
                <h4 className="text-xs font-black text-slate-400">No {activeTab} job offers</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Broadcasting offers notifies matched cleaners in your pool instantly via dispatch emails.
                </p>
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const isUrgent = offer.urgency === 'urgent';
                return (
                  <div 
                    key={offer.id} 
                    className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between border-l-4 ${
                      isUrgent ? 'border-l-red-500' : 'border-l-teal-500'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                          isUrgent ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {offer.urgency}
                        </span>
                        
                        <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                          {offer.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{offer.title}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1">
                          📅 {offer.date}
                        </div>
                        <div className="flex items-center gap-1">
                          ⏰ {offer.time}
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          📍 {offer.address}
                        </div>
                        <div className="flex items-center gap-1 col-span-2 text-teal-600 font-extrabold">
                          💵 Client Value: ${offer.clientValue} · Payout: ${offer.payment} {offer.bonus > 0 && `(+ $${offer.bonus} bonus)`}
                        </div>
                      </div>

                      {offer.notes && (
                        <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-500 italic">
                          📝 Notes: {offer.notes}
                        </div>
                      )}
                    </div>

                    {/* Pending response claim options */}
                    {offer.status === 'open' && (
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          Claimant Submissions ({offer.responses?.length || 0})
                        </span>
                        
                        <div className="space-y-1.5">
                          {offer.responses && offer.responses.length > 0 ? (
                            offer.responses.map((resp) => (
                              <div key={resp.email} className="flex items-center justify-between text-[11px] p-2 bg-slate-50 border border-slate-100 rounded">
                                <span className="font-extrabold text-slate-800">👤 {resp.name}</span>
                                <button
                                  onClick={() => onAssignWorker(offer.id, resp.email, resp.name)}
                                  className="px-2 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-[9px] rounded"
                                >
                                  Lock & Assign
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-[9px] text-slate-400 italic">No claimant claims submitted yet...</div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 pt-2 border-t border-slate-50">
                          <button
                            onClick={() => onCancelOffer(offer.id)}
                            className="w-full py-1 text-[9px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-extrabold rounded"
                          >
                            Cancel Broadcast Offer
                          </button>
                        </div>
                      </div>
                    )}

                    {offer.status === 'assigned' && (
                      <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Assigned Cleaner</span>
                          <span className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Check size={12} /> {offer.assignedTo}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-50 print:hidden">
                          <button
                            onClick={() => setPrintTarget({ job: offer, type: 'receipt' })}
                            className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded flex items-center justify-center gap-1 border border-slate-200 transition"
                          >
                            🧾 Print Receipt
                          </button>
                          <button
                            onClick={() => setPrintTarget({ job: offer, type: 'checklist' })}
                            className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded flex items-center justify-center gap-1 border border-slate-200 transition"
                          >
                            📋 Checklist Sheet
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {printTarget && (
        <PrintOverlay
          job={printTarget.job}
          type={printTarget.type}
          settings={settings}
          onClose={() => setPrintTarget(null)}
        />
      )}

    </div>
  );
}
