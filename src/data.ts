import { Task, Goal, Skill, TeamMember, Idea, ContentChannel, MotivationState } from "./types";

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Complete Client UI Design feedback integration",
    priority: "High",
    category: "Software Engineering",
    deadline: "2026-06-11",
    status: "In Progress",
    tags: ["UI/UX", "Feedback", "Clients"],
    xpReward: 100,
    notes: "Revamp the landing page layout with the new light/dark mode system and clean Orange highlights."
  },
  {
    id: "task-2",
    title: "Perform Security auditing & Active Directory Lab",
    priority: "High",
    category: "Cybersecurity",
    deadline: "2026-06-11",
    status: "Todo",
    tags: ["Labs", "Red-Teaming", "Pentest"],
    xpReward: 150,
    notes: "Deep-dive explore current vulnerabilities on local test containers."
  },
  {
    id: "task-3",
    title: "Edit and publish Football analytical video content",
    priority: "Medium",
    category: "Content Creation",
    deadline: "2026-06-12",
    status: "In Progress",
    tags: ["Football", "YouTube", "Editing"],
    xpReward: 80,
    notes: "Assemble tactical highlights, overlay tracking animations, and write script for the voice-over."
  },
  {
    id: "task-4",
    title: "Review Drenchack Tech contract and sync with team",
    priority: "High",
    category: "Business",
    deadline: "2026-06-10",
    status: "Completed",
    tags: ["Contracts", "Team", "Drenchack"],
    xpReward: 120,
    notes: "Align with partners on upcoming milestone deliveries."
  },
  {
    id: "task-5",
    title: "Read 10 pages on modern software system design",
    priority: "Low",
    category: "Personal",
    deadline: "2026-06-13",
    status: "Todo",
    tags: ["Reading", "Self-Growth"],
    xpReward: 50,
    notes: "Review microkernel architecture patterns vs modern monorepos."
  }
];

export const INITIAL_GOALS: Goal[] = [
  // Weekly
  { id: "g-1", title: "Complete Personal Portfolio revamp", timeframe: "Weekly", completed: false, category: "Software Engineering" },
  { id: "g-2", title: "Upload 3 premium football/motivational video shorts", timeframe: "Weekly", completed: true, category: "Content Creation" },
  { id: "g-3", title: "Finish current advanced pentest lab module", timeframe: "Weekly", completed: false, category: "Cybersecurity" },
  // Monthly
  { id: "g-4", title: "Launch micro-SaaS web widget product v1", timeframe: "Monthly", completed: false, category: "Business" },
  { id: "g-5", title: "Earn 1 new enterprise client retainer", timeframe: "Monthly", completed: false, category: "Business" },
  { id: "g-6", title: "Publish 1 high-quality tutorial series for academy students", timeframe: "Monthly", completed: true, category: "Personal" },
  // Yearly
  { id: "g-7", title: "Establish status as a recognized Cybersecurity Expert", timeframe: "Yearly", completed: false, category: "Cybersecurity" },
  { id: "g-8", title: "Scale Drenchack Tech agency to $50k MRR", timeframe: "Yearly", completed: false, category: "Business" },
  { id: "g-9", title: "Build 3 standalone production SaaS products", timeframe: "Yearly", completed: false, category: "Software Engineering" }
];

export const INITIAL_SKILLS: Skill[] = [
  { name: "UI/UX Design", progress: 85, level: 4, category: "Design" },
  { name: "Graphic Design", progress: 80, level: 3, category: "Design" },
  { name: "Video Editing", progress: 90, level: 4, category: "Editing" },
  { name: "Animation", progress: 65, level: 3, category: "Editing" },
  { name: "Web Development", progress: 95, level: 4, category: "Coding" },
  { name: "App Development", progress: 85, level: 4, category: "Coding" },
  { name: "Cybersecurity", progress: 75, level: 3, category: "Security" },
  { name: "Content Creation", progress: 85, level: 4, category: "Media" },
  { name: "Leadership", progress: 70, level: 3, category: "Business" }
];

