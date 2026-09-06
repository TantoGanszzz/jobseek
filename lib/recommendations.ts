// Deterministic, explainable career recommendation engine (MVP fallback).
// No external AI API is configured in this project, so we use a transparent,
// rule-based scorer. The interface is deliberately small so a real AI service
// can replace `generateCareerRecommendations` later without changing callers.

export interface CareerRecInput {
  skills: string[];
  interests: string[];
  preferredRoles: string[];
  educationLevel: string | null;
  major: string | null;
  experienceLevel: string | null;
  headline?: string | null;
  bio?: string | null;
  school?: string | null;
  location?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

export interface CareerRecOutput {
  careerName: string;
  matchScore: number;
  reason: string;
  requiredSkills: string[];
  recommendedSkills: string[];
  matchedSkills: string[];
}

interface CareerDef {
  name: string;
  skills: string[];
  interests: string[];
  roles: string[];
  majors: string[];
  requiredSkills: string[];
  recommendedSkills: string[];
}

export const CAREER_CATALOG: CareerDef[] = [
  {
    name: "Frontend Developer",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS"],
    interests: ["Software Development", "UI/UX Design", "Creative"],
    roles: ["Frontend Developer", "Full Stack Developer"],
    majors: ["Computer Science", "Informatics", "Software Engineering", "Information Technology"],
    requiredSkills: ["JavaScript", "HTML", "CSS"],
    recommendedSkills: ["TypeScript", "Testing", "Accessibility", "Next.js"],
  },
  {
    name: "Backend Developer",
    skills: ["Node.js", "PHP", "Laravel", "Python", "Java", "C++", "SQL", "MySQL", "PostgreSQL", "Database"],
    interests: ["Software Development", "Data"],
    roles: ["Backend Developer", "Full Stack Developer"],
    majors: ["Computer Science", "Informatics", "Software Engineering", "Information Technology"],
    requiredSkills: ["SQL", "Node.js or PHP or Python"],
    recommendedSkills: ["API Design", "Docker", "Cloud Computing", "Testing"],
  },
  {
    name: "Full Stack Developer",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PHP", "Laravel", "Python", "SQL", "MySQL", "PostgreSQL", "Git", "GitHub"],
    interests: ["Software Development", "Cloud", "Data"],
    roles: ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
    majors: ["Computer Science", "Informatics", "Software Engineering", "Information Technology"],
    requiredSkills: ["JavaScript", "SQL", "Git"],
    recommendedSkills: ["TypeScript", "Docker", "Cloud Computing", "Testing"],
  },
  {
    name: "Mobile Developer",
    skills: ["React", "JavaScript", "Java", "C++", "Git", "GitHub"],
    interests: ["Software Development"],
    roles: ["Mobile Developer", "Frontend Developer"],
    majors: ["Computer Science", "Informatics", "Software Engineering"],
    requiredSkills: ["React or Java"],
    recommendedSkills: ["Kotlin", "Swift", "Flutter", "App Testing"],
  },
  {
    name: "UI/UX Designer",
    skills: ["UI/UX Design", "Figma", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator"],
    interests: ["UI/UX Design", "Creative", "Product"],
    roles: ["UI/UX Designer", "Graphic Designer", "Product Manager"],
    majors: ["Visual Communication Design", "Product Design", "Design"],
    requiredSkills: ["Figma", "UI/UX Design"],
    recommendedSkills: ["Design Systems", "Prototyping", "User Research", "HTML/CSS"],
  },
  {
    name: "Graphic Designer",
    skills: ["Graphic Design", "Adobe Photoshop", "Adobe Illustrator", "Figma", "UI/UX Design"],
    interests: ["Creative", "Content", "UI/UX Design"],
    roles: ["Graphic Designer", "UI/UX Designer", "Marketing Specialist"],
    majors: ["Visual Communication Design", "Design", "Multimedia"],
    requiredSkills: ["Adobe Photoshop or Illustrator"],
    recommendedSkills: ["Figma", "Motion Design", "Typography"],
  },
  {
    name: "Data Analyst",
    skills: ["Data Analysis", "SQL", "MySQL", "PostgreSQL", "Microsoft Excel", "Python", "Google Analytics"],
    interests: ["Data", "Business", "Finance"],
    roles: ["Data Analyst", "Data Scientist"],
    majors: ["Statistics", "Mathematics", "Computer Science", "Data Science", "Business"],
    requiredSkills: ["SQL or Microsoft Excel", "Data Analysis"],
    recommendedSkills: ["Python", "Data Visualization", "Statistics", "Machine Learning basics"],
  },
  {
    name: "Data Scientist",
    skills: ["Python", "Data Analysis", "Machine Learning", "Artificial Intelligence", "SQL", "PostgreSQL"],
    interests: ["Data", "AI / Machine Learning"],
    roles: ["Data Scientist", "Data Analyst"],
    majors: ["Statistics", "Mathematics", "Computer Science", "Data Science"],
    requiredSkills: ["Python", "Statistics"],
    recommendedSkills: ["Machine Learning", "Deep Learning", "MLOps", "Data Visualization"],
  },
  {
    name: "DevOps Engineer",
    skills: ["Linux", "Cloud Computing", "Docker", "AWS", "Networking", "Git", "GitHub", "Git"],
    interests: ["Cloud", "Networking", "Software Development"],
    roles: ["DevOps Engineer", "Network Engineer"],
    majors: ["Computer Science", "Informatics", "Information Technology"],
    requiredSkills: ["Linux", "Cloud Computing or AWS"],
    recommendedSkills: ["Kubernetes", "CI/CD", "Terraform", "Monitoring"],
  },
  {
    name: "Network Engineer",
    skills: ["Networking", "Linux", "Cloud Computing", "AWS", "Cybersecurity"],
    interests: ["Networking", "Cloud", "Cybersecurity"],
    roles: ["Network Engineer", "DevOps Engineer"],
    majors: ["Computer Science", "Information Technology", "Network Engineering"],
    requiredSkills: ["Networking"],
    recommendedSkills: ["Cisco CCNA", "Routing & Switching", "Cloud Networking"],
  },
  {
    name: "Cybersecurity Analyst",
    skills: ["Cybersecurity", "Ethical Hacking", "Networking", "Linux"],
    interests: ["Cybersecurity", "Networking"],
    roles: ["Cybersecurity Analyst", "Network Engineer"],
    majors: ["Computer Science", "Cybersecurity", "Information Technology"],
    requiredSkills: ["Cybersecurity", "Networking basics"],
    recommendedSkills: ["Ethical Hacking", "SIEM", "Incident Response", "Security certifications"],
  },
  {
    name: "Product Manager",
    skills: ["Project Management", "Agile", "Communication", "Leadership", "Google Analytics", "Microsoft Excel"],
    interests: ["Product", "Business", "Management"],
    roles: ["Product Manager", "Project Manager"],
    majors: ["Business", "Management", "Marketing", "Engineering"],
    requiredSkills: ["Communication", "Project Management"],
    recommendedSkills: ["Product Strategy", "Data Analysis", "Agile/Scrum", "Roadmapping"],
  },
  {
    name: "Project Manager",
    skills: ["Project Management", "Agile", "Leadership", "Communication", "Microsoft Excel"],
    interests: ["Management", "Business", "Product"],
    roles: ["Project Manager", "Product Manager"],
    majors: ["Business", "Management", "Engineering"],
    requiredSkills: ["Project Management", "Communication"],
    recommendedSkills: ["Agile/Scrum", "Risk Management", "Budgeting"],
  },
  {
    name: "Marketing Specialist",
    skills: ["SEO", "Copywriting", "Content Writing", "Google Analytics", "Communication", "Microsoft Excel", "Graphic Design"],
    interests: ["Marketing", "Content", "Business"],
    roles: ["Marketing Specialist"],
    majors: ["Marketing", "Business", "Communications"],
    requiredSkills: ["SEO or Copywriting", "Communication"],
    recommendedSkills: ["Digital Marketing", "Social Media", "Data Analysis", "Content Strategy"],
  },
  {
    name: "Content Writer",
    skills: ["Copywriting", "Content Writing", "Communication", "SEO"],
    interests: ["Content", "Creative", "Marketing"],
    roles: ["Marketing Specialist", "Other"],
    majors: ["Communications", "Journalism", "Marketing", "Literature"],
    requiredSkills: ["Copywriting or Content Writing"],
    recommendedSkills: ["SEO Writing", "Content Strategy", "Social Media"],
  },
];

const normalizeSkill = (s: string) => s.trim().toLowerCase();

/**
 * Returns the top career matches for a user profile.
 * Scoring is fully deterministic and penalty-free per signal so scores can
 * be explained ("why it matches") instead of appearing random.
 */
export function generateCareerRecommendations(input: CareerRecInput): CareerRecOutput[] {
  const userSkills = input.skills?.map(normalizeSkill) || [];
  const userInterests = input.interests?.map(normalizeSkill) || [];
  const userRoles = input.preferredRoles?.map(normalizeSkill) || [];
  const major = input.major ? normalizeSkill(input.major) : "";
  const profileText = normalizeSkill(
    [input.headline, input.bio, input.school, input.location].filter(Boolean).join(" ")
  );
  const hasLinks =
    !!(input.portfolioUrl || input.githubUrl || input.linkedinUrl);

  const scored = CAREER_CATALOG.map((career) => {
    const careerInterests = career.interests.map(normalizeSkill);
    const careerRoles = career.roles.map(normalizeSkill);
    const careerMajors = career.majors.map(normalizeSkill);

    // Explicit skills count first; profile-text mentions only count when the
    // explicit list alone can't explain the match (avoids double counting).
    const explicitMatched = career.skills.filter((title) =>
      userSkills.includes(normalizeSkill(title))
    );
    const textMatched = career.skills.filter((title) => {
      const s = normalizeSkill(title);
      return !userSkills.includes(s) && profileText.length > 0 && profileText.includes(s);
    });

    const matchedSkills = [...explicitMatched, ...textMatched];
    const matchedInterests = careerInterests.filter((i) => userInterests.includes(i));
    const matchedRoles = careerRoles.filter((r) => userRoles.includes(r));
    const majorMatch = major
      ? careerMajors.some((m) => major.includes(m) || m.includes(major))
      : false;

    let score = 0;
    const reasons: string[] = [];

    if (explicitMatched.length > 0) {
      score += 40;
      reasons.push(
        `Your skills (${explicitMatched.join(", ")}) are a strong fit for this career.`
      );
    } else if (textMatched.length > 0) {
      score += 25;
      reasons.push(
        `Your profile mentions ${textMatched.join(", ")} — a core part of this role.`
      );
    }

    if (matchedRoles.length > 0) {
      score += 25;
      reasons.push(
        `You selected ${input.preferredRoles
          ?.filter((r) => careerRoles.includes(normalizeSkill(r)))
          .join(", ")} as a preferred role.`
      );
    }

    if (matchedInterests.length > 0) {
      score += 15;
      reasons.push(
        `This matches your interest in ${input.interests
          ?.filter((i) => careerInterests.includes(normalizeSkill(i)))
          .join(", ")}.`
      );
    }

    if (majorMatch) {
      score += 10;
      reasons.push(`Your ${input.major} education is related to this career path.`);
    }

    if (hasLinks && matchedSkills.length > 0) {
      score += 5;
      reasons.push("Your portfolio/GitHub/LinkedIn shows practical work in this area.");
    }

    if (input.experienceLevel) {
      const exp = normalizeSkill(input.experienceLevel);
      if (exp.includes("senior") || exp.includes("mid")) {
        score += 5;
        reasons.push(`Your ${input.experienceLevel} experience level fits this path.`);
      }
    }

    if (score > 0) {
      reasons.push(
        `Opening: ${career.name} roles appear across web, product, and technology teams.`
      );
    }

    const reasonText = reasons.length > 0
      ? reasons.slice(0, 4).join("\n")
      : `Based on your profile signals, ${career.name} is a potential direction to explore.`;

    return {
      careerName: career.name,
      matchScore: Math.min(score, 100),
      reason: reasonText,
      requiredSkills: career.requiredSkills,
      recommendedSkills: career.recommendedSkills,
      matchedSkills: matchedSkills.slice(0, 6),
    };
  });

  return scored
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

/**
 * Map an Edit-Profile shaped object (as loaded from auth user_metadata) onto
 * the recommendation engine. Uses only fields the user actually owns.
 */
export function generateCareerRecommendationsFromProfile(
  profile: {
    skills?: string[] | null;
    interests?: string[] | null;
    preferred_roles?: string[] | null;
    education?: string | null;
    education_level?: string | null;
    major?: string | null;
    experience_level?: string | null;
    headline?: string | null;
    bio?: string | null;
    university?: string | null;
    location?: string | null;
    portfolio_url?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
  } | null
): CareerRecOutput[] {
  if (!profile) return [];
  return generateCareerRecommendations({
    skills: profile.skills || [],
    interests: profile.interests || [],
    preferredRoles: profile.preferred_roles || [],
    educationLevel: profile.education ?? profile.education_level ?? null,
    major: profile.major || null,
    experienceLevel: profile.experience_level || null,
    headline: profile.headline,
    bio: profile.bio,
    school: profile.university,
    location: profile.location,
    portfolioUrl: profile.portfolio_url,
    githubUrl: profile.github_url,
    linkedinUrl: profile.linkedin_url,
  });
}