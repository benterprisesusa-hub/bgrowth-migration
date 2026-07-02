import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, X } from 'lucide-react';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';

async function callGAS(action: string, params: any = {}) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  return response.json();
}

// ── Constantes replicadas do Cleaning.html (GAS) ────────────────
const CP_TYPES: Record<string, { name: string; ico: string }> = {
  house:        { name: 'House Cleaning',   ico: '🏠' },
  commercial:   { name: 'Commercial',        ico: '🏢' },
  moveinout:    { name: 'Move In/Out',       ico: '🚛' },
  construction: { name: 'Post-Construction', ico: '🏗️' },
  upholstery:   { name: 'Upholstery',        ico: '🛋️' },
  carpet:       { name: 'Carpet Cleaning',   ico: '🧶' },
};

const CP_SVC_COLORS: Record<string, { border: string; text: string }> = {
  house:        { border: '#3b82f6', text: '#1e40af' },
  commercial:   { border: '#8b5cf6', text: '#5b21b6' },
  moveinout:    { border: '#f59e0b', text: '#92400e' },
  construction: { border: '#ef4444', text: '#991b1b' },
  upholstery:   { border: '#ec4899', text: '#9d174d' },
  carpet:       { border: '#10b981', text: '#065f46' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Scheduled: { bg: '#ccfbf1', text: '#0f766e' },
  Done:      { bg: '#d1fae5', text: '#059669' },
  Canceled:  { bg: '#fee2e2', text: '#dc2626' },
};

function svcName(type: string) {
  return CP_TYPES[type]?.name || type;
}
function svcIcon(type: string) {
  return CP_TYPES[type]?.ico || '🧹';
}
function fmtTime(t: string) {
  if (!t) return '';
  const [h, m] = String(t).split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${h12}:${m || '00'} ${ampm}`;
}

interface Job {
  id: string;
  date: string;
  time: string;
  client: string;
  serviceType: string;
  pricingMethod: string;
  duration: number;
  value: number;
  basePay: number;
  discount: number;
  extraFee: number;
  extraNote: string;
  expense: number;
  expenseNote: string;
  miles: number;
  notes: string;
  recurring: string;
  assignedTo: string;
  status: string;
  cleanerName: string;
  photosBefore: number;
  photosAfter: number;
  clientId: string;
  clientAddress?: string;
  clientPhone?: string;
}

interface CleaningJobDetailProps {
  userEmail: string;
  jobId: string;
  onBack: () => void;
}

function toast(msg: string) {
  // placeholder simples — troque por um sistema de toast próprio se quiser
  console.log('[toast]', msg);
}

export default function CleaningJobDetail({ userEmail, jobId, onBack }: CleaningJobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const loadJob = useCallback(async () => {
    setLoading(true);
    const r = await callGAS('cleaning_getJob', { email: userEmail, jobId });
    if (r && r.ok) setJob(r.job);
    else toast(r?.message || 'Error loading job');
    setLoading(false);
  }, [userEmail, jobId]);

  useEffect(() => {
    loadJob();
    callGAS('cleaning_getSettings', { email: userEmail }).then(setSettings).catch(() => {});
  }, [loadJob, userEmail]);

  async function handleUpdateStatus(status: string) {
    const r = await callGAS('cleaning_updateStatus', { email: userEmail, jobId, status });
    if (r && r.ok) {
      toast('Status: ' + status);
      loadJob();
    } else {
      toast(r?.message || 'Error');
    }
  }

  async function handleConfirmDone(sendEmail: boolean) {
    setShowDoneModal(false);
    if (sendEmail) {
      toast('Sending email, please wait...');
      const r = await callGAS('cleaning_markDoneAndEmail', { email: userEmail, jobId });
      if (r && r.ok) toast('Done & email sent ✓');
      else toast(r?.message || 'Error');
    } else {
      const r = await callGAS('cleaning_updateStatus', { email: userEmail, jobId, status: 'Done' });
      if (r && r.ok) toast('Status updated');
      else toast(r?.message || 'Error');
    }
    loadJob();
  }

  function handleEditJob() {
    // O wizard de New Job (Fatia C) ainda não existe no React
    toast('Em breve — a tela de edição de job ainda está sendo migrada.');
  }

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-sm">Carregando job...</div>;
  }
  if (!job) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        Job não encontrado.
        <div className="mt-3">
          <button onClick={onBack} className="text-[#1d6fa4] font-bold text-xs">← Back to Jobs</button>
        </div>
      </div>
    );
  }

  const color = CP_SVC_COLORS[job.serviceType] || { border: '#6b7280', text: '#374151' };
  const stStyle = STATUS_STYLES[job.status] || { bg: '#f0f0f0', text: '#666' };
  const canEdit = job.status === 'Scheduled' || job.status === 'Recurring';
  const canCancel = true; // role check fica pra fase "Owner vs Member" (item 32)
  const isMember = false; // idem — sem plumbing de role no React ainda

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-1"
      >
        <ArrowLeft size={14} /> Back to Jobs
      </button>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm" style={{ borderLeft: `4px solid ${color.border}` }}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{svcIcon(job.serviceType)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-extrabold text-slate-900">{job.client}</div>
            <div className="text-xs text-slate-500 mt-0.5">{svcName(job.serviceType)}</div>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: stStyle.bg, color: stStyle.text }}
          >
            {job.status}
          </span>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-extrabold text-slate-800 mb-2">📋 Job Details</div>
        <div className="flex flex-col">
          <InfoRow label="📅 Date" value={job.date} />
          <InfoRow label="⏰ Time" value={fmtTime(job.time)} />
          <InfoRow label="⏱️ Duration" value={`${job.duration} hr(s)`} />
          <InfoRow label="💰 Value" value={`$${(job.value || 0).toFixed(2)}`} valueColor="#1d6fa4" />
          {job.cleanerName && <InfoRow label="👤 Assigned" value={job.cleanerName} />}
          {job.clientAddress && <InfoRow label="📍 Address" value={job.clientAddress} />}
          {job.clientPhone && <InfoRow label="📞 Phone" value={job.clientPhone} />}
          {job.notes && <InfoRow label="📝 Notes" value={job.notes} />}
          {job.discount > 0 && <InfoRow label="🏷️ Discount" value={`-$${job.discount.toFixed(2)}`} valueColor="#10b981" />}
          {job.extraFee > 0 && <InfoRow label="➕ Extra Fee" value={`+$${job.extraFee.toFixed(2)}`} valueColor="#1d6fa4" last />}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          {(job.status === 'Scheduled' || job.status === 'Recurring') && (
            <>
              <ActionButton color="teal" onClick={() => setShowDoneModal(true)}>✅ Mark as Done</ActionButton>
              <ActionButton color="gray" onClick={() => setShowChecklist(true)}>✓ View Checklist</ActionButton>
              {canEdit && <ActionButton color="gray" onClick={handleEditJob}>✏️ Edit Job</ActionButton>}
              {canCancel && <ActionButton color="red" onClick={() => handleUpdateStatus('Canceled')}>❌ Cancel Job</ActionButton>}
            </>
          )}
          {job.status === 'Done' && (
            <>
              <ActionButton color="gray" onClick={() => setShowChecklist(true)}>✓ View Checklist</ActionButton>
              {!isMember && <ActionButton color="gray" onClick={() => printReceipt(job, settings)}>🧾 View Receipt</ActionButton>}
            </>
          )}
        </div>

        {/* Photos */}
        <PhotosSection job={job} userEmail={userEmail} onUploaded={loadJob} />
      </div>

      {showDoneModal && (
        <MarkDoneModal onConfirm={handleConfirmDone} onClose={() => setShowDoneModal(false)} />
      )}

      {showChecklist && (
        <ChecklistModal
          userEmail={userEmail}
          jobId={jobId}
          isDone={job.status === 'Done'}
          settings={settings}
          onClose={() => setShowChecklist(false)}
          onCompleted={loadJob}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value, valueColor, last }: { label: string; value: string; valueColor?: string; last?: boolean }) {
  return (
    <div
      className="flex justify-between py-2 text-xs"
      style={{ borderBottom: last ? 'none' : '1px solid #f1f5f9' }}
    >
      <span className="text-slate-500">{label}</span>
      <span className="font-bold" style={{ color: valueColor || '#0f172a' }}>{value}</span>
    </div>
  );
}

function ActionButton({ color, onClick, children }: { color: 'teal' | 'gray' | 'red'; onClick: () => void; children: React.ReactNode }) {
  const styles = {
    teal: 'bg-[#0d9488] hover:bg-[#0f766e] text-white',
    gray: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    red:  'bg-rose-50 hover:bg-rose-100 text-rose-600',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors ${styles[color]}`}
    >
      {children}
    </button>
  );
}

