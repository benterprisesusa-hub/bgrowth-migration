import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Camera, 
  CheckCircle2, 
  ChevronDown, 
  Navigation,
  Send,
  Eye,
  Briefcase
} from 'lucide-react';
import { JobOffer, TeamMember, ChatMessage } from '../types';
import { CHECKLIST_ITEMS } from '../data';

interface WorkerPortalProps {
  offers: JobOffer[];
  members: TeamMember[];
  onUpdateJobStatus: (jobId: string, status: 'open' | 'assigned' | 'expired' | 'cancelled' | 'done') => void;
  onUpdateChecklist: (jobId: string, tickedItems: string[]) => void;
  onSyncMileage?: (date: string, platform: string, miles: number, purpose: string) => void;
}

export default function WorkerPortal({ 
  offers, 
  members, 
  onUpdateJobStatus, 
  onUpdateChecklist,
  onSyncMileage
}: WorkerPortalProps) {
  
  // Find active cleaner members to mock portal login
  const cleanerMembers = members.filter(m => m.status === 'Active');
  const [selectedWorkerEmail, setSelectedWorkerEmail] = useState(cleanerMembers[0]?.email || '');
  const [selectedWorkerName, setSelectedWorkerName] = useState(cleanerMembers[0]?.name || 'Ana Silva');

  // Load jobs assigned to this worker
  const workerJobs = offers.filter(job => 
    job.assignedTo === selectedWorkerName && job.status !== 'cancelled'
  );

  // Expanded card state
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Tab within expanded card: 'details' | 'checklist' | 'photos' | 'messages'
  const [activeTab, setActiveTab] = useState<Record<string, 'details' | 'checklist' | 'photos' | 'messages'>>({});

  // Internal states for checklist, photo quantities and messages to mock persistence in current session
  const [localChecklists, setLocalChecklists] = useState<Record<string, string[]>>({});
  const [beforePhotos, setBeforePhotos] = useState<Record<string, string[]>>({});
  const [afterPhotos, setAfterPhotos] = useState<Record<string, string[]>>({});
  
  // Messaging state
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'off3': [
      { id: '1', jobId: 'off3', sender: 'office', senderName: 'Office Admin', message: 'Hello Ana! Good luck with the Emma Watson studio deep clean today.', createdAt: new Date().toISOString() }
    ]
  });
  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync worker name when email changes
  const handleWorkerChange = (email: string) => {
    setSelectedWorkerEmail(email);
    const m = members.find(x => x.email === email);
    if (m) {
      setSelectedWorkerName(m.name);
      setExpandedJobId(null);
    }
  };

  // Scroll to bottom of active message thread
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, expandedJobId]);

  // Set default checklists or sync with global
  useEffect(() => {
    const initialChecklists: Record<string, string[]> = {};
    workerJobs.forEach(job => {
      // Look for default checklist ticked items or mock first 2 as done
      const key = job.serviceType as keyof typeof CHECKLIST_ITEMS;
      const items = CHECKLIST_ITEMS[key] || CHECKLIST_ITEMS['house'];
      initialChecklists[job.id] = items.slice(0, 2);
    });
    setLocalChecklists(prev => ({ ...initialChecklists, ...prev }));
  }, [selectedWorkerName]);

  const toggleJobExpansion = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!activeTab[jobId]) {
        setActiveTab(prev => ({ ...prev, [jobId]: 'details' }));
      }
    }
  };

  const setJobTab = (jobId: string, tab: 'details' | 'checklist' | 'photos' | 'messages') => {
    setActiveTab(prev => ({ ...prev, [jobId]: tab }));
  };

  const handleToggleChecklistItem = (jobId: string, item: string) => {
    const currentList = localChecklists[jobId] || [];
    let updated: string[];
    if (currentList.includes(item)) {
      updated = currentList.filter(i => i !== item);
    } else {
      updated = [...currentList, item];
    }
    
    setLocalChecklists(prev => ({ ...prev, [jobId]: updated }));
    onUpdateChecklist(jobId, updated);
  };

  const handleSimulatePhoto = (jobId: string, type: 'before' | 'after') => {
    const beforeUrls = [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=60'
    ];
    const afterUrls = [
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=60'
    ];

    const pool = type === 'before' ? beforeUrls : afterUrls;
    const currentPhotos = type === 'before' ? (beforePhotos[jobId] || []) : (afterPhotos[jobId] || []);
    
    if (currentPhotos.length >= 2) {
      return alert('Maximum of 2 photos uploaded for this stage.');
    }

    const newPhoto = pool[currentPhotos.length];
    if (type === 'before') {
      setBeforePhotos(prev => ({ ...prev, [jobId]: [...currentPhotos, newPhoto] }));
    } else {
      setAfterPhotos(prev => ({ ...prev, [jobId]: [...currentPhotos, newPhoto] }));
    }
  };

  const handleSendMessage = (jobId: string) => {
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      jobId,
      sender: 'cleaner',
      senderName: selectedWorkerName,
      message: inputMsg,
      createdAt: new Date().toISOString()
    };

    const currentThread = chatMessages[jobId] || [];
    setChatMessages(prev => ({ ...prev, [jobId]: [...currentThread, newMsg] }));
    setInputMsg('');

    // Simulated response from office
    setTimeout(() => {
      const officeResponses = [
        "Perfect, thank you Ana! Let us know when you finish so we can verify the checklist.",
        "Got it! We have logged that note.",
        "Excellent job with those photo updates. The client is thrilled!",
        "Thanks! Safe travels to your next cleaning job."
      ];
      const randomResponse = officeResponses[Math.floor(Math.random() * officeResponses.length)];
      
      const responseMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        jobId,
        sender: 'office',
        senderName: 'Office Admin',
        message: randomResponse,
        createdAt: new Date().toISOString()
      };

      setChatMessages(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), responseMsg]
      }));
    }, 1500);
  };

  // Group jobs
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayJobs = workerJobs.filter(j => j.date === todayStr);
  const upcomingJobs = workerJobs.filter(j => j.date > todayStr);
  const pastJobs = workerJobs.filter(j => j.date < todayStr || j.status === 'done');

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
            Mobile Worker Portal
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">My Jobs & Active Dispatches</h2>
          <p className="text-xs text-slate-400">Mockup of the clean web-link view accessed by staff members on site</p>
        </div>

        {/* Mock cleaner selector to login */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">Logged in as:</span>
          <select
            value={selectedWorkerEmail}
            onChange={(e) => handleWorkerChange(e.target.value)}
            className="text-xs font-black text-indigo-600 outline-none bg-transparent cursor-pointer"
          >
            {cleanerMembers.map(m => (
              <option key={m.id} value={m.email}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-900 text-white rounded-xl p-4 text-center">
          <span className="text-xl">📅</span>
          <span className="text-lg font-black block mt-1">{todayJobs.length}</span>
          <span className="text-[9px] uppercase tracking-wider opacity-60 font-extrabold">Today's Jobs</span>
        </div>
        <div className="bg-indigo-700 text-white rounded-xl p-4 text-center">
          <span className="text-xl">🔜</span>
          <span className="text-lg font-black block mt-1">{upcomingJobs.length}</span>
          <span className="text-[9px] uppercase tracking-wider opacity-60 font-extrabold">Upcoming</span>
        </div>
        <div className="bg-emerald-600 text-white rounded-xl p-4 text-center">
          <span className="text-xl">✓</span>
          <span className="text-lg font-black block mt-1">
            {workerJobs.filter(j => j.status === 'done').length}
          </span>
          <span className="text-[9px] uppercase tracking-wider opacity-60 font-extrabold">Completed YTD</span>
        </div>
      </div>

      {workerJobs.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-xl mx-auto">
            📋
          </div>
          <h4 className="text-xs font-black text-slate-600">No active dispatches found</h4>
          <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
            There are currently no active clean dispatches registered to <b>{selectedWorkerName}</b>. Use the **Job Board** tab to assign jobs to Ana Silva or other team members!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TODAY SCHEDULE */}
          {todayJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Scheduled for Today ({todayJobs.length})
              </h3>
              
              <div className="space-y-3">
                {todayJobs.map(job => {
                  const isExpanded = expandedJobId === job.id;
                  const currentTab = activeTab[job.id] || 'details';
                  const jobChecklist = CHECKLIST_ITEMS[job.serviceType as keyof typeof CHECKLIST_ITEMS] || CHECKLIST_ITEMS['house'];
                  const ticked = localChecklists[job.id] || [];
                  const pct = Math.round((ticked.length / Math.max(jobChecklist.length, 1)) * 100);

                  return (
                    <div 
                      key={job.id} 
                      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition duration-150 ${
                        isExpanded ? 'border-indigo-200 shadow-md ring-4 ring-indigo-500/5' : 'border-slate-100'
                      }`}
                    >
                      {/* Job Header Summary */}
                      <div 
                        onClick={() => toggleJobExpansion(job.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg">
                            🧹
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{job.client}</h4>
                            <p className="text-[10px] text-slate-400 font-bold capitalize">
                              {job.serviceType} clean · {job.address.split(',')[0]}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="text-xs font-black text-indigo-600 block">{job.time}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{job.duration} hours</span>
                          </div>
                          <ChevronDown 
                            size={16} 
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-indigo-600' : ''}`} 
                          />
                        </div>
                      </div>

                      {/* Expandable Tabs area */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 animate-fade-in bg-slate-50/45">
                          {/* Tab buttons */}
                          <div className="flex border-b border-slate-100 bg-slate-50">
                            {(['details', 'checklist', 'photos', 'messages'] as const).map(tab => (
                              <button
                                key={tab}
                                onClick={() => setJobTab(job.id, tab)}
                                className={`flex-1 py-2.5 text-[10px] font-extrabold capitalize border-b-2 transition ${
                                  currentTab === tab 
                                    ? 'border-indigo-600 text-indigo-600 bg-white' 
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          {/* Tab Contents */}
                          <div className="p-4 bg-white">
                            
                            {/* DETAILS TAB */}
                            {currentTab === 'details' && (
                              <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                                  <div className="bg-slate-50 p-2.5 rounded-lg">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Time</span>
                                    <span className="text-slate-800 font-extrabold">{job.time} ({job.duration} hr)</span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-lg">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Payout</span>
                                    <span className="text-emerald-600 font-black">${job.payment.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-50 p-2.5 rounded-lg text-xs">
                                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">📍 Address</span>
                                  <span className="text-slate-800 font-bold block">{job.address}</span>
                                  <a 
                                    href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-indigo-600 font-extrabold text-[10px] mt-2 bg-indigo-50 px-2.5 py-1 rounded-md"
                                  >
                                    <Navigation size={10} />
                                    Open in Google Maps
                                  </a>
                                </div>

                                {job.notes && (
                                  <div className="bg-amber-50/55 border border-amber-100 p-2.5 rounded-lg text-xs italic text-slate-600">
                                    <span className="text-[8px] not-italic uppercase tracking-wider font-extrabold text-amber-700 block mb-0.5">Notes</span>
                                    "{job.notes}"
                                  </div>
                                )}

                                <div className="pt-2 space-y-2">
                                  {job.status === 'done' ? (
                                    <>
                                      <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-100">
                                        <CheckCircle2 size={14} />
                                        Completed ✓ Job Marked Done
                                      </div>
                                      {onSyncMileage && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const defaultMiles = "10.0";
                                            const inputMiles = prompt("How many miles did you drive for this cleaning job?", defaultMiles);
                                            if (inputMiles !== null) {
                                              const miles = parseFloat(inputMiles);
                                              if (isNaN(miles) || miles <= 0) {
                                                alert("Please enter a valid mileage value greater than 0.");
                                                return;
                                              }
                                              onSyncMileage(
                                                job.date,
                                                'BGrowth Cleaning',
                                                miles,
                                                `Cleaning visit for client: ${job.client}`
                                              );
                                              alert("Travel mileage successfully synchronized to Mileage Tracker!");
                                            }
                                          }}
                                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition flex items-center justify-center gap-1.5 border border-indigo-100"
                                        >
                                          🚗 Sync Travel Miles to Mileage Tracker
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        onUpdateJobStatus(job.id, 'done');
                                        alert('Success! Job completed.');
                                      }}
                                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-md shadow-emerald-500/15"
                                    >
                                      Mark Job as Completed ✓
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* CHECKLIST TAB */}
                            {currentTab === 'checklist' && (
                              <div className="space-y-4 animate-fade-in">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-slate-400">
                                    <span>Cleaning Checklist ({ticked.length} / {jobChecklist.length})</span>
                                    <span className="text-indigo-600 font-black">{pct}% done</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>

                                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                                  {jobChecklist.map((item, idx) => {
                                    const done = ticked.includes(item);
                                    return (
                                      <div 
                                        key={item}
                                        onClick={() => handleToggleChecklistItem(job.id, item)}
                                        className="flex items-center gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition cursor-pointer text-xs font-semibold"
                                      >
                                        <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition ${
                                          done ? 'bg-indigo-600 border-indigo-600 text-white font-black' : 'border-slate-300 bg-white'
                                        }`}>
                                          {done && <Check size={10} strokeWidth={3} />}
                                        </div>
                                        <span className={done ? 'text-slate-400 line-through' : 'text-slate-800'}>
                                          {idx + 1}. {item}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* PHOTOS TAB */}
                            {currentTab === 'photos' && (
                              <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                  {/* Before photos */}
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Before Clean ({beforePhotos[job.id]?.length || 0}/2)</h5>
                                    
                                    <div className="flex gap-2">
                                      {(beforePhotos[job.id] || []).map((img, i) => (
                                        <img key={i} src={img} alt="before" className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm" />
                                      ))}
                                      {(beforePhotos[job.id]?.length || 0) < 2 && (
                                        <button 
                                          onClick={() => handleSimulatePhoto(job.id, 'before')}
                                          className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 border-dashed rounded-lg flex items-center justify-center transition"
                                        >
                                          <Camera size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* After photos */}
                                  <div className="space-y-2">
                                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">After Clean ({afterPhotos[job.id]?.length || 0}/2)</h5>
                                    
                                    <div className="flex gap-2">
                                      {(afterPhotos[job.id] || []).map((img, i) => (
                                        <img key={i} src={img} alt="after" className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm" />
                                      ))}
                                      {(afterPhotos[job.id]?.length || 0) < 2 && (
                                        <button 
                                          onClick={() => handleSimulatePhoto(job.id, 'after')}
                                          className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 border-dashed rounded-lg flex items-center justify-center transition"
                                        >
                                          <Camera size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* MESSAGES TAB */}
                            {currentTab === 'messages' && (
                              <div className="space-y-3 animate-fade-in flex flex-col h-64 bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-hidden">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                  {(chatMessages[job.id] || []).map(msg => {
                                    const isMe = msg.sender === 'cleaner';
                                    return (
                                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[8px] font-bold text-slate-400 mb-0.5">{msg.senderName}</span>
                                        <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[11px] font-semibold leading-normal ${
                                          isMe 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                                        }`}>
                                          {msg.message}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div ref={chatEndRef} />
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-slate-200/60 shrink-0">
                                  <input
                                    type="text"
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    placeholder="Type a message to office..."
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSendMessage(job.id);
                                    }}
                                    className="flex-1 text-[11px] font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                                  />
                                  <button
                                    onClick={() => handleSendMessage(job.id)}
                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                                  >
                                    <Send size={12} />
                                  </button>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* UPCOMING SCHEDULE */}
          {upcomingJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Upcoming Jobs ({upcomingJobs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingJobs.map(job => (
                  <div key={job.id} className="bg-white border border-slate-100 rounded-xl p-3.5 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase bg-slate-50 text-slate-400 px-2 py-0.5 rounded">
                        {job.date}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1">{job.client}</h4>
                      <p className="text-[10px] text-slate-400 font-bold capitalize">{job.serviceType} clean</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-indigo-600 block">{job.time}</span>
                      <span className="text-[9px] text-slate-400">{job.duration}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAST/COMPLETED SCHEDULE */}
          {pastJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Past Completed Jobs (Showing {Math.min(pastJobs.length, 3)})
              </h3>
              <div className="space-y-2">
                {pastJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">✓</div>
                      <div>
                        <span className="text-slate-800 font-extrabold">{job.client}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">{job.date} · {job.address.split(',')[0]}</span>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-black">+${job.payment.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
