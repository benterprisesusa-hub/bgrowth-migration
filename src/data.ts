import { AppSettings, TeamMember, Client, JobOffer, Application, SpecialHour, BookingRequest, ServiceCategory } from './types';

export const CP_TYPES: ServiceCategory[] = [
  { id: 'house', name: 'House Cleaning', ico: '🏠' },
  { id: 'commercial', name: 'Commercial', ico: '🏢' },
  { id: 'moveinout', name: 'Move In/Out', ico: '🚛' },
  { id: 'construction', name: 'Post-Construction', ico: '🏗️' },
  { id: 'upholstery', name: 'Upholstery', ico: '🛋️' },
  { id: 'carpet', name: 'Carpet Cleaning', ico: '🧶' }
];

export const CP_SQFT_TIME_DEFAULTS: Record<string, { std: number; deep: number }> = {
  house: { std: 0.25, deep: 0.40 },
  commercial: { std: 0.20, deep: 0.35 },
  moveinout: { std: 0.30, deep: 0.50 },
  construction: { std: 0.35, deep: 0.60 },
  upholstery: { std: 0.15, deep: 0.25 },
  carpet: { std: 0.10, deep: 0.20 }
};

export const INITIAL_SETTINGS: AppSettings = {
  bizProfile: {
    name: 'BGrowth Cleaning Club',
    address: '123 Ocean Drive, Miami Beach',
    phone: '(305) 555-0199',
    email: 'info@bgrowthcleaning.com',
    logo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&auto=format&fit=crop&q=60',
    zip: '33139'
  },
  pricing: {
    house: { hourRate: 45, sqftRate: 0.12, minCharge: 120 },
    commercial: { hourRate: 60, sqftRate: 0.15, minCharge: 200 },
    moveinout: { hourRate: 50, sqftRate: 0.18, minCharge: 180 },
    construction: { hourRate: 55, sqftRate: 0.22, minCharge: 250 },
    upholstery: { hourRate: 40, sqftRate: 0.10, minCharge: 90 },
    carpet: { hourRate: 45, sqftRate: 0.08, minCharge: 100 }
  },
  activeServices: ['house', 'commercial', 'moveinout', 'carpet'],
  sqftTime: CP_SQFT_TIME_DEFAULTS,
  roomPricing: {
    minimum: 120,
    studio: {
      price: 130,
      stdTime: 2.5,
      deepTime: 4.0,
      description: 'Complete cleaning of all common areas including kitchen.',
      includes: 'Living room, Entrance & hallway, Balcony / porch, Common areas, Kitchen'
    },
    bedroom: {
      price: 40,
      stdTime: 25, // minutes
      deepTime: 45,
      description: 'Full bedroom cleaning including closet and windows.',
      includes: 'Full bedroom, Closet exterior, Windows, Dusting all surfaces, Vacuuming / mopping'
    },
    bathroom: {
      price: 60,
      stdTime: 40, // minutes
      deepTime: 70,
      description: 'Complete bathroom cleaning and sanitization.',
      includes: 'Toilet cleaning & sanitizing, Shower / bathtub, Sink & mirrors, Floor mopping, Cabinet exterior'
    }
  },
  allExtraFees: [
    { id: 'fridge', name: 'Inside Fridge', ico: '❄️', price: 35, description: 'Deep clean inside refrigerator', includes: 'Shelves, drawers, door seals', stdMin: 20, deepMin: 30 },
    { id: 'oven', name: 'Inside Oven', ico: '🍳', price: 40, description: 'Remove grease from inside oven', includes: 'Oven racks, walls, glass door', stdMin: 25, deepMin: 40 },
    { id: 'cabinets', name: 'Inside Cabinets', ico: '🚪', price: 50, description: 'Clean inside empty kitchen cabinets', includes: 'Wiping all shelves and drawers', stdMin: 30, deepMin: 50 },
    { id: 'windows', name: 'Interior Windows', ico: '🖼️', price: 45, description: 'Clean inside window glass & sills', includes: 'Squeegee glass, wipe sills and tracks', stdMin: 30, deepMin: 45 },
    { id: 'laundry', name: 'Wash & Fold Laundry', ico: '🧺', price: 30, description: 'Wash, dry, and fold one load', includes: 'Load washer/dryer, fold laundry neatly', stdMin: 45, deepMin: 60 },
    { id: 'dishes', name: 'Wash Dishes', ico: '🍽️', price: 25, description: 'Wash kitchen dishes and load dishwasher', includes: 'Hand wash pots, load/run dishwasher', stdMin: 15, deepMin: 25 }
  ],
  extraFees: [
    { id: 'fridge', name: 'Inside Fridge', ico: '❄️', price: 35, description: 'Deep clean inside refrigerator', includes: 'Shelves, drawers, door seals', stdMin: 20, deepMin: 30 },
    { id: 'oven', name: 'Inside Oven', ico: '🍳', price: 40, description: 'Remove grease from inside oven', includes: 'Oven racks, walls, glass door', stdMin: 25, deepMin: 40 },
    { id: 'windows', name: 'Interior Windows', ico: '🖼️', price: 45, description: 'Clean inside window glass & sills', includes: 'Squeegee glass, wipe sills and tracks', stdMin: 30, deepMin: 45 }
  ],
  deepClean: {
    type: 'percent',
    value: 30 // +30%
  },
  requestFormMethod: 'hour',
  requestFormDisplay: 'range',
  goals: {
    revenue: 12000,
    jobs: 50
  },
  offerEmails: 'partners@bgrowthcleaning.com, dispatch@bgrowthcleaning.com',
  requestNotifyEmail: 'leads@bgrowthcleaning.com',
  confirmationText: 'Please make sure someone is home 10 minutes before the appointment.',
  reminderText24: 'Remember to leave access to the property if you will not be present.',
  reminderText2: 'Our team is on the way! ETA 15 minutes.',
  photoFormat: 'inline',
  enabledModules: {
    cleaning: true,
    delivery: true,
    mileage: true
  },
  workHours: {
    'admin@bgrowth.com': { start: '08:00', end: '18:00' }
  }
};

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'mem1',
    name: 'Ana Silva',
    firstName: 'Ana',
    lastName: 'Silva',
    email: 'ana.silva@bgrowth.com',
    phone: '(305) 555-0101',
    zipcode: '33139',
    role: 'Cleaner',
    memberType: 'fixed',
    status: 'Active',
    payType: 'percent',
    payRate: 60, // 60% of job payout
    transportation: true,
    emergencyJobs: true,
    maxDistance: 20,
    notes: 'Very detail-oriented, highly rated by clients.',
    inviteStatus: 'completed'
  },
  {
    id: 'mem2',
    name: 'Carlos Mendez',
    firstName: 'Carlos',
    lastName: 'Mendez',
    email: 'carlos.m@bgrowth.com',
    phone: '(305) 555-0102',
    zipcode: '33140',
    role: 'Cleaner',
    memberType: 'fixed',
    status: 'Active',
    payType: 'hourly',
    payRate: 22, // $22/hr
    transportation: true,
    emergencyJobs: false,
    maxDistance: 15,
    notes: 'Good team player, punctual.',
    inviteStatus: 'completed'
  },
  {
    id: 'mem3',
    name: 'Juliana Barbosa',
    firstName: 'Juliana',
    lastName: 'Barbosa',
    email: 'juliana.b@gmail.com',
    phone: '(305) 555-0103',
    zipcode: '33141',
    role: 'Cleaner',
    memberType: 'on-demand',
    status: 'Active',
    payType: 'percent',
    payRate: 60,
    transportation: false,
    emergencyJobs: true,
    maxDistance: 10,
    notes: 'Available on weekends.',
    inviteStatus: 'completed'
  },
  {
    id: 'mem4',
    name: 'Ricardo Santos',
    firstName: 'Ricardo',
    lastName: 'Santos',
    email: 'ricardo.santos@bgrowth.com',
    phone: '(305) 555-0104',
    zipcode: '33139',
    role: 'Supervisor',
    memberType: 'fixed',
    status: 'Active',
    payType: 'hourly',
    payRate: 28,
    transportation: true,
    emergencyJobs: true,
    maxDistance: 25,
    notes: 'Coordinates the North Beach crews.',
    inviteStatus: 'completed'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli1',
    name: 'Sarah Johnson',
    phone: '(305) 555-0201',
    email: 'sarah.j@example.com',
    address: '450 Alton Road',
    city: 'Miami Beach',
    state: 'FL',
    zipcode: '33139',
    prefs: 'Prefers green cleaning products. Has a cat.',
    lastJob: '2026-06-25'
  },
  {
    id: 'cli2',
    name: 'David Miller',
    phone: '(305) 555-0202',
    email: 'david.miller@example.com',
    address: '1001 Brickell Bay Dr',
    city: 'Miami',
    state: 'FL',
    zipcode: '33131',
    prefs: 'Key at concierge desk. Clean balcony.',
    lastJob: '2026-06-18'
  },
  {
    id: 'cli3',
    name: 'Emma Watson',
    phone: '(305) 555-0203',
    email: 'emma.w@example.com',
    address: '150 Ocean Drive, Apt 405',
    city: 'Miami Beach',
    state: 'FL',
    zipcode: '33139',
    prefs: 'Do not disturb office desk items.',
    lastJob: '2026-06-28'
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    name: 'Maria Rodrigues',
    email: 'maria.rod@gmail.com',
    phone: '(305) 555-0301',
    availability: 'Monday to Friday, 8am to 4pm',
    message: 'I have 3 years of residential cleaning experience. I am reliable and have my own cleaning kit.',
    createdAt: '2026-06-29T10:30:00.000Z'
  },
  {
    id: 'app2',
    name: 'John Smith',
    email: 'jsmith.clean@gmail.com',
    phone: '(305) 555-0302',
    availability: 'Weekends only',
    message: 'Looking for extra work on Saturdays and Sundays. I have a car.',
    createdAt: '2026-06-30T14:15:00.000Z'
  }
];

