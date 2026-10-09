import React, { useState, useMemo, useEffect } from 'react';
import {
  Bus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Download,
  Bell,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Info
} from 'lucide-react';

// Simple data structures without heavy TypeScript complexity
interface BusItem {
  id: string;
  routeCode: string;
  busNumber: string;
  driver: string;
  driverPhone: string;
  school: string;
  tier: 'Elementary' | 'Middle' | 'High School';
  zone: string;
  scheduledBell: string;
  targetArrival: string;
  estimatedArrival: string;
  varianceMinutes: number; // 0: on time, negative: early, positive: late
  status: 'on_time' | 'slight_delay' | 'critical_delay' | 'arrived';
  transferType?: 'Transfer Hub Connection' | 'Direct Route';
  transferHub?: string;
  connectingBus?: string;
  transferBufferMinutes?: number;
  studentsCount: number;
  capacity: number;
  currentLocation: string;
  delayReason?: string;
  speedMph: number;
  stops: {
    name: string;
    scheduled: string;
    actual: string;
    completed: boolean;
  }[];
}

const INITIAL_BUSES: BusItem[] = [
  {
    id: 'b1',
    routeCode: 'Route 101-North',
    busNumber: 'BUS #14',
    driver: 'Marcus Vance',
    driverPhone: '(555) 234-8901',
    school: 'Lincoln Elementary',
    tier: 'Elementary',
    zone: 'North Hills',
    scheduledBell: '08:00 AM',
    targetArrival: '07:45 AM',
    estimatedArrival: '07:44 AM',
    varianceMinutes: -1,
    status: 'on_time',
    transferType: 'Transfer Hub Connection',
    transferHub: 'North Transfer Hub',
    connectingBus: 'BUS #28 (Lincoln Feeder B)',
    transferBufferMinutes: 9,
    studentsCount: 42,
    capacity: 48,
    currentLocation: 'Approaching Gate 2',
    speedMph: 18,
    stops: [
      { name: 'Cedar Ave & 4th', scheduled: '07:15 AM', actual: '07:14 AM', completed: true },
      { name: 'North Transfer Hub Bay 3', scheduled: '07:25 AM', actual: '07:24 AM', completed: true },
      { name: 'Oak Valley Crossing', scheduled: '07:35 AM', actual: '07:34 AM', completed: true },
      { name: 'Lincoln Elementary Drop-off', scheduled: '07:45 AM', actual: '07:44 AM', completed: false }
    ]
  },
  {
    id: 'b2',
    routeCode: 'Route 104-North',
    busNumber: 'BUS #22',
    driver: 'Elena Rostova',
    driverPhone: '(555) 345-6712',
    school: 'Lincoln Elementary',
    tier: 'Elementary',
    zone: 'North Hills',
    scheduledBell: '08:00 AM',
    targetArrival: '07:45 AM',
    estimatedArrival: '07:53 AM',
    varianceMinutes: 8,
    status: 'slight_delay',
    transferType: 'Transfer Hub Connection',
    transferHub: 'North Transfer Hub',
    connectingBus: 'BUS #14 (Connecting Transfer)',
    transferBufferMinutes: 2,
    delayReason: 'Traffic Congestion',
    studentsCount: 38,
    capacity: 48,
    currentLocation: 'Held at Parkway signals',
    speedMph: 8,
    stops: [
      { name: 'Northgate Loop', scheduled: '07:10 AM', actual: '07:10 AM', completed: true },
      { name: 'St. Jude Community Ctr', scheduled: '07:22 AM', actual: '07:26 AM', completed: true },
      { name: 'North Transfer Hub Bay 1', scheduled: '07:34 AM', actual: '07:42 AM', completed: false },
      { name: 'Lincoln Elementary Drop-off', scheduled: '07:45 AM', actual: '07:53 AM', completed: false }
    ]
  },
  {
    id: 'b3',
    routeCode: 'Route 208-West',
    busNumber: 'BUS #09',
    driver: 'David Washington',
    driverPhone: '(555) 456-7890',
    school: 'West Lake Middle School',
    tier: 'Middle',
    zone: 'West Lake',
    scheduledBell: '08:30 AM',
    targetArrival: '08:15 AM',
    estimatedArrival: '08:14 AM',
    varianceMinutes: -1,
    status: 'on_time',
    transferType: 'Direct Route',
    studentsCount: 51,
    capacity: 54,
    currentLocation: 'West Lake Overpass',
    speedMph: 29,
    stops: [
      { name: 'Crestview Commons', scheduled: '07:40 AM', actual: '07:39 AM', completed: true },
      { name: 'West Lake Marina Rd', scheduled: '07:52 AM', actual: '07:51 AM', completed: true },
      { name: 'Highland Park Loop', scheduled: '08:04 AM', actual: '08:03 AM', completed: true },
      { name: 'West Lake Middle Gate', scheduled: '08:15 AM', actual: '08:14 AM', completed: false }
    ]
  },
  {
    id: 'b4',
    routeCode: 'Route 212-West',
    busNumber: 'BUS #31',
    driver: 'Sarah Jenkins',
    driverPhone: '(555) 567-8901',
    school: 'West Lake Middle School',
    tier: 'Middle',
    zone: 'West Lake',
    scheduledBell: '08:30 AM',
    targetArrival: '08:15 AM',
    estimatedArrival: '08:31 AM',
    varianceMinutes: 16,
    status: 'critical_delay',
    transferType: 'Transfer Hub Connection',
    transferHub: 'West Transfer Terminal',
    connectingBus: 'BUS #09 (West Lake Shuttle)',
    transferBufferMinutes: -6,
    delayReason: 'Road Construction',
    studentsCount: 46,
    capacity: 54,
    currentLocation: 'Detour at Route 9 Bridge',
    speedMph: 6,
    stops: [
      { name: 'Timberline Village', scheduled: '07:35 AM', actual: '07:35 AM', completed: true },
      { name: 'Bridge Road Crossing', scheduled: '07:48 AM', actual: '08:02 AM', completed: true },
      { name: 'West Transfer Terminal', scheduled: '08:02 AM', actual: '08:20 AM', completed: false },
      { name: 'West Lake Middle Gate', scheduled: '08:15 AM', actual: '08:31 AM', completed: false }
    ]
  },
  {
    id: 'b5',
    routeCode: 'Route 305-Central',
    busNumber: 'BUS #44',
    driver: 'Carlos Ramirez',
    driverPhone: '(555) 678-9012',
    school: 'Central High School',
    tier: 'High School',
    zone: 'Central District',
    scheduledBell: '09:00 AM',
    targetArrival: '08:45 AM',
    estimatedArrival: '08:42 AM',
    varianceMinutes: -3,
    status: 'arrived',
    transferType: 'Transfer Hub Connection',
    transferHub: 'Central Transfer Exchange',
    connectingBus: 'BUS #18 & #55 Magnet Transfers',
    transferBufferMinutes: 11,
    studentsCount: 58,
    capacity: 60,
    currentLocation: 'Unloaded at South Entrance',
    speedMph: 0,
    stops: [
      { name: 'Maple & 18th Ave', scheduled: '08:05 AM', actual: '08:03 AM', completed: true },
      { name: 'Central Transfer Exchange Bay 4', scheduled: '08:18 AM', actual: '08:16 AM', completed: true },
      { name: 'Veterans Memorial Pkwy', scheduled: '08:32 AM', actual: '08:30 AM', completed: true },
      { name: 'Central High Campus Bus Bay', scheduled: '08:45 AM', actual: '08:42 AM', completed: true }
    ]
  },
  {
    id: 'b6',
    routeCode: 'Route 310-Central',
    busNumber: 'BUS #18',
    driver: 'Linda Gallagher',
    driverPhone: '(555) 789-0123',
    school: 'Central High School',
    tier: 'High School',
    zone: 'Central District',
    scheduledBell: '09:00 AM',
    targetArrival: '08:45 AM',
    estimatedArrival: '08:49 AM',
    varianceMinutes: 4,
    status: 'slight_delay',
    delayReason: 'Student Boarding Delay',
    studentsCount: 55,
    capacity: 60,
    currentLocation: 'Elmwood Turnaround',
    speedMph: 24,
    stops: [
      { name: 'Valley View Apartments', scheduled: '08:00 AM', actual: '08:04 AM', completed: true },
      { name: 'Heritage Square', scheduled: '08:15 AM', actual: '08:21 AM', completed: true },
      { name: 'Elmwood Crossing', scheduled: '08:30 AM', actual: '08:35 AM', completed: true },
      { name: 'Central High Campus Bus Bay', scheduled: '08:45 AM', actual: '08:49 AM', completed: false }
    ]
  },
  {
    id: 'b7',
    routeCode: 'Route 401-Oak',
    busNumber: 'BUS #05',
    driver: 'James Thornton',
    driverPhone: '(555) 890-1234',
    school: 'Oakridge STEM Academy',
    tier: 'High School',
    zone: 'Oakridge STEM',
    scheduledBell: '08:45 AM',
    targetArrival: '08:30 AM',
    estimatedArrival: '08:28 AM',
    varianceMinutes: -2,
    status: 'on_time',
    studentsCount: 39,
    capacity: 48,
    currentLocation: 'Innovation Way',
    speedMph: 31,
    stops: [
      { name: 'Sunburst Estates', scheduled: '07:50 AM', actual: '07:49 AM', completed: true },
      { name: 'Technology Corridor Blvd', scheduled: '08:05 AM', actual: '08:03 AM', completed: true },
      { name: 'North Creek Crossing', scheduled: '08:18 AM', actual: '08:16 AM', completed: true },
      { name: 'Oakridge STEM Main Plaza', scheduled: '08:30 AM', actual: '08:28 AM', completed: false }
    ]
  },
  {
    id: 'b8',
    routeCode: 'Route 502-Pine',
    busNumber: 'BUS #50',
    driver: 'Aisha Mohamed',
    driverPhone: '(555) 901-2345',
    school: 'Pine Valley Middle School',
    tier: 'Middle',
    zone: 'Pine Valley',
    scheduledBell: '08:30 AM',
    targetArrival: '08:15 AM',
    estimatedArrival: '08:13 AM',
    varianceMinutes: -2,
    status: 'on_time',
    studentsCount: 47,
    capacity: 54,
    currentLocation: 'Pine Bluff Roundabout',
    speedMph: 27,
    stops: [
      { name: 'Eagle Point Loop', scheduled: '07:40 AM', actual: '07:38 AM', completed: true },
      { name: 'Fox Run Court', scheduled: '07:52 AM', actual: '07:50 AM', completed: true },
      { name: 'Pine Valley Library', scheduled: '08:04 AM', actual: '08:02 AM', completed: true },
      { name: 'Pine Valley Middle Bus Loop', scheduled: '08:15 AM', actual: '08:13 AM', completed: false }
    ]
  },
  {
    id: 'b9',
    routeCode: 'Route 506-Pine',
    busNumber: 'BUS #37',
    driver: 'Robert Chen',
    driverPhone: '(555) 012-3456',
    school: 'Pine Valley Middle School',
    tier: 'Middle',
    zone: 'Pine Valley',
    scheduledBell: '08:30 AM',
    targetArrival: '08:15 AM',
    estimatedArrival: '08:23 AM',
    varianceMinutes: 8,
    status: 'slight_delay',
    delayReason: 'Weather & Fog',
    studentsCount: 43,
    capacity: 54,
    currentLocation: 'Slow speeds on Scenic Ridge',
    speedMph: 14,
    stops: [
      { name: 'Summit Vista Heights', scheduled: '07:35 AM', actual: '07:38 AM', completed: true },
      { name: 'Misty Hollow Lane', scheduled: '07:49 AM', actual: '07:55 AM', completed: true },
      { name: 'Wildwood Church Stop', scheduled: '08:02 AM', actual: '08:10 AM', completed: false },
      { name: 'Pine Valley Middle Bus Loop', scheduled: '08:15 AM', actual: '08:23 AM', completed: false }
    ]
  },
  {
    id: 'b10',
    routeCode: 'Route 601-South',
    busNumber: 'BUS #12',
    driver: 'Patricia Morales',
    driverPhone: '(555) 123-4567',
    school: 'South Bay Community School',
    tier: 'Elementary',
    zone: 'South Bay',
    scheduledBell: '08:00 AM',
    targetArrival: '07:45 AM',
    estimatedArrival: '07:44 AM',
    varianceMinutes: -1,
    status: 'arrived',
    studentsCount: 45,
    capacity: 48,
    currentLocation: 'Unloaded - Clear',
    speedMph: 0,
    stops: [
      { name: 'Harbor Point Terraces', scheduled: '07:15 AM', actual: '07:14 AM', completed: true },
      { name: 'Bayside Rec Center', scheduled: '07:25 AM', actual: '07:24 AM', completed: true },
      { name: 'Seaview & 7th St', scheduled: '07:35 AM', actual: '07:35 AM', completed: true },
      { name: 'South Bay School Gate', scheduled: '07:45 AM', actual: '07:44 AM', completed: true }
    ]
  },
  {
    id: 'b11',
    routeCode: 'Route 608-South',
    busNumber: 'BUS #29',
    driver: 'Kenneth Bell',
    driverPhone: '(555) 234-5678',
    school: 'South Bay Community School',
    tier: 'Elementary',
    zone: 'South Bay',
    scheduledBell: '08:00 AM',
    targetArrival: '07:45 AM',
    estimatedArrival: '08:04 AM',
    varianceMinutes: 19,
    status: 'critical_delay',
    delayReason: 'Mechanical Inspection',
    studentsCount: 36,
    capacity: 48,
    currentLocation: 'Tire Pressure sensor warning verified',
    speedMph: 20,
    stops: [
      { name: 'Marina Boulevard', scheduled: '07:10 AM', actual: '07:25 AM', completed: true },
      { name: 'Ocean Mist Court', scheduled: '07:22 AM', actual: '07:39 AM', completed: true },
      { name: 'Coastal Village Stop', scheduled: '07:34 AM', actual: '07:52 AM', completed: false },
      { name: 'South Bay School Gate', scheduled: '07:45 AM', actual: '08:04 AM', completed: false }
    ]
  },
  {
    id: 'b12',
    routeCode: 'Route 109-North',
    busNumber: 'BUS #55',
    driver: 'Tanya Peterson',
    driverPhone: '(555) 345-6789',
    school: 'Lincoln Elementary',
    tier: 'Elementary',
    zone: 'North Hills',
    scheduledBell: '08:00 AM',
    targetArrival: '07:45 AM',
    estimatedArrival: '07:45 AM',
    varianceMinutes: 0,
    status: 'on_time',
    studentsCount: 40,
    capacity: 48,
    currentLocation: 'Turning onto School Road',
    speedMph: 15,
    stops: [
      { name: 'Northgate Ridge', scheduled: '07:15 AM', actual: '07:15 AM', completed: true },
      { name: 'Hampton Court', scheduled: '07:25 AM', actual: '07:25 AM', completed: true },
      { name: 'Valley Woods Park', scheduled: '07:35 AM', actual: '07:35 AM', completed: true },
      { name: 'Lincoln Elementary Drop-off', scheduled: '07:45 AM', actual: '07:45 AM', completed: false }
    ]
  }
];

