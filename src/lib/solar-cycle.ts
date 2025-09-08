import { addYears, getYear, getMonth, parseISO, format } from 'date-fns';

export interface SolarCycleData {
  cycleNumber: number;
  startYear: number;
  peakYear: number;
  endYear: number;
  maxSunspots: number;
  phase: 'minimum' | 'ascending' | 'maximum' | 'descending';
}

export interface SolarActivityData {
  date: Date;
  sunspotNumber: number;
  solarFluxIndex: number;
  geomagneticIndex: number;
  cosmicRayIntensity: number;
  cyclePhase: string;
  lifespanImpact: number;
  uvRadiationLevel: number;
}

// Historical solar cycle data (simplified - in production would come from NOAA)
const SOLAR_CYCLES: SolarCycleData[] = [
  { cycleNumber: 20, startYear: 1964, peakYear: 1968, endYear: 1976, maxSunspots: 156, phase: 'minimum' },
  { cycleNumber: 21, startYear: 1976, peakYear: 1979, endYear: 1986, maxSunspots: 232, phase: 'minimum' },
  { cycleNumber: 22, startYear: 1986, peakYear: 1989, endYear: 1996, maxSunspots: 212, phase: 'minimum' },
  { cycleNumber: 23, startYear: 1996, peakYear: 2000, endYear: 2008, maxSunspots: 180, phase: 'minimum' },
  { cycleNumber: 24, startYear: 2008, peakYear: 2012, endYear: 2019, maxSunspots: 146, phase: 'minimum' },
  { cycleNumber: 25, startYear: 2019, peakYear: 2024, endYear: 2030, maxSunspots: 137, phase: 'ascending' }
];

export const getCurrentSolarCycle = (): SolarCycleData => {
  const currentYear = getYear(new Date());
  return SOLAR_CYCLES.find(cycle => 
    currentYear >= cycle.startYear && currentYear <= cycle.endYear
  ) || SOLAR_CYCLES[SOLAR_CYCLES.length - 1];
};

export const getSolarCycleForDate = (date: Date): SolarCycleData => {
  const year = getYear(date);
  return SOLAR_CYCLES.find(cycle => 
    year >= cycle.startYear && year <= cycle.endYear
  ) || predictFutureSolarCycle(date);
};

const predictFutureSolarCycle = (date: Date): SolarCycleData => {
  const year = getYear(date);
  const lastCycle = SOLAR_CYCLES[SOLAR_CYCLES.length - 1];
  
  if (year > lastCycle.endYear) {
    const cyclesAhead = Math.ceil((year - lastCycle.endYear) / 11);
    const cycleNumber = lastCycle.cycleNumber + cyclesAhead;
    const startYear = lastCycle.endYear + ((cyclesAhead - 1) * 11);
    
    return {
      cycleNumber,
      startYear,
      peakYear: startYear + 4,
      endYear: startYear + 11,
      maxSunspots: 140, // Average prediction
      phase: 'minimum'
    };
  }
  
  return lastCycle;
};

export const calculateSunspotNumber = (date: Date): number => {
  const cycle = getSolarCycleForDate(date);
  const year = getYear(date);
  const month = getMonth(date);
  
  const yearInCycle = year - cycle.startYear + (month / 12);
  const cycleProgress = yearInCycle / (cycle.endYear - cycle.startYear);
  
  // Sinusoidal approximation of solar cycle
  const phaseRadians = cycleProgress * 2 * Math.PI;
  const baseActivity = Math.sin(phaseRadians);
  
  // Peak occurs at ~1/3 of the cycle
  const peakAdjustment = Math.exp(-Math.pow((cycleProgress - 0.36), 2) * 8);
  
  const sunspots = Math.max(0, 
    (baseActivity * 0.7 + peakAdjustment * 0.8) * cycle.maxSunspots + 
    (Math.random() - 0.5) * 20 // Natural variation
  );
  
  return Math.round(sunspots);
};