export const INITIAL_TEAM: TeamMember[] = [
  { id: "m-1", name: "Philemon", role: "CEO", email: "philemonkusi292@gmail.com", avatar: "P", activeTaskCount: 3 },
  { id: "m-2", name: "Daniel K.", role: "Manager", email: "daniel@drenchack.tech", avatar: "D", activeTaskCount: 2 },
  { id: "m-3", name: "Sarah Cole", role: "Member", email: "sarah@drenchack.tech", avatar: "S", activeTaskCount: 1 },
  { id: "m-4", name: "Client Partner (Acme Corp)", role: "Viewer", email: "partner@acmeconcept.com", avatar: "C", activeTaskCount: 0 }
];

export const INITIAL_IDEAS: Idea[] = [
  {
    id: "idea-1",
    title: "Micro-SaaS audit platform for active dev repositories",
    description: "An API scanner that checks developer repos for credential leaks and bad structure before deployment.",
    category: "Startup Ideas",
    tags: ["SaaS", "Security", "DevOps"],
    commentary: "High potential. Connects directly to server-side Webhook listeners securely.",
    createdAt: "2026-06-08"
  },
  {
    id: "idea-2",
    title: "Football tactics animation generator client widget",
    description: "Let users dragging players on a board and output clean dynamic video presets instantly.",
    category: "App Ideas",
    tags: ["React", "Animation", "Football"],
    commentary: "Solves your own workflow issue. Could be perfect content fuel for YouTube channels.",
    createdAt: "2026-06-09"
  },
  {
    id: "idea-3",
    title: "Stoic builder 30-day challenge series",
    description: "An explosive high-definition editing short video playlist highlighting morning routines and high stakes coding.",
    category: "Video Ideas",
    tags: ["Motivation", "Discipline", "Shorts"],
    commentary: "Aesthetic branding will generate huge audience attachment rates.",
    createdAt: "2026-06-10"
  }
];

export const INITIAL_CHANNELS: ContentChannel[] = [
  {
    id: "ch-1",
    name: "Motivation Channel",
    type: "Motivation",
    queue: [
      { id: "v-1", title: "Discipline beats Motivation: The 2026 Stoic Blueprint", status: "Ready", thumbnailConcept: "High contrast dark background, glowing orange typography. 'NO EXCUSES'." },
      { id: "v-2", title: "Why 99% of Software Engineers stay in their comfort zone", status: "Scripting", thumbnailConcept: "Splitted screens showing a coder in glowing lights vs darkness." }
    ]
  },
  {
    id: "ch-2",
    name: "Football Channel",
    type: "Football",
    queue: [
      { id: "v-3", title: "Anatomical analysis of the ultimate playmaking midfielders", status: "Editing", thumbnailConcept: "Laser tracks following player movements on green canvas." }
    ]
  },
  {
    id: "ch-3",
    name: "Tech Channel",
    type: "Tech",
    queue: [
      { id: "v-4", title: "How I built a full-stack personal scheduler on Vite in record speed", status: "Drafting", thumbnailConcept: "VS Code window, smiling avatar pointing, floating orange gear." }
    ]
  }
];

export const INITIAL_MOTIVATION: MotivationState = {
  quote: "The visual craftsman is defined by what they delete, not just what they place. Build systems, not just lists.",
  author: "Venture Creator",
  videoTopic: "How Philemon can automate video cues and software workflows with AI",
  articleTitle: "The Stoicism of the Developer: Rebuilding from First Principles",
  challenge: "Build a brand new feature modularly and test it thoroughly with strict typescript compliance.",
  category: "Discipline"
};

export const HOURLY_TIMELINE = [
  { time: "06:00 AM", activity: "Morning Routine & Hydration Check", completed: true },
  { time: "08:00 AM", activity: "Active Cybersecurity Lab Exercises", completed: false },
  { time: "10:00 AM", activity: "Core Frontend Software Engineering (Task Mini Development)", completed: true },
  { time: "02:00 PM", activity: "High-Immersive Video Editing (Football Tactics Clips)", completed: false },
  { time: "06:00 PM", activity: "Mentorship, Community Support, Academy Sharing", completed: false },
  { time: "08:00 PM", activity: "Brainstorming and Video Concept Architecture", completed: false }
];
