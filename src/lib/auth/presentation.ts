import {
  BookOpenCheck,
  Building2,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type {
  AuthHeroStat,
  AuthRoleContent,
  LoginRole,
  RoleSwitcherOption,
} from "@/types/auth";

export type AuthHeroStatItem = AuthHeroStat & {
  icon: LucideIcon;
};

export const SYNTRA_BRAND_NAME = "Syntra";
export const SYNTRA_SUPPORT_EMAIL = "helpdesk@syntra.app";
export const SYNTRA_FORGOT_PASSWORD_HREF = `mailto:${SYNTRA_SUPPORT_EMAIL}?subject=Syntra%20password%20reset`;
export const SYNTRA_ACCESS_REQUEST_HREF = `mailto:${SYNTRA_SUPPORT_EMAIL}?subject=Syntra%20faculty%20access%20request`;

export const AUTH_HERO_CONTENT = {
  badge: "Academic Innovation Platform",
  title: "Move every campus idea from proposal to published outcome.",
  description:
    "Syntra unifies student execution, faculty review cycles, and research readiness in one secure workflow layer for modern institutions.",
  footer:
    "Institution-based authentication, role-aware dashboards, and audit-friendly review histories built for higher education teams.",
};

export const AUTH_SELF_SERVICE_NOTE =
  "Self-service sign-up is available for student innovators. Faculty and admin access is provisioned by institution owners.";

export const AUTH_REQUEST_ACCESS_NOTE =
  "Faculty workspaces are provisioned by institution owners so review authority, student scope, and audit trails stay governed.";

export const LOGIN_ROLE_OPTIONS: RoleSwitcherOption[] = [
  {
    value: "STUDENT",
    label: "Student",
    description: "Projects, milestones, submissions",
  },
  {
    value: "FACULTY",
    label: "Faculty",
    description: "Reviews, approvals, cohort oversight",
  },
];

export const LOGIN_ROLE_CONTENT: Record<LoginRole, AuthRoleContent> = {
  STUDENT: {
    eyebrow: "Student access",
    description:
      "Open your project workspace, research logs, and mentor feedback with your institution-issued login.",
    emailPlaceholder: "you@college.edu",
    passwordPlaceholder: "Enter your Syntra password",
    accessNote:
      "Student onboarding supports institution-approved self-service sign-up and invitation-based activation.",
  },
  FACULTY: {
    eyebrow: "Faculty access",
    description:
      "Continue to milestone reviews, cohort health dashboards, and publication checkpoints tied to your department.",
    emailPlaceholder: "faculty@university.edu",
    passwordPlaceholder: "Enter your faculty password",
    accessNote:
      "Faculty access is provisioned by department administrators to preserve institution-level role controls.",
  },
};

export const AUTH_HERO_STATS: AuthHeroStatItem[] = [
  {
    icon: GraduationCap,
    value: "240+",
    label: "Active capstone teams",
    description: "Students aligned around validated milestones, review loops, and deliverable deadlines.",
  },
  {
    icon: BookOpenCheck,
    value: "92%",
    label: "Weekly milestone completion",
    description: "Operational visibility that helps mentors intervene before project work stalls.",
  },
  {
    icon: Building2,
    value: "18",
    label: "Departments onboarded",
    description: "One institution-ready platform for innovation cells, labs, and faculty-led programs.",
  },
];

export const AUTH_ASSURANCE_ICON = ShieldCheck;
