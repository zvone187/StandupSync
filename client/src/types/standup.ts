export interface Standup {
  _id: string;
  userId: string;
  date: string;
  yesterdayWork: string[];
  todayPlan: string[];
  blockers: string[];
  submittedAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: string;
}