import type { NavItem } from "@/components/layout/DashboardShell";
import { Icon } from "@/components/ui/Icon";
import type { UserRole } from "@/types/database";

export function getNavItems(role: UserRole): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: <Icon name="dashboard" /> },
      { href: "/admin/users", label: "Users", icon: <Icon name="users" /> },
      { href: "/admin/companies", label: "Companies", icon: <Icon name="building" /> },
      { href: "/admin/jobs", label: "Jobs", icon: <Icon name="briefcase" /> },
      { href: "/admin/applications", label: "Applications", icon: <Icon name="document" /> },
      { href: "/admin/reports", label: "Reports", icon: <Icon name="chart" /> },
      { href: "/admin/settings", label: "Settings", icon: <Icon name="settings" />, exact: true },
    ];
  }

  if (role === "hrd") {
    return [
      { href: "/hrd/dashboard", label: "Dashboard", icon: <Icon name="dashboard" /> },
      { href: "/hrd/jobs", label: "My Jobs", icon: <Icon name="briefcase" />, exact: true },
      { href: "/hrd/jobs/new", label: "Create Job", icon: <Icon name="plus" /> },
      { href: "/hrd/applicants", label: "Applicants", icon: <Icon name="clipboard" /> },
      { href: "/hrd/company", label: "Company Profile", icon: <Icon name="building" /> },
      { href: "/hrd/settings", label: "Settings", icon: <Icon name="settings" />, exact: true },
    ];
  }

  return [
    { href: "/jobseeker/dashboard", label: "Dashboard", icon: <Icon name="dashboard" /> },
    { href: "/jobseeker/jobs", label: "Find Jobs", icon: <Icon name="search" /> },
    { href: "/jobseeker/applications", label: "My Applications", icon: <Icon name="document" /> },
    { href: "/jobseeker/profile", label: "My Profile", icon: <Icon name="user" /> },
    { href: "/jobseeker/cv", label: "My CV", icon: <Icon name="upload" /> },
    { href: "/jobseeker/settings", label: "Settings", icon: <Icon name="settings" />, exact: true },
  ];
}

export function getRoleTitle(role: UserRole): string {
  return role === "admin"
    ? "Admin Dashboard"
    : role === "hrd"
      ? "HRD Dashboard"
      : "Job Seeker Dashboard";
}