export const INITIAL_OFFERS: JobOffer[] = [
  {
    id: 'off1',
    title: 'Bi-Weekly Residential — Sarah J.',
    date: '2026-07-02',
    time: '09:00',
    client: 'Sarah Johnson',
    serviceType: 'house',
    cleanType: 'standard',
    pricingMethod: 'hour',
    clientValue: 135,
    duration: 3,
    extraFees: [],
    extraFeesTotal: 0,
    payment: 81, // 60%
    bonus: 10,
    workersNeeded: 1,
    address: '450 Alton Road, Miami Beach, FL 33139',
    notes: 'Has a very friendly cat. Focus on kitchen cabinets.',
    urgency: 'scheduled',
    workerEmails: ['ana.silva@bgrowth.com', 'juliana.b@gmail.com'],
    validityHours: 24,
    autoResend: true,
    resendMax: 2,
    status: 'open',
    responses: [
      { email: 'ana.silva@bgrowth.com', name: 'Ana Silva', status: 'available', location: '3.2 mi away', time: '08:45 AM' }
    ],
    expiresAt: '2026-07-01T23:00:00.000Z'
  },
  {
    id: 'off2',
    title: 'Move In/Out Cleaning — Brickell Apt',
    date: '2026-07-03',
    time: '11:00',
    client: 'David Miller',
    serviceType: 'moveinout',
    cleanType: 'deep',
    pricingMethod: 'sqft',
    clientValue: 312,
    duration: 4.5,
    extraFees: [
      { id: 'fridge', name: 'Inside Fridge', ico: '❄️', price: 35, qty: 1, total: 35 },
      { id: 'oven', name: 'Inside Oven', ico: '🍳', price: 40, qty: 1, total: 40 }
    ],
    extraFeesTotal: 75,
    payment: 180,
    bonus: 15,
    workersNeeded: 2,
    address: '1001 Brickell Bay Dr, Miami, FL 33131',
    notes: 'Key with concierge desk. Fridge and Oven cleaning included.',
    urgency: 'scheduled',
    workerEmails: ['ana.silva@bgrowth.com', 'carlos.m@bgrowth.com', 'juliana.b@gmail.com'],
    validityHours: 24,
    autoResend: false,
    resendMax: 1,
    status: 'open',
    responses: [
      { email: 'carlos.m@bgrowth.com', name: 'Carlos Mendez', status: 'available', location: '1.2 mi away', time: '10:15 AM' },
      { email: 'juliana.b@gmail.com', name: 'Juliana Barbosa', status: 'available', location: '2.5 mi away', time: '10:30 AM' }
    ],
    expiresAt: '2026-07-02T11:00:00.000Z'
  },
  {
    id: 'off3',
    title: 'Urgent Studio Deep Clean — Emma W.',
    date: '2026-07-01',
    time: '14:00',
    client: 'Emma Watson',
    serviceType: 'house',
    cleanType: 'deep',
    pricingMethod: 'rooms',
    clientValue: 169, // base 130 + 30% deep surcharge
    duration: 3,
    extraFees: [],
    extraFeesTotal: 0,
    payment: 101.40,
    bonus: 20,
    workersNeeded: 1,
    address: '150 Ocean Drive, Apt 405, Miami Beach, FL 33139',
    notes: 'Wants same-day deep cleaning. Key box on door code 4545.',
    urgency: 'urgent',
    workerEmails: ['ana.silva@bgrowth.com'],
    validityHours: 4,
    autoResend: false,
    resendMax: 1,
    status: 'assigned',
    assignedTo: 'Ana Silva',
    responses: [
      { email: 'ana.silva@bgrowth.com', name: 'Ana Silva', status: 'available', location: '0.5 mi away' }
    ],
    expiresAt: '2026-07-01T12:00:00.000Z'
  }
];

