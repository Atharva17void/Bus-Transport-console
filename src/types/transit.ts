export type SchoolTier = 'Elementary' | 'Middle' | 'High School';
export type PunctualityStatus = 'on_time' | 'slight_delay' | 'critical_delay' | 'arrived';
export type ShiftType = 'am_pickup' | 'pm_dropoff';

export interface RouteStop {
  id: string;
  name: string;
  scheduledTime: string;
  actualOrEstTime: string;
  status: 'completed' | 'current' | 'upcoming';
  varianceMinutes: number;
  studentsBoarded: number;
}

export interface BusRoute {
  id: string;
  routeCode: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  schoolTier: SchoolTier;
  schoolName: string;
  scheduledBellTime: string;
  targetArrival: string;
  estimatedArrival: string;
  varianceMinutes: number; // e.g. -2 = 2 min early, 0 = exact, 6 = 6 min late
  status: PunctualityStatus;
  currentStatusText: string;
  studentsOnboard: number;
  capacity: number;
  delayCause?: 'Traffic Congestion' | 'Road Construction' | 'Student Boarding Delay' | 'Mechanical Inspection' | 'Weather & Fog' | 'Detour';
  zoneCluster: 'North Hills' | 'West Lake' | 'Pine Valley' | 'Central High' | 'Oakridge STEM' | 'South Bay';
  currentSpeedMph: number;
  stops: RouteStop[];
  lastUpdated: string;
}

export interface HourlyPunctualityDataPoint {
  timeSlot: string;
  scheduledArrivals: number;
  onTime: number;
  delayed: number;
  avgVarianceMin: number;
  punctualityRate: number;
}

export interface DelayReasonStat {
  reason: string;
  count: number;
  percentage: number;
  avgDelayMinutes: number;
  color: string;
}

export interface ClusterPerformance {
  cluster: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  averageRate: number;
  routesCount: number;
}