function MarkDoneModal({ onConfirm, onClose }: { onConfirm: (sendEmail: boolean) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3">✅</div>
        <div className="text-sm font-extrabold text-slate-900 mb-2">Mark as Done?</div>
        <div className="text-xs text-slate-500 mb-5">Send completion email to client?</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={() => onConfirm(true)} className="py-2.5 rounded-lg text-xs font-bold bg-[#0d9488] text-white">✉️ Yes, send</button>
          <button onClick={() => onConfirm(false)} className="py-2.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">No email</button>
        </div>
        <button onClick={onClose} className="text-xs font-bold text-slate-400 py-1">Cancel</button>
      </div>
    </div>
  );
}

function PhotosSection({ job, userEmail, onUploaded }: { job: Job; userEmail: string; onUploaded: () => void }) {
  async function handleUpload(type: 'before' | 'after', file: File, currentCount: number) {
    if (currentCount >= 2) return;
    if (file.size > 5 * 1024 * 1024) { toast('Max 5MB per photo'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const r = await callGAS('cleaning_uploadPhoto', {
        email: userEmail, jobId: job.id, type, base64, mimeType: file.type,
      });
      if (r && r.ok) {
        toast('Photo uploaded ✓');
        onUploaded();
      } else {
        toast(r?.message || 'Error uploading');
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="text-xs font-extrabold text-slate-800 mb-2.5">📷 Photos</div>
      <div className="grid grid-cols-2 gap-2.5">
        <PhotoSlot label="Before" count={job.photosBefore || 0} onFile={f => handleUpload('before', f, job.photosBefore || 0)} />
        <PhotoSlot label="After" count={job.photosAfter || 0} onFile={f => handleUpload('after', f, job.photosAfter || 0)} />
      </div>
    </div>
  );
}

function PhotoSlot({ label, count, onFile }: { label: string; count: number; onFile: (f: File) => void }) {
  const inputId = `photo-${label}`;
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{label} ({count}/2)</div>
      {count < 2 ? (
        <label
          htmlFor={inputId}
          className="flex items-center justify-center gap-1.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-3 text-[11px] font-bold text-slate-500 cursor-pointer"
        >
          📷 Add photo
          <input
            id={inputId}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
          />
        </label>
      ) : (
        <div className="text-[11px] font-bold text-emerald-600">✅ 2 photos uploaded</div>
      )}
    </div>
  );
}

function ChecklistModal({
  userEmail, jobId, isDone, settings, onClose, onCompleted,
}: {
  userEmail: string; jobId: string; isDone: boolean; settings: any;
  onClose: () => void; onCompleted: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [ticked, setTicked] = useState<string[]>([]);

  useEffect(() => {
    callGAS('cleaning_getChecklist', { email: userEmail, jobId }).then(r => {
      if (r && r.ok) {
        setJob(r.job);
        setItems(r.checklist || []);
        setTicked(r.ticked || []);
      } else {
        toast('Error loading checklist');
      }
      setLoading(false);
    });
  }, [userEmail, jobId]);

  async function toggleItem(item: string) {
    const isTicked = ticked.includes(item);
    const next = isTicked ? ticked.filter(i => i !== item) : [...ticked, item];
    setTicked(next);
    await callGAS('cleaning_tickItem', { email: userEmail, jobId, item, done: !isTicked });
  }

  async function handleComplete() {
    const r = await callGAS('cleaning_completeChecklist', { email: userEmail, jobId });
    if (r && r.ok) {
      toast('Checklist completed ✓');
      onCompleted();
      onClose();
    } else {
      toast(r?.message || 'Error');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-extrabold text-slate-900">✓ Checklist</div>
          <div className="flex gap-1.5">
            {job && <button onClick={() => printChecklist(job, items, ticked, settings)} className="bg-[#e8f2fa] border border-[#bfe0f2] text-[#1d6fa4] rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold">🖨️ Print</button>}
            <button onClick={onClose} className="bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-bold"><X size={14} /></button>
          </div>
        </div>
        {job && (
          <div className="text-xs text-slate-500 mb-3">
            {job.client} · <span className="font-extrabold text-[#1d6fa4]">{ticked.length}/{items.length}</span> completed
          </div>
        )}
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((item, i) => {
              const done = ticked.includes(item);
              return (
                <div
                  key={i}
                  onClick={() => !isDone && toggleItem(item)}
                  className={`flex items-center gap-2.5 py-2 ${isDone ? '' : 'cursor-pointer'}`}
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{
                      borderColor: done ? '#0d9488' : '#9ca3af',
                      background: done ? '#0d9488' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    {done ? '✓' : ''}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: done ? '#9ca3af' : '#0f172a', textDecoration: done ? 'line-through' : 'none' }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {!isDone && items.length > 0 && (
          <button
            onClick={handleComplete}
            className="w-full mt-4 py-3 rounded-xl text-white text-sm font-extrabold"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
          >
            ✓ Complete Checklist
          </button>
        )}
      </div>
    </div>
  );
}

// ── Print helpers — replicam cpShowReceipt / cpPrintChecklist do GAS ──

function openPrintWindow(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.onload = () => win.print();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function printReceipt(job: Job, settings: any) {
  const biz = settings?.bizProfile || {};
  const flds = settings?.receiptFields || {};
  const show = (f: string) => flds[f] !== false;

  const row = (label: string, value: string, color?: string) =>
    `<div class="rc-row"><span class="rc-lbl">${label}</span><span class="rc-val"${color ? ` style="color:${color}"` : ''}>${value}</span></div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Nunito',sans-serif;background:#f0fdfa;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.rc{background:#fff;width:100%;max-width:400px;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(13,148,136,.2)}
.rc-h{background:linear-gradient(135deg,#0d4f47,#0d9488);padding:28px 24px;color:#fff;text-align:center}
.rc-ico{font-size:40px;margin-bottom:8px}.rc-biz{font-size:18px;font-weight:900}
.rc-b{padding:22px}.rc-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f9fafb}
.rc-lbl{font-size:11px;color:#6b7280;font-weight:600}.rc-val{font-size:11px;font-weight:800;color:#0f172a}
.rc-total{background:linear-gradient(135deg,#0d4f47,#0d9488);border-radius:12px;padding:16px;text-align:center;margin:14px 0}
.rc-total-l{font-size:10px;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.5px}
.rc-total-v{font-size:34px;font-weight:900;color:#fff;margin-top:3px}
.rc-foot{text-align:center;padding:0 0 18px;color:#9ca3af;font-size:11px}
@media print{body{background:#fff;padding:0}.rc{box-shadow:none;border-radius:0;max-width:100%}}</style></head>
<body><div class="rc"><div class="rc-h"><div class="rc-ico">🧹</div><div class="rc-biz">${biz.name || 'Cleaning Service'}</div></div>
<div class="rc-b">
${show('date') ? row('Date &amp; Time', `${job.date} ${fmtTime(job.time)}`) : ''}
${show('type') ? row('Service', svcName(job.serviceType)) : ''}
${show('cleaner') && job.cleanerName ? row('Cleaner', job.cleanerName) : ''}
${show('duration') ? row('Duration', `${job.duration} hr(s)`) : ''}
${show('discount') && job.discount > 0 ? row('Discount', `-$${job.discount.toFixed(2)}`, '#10b981') : ''}
${show('extrafee') && job.extraFee > 0 ? row('Extra Fee', `+$${job.extraFee.toFixed(2)}`) : ''}
${show('notes') && job.notes ? row('Notes', job.notes) : ''}
<div class="rc-total"><div class="rc-total-l">Total Paid</div><div class="rc-total-v">$${(job.value || 0).toFixed(2)}</div></div>
<div class="rc-foot">Thank you for choosing <b>${biz.name || 'our service'}</b>!</div>
</div></div></body></html>`;

  openPrintWindow(html);
}

function printChecklist(job: Job, items: string[], ticked: string[], settings: any) {
  const biz = settings?.bizProfile || {};
  const cols = 3;
  const colSize = Math.ceil(items.length / cols);
  const col1 = items.slice(0, colSize);
  const col2 = items.slice(colSize, colSize * 2);
  const col3 = items.slice(colSize * 2);
  const maxRows = Math.max(col1.length, col2.length, col3.length);

  const cellHtml = (item: string | undefined) => {
    if (!item) return `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb"></td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;border-right:2px solid #e5e7eb;width:36px"></td>`;
    const done = ticked.includes(item);
    return `<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;border-right:1px solid #f0f0f0;font-size:12px;color:#0f172a">${item}</td>
<td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;border-right:2px solid #e5e7eb;text-align:center;width:36px">
<div style="width:18px;height:18px;border:2px solid ${done ? '#0d9488' : '#9ca3af'};border-radius:4px;background:${done ? '#0d9488' : 'transparent'};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800">${done ? '✓' : ''}</div></td>`;
  };

  let rowsHtml = '';
  for (let r = 0; r < maxRows; r++) {
    rowsHtml += `<tr>${cellHtml(col1[r])}${cellHtml(col2[r])}${cellHtml(col3[r])}</tr>`;
  }
  const pct = Math.round((ticked.length / Math.max(items.length, 1)) * 100);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Nunito',sans-serif;background:#fff;padding:32px;color:#0f172a}
.header{background:linear-gradient(135deg,#0d4f47,#0d9488);color:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between}
.biz-name{font-size:20px;font-weight:900}.biz-sub{font-size:11px;opacity:.7;margin-top:3px}
.chk-badge{background:rgba(255,255,255,.2);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:800}
.info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
.info-card{background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:12px}
.info-lbl{font-size:9px;font-weight:800;color:#0f766e;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.info-val{font-size:14px;font-weight:800;color:#0d4f47}
table{width:100%;border-collapse:collapse}thead tr{background:#0d4f47}
th{color:#fff;padding:10px 12px;text-align:left;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
tr:nth-child(even) td{background:#f9fafb}
.footer{margin-top:24px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:14px}
.progress{background:#e5e7eb;border-radius:20px;height:8px;margin-bottom:24px;overflow:hidden}
.progress-fill{background:linear-gradient(90deg,#0d9488,#10b981);height:100%;border-radius:20px}
.progress-lbl{font-size:11px;font-weight:700;color:#0f766e;margin-bottom:6px;display:flex;justify-content:space-between}
@media print{body{padding:16px}}</style></head>
<body>
<div class="header"><div style="display:flex;align-items:center;gap:14px">
<div style="width:52px;height:52px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:26px">🧹</div>
<div><div class="biz-name">${biz.name || 'Cleaning Service'}</div><div class="biz-sub">Service Checklist</div></div></div>
<div class="chk-badge">${ticked.length} / ${items.length} done</div></div>
<div class="info-grid">
<div class="info-card"><div class="info-lbl">Client</div><div class="info-val">${job.client}</div></div>
<div class="info-card"><div class="info-lbl">Service</div><div class="info-val">${svcName(job.serviceType)}</div></div>
<div class="info-card"><div class="info-lbl">Date</div><div class="info-val">${job.date}${job.time ? ' · ' + job.time : ''}</div></div>
</div>
<div class="progress-lbl"><span>Progress</span><span>${pct}%</span></div>
<div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
<table><thead><tr><th>Item</th><th style="text-align:center;width:36px">✓</th><th>Item</th><th style="text-align:center;width:36px">✓</th><th>Item</th><th style="text-align:center;width:36px">✓</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<div class="footer">Generated by BGrowth Club · ${biz.name || 'Cleaning Service'}${biz.phone ? ' · ' + biz.phone : ''}</div>
</body></html>`;

  openPrintWindow(html);
}