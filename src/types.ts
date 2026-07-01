export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  zip: string;
}

export interface ServicePrice {
  hourRate: number;
  sqftRate: number;
  minCharge: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  ico: string;
}

export interface RoomConfig {
  price: number;
  stdTime: number; // in hours for studio, minutes for others
  deepTime: number;
  description: string;
  includes: string;
}

export interface RoomPricing {
  minimum: number;
  studio: RoomConfig;
  bedroom: RoomConfig;
  bathroom: RoomConfig;
}

export interface ExtraFee {
  id: string;
  name: string;
  ico: string;
  price: number;
  description: string;
  includes: string;
  stdMin: number;
  deepMin: number;
  qty?: number;
}

export interface WorkHours {
  start: string;
  end: string;
}

export interface SpecialHour {
  id: string;
  memberEmail: string;
  memberName: string;
  date: string;
  start: string;
  end: string;
  type: 'Off' | 'Partial' | 'Extra' | 'Vacation';
}

export interface DeepCleanConfig {
  type: 'percent' | 'fixed';
  value: number;
}

export interface Goals {
  revenue: number;
  jobs: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  prefs: string;
  lastJob?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipcode: string;
  role: 'Cleaner' | 'Supervisor' | 'Manager';
  memberType: 'fixed' | 'on-demand';
  status: 'Active' | 'Vacation' | 'Inactive';
  payType: 'percent' | 'hourly' | 'fixed_job';
  payRate: number;
  transportation: boolean;
  emergencyJobs: boolean;
  maxDistance: number;
  notes?: string;
  inviteStatus?: 'pending' | 'completed';
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  availability: string;
  message: string;
  createdAt: string;
}

export interface JobResponse {
  email: string;
  name: string;
  status: 'available' | 'not_available';
  location?: string;
  time?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  date: string;
  time: string;
  client: string;
  serviceType: string;
  cleanType: 'standard' | 'deep';
  pricingMethod: 'hour' | 'sqft' | 'rooms';
  clientValue: number;
  duration: number;
  extraFees: { id: string; name: string; ico: string; price: number; qty: number; total: number }[];
  extraFeesTotal: number;
  payment: number;
  bonus: number;
  workersNeeded: number;
  address: string;
  notes: string;
  urgency: 'urgent' | 'same_day' | 'scheduled';
  workerEmails: string[];
  validityHours: number;
  autoResend: boolean;
  resendMax: number;
  status: 'open' | 'assigned' | 'expired' | 'cancelled' | 'done';
  ticked?: string[];
  responses?: JobResponse[];
  expiresAt?: string;
  assignedTo?: string;
}

export interface SqftTimeDefault {
  std: number;
  deep: number;
}

export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  complement: string;
  zip: string;
  city: string;
  state: string;
  accessInstructions: string;
  serviceType: string;
  propertyType: 'house' | 'apt' | 'office';
  cleanType: 'standard' | 'deep';
  studio: boolean;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  pets: boolean;
  extras: { id: string; qty: number }[];
  preferredDate: string;
  preferredTime: string;
  notes: string;
  estimatedTotal: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'New' | 'Contacted' | 'Quoted' | 'Awaiting' | 'Booked' | 'Lost';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  sender: 'client' | 'cleaner' | 'office';
  senderName: string;
  message: string;
  photoUrl?: string;
  createdAt: string;
}

export interface MileageTrip {
  id: string;
  date: string;
  app: string;
  startMiles: number;
  endMiles: number;
  miles: number;
  rate: number;
  deduction: number;
  purpose: string;
}

export interface DeliveryBatch {
  id: string;
  date: string;
  store: string;
  basePay: number;
  tips: number;
  miles: number;
  orders: number;
  timeStart: string;
  timeEnd: string;
  notes: string;
}

export interface AppSettings {
  bizProfile: BusinessProfile;
  pricing: Record<string, ServicePrice>;
  activeServices: string[];
  sqftTime: Record<string, SqftTimeDefault>;
  roomPricing: RoomPricing;
  allExtraFees: ExtraFee[];
  extraFees: ExtraFee[];
  deepClean: DeepCleanConfig;
  requestFormMethod: 'hour' | 'sqft' | 'rooms';
  requestFormDisplay: 'range' | 'fixed';
  goals: Goals;
  offerEmails: string;
  requestNotifyEmail: string;
  confirmationText: string;
  reminderText24: string;
  reminderText2: string;
  photoFormat: 'inline' | 'attached';
  workHours: Record<string, WorkHours>;
  enabledModules?: {
    cleaning: boolean;
    delivery: boolean;
    mileage: boolean;
  };
}
