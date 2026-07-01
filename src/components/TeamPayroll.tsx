import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  DollarSign, 
  Briefcase, 
  ShieldAlert, 
  Compass, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { TeamMember, Application, AppSettings, JobOffer } from '../types';
import { INITIAL_APPLICATIONS } from '../data';

interface TeamPayrollProps {
  members: TeamMember[];
  offers: JobOffer[];
  settings: AppSettings;
  onAddMember: (member: TeamMember) => void;
  onApproveApplication: (app: Application, type: 'fixed' | 'on-demand', payRate: number) => void;
  onDeactivateMember: (id: string) => void;
  apps: Application[];
  onRejectApplication: (id: string) => void;
}

export default function TeamPayroll({
  members,
  offers,
  settings,
  onAddMember,
  onApproveApplication,
  onDeactivateMember,
  apps,
  onRejectApplication
}: TeamPayrollProps) {
  
  const [activeTab, setActiveTab] = useState<'members' | 'apps' | 'payroll'>('members');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Team Member Form fields
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [role, setRole] = useState<'Cleaner' | 'Supervisor' | 'Manager'>('Cleaner');
  const [mType, setMType] = useState<'fixed' | 'on-demand'>('fixed');
  const [payType, setPayType] = useState<'percent' | 'hourly' | 'fixed_job'>('percent');
  const [payRate, setPayRate] = useState(60);
  const [transportation, setTransportation] = useState(true);
  const [emergencyJobs, setEmergencyJobs] = useState(false);
  const [maxDistance, setMaxDistance] = useState(15);
  const [notes, setNotes] = useState('');

  // Handle addition
  const handleAddMember = () => {
    if (!fName.trim() || !email.trim()) return alert('First Name and Email are required.');
    
    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: `${fName} ${lName}`.trim(),
      firstName: fName,
      lastName: lName,
      email,
      phone,
      zipcode: zip || '33139',
      role,
      memberType: mType,
      status: 'Active',
      payType,
      payRate,
      transportation,
      emergencyJobs,
      maxDistance,
      notes,
      inviteStatus: 'completed'
    };

    onAddMember(newMember);
    setShowAddForm(false);
    setFName('');
    setLName('');
    setEmail('');
    setPhone('');
    setZip('');
  };

  const handleApproveApp = (app: Application) => {
    onApproveApplication(app, 'on-demand', 60);
  };

  const handleRejectApp = (id: string) => {
    onRejectApplication(id);
  };

  // Calculate payroll summary based on assigned/completed jobs
  const getPayrollSummary = () => {
    return members.map((member) => {
      // Find assigned jobs for this worker
      const assignedJobs = offers.filter(
        (o) => o.status === 'assigned' && o.assignedTo === member.name
      );

      const jobsCount = assignedJobs.length;
      const hoursWorked = assignedJobs.reduce((sum, o) => sum + o.duration, 0);
      const jobClientValue = assignedJobs.reduce((sum, o) => sum + o.clientValue, 0);
      
      let basePay = 0;
      let bonusPay = assignedJobs.reduce((sum, o) => sum + o.bonus, 0);

      if (member.payType === 'percent') {
        // Percentage of jobs value
        basePay = assignedJobs.reduce((sum, o) => sum + o.clientValue * (member.payRate / 100), 0);
      } else if (member.payType === 'hourly') {
        basePay = hoursWorked * member.payRate;
      } else if (member.payType === 'fixed_job') {
        basePay = jobsCount * member.payRate;
      }

      return {
        member,
        jobsCount,
        hoursWorked,
        jobClientValue,
        basePay,
        bonusPay,
        totalPayout: basePay + bonusPay
      };
    });
  };

  const payrollSummaryList = getPayrollSummary();

  return (
    <div className="space-y-6">
      
      {/* Upper bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Crew & Payroll Portal</h2>
          <p className="text-xs text-slate-400">Manage internal cleaners, candidate submissions and run payroll reports</p>
        </div>

        {activeTab === 'members' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition shadow-md shadow-teal-500/10 flex items-center gap-1.5"
          >
            <UserPlus size={14} />
            {showAddForm ? 'View Team List' : 'Add Team Member'}
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in max-w-2xl mx-auto">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            👤 Add New Crew Member
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">First Name *</label>
              <input
                type="text"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="Jane"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Last Name</label>
              <input
                type="text"
                value={lName}
                onChange={(e) => setLName(e.target.value)}
                placeholder="Doe"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@bgrowth.com"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 0101"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Work ZIP Code</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="e.g. 33139"
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              >
                <option value="Cleaner">Cleaner</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Member Classification</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMType('fixed')}
                  className={`py-2 text-[11px] font-extrabold rounded-lg border transition ${
                    mType === 'fixed' ? 'border-teal-500 bg-teal-500/5 text-teal-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  📅 Full-Time (Fixed)
                </button>
                <button
                  type="button"
                  onClick={() => setMType('on-demand')}
                  className={`py-2 text-[11px] font-extrabold rounded-lg border transition ${
                    mType === 'on-demand' ? 'border-teal-500 bg-teal-500/5 text-teal-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  ⚡ On-Demand (Gg)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Payroll Calculation Basis</label>
              <select
                value={payType}
                onChange={(e) => setPayType(e.target.value as any)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              >
                <option value="percent">Percentage of Job Client Value (%)</option>
                <option value="hourly">Flat Rate per Working Hour ($)</option>
                <option value="fixed_job">Flat payout per assigned Job ($)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Pay Rate Value (%, $ or per job)</label>
              <input
                type="number"
                value={payRate}
                onChange={(e) => setPayRate(parseInt(e.target.value) || 0)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-slate-400">Max Travel Distance (Miles)</label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value) || 15)}
                className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50 col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={transportation}
                  onChange={(e) => setTransportation(e.target.checked)}
                  id="trans_chk"
                  className="rounded text-teal-500 focus:ring-teal-400"
                />
                <label htmlFor="trans_chk" className="text-xs font-bold text-slate-700">Owns reliable vehicle transportation</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={emergencyJobs}
                  onChange={(e) => setEmergencyJobs(e.target.checked)}
                  id="emerg_chk"
                  className="rounded text-teal-500 focus:ring-teal-400"
                />
                <label htmlFor="emerg_chk" className="text-xs font-bold text-slate-700">Willing to take emergency/same-day dispatch</label>
              </div>
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
              onClick={handleAddMember}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-lg transition"
            >
              Save Cleaner Member
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Subtabs selection */}
          <div className="flex gap-2 border-b border-slate-100">
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-3 text-xs font-black capitalize border-b-2 px-4 transition ${
                activeTab === 'members' ? 'border-teal-500 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Team Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`pb-3 text-xs font-black capitalize border-b-2 px-4 transition ${
                activeTab === 'apps' ? 'border-teal-500 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Applicant Submissions ({apps.length})
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`pb-3 text-xs font-black capitalize border-b-2 px-4 transition ${
                activeTab === 'payroll' ? 'border-teal-500 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Payroll Reports 💸
            </button>
          </div>

          {/* Tab 1: Crew List */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((m) => (
                <div key={m.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 font-black flex items-center justify-center text-sm">
                        {m.firstName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{m.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{m.role} · {m.memberType}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-50 py-3 text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      📧 {m.email}
                    </div>
                    <div className="flex items-center gap-1">
                      📞 {m.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-1">
                      📍 Base Zip: <span className="font-bold text-slate-700">{m.zipcode}</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600 font-extrabold">
                      💵 Pay Rule: {m.payRate}{m.payType === 'percent' ? '%' : '$'} ({m.payType})
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <div className="flex gap-2">
                      <span className={m.transportation ? 'text-teal-600' : 'text-slate-300'}>🚗 Vehicle</span>
                      <span className={m.emergencyJobs ? 'text-amber-600' : 'text-slate-300'}>⚡ Emergency Ready</span>
                    </div>

                    <button
                      onClick={() => onDeactivateMember(m.id)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-extrabold"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Candidate Applications */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              {apps.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
                  <span className="text-3xl block">📥</span>
                  <h4 className="text-xs font-black text-slate-400">No applicant submissions found</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    New applicant requests submitted through recruitment portals will populate here automatically.
                  </p>
                </div>
              ) : (
                apps.map((app) => (
                  <div key={app.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-800">{app.name}</h4>
                        <span className="text-[9px] text-slate-400 font-bold">Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-medium pb-2 border-b border-slate-50">
                        <div>📧 {app.email}</div>
                        <div>📞 {app.phone}</div>
                        <div className="md:col-span-2">🕒 Availability: <span className="text-slate-700 font-extrabold">{app.availability}</span></div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 italic">
                        "{app.message}"
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-extrabold rounded"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveApp(app)}
                        className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black rounded"
                      >
                        Approve Candidate 
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Payroll Calculations */}
          {activeTab === 'payroll' && (
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Estimated Payroll & Work Sheet</h3>
                <p className="text-[10px] text-slate-400">Payout summaries calculated live based on active assigned jobs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Crew Cleaner</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Pay Rule</th>
                      <th className="p-4 text-center">Jobs Done</th>
                      <th className="p-4 text-center">Working Hours</th>
                      <th className="p-4 text-right">Job Base Pay</th>
                      <th className="p-4 text-right">Bonuses</th>
                      <th className="p-4 text-right">Total Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {payrollSummaryList.map((row) => (
                      <tr key={row.member.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-black text-slate-800">
                          {row.member.name}
                        </td>
                        <td className="p-4 capitalize">
                          {row.member.memberType}
                        </td>
                        <td className="p-4">
                          {row.member.payRate}{row.member.payType === 'percent' ? '%' : '$'} ({row.member.payType})
                        </td>
                        <td className="p-4 text-center font-bold">
                          {row.jobsCount}
                        </td>
                        <td className="p-4 text-center font-bold">
                          {row.hoursWorked} hrs
                        </td>
                        <td className="p-4 text-right">
                          ${row.basePay.toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-teal-600">
                          ${row.bonusPay.toFixed(2)}
                        </td>
                        <td className="p-4 text-right font-black text-slate-900 bg-slate-50/30">
                          ${row.totalPayout.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
