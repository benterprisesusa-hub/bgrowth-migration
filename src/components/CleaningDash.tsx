import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Clock, Plus, Users, FileText, Megaphone } from 'lucide-react';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';

async function callGAS(action: string, params: any = {}) {
  const url = new URL(GAS_URL);
  url.searchParams.set('page', 'api');
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const response = await fetch(url.toString(), { redirect: 'follow' });
  const text = await response.text();
  return JSON.parse(text);
}

interface DashProps {
  userEmail: string;
}

export default function CleaningDash({ userEmail }: DashProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const mapRef = useRef<any>(null);

  useEffect(() => { loadDash(); }, [date]);

  async function loadDash() {
    setLoading(true);
    try {
      const result = await callGAS('cleaning_getDashboard', { email: userEmail, date });
      setData(result);
    } catch (e) { console.error('Dashboard error:', e); }
    setLoading(false);
  }

  useEffect(() => {
    if (data?.todayJobs?.length) loadMap(data.todayJobs);
  }, [data]);

  function loadMap(jobs: any[]) {
    const jobsWithCoords = jobs.filter((j: any) => j.clientLat && j.clientLng && j.status !== 'Canceled');
    if (!jobsWithCoords.length) return;
    if ((window as any).L) { renderMap(jobsWithCoords); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => renderMap(jobsWithCoords);
    document.head.appendChild(script);
  }

  function renderMap(jobs: any[]) {
    const L = (window as any).L;
    if (!L || mapRef.current) return;
    const colors: any = { house: '#3b82f6', commercial: '#8b5cf6', moveinout: '#f59e0b', construction: '#ef4444', carpet: '#10b981' };
    const map = L.map('cpDashMap', { zoomControl: true, attributionControl: false }).setView([jobs[0].clientLat, jobs[0].clientLng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    const bounds: any[] = [];
    jobs.forEach((j: any, i: number) => {
      const color = colors[j.serviceType] || '#6b7280';
      const icon = L.divIcon({ className: '', html: `<div style="background:${color};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i + 1}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
      const marker = L.marker([j.clientLat, j.clientLng], { icon }).addTo(map);
      marker.bindPopup(`<div style="font-size:12px;font-weight:800">${j.client}</div><div style="font-size:11px;color:#6b7280">${j.time} · ${j.duration}h</div><a href="https://www.google.com/maps/dir/?api=1&destination=${j.clientLat},${j.clientLng}" target="_blank" style="display:block;margin-top:8px;background:#1d6fa4;color:#fff;text-align:center;padding:5px;border-radius:6px;font-size:11px;font-weight:800;text-decoration:none">🗺 Open Route</a>`);
      bounds.push([j.clientLat, j.clientLng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [20, 20] });
  }

  function fmtTime(t: string) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  function getStatusColor(status: string) {
    return ({ Working: '#10b981', 'On the way': '#f59e0b', Scheduled: '#1d6fa4', Done: '#10b981', Off: '#9ca3af' } as any)[status] || '#9ca3af';
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 text-sm">Loading dashboard...</div></div>;

  const today = data?.today || {};
  const week = data?.week || {};
  const month = data?.month || {};
  const todayJobs = (data?.todayJobs || []).filter((j: any) => j.status !== 'Canceled').sort((a: any, b: any) => a.time?.localeCompare(b.time));
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const allMembers = [
    { email: userEmail, name: 'You (Owner)' },
    ...(data?.members || [])
  ];
  const teamStatuses = allMembers.map((m: any) => {
    const myJobs = todayJobs.filter((j: any) =>
      j.assignedTo === m.email || j.userEmail === m.email
    );
    let status = 'Off';
    let nextJob = null;
    if (myJobs.length > 0) {
      const allDone = myJobs.every((j: any) => j.status === 'Done');
      const hasActive = myJobs.some((j: any) => {
        const jStart = parseInt(j.time?.split(':')[0] || '0') * 60 + parseInt(j.time?.split(':')[1] || '0');
        const jEnd = jStart + (parseFloat(j.duration) || 1) * 60;
        return j.status !== 'Done' && nowMin >= jStart && nowMin <= jEnd;
      });
      const hasUpcoming = myJobs.some((j: any) => {
        const jStart = parseInt(j.time?.split(':')[0] || '0') * 60 + parseInt(j.time?.split(':')[1] || '0');
        return j.status !== 'Done' && jStart > nowMin && jStart - nowMin <= 60;
      });
      if (allDone) status = 'Done';
      else if (hasActive) status = 'Working';
      else if (hasUpcoming) status = 'On the way';
      else status = 'Scheduled';
      nextJob = myJobs.filter((j: any) => j.status !== 'Done').sort((a: any, b: any) => a.time?.localeCompare(b.time))[0] || null;
    }
    return { ...m, status, nextJob };
  });

  const quickActions = [
    { label: 'Add Member', icon: <Users className="w-4 h-4" />, color: 'bg-[#1d6fa4] text-white hover:bg-[#155a85]' },
    { label: 'New Client', icon: <Plus className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { label: 'New Request', icon: <FileText className="w-4 h-4" />, color: 'bg-[#1d6fa4] text-white hover:bg-[#155a85]' },
    { label: 'New Offer', icon: <Megaphone className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  ];

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-900">Dashboard</h2>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1d6fa4]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Today Revenue', value: `$${(today.earned || 0).toFixed(2)}`, sub: `${today.jobs || 0} jobs`, icon: <DollarSign className="w-4 h-4 text-green-500" />, bg: 'bg-green-50' },
          { label: 'Week Revenue', value: `$${(week.earned || 0).toFixed(2)}`, sub: `${week.jobs || 0} jobs`, icon: <DollarSign className="w-4 h-4 text-[#1d6fa4]" />, bg: 'bg-blue-50' },
          { label: 'Month Revenue', value: `$${(month.earned || 0).toFixed(2)}`, sub: `${month.jobs || 0} jobs`, icon: <DollarSign className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Hours Today', value: `${(today.hours || 0).toFixed(1)}h`, sub: `${today.done || 0} completed`, icon: <Clock className="w-4 h-4 text-orange-500" />, bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>{s.icon}</div>
            <div className="text-lg font-black text-slate-900">{s.value}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
            <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Schedule + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-900">📅 Today's Schedule</span>
            <span className="text-xs font-bold text-slate-400">{todayJobs.length} jobs</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {!todayJobs.length ? (
              <div className="text-center py-8 text-slate-400 text-sm">No jobs today</div>
            ) : todayJobs.map((j: any) => {
              const isDone = j.status === 'Done';
              const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
              const jStart = parseInt(j.time?.split(':')[0] || '0') * 60 + parseInt(j.time?.split(':')[1] || '0');
              const jEnd = jStart + (parseFloat(j.duration) || 1) * 60;
              const isNow = nowMin >= jStart && nowMin <= jEnd;
              return (
                <div key={j.id} className={`flex gap-3 px-4 py-3 ${isNow ? 'bg-blue-50' : ''}`}>
                  <div className="text-right shrink-0 w-12">
                    <div className="text-xs font-black text-slate-700">{fmtTime(j.time)}</div>
                    <div className="text-[9px] text-slate-400">{j.duration}h</div>
                  </div>
                  <div className={`w-0.5 rounded-full shrink-0 ${isDone ? 'bg-green-500' : isNow ? 'bg-[#1d6fa4]' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-slate-900">{j.client}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{j.serviceType}{j.assignedName ? ` · ${j.assignedName}` : ''}</div>
                  </div>
                  <span className={`text-[9px] font-black rounded-full px-2 py-0.5 h-fit shrink-0 ${isDone ? 'bg-green-100 text-green-700' : isNow ? 'bg-blue-100 text-[#1d6fa4]' : 'bg-slate-100 text-slate-500'}`}>
                    {isDone ? 'Done' : isNow ? 'Now' : j.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jobs Map */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <span className="text-sm font-black text-slate-900">📍 Jobs Map</span>
            <span className="text-xs font-bold text-slate-400">{todayJobs.filter((j: any) => j.clientLat).length} with location</span>
          </div>
          {todayJobs.filter((j: any) => j.clientLat).length ? (
            <div id="cpDashMap" style={{ height: '280px', width: '100%' }} />
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm">No jobs with location today</div>
          )}
        </div>
      </div>

      {/* Team Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Team Status */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <span className="text-sm font-black text-slate-900">👥 Team Status</span>
          </div>
          <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
            {!teamStatuses.length ? (
              <div className="col-span-4 text-center py-4 text-slate-400 text-sm">No team members</div>
            ) : teamStatuses.map((m: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3" style={{ borderLeft: `3px solid ${getStatusColor(m.status)}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-[#1d6fa4] rounded-full flex items-center justify-center text-white text-[9px] font-black">
                    {m.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-slate-900">{m.name}</span>
                </div>
                <div className="text-[10px] font-bold" style={{ color: getStatusColor(m.status) }}>{m.status}</div>
                {m.nextJob && <div className="text-[10px] text-slate-400 mt-1">{fmtTime(m.nextJob.time)} · {m.nextJob.client}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl shadow-sm p-4">
          <div className="text-xs font-black text-slate-900 mb-3">⚡ Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((a, i) => (
              <button key={i} className={`${a.color} font-bold text-[10px] py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all`}>
                {a.icon}
                <span className="text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { label: 'TODAY', data: today },
          { label: 'THIS WEEK', data: week },
          { label: 'THIS MONTH', data: month },
        ].map((p, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">📅 {p.label}</div>
            <div className="text-2xl font-black text-slate-900">${(p.data.earned || 0).toFixed(2)}</div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Jobs</span><span className="font-bold text-slate-700">{p.data.jobs || 0}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Hours</span><span className="font-bold text-slate-700">{(p.data.hours || 0).toFixed(1)}h</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}