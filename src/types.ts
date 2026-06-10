export type Priority = "Low" | "Medium" | "High";

export type Category = 
  | "Cybersecurity" 
  | "Software Engineering" 
  | "Content Creation" 
  | "Business" 
  | "Personal";

export type TaskStatus = "Todo" | "In Progress" | "Completed";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  deadline: string;
  status: TaskStatus;
  notes?: string;
  tags: string[];
  xpReward: number;
}

export interface Goal {
  id: string;
  title: string;
  timeframe: "Weekly" | "Monthly" | "Yearly";
  completed: boolean;
  category: Category | "General";
}

export interface Skill {
  name: string;
  progress: number; // 0 to 100
  level: number;
  category: string;
}

export interface Lesson {
  id: string;
  title: string;
  xp: number;
  badge: string;
  duration: string;
  completed?: boolean;
}

export interface AcademyRoadmap {
  skillName: string;
  description: string;
  lessons: Lesson[];
  unlockedBadgeCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "CEO" | "Manager" | "Member" | "Viewer";
  avatar: string;
  email: string;
  activeTaskCount: number;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  category: "Startup Ideas" | "App Ideas" | "Video Ideas" | "Research Ideas" | "Unsorted";
  tags: string[];
  commentary?: string;
  createdAt: string;
}

export interface ContentChannel {
  id: string;
  name: string;
  queue: ContentVideo[];
  type: "Motivation" | "Football" | "Gaming" | "Design" | "Tech";
}

export interface ContentVideo {
  id: string;
  title: string;
  status: "Drafting" | "Scripting" | "Editing" | "Ready" | "Published";
  publishDate?: string;
  thumbnailConcept?: string;
  scriptNotes?: string;
}

export interface ProductivityAnalytics {
  timeSpentByCategory: Record<Category, number>; // hours
  totalHoursToday: number;
  weeklyCompleted: number;
  completionRate: number; // 0 to 100
}

export interface MotivationState {
  quote: string;
  author: string;
  videoTopic: string;
  articleTitle: string;
  challenge: string;
  category: "Entrepreneurship" | "Cybersecurity" | "Success" | "Discipline" | "Coding";
}
