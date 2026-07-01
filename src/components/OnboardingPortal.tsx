import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  FileText, 
  Check, 
  Camera, 
  ShieldCheck, 
  Briefcase, 
  CheckCircle, 
  ArrowRight,
  Upload,
  AlertCircle
} from 'lucide-react';
import { TeamMember, AppSettings } from '../types';

interface OnboardingPortalProps {
  settings: AppSettings;
  onCompleteOnboarding: (newMember: TeamMember) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const DOCUMENT_TYPES = [
  { id: 'dl', name: 'Driver License', desc: 'State-issued photo ID' },
  { id: 'bgc', name: 'Background Check', desc: 'Clean background record' },
  { id: 'ins', name: 'General Liability Insurance', desc: 'Proof of active insurance' },
  { id: 'w9', name: 'Form W-9', desc: 'Taxpayer identification number' },
  { id: 'contract', name: 'Service Level Agreement', desc: 'Signed club guidelines' }
];

export default function OnboardingPortal({ settings, onCompleteOnboarding }: OnboardingPortalProps) {
  const bizName = settings.bizProfile?.name || 'BGrowth Cleaning Club';
  
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Step 2: Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');

  // Step 3: Availability & Preferences
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('18:00');
  const [transportation, setTransportation] = useState(true);
  const [emergencyJobs, setEmergencyJobs] = useState(false);
  const [weekends, setWeekends] = useState(false);

  // Step 4: Documents Upload Status
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: string }>>({});

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMockDocUpload = (docId: string, name: string) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docId]: {
        name: `${name.replace(/\s+/g, '_')}_verified.pdf`,
        size: '1.2 MB'
      }
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
        return alert('Please fill in your Name and Phone Number.');
      }
      setStep(2);
    } else if (step === 2) {
      if (!zipcode.trim()) {
        return alert('Please fill in your ZIP code.');
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleSubmitRegistration = () => {
    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone,
      zipcode,
      role: 'Cleaner',
      memberType: 'on-demand',
      status: 'Active',
      payType: 'percent',
      payRate: 60,
      transportation,
      emergencyJobs,
      maxDistance: 20,
      notes: `Registered via portal on ${new Date().toLocaleDateString()}. Documents uploaded: ${Object.keys(uploadedDocs).join(', ') || 'none'}`
    };

    onCompleteOnboarding(newMember);
    setIsSuccess(true);
  };

  const renderStepsBar = () => {
    const stepNames = ['Personal', 'Address', 'Availability', 'Documents', 'Confirm'];
    return (
      <div className="flex items-center justify-between mb-8 px-2 max-w-xl mx-auto">
        {stepNames.map((name, index) => {
          const num = index + 1;
          const isDone = step > num || isSuccess;
          const isActive = step === num && !isSuccess;
          return (
            <React.Fragment key={name}>
              <div className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                  isDone 
                    ? 'bg-emerald-500 text-slate-950' 
                    : isActive 
                      ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/15' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {isDone ? <Check size={14} strokeWidth={3} /> : num}
                </div>
                <span className={`text-[10px] font-black tracking-tight ${
                  isActive ? 'text-teal-600' : isDone ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {name}
                </span>
              </div>
              {index < stepNames.length - 1 && (
                <div className={`h-[2px] flex-1 -mt-4 transition-all duration-300 ${
                  isDone ? 'bg-emerald-500' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md">
            Candidate Pipeline
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">Complete Your Onboarding</h2>
          <p className="text-xs text-slate-400">Secure link mock provided to hired candidates to upload credentials & finalize contracts</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-slate-900 block">{bizName}</span>
          <span className="text-[10px] text-slate-400">Team Intake Department</span>
        </div>
      </div>

      {isSuccess ? (
        /* SUCCESS LANDING PAGE */
        <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-2xl p-10 shadow-sm text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">
            ✓
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Registration Complete!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Welcome to the family, <b className="text-slate-800">{firstName}</b>! Your profile has been created and synced with the active business rosters.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-left text-xs font-semibold text-slate-600 space-y-2 max-w-md mx-auto">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Active Name</span>
              <span className="text-slate-800 font-extrabold">{firstName} {lastName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Email Address</span>
              <span className="text-slate-800 font-extrabold">{firstName.toLowerCase()}.{lastName.toLowerCase()}@example.com</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-400">Assigned Payout Rate</span>
              <span className="text-teal-600 font-extrabold">60% Payout Share</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">Deduction Tracker Status</span>
              <span className="text-emerald-600 font-extrabold">Ready</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                setStep(1);
                setIsSuccess(false);
                setFirstName('');
                setLastName('');
                setPhone('');
                setPhoto(null);
                setUploadedDocs({});
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition"
            >
              Simulate New Onboarding
            </button>
          </div>
        </div>
      ) : (
        /* MULTI-STEP WIZARD */
        <div className="max-w-2xl mx-auto">
          {renderStepsBar()}

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-teal-600" />
                    Step 1: Personal Details
                  </h3>
                  <p className="text-[10px] text-slate-400">Kindly enter your formal credentials & optionally select a profile photo.</p>
                </div>

                {/* Profile photo drag area */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-100 rounded-2xl bg-teal-50/10 text-center relative hover:bg-teal-50/20 transition duration-150">
                  {photo ? (
                    <div className="relative">
                      <img src={photo} alt="preview" className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-md" />
                      <button 
                        type="button" 
                        onClick={() => setPhoto(null)} 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                        <Camera size={20} />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-teal-600 block">Upload Profile Photo</span>
                        <span className="text-[9px] text-slate-400">Optional - visible to dispatchers & clients</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ana"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Silva"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(305) 555-0101"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <MapPin size={16} className="text-teal-600" />
                    Step 2: Home Address
                  </h3>
                  <p className="text-[10px] text-slate-400">Enter your residence address to configure your travel range parameters.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Ocean Drive, Apt 4"
                    className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">ZIP Code *</label>
                    <input
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="33139"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Miami Beach"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="FL"
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-teal-600" />
                    Step 3: Availability & Toggles
                  </h3>
                  <p className="text-[10px] text-slate-400">Tweak the days and preferences below so jobs populate your custom queue correctly.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block">Weekly Availability</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEKDAYS.map((day) => {
                      const active = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`py-2 text-[10px] font-black border rounded-xl transition-all text-center ${
                            active 
                              ? 'bg-teal-500 border-teal-500 text-slate-950 shadow-sm shadow-teal-500/10' 
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Work Hours (From)</label>
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Work Hours (To)</label>
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block">Job Preferences</label>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">🚗 Transportation</span>
                      <span className="text-[10px] text-slate-400">Own car or reliable transport for timely dispatches</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTransportation(!transportation)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors duration-150 ${transportation ? 'bg-teal-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-150 ${transportation ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">⚡ Emergency Jobs</span>
                      <span className="text-[10px] text-slate-400">Available to receive same-day dispatches and urgent calls</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmergencyJobs(!emergencyJobs)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors duration-150 ${emergencyJobs ? 'bg-teal-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-150 ${emergencyJobs ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-teal-600" />
                    Step 4: Upload Credentials
                  </h3>
                  <p className="text-[10px] text-slate-400">Please provide copies of required files. Verification takes up to 24 hours.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {DOCUMENT_TYPES.map((doc) => {
                    const status = uploadedDocs[doc.id];
                    return (
                      <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-extrabold text-slate-800 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.desc}</span>
                          {status && (
                            <span className="text-[9px] text-emerald-600 font-bold block mt-1">
                              ✓ {status.name} ({status.size})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMockDocUpload(doc.id, doc.name)}
                          className={`px-3 py-1.5 border text-[10px] font-black rounded-xl transition flex items-center gap-1.5 ${
                            status 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-slate-50'
                          }`}
                        >
                          <Upload size={12} />
                          {status ? 'Replace' : 'Upload File'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-600" />
                    Step 5: Review & Submit
                  </h3>
                  <p className="text-[10px] text-slate-400">Please review all values prior to final submission.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 divide-y divide-slate-200/60 text-xs font-semibold text-slate-600 space-y-2.5">
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-400">Hiring Name</span>
                    <span className="text-slate-800 font-extrabold">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between pt-2 pb-2">
                    <span className="text-slate-400">Phone Number</span>
                    <span className="text-slate-800 font-extrabold">{phone}</span>
                  </div>
                  <div className="flex justify-between pt-2 pb-2">
                    <span className="text-slate-400">Traveling Radius</span>
                    <span className="text-slate-800 font-extrabold">Within 20 miles of {zipcode || 'Address'}</span>
                  </div>
                  <div className="flex justify-between pt-2 pb-2">
                    <span className="text-slate-400">Weekly Days</span>
                    <span className="text-slate-800 font-extrabold">{selectedDays.join(', ') || 'None selected'}</span>
                  </div>
                  <div className="flex justify-between pt-2 pb-2">
                    <span className="text-slate-400">Work Window</span>
                    <span className="text-slate-800 font-extrabold">{timeFrom} to {timeTo}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Transportation</span>
                    <span className="text-slate-800 font-extrabold">{transportation ? '🚗 Owns car' : '❌ Public/Other'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 text-amber-800 rounded-xl text-[10px] font-semibold flex gap-2 border border-amber-100/50">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>By submitting, you agree to the Service Level Agreement and certify all uploaded document credentials are accurate.</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  ← Back
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-teal-500/10"
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRegistration}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-emerald-500/10"
                >
                  🎉 Complete Registration
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
