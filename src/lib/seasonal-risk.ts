import { getMonth, getDate, addMonths, format } from 'date-fns';
import { LocationData, isNorthernHemisphere, calculateUVIntensityByLatitude } from './geolocation';

export interface SeasonalRiskData {
  birthMonth: number;
  vitaminDScore: number;
  infectiousRisk: number;
  relativeAgeAdvantage: number;
  cardiovascularRisk: number;
  mentalHealthRisk: number;
  autoImmuneRisk: number;
  overallSeasonalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DiseaseRiskByMonth {
  cardiovascular: number;
  mentalHealth: number;
  autoimmune: number;
  respiratory: number;
  infectious: number;
}

// Research-based disease risk by birth month (Northern Hemisphere)
const NORTHERN_HEMISPHERE_DISEASE_RISKS: Record<number, DiseaseRiskByMonth> = {
  1: { cardiovascular: 1.06, mentalHealth: 1.08, autoimmune: 0.94, respiratory: 1.12, infectious: 1.15 }, // January
  2: { cardiovascular: 1.05, mentalHealth: 1.06, autoimmune: 0.96, respiratory: 1.10, infectious: 1.12 }, // February
  3: { cardiovascular: 1.02, mentalHealth: 1.02, autoimmune: 0.98, respiratory: 1.05, infectious: 1.08 }, // March
  4: { cardiovascular: 0.98, mentalHealth: 0.96, autoimmune: 1.02, respiratory: 0.98, infectious: 1.02 }, // April
  5: { cardiovascular: 0.95, mentalHealth: 0.92, autoimmune: 1.05, respiratory: 0.92, infectious: 0.95 }, // May
  6: { cardiovascular: 0.92, mentalHealth: 0.88, autoimmune: 1.08, respiratory: 0.88, infectious: 0.88 }, // June
  7: { cardiovascular: 0.90, mentalHealth: 0.85, autoimmune: 1.10, respiratory: 0.85, infectious: 0.82 }, // July
  8: { cardiovascular: 0.92, mentalHealth: 0.88, autoimmune: 1.08, respiratory: 0.88, infectious: 0.85 }, // August
  9: { cardiovascular: 0.95, mentalHealth: 0.92, autoimmune: 1.05, respiratory: 0.92, infectious: 0.90 }, // September
  10: { cardiovascular: 0.98, mentalHealth: 0.96, autoimmune: 1.02, respiratory: 0.98, infectious: 0.95 }, // October
  11: { cardiovascular: 1.02, mentalHealth: 1.02, autoimmune: 0.98, respiratory: 1.05, infectious: 1.02 }, // November
  12: { cardiovascular: 1.05, mentalHealth: 1.06, autoimmune: 0.96, respiratory: 1.10, infectious: 1.10 }  // December
};

export const calculateVitaminDSynthesis = (location: LocationData, birthDate: Date): number => {
  const birthMonth = getMonth(birthDate) + 1; // getMonth() returns 0-11, we need 1-12
  const { latitude } = location;
  
  // Calculate UV intensity for the location and birth month
  const uvIntensity = calculateUVIntensityByLatitude(latitude, birthMonth);
  
  // Vitamin D synthesis potential (higher UV = better synthesis)
  const synthesisCapacity = Math.max(0, Math.min(100, uvIntensity * 10));
  
  // Account for critical first 6 months of life
  const criticalMonths = [];
  for (let i = 0; i < 6; i++) {
    const month = ((birthMonth - 1 + i) % 12) + 1;
    const monthlyUV = calculateUVIntensityByLatitude(latitude, month);
    criticalMonths.push(monthlyUV);
  }
  
  const averageCriticalUV = criticalMonths.reduce((sum, uv) => sum + uv, 0) / 6;
  return Math.max(0, Math.min(100, averageCriticalUV * 10));
};

export const calculateInfectiousRisk = (birthDate: Date, location: LocationData): number => {
  const birthMonth = getMonth(birthDate) + 1;
  const isNorthern = isNorthernHemisphere(location.latitude);
  
  // Adjust for hemisphere
  const adjustedMonth = isNorthern ? birthMonth : ((birthMonth + 5) % 12) + 1;
  
  const riskData = NORTHERN_HEMISPHERE_DISEASE_RISKS[adjustedMonth];
  return riskData.infectious;
};

export const calculateRelativeAgeEffect = (birthDate: Date, country: string = 'US'): number => {
  const birthMonth = getMonth(birthDate) + 1;
  
  // School year cutoffs vary by country
  const schoolYearCutoffs: Record<string, number> = {
    'US': 9,        // September 1st
    'UK': 9,        // September 1st  
    'Canada': 9,    // September 1st
    'Australia': 1, // January 1st (Southern hemisphere)
    'Germany': 6,   // June/July
    'France': 9,    // September
    'Japan': 4,     // April
    'default': 9
  };
  
  const cutoffMonth = schoolYearCutoffs[country] || schoolYearCutoffs['default'];
  
  // Calculate relative age advantage (closer to cutoff = older in class)
  const monthsFromCutoff = (birthMonth - cutoffMonth + 12) % 12;
  
  // Score from 0-100, with births just after cutoff getting highest scores
  return Math.max(0, 100 - (monthsFromCutoff * 8.33)); // 8.33 points per month
};

export const calculateDiseaseRisks = (birthDate: Date, location: LocationData) => {
  const birthMonth = getMonth(birthDate) + 1;
  const isNorthern = isNorthernHemisphere(location.latitude);
  
  // Adjust for hemisphere (seasons are opposite)
  const adjustedMonth = isNorthern ? birthMonth : ((birthMonth + 5) % 12) + 1;
  
  const riskData = NORTHERN_HEMISPHERE_DISEASE_RISKS[adjustedMonth];
  
  return {
    cardiovascular: riskData.cardiovascular,
    mentalHealth: riskData.mentalHealth,
    autoimmune: riskData.autoimmune,
    respiratory: riskData.respiratory,
    infectious: riskData.infectious
  };
};

export const calculateSeasonalRisk = (birthDate: Date, location: LocationData): SeasonalRiskData => {
  const birthMonth = getMonth(birthDate) + 1;
  
  // Calculate individual risk factors
  const vitaminDScore = calculateVitaminDSynthesis(location, birthDate);
  const infectiousRisk = calculateInfectiousRisk(birthDate, location);
  const relativeAgeAdvantage = calculateRelativeAgeEffect(birthDate, location.country);
  const diseaseRisks = calculateDiseaseRisks(birthDate, location);
  
  // Normalize risks to 0-100 scale (lower is better)
  const normalizedInfectiousRisk = Math.max(0, (infectiousRisk - 0.8) * 500); // 0.8-1.2 -> 0-200, clamped to 0-100
  const normalizedCardiovascularRisk = Math.max(0, (diseaseRisks.cardiovascular - 0.9) * 500);
  const normalizedMentalHealthRisk = Math.max(0, (diseaseRisks.mentalHealth - 0.85) * 400);
  const normalizedAutoImmuneRisk = Math.max(0, Math.abs(diseaseRisks.autoimmune - 1.0) * 1000); // Deviation from 1.0
  
  // Calculate overall seasonal score (0-100, higher is better)
  const overallSeasonalScore = Math.round(
    (vitaminDScore * 0.3) + 
    ((100 - Math.min(100, normalizedInfectiousRisk)) * 0.25) +
    (relativeAgeAdvantage * 0.15) +
    ((100 - Math.min(100, normalizedCardiovascularRisk)) * 0.15) +
    ((100 - Math.min(100, normalizedMentalHealthRisk)) * 0.10) +
    ((100 - Math.min(100, normalizedAutoImmuneRisk)) * 0.05)
  );
  
  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    overallSeasonalScore >= 70 ? 'LOW' :
    overallSeasonalScore >= 50 ? 'MEDIUM' : 'HIGH';
  
  return {
    birthMonth,
    vitaminDScore: Math.round(vitaminDScore),
    infectiousRisk: Math.round(normalizedInfectiousRisk),
    relativeAgeAdvantage: Math.round(relativeAgeAdvantage),
    cardiovascularRisk: Math.round(normalizedCardiovascularRisk),
    mentalHealthRisk: Math.round(normalizedMentalHealthRisk),
    autoImmuneRisk: Math.round(normalizedAutoImmuneRisk),
    overallSeasonalScore,
    riskLevel
  };
};

export const getOptimalBirthMonths = (location: LocationData): number[] => {
  const monthScores: { month: number; score: number }[] = [];
  
  // Calculate scores for all 12 months
  for (let month = 1; month <= 12; month++) {
    const testDate = new Date(2024, month - 1, 15); // Mid-month
    const seasonalRisk = calculateSeasonalRisk(testDate, location);
    monthScores.push({ month, score: seasonalRisk.overallSeasonalScore });
  }
  
  // Sort by score (highest first)
  monthScores.sort((a, b) => b.score - a.score);
  
  // Return top 3 months
  return monthScores.slice(0, 3).map(item => item.month);
};

export const getSeasonalRecommendations = (birthDate: Date, location: LocationData): string[] => {
  const seasonalRisk = calculateSeasonalRisk(birthDate, location);
  const recommendations: string[] = [];
  
  if (seasonalRisk.vitaminDScore < 50) {
    recommendations.push("Consider vitamin D supplementation during pregnancy and early infancy");
  }
  
  if (seasonalRisk.infectiousRisk > 70) {
    recommendations.push("Take extra precautions against infections during the first 6 months");
  }
  
  if (seasonalRisk.relativeAgeAdvantage < 30) {
    recommendations.push("Child may benefit from delayed school entry or summer programs");
  }
  
  if (seasonalRisk.cardiovascularRisk > 60) {
    recommendations.push("Monitor cardiovascular health markers throughout life");
  }
  
  if (seasonalRisk.mentalHealthRisk > 60) {
    recommendations.push("Be aware of increased mental health risks and ensure good support systems");
  }
  
  return recommendations;
};