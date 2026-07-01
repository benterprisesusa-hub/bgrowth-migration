import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Sparkles, 
  Home, 
  Plus, 
  Calendar, 
  Check, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import { BookingRequest, AppSettings, ExtraFee } from '../types';
import { CP_TYPES } from '../data';

interface RequestFormProps {
  settings: AppSettings;
  onSubmitRequest: (request: BookingRequest) => void;
  isAdminView?: boolean;
}

export default function RequestForm({ settings, onSubmitRequest, isAdminView = false }: RequestFormProps) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  
  const [serviceType, setServiceType] = useState('house');
  const [propertyType, setPropertyType] = useState<'house' | 'apt' | 'office'>('house');
  const [cleanType, setCleanType] = useState<'standard' | 'deep'>('standard');
  
  const [studio, setStudio] = useState(false);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [sqft, setSqft] = useState(0);
  const [pets, setPets] = useState(false);
  
  const [selectedExtras, setSelectedExtras] = useState<{ id: string; qty: number }[]>([]);
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().slice(0, 10));
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  
  const [activeDetail, setActiveDetail] = useState<'studio' | 'bedroom' | 'bathroom' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto zip autofill (simulated like the API in GAS but local)
  const handleZipBlur = () => {
    if (zip.length >= 5) {
      fetch(`https://api.zippopotam.us/us/${zip}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.places && data.places[0]) {
            const place = data.places[0];
            setCity(place['place name'] || '');
            setState(place['state abbreviation'] || '');
          }
        })
        .catch(() => {});
    }
  };

  // Price Calculation Logic based on settings
  const calculateTotal = () => {
    let base = 0;
    const method = settings.requestFormMethod || 'hour';
    const pricing = settings.pricing[serviceType] || { hourRate: 45, sqftRate: 0.12, minCharge: 120 };

    if (method === 'hour') {
      // Estimated hours based on room count or flat
      const calculatedHours = studio ? 2.5 : Math.max(1, 1.5 + bedrooms * 0.5 + bathrooms * 0.75);
      base = calculatedHours * pricing.hourRate;
    } else if (method === 'sqft') {
      const calculatedSqft = sqft || (studio ? 500 : 300 + bedrooms * 200 + bathrooms * 150);
      base = calculatedSqft * pricing.sqftRate;
    } else if (method === 'rooms') {
      const rp = settings.roomPricing;
      const studioPrice = studio ? (rp.studio?.price || 130) : 0;
      const bedPrice = bedrooms * (rp.bedroom?.price || 40);
      const bathPrice = bathrooms * (rp.bathroom?.price || 60);
      base = studioPrice + bedPrice + bathPrice;
    }

    // Deep Clean surcharge
    if (cleanType === 'deep' && settings.deepClean) {
      const dc = settings.deepClean;
      if (dc.type === 'percent') {
        base += base * (dc.value / 100);
      } else {
        base += dc.value;
      }
    }

    // Extras addition
    selectedExtras.forEach((ext) => {
      const feeConfig = settings.extraFees.find((f) => f.id === ext.id);
      if (feeConfig) {
        base += ext.qty * feeConfig.price;
      }
    });

    // Enforce Minimum Charge
    const finalMin = settings.roomPricing?.minimum || pricing.minCharge || 120;
    return Math.max(finalMin, Math.round(base));
  };

  const estimatedTotal = calculateTotal();

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim()) { setErrorMsg('Please enter your full name.'); return; }
      if (!phone.trim()) { setErrorMsg('Please enter your phone number.'); return; }
      if (!address.trim()) { setErrorMsg('Please enter your address.'); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 1) setStep(step - 1);
  };

  const handleExtraQty = (id: string, delta: number) => {
    const existing = selectedExtras.find((x) => x.id === id);
    if (existing) {
      const nextQty = Math.max(0, existing.qty + delta);
      if (nextQty === 0) {
        setSelectedExtras(selectedExtras.filter((x) => x.id !== id));
      } else {
        setSelectedExtras(selectedExtras.map((x) => (x.id === id ? { ...x, qty: nextQty } : x)));
      }
    } else if (delta > 0) {
      setSelectedExtras([...selectedExtras, { id, qty: 1 }]);
    }
  };

  const getExtraQty = (id: string) => {
    return selectedExtras.find((x) => x.id === id)?.qty || 0;
  };

  const handleSubmit = () => {
    if (!preferredDate) { setErrorMsg('Please choose a preferred date.'); return; }
    if (!preferredTime) { setErrorMsg('Please choose a preferred time.'); return; }

    const newRequest: BookingRequest = {
      id: `req_${Date.now()}`,
      name,
      phone,
      email,
      address,
      complement,
      zip,
      city,
      state,
      accessInstructions,
      serviceType,
      propertyType,
      cleanType,
      studio,
      bedrooms,
      bathrooms,
      sqft,
      pets,
      extras: selectedExtras,
      preferredDate,
      preferredTime,
      notes,
      estimatedTotal,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    onSubmitRequest(newRequest);
    setSuccess(true);
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setComplement('');
    setZip('');
    setCity('');
    setState('');
    setAccessInstructions('');
    setStudio(false);
    setBedrooms(0);
    setBathrooms(0);
    setSqft(0);
    setPets(false);
    setSelectedExtras([]);
    setNotes('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-xl text-center space-y-6 animate-fade-in">
        <span className="text-6xl block">🎉</span>
        <h3 className="text-xl font-black text-slate-950">Request Submitted Successfully!</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          We have received your booking details and will review them shortly. A confirmation quote has been dispatched to your email <span className="font-bold text-slate-900">{email || "(provided)"}</span>.
        </p>
        <button
          onClick={resetForm}
          className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  const roomDescriptions = {
    studio: {
      ico: '🏠',
      name: 'Studio / Base',
      desc: settings.roomPricing?.studio?.description || 'Complete cleaning of all common areas including kitchen.',
      includes: settings.roomPricing?.studio?.includes || 'Living room, Entrance & hallway, Balcony / porch, Common areas, Kitchen'
    },
    bedroom: {
      ico: '🛏',
      name: 'Bedroom',
      desc: settings.roomPricing?.bedroom?.description || 'Full bedroom cleaning including closet and windows.',
      includes: settings.roomPricing?.bedroom?.includes || 'Full bedroom, Closet exterior, Windows, Dusting all surfaces, Vacuuming / mopping'
    },
    bathroom: {
      ico: '🚿',
      name: 'Bathroom',
      desc: settings.roomPricing?.bathroom?.description || 'Complete bathroom cleaning and sanitization.',
      includes: settings.roomPricing?.bathroom?.includes || 'Toilet cleaning & sanitizing, Shower / bathtub, Sink & mirrors, Floor mopping, Cabinet exterior'
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-1 py-4 border-b border-slate-100">
        <span className="text-3xl block">🧹</span>
        <h2 className="text-lg font-black text-slate-950">Book a Professional Clean</h2>
        <p className="text-xs text-slate-500">Calculate instant estimate and schedule instantly</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between px-6 max-w-lg mx-auto">
        {[1, 2, 3, 4, 5].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border transition ${
                step === s 
                  ? 'bg-teal-500 border-teal-500 text-slate-950' 
                  : step > s 
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                {step > s ? <Check size={14} /> : s}
              </div>
            </div>
            {s < 5 && (
              <div className={`flex-1 h-0.5 transition ${
                step > s ? 'bg-teal-500/30' : 'bg-slate-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Form: Form Inputs */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 font-bold rounded-lg text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">Your Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Street Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="W Oak Avenue"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Complement / Apt</label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Apt, Suite, Box"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 md:col-span-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">ZIP</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      onBlur={handleZipBlur}
                      placeholder="33139"
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Access Instructions</label>
                  <input
                    type="text"
                    value={accessInstructions}
                    onChange={(e) => setAccessInstructions(e.target.value)}
                    placeholder="e.g. key box on front door code 1234"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE PREFERENCE */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">Service Catalog</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CP_TYPES.filter(t => settings.activeServices.includes(t.id)).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setServiceType(t.id)}
                    className={`p-4 rounded-xl border text-center space-y-2 transition flex flex-col items-center justify-center ${
                      serviceType === t.id 
                        ? 'border-teal-500 bg-teal-500/5 text-teal-950' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-3xl">{t.ico}</span>
                    <span className="text-[11px] font-extrabold leading-tight">{t.name}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Property Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['house', 'apt', 'office'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPropertyType(p)}
                        className={`py-2 text-[11px] font-extrabold rounded-lg border transition capitalize ${
                          propertyType === p 
                            ? 'border-teal-500 bg-teal-500/5 text-teal-700' 
                            : 'border-slate-200 text-slate-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Cleaning Intensity</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCleanType('standard')}
                      className={`py-2 text-[11px] font-extrabold rounded-lg border transition ${
                        cleanType === 'standard' 
                          ? 'border-teal-500 bg-teal-500/5 text-teal-700' 
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      🧹 Standard Clean
                    </button>
                    <button
                      onClick={() => setCleanType('deep')}
                      className={`py-2 text-[11px] font-extrabold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                        cleanType === 'deep' 
                          ? 'border-teal-500 bg-teal-500/5 text-teal-700' 
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      ✨ Deep Clean
                      {settings.deepClean && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold">
                          +{settings.deepClean.value}{settings.deepClean.type === 'percent' ? '%' : '$'}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROPERTY SIZE & DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">Property Details</h3>
              <p className="text-[10px] text-slate-400">Select studio or bedroom/bathroom counts</p>

              <div className="space-y-3">
                
                {/* Studio Row */}
                <div 
                  onClick={() => setActiveDetail('studio')}
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    activeDetail === 'studio' ? 'border-teal-500 bg-teal-500/5' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Studio / Base Rate</h4>
                      <p className="text-[10px] text-slate-400">Includes single main living/dining and kitchen area</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudio(!studio);
                      if (!studio) { setBedrooms(0); setBathrooms(0); }
                    }}
                    className={`px-4 py-1.5 rounded-lg border text-xs font-extrabold transition ${
                      studio ? 'bg-teal-500 border-teal-500 text-slate-950' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {studio ? '✓ Added' : 'Add'}
                  </button>
                </div>

                {/* Bedrooms Row */}
                <div 
                  onClick={() => setActiveDetail('bedroom')}
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    activeDetail === 'bedroom' ? 'border-teal-500 bg-teal-500/5' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛏</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Bedrooms</h4>
                      <p className="text-[10px] text-slate-400">Full bedroom cleaning, dusting and bed making</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5">
                    <button 
                      onClick={() => { setBedrooms(Math.max(0, bedrooms - 1)); setStudio(false); }}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-slate-900 min-w-[12px] text-center">{bedrooms}</span>
                    <button 
                      onClick={() => { setBedrooms(bedrooms + 1); setStudio(false); }}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms Row */}
                <div 
                  onClick={() => setActiveDetail('bathroom')}
                  className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                    activeDetail === 'bathroom' ? 'border-teal-500 bg-teal-500/5' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚿</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Bathrooms</h4>
                      <p className="text-[10px] text-slate-400">Sanitize toilet, shower, counters, and mirror surfaces</p>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5">
                    <button 
                      onClick={() => { setBathrooms(Math.max(0, bathrooms - 1)); setStudio(false); }}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-slate-900 min-w-[12px] text-center">{bathrooms}</span>
                    <button 
                      onClick={() => { setBathrooms(bathrooms + 1); setStudio(false); }}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-3 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Sq Footage (optional)</label>
                  <input
                    type="number"
                    value={sqft || ''}
                    onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 1200"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/50">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800">🐾 Pets at Home</h4>
                    <p className="text-[9px] text-slate-400">Check if pets will be present</p>
                  </div>
                  <button
                    onClick={() => setPets(!pets)}
                    className={`w-11 h-6 rounded-full relative transition duration-150 ${
                      pets ? 'bg-teal-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-150 ${
                      pets ? 'left-5' : 'left-0.5'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ADDITIONAL EXTRAS */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">Customize Your Clean</h3>
              <p className="text-[10px] text-slate-400">Choose custom extra add-ons offered by our team</p>
              
              {settings.extraFees.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No extra services configured in database settings.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settings.extraFees.map((fee) => {
                    const qty = getExtraQty(fee.id);
                    return (
                      <div 
                        key={fee.id}
                        className={`p-4 border rounded-xl flex items-center justify-between transition ${
                          qty > 0 ? 'border-teal-500 bg-teal-500/5' : 'border-slate-100 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">{fee.ico}</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{fee.name}</h4>
                            <span className="text-[10px] font-bold text-teal-600">+${fee.price}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExtraQty(fee.id, -1)}
                            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-900 min-w-[12px] text-center">{qty}</span>
                          <button
                            onClick={() => handleExtraQty(fee.id, 1)}
                            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PREFERRED SCHEDULE & SUMMARY REVIEW */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">Choose Preferred Booking Time</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Date *</label>
                  <input
                    type="date"
                    value={preferredDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Arrival Time Window *</label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Special Notes / Special Requests</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us if you have any key access box, gates, pets, or focus areas..."
                  rows={3}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition flex items-center gap-1.5"
              >
                <ChevronLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg transition flex items-center gap-1.5 ml-auto"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition ml-auto"
              >
                Submit Cleaning Request
              </button>
            )}
          </div>
        </div>

        {/* Right Col: Interactive detail panel OR Invoice Summary */}
        <div className="space-y-4">
          
          {/* Summary Panel (Estimated values) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4 shadow-sm">
            <h3 className="text-[10px] font-extrabold uppercase text-teal-400 tracking-wider">Booking Estimates</h3>
            
            <div className="space-y-2 divide-y divide-slate-800">
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-400">Service</span>
                <span className="font-extrabold capitalize text-teal-400">{serviceType} Clean</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-400">Property Selection</span>
                <span className="font-extrabold">
                  {studio ? 'Studio Flat' : `${bedrooms} Bed, ${bathrooms} Bath`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-slate-400">Intensity</span>
                <span className="font-extrabold capitalize">{cleanType}</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="flex justify-between items-start text-xs py-1.5">
                  <span className="text-slate-400">Extras Addons</span>
                  <div className="text-right font-extrabold space-y-0.5">
                    {selectedExtras.map((ext) => {
                      const fee = settings.extraFees.find((f) => f.id === ext.id);
                      return (
                        <div key={ext.id} className="text-[10px]">
                          {fee?.ico} {fee?.name} ({ext.qty}x)
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold block uppercase">Estimate Total</span>
                <span className="text-[9px] text-slate-500 font-bold block">
                  {settings.requestFormDisplay === 'range' ? `$${Math.round(estimatedTotal * 0.85)} - $${Math.round(estimatedTotal * 1.15)}` : 'Fixed quote'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                ${estimatedTotal}
              </h2>
            </div>
          </div>

          {/* Inclusions Detail panel based on active tab click */}
          {(step === 3 || activeDetail) && (
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3">
              {activeDetail ? (
                <>
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-2xl">
                      {roomDescriptions[activeDetail].ico}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {roomDescriptions[activeDetail].name} Inclusions
                      </h4>
                      <p className="text-[9px] text-slate-400">Clean checklist guidelines</p>
                    </div>
                  </div>
                  <div className="space-y-1 bg-slate-50/50 rounded-lg p-3 text-[10px] leading-relaxed text-slate-500">
                    <span className="font-bold text-slate-700 block">Description:</span>
                    <p>{roomDescriptions[activeDetail].desc}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Included Tasks:</span>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {roomDescriptions[activeDetail].includes.split(',').map((inc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-600 text-[10px] font-medium">
                          <span className="text-teal-500 font-black">✓</span>
                          <span>{inc.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center space-y-1 text-slate-400">
                  <span className="text-xl">👆</span>
                  <p className="text-[10px] font-bold">Tap on Studio, Bedrooms or Bathrooms row to view clean inclusions details.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
