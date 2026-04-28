export function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeDistance(distanceKm = 0) {
  return clampScore(100 - Number(distanceKm || 0) * 7);
}

export function computeSkillMatch(requiredSkills = [], volunteerSkills = []) {
  if (!requiredSkills.length) return 75;
  const matches = requiredSkills.filter((skill) => volunteerSkills.includes(skill)).length;
  return clampScore((matches / requiredSkills.length) * 100);
}

export function weightScore(parts) {
  return clampScore(parts.reduce((sum, part) => sum + part.value * part.weight, 0));
}

export function getScoreBand(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Moderate';
  return 'Weak';
}

export function buildMissingSkills(requiredSkills = [], volunteerSkills = []) {
  return requiredSkills.filter((skill) => !volunteerSkills.includes(skill));
}

export function buildConfidenceScore({ requiredSkills = [], volunteerSkills = [], distanceKm = 0, reliability = 0 }) {
  const dataCoverage = requiredSkills.length ? 100 : 70;
  const skillCoverage = computeSkillMatch(requiredSkills, volunteerSkills);
  const distanceConfidence = normalizeDistance(distanceKm);
  const reliabilityConfidence = clampScore(reliability);

  return weightScore([
    { value: dataCoverage, weight: 0.15 },
    { value: skillCoverage, weight: 0.35 },
    { value: distanceConfidence, weight: 0.2 },
    { value: reliabilityConfidence, weight: 0.3 },
  ]);
}

export function buildWeightedBreakdown(parts) {
  return parts.map((part) => ({
    ...part,
    contribution: clampScore(part.value * part.weight),
    band: getScoreBand(part.value),
  }));
}
