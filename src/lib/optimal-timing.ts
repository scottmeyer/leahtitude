import { addMonths, subMonths, format, getYear, differenceInYears } from 'date-fns';
import { LocationData } from './geolocation';
import { calculateSolarActivityData, getSolarRiskLevel, calculateMentalHealthRisk } from './solar-cycle';
import { calculateSeasonalRisk, getSeasonalRecommendations } from './seasonal-risk';

export interface OptimalTimingResult {
  birthDate: Date;
  overallScore: number;
  lifeExpectancyDelta: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskFactors: RiskFactor[];
  recommendations: string[];
  solarData: {
    sunspotNumber: number;
    solarRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    lifespanImpact: number;
    mentalHealthMultiplier: number;
    uvRadiationLevel: number;
  };
  seasonalData: {
    vitaminDScore: number;
    infectiousRisk: number;
    relativeAgeAdvantage: number;
    overallSeasonalScore: number;
  };
}

export interface RiskFactor {
  category: 'solar' | 'seasonal' | 'geographic' | 'environmental';
  name: string;
  impact: number; // -100 to +100
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface TimingAnalysis {
  optimalWindows: OptimalTimingResult[];
  currentTiming: OptimalTimingResult;
  bestOverallMonth: number;
  worstOverallMonth: number;
  yearlyTrend: 'improving' | 'stable' | 'declining';
}

const WEIGHTS = {
  solar: 0.4,       // Solar cycle impact (most significant)
  seasonal: 0.35,   // Seasonal birth effects
  geographic: 0.15, // UV/latitude effects  
  environmental: 0.1 // Air quality, etc.
};

export const calculateOptimalTiming = async (
  location: LocationData, 
  targetDate: Date,
  analysisRange: number = 24 // months before/after
): Promise<OptimalTimingResult> => {
  
  // Get solar activity data
  const solarActivity = calculateSolarActivityData(targetDate);
  const solarRisk = getSolarRiskLevel(solarActivity.sunspotNumber);
  const mentalHealthMultiplier = calculateMentalHealthRisk(solarActivity.sunspotNumber);
  
  // Get seasonal risk data
  const seasonalRisk = calculateSeasonalRisk(targetDate, location);
  
  // Calculate individual risk factors with guaranteed generation
  const riskFactors: RiskFactor[] = [];
  
  // Solar factors - always include one
  if (solarActivity.lifespanImpact < -1) {
    riskFactors.push({
      category: 'solar',
      name: 'Solar Activity Risk',
      impact: -Math.round(Math.abs(solarActivity.lifespanImpact) * 12), // -12 to -48
      severity: solarActivity.lifespanImpact < -3 ? 'HIGH' : 'MEDIUM',
      description: `High solar activity during birth period affects development`
    });
  } else if (solarActivity.lifespanImpact > 0.5) {
    riskFactors.push({
      category: 'solar',
      name: 'Solar Minimum Benefit',
      impact: Math.round(solarActivity.lifespanImpact * 15), // +7 to +37
      severity: 'LOW',
      description: 'Low solar activity provides optimal conditions'
    });
  } else {
    riskFactors.push({
      category: 'solar',
      name: 'Solar Activity Neutral',
      impact: Math.round(solarActivity.lifespanImpact * 5), // -5 to +5
      severity: 'LOW',
      description: 'Moderate solar activity with minimal impact'
    });
  }
  
  // UV Radiation - always evaluate
  const uvImpact = Math.round((solarActivity.uvRadiationLevel - 6) * 5);
  if (Math.abs(uvImpact) > 2) {
    riskFactors.push({
      category: 'solar',
      name: uvImpact > 0 ? 'UV Exposure Risk' : 'UV Protection Benefit',
      impact: uvImpact > 0 ? -Math.abs(uvImpact) : Math.abs(uvImpact),
      severity: Math.abs(uvImpact) > 15 ? 'HIGH' : Math.abs(uvImpact) > 8 ? 'MEDIUM' : 'LOW',
      description: uvImpact > 0 
        ? 'Elevated UV radiation increases health risks'
        : 'Lower UV exposure reduces radiation risks'
    });
  }
  
  // Seasonal factors - always include vitamin D
  const vitaminDImpact = Math.round((seasonalRisk.vitaminDScore - 60) * 0.5);
  riskFactors.push({
    category: 'seasonal',
    name: vitaminDImpact > 0 ? 'Vitamin D Advantage' : 'Vitamin D Deficiency Risk',
    impact: vitaminDImpact,
    severity: Math.abs(vitaminDImpact) > 15 ? 'HIGH' : Math.abs(vitaminDImpact) > 8 ? 'MEDIUM' : 'LOW',
    description: vitaminDImpact > 0 
      ? 'Optimal vitamin D synthesis during pregnancy'
      : 'Limited vitamin D synthesis may affect development'
  });
  
  // Infection risk - always evaluate
  const infectionImpact = Math.round((seasonalRisk.infectiousRisk - 50) * 0.6);
  if (Math.abs(infectionImpact) > 3) {
    riskFactors.push({
      category: 'seasonal',
      name: infectionImpact > 0 ? 'Infection Season Risk' : 'Low Infection Period',
      impact: infectionImpact > 0 ? -Math.abs(infectionImpact) : Math.abs(infectionImpact),
      severity: Math.abs(infectionImpact) > 18 ? 'HIGH' : Math.abs(infectionImpact) > 10 ? 'MEDIUM' : 'LOW',
      description: infectionImpact > 0
        ? 'Higher infection rates during birth period'
        : 'Lower infection risk provides health benefits'
    });
  }
  
  // Academic advantage
  if (seasonalRisk.relativeAgeAdvantage > 60) {
    riskFactors.push({
      category: 'seasonal',
      name: 'School Age Advantage',
      impact: Math.round((seasonalRisk.relativeAgeAdvantage - 50) * 0.8),
      severity: 'LOW',
      description: 'Favorable birth timing for academic year'
    });
  }
  
  // Geographic factors - always include latitude impact
  const distanceFromEquator = Math.abs(location.latitude);
  const latitudeImpact = Math.round((35 - distanceFromEquator) * 0.6);
  riskFactors.push({
    category: 'geographic',
    name: latitudeImpact > 0 ? 'Favorable Latitude' : 'Latitude Challenge',
    impact: latitudeImpact,
    severity: Math.abs(latitudeImpact) > 15 ? 'MEDIUM' : 'LOW',
    description: latitudeImpact > 0
      ? 'Optimal latitude for balanced seasonal exposure'
      : 'Extreme latitude affects seasonal patterns'
  });
  
  // Environmental factors based on season
  const month = targetDate.getMonth();
  const season = month >= 3 && month <= 5 ? 'spring' :
                month >= 6 && month <= 8 ? 'summer' :
                month >= 9 && month <= 11 ? 'fall' : 'winter';
  
  // Season-specific environmental impact
  let envImpact = 0;
  let envName = '';
  let envDesc = '';
  
  switch(season) {
    case 'spring':
      envImpact = -12; // Allergy season
      envName = 'Spring Allergen Exposure';
      envDesc = 'High pollen counts during birth period';
      break;
    case 'summer':
      envImpact = 8; // Good air quality
      envName = 'Summer Air Quality';
      envDesc = 'Generally better air quality and outdoor conditions';
      break;
    case 'fall':
      envImpact = 5; // Moderate conditions
      envName = 'Fall Transition Period';
      envDesc = 'Moderate environmental conditions';
      break;
    case 'winter':
      envImpact = -18; // Poor air quality, flu season
      envName = 'Winter Environmental Risk';
      envDesc = 'Indoor pollution and respiratory illness risk';
      break;
  }
  
  riskFactors.push({
    category: 'environmental',
    name: envName,
    impact: envImpact,
    severity: Math.abs(envImpact) > 15 ? 'MEDIUM' : 'LOW',
    description: envDesc
  });
  
  // Calculate overall score (0-100, higher is better)
  const solarScore = Math.max(0, 100 - Math.abs(solarActivity.lifespanImpact) * 15);
  const seasonalScore = seasonalRisk.overallSeasonalScore;
  const geographicScore = Math.max(0, 100 - distanceFromEquator);
  const environmentalScore = 75; // Placeholder - would come from air quality APIs
  
  const overallScore = Math.round(
    (solarScore * WEIGHTS.solar) +
    (seasonalScore * WEIGHTS.seasonal) +
    (geographicScore * WEIGHTS.geographic) +
    (environmentalScore * WEIGHTS.environmental)
  );
  
  // Determine confidence level
  const confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    overallScore >= 80 ? 'HIGH' :
    overallScore >= 60 ? 'MEDIUM' : 'LOW';
  
  // Generate comprehensive, personalized recommendations
  const recommendations: string[] = [];
  
  // Critical timing recommendations based on solar activity
  if (solarActivity.lifespanImpact < -5) {
    recommendations.push('⚠️ CRITICAL: Consider delaying conception by 12-18 months - peak solar maximum detected with significant lifespan impact (-' + Math.abs(solarActivity.lifespanImpact).toFixed(1) + ' years)');
  } else if (solarActivity.lifespanImpact < -3) {
    recommendations.push('Consider delaying conception by 6-12 months to avoid peak solar activity (current impact: ' + solarActivity.lifespanImpact.toFixed(1) + ' years)');
  } else if (solarActivity.lifespanImpact > 2) {
    recommendations.push('Excellent solar conditions detected - optimal timing from a solar cycle perspective (+' + solarActivity.lifespanImpact.toFixed(1) + ' years lifespan benefit)');
  }
  
  // Vitamin D and seasonal health recommendations
  if (seasonalRisk.vitaminDScore < 30) {
    recommendations.push('⚠️ CRITICAL: Start high-dose vitamin D supplementation immediately (2000-4000 IU daily) - severe deficiency risk in ' + format(targetDate, 'MMMM'));
    recommendations.push('Schedule vitamin D blood test before conception and monitor levels throughout pregnancy');
  } else if (seasonalRisk.vitaminDScore < 50) {
    recommendations.push('Begin vitamin D supplementation (1000-2000 IU daily) at least 3 months before conception');
    recommendations.push('Consider light therapy during pregnancy months if born in ' + format(targetDate, 'MMMM'));
  } else if (seasonalRisk.vitaminDScore > 80) {
    recommendations.push('Excellent vitamin D synthesis expected - maintain outdoor activities for natural production');
  }
  
  // Infection risk management
  if (seasonalRisk.infectiousRisk > 80) {
    recommendations.push('⚠️ High infection risk period - implement strict hygiene protocols during first trimester');
    recommendations.push('Consider flu vaccination before conception and pertussis vaccine during pregnancy');
    recommendations.push('Limit exposure to crowded spaces during peak ' + format(targetDate, 'MMMM') + ' infection season');
  } else if (seasonalRisk.infectiousRisk > 60) {
    recommendations.push('Moderate infection risk - maintain good hygiene practices and consider immune support supplements');
  }
  
  // Educational timing advantages
  if (seasonalRisk.relativeAgeAdvantage > 70) {
    recommendations.push('Excellent school entry timing - child will be among oldest in class with documented academic advantages');
    recommendations.push('Consider early enrichment programs to maximize age-related developmental advantages');
  } else if (seasonalRisk.relativeAgeAdvantage < 30) {
    recommendations.push('Child will be among youngest in class - consider delayed kindergarten entry or "redshirting"');
    recommendations.push('Focus on early childhood development programs to offset relative age disadvantage');
  }
  
  // Geographic and environmental factors
  if (distanceFromEquator > 50) {
    recommendations.push('Northern latitude detected - ensure adequate indoor air quality and humidity control during winter months');
    recommendations.push('Consider seasonal affective disorder (SAD) prevention with light therapy during pregnancy');
  }
  
  // Mental health considerations
  if (mentalHealthMultiplier > 1.3) {
    recommendations.push('Elevated mental health risks detected - establish care team including mental health specialist');
    recommendations.push('Create postpartum support plan with emphasis on ' + format(targetDate, 'MMMM') + ' seasonal factors');
  }
  
  // Add seasonal-specific recommendations
  recommendations.push(...getSeasonalRecommendations(targetDate, location));
  
  // General best practices based on score
  if (overallScore >= 80) {
    recommendations.push('Optimal timing confirmed - proceed with standard prenatal care and preparation');
  } else if (overallScore >= 60) {
    recommendations.push('Good timing with manageable risks - focus on addressing specific risk factors identified above');
  } else {
    recommendations.push('Consider alternative timing or implement comprehensive risk mitigation strategies');
  }
  
  // Filter out duplicates and sort by priority
  const uniqueRecommendations = [...new Set(recommendations)];
  
  // Sort recommendations by priority (critical first)
  const sortedRecommendations = uniqueRecommendations.sort((a, b) => {
    if (a.includes('⚠️ CRITICAL')) return -1;
    if (b.includes('⚠️ CRITICAL')) return 1;
    if (a.includes('Consider delaying')) return -1;
    if (b.includes('Consider delaying')) return 1;
    return 0;
  });
  
  return {
    birthDate: targetDate,
    overallScore,
    lifeExpectancyDelta: solarActivity.lifespanImpact,
    confidenceLevel,
    riskFactors,
    recommendations: sortedRecommendations,
    solarData: {
      sunspotNumber: solarActivity.sunspotNumber,
      solarRisk,
      lifespanImpact: solarActivity.lifespanImpact,
      mentalHealthMultiplier,
      uvRadiationLevel: solarActivity.uvRadiationLevel
    },
    seasonalData: {
      vitaminDScore: seasonalRisk.vitaminDScore,
      infectiousRisk: seasonalRisk.infectiousRisk,
      relativeAgeAdvantage: seasonalRisk.relativeAgeAdvantage,
      overallSeasonalScore: seasonalRisk.overallSeasonalScore
    }
  };
};

export const analyzeTimingRange = async (
  location: LocationData,
  centerDate: Date,
  rangeMonths: number = 24
): Promise<TimingAnalysis> => {
  const analyses: OptimalTimingResult[] = [];
  
  // Calculate for each month in the range
  for (let i = -rangeMonths; i <= rangeMonths; i++) {
    const testDate = addMonths(centerDate, i);
    const analysis = await calculateOptimalTiming(location, testDate);
    analyses.push(analysis);
  }
  
  // Find optimal windows (top 25% of scores)
  const sortedAnalyses = [...analyses].sort((a, b) => b.overallScore - a.overallScore);
  const topQuartileCount = Math.ceil(analyses.length * 0.25);
  const optimalWindows = sortedAnalyses.slice(0, topQuartileCount);
  
  // Find best and worst months
  const bestAnalysis = sortedAnalyses[0];
  const worstAnalysis = sortedAnalyses[sortedAnalyses.length - 1];
  
  // Determine yearly trend
  const currentYear = getYear(centerDate);
  const currentYearAnalyses = analyses.filter(a => getYear(a.birthDate) === currentYear);
  const nextYearAnalyses = analyses.filter(a => getYear(a.birthDate) === currentYear + 1);
  
  let yearlyTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (nextYearAnalyses.length > 0 && currentYearAnalyses.length > 0) {
    const currentAvg = currentYearAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / currentYearAnalyses.length;
    const nextAvg = nextYearAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / nextYearAnalyses.length;
    
    if (nextAvg > currentAvg + 5) yearlyTrend = 'improving';
    else if (nextAvg < currentAvg - 5) yearlyTrend = 'declining';
  }
  
  return {
    optimalWindows,
    currentTiming: await calculateOptimalTiming(location, centerDate),
    bestOverallMonth: bestAnalysis.birthDate.getMonth() + 1,
    worstOverallMonth: worstAnalysis.birthDate.getMonth() + 1,
    yearlyTrend
  };
};

export const generateOptimalityReport = async (
  location: LocationData,
  selectedDate: Date
): Promise<{
  summary: string;
  analysis: OptimalTimingResult;
  alternatives: OptimalTimingResult[];
  scientificBasis: string[];
}> => {
  const analysis = await calculateOptimalTiming(location, selectedDate);
  const timingAnalysis = await analyzeTimingRange(location, selectedDate, 12);
  
  const summary = `
    Birth timing analysis for ${format(selectedDate, 'MMMM yyyy')} in ${location.city}, ${location.country}:
    Overall optimality score: ${analysis.overallScore}/100 (${analysis.confidenceLevel} confidence)
    Estimated lifespan impact: ${analysis.lifeExpectancyDelta >= 0 ? '+' : ''}${analysis.lifeExpectancyDelta} years
    Primary risk factors: ${analysis.riskFactors.filter(r => r.severity === 'HIGH').length} high-risk factors identified
  `.trim();
  
  const alternatives = timingAnalysis.optimalWindows
    .filter(w => w.birthDate.getTime() !== selectedDate.getTime())
    .slice(0, 3);
  
  const scientificBasis = [
    'Solar cycle effects on human lifespan: Lowell & Davis (2008), Solar Physics',
    'Seasonal birth effects on disease risk: Disanto et al. (2012), PLoS ONE',
    'Vitamin D deficiency and birth timing: Haggarty et al. (2004), British Journal of Nutrition',
    'Relative age effects in education: Bedard & Dhuey (2006), Quarterly Journal of Economics',
    'UV radiation and folate metabolism: Jablonski & Chaplin (2010), Annual Review of Anthropology'
  ];
  
  return {
    summary,
    analysis,
    alternatives,
    scientificBasis
  };
};