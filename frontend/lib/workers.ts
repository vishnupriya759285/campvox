export interface CollegeWorker {
  id: string;
  name: string;
  email: string;
  section: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  phone: string;
  avatar?: string;
  badgeBg: string;
  badgeText: string;
}

export const COLLEGE_WORKERS: CollegeWorker[] = [
  // 1. Electrical Section (3 Workers)
  {
    id: 'worker-elec-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.electrician@campvox.edu',
    section: 'Electrical',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical',
    designation: 'Senior Campus Electrician (Emp #EW101)',
    phone: '+91 98450 11201',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
  },
  {
    id: 'worker-elec-2',
    name: 'Suresh Varma',
    email: 'suresh.electrician@campvox.edu',
    section: 'Electrical',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical',
    designation: 'Substation & Panel Technician (Emp #EW102)',
    phone: '+91 98450 11202',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
  },
  {
    id: 'worker-elec-3',
    name: 'Mohan Das',
    email: 'mohan.electrician@campvox.edu',
    section: 'Electrical',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical',
    designation: 'Lighting & Classroom Fixtures Tech (Emp #EW103)',
    phone: '+91 98450 11203',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border-amber-200',
  },

  // 2. Plumbing Section (3 Workers)
  {
    id: 'worker-plumb-1',
    name: 'Ramesh Babu',
    email: 'ramesh.plumber@campvox.edu',
    section: 'Plumbing',
    departmentId: 'dept-plumbing',
    departmentName: 'Plumbing',
    designation: 'Head Campus Plumber (Emp #PW201)',
    phone: '+91 98450 22301',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800 border-blue-200',
  },
  {
    id: 'worker-plumb-2',
    name: 'K. Venkatesh',
    email: 'venkatesh.plumber@campvox.edu',
    section: 'Plumbing',
    departmentId: 'dept-plumbing',
    departmentName: 'Plumbing',
    designation: 'Pipeline & Drainage Specialist (Emp #PW202)',
    phone: '+91 98450 22302',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800 border-blue-200',
  },
  {
    id: 'worker-plumb-3',
    name: 'Anand Swamy',
    email: 'anand.plumber@campvox.edu',
    section: 'Plumbing',
    departmentId: 'dept-plumbing',
    departmentName: 'Plumbing',
    designation: 'Water Supply & Pump Operator (Emp #PW203)',
    phone: '+91 98450 22303',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800 border-blue-200',
  },

  // 3. IT & Network Section (3 Workers)
  {
    id: 'worker-it-1',
    name: 'Karthik Reddy',
    email: 'karthik.it@campvox.edu',
    section: 'IT & Network',
    departmentId: 'dept-wifi',
    departmentName: 'IT & Network',
    designation: 'Lead Network Systems Engineer (Emp #NW301)',
    phone: '+91 98450 33401',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800 border-indigo-200',
  },
  {
    id: 'worker-it-2',
    name: 'Priya Sharma',
    email: 'priya.it@campvox.edu',
    section: 'IT & Network',
    departmentId: 'dept-wifi',
    departmentName: 'IT & Network',
    designation: 'Wi-Fi & AP Infrastructure Tech (Emp #NW302)',
    phone: '+91 98450 33402',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800 border-indigo-200',
  },
  {
    id: 'worker-it-3',
    name: 'Vignesh Nair',
    email: 'vignesh.it@campvox.edu',
    section: 'IT & Network',
    departmentId: 'dept-wifi',
    departmentName: 'IT & Network',
    designation: 'Smart Class & Lab Hardware Tech (Emp #NW303)',
    phone: '+91 98450 33403',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800 border-indigo-200',
  },

  // 4. Facilities & Maintenance Section (3 Workers)
  {
    id: 'worker-fac-1',
    name: 'Murugan Selvam',
    email: 'murugan.facilities@campvox.edu',
    section: 'Facilities & Civil',
    departmentId: 'dept-facilities',
    departmentName: 'Facilities',
    designation: 'Senior Campus Carpenter (Emp #FW401)',
    phone: '+91 98450 44501',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
  },
  {
    id: 'worker-fac-2',
    name: 'G. Balaji',
    email: 'balaji.facilities@campvox.edu',
    section: 'Facilities & Civil',
    departmentId: 'dept-facilities',
    departmentName: 'Facilities',
    designation: 'Civil Works & Masonry Specialist (Emp #FW402)',
    phone: '+91 98450 44502',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
  },
  {
    id: 'worker-fac-3',
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.facilities@campvox.edu',
    section: 'Facilities & Civil',
    departmentId: 'dept-facilities',
    departmentName: 'Facilities',
    designation: 'Facilities & Sanitation Supervisor (Emp #FW403)',
    phone: '+91 98450 44503',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800 border-emerald-200',
  },
];

export const WORKER_SECTIONS = [
  { id: 'dept-electrical', name: 'Electrical Section', icon: '⚡' },
  { id: 'dept-plumbing', name: 'Plumbing Section', icon: '🚰' },
  { id: 'dept-wifi', name: 'IT & Network Section', icon: '📶' },
  { id: 'dept-facilities', name: 'Facilities & Civil Section', icon: '🏢' },
];

export function getWorkerById(id?: string | null): CollegeWorker | undefined {
  if (!id) return undefined;
  return COLLEGE_WORKERS.find((w) => w.id === id);
}

export function findWorkerByNameOrEmail(text?: string | null): CollegeWorker | undefined {
  if (!text) return undefined;
  const clean = text.toLowerCase().trim();
  return COLLEGE_WORKERS.find(
    (w) => w.name.toLowerCase().includes(clean) || w.email.toLowerCase().includes(clean) || clean.includes(w.name.toLowerCase())
  );
}
