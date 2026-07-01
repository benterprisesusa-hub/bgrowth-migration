import React, { useState } from 'react';
import Navigation from './components/Navigation';
import AppHub from './components/AppHub';
import Dashboard from './components/Dashboard';
import BookingRequestsManager from './components/BookingRequestsManager';
import JobBoard from './components/JobBoard';
import TeamPayroll from './components/TeamPayroll';
import ClientsList from './components/ClientsList';
import RequestForm from './components/RequestForm';
import SettingsPanel from './components/SettingsPanel';
import LivePortal from './components/LivePortal';
import RecruitmentPortal from './components/RecruitmentPortal';
import OnboardingPortal from './components/OnboardingPortal';
import WorkerPortal from './components/WorkerPortal';
import DeliveryTracker from './components/DeliveryTracker';
import MileageTracker from './components/MileageTracker';
import AdminConsole from './components/AdminConsole';
import CleaningSchedule from './components/CleaningSchedule';

import { 
  INITIAL_SETTINGS, 
  INITIAL_MEMBERS, 
  INITIAL_CLIENTS, 
  INITIAL_OFFERS, 
  INITIAL_REQUESTS,
  INITIAL_APPLICATIONS
} from './data';
import { 
  AppSettings, 
  TeamMember, 
  Client, 
  JobOffer, 
  BookingRequest, 
  Application,
  MileageTrip
} from './types';

const INITIAL_TRIP_APPS = ['Spark Driver', 'DoorDash', 'Instacart', 'UberEats', 'Amazon Flex', 'BGrowth Cleaning'];

