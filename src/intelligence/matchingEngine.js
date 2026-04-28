import { derivePriority } from './priorityLogic';
import {
  buildConfidenceScore,
  buildMissingSkills,
  buildWeightedBreakdown,
  computeSkillMatch,
  getScoreBand,
  normalizeDistance,
  weightScore,
} from './scoringUtils';

function buildRecommendation({ matchScore, skillScore, missingSkills, distanceKm, priority }) {
  if (priority === 'High' && matchScore >= 75) {
    return 'Dispatch immediately';
  }
  if (!missingSkills.length && distanceKm <= 10 && skillScore >= 70) {
    return 'Strong field fit';
  }
  if (missingSkills.length) {
    return `Needs backup for ${missingSkills.slice(0, 2).join(', ')}`;
  }
  return 'Review manually';
}

function buildNarrative({ volunteer, issue, missingSkills, skillScore, distanceScore, confidence }) {
  const reasons = [];

  if (skillScore >= 70) {
    reasons.push(`${volunteer.name} covers most required skills`);
  } else if (missingSkills.length) {
    reasons.push(`skill gaps remain in ${missingSkills.slice(0, 2).join(', ')}`);
  }

  if (distanceScore >= 70) {
    reasons.push(`can likely reach ${issue.locationName || issue.location?.label || 'the site'} quickly`);
  } else {
    reasons.push(`distance may slow response`);
  }

  if ((volunteer.reliability || 0) >= 90) {
    reasons.push(`has strong reliability history`);
  }

  const summary = reasons.join(', ');
  return confidence >= 75 ? summary : `${summary}. Recommendation confidence is still limited by incomplete fit data.`;
}

export function computeMatch(issue, volunteer) {
  const distanceKm = Number(volunteer.distanceKm ?? issue.distanceKm ?? 0);
  const reliability = Number(volunteer.reliability ?? 75);
  const urgency = Number(issue.urgency ?? 50);
  const skillScore = computeSkillMatch(issue.requiredSkills, volunteer.skills);
  const distanceScore = normalizeDistance(distanceKm);
  const missingSkills = buildMissingSkills(issue.requiredSkills, volunteer.skills);
  const weightedParts = buildWeightedBreakdown([
    { label: 'Skills', value: skillScore, weight: 0.35 },
    { label: 'Distance', value: distanceScore, weight: 0.25 },
    { label: 'Urgency', value: urgency, weight: 0.2 },
    { label: 'Reliability', value: reliability, weight: 0.2 },
  ]);
  const matchScore = weightScore(weightedParts);
  const priority = derivePriority(urgency);
  const confidence = buildConfidenceScore({
    requiredSkills: issue.requiredSkills,
    volunteerSkills: volunteer.skills,
    distanceKm,
    reliability,
  });

  return {
    issueId: issue.id,
    volunteerId: volunteer.id,
    matchScore,
    distanceKm,
    skillScore,
    priority,
    confidence,
    scoreBand: getScoreBand(matchScore),
    missingSkills,
    breakdown: weightedParts,
    recommendation: buildRecommendation({ matchScore, skillScore, missingSkills, distanceKm, priority }),
    explanation: buildNarrative({ volunteer, issue, missingSkills, skillScore, distanceScore, confidence }),
  };
}

export function rankVolunteersForIssue(issue, volunteers) {
  return volunteers
    .map((volunteer) => ({ volunteer, ...computeMatch(issue, volunteer) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}
