import React, { useState } from 'react';
import { 
  UserPlus, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Application, AppSettings } from '../types';

interface RecruitmentPortalProps {
  settings: AppSettings;
  onSubmitApplication: (app: Application) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export default function RecruitmentPortal({ settings, onSubmitApplication }: RecruitmentPortalProps) {
  const biz = settings.bizProfile || { name: 'BGrowth Cleaning Club' };
  
  // Application Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  // Weekly availability grid
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('18:00');

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');
    if (!email.trim() || !email.includes('@')) return alert('Please enter a valid email address');

    setIsLoading(true);

    const formattedAvailability = selectedDays.length > 0 
      ? `${selectedDays.join(', ')} | ${timeFrom} - ${timeTo}`
      : `Flexible Availability`;

    const newApp: Application = {
      id: `app_${Date.now()}`,
      name,
      email,
      phone: phone || '(305) 555-0100',
      availability: formattedAvailability,
      message: message || 'Submitted via recruitment candidate portal.',
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitApplication(newApp);
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setMessage('');
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setTimeFrom('08:00');
    setTimeTo('18:00');
    setIsSuccess(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h2 className="text-lg font-black text-slate-900">Team Application Portal</h2>
        <p className="text-xs text-slate-400">Public candidate recruitment page matching our Google Apps Script team intake form</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive application form */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          {isSuccess ? (
            /* Elegant candidate success display */
            <div className="text-center py-12 space-y-5 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto shadow-md">
                ✓
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you, <b className="text-slate-800 font-extrabold">{name}</b>! We received your application and availability details for <b>{biz.name}</b>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left max-w-md mx-auto text-[11px] space-y-2 text-slate-600 font-medium">
                <div>📬 <span className="font-bold text-slate-800">Email Address:</span> {email}</div>
                <div>📞 <span className="font-bold text-slate-800">Phone Number:</span> {phone || 'Not specified'}</div>
                <div>📅 <span className="font-bold text-slate-800">Availability:</span> {selectedDays.join(', ')} ({timeFrom} - {timeTo})</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Intake Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Category section */}
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-1.5">
                  <UserPlus size={14} />
                  Join the Cleaning Crew
                </h3>
                <p className="text-[10px] text-slate-400">Fill in your information to register as an active cleaning partner.</p>
              </div>

              <div className="space-y-3.5">
                
                {/* Personal details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maria Rodrigues"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maria@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-slate-400" size={14} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(305) 555-0301"
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 1500 Collins Ave, Miami Beach FL"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Days available weekly grid */}
                <div className="space-y-2 border-t border-slate-50 pt-3">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400 block">Weekly Availability</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEKDAYS.map((day) => {
                      const active = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`py-2 text-[10px] font-black border rounded-lg transition-all text-center ${
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

                {/* Time ranges */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Available From</label>
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400">Available To</label>
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-50 pt-3">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Introduction & Experience / Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about yourself. E.g., 'Have 4 years of hotel experience...'"
                    rows={3}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none resize-none focus:border-teal-500"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-300 text-slate-950 font-black text-xs rounded-lg transition shadow-md shadow-teal-500/15"
                >
                  {isLoading ? 'Sending application...' : 'Submit Partner Application 🚀'}
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Right: Partner portal info */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">💼 Recruitment Intake Pipeline</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Candidates who submit an application on this portal are fed **directly** into the company's Recruitment Board.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl space-y-3.5 border border-slate-100">
            <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">How to test integration:</h4>
            
            <div className="text-[11px] font-medium text-slate-600 space-y-2.5">
              <div className="flex gap-2">
                <span className="text-teal-600 font-bold">1.</span>
                <span>Fill out the candidate form on the left with a mock name (e.g., 'Zinedine Zidane').</span>
              </div>
              <div className="flex gap-2">
                <span className="text-teal-600 font-bold">2.</span>
                <span>Choose days & hours and click <b>Submit Partner Application</b>.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-teal-600 font-bold">3.</span>
                <span>Navigate to the <b>Team & Payroll</b> tab in the sidebar.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-teal-600 font-bold">4.</span>
                <span>Under the <b>Applicants Queue</b> table, you will see your submitted application live! Managers can click 'Approve Applicant' to convert them into a locked cleaning partner.</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 border border-amber-100 text-amber-800 rounded-xl text-[10px] font-medium flex items-center gap-2">
            <span>🛡️</span>
            <span>All credentials, rates, and schedule details are saved in the client-side state machine securely.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