// 15-minute slot punctuality data for dynamic SVG visualization
const TIME_DISTRIBUTION = [
  { slot: '07:00 - 07:15', onTime: 12, delayed: 1, rate: 92.3 },
  { slot: '07:15 - 07:30', onTime: 18, delayed: 2, rate: 90.0 },
  { slot: '07:30 - 07:45', onTime: 26, delayed: 4, rate: 86.7 },
  { slot: '07:45 - 08:00', onTime: 34, delayed: 5, rate: 87.2 },
  { slot: '08:00 - 08:15', onTime: 29, delayed: 2, rate: 93.5 },
  { slot: '08:15 - 08:30', onTime: 22, delayed: 1, rate: 95.7 },
  { slot: '08:30 - 08:45', onTime: 16, delayed: 2, rate: 88.9 },
  { slot: '08:45 - 09:00', onTime: 19, delayed: 1, rate: 95.0 }
];

// Delay root-causes
const DELAY_REASONS = [
  { name: 'Traffic Congestion', count: 9, percentage: 41, avgMinutes: 7.2, color: '#f59e0b' },
  { name: 'Road Construction', count: 5, percentage: 23, avgMinutes: 14.5, color: '#ef4444' },
  { name: 'Student Boarding Delay', count: 4, percentage: 18, avgMinutes: 4.8, color: '#6366f1' },
  { name: 'Weather & Fog', count: 3, percentage: 14, avgMinutes: 6.5, color: '#06b6d4' },
  { name: 'Mechanical Inspection', count: 1, percentage: 4, avgMinutes: 18.0, color: '#8b5cf6' }
];

