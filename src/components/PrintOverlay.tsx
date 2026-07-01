import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Check, 
  Eye, 
  EyeOff, 
  Sliders, 
  FileText, 
  Settings,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { JobOffer, AppSettings } from '../types';
import { CHECKLIST_ITEMS } from '../data';

interface PrintOverlayProps {
  job: JobOffer;
  type: 'receipt' | 'checklist';
  settings: AppSettings;
  onClose: () => void;
}

export default function PrintOverlay({ job, type, settings, onClose }: PrintOverlayProps) {
  const biz = settings.bizProfile || { name: 'Cleaning Service', phone: '(305) 555-0199', logo: '', email: 'info@cleaningservice.com' };
  
  // Checklist-specific states
  const catItems = CHECKLIST_ITEMS[job.serviceType as keyof typeof CHECKLIST_ITEMS] || CHECKLIST_ITEMS['house'];
  const [tickedItems, setTickedItems] = useState<string[]>(catItems.slice(0, 4)); // Default first few done

  // Receipt customization settings
  const [showFields, setShowFields] = useState({
    date: true,
    type: true,
    cleaner: true,
    duration: true,
    discount: true,
    extrafee: true,
    notes: true
  });

  const [isSimulatingPrint, setIsSimulatingPrint] = useState(false);
  const [isSimulatingPdf, setIsSimulatingPdf] = useState(false);

  const handleToggleField = (field: keyof typeof showFields) => {
    setShowFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleToggleItem = (item: string) => {
    if (tickedItems.includes(item)) {
      setTickedItems(tickedItems.filter(i => i !== item));
    } else {
      setTickedItems([...tickedItems, item]);
    }
  };

  const handlePrintAction = () => {
    setIsSimulatingPrint(true);
    setTimeout(() => {
      // Trigger actual system print dialogue, but scoped to standard print css
      window.print();
      setIsSimulatingPrint(false);
    }, 1200);
  };

  const handleDownloadPdfAction = () => {
    setIsSimulatingPdf(true);
    setTimeout(() => {
      setIsSimulatingPdf(false);
      alert(`Success! PDF of your ${type === 'receipt' ? 'Receipt' : 'Checklist'} has been compiled and downloaded successfully.`);
    }, 1500);
  };

  // Percent completion for Checklist
  const pct = Math.round((tickedItems.length / Math.max(catItems.length, 1)) * 100);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:inset-auto print:relative">
      
      {/* Printable Frame Area */}
      <div className="bg-white rounded-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 shadow-2xl h-[85vh] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:h-auto print:max-w-full">
        
        {/* Left Side: Setup Panel (Hidden in print) */}
        <div className="bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between h-full overflow-y-auto print:hidden">
          <div className="space-y-6">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md inline-block mb-1">
                Print & Document Center
              </span>
              <h3 className="text-sm font-black text-slate-900 capitalize">
                Configure {type} Format
              </h3>
              <p className="text-[10px] text-slate-400">Manage what details appear on client PDF handouts and printable receipts.</p>
            </div>

            {type === 'receipt' ? (
              /* Receipt Customizer */
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Sliders size={12} />
                  Toggle Fields
                </h4>
                <div className="space-y-2.5">
                  {Object.entries(showFields).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleToggleField(key as keyof typeof showFields)}
                      className="w-full flex items-center justify-between text-xs p-2.5 bg-white border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-slate-50/50 transition"
                    >
                      <span className="capitalize font-bold text-slate-700">{key} details</span>
                      <span className={`w-8 h-4 rounded-full flex items-center transition-all ${
                        value ? 'bg-teal-500 justify-end p-0.5' : 'bg-slate-200 justify-start p-0.5'
                      }`}>
                        <span className="w-3 h-3 rounded-full bg-white shadow" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Checklist Customizer */
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Select Completed Tasks
                </h4>
                <p className="text-[9px] text-slate-400">Click to tick off tasks completed by the team for the custom progress meter.</p>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {catItems.map((item) => {
                    const done = tickedItems.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => handleToggleItem(item)}
                        className={`w-full text-left text-[11px] p-2.5 rounded-lg border transition flex items-center gap-2.5 ${
                          done 
                            ? 'bg-teal-50 border-teal-200 text-teal-800 font-extrabold' 
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          done ? 'bg-teal-500 border-teal-500 text-slate-950' : 'border-slate-300'
                        }`}>
                          {done && <Check size={10} />}
                        </div>
                        <span className="truncate">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200/60 space-y-2">
            <button
              onClick={handlePrintAction}
              disabled={isSimulatingPrint}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-300 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-teal-500/15"
            >
              <Printer size={14} />
              {isSimulatingPrint ? 'Formatting Layout...' : 'System Print / Save PDF'}
            </button>
            <button
              onClick={handleDownloadPdfAction}
              disabled={isSimulatingPdf}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Download size={14} />
              {isSimulatingPdf ? 'Compiling PDF...' : 'Download Document'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-transparent hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 text-xs font-bold transition rounded-xl"
            >
              Dismiss Preview
            </button>
          </div>
        </div>

        {/* Right Side: Render Preview Area */}
        <div className="col-span-2 bg-slate-100 p-8 flex items-center justify-center overflow-y-auto h-full relative print:p-0 print:bg-white print:col-span-3">
          
          {/* Subtle watermark (hidden in print) */}
          <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 select-none print:hidden">
            <Eye size={12} />
            Live Client Handout Preview
          </div>

          {type === 'receipt' ? (
            /* PRINTABLE THERMAL RECEIPT PREVIEW */
            <div className="w-full max-w-[360px] bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 font-sans print:shadow-none print:border-none my-auto">
              
              {/* Receipt Header */}
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 p-6 text-white text-center space-y-1">
                <span className="text-3xl block">🧹</span>
                <h4 className="text-sm font-black tracking-tight">{biz.name}</h4>
                <p className="text-[9px] text-teal-300 font-bold uppercase tracking-widest">Official Receipt</p>
              </div>

              {/* Receipt Fields list */}
              <div className="p-5 space-y-3.5">
                
                {showFields.date && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">Date & Time</span>
                    <span className="text-slate-800 font-black">{job.date} at {job.time}</span>
                  </div>
                )}

                {showFields.type && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">Service Type</span>
                    <span className="text-slate-800 font-black capitalize">{job.serviceType} clean</span>
                  </div>
                )}

                {showFields.cleaner && job.assignedTo && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">Assigned Cleaner</span>
                    <span className="text-slate-800 font-black">{job.assignedTo}</span>
                  </div>
                )}

                {showFields.duration && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">Duration</span>
                    <span className="text-slate-800 font-black">{job.duration} hours</span>
                  </div>
                )}

                {showFields.extrafee && job.extraFeesTotal > 0 && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-bold">Extra Add-ons</span>
                    <span className="text-slate-800 font-black">+${job.extraFeesTotal.toFixed(2)}</span>
                  </div>
                )}

                {showFields.discount && job.bonus > 0 && (
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-2 text-rose-600">
                    <span className="text-rose-400 font-bold">Credits/Discounts</span>
                    <span className="font-black">-${job.bonus.toFixed(2)}</span>
                  </div>
                )}

                {showFields.notes && job.notes && (
                  <div className="flex flex-col gap-1 text-[10px] border-b border-slate-50 pb-2 text-left">
                    <span className="text-slate-400 font-bold">Instructions & Private Notes</span>
                    <p className="text-slate-600 italic">"{job.notes}"</p>
                  </div>
                )}

                {/* Total Value container */}
                <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-xl p-4 text-center text-white my-2">
                  <span className="text-[8px] uppercase tracking-widest text-teal-300 font-bold block">Total Paid</span>
                  <span className="text-2xl font-black">${job.clientValue.toFixed(2)}</span>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-bold pt-2">
                  Thank you for choosing <b className="text-teal-700">{biz.name}</b>!
                  <p className="text-[8px] font-medium text-slate-300 mt-1">{biz.phone} · {biz.email}</p>
                </div>
              </div>

            </div>
          ) : (
            /* PRINTABLE CHECKLIST REPORT PREVIEW */
            <div className="w-full max-w-[620px] bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60 font-sans space-y-6 print:shadow-none print:border-none my-auto">
              
              {/* Checklist Top Banner */}
              <div className="bg-gradient-to-br from-teal-900 to-teal-700 rounded-xl p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {biz.logo ? (
                    <img src={biz.logo} alt="logo" className="w-12 h-12 rounded-lg bg-white p-1 object-contain" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-teal-800/80 flex items-center justify-center text-2xl">🧹</div>
                  )}
                  <div>
                    <h3 className="text-sm font-black">{biz.name}</h3>
                    <p className="text-[10px] text-teal-200 font-bold uppercase tracking-wider">Service Task Checklist</p>
                  </div>
                </div>

                <div className="bg-teal-950/40 text-teal-300 font-black text-xs px-3 py-1.5 rounded-lg border border-teal-500/20">
                  {tickedItems.length} / {catItems.length} Done
                </div>
              </div>

              {/* Client & Service Info card */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 text-left">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-teal-700 block mb-1">Client Name</span>
                  <span className="text-xs font-extrabold text-slate-800">{job.client}</span>
                </div>
                <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 text-left">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-teal-700 block mb-1">Service category</span>
                  <span className="text-xs font-extrabold text-slate-800 capitalize">{job.serviceType} Clean</span>
                </div>
                <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 text-left">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-teal-700 block mb-1">Service Date</span>
                  <span className="text-xs font-extrabold text-slate-800">{job.date}</span>
                </div>
              </div>

              {/* Progress Meter bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black text-teal-700 uppercase tracking-wide">
                  <span>Overall Job Progress</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* 3-column Layout grid of checklist items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-2">
                {catItems.map((item, index) => {
                  const done = tickedItems.includes(item);
                  return (
                    <div 
                      key={item} 
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition ${
                        done 
                          ? 'border-teal-100 bg-teal-50/35 text-slate-800 font-bold' 
                          : 'border-slate-100 text-slate-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                        done 
                          ? 'bg-teal-500 border-teal-500 text-slate-950 font-black' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {done && <Check size={10} />}
                      </div>
                      <span className={done ? '' : 'text-slate-400 font-medium'}>
                        {index + 1}. {item}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-4 flex justify-between items-center">
                <span>Handcrafted by: BGrowth Club CRM Platform</span>
                <span>{biz.phone} · {biz.email}</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