export const CHECKLIST_ITEMS: Record<string, string[]> = {
  house: [
    'Dust all furniture & decorative items',
    'Vacuum & mop all floors and rugs',
    'Clean & sanitize toilet, shower & sink',
    'Wipe kitchen counter, backsplash & stovetop',
    'Empty all trash bins & replace liners',
    'Make beds & change bed sheets'
  ],
  commercial: [
    'Disinfect high-touch office desks',
    'Sanitize common area toilets & sinks',
    'Vacuum carpeting & mop hallway hard floors',
    'Clean entrance glass door & reception counter',
    'Empty trash/recycle bins, replace liners',
    'Sanitize breakroom microwave & sink area'
  ],
  moveinout: [
    'Deep clean inside all empty kitchen cabinets',
    'Clean inside and outside of fridge/freezer',
    'Clean inside oven cavity, grates & door',
    'Wipe baseboards, light switches & door frames',
    'Vacuum/mop all floors & closet tracks',
    'Scrub tile grout & bleach bathroom areas'
  ],
  construction: [
    'Remove fine plaster/grout dust from walls',
    'Scrape paint splatters & adhesive from windows',
    'Vacuum subfloors, baseboards & tracks',
    'Wipe inside cabinets, drawers & closets',
    'Polishing faucets, mirrors & stainless steel',
    'Mop all hard floors with dust-binding solution'
  ],
  upholstery: [
    'Vacuum fabric folds, seams & crevices',
    'Pre-treat heavy grease & beverage stains',
    'Steam extract upholstery fibers',
    'Apply odor neutralizer & sanitizing spray',
    'Gently brush delicate velvet/microfiber parts'
  ],
  carpet: [
    'Pre-vacuum carpet fibers to lift dirt',
    'Spray high-traffic lanes with pre-treatment',
    'Deep hot water steam extraction',
    'Deodorize and sanitize carpet surface',
    'Rake fibers for uniform fluffiness'
  ]
};