// District weekly punctuality matrix
const CLUSTER_PERFORMANCE = [
  { zone: 'North Hills', mon: 96, tue: 94, wed: 91, thu: 95, fri: 93, avg: 93.8 },
  { zone: 'West Lake', mon: 91, tue: 88, wed: 84, thu: 89, fri: 87, avg: 87.8 },
  { zone: 'Central District', mon: 94, tue: 96, wed: 95, thu: 93, fri: 96, avg: 94.8 },
  { zone: 'Oakridge STEM', mon: 98, tue: 97, wed: 96, thu: 98, fri: 97, avg: 97.2 },
  { zone: 'Pine Valley', mon: 92, tue: 90, wed: 92, thu: 94, fri: 91, avg: 91.8 },
  { zone: 'South Bay', mon: 89, tue: 91, wed: 87, thu: 90, fri: 89, avg: 89.2 }
];

export default function App() {
  const [buses, setBuses] = useState<BusItem[]>(INITIAL_BUSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [shiftRun, setShiftRun] = useState<'am' | 'pm'>('am');
  const [selectedBusId, setSelectedBusId] = useState<string>(INITIAL_BUSES[1].id);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationTick, setSimulationTick] = useState<number>(0);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  
  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertTargetBus, setAlertTargetBus] = useState<BusItem | null>(null);
  const [alertSentNotice, setAlertSentNotice] = useState<string | null>(null);

  // Active selected bus details
  const activeBus = useMemo(() => {
    return buses.find((b) => b.id === selectedBusId) || buses[0];
  }, [buses, selectedBusId]);

  // Simulation effect - updates slight variance and speeds to illustrate dynamic live telemetry
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimulationTick((prev) => prev + 1);
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (bus.status === 'arrived') return bus;
          // minor speed fluctuations
          const speedVariance = Math.floor(Math.random() * 5) - 2;
          const newSpeed = Math.max(0, Math.min(45, bus.speedMph + speedVariance));
          return {
            ...bus,
            speedMph: newSpeed
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Calculations
  const stats = useMemo(() => {
    const total = buses.length;
    const onTimeOrEarly = buses.filter((b) => b.status === 'on_time' || b.status === 'arrived').length;
    const slightDelayed = buses.filter((b) => b.status === 'slight_delay').length;
    const criticalDelayed = buses.filter((b) => b.status === 'critical_delay').length;
    const onTimeRate = total > 0 ? ((onTimeOrEarly / total) * 100).toFixed(1) : '0';
    
    const totalVariance = buses.reduce((acc, curr) => acc + curr.varianceMinutes, 0);
    const avgVariance = total > 0 ? (totalVariance / total).toFixed(1) : '0';

    const totalStudents = buses.reduce((acc, curr) => acc + curr.studentsCount, 0);
    const capacityTotal = buses.reduce((acc, curr) => acc + curr.capacity, 0);

    return {
      total,
      onTimeOrEarly,
      slightDelayed,
      criticalDelayed,
      onTimeRate,
      avgVariance,
      totalStudents,
      capacityTotal
    };
  }, [buses]);

  // Filtered bus ledger
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchesSearch =
        searchQuery === '' ||
        b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.school.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'on_time' && (b.status === 'on_time' || b.status === 'arrived')) ||
        (selectedStatus === 'delayed' && (b.status === 'slight_delay' || b.status === 'critical_delay')) ||
        (selectedStatus === 'critical' && b.status === 'critical_delay');

      const matchesTier = selectedTier === 'all' || b.tier === selectedTier;
      const matchesZone = selectedZone === 'all' || b.zone === selectedZone;

      return matchesSearch && matchesStatus && matchesTier && matchesZone;
    });
  }, [buses, searchQuery, selectedStatus, selectedTier, selectedZone]);

  // Trigger simulated traffic incident
  const handleToggleTrafficIncident = () => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.routeCode.includes('Route 101-North')) {
          if (b.status === 'on_time') {
            return {
              ...b,
              status: 'critical_delay',
              varianceMinutes: 14,
              delayReason: 'Traffic Congestion',
              estimatedArrival: '07:59 AM',
              currentLocation: 'Gridlock at 4th & Cedar Junction',
              speedMph: 4
            };
          } else {
            return {
              ...b,
              status: 'on_time',
              varianceMinutes: -1,
              delayReason: undefined,
              estimatedArrival: '07:44 AM',
              currentLocation: 'Approaching Gate 2',
              speedMph: 22
            };
          }
        }
        return b;
      })
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Route ID',
      'Bus Number',
      'Driver',
      'School',
      'Tier',
      'Target Arrival',
      'Estimated Arrival',
      'Variance (Mins)',
      'Status',
      'Delay Reason',
      'Students Onboard'
    ];

    const rows = buses.map((b) => [
      b.routeCode,
      b.busNumber,
      b.driver,
      `"${b.school}"`,
      b.tier,
      b.targetArrival,
      b.estimatedArrival,
      b.varianceMinutes,
      b.status,
      b.delayReason || 'None',
      b.studentsCount
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `school_bus_punctuality_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast alert
  const handleOpenAlert = (bus: BusItem) => {
    setAlertTargetBus(bus);
    setShowAlertModal(true);
  };

  const handleSendBroadcast = () => {
    if (!alertTargetBus) return;
    setAlertSentNotice(`Priority delay broadcast issued to parents & school administrators for ${alertTargetBus.routeCode} (${alertTargetBus.busNumber}).`);
    setShowAlertModal(false);
    setTimeout(() => {
      setAlertSentNotice(null);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* TOP BAR CONTRACT: Exactly 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Bus className="w-5 h-5" />
            </div>
            <a href="/" className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              School Transit Punctuality Console
            </a>
          </div>

          {/* Zone 2: 4-5 single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#overview" className="text-slate-900 hover:text-slate-900 transition-colors whitespace-nowrap">
              Transfer Hubs & Fleet
            </a>
            <a href="#timeline-chart" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Punctuality Trends
            </a>
            <a href="#active-routes" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Transfer Routes
            </a>
            <a href="#delay-causes" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Delay Analysis
            </a>
            <a href="#cluster-matrix" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Zone Performance
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Punctuality CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Broadcast Toast Banner if activated */}
      {alertSentNotice && (
        <div className="bg-emerald-900 text-emerald-100 px-6 py-2.5 text-xs flex items-center justify-between transition-all">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{alertSentNotice}</span>
          </div>
        </div>
      )}

      {/* SUB-HEADER WORKSPACE TOOLBAR */}
      <section className="bg-slate-100 border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Breadcrumb & Shift Status */}
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-900">School Transit Transfer Operations & Central Dispatch</span>
            <span aria-hidden="true">·</span>
            <span>Academic Year 2026</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-800">
              Transfer Hub Window: 07:15 AM – 09:15 AM
            </span>
          </div>

          {/* Interactive Shift & Simulation Controls */}
          <div className="flex items-center gap-2">
            {/* Shift selector */}
            <div className="flex items-center p-0.5 bg-slate-200 rounded-md">
              <button
                onClick={() => setShiftRun('am')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  shiftRun === 'am' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AM Morning Inbound
              </button>
              <button
                onClick={() => setShiftRun('pm')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  shiftRun === 'pm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PM Afternoon Outbound
              </button>
            </div>

            {/* Simulation Play/Pause toggle */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? 'Pause live tracking simulation' : 'Resume live tracking simulation'}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md flex items-center gap-1 font-medium transition-colors"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3 h-3 text-amber-600" />
                  <span>Telemetry Live</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span>Resume Live</span>
                </>
              )}
            </button>

            {/* Simulated Event Injector */}
            <button
              onClick={handleToggleTrafficIncident}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-md font-medium transition-colors"
            >
              Toggle Incident on R-101
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        
        {/* SECTION 1: PRIMARY KPI METRICS BAR (Quantitative Rigor with Tabular Numerals) */}
        <section id="overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: On-Time Rate */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>On-Time Arrival Rate</span>
              <span className="font-mono tabular-nums text-slate-400">Target &ge; 92.0%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {stats.onTimeRate}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  Number(stats.onTimeRate) >= 90 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {Number(stats.onTimeRate) >= 90 ? '+2.4% vs last week' : '-1.8% vs last week'}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {stats.onTimeOrEarly} of {stats.total}
              </span>
              <span>routes meeting bell deadline</span>
            </div>
          </div>

          {/* Card 2: Average Arrival Deviation */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Average Schedule Variance</span>
              <span className="font-mono tabular-nums text-slate-400">Tolerance &plusmn;3 min</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {Number(stats.avgVariance) > 0 ? `+${stats.avgVariance}` : stats.avgVariance} min
              </span>
              <span className="text-xs text-slate-600">across district network</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span>Planned window before first bell:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">15 min buffer</span>
            </div>
          </div>

          {/* Card 3: Active Delays / Severity */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Active Route Delays</span>
              <span className="font-mono tabular-nums text-slate-400">48 Active Fleets</span>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
                  {stats.slightDelayed}
                </span>
                <span className="text-xs text-slate-600">Minor (&lt;10m)</span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-rose-700 font-mono tabular-nums">
                  {stats.criticalDelayed}
                </span>
                <span className="text-xs text-slate-600">Critical (&gt;10m)</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <span>Main driver:</span>{' '}
              <span className="font-medium text-slate-800">AM Peak Highway 9 Bottleneck</span>
            </div>
          </div>

          {/* Card 4: Bus Transfer Connection Success */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Transfer Connection Rate</span>
              <span className="font-mono tabular-nums text-slate-400">Target &ge; 96.0%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                97.6%
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                Transfers Secured
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                1,280 students
              </span>
              <span>across 3 Transfer Hubs</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: DYNAMIC DATA VISUALIZATION - HOURLY PUNCTUALITY & DELAY DISTRIBUTION */}
        <section id="timeline-chart" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: 15-Minute Interval Punctuality & Volume Curve */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Punctuality Rate by Morning Window
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    15-minute scheduled arrival intervals against campus entry bells
                  </p>
                </div>
                {/* Visual Legend */}
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-emerald-600 rounded-xs inline-block"></span>
                    <span>On-Time Arrival</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block"></span>
                    <span>Delayed Arrival</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-800 inline-block"></span>
                    <span>Punctuality Rate %</span>
                  </div>
                </div>
              </div>

              {/* Dynamic SVG Visualization */}
              <div className="relative w-full h-56 pt-2 select-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="165" x2="600" y2="165" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Volume Bars (Stacked) */}
                  {TIME_DISTRIBUTION.map((item, idx) => {
                    const barWidth = 32;
                    const x = 35 + idx * 70;
                    const maxCount = 42;
                    const onTimeHeight = (item.onTime / maxCount) * 110;
                    const delayedHeight = (item.delayed / maxCount) * 110;
                    const isHovered = hoveredSlot === idx;

                    return (
                      <g
                        key={item.slot}
                        className="cursor-pointer transition-opacity"
                        onMouseEnter={() => setHoveredSlot(idx)}
                        onMouseLeave={() => setHoveredSlot(null)}
                      >
                        {/* On time bar portion */}
                        <rect
                          x={x}
                          y={165 - onTimeHeight}
                          width={barWidth}
                          height={onTimeHeight}
                          fill={isHovered ? '#059669' : '#10b981'}
                          rx="2"
                        />
                        {/* Delayed bar portion */}
                        <rect
                          x={x}
                          y={165 - onTimeHeight - delayedHeight}
                          width={barWidth}
                          height={delayedHeight}
                          fill={isHovered ? '#d97706' : '#f59e0b'}
                          rx="2"
                        />
                      </g>
                    );
                  })}

                  {/* Punctuality Rate Trendline connecting points */}
                  <polyline
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={TIME_DISTRIBUTION.map((item, idx) => {
                      const x = 35 + idx * 70 + 16;
                      // map 80% - 100% to Y 140 to 20
                      const y = 140 - ((item.rate - 80) / 20) * 110;
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Trendline nodes */}
                  {TIME_DISTRIBUTION.map((item, idx) => {
                    const x = 35 + idx * 70 + 16;
                    const y = 140 - ((item.rate - 80) / 20) * 110;
                    const isHovered = hoveredSlot === idx;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={isHovered ? 5 : 3.5}
                        fill="#0f172a"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>

                {/* Hover Tooltip Box */}
                {hoveredSlot !== null && (
                  <div
                    className="absolute bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg pointer-events-none z-20"
                    style={{
                      left: `${hoveredSlot * 12.5 + 4}%`,
                      top: '10%'
                    }}
                  >
                    <div className="font-semibold text-slate-200">
                      {TIME_DISTRIBUTION[hoveredSlot].slot}
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 font-mono text-slate-300">
                      <div>
                        Rate:{' '}
                        <span className="font-semibold text-emerald-400">
                          {TIME_DISTRIBUTION[hoveredSlot].rate}%
                        </span>
                      </div>
                      <div>
                        On-Time: {TIME_DISTRIBUTION[hoveredSlot].onTime} buses
                      </div>
                      <div>
                        Delayed: {TIME_DISTRIBUTION[hoveredSlot].delayed} buses
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* X-axis labels */}
              <div className="grid grid-cols-8 gap-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono text-center">
                {TIME_DISTRIBUTION.map((d) => (
                  <span key={d.slot} className="truncate" title={d.slot}>
                    {d.slot.split(' - ')[0]}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Lowest reliability window observed at 07:30 - 07:45 AM due to commuter cross-traffic.</span>
              <span className="font-mono tabular-nums text-slate-700 font-medium">95.7% Peak Punctuality (08:15 AM)</span>
            </div>
          </div>

          {/* Side Module: Delay Root Cause Breakdown */}
          <div id="delay-causes" className="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-slate-900">
                  Delay Root Causes
                </h2>
                <span className="text-xs text-slate-400 font-mono tabular-nums">Past 7 Days</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Categorized incident logs logged by drivers and GPS telemetry
              </p>

              <div className="flex flex-col gap-3.5">
                {DELAY_REASONS.map((reason) => (
                  <div key={reason.name} className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span
                          className="w-2.5 h-2.5 rounded-xs"
                          style={{ backgroundColor: reason.color }}
                        ></span>
                        <span>{reason.name}</span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-600">
                        <span className="font-semibold text-slate-900">{reason.percentage}%</span>
                        <span className="text-slate-400 text-[11px] ml-1">
                          (avg +{reason.avgMinutes}m)
                        </span>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden">
                      <div
                        className="h-full rounded-xs transition-all duration-300"
                        style={{
                          width: `${reason.percentage}%`,
                          backgroundColor: reason.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 p-2.5 rounded text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Mitigation In Effect:</span>
              <p className="mt-0.5 text-slate-600">
                Route 212 & Route 104 detour paths updated to bypass construction on Highway 9 through October 24.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE FLEET PUNCTUALITY LEDGER & ROUTE INSPECTION */}
        <section id="active-routes" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main 2-Col: Filterable Bus Ledger Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
            
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative w-full max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bus, route, driver, school..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>

              {/* Status Segmented Filters */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-2.5 py-1 font-medium rounded transition-colors ${
                    selectedStatus === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({buses.length})
                </button>
                <button
                  onClick={() => setSelectedStatus('on_time')}
                  className={`px-2.5 py-1 font-medium rounded transition-colors ${
                    selectedStatus === 'on_time'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  On-Time ({stats.onTimeOrEarly})
                </button>
                <button
                  onClick={() => setSelectedStatus('delayed')}
                  className={`px-2.5 py-1 font-medium rounded transition-colors ${
                    selectedStatus === 'delayed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Delayed ({stats.slightDelayed + stats.criticalDelayed})
                </button>
              </div>

              {/* School Tier dropdown */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-md focus:outline-none focus:border-slate-400"
              >
                <option value="all">All Tiers</option>
                <option value="Elementary">Elementary (08:00 Bell)</option>
                <option value="Middle">Middle (08:30 Bell)</option>
                <option value="High School">High School (09:00 Bell)</option>
              </select>
            </div>

            {/* Table Element */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Route & Bus</th>
                    <th className="py-2.5 px-3">School Destination</th>
                    <th className="py-2.5 px-3 text-right">Target vs Est.</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3">Operational Status</th>
                    <th className="py-2.5 px-3 text-right">Students</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBuses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No bus routes match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBuses.map((bus) => {
                      const isSelected = bus.id === selectedBusId;
                      return (
                        <tr
                          key={bus.id}
                          onClick={() => setSelectedBusId(bus.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-50/50 hover:bg-amber-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Route & Bus */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{bus.routeCode}</div>
                            <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono">{bus.busNumber}</span>
                              <span aria-hidden="true">·</span>
                              <span>{bus.driver}</span>
                            </div>
                          </td>

                          {/* Destination & Transfer Connection */}
                          <td className="py-3 px-3">
                            <div className="text-slate-900 font-medium">{bus.school}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              <span>Bell: {bus.scheduledBell}</span>
                              <span className="mx-1">·</span>
                              {bus.transferType === 'Transfer Hub Connection' ? (
                                <span className="text-indigo-700 font-medium">
                                  Transfer Hub: {bus.transferHub}
                                </span>
                              ) : (
                                <span>Direct Route · {bus.zone}</span>
                              )}
                            </div>
                          </td>

                          {/* Target vs Estimated */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            <div className="text-slate-600">{bus.targetArrival}</div>
                            <div className="text-slate-900 font-semibold text-[11px]">
                              {bus.estimatedArrival}
                            </div>
                          </td>

                          {/* Variance */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            {bus.varianceMinutes === 0 ? (
                              <span className="text-emerald-700 font-medium">On Time (0m)</span>
                            ) : bus.varianceMinutes < 0 ? (
                              <span className="text-emerald-700 font-medium">
                                {bus.varianceMinutes}m (Early)
                              </span>
                            ) : bus.varianceMinutes <= 5 ? (
                              <span className="text-amber-700 font-medium">
                                +{bus.varianceMinutes}m
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold">
                                +{bus.varianceMinutes}m
                              </span>
                            )}
                          </td>

                          {/* Operational Status (Clean unboxed text) */}
                          <td className="py-3 px-3">
                            {bus.status === 'arrived' && (
                              <div className="text-emerald-800 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Arrived at Gate</span>
                              </div>
                            )}
                            {bus.status === 'on_time' && (
                              <div className="text-slate-800 font-medium">
                                Nominal Schedule
                              </div>
                            )}
                            {bus.status === 'slight_delay' && (
                              <div className="text-amber-800 font-medium">
                                Slight Delay · {bus.delayReason}
                              </div>
                            )}
                            {bus.status === 'critical_delay' && (
                              <div className="text-rose-800 font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Critical · {bus.delayReason}</span>
                              </div>
                            )}
                          </td>

                          {/* Students count */}
                          <td className="py-3 px-3 text-right font-mono tabular-nums">
                            <span className="font-medium text-slate-800">
                              {bus.studentsCount}
                            </span>
                            <span className="text-slate-400">/{bus.capacity}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {bus.status === 'critical_delay' || bus.status === 'slight_delay' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAlert(bus);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors inline-flex items-center gap-1"
                              >
                                <Bell className="w-3 h-3" />
                                <span>Alert</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBusId(bus.id);
                                }}
                                className="text-slate-400 hover:text-slate-800 p-1"
                                title="View route timeline"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-800">{filteredBuses.length}</span> of{' '}
                <span className="font-semibold text-slate-800">{buses.length}</span> fleet routes
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Telemetry refresh every 4s
              </div>
            </div>
          </div>

          {/* Right Col: Selected Route Detailed Transit Inspector */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Selected Route Inspector</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-700">
                    {activeBus.speedMph} mph
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {activeBus.routeCode}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-slate-700">{activeBus.busNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>Driver: {activeBus.driver}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{activeBus.driverPhone}</span>
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3 rounded-md mb-4 text-xs ${
                  activeBus.status === 'critical_delay'
                    ? 'bg-rose-50 text-rose-900 border border-rose-200'
                    : activeBus.status === 'slight_delay'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>
                    {activeBus.status === 'critical_delay'
                      ? 'Critical Variance Alert'
                      : activeBus.status === 'slight_delay'
                      ? 'Minor Delay Warning'
                      : 'Running on Schedule'}
                  </span>
                  <span className="font-mono font-bold">
                    {activeBus.varianceMinutes > 0
                      ? `+${activeBus.varianceMinutes} min late`
                      : `${activeBus.varianceMinutes} min variance`}
                  </span>
                </div>
                <div className="mt-1 text-slate-700">
                  Current location: <span className="font-medium">{activeBus.currentLocation}</span>
                </div>
                {activeBus.delayReason && (
                  <div className="mt-0.5 font-medium text-slate-800">
                    Delay Factor: {activeBus.delayReason}
                  </div>
                )}
                {activeBus.transferType === 'Transfer Hub Connection' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900">Transfer Hub:</span> {activeBus.transferHub} · Connecting to <span className="font-medium text-slate-900">{activeBus.connectingBus}</span>
                    <div className="mt-0.5 font-mono text-slate-600">
                      Transfer buffer: {activeBus.transferBufferMinutes && activeBus.transferBufferMinutes >= 0 ? `+${activeBus.transferBufferMinutes} min buffer (Transfer Secured)` : `${activeBus.transferBufferMinutes} min deficit (Transfer At Risk)`}
                    </div>
                  </div>
                )}
              </div>

              {/* Transit Stop-by-Stop Progress Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
                  Waypoint Milestone Timeline
                </h4>
                <div className="flex flex-col gap-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeBus.stops.map((stop, sIdx) => {
                    const isDestination = sIdx === activeBus.stops.length - 1;
                    return (
                      <div key={stop.name} className="flex items-start gap-3 relative z-10 text-xs">
                        {/* Milestone dot */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 font-mono text-[11px] font-bold ${
                            stop.completed
                              ? 'bg-emerald-600 border-white text-white'
                              : isDestination
                              ? 'bg-amber-500 border-white text-slate-950'
                              : 'bg-white border-slate-300 text-slate-600'
                          }`}
                        >
                          {stop.completed ? '✓' : sIdx + 1}
                        </div>

                        {/* Stop Info */}
                        <div className="flex-1 bg-slate-50 border border-slate-100 p-2.5 rounded">
                          <div className="flex items-baseline justify-between">
                            <span className="font-semibold text-slate-900">{stop.name}</span>
                            <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                              Sched {stop.scheduled}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>
                              {stop.completed ? 'Completed' : isDestination ? 'Final Drop-off' : 'Upcoming'}
                            </span>
                            <span className="font-mono tabular-nums font-semibold text-slate-800">
                              Actual/Est: {stop.actual}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action in inspector */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenAlert(activeBus)}
                className="w-full py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-slate-600" />
                <span>Issue Delay Notification to Parents</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4: CLUSTER MATRIX & BELL SCHEDULE RELIABILITY (District Overview) */}
        <section id="cluster-matrix" className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                School Cluster Punctuality Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5-Day weekday reliability score across the 6 district geographic zones
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs"></span> &ge;95% Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-xs"></span> 90-94% Nominal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs"></span> 85-89% Watch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span> &lt;85% Critical
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-left font-medium">Geographic Cluster</th>
                  <th className="py-2.5 px-3 text-center font-medium">Monday</th>
                  <th className="py-2.5 px-3 text-center font-medium">Tuesday</th>
                  <th className="py-2.5 px-3 text-center font-medium">Wednesday</th>
                  <th className="py-2.5 px-3 text-center font-medium">Thursday</th>
                  <th className="py-2.5 px-3 text-center font-medium">Friday (Today)</th>
                  <th className="py-2.5 px-4 text-right font-medium">5-Day Avg Rate</th>
                  <th className="py-2.5 px-4 text-right font-medium">Punctuality Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {CLUSTER_PERFORMANCE.map((cluster) => {
                  const getCellBg = (val: number) => {
                    if (val >= 95) return 'bg-emerald-50 text-emerald-800 font-semibold';
                    if (val >= 90) return 'bg-emerald-50/50 text-emerald-700';
                    if (val >= 85) return 'bg-amber-50 text-amber-800';
                    return 'bg-rose-50 text-rose-800 font-semibold';
                  };

                  const getGrade = (val: number) => {
                    if (val >= 95) return { grade: 'A+', color: 'text-emerald-700' };
                    if (val >= 92) return { grade: 'A', color: 'text-emerald-700' };
                    if (val >= 88) return { grade: 'B+', color: 'text-slate-800' };
                    if (val >= 85) return { grade: 'B', color: 'text-amber-700' };
                    return { grade: 'C', color: 'text-rose-700' };
                  };

                  const gradeInfo = getGrade(cluster.avg);

                  return (
                    <tr key={cluster.zone} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900 text-left">
                        {cluster.zone}
                      </td>
                      <td className={`py-3 px-3 text-center ${getCellBg(cluster.mon)}`}>
                        {cluster.mon}%
                      </td>
                      <td className={`py-3 px-3 text-center ${getCellBg(cluster.tue)}`}>
                        {cluster.tue}%
                      </td>
                      <td className={`py-3 px-3 text-center ${getCellBg(cluster.wed)}`}>
                        {cluster.wed}%
                      </td>
                      <td className={`py-3 px-3 text-center ${getCellBg(cluster.thu)}`}>
                        {cluster.thu}%
                      </td>
                      <td className={`py-3 px-3 text-center ${getCellBg(cluster.fri)}`}>
                        {cluster.fri}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {cluster.avg}%
                      </td>
                      <td className={`py-3 px-4 text-right font-sans font-bold ${gradeInfo.color}`}>
                        {gradeInfo.grade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* FOOTER: Quiet clean copyright & district transit metadata */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>School Transit Punctuality Console</span>
            <span aria-hidden="true">·</span>
            <span>School Bus Transfer Hubs & Punctuality Operations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>GPS Frequency: 4.0s</span>
            <span>·</span>
            <span>Telemetry Feed nominal</span>
          </div>
        </div>
      </footer>

      {/* MODAL: BROADCAST DELAY NOTIFICATION */}
      {showAlertModal && alertTargetBus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Broadcast Delay Notice
                </h3>
                <p className="text-xs text-slate-500">
                  Send live ETA update to registered parents & campus coordinators
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs mb-4 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Route:</span>
                <span className="font-semibold text-slate-900">{alertTargetBus.routeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">School:</span>
                <span className="font-semibold text-slate-900">{alertTargetBus.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Arrival:</span>
                <span className="font-mono font-semibold text-rose-700">
                  {alertTargetBus.estimatedArrival} (+{alertTargetBus.varianceMinutes} min)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="text-slate-800">{alertTargetBus.delayReason || 'Traffic delay'}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Parent SMS & App Preview:
              </label>
              <div className="p-2.5 bg-slate-100 rounded text-xs text-slate-700 font-mono leading-relaxed">
                "Transit Alert: {alertTargetBus.routeCode} ({alertTargetBus.busNumber}) to {alertTargetBus.school} is experiencing a +{alertTargetBus.varianceMinutes} minute delay due to {alertTargetBus.delayReason || 'road conditions'}. New estimated arrival is {alertTargetBus.estimatedArrival}."
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Send SMS & Push Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
