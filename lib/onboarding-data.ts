// Client-safe onboarding constants & types. Do NOT import server-only modules here.

export const EDUCATION_LEVELS = [
  "High School",
  "Vocational School",
  "Diploma",
  "Bachelor",
  "Master",
  "Other",
] as const;

export const EDUCATION_STATUSES = ["Currently Studying", "Graduated"] as const;

export const EXPERIENCE_LEVELS = [
  "No Experience",
  "Student",
  "Entry Level",
  "Junior",
  "Mid Level",
  "Senior",
] as const;

export const SKILL_CATEGORIES = [
  "Programming",
  "Design",
  "Marketing",
  "Business",
  "Data",
  "Networking",
  "Cloud",
  "Cybersecurity",
  "Communication",
  "Management",
  "Other",
] as const;

export const SKILL_OPTIONS = [
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "PHP", "Laravel", "Python", "Java", "C++", "SQL",
  "UI/UX Design", "Figma", "Graphic Design", "Adobe Photoshop", "Adobe Illustrator",
  "Networking", "Linux", "Cloud Computing", "AWS", "Docker",
  "Cybersecurity", "Ethical Hacking",
  "Database", "MySQL", "PostgreSQL",
  "Git", "GitHub", "Project Management", "Agile", "Communication", "Leadership",
  "Microsoft Excel", "Google Analytics", "SEO", "Copywriting", "Content Writing",
  "Data Analysis", "Machine Learning", "Artificial Intelligence",
] as const;

export const INTEREST_OPTIONS = [
  "Software Development", "UI/UX Design", "Data", "Networking", "Cybersecurity",
  "Cloud", "AI / Machine Learning", "Marketing", "Business", "Finance",
  "Management", "Content", "Creative", "Product", "Other",
] as const;

export const PREFERRED_JOB_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "UI/UX Designer", "Graphic Designer", "Data Analyst",
  "Data Scientist", "DevOps Engineer", "Network Engineer",
  "Cybersecurity Analyst", "Product Manager", "Project Manager",
  "Marketing Specialist", "Other",
] as const;

export const WORK_TYPES = [
  "Full Time", "Part Time", "Internship", "Freelance", "Contract",
] as const;

export const WORK_LOCATIONS = ["Remote", "On-site", "Hybrid"] as const;

export const COMPANY_SIZES = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+",
] as const;

export const COMPANY_TYPES = [
  "Startup", "Small Business", "Medium Business", "Enterprise",
  "Agency", "Nonprofit", "Government", "Other",
] as const;

export const INDUSTRIES = [
  "Technology", "Finance", "Education", "Healthcare", "Retail",
  "Manufacturing", "Hospitality", "Creative", "Marketing",
  "Consulting", "Other",
] as const;

export const HRD_POSITIONS = [
  "HR Manager", "Recruiter", "Talent Acquisition", "Hiring Manager",
] as const;

export const HRD_CANDIDATE_ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "UI/UX Designer", "Graphic Designer", "Data Analyst", "Data Scientist",
  "Network Engineer", "Cybersecurity", "DevOps", "Marketing", "Finance",
  "HR", "Sales", "Other",
] as const;

export const MIN_SKILLS = 3;
export const MAX_SKILLS = 20;
export const MIN_INTERESTS = 1;
export const MAX_INTERESTS = 10;
export const MIN_ROLES = 1;