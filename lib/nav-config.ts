import type { NavGroup } from "@/components/role-dashboard-shell";

export const userNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/dashboard/find-jobs", label: "Find Jobs", icon: "search" },
      { href: "/dashboard/applications", label: "Applications", icon: "applications" },
      { href: "/dashboard/saved-jobs", label: "Saved Jobs", icon: "bookmark" },
    ],
  },
  {
    label: "Career",
    items: [
      { href: "/dashboard/profile", label: "Profile", icon: "profile" },
      { href: "/dashboard/career", label: "Career Recommendations", icon: "career" },
      { href: "/dashboard/portfolio", label: "Portfolio", icon: "portfolio" },
      { href: "/dashboard/cv", label: "My CV", icon: "cv" },
      { href: "/dashboard/tests", label: "Qualification Tests", icon: "tests" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const hrdNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/company/dashboard", label: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { href: "/company/jobs", label: "Jobs", icon: "briefcase" },
      { href: "/company/applicants", label: "Applicants", icon: "users" },
      { href: "/company/tests", label: "Qualification Tests", icon: "tests" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/company/employees", label: "Employees", icon: "company" },
      { href: "/company/projects", label: "Projects", icon: "portfolio" },
      { href: "/company/tasks", label: "Tasks", icon: "tasks" },
      { href: "/company/messages", label: "Messages", icon: "messages" },
      { href: "/company/calendar", label: "Calendar", icon: "calendar" },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/company/profile", label: "Company Profile", icon: "company" },
      { href: "/company/announcements", label: "Announcements", icon: "announcements" },
      { href: "/company/settings", label: "Settings", icon: "settings" },
    ],
  },
];

// Employee (hired candidate) workspace — merged into the candidate sidebar.
export const employeeWorkspaceNavGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard/workspace/tasks", label: "My Tasks", icon: "tasks" },
      { href: "/dashboard/workspace/projects", label: "Projects", icon: "portfolio" },
      { href: "/dashboard/workspace/messages", label: "Messages", icon: "messages" },
      { href: "/dashboard/workspace/calendar", label: "Calendar", icon: "calendar" },
      { href: "/dashboard/workspace/announcements", label: "Announcements", icon: "announcements" },
    ],
  },
];

export const adminNavGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/admin/companies", label: "Companies", icon: "company" },
      { href: "/admin/hrd", label: "HRD", icon: "shield" },
      { href: "/admin/jobs", label: "Jobs", icon: "briefcase" },
      { href: "/admin/applications", label: "Applications", icon: "applications" },
      { href: "/admin/tests", label: "Qualification Tests", icon: "tests" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];