export const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'req_1',
    name: 'George Clooney',
    phone: '(305) 555-8899',
    email: 'george@clooney.com',
    address: '800 West Ave',
    complement: 'Penthouse B',
    zip: '33139',
    city: 'Miami Beach',
    state: 'FL',
    accessInstructions: 'Lobby security will buzzer you in.',
    serviceType: 'house',
    propertyType: 'house',
    cleanType: 'deep',
    studio: false,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2400,
    pets: true,
    extras: [
      { id: 'fridge', qty: 1 },
      { id: 'windows', qty: 1 }
    ],
    preferredDate: '2026-07-05',
    preferredTime: '10:00',
    notes: 'Focus on living room windows and oven area.',
    estimatedTotal: 395,
    status: 'New',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'req_2',
    name: 'Penelope Cruz',
    phone: '(305) 555-4422',
    email: 'penelope.cruz@example.com',
    address: '500 Ocean Drive',
    complement: 'Apt 1204',
    zip: '33139',
    city: 'Miami Beach',
    state: 'FL',
    accessInstructions: 'Key with front desk manager.',
    serviceType: 'house',
    propertyType: 'apt',
    cleanType: 'standard',
    studio: false,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    pets: false,
    extras: [],
    preferredDate: '2026-07-06',
    preferredTime: '13:00',
    notes: 'Please fold bathroom towels in fancy hotel style.',
    estimatedTotal: 175,
    status: 'Contacted',
    createdAt: '2026-07-01T08:15:00.000Z'
  },
  {
    id: 'req_3',
    name: 'Brad Pitt',
    phone: '(305) 555-1212',
    email: 'brad.pitt@example.com',
    address: '1500 Collins Ave',
    complement: 'Villa 4',
    zip: '33139',
    city: 'Miami Beach',
    state: 'FL',
    accessInstructions: 'Gate code is *2026#.',
    serviceType: 'moveinout',
    propertyType: 'house',
    cleanType: 'deep',
    studio: false,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3200,
    pets: true,
    extras: [
      { id: 'fridge', qty: 1 },
      { id: 'oven', qty: 1 },
      { id: 'cabinets', qty: 1 }
    ],
    preferredDate: '2026-07-08',
    preferredTime: '09:00',
    notes: 'Moving in. House must be dust-free for kids.',
    estimatedTotal: 580,
    status: 'Quoted',
    createdAt: '2026-06-30T15:30:00.000Z'
  },
  {
    id: 'req_4',
    name: 'Robert Downey Jr.',
    phone: '(305) 555-3000',
    email: 'rdj@stark.com',
    address: '1 Star Island Dr',
    complement: '',
    zip: '33139',
    city: 'Miami Beach',
    state: 'FL',
    accessInstructions: 'Let security know you are here for Stark.',
    serviceType: 'commercial',
    propertyType: 'office',
    cleanType: 'standard',
    studio: false,
    bedrooms: 0,
    bathrooms: 4,
    sqft: 5000,
    pets: false,
    extras: [],
    preferredDate: '2026-07-10',
    preferredTime: '17:00',
    notes: 'After-hours office cleaning. Wipe computer monitors gently.',
    estimatedTotal: 450,
    status: 'Awaiting',
    createdAt: '2026-06-30T10:10:00.000Z'
  },
  {
    id: 'req_5',
    name: 'Margot Robbie',
    phone: '(305) 555-9090',
    email: 'margot@barbieland.com',
    address: '700 Ocean Dr',
    complement: 'Beach House 3',
    zip: '33139',
    city: 'Miami Beach',
    state: 'FL',
    accessInstructions: 'Key in pink flowerpot on terrace.',
    serviceType: 'house',
    propertyType: 'house',
    cleanType: 'deep',
    studio: true,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    pets: true,
    extras: [],
    preferredDate: '2026-07-04',
    preferredTime: '11:00',
    notes: 'Prefers non-scented products. Very neat.',
    estimatedTotal: 210,
    status: 'Booked',
    createdAt: '2026-06-29T11:00:00.000Z'
  }
];

export const INITIAL_SPECIAL_HOURS: SpecialHour[] = [
  {
    id: 'sp1',
    memberEmail: 'juliana.b@gmail.com',
    memberName: 'Juliana Barbosa',
    date: '2026-07-04',
    start: '',
    end: '',
    type: 'Off'
  },
  {
    id: 'sp2',
    memberEmail: 'carlos.m@bgrowth.com',
    memberName: 'Carlos Mendez',
    date: '2026-07-02',
    start: '12:00',
    end: '14:00',
    type: 'Partial'
  }
];