export const calculateSolarActivityData = (date: Date): SolarActivityData => {
  const sunspotNumber = calculateSunspotNumber(date);
  const cycle = getSolarCycleForDate(date);
  const year = getYear(date);
  
  const yearInCycle = year - cycle.startYear;
  const cycleProgress = yearInCycle / (cycle.endYear - cycle.startYear);
  
  let phase: string;
  if (cycleProgress < 0.2) phase = 'minimum';
  else if (cycleProgress < 0.5) phase = 'ascending';
  else if (cycleProgress < 0.7) phase = 'maximum';
  else phase = 'descending';
  
  // Calculate health impacts based on research - gradual impact based on solar activity
  // More realistic model: impact varies smoothly with sunspot number
  const normalizedSunspots = Math.max(0, Math.min(200, sunspotNumber)); // Cap at reasonable range
  const lifespanImpact = (() => {
    if (normalizedSunspots < 30) {
      // Solar minimum: slight positive impact from reduced UV
      return 0.5 - (normalizedSunspots / 30) * 0.8;
    } else if (normalizedSunspots < 120) {
      // Moderate activity: gradual negative impact
      return -0.3 - ((normalizedSunspots - 30) / 90) * 4.5;
    } else {
      // High activity: severe negative impact
      return -4.8 - ((normalizedSunspots - 120) / 80) * 1.8;
    }
  })();
  
  // Add monthly variation for more realistic data
  const monthVariation = (getMonth(date) - 6) * 0.1; // -0.5 to +0.5 variation
  const finalLifespanImpact = Math.round((lifespanImpact + monthVariation) * 10) / 10;
  
  return {
    date,
    sunspotNumber,
    solarFluxIndex: Math.max(70, sunspotNumber + 70 + Math.random() * 30),
    geomagneticIndex: Math.max(0, Math.min(9, sunspotNumber / 30 + Math.random() * 2)),
    cosmicRayIntensity: Math.max(0, 100 - (sunspotNumber / 2)), // Inverse relationship
    cyclePhase: phase,
    lifespanImpact: finalLifespanImpact,
    uvRadiationLevel: calculateUVFromSolarActivity(sunspotNumber)
  };
};

const calculateUVFromSolarActivity = (sunspotNumber: number): number => {
  // Higher solar activity = higher UV radiation
  const baseUV = 5;
  const solarMultiplier = 1 + (sunspotNumber / 200) * 0.3;
  return Math.min(11, baseUV * solarMultiplier);
};

export const getSolarRiskLevel = (sunspotNumber: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
  if (sunspotNumber < 50) return 'LOW';
  if (sunspotNumber < 100) return 'MEDIUM';
  return 'HIGH';
};

export const calculateMentalHealthRisk = (sunspotNumber: number): number => {
  // Research shows increased mental health issues during solar maximum
  const baseRisk = 1.0;
  const solarMaximumMultiplier = sunspotNumber > 90 ? 1.3 : 1.0;
  return baseRisk * solarMaximumMultiplier;
};

// Cache for API calls (in production would be more sophisticated)
const solarDataCache = new Map<string, SolarActivityData>();

export const fetchNOAASolarData = async (date?: Date): Promise<SolarActivityData> => {
  const dateKey = date ? format(date, 'yyyy-MM-dd') : 'current';
  
  if (solarDataCache.has(dateKey)) {
    return solarDataCache.get(dateKey)!;
  }
  
  try {
    // In production, would call actual NOAA API
    // For now, return simulated data
    const simulatedData = calculateSolarActivityData(date || new Date());
    
    solarDataCache.set(dateKey, simulatedData);
    return simulatedData;
  } catch (error) {
    console.warn('Failed to fetch NOAA solar data:', error);
    
    // Fallback to calculated data
    const fallbackData = calculateSolarActivityData(date || new Date());
    return fallbackData;
  }
};