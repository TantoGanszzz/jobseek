export interface MatchInput {
  candidateSkills: string[] | null | undefined;
  candidateLocation: string | null | undefined;
  preferredWorkModes: string[] | null | undefined;
  preferredRoles: string[] | null | undefined;
  candidateEducation: string | null | undefined;
  jobSkills: string[] | null | undefined;
  jobLocation: string | null | undefined;
  jobWorkMode: string | null | undefined;
  jobTitle: string;
  jobEducation: string | null | undefined;
}

export interface MatchSnapshot {
  overall: number;
  skill: number;
  location: number | null;
  workMode: number | null;
  career: number | null;
  matchedSkills: string[];
  missingSkills: string[];
}

const normalise = (value: string) => value.trim().toLocaleLowerCase();

function tokens(value: string | null | undefined) {
  return new Set(
    (value ?? "")
      .toLocaleLowerCase()
      .replace(/\b(kota|kabupaten|kab|city|province|provinsi|indonesia)\b/g, " ")
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1),
  );
}

/** Deterministic score used for recommendations and snapshotted on application. */
export function calculateJobMatch(input: MatchInput): MatchSnapshot {
  const required = (input.jobSkills ?? []).map(normalise).filter(Boolean);
  const candidate = new Set((input.candidateSkills ?? []).map(normalise).filter(Boolean));
  const matchedSkills = required.filter((skill) => candidate.has(skill));
  const missingSkills = required.filter((skill) => !candidate.has(skill));
  const skill = required.length ? Math.round((matchedSkills.length / required.length) * 100) : 0;

  const candidateLocation = tokens(input.candidateLocation);
  const jobLocation = tokens(input.jobLocation);
  let location: number | null = null;
  if (candidateLocation.size && jobLocation.size) {
    const overlap = [...jobLocation].filter((token) => candidateLocation.has(token)).length;
    location = overlap === jobLocation.size ? 100 : overlap ? Math.round(60 + (40 * overlap) / jobLocation.size) : 0;
  }

  const preferences = new Set((input.preferredWorkModes ?? []).map(normalise).filter(Boolean));
  const workMode = preferences.size && input.jobWorkMode
    ? (preferences.has(normalise(input.jobWorkMode)) ? 100 : 30)
    : null;

  const rolePreferences = (input.preferredRoles ?? []).map(normalise).filter(Boolean);
  const title = normalise(input.jobTitle);
  const roleMatches = rolePreferences.some((role) => role === title || role.includes(title) || title.includes(role));
  const candidateEducation = input.candidateEducation ? normalise(input.candidateEducation) : "";
  const jobEducation = input.jobEducation ? normalise(input.jobEducation) : "";
  const educationMatches = Boolean(candidateEducation && jobEducation && (candidateEducation === jobEducation || candidateEducation.includes(jobEducation) || jobEducation.includes(candidateEducation)));
  const career = roleMatches || educationMatches ? (roleMatches && educationMatches ? 100 : 60) : null;

  const parts: Array<[number, number]> = [[skill, 50]];
  if (location !== null) parts.push([location, 25]);
  if (workMode !== null) parts.push([workMode, 15]);
  if (career !== null) parts.push([career, 10]);
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const overall = Math.round(parts.reduce((sum, [score, weight]) => sum + score * weight, 0) / totalWeight);

  return { overall, skill, location, workMode, career, matchedSkills, missingSkills };
}