const INITIAL_TRIPS: MileageTrip[] = [
  { id: 't1', date: '2026-07-01', app: 'Spark Driver', startMiles: 12050.0, endMiles: 12058.4, miles: 8.4, rate: 0.67, deduction: 5.63, purpose: 'Log delivery dispatches' },
  { id: 't2', date: '2026-06-30', app: 'Instacart', startMiles: 12025.0, endMiles: 12030.2, miles: 5.2, rate: 0.67, deduction: 3.48, purpose: 'Single grocery shift' },
  { id: 't3', date: '2026-06-29', app: 'DoorDash', startMiles: 12000.0, endMiles: 12012.0, miles: 12.0, rate: 0.67, deduction: 8.04, purpose: 'Rainy dinner surge' },
  { id: 't4', date: '2026-05-15', app: 'Amazon Flex', startMiles: 11820.0, endMiles: 11865.0, miles: 45.0, rate: 0.67, deduction: 30.15, purpose: 'Flex delivery routes' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('admin-console');
  const [userPerspective, setUserPerspective] = useState<'admin' | 'owner' | 'staff' | 'client'>('admin');
  
  // App Reactive States
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [offers, setOffers] = useState<JobOffer[]>(INITIAL_OFFERS);
  const [requests, setRequests] = useState<BookingRequest[]>(INITIAL_REQUESTS);
  const [apps, setApps] = useState<Application[]>(INITIAL_APPLICATIONS);
  
  // Shared platform mileage states
  const [trips, setTrips] = useState<MileageTrip[]>(INITIAL_TRIPS);
  const [tripApps, setTripApps] = useState<string[]>(INITIAL_TRIP_APPS);
  
  const [preFillRequest, setPreFillRequest] = useState<BookingRequest | null>(null);

  // Handlers
  const handlePreFillOffer = (req: BookingRequest) => {
    // Mark request as Approved
    setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r));
    setPreFillRequest(req);
    setActiveTab('job-board');
  };

  const handleRejectRequest = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const handleUpdateRequestStatus = (id: string, newStatus: BookingRequest['status']) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleAddRequest = (newReq: BookingRequest) => {
    setRequests([newReq, ...requests]);
  };

  const handleCreateOffer = (newOffer: JobOffer) => {
    setOffers([newOffer, ...offers]);
  };

  const handleCancelOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'cancelled' } : o));
  };

  const handleAssignWorker = (offerId: string, email: string, name: string) => {
    setOffers(offers.map(o => o.id === offerId ? { 
      ...o, 
      status: 'assigned', 
      assignedTo: name,
      responses: o.responses?.map(r => r.email === email ? { ...r, status: 'available' } : r)
    } : o));
    
    // Add client of this offer to CRM database if not already there
    const offer = offers.find(o => o.id === offerId);
    if (offer && offer.client) {
      const exists = clients.some(c => c.name.toLowerCase() === offer.client.toLowerCase());
      if (!exists) {
        const newCli: Client = {
          id: `cli_${Date.now()}`,
          name: offer.client,
          phone: '(555) 0199',
          email: `${offer.client.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          address: offer.address,
          city: 'Miami Beach',
          state: 'FL',
          zipcode: '33139',
          prefs: 'Acquired through automated job offer assignment board.',
          lastJob: offer.date
        };
        setClients([newCli, ...clients]);
      } else {
        setClients(clients.map(c => c.name.toLowerCase() === offer.client.toLowerCase() ? { ...c, lastJob: offer.date } : c));
      }
    }
  };

  const handleAddMember = (newMember: TeamMember) => {
    setMembers([newMember, ...members]);
  };

  const handleApproveApplication = (app: Application, type: 'fixed' | 'on-demand', payRate: number) => {
    const fName = app.name.split(' ')[0] || 'New';
    const lName = app.name.split(' ').slice(1).join(' ') || 'Member';
    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: app.name,
      firstName: fName,
      lastName: lName,
      email: app.email,
      phone: app.phone,
      zipcode: '33139',
      role: 'Cleaner',
      memberType: type,
      status: 'Active',
      payType: 'percent',
      payRate,
      transportation: true,
      emergencyJobs: false,
      maxDistance: 15,
      notes: app.message,
      inviteStatus: 'completed'
    };
    setMembers([newMember, ...members]);
    setApps(apps.filter(a => a.id !== app.id));
  };

  const handleRejectApplication = (id: string) => {
    setApps(apps.filter(a => a.id !== id));
  };

  const handleAddApplication = (newApp: Application) => {
    setApps([newApp, ...apps]);
  };

  const handleDeactivateMember = (id: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: 'Inactive' } : m));
  };

  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleNewBookingSubmit = (newReq: BookingRequest) => {
    setRequests([newReq, ...requests]);
  };

  const handleCompleteOnboarding = (newMember: TeamMember) => {
    setMembers([newMember, ...members]);
  };

  const handleUpdateJobStatus = (jobId: string, status: 'open' | 'assigned' | 'expired' | 'cancelled' | 'done') => {
    setOffers(offers.map(o => o.id === jobId ? { ...o, status } : o));
  };

  const handleUpdateChecklist = (jobId: string, tickedItems: string[]) => {
    setOffers(offers.map(o => o.id === jobId ? { ...o, ticked: tickedItems } : o));
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-700 font-sans">
      
      {/* Sidebar Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        pendingRequestsCount={requests.filter(r => r.status === 'Pending').length}
        openOffersCount={offers.filter(o => o.status === 'open').length}
        pendingAppsCount={apps.length} // Dynamic count from state
        bizName={settings.bizProfile?.name}
        enabledModules={settings.enabledModules}
        userPerspective={userPerspective}
        setUserPerspective={setUserPerspective}
      />

      {/* Main Content Pane */}
      <main className="flex-1 p-8 max-w-6xl mx-auto overflow-y-auto">
        {activeTab === 'admin-console' && (
          <AdminConsole 
            settings={settings}
            onUpdateGlobalModules={(updatedModules) => {
              setSettings(prev => ({
                ...prev,
                enabledModules: updatedModules
              }));
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'home' && (
          <AppHub 
            settings={settings}
            requests={requests}
            offers={offers}
            members={members}
            apps={apps}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            requests={requests}
            offers={offers}
            members={members}
            settings={settings}
            setActiveTab={setActiveTab}
            onPreFillOffer={handlePreFillOffer}
          />
        )}

        {activeTab === 'booking-requests' && (
          <BookingRequestsManager 
            requests={requests}
            onPreFillOffer={handlePreFillOffer}
            onRejectRequest={handleRejectRequest}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onAddRequest={handleAddRequest}
          />
        )}

        {activeTab === 'cleaning-schedule' && (
          <CleaningSchedule 
            offers={offers}
            settings={settings}
            members={members}
            clients={clients}
            onCreateOffer={handleCreateOffer}
            onCancelOffer={handleCancelOffer}
            onAssignWorker={handleAssignWorker}
            onUpdateJobStatus={handleUpdateJobStatus}
          />
        )}

        {activeTab === 'job-board' && (
          <JobBoard 
            offers={offers}
            settings={settings}
            members={members}
            clients={clients}
            onCreateOffer={handleCreateOffer}
            onCancelOffer={handleCancelOffer}
            onAssignWorker={handleAssignWorker}
            preFillRequest={preFillRequest}
            setPreFillRequest={setPreFillRequest}
          />
        )}

        {activeTab === 'team-payroll' && (
          <TeamPayroll 
            members={members}
            offers={offers}
            settings={settings}
            onAddMember={handleAddMember}
            onApproveApplication={handleApproveApplication}
            onDeactivateMember={handleDeactivateMember}
            apps={apps}
            onRejectApplication={handleRejectApplication}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsList 
            clients={clients}
            onAddClient={handleAddClient}
          />
        )}

        {activeTab === 'booking-form' && (
          <RequestForm 
            settings={settings}
            onSubmitRequest={handleNewBookingSubmit}
          />
        )}

        {activeTab === 'live-portal' && (
          <LivePortal 
            offers={offers}
            settings={settings}
          />
        )}

        {activeTab === 'recruitment' && (
          <RecruitmentPortal 
            settings={settings}
            onSubmitApplication={handleAddApplication}
          />
        )}

        {activeTab === 'onboarding' && (
          <OnboardingPortal 
            settings={settings}
            onCompleteOnboarding={handleCompleteOnboarding}
          />
        )}

        {activeTab === 'worker-portal' && (
          <WorkerPortal 
            offers={offers}
            members={members}
            onUpdateJobStatus={handleUpdateJobStatus}
            onUpdateChecklist={handleUpdateChecklist}
            onSyncMileage={(date, platform, miles, purpose) => {
              const lastTrip = trips[0];
              const startMiles = lastTrip ? lastTrip.endMiles : 12058.4;
              const endMiles = startMiles + miles;
              const irsRate = 0.67;
              
              const newTrip: MileageTrip = {
                id: `trip_sync_${Date.now()}`,
                date,
                app: platform,
                startMiles,
                endMiles,
                miles,
                rate: irsRate,
                deduction: parseFloat((miles * irsRate).toFixed(2)),
                purpose
              };
              setTrips(prev => [newTrip, ...prev]);
            }}
          />
        )}

        {activeTab === 'delivery-tracker' && (
          <DeliveryTracker 
            settings={settings}
            onSyncMileage={(date, store, miles) => {
              const lastTrip = trips[0];
              const startMiles = lastTrip ? lastTrip.endMiles : 12058.4;
              const endMiles = startMiles + miles;
              const irsRate = 0.67;
              
              const newTrip: MileageTrip = {
                id: `trip_sync_${Date.now()}`,
                date,
                app: store,
                startMiles,
                endMiles,
                miles,
                rate: irsRate,
                deduction: parseFloat((miles * irsRate).toFixed(2)),
                purpose: `Synchronized from ${store} deliveries`
              };
              setTrips(prev => [newTrip, ...prev]);
            }}
          />
        )}

        {activeTab === 'mileage-tracker' && (
          <MileageTracker 
            settings={settings}
            trips={trips}
            setTrips={setTrips}
            apps={tripApps}
            setApps={setTripApps}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel 
            settings={settings}
            onSaveSettings={handleSaveSettings}
            members={members}
            onUpdateMembers={setMembers}
          />
        )}
      </main>

    </div>
  );
}
