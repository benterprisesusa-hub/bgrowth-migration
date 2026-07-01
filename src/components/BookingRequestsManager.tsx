import React, { useState } from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight,
  Plus,
  Info,
  Layers,
  List,
  Eye,
  Settings,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { BookingRequest } from '../types';

interface BookingRequestsManagerProps {
  requests: BookingRequest[];
  onPreFillOffer: (req: BookingRequest) => void;
  onRejectRequest: (id: string) => void;
  onUpdateRequestStatus: (id: string, status: BookingRequest['status']) => void;
  onAddRequest: (req: BookingRequest) => void;
}

export const CP_REQ_STAGES = [
  { id: 'New', label: 'New Lead', color: 'border-blue-500 bg-blue-50 text-blue-700 font-black' },
  { id: 'Contacted', label: 'Contacted', color: 'border-purple-500 bg-purple-50 text-purple-700 font-black' },
  { id: 'Quoted', label: 'Quoted', color: 'border-amber-500 bg-amber-50 text-amber-700 font-black' },
  { id: 'Awaiting', label: 'Awaiting Decision', color: 'border-cyan-500 bg-cyan-50 text-cyan-700 font-black' },
  { id: 'Booked', label: 'Booked', color: 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' },
  { id: 'Lost', label: 'Lost Lead', color: 'border-rose-500 bg-rose-50 text-rose-700 font-black' }
] as const;

export default function BookingRequestsManager({
  requests,
  onPreFillOffer,
  onRejectRequest,
  onUpdateRequestStatus,
  onAddRequest
}: BookingRequestsManagerProps) {
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);

  // Manual Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadAddress, setLeadAddress] = useState('');
  const [leadZip, setLeadZip] = useState('');
  const [leadService, setLeadService] = useState('house');
  const [leadDate, setLeadDate] = useState('');
  const [leadTime, setLeadTime] = useState('09:00');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadTotal, setLeadTotal] = useState('180');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim()) return alert('Name is required');

    const newReq: BookingRequest = {
      id: `req_${Date.now()}`,
      name: leadName,
      phone: leadPhone || '(305) 555-0100',
      email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address: leadAddress || '100 Ocean Drive',
      complement: '',
      zip: leadZip || '33139',
      city: 'Miami Beach',
      state: 'FL',
      accessInstructions: '',
      serviceType: leadService,
      propertyType: 'house',
      cleanType: 'standard',
      studio: false,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      pets: false,
      extras: [],
      preferredDate: leadDate || new Date().toISOString().split('T')[0],
      preferredTime: leadTime,
      notes: leadNotes,
      estimatedTotal: parseFloat(leadTotal) || 180,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    onAddRequest(newReq);
    setShowAddLead(false);
    
    // Reset Form
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadAddress('');
    setLeadZip('');
    setLeadService('house');
    setLeadDate('');
    setLeadNotes('');
    setLeadTotal('180');
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Lead Inbox & Booking Pipeline</h2>
          <p className="text-xs text-slate-400">Track and manage prospective leads from initial contact to booking conversion</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'kanban' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Layers size={13} />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'list' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List size={13} />
              Pending List
            </button>
          </div>

          <button
            onClick={() => setShowAddLead(true)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Manual Lead
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        /* Kanban Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start select-none">
          {CP_REQ_STAGES.map((stage) => {
            const cards = requests.filter(r => r.status === stage.id);
            return (
              <div key={stage.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-[200px] flex flex-col space-y-3">
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 rounded-md ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-black text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-full shadow-sm min-w-[20px] text-center">
                    {cards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-[10px] text-slate-400 italic">
                      Empty stage
                    </div>
                  ) : (
                    cards.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className="bg-white border-l-4 border-t border-r border-b border-slate-100 rounded-lg p-3 shadow-sm hover:border-slate-300 transition cursor-pointer space-y-2 group"
                        style={{ borderLeftColor: stage.id === 'New' ? '#3b82f6' : stage.id === 'Contacted' ? '#8b5cf6' : stage.id === 'Quoted' ? '#f59e0b' : stage.id === 'Awaiting' ? '#06b6d4' : stage.id === 'Booked' ? '#10b981' : '#ef4444' }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-extrabold text-slate-800 truncate group-hover:text-teal-600 transition">
                            {req.name}
                          </h4>
                        </div>
                        <div className="text-[10px] text-slate-400 space-y-0.5 font-medium">
                          <p className="capitalize">🧹 {req.serviceType} clean</p>
                          <p>📅 {req.preferredDate}</p>
                          <p className="font-extrabold text-slate-600">${req.estimatedTotal}</p>
                        </div>
                        
                        {/* Quick stage controls inside card */}
                        <div className="pt-1.5 border-t border-slate-50 flex items-center justify-between gap-1">
                          <span className="text-[8px] text-slate-400 font-bold">Quick Move:</span>
                          <div className="flex items-center gap-0.5">
                            {CP_REQ_STAGES.filter(s => s.id !== req.status).slice(0, 3).map((st) => (
                              <button
                                key={st.id}
                                title={`Move to ${st.label}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateRequestStatus(req.id, st.id as BookingRequest['status']);
                                }}
                                className="px-1 py-0.5 bg-slate-50 hover:bg-slate-100 text-[8px] font-black text-slate-500 hover:text-slate-800 rounded border border-slate-200"
                              >
                                {st.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Original Standard List View of pending requests */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase text-teal-600 tracking-wider flex items-center gap-2">
              <span>📥</span> Active Pipeline Leads ({requests.filter(r => r.status === 'New' || r.status === 'Pending').length})
            </h3>

            {requests.filter(r => r.status === 'New' || r.status === 'Pending').length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
                <span className="text-4xl block">🎉</span>
                <h4 className="text-xs font-black text-slate-400">All booking leads processed</h4>
                <p className="text-[10px] text-slate-400">No new client request forms awaiting review at this time.</p>
              </div>
            ) : (
              requests.filter(r => r.status === 'New' || r.status === 'Pending').map((req) => (
                <div key={req.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800">{req.name}</h4>
                        <span className="text-[8px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                          {req.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">📞 {req.phone}</span>
                        <span className="flex items-center gap-1">📧 {req.email}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-teal-600">Est. Total: ${req.estimatedTotal}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-50 py-3 text-[10px] text-slate-500 font-medium">
                    <div className="space-y-1">
                      <div>📍 Address: <span className="font-extrabold text-slate-800">{req.address}</span></div>
                      {req.complement && <div>Complement: <span className="text-slate-800">{req.complement}</span></div>}
                      <div>ZIP Code: <span className="font-extrabold text-slate-800">{req.zip}</span></div>
                    </div>
                    <div className="space-y-1">
                      <div>📅 Date: <span className="font-extrabold text-slate-800">{req.preferredDate}</span></div>
                      <div>⏰ Preferred Window: <span className="font-extrabold text-slate-800">{req.preferredTime}</span></div>
                      <div>⚡ Service: <span className="font-extrabold capitalize text-teal-600">{req.serviceType} clean</span></div>
                    </div>
                  </div>

                  <div className="text-[10px] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-600">
                      <span>🏠 Specifications:</span>
                      <span>{req.studio ? 'Studio flat layout' : `${req.bedrooms} Beds, ${req.bathrooms} Baths`} · {req.cleanType} Clean · {req.pets ? 'Pets at home 🐾' : 'No pets'}</span>
                    </div>

                    {req.notes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-slate-500 italic">
                        "Notes: {req.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => onRejectRequest(req.id)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-extrabold rounded"
                    >
                      Reject Lead
                    </button>
                    <button
                      onClick={() => onPreFillOffer(req)}
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black rounded flex items-center gap-1"
                    >
                      Approve & Dispatch Offer
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Col: Processed/Archived History */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Processed History ({requests.filter(r => r.status !== 'New' && r.status !== 'Pending').length})</h3>
            
            <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
              {requests.filter(r => r.status !== 'New' && r.status !== 'Pending').length === 0 ? (
                <p className="text-[10px] text-slate-400 italic py-4 text-center">No processed records yet.</p>
              ) : (
                requests.filter(r => r.status !== 'New' && r.status !== 'Pending').map((p) => (
                  <div key={p.id} className="py-3 space-y-1 text-[10px] font-medium text-slate-500">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-slate-800">{p.name}</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${
                        p.status === 'Approved' || p.status === 'Booked' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div>Service: <span className="capitalize">{p.serviceType} ({p.cleanType})</span></div>
                    <div>Scheduled: {p.preferredDate} · value: ${p.estimatedTotal}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAILS POPUP MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-slate-100 rounded-md text-slate-500 mb-1 inline-block">
                  Request Details
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  👤 {selectedRequest.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Quick Details Container */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Phone</span>
                  <span className="text-slate-800">{selectedRequest.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Email</span>
                  <span className="text-slate-800 truncate block">{selectedRequest.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block font-bold">Service Address</span>
                  <span className="text-slate-800">{selectedRequest.address}, {selectedRequest.zip}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Service Category</span>
                  <span className="text-teal-600 font-extrabold capitalize">{selectedRequest.serviceType} clean</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Preferred Date & Window</span>
                  <span className="text-slate-800">{selectedRequest.preferredDate} at {selectedRequest.preferredTime}</span>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="border-t border-slate-200/60 pt-2.5 text-[10px] text-slate-500 italic">
                  <span className="font-bold text-slate-700 block not-italic uppercase tracking-wider text-[8px] mb-0.5">Lead Notes:</span>
                  "{selectedRequest.notes}"
                </div>
              )}
            </div>

            {/* Move Stage Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Move Pipeline Stage</label>
              <div className="grid grid-cols-3 gap-2">
                {CP_REQ_STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, st.id as BookingRequest['status']);
                      setSelectedRequest({ ...selectedRequest, status: st.id as BookingRequest['status'] });
                    }}
                    className={`p-2.5 rounded-lg border text-[10px] font-extrabold transition text-center ${
                      selectedRequest.status === st.id
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-black shadow-sm'
                        : 'border-slate-100 hover:border-slate-300 text-slate-600 hover:text-slate-800 bg-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  onRejectRequest(selectedRequest.id);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-lg transition"
              >
                Mark as Rejected/Lost
              </button>

              <button
                onClick={() => {
                  onPreFillOffer(selectedRequest);
                  setSelectedRequest(null);
                }}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-teal-500/10"
              >
                📋 Convert to Dispatch Offer
                <ArrowRight size={13} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE MANUAL LEAD DIALOG MODAL */}
      {showAddLead && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                📥 Add Manual Prospect/Lead
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLead(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Prospect Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Lionel Messi"
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="(305) 555-0155"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="messi@gmail.com"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Street Address</label>
                  <input
                    type="text"
                    value={leadAddress}
                    onChange={(e) => setLeadAddress(e.target.value)}
                    placeholder="e.g. 100 Brickell Ave"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">ZIP Code</label>
                  <input
                    type="text"
                    value={leadZip}
                    onChange={(e) => setLeadZip(e.target.value)}
                    placeholder="33139"
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Service Category</label>
                  <select
                    value={leadService}
                    onChange={(e) => setLeadService(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-teal-500"
                  >
                    <option value="house">House Cleaning</option>
                    <option value="commercial">Commercial Office</option>
                    <option value="moveinout">Move In/Out</option>
                    <option value="carpet">Carpet Wash</option>
                    <option value="construction">Post-Construction</option>
                    <option value="upholstery">Upholstery</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Estimated Price ($)</label>
                  <input
                    type="number"
                    value={leadTotal}
                    onChange={(e) => setLeadTotal(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Preferred Date</label>
                  <input
                    type="date"
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-400">Preferred Time Window</label>
                  <input
                    type="time"
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-400">Internal Comments / Notes</label>
                <textarea
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Need green chemicals. Prefers deep scrub of washrooms."
                  rows={2}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none resize-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddLead(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition shadow-md shadow-teal-500/10"
              >
                Create Prospect Record
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
