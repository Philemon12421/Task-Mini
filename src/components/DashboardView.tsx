import { motion } from "motion/react";
import { Task, Goal, Skill, MotivationState, Category } from "../types";
import {
  CheckCircle2, Clock, Flame, ShieldCheck, Video, ChevronRight,
  Lightbulb, RefreshCw, Zap, Plus, Sparkles, X, AlertCircle,
  Code, Briefcase, User, StickyNote, Trash2, FileText, Check
} from "lucide-react";
import { useState, FormEvent, useEffect, useRef, MouseEvent } from "react";

interface DashboardViewProps {
  tasks: Task[];
  addTask: (newTaskData: Omit<Task, "id" | "xpReward" | "tags"> & { xpReward: number; tags?: string[] }) => void;
  goals: Goal[];
  skills: Skill[];
  motivation: MotivationState;
  streakDays: number;
  timeSpentToday: number;
  toggleTaskStatus: (id: string) => void;
  addQuickIdea: (title: string, desc: string) => void;
  onRefreshMotivation: () => void;
  isLoadingMotivation: boolean;
  onNavigate: (tab: string) => void;
  isDeepFocus?: boolean;
}

const CATEGORIES: { name: Category; icon: any; accent: string; pill: string }[] = [
  { name: "Software Engineering", icon: Code,         accent: "text-indigo-500", pill: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300" },
  { name: "Cybersecurity",        icon: ShieldCheck,  accent: "text-emerald-500", pill: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300" },
  { name: "Content Creation",     icon: Video,        accent: "text-violet-500", pill: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300" },
  { name: "Business",             icon: Briefcase,    accent: "text-teal-500", pill: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300" },
  { name: "Personal",             icon: User,         accent: "text-amber-500", pill: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300" },
];

const PRIORITY_XP: Record<string, number> = { High: 120, Medium: 70, Low: 40 };

interface TaskPattern {
  keywords: string[];
  category: Category;
  tags: string[];
}

const TASK_PATTERNS: TaskPattern[] = [
  {
    keywords: ["meeting", "standup", "sync", "huddle", "catchup", "scrum", "weekly review", "board review", "call"],
    category: "Business",
    tags: ["Meeting", "Collab"],
  },
  {
    keywords: ["code review", "review code", "pr review", "pull request", "github review", "review pr", "merge pr"],
    category: "Software Engineering",
    tags: ["CodeReview", "QA"],
  },
  {
    keywords: ["bug fix", "bugfix", "hotfix", "debug", "fix bug", "resolve error", "issue fix", "crash fix"],
    category: "Software Engineering",
    tags: ["Bug", "Fix"],
  },
  {
    keywords: ["vulnerability", "sec scan", "security audit", "pentest", "malware", "hack", "firewall", "leak test", "penetration testing"],
    category: "Cybersecurity",
    tags: ["Security", "Audit"],
  },
  {
    keywords: ["video edit", "editing", "thumbnail", "youtube short", "rendering", "scripting", "b-roll", "edit audio"],
    category: "Content Creation",
    tags: ["Creative", "Editing"],
  },
  {
    keywords: ["workout", "gym", "exercise", "run", "cardio", "training", "stretch", "fitness", "lift weight"],
    category: "Personal",
    tags: ["Fitness", "Health"],
  },
  {
    keywords: ["client proposal", "pitch", "deck", "invoice", "sales", "lead generation", "revenue model", "partnership"],
    category: "Business",
    tags: ["Client", "Revenue"],
  },
  {
    keywords: ["study", "learn", "course", "research", "homework", "lecture", "tutorial", "certification"],
    category: "Personal",
    tags: ["Learning", "Growth"],
  }
];

function parseNLPTask(input: string): {
  title: string;
  priority: "High" | "Medium" | "Low";
  category: Category;
  deadline: string;
  tags: string[];
} {
  const norm = input.toLowerCase();

  let priority: "High" | "Medium" | "Low" = "Medium";
  if (/\b(high|urgent|important|critical)\b/.test(norm)) priority = "High";
  else if (/\b(low|easy|minor)\b/.test(norm)) priority = "Low";

  let category: Category = "Personal";
  if (/\b(code|react|web|app|development|typescript|vite|frontend|backend|js|coding)\b/.test(norm)) category = "Software Engineering";
  else if (/\b(cyber|security|hack|pentest|exploit|audit|firewall)\b/.test(norm)) category = "Cybersecurity";
  else if (/\b(video|edit|youtube|shorts|tiktok|content|script)\b/.test(norm)) category = "Content Creation";
  else if (/\b(business|client|contract|startup|sales|revenue|invoice)\b/.test(norm)) category = "Business";

  // Check for common task patterns to override category and auto-fill tags
  let matchedTags: string[] = [];
  for (const pattern of TASK_PATTERNS) {
    if (pattern.keywords.some(keyword => norm.includes(keyword))) {
      category = pattern.category;
      matchedTags = Array.from(new Set([...matchedTags, ...pattern.tags]));
    }
  }

  let offsetDays = 1;
  if (/\btoday\b/.test(norm)) offsetDays = 0;
  else if (/\btomorrow\b/.test(norm)) offsetDays = 1;
  else {
    const match = norm.match(/\bin (\d+) days?\b/);
    if (match) offsetDays = parseInt(match[1]);
    else {
      const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
      for (let i = 0; i < days.length; i++) {
        if (new RegExp(`\\b${days[i]}\\b`).test(norm)) {
          const todayIdx = 3;
          offsetDays = i > todayIdx ? i - todayIdx : 7 - todayIdx + i;
          break;
        }
      }
    }
  }

  const d = new Date("2026-06-11");
  d.setDate(d.getDate() + offsetDays);
  const deadline = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const cleaners = [
    /\b(today|tonight|tomorrow|next week)\b/gi,
    /\bin \d+ days?\b/gi,
    /\b(high|urgent|important|critical|medium|normal|moderate|low|easy|minor|priority)\b/gi,
    /\b(for|due|by) (today|tomorrow)\b/gi,
    /\b(on )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
  ];
  let title = cleaners.reduce((t, r) => t.replace(r, ""), input).replace(/\s+/g, " ").replace(/^[\s,\-:]+|[\s,\-:]+$/g, "").trim();
  if (!title) title = input.trim() || "New task";

  return { title, priority, category, deadline, tags: matchedTags };
}

export default function DashboardView({
  tasks, addTask, goals, skills, motivation, streakDays, timeSpentToday,
  toggleTaskStatus, addQuickIdea, onRefreshMotivation, isLoadingMotivation,
  onNavigate, isDeepFocus = false,
}: DashboardViewProps) {
  const [quickIdeaTitle, setQuickIdeaTitle] = useState("");
  const [ideaSaved, setIdeaSaved] = useState(false);

  const [fabOpen, setFabOpen] = useState(false);
  const [nlpInput, setNlpInput] = useState("");
  const [nlpSuccess, setNlpSuccess] = useState(false);
  const fabInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");
  const [quickNoteSaved, setQuickNoteSaved] = useState(false);
  const [quickNotes, setQuickNotes] = useState<{ id: string; title: string; content: string; createdAt: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem("mini_task_quick_notes") ?? "[]"); }
    catch { return []; }
  });

  const saveNotes = (notes: typeof quickNotes) => {
    setQuickNotes(notes);
    localStorage.setItem("mini_task_quick_notes", JSON.stringify(notes));
  };

  const handleSaveQuickNote = (e: FormEvent) => {
    e.preventDefault();
    if (!quickNoteContent.trim() && !quickNoteTitle.trim()) return;
    const note = {
      id: "note-" + Date.now(),
      title: quickNoteTitle.trim() || "Untitled",
      content: quickNoteContent.trim(),
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    saveNotes([note, ...quickNotes]);
    setQuickNoteTitle(""); setQuickNoteContent("");
    setQuickNoteSaved(true);
    setTimeout(() => setQuickNoteSaved(false), 2000);
  };

  const handleDeleteNote = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    saveNotes(quickNotes.filter(n => n.id !== id));
  };

  const handleConvertToTask = (note: typeof quickNotes[0], e: MouseEvent) => {
    e.stopPropagation();
    addTask({ title: note.title !== "Untitled" ? `${note.title}: ${note.content}` : note.content, category: "Personal", deadline: "2026-06-11", priority: "Medium", status: "Todo", tags: ["FromNote"], xpReward: 15 });
    saveNotes(quickNotes.filter(n => n.id !== note.id));
  };

  const handleQuickIdeaSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickIdeaTitle.trim()) return;
    addQuickIdea(quickIdeaTitle, "");
    setQuickIdeaTitle("");
    setIdeaSaved(true);
    setTimeout(() => setIdeaSaved(false), 2500);
  };

  const todayTasks = tasks.filter(t => t.deadline === "2026-06-11" || t.id === "task-1" || t.id === "task-2" || t.tags?.includes("NLP"));
  const completedCount = todayTasks.filter(t => t.status === "Completed").length;
  const filteredTasks = selectedCategory === "All" ? todayTasks : todayTasks.filter(t => t.category === selectedCategory);

  const getCatStats = (name: Category) => {
    const all = tasks.filter(t => t.category === name);
    const done = all.filter(t => t.status === "Completed").length;
    return { total: all.length, completed: done, pct: all.length > 0 ? Math.round((done / all.length) * 100) : 0 };
  };

  const parsedTask = parseNLPTask(nlpInput);

  const handleCreateNLPTask = (e: FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    const p = parseNLPTask(nlpInput);
    addTask({
      title: p.title,
      priority: p.priority,
      category: p.category,
      deadline: p.deadline,
      status: "Todo",
      tags: ["NLP", ...p.tags],
      xpReward: PRIORITY_XP[p.priority],
      notes: `From NLP: "${nlpInput}"`
    });
    setNlpInput(""); setNlpSuccess(true);
    setTimeout(() => { setNlpSuccess(false); setFabOpen(false); }, 1200);
  };

  useEffect(() => { if (fabOpen) setTimeout(() => fabInputRef.current?.focus(), 150); }, [fabOpen]);

  const dimmed = "transition-all duration-700 opacity-15 pointer-events-none select-none";
  const visible = "transition-all duration-700 opacity-100";

  return (
    <div className="space-y-7 max-w-6xl mx-auto relative pb-20">

      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${isDeepFocus ? dimmed : visible}`}>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            Good morning, Philemon<span className="text-[#FF7A00]">.</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">Wednesday · June 11</p>
        </div>
        <button
          onClick={() => onNavigate("planner")}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 hover:border-[#FF7A00] hover:text-[#FF7A00] transition-colors cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          Open timer
        </button>
      </div>

      {/* Stat Strip */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${isDeepFocus ? dimmed : visible}`}>
        {[
          { label: "Streak", value: `${streakDays} days`, icon: <Flame className="w-4 h-4" />, orange: true },
          { label: "Focus time", value: `${timeSpentToday.toFixed(1)} hrs`, icon: <Clock className="w-4 h-4" />, orange: false },
          { label: "Tasks done", value: `${completedCount} / ${todayTasks.length || 3}`, icon: <CheckCircle2 className="w-4 h-4" />, orange: true },
          { label: "Multiplier", value: "1.5× boost", icon: <Zap className="w-4 h-4" />, orange: true },
        ].map(({ label, value, icon, orange }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${orange ? "bg-orange-50 dark:bg-orange-950/30 text-[#FF7A00]" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
              {icon}
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">{label}</p>
              <p className="text-[15px] font-bold text-slate-800 dark:text-white leading-tight mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Overview */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${isDeepFocus ? dimmed : visible}`}>
        {CATEGORIES.map((cat) => {
          const stats = getCatStats(cat.name);
          const selected = selectedCategory === cat.name;
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selected ? "All" : cat.name)}
              className={`p-4 rounded-2xl text-left transition-all cursor-pointer group border ${
                selected
                  ? "bg-white dark:bg-slate-900 border-[#FF7A00]/60 shadow-[0_0_0_1px_rgba(255,122,0,0.15)]"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-1.5 rounded-lg ${cat.pill}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium tabular-nums">{stats.completed}/{stats.total}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight mb-2">{cat.name}</p>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${stats.pct}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${selected ? "bg-[#FF7A00]" : "bg-slate-300 dark:bg-slate-600"}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Today's Focus Checklist */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-50 dark:border-slate-800/60">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Today's focus</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Completed tasks award XP</p>
            </div>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-[12px] font-semibold text-[#FF7A00] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              All tasks <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5 px-6 py-3 border-b border-slate-50 dark:border-slate-800/60">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-[#FF7A00] text-white"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              All ({todayTasks.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = todayTasks.filter(t => t.category === cat.name).length;
              if (count === 0 && selectedCategory !== cat.name) return null;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat.name
                      ? "bg-[#FF7A00] text-white"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.name.split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto max-h-72 p-4 space-y-1.5">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No tasks for today.</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <p className="text-slate-400 text-sm">No tasks in this category.</p>
                <button onClick={() => setSelectedCategory("All")} className="text-[12px] font-semibold text-[#FF7A00] hover:underline cursor-pointer">Show all</button>
              </div>
            ) : filteredTasks.map((task) => {
              const done = task.status === "Completed";
              const catCfg = CATEGORIES.find(c => c.name === task.category);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    done ? "opacity-50" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <button onClick={() => toggleTaskStatus(task.id)} className="shrink-0 cursor-pointer">
                    {done ? (
                      <div className="w-5 h-5 rounded-md bg-[#FF7A00] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-700" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[13px] font-semibold block truncate ${done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                      {task.title}
                    </span>
                    {task.tags && task.tags.filter(t => t !== "NLP" && t !== "FromNote").length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {task.tags.filter(t => t !== "NLP" && t !== "FromNote").map(tg => (
                          <span key={tg} className="text-[9.5px] font-bold text-[#FF7A00] dark:text-orange-400 font-mono tracking-tight bg-orange-50/50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md">
                            #{tg.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {catCfg && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${catCfg.pill}`}>
                        {task.category.split(" ")[0]}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-[#FF7A00] tabular-nums">+{task.xpReward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stoic / Motivation */}
        <div className={`lg:col-span-5 bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden ${isDeepFocus ? dimmed : visible}`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/8 rounded-full -mr-12 -mt-12 blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{motivation.category}</span>
              <button
                onClick={onRefreshMotivation}
                disabled={isLoadingMotivation}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Refresh quote"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMotivation ? "animate-spin text-[#FF7A00]" : ""}`} />
              </button>
            </div>

            <p className="text-[15px] font-medium italic leading-relaxed text-slate-100 font-serif">
              "{motivation.quote}"
            </p>
            <p className="text-[12px] text-slate-500 mt-2 text-right">— {motivation.author}</p>
          </div>

          <div className="relative border-t border-slate-800 pt-4 mt-6 space-y-1">
            <p className="text-[11px] font-semibold text-[#FF7A00] uppercase tracking-wider">Challenge</p>
            <p className="text-[13px] text-slate-300 leading-relaxed">{motivation.challenge}</p>
            <button
              onClick={() => onNavigate("motivation")}
              className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-300 mt-2 cursor-pointer transition-colors"
            >
              More resources <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Three-Column Row */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 ${isDeepFocus ? dimmed : visible}`}>

        {/* Idea Vault */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#FF7A00]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Idea vault</h3>
          </div>
          <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed font-sans font-medium">Drop a concept before it slips away.</p>

          <form onSubmit={handleQuickIdeaSubmit} className="mt-auto space-y-2.5">
            <input
              type="text"
              placeholder="e.g. API scanner SaaS…"
              value={quickIdeaTitle}
              onChange={(e) => setQuickIdeaTitle(e.target.value)}
              className="w-full text-[13px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-sans font-medium"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-[#FF7A00] text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Save concept
            </button>
          </form>

          {ideaSaved && (
            <p className="text-[11px] text-emerald-500 font-medium mt-2.5 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[2.5]" /> Saved to Idea Vault
            </p>
          )}
        </div>

        {/* Video Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#FF7A00]">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Video queue</h3>
            </div>
            <button onClick={() => onNavigate("content")} className="text-[12px] font-semibold text-[#FF7A00] hover:underline cursor-pointer">
              Open hub
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {[
              { title: "Discipline Beats Motivation", platform: "YouTube", status: "Ready", statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" },
              { title: "Football Midfielders", platform: "Shorts", status: "Editing", statusColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400" },
            ].map(({ title, platform, status, statusColor }) => (
              <div key={title} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{title}</p>
                  <p className="text-[11px] text-slate-400">{platform}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor}`}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#FF7A00]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Skills</h3>
            </div>
            <button onClick={() => onNavigate("skills")} className="text-[12px] font-semibold text-[#FF7A00] hover:underline cursor-pointer">
              View all
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {skills.slice(0, 3).map((s) => (
              <div key={s.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                  <span className="text-[11px] text-slate-400 tabular-nums">Lv {s.level} · {s.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${s.progress}%` }} className="h-full bg-[#FF7A00] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FAB System */}
      <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[90] flex flex-col items-end gap-3.5">

        {/* NLP Panel */}
        {fabOpen && (
          <div
            className="mb-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.16)] border border-slate-100 dark:border-slate-800 p-5 animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Quick task</h4>
              </div>
              <button
                onClick={() => setFabOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateNLPTask} className="space-y-3">
              <input
                ref={fabInputRef}
                type="text"
                placeholder="e.g. Code auth system tomorrow high priority"
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[13px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] placeholder:text-slate-400 font-sans font-medium"
              />

              {nlpInput.trim().length > 2 && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl animate-in fade-in duration-150">
                  {[
                    { label: "Title", value: parsedTask.title },
                    { label: "Priority", value: parsedTask.priority },
                    { label: "Due", value: parsedTask.deadline },
                    { label: "Category", value: parsedTask.category.split(" ")[0] },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] text-slate-400 mb-0.5 font-mono">{label}</p>
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">{value}</p>
                    </div>
                  ))}
                  {parsedTask.tags.length > 0 && (
                    <div className="col-span-2 mt-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-left">
                      <p className="text-[10px] text-slate-400 mb-1 font-mono">Auto-filled Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {parsedTask.tags.map(t => (
                          <span key={t} className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#FF7A00]/10 text-[#FF7A00] font-mono">
                            #{t.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-mono text-[10px]">↵</kbd> to add</p>
                <button
                  type="submit"
                  disabled={!nlpInput.trim()}
                  className="bg-slate-900 dark:bg-slate-700 hover:bg-[#FF7A00] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5 text-[11px] text-slate-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>Supports: today, tomorrow, weekday names, high/low priority parameters.</span>
            </div>
          </div>
        )}

        {/* Note button */}
        {!isDeepFocus && (
          <button
            onClick={() => setQuickNoteOpen(true)}
            className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:border-[#FF7A00] transition-colors cursor-pointer relative"
            title="Capture a thought"
          >
            <StickyNote className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
            {quickNotes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7A00] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                {quickNotes.length}
              </span>
            )}
          </button>
        )}

        {/* FAB primary */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
            fabOpen ? "bg-slate-900 dark:bg-slate-700" : "bg-[#FF7A00] hover:bg-[#E86E00]"
          }`}
          title="Add task"
        >
          {nlpSuccess ? (
            <Check className="w-5 h-5 text-white stroke-[2.5]" />
          ) : (
            <Plus className={`w-5 h-5 text-white stroke-[2.5] transition-transform duration-200 ${fabOpen ? "rotate-45" : ""}`} />
          )}
        </button>
      </div>

      {/* Quick Note Modal */}
      {quickNoteOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQuickNoteOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#FF7A00]">
                  <StickyNote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Fleeting thoughts</h3>
                  <p className="text-[11px] text-slate-400">Raw ideas, logged fast</p>
                </div>
              </div>
              <button
                onClick={() => setQuickNoteOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Form */}
              <form onSubmit={handleSaveQuickNote} className="space-y-3">
                <input
                  type="text"
                  placeholder="Title (optional)"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-sans font-semibold"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="What's on your mind?"
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none font-sans font-semibold"
                />
                <div className="flex items-center justify-between">
                  {quickNoteSaved ? (
                    <p className="text-[12px] text-emerald-500 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Saved
                    </p>
                  ) : <div />}
                  <button
                    type="submit"
                    disabled={!quickNoteContent.trim() && !quickNoteTitle.trim()}
                    className="bg-[#FF7A00] hover:bg-[#E86E00] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save thought
                  </button>
                </div>
              </form>

              {/* Saved notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Saved ({quickNotes.length})</h4>
                </div>

                {quickNotes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <FileText className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-[13px] text-slate-400">Nothing captured yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                    {quickNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 text-left"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{note.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono font-medium">{note.createdAt}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">{note.content}</p>
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                          <button
                            onClick={(e) => handleConvertToTask(note, e)}
                            className="text-[11px] font-semibold text-[#FF7A00] flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Zap className="w-3 h-3" /> Make into task
                          </button>
                          <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
