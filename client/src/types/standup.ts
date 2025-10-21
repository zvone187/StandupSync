export interface Standup {
  _id: string;
  userId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  email: string;
  name: string;
  role: string;
}