import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Camera, 
  Check, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  Sparkles,
  RefreshCw,
  User,
  CheckCircle2
} from 'lucide-react';
import { JobOffer, AppSettings } from '../types';
import { CHECKLIST_ITEMS } from '../data';

interface LivePortalProps {
  offers: JobOffer[];
  settings: AppSettings;
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'cleaner';
  senderName: string;
  text: string;
  photoUrl?: string;
  time: string;
}

export default function LivePortal({ offers, settings }: LivePortalProps) {
  const biz = settings.bizProfile || { name: 'BGrowth Cleaning Club', phone: '(305) 555-0199', email: 'info@bgrowth.com' };
  
  // Find only assigned or active jobs to showcase in portal selector
  const activeJobs = offers.filter(o => o.status === 'assigned');
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || '');

  // Active Job state
  const currentJob = offers.find(o => o.id === selectedJobId) || offers[0];

  // Checklist state for current job
  const checklistItems = currentJob ? (CHECKLIST_ITEMS[currentJob.serviceType as keyof typeof CHECKLIST_ITEMS] || CHECKLIST_ITEMS['house']) : [];
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Message board state
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'off1': [
      { id: '1', sender: 'cleaner', senderName: 'Ana Silva', text: 'Hi! I will be arriving in 15 minutes. See you soon!', time: '08:45 AM' }
    ],
    'off3': [
      { id: '1', sender: 'cleaner', senderName: 'Ana Silva', text: 'Hello! I have started the deep clean. The dog is very friendly!', time: '02:05 PM' },
      { id: '2', sender: 'client', senderName: 'You', text: 'Awesome! Thank you so much, Ana.', time: '02:10 PM' }
    ]
  });

  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Set default completed tasks when job changes
  useEffect(() => {
    if (currentJob) {
      // Default first 3 tasks as completed
      setCompletedTasks(checklistItems.slice(0, 3));
    }
  }, [selectedJobId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedJobId]);

  const handleToggleTask = (task: string) => {
    if (completedTasks.includes(task)) {
      setCompletedTasks(completedTasks.filter(t => t !== task));
    } else {
      setCompletedTasks([...completedTasks, task]);
    }
  };

  const handleSendMessage = (textToSend?: string, customPhoto?: string) => {
    const msgText = textToSend || inputText.trim();
    if (!msgText && !customPhoto) return;

    if (!currentJob) return;

    const jobId = currentJob.id;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'client',
      senderName: 'You',
      text: msgText,
      photoUrl: customPhoto,
      time: timeStr
    };

    const updatedJobMessages = [...(messages[jobId] || []), newMsg];
    setMessages(prev => ({
      ...prev,
      [jobId]: updatedJobMessages
    }));

    if (!textToSend) setInputText('');

    // Simulated Cleaner Response after 1.5 seconds
    setTimeout(() => {
      const responses = [
        "Received! We are currently working in the kitchen and will handle that next.",
        "Got it! Let me know if there is anything else you need me to focus on.",
        "Thanks for the heads-up. We are finishing up the bedrooms right now!",
        "Understood. The keys have been returned to the lockbox as requested."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const replyMsg: ChatMessage = {
        id: `reply_${Date.now()}`,
        sender: 'cleaner',
        senderName: currentJob.assignedTo || 'Ana Silva',
        text: randomReply,
        time: replyTime
      };

      setMessages(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), replyMsg]
      }));
    }, 1500);
  };

  const handleMockPhoto = () => {
    const photoOptions = [
      { name: 'Kitchen Counters.jpg', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=60' },
      { name: 'Polished Bathroom.jpg', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=60' },
      { name: 'Vacuumed Rugs.jpg', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=60' }
    ];
    const pickedPhoto = photoOptions[Math.floor(Math.random() * photoOptions.length)];
    handleSendMessage(`Attached progress photo: "${pickedPhoto.name}"`, pickedPhoto.url);
  };

  const currentJobMessages = currentJob ? (messages[currentJob.id] || []) : [];
  const pct = currentJob ? Math.round((completedTasks.length / Math.max(checklistItems.length, 1)) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Client Live Appointment Hub</h2>
          <p className="text-xs text-slate-400">Public-facing link mockup accessed by clients to monitor progress in real-time</p>
        </div>

        {/* Mock Job Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">Select Job to Preview:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="text-xs font-black text-teal-600 outline-none bg-transparent cursor-pointer"
          >
            {offers.map(job => (
              <option key={job.id} value={job.id}>
                {job.client} — {job.date} ({job.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentJob ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Mobile Frame Portal Mockup (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[70vh]">
            
            {/* Phone Screen: Right Side Details */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto border-r border-slate-100">
              
              {/* Portal Header */}
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 p-5 text-white flex justify-between items-center shadow">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧹</span>
                  <div>
                    <h3 className="text-xs font-black">{biz.name}</h3>
                    <p className="text-[9px] text-teal-300 font-bold uppercase tracking-widest">Active Clean Portal</p>
                  </div>
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  currentJob.status === 'assigned' ? 'bg-emerald-500/25 text-emerald-300' : 'bg-amber-500/25 text-amber-300'
                }`}>
                  {currentJob.status === 'assigned' ? 'In Progress' : currentJob.status}
                </span>
              </div>

              <div className="p-5 space-y-5">
                {/* Appointment Info Card */}
                <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Scheduled Time</span>
                    <span className="text-slate-800 font-black flex items-center gap-1">
                      <Calendar size={12} className="text-teal-600" />
                      {currentJob.date} at {currentJob.time}
                    </span>
                  </div>

                  {currentJob.assignedTo && (
                    <div className="flex justify-between items-center text-xs border-t border-teal-100/40 pt-2.5">
                      <span className="text-slate-400 font-bold">Your Cleaner</span>
                      <span className="text-slate-800 font-black flex items-center gap-1">
                        <User size={12} className="text-teal-600" />
                        {currentJob.assignedTo}
                      </span>
                    </div>
                  )}

                  {currentJob.notes && (
                    <div className="text-[10px] text-slate-500 italic border-t border-teal-100/40 pt-2.5">
                      <span className="font-bold text-slate-700 block not-italic uppercase tracking-wider text-[8px] mb-0.5">Special Instructions:</span>
                      "{currentJob.notes}"
                    </div>
                  )}
                </div>

                {/* Progress Meter Checklist */}
                {checklistItems.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <span>⚡ Room Cleaning Progress</span>
                      <span className="text-teal-600 font-black">{pct}% done</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                      {checklistItems.map((item) => {
                        const done = completedTasks.includes(item);
                        return (
                          <div 
                            key={item}
                            onClick={() => handleToggleTask(item)}
                            className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer text-[11px] font-medium text-slate-700"
                          >
                            <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-all ${
                              done ? 'bg-teal-500 border-teal-500 text-slate-950 font-black' : 'border-slate-300 bg-white'
                            }`}>
                              {done && <Check size={10} />}
                            </div>
                            <span className={done ? 'text-slate-400 line-through' : 'text-slate-800 font-semibold'}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Chat Thread Panel: Right (or Bottom) Side (4 cols) */}
            <div className="flex-1 flex flex-col h-full bg-slate-50">
              
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-2 shadow-sm shrink-0">
                <MessageSquare size={16} className="text-teal-600" />
                <span className="text-xs font-black text-slate-800">
                  Chat with {currentJob.assignedTo || 'Office'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-auto" />
              </div>

              {/* Message thread */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[50vh] md:max-h-[55vh]">
                {currentJobMessages.length === 0 ? (
                  <div className="py-12 text-center text-[10px] text-slate-400 italic">
                    No messages yet. Send a greeting to your cleaner!
                  </div>
                ) : (
                  currentJobMessages.map((msg) => {
                    const isMe = msg.sender === 'client';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] text-slate-400 font-bold mb-0.5">{msg.senderName}</span>
                        <div className={`max-w-[85%] rounded-xl p-2.5 text-[11px] font-semibold leading-relaxed ${
                          isMe 
                            ? 'bg-teal-500 text-slate-950 rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.text}
                          {msg.photoUrl && (
                            <img 
                              src={msg.photoUrl} 
                              alt="progress" 
                              referrerPolicy="no-referrer"
                              className="mt-2 rounded-lg max-h-32 object-cover block shadow border border-slate-100" 
                            />
                          )}
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 font-bold">{msg.time}</span>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 space-y-2 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="Type a message to your cleaner..."
                    className="flex-1 text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg transition"
                  >
                    <Send size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handleMockPhoto}
                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded text-[9px] font-extrabold flex items-center gap-1"
                  >
                    <Camera size={10} />
                    📷 Mock Photo Attachment
                  </button>
                  <span className="text-[8px] text-slate-400 font-bold">Auto-reply enabled</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Portal Explanation (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider">📦 Portal Simulator Guide</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This interactive component simulates the **live portal** web link generated by our Google Apps Script codebase. When dispatching offers, clients receive a secure token link to visit this screen.
            </p>

            <div className="space-y-3.5 divide-y divide-slate-100 text-[11px] font-medium text-slate-500">
              <div className="pt-3 space-y-1">
                <span className="font-extrabold text-slate-800 block">✔️ Live Checklist</span>
                <span>As cleaners check off items on their end (or inside this mock portal), clients see the progress meter update in real time.</span>
              </div>
              <div className="pt-3 space-y-1">
                <span className="font-extrabold text-slate-800 block">💬 Messenger Channel</span>
                <span>Enables friction-free direct messaging between client and office/cleaners, fully synced.</span>
              </div>
              <div className="pt-3 space-y-1">
                <span className="font-extrabold text-slate-800 block">📷 Before/After Photos</span>
                <span>Simulate sending photo updates of clean areas directly through the chat thread for client approval.</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-[10px] text-slate-500 flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span>Type and send a message on the left to test the instant automated cleaner response system!</span>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
          <span className="text-4xl block">📱</span>
          <h4 className="text-xs font-black text-slate-400 font-black">No assigned cleaning jobs found</h4>
          <p className="text-[10px] text-slate-400">Please assign a team member to an open job offer in the <b>Job Board</b> first to unlock live client portal previews.</p>
        </div>
      )}

    </div>
  );
}
