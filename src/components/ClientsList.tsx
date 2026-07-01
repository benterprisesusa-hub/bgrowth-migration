import React, { useState } from 'react';
import { 
  UserSquare2, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar 
} from 'lucide-react';
import { Client } from '../types';

interface ClientsListProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
}

export default function ClientsList({ clients, onAddClient }: ClientsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Client state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [prefs, setPrefs] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.zipcode.includes(searchQuery)
  );

  const handleSubmit = () => {
    if (!name.trim()) return alert('Name is required.');
    
    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name,
      phone,
      email,
      address,
      city: 'Miami Beach',
      state: 'FL',
      zipcode: zip || '33139',
      prefs,
      lastJob: undefined
    };

    onAddClient(newClient);
    setShowAddForm(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setZip('');
    setPrefs('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Clients CRM Database</h2>
          <p className="text-xs text-slate-400">View notes, preferences, history, and add new client records</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
        >
          <Plus size={14} />
          {showAddForm ? 'View Clients List' : 'Add Client Record'}
        </button>
      </div>

      {showAddForm ? (
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in max-w-xl mx-auto">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            👤 Add New Client Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Johnson"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(305) 555-0100"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.j@example.com"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 450 Alton Rd"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="33139"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Cleaning Preferences & Private Notes</label>
              <textarea
                value={prefs}
                onChange={(e) => setPrefs(e.target.value)}
                placeholder="e.g. Key is under flower pot. Eco-friendly cleaning products only. Has a dog named Buster."
                rows={3}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none resize-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition"
            >
              Save Client Record
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          
          {/* Search bar */}
          <div className="relative max-w-md bg-white border border-slate-100 rounded-xl shadow-sm">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, email or ZIP code..."
              className="w-full pl-10 pr-4 py-3 text-xs font-medium rounded-xl outline-none focus:ring-1 focus:ring-teal-500/20"
            />
          </div>

          {/* List display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredClients.length === 0 ? (
              <div className="col-span-3 bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
                <span className="text-3xl block">👥</span>
                <h4 className="text-xs font-black text-slate-400">No client records found</h4>
                <p className="text-[10px] text-slate-400">Try searching for other terms or add a new client record directly.</p>
              </div>
            ) : (
              filteredClients.map((c) => (
                <div key={c.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-200 transition">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 font-black flex items-center justify-center text-xs">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{c.name}</h4>
                        <span className="text-[9px] text-slate-400 font-bold">Client ID: {c.id}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px] text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400" />
                        <span>{c.phone || 'No Phone'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400" />
                        <span className="truncate">{c.email || 'No Email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{c.address}, {c.zipcode}</span>
                      </div>
                      {c.lastJob && (
                        <div className="flex items-center gap-2 text-teal-600 font-extrabold">
                          <Calendar size={12} />
                          <span>Last clean done on: {c.lastJob}</span>
                        </div>
                      )}
                    </div>

                    {c.prefs && (
                      <div className="bg-slate-50 p-2.5 rounded-lg text-[9px] text-slate-500 italic border border-slate-100">
                        <span className="font-bold text-slate-700 block not-italic uppercase tracking-wider text-[8px] mb-0.5">Preferences:</span>
                        "{c.prefs}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}
