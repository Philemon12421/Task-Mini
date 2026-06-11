import { motion } from "motion/react";
import { Task, Goal, Skill, MotivationState, Category } from "../types";
import { 
  CheckCircle2, Circle, Clock, Flame, BookOpen, ChevronRight, 
  Lightbulb, ShieldCheck, Video, RefreshCw, Zap, Plus, Sparkles, X, AlertCircle,
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

export default function DashboardView({
  tasks,
  addTask,
  goals,
  skills,
  motivation,
  streakDays,
  timeSpentToday,
  toggleTaskStatus,
  addQuickIdea,
  onRefreshMotivation,
  isLoadingMotivation,
  onNavigate,
  isDeepFocus = false
}: DashboardViewProps) {
  // Quick Idea state
  const [quickIdeaTitle, setQuickIdeaTitle] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  // FAB NLP task creation states
  const [fabOpen, setFabOpen] = useState(false);
  const [nlpInput, setNlpInput] = useState("");
  const [nlpSuccess, setNlpSuccess] = useState(false);
  const fabInputRef = useRef<HTMLInputElement>(null);

  // Category state for interactive matrix & checklist filter
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  // Floating Quick Note States for Fleeting Thoughts
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");
  const [quickNoteSuccess, setQuickNoteSuccess] = useState(false);
  const [quickNotes, setQuickNotes] = useState<{ id: string; title: string; content: string; createdAt: string }[]>(() => {
    try {
      const saved = localStorage.getItem("mini_task_quick_notes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveQuickNote = (e: FormEvent) => {
    e.preventDefault();
    if (!quickNoteContent.trim() && !quickNoteTitle.trim()) return;

    const newNote = {
      id: "note-" + Date.now(),
      title: quickNoteTitle.trim() || "Fleeting Thought",
      content: quickNoteContent.trim(),
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedNotes = [newNote, ...quickNotes];
    setQuickNotes(updatedNotes);
    localStorage.setItem("mini_task_quick_notes", JSON.stringify(updatedNotes));

    setQuickNoteTitle("");
    setQuickNoteContent("");
    setQuickNoteSuccess(true);
    setTimeout(() => setQuickNoteSuccess(false), 2000);
  };

  const handleDeleteQuickNote = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updatedNotes = quickNotes.filter(n => n.id !== id);
    setQuickNotes(updatedNotes);
    localStorage.setItem("mini_task_quick_notes", JSON.stringify(updatedNotes));
  };

  const handleConvertToTask = (note: { id: string; title: string; content: string }, e: MouseEvent) => {
    e.stopPropagation();
    addTask({
      title: note.title !== "Fleeting Thought" ? `${note.title}: ${note.content}` : note.content,
      category: "Personal",
      deadline: "2026-06-11",
      priority: "Medium",
      status: "Todo",
      tags: ["FromNote", "FleetingNote"],
      xpReward: 15
    });
    
    const updatedNotes = quickNotes.filter(n => n.id !== note.id);
    setQuickNotes(updatedNotes);
    localStorage.setItem("mini_task_quick_notes", JSON.stringify(updatedNotes));
  };

  const handleQuickIdeaSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickIdeaTitle.trim()) return;
    addQuickIdea(quickIdeaTitle, "Captured quickly from your primary personal dashboard.");
    setQuickIdeaTitle("");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  // Process numbers & categories
  const todayTasks = tasks.filter(t => t.deadline === "2026-06-11" || t.id === "task-1" || t.id === "task-2" || t.tags?.includes("NLP"));
  const completedTodayCount = todayTasks.filter(t => t.status === "Completed").length;
  const totalTodayCount = todayTasks.length;

  const filteredTodayTasks = selectedCategory === "All" 
    ? todayTasks 
    : todayTasks.filter(t => t.category === selectedCategory);

  const getCategoryStats = (cat: Category) => {
    const catTasks = tasks.filter(t => t.category === cat);
    const total = catTasks.length;
    const completed = catTasks.filter(t => t.status === "Completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, progress };
  };

  const categoriesList: { name: Category; icon: any; color: string; bg: string; border: string; darkBg: string }[] = [
    { 
      name: "Software Engineering", 
      icon: Code, 
      color: "text-blue-500", 
      bg: "bg-blue-50", 
      border: "border-blue-100", 
      darkBg: "dark:bg-blue-950/20" 
    },
    { 
      name: "Cybersecurity", 
      icon: ShieldCheck, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50", 
      border: "border-emerald-100", 
      darkBg: "dark:bg-emerald-950/20" 
    },
    { 
      name: "Content Creation", 
      icon: Video, 
      color: "text-purple-500", 
      bg: "bg-purple-50", 
      border: "border-purple-100", 
      darkBg: "dark:bg-purple-950/20" 
    },
    { 
      name: "Business", 
      icon: Briefcase, 
      color: "text-teal-500", 
      bg: "bg-teal-50", 
      border: "border-teal-100", 
      darkBg: "dark:bg-teal-950/20" 
    },
    { 
      name: "Personal", 
      icon: User, 
      color: "text-amber-500", 
      bg: "bg-amber-50", 
      border: "border-amber-100", 
      darkBg: "dark:bg-amber-950/20" 
    }
  ];

  // Real-time NLP parsing engine for FAB
  const parseNLPTask = (input: string) => {
    const norm = input.toLowerCase();

    // 1. Priority Matcher
    let priority: "High" | "Medium" | "Low" = "Medium";
    if (/\b(high|urgent|important|critical)\b/.test(norm)) {
      priority = "High";
    } else if (/\b(low|easy|minor)\b/.test(norm)) {
      priority = "Low";
    } else if (/\b(medium|normal|moderate)\b/.test(norm)) {
      priority = "Medium";
    }

    // 2. Class Matcher
    let category: Category = "Personal";
    if (/\b(code|react|web|app|development|typescript|vite|frontend|backend|program|js|coding)\b/.test(norm)) {
      category = "Software Engineering";
    } else if (/\b(cyber|security|hack|ad|pentest|lab|exploit|vulnerability|audit|firewall)\b/.test(norm)) {
      category = "Cybersecurity";
    } else if (/\b(video|edit|youtube|shorts|tiktok|reels|render|content|script|audio)\b/.test(norm)) {
      category = "Content Creation";
    } else if (/\b(business|agency|client|contract|deal|startup|sales|revenue|invoice)\b/.test(norm)) {
      category = "Business";
    }

    // 3. Simple Offset Matcher
    let offsetDays = 1; // standardTomorrow
    if (/\btoday\b/.test(norm)) {
      offsetDays = 0;
    } else if (/\btomorrow\b/.test(norm)) {
      offsetDays = 1;
    } else if (/\bin (\d+) days?\b/.test(norm)) {
      const match = norm.match(/\bin (\d+) days?\b/);
      if (match) offsetDays = parseInt(match[1]);
    } else {
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      for (let i = 0; i < daysOfWeek.length; i++) {
        if (new RegExp(`\\b${daysOfWeek[i]}\\b`).test(norm)) {
          const todayIndex = 3; // Wednesday June 10, 2026
          const targetDayIndex = i;
          if (targetDayIndex > todayIndex) {
            offsetDays = targetDayIndex - todayIndex;
          } else {
            offsetDays = 7 - todayIndex + targetDayIndex;
          }
          break;
        }
      }
    }

    const refDate = new Date("2026-06-10");
    refDate.setDate(refDate.getDate() + offsetDays);
    const yyyy = refDate.getFullYear();
    const mm = String(refDate.getMonth() + 1).padStart(2, '0');
    const dd = String(refDate.getDate()).padStart(2, '0');
    const deadline = `${yyyy}-${mm}-${dd}`;

    // 4. Clean Title Stripper
    let title = input;
    const regexes = [
      /\b(today|tonight|tomorrow|next week)\b/gi,
      /\bin \d+ days?\b/gi,
      /\b(high|urgent|important|critical|medium|normal|moderate|low|easy|minor)\b/gi,
      /\b(priority|for today|for tomorrow|due today|due tomorrow|by today|by tomorrow)\b/gi,
      /\b(on monday|on tuesday|on wednesday|on thursday|on friday|on saturday|on sunday|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi
    ];
    regexes.forEach((r) => { title = title.replace(r, ""); });
    title = title.replace(/\s+/g, " ").trim();
    title = title.replace(/\s(for|on|at|by|with|due)$/i, "").trim();
    title = title.replace(/^[,\s\-\:]+/, "").replace(/[,\s\-\:]+$/, "").trim();

    if (!title) title = input.trim() || "Drafted Task";

    return { title, priority, category, deadline };
  };

  const parsedTask = parseNLPTask(nlpInput);

  const handleCreateNLPTask = (e: FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;

    const parsed = parseNLPTask(nlpInput);
    const xp = parsed.priority === "High" ? 120 : parsed.priority === "Medium" ? 70 : 40;

    addTask({
      title: parsed.title,
      priority: parsed.priority,
      category: parsed.category,
      deadline: parsed.deadline,
      status: "Todo",
      tags: ["NLP", "Instant"],
      xpReward: xp,
      notes: `Captured instantly via NLP FAB parsing query: "${nlpInput}"`
    });

    setNlpInput("");
    setNlpSuccess(true);
    setTimeout(() => {
      setNlpSuccess(false);
      setFabOpen(false);
    }, 1200);
  };

  useEffect(() => {
    if (fabOpen) {
      setTimeout(() => fabInputRef.current?.focus(), 150);
    }
  }, [fabOpen]);

  return (
    <div id="dashboard-viewport" className="space-y-8 max-w-6xl mx-auto relative pb-16">
      
      {/* Header section with Greeting and quick micro stats */}
      <div 
        id="dashboard-greeting-hero" 
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-700 ${
          isDeepFocus ? "opacity-25" : "opacity-100"
        }`}
      >
        <div>
          <h1 className="text-3xl font-sans font-bold text-slate-900 tracking-tight dark:text-white">
            Good Morning Philemon<span className="text-[#FF7A00]">.</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Build your future. Your linear workspace starts with empty discipline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("planner")}
            className="flex items-center gap-2 bg-white px-5 py-2.5 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:bg-[#F8F9FB] active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#FF7A00]" />
            <span>Open Timer</span>
          </button>
        </div>
      </div>

      {/* Grid: High Stakes Stats Cards */}
      <div 
        id="dashboard-bento-metrics" 
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-1000 ${
          isDeepFocus 
            ? "opacity-15 pointer-events-none select-none filter saturate-50 blur-[0.2px] hover:opacity-100 hover:pointer-events-auto hover:blur-none hover:saturate-100" 
            : "opacity-100"
        }`}
      >
        {/* Metric 1: Streak */}
        <div className="bg-white/95 dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl sm:rounded-[32px] shadow-[0_12px_44px_rgba(148,163,184,0.06)] border-none flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF7A00] shrink-0 font-bold">
            <Flame className="w-5 h-5 text-[#FF7A00] fill-orange-100" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Streak</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 mt-0.5">{streakDays} Days</h3>
          </div>
        </div>

        {/* Metric 2: Time Used Today */}
        <div className="bg-white/95 dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl sm:rounded-[32px] shadow-[0_12px_44px_rgba(148,163,184,0.06)] border-none flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 shrink-0">
            <Clock className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Focus Time</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 mt-0.5">{timeSpentToday.toFixed(1)} hrs</h3>
          </div>
        </div>

        {/* Metric 3: Task Progress */}
        <div className="bg-white/95 dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl sm:rounded-[32px] shadow-[0_12px_44px_rgba(148,163,184,0.06)] border-none flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF7A00] shrink-0 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tasks Done</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 mt-0.5">
              {completedTodayCount} / {totalTodayCount || "3"}
            </h3>
          </div>
        </div>

        {/* Metric 4: Multiplier/XP Booster */}
        <div className="bg-white/95 dark:bg-slate-900/90 p-5 sm:p-7 rounded-3xl sm:rounded-[32px] shadow-[0_12px_44px_rgba(148,163,184,0.06)] border-none flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF7A00] shrink-0">
            <Zap className="w-5 h-5 text-[#FF7A00] fill-orange-200" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multiplier</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 mt-0.5">1.5x Boost</h3>
          </div>
        </div>
      </div>

      {/* Interactive Category Taxonomy Matrix */}
      <div 
        id="dashboard-category-matrix"
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-1000 ${
          isDeepFocus ? "opacity-15 pointer-events-none select-none filter blur-[0.2px]" : "opacity-100"
        }`}
      >
        {categoriesList.map((catConfig) => {
          const stats = getCategoryStats(catConfig.name);
          const isSelected = selectedCategory === catConfig.name;
          const CatIcon = catConfig.icon;
          
          return (
            <button
              key={catConfig.name}
              onClick={() => setSelectedCategory(isSelected ? "All" : catConfig.name)}
              className={`p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-slate-900 border-[#FF7A00] shadow-[0_8px_30px_rgba(255,122,0,0.12)] scale-[1.02]"
                  : "bg-white/95 dark:bg-slate-900/90 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`p-2 rounded-lg ${catConfig.bg} ${catConfig.darkBg} ${catConfig.color}`}>
                  <CatIcon className="w-4 h-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                  {stats.completed}/{stats.total} Tasks
                </span>
              </div>
              
              <div>
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {catConfig.name}
                </h4>
                
                {/* Horizontal mini progress bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                    <span>Rank Progress</span>
                    <span className="font-mono text-[9px] sm:text-[10px]">{stats.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800/50 h-1 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${stats.progress}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? "bg-[#FF7A00]" : "bg-slate-400 dark:bg-slate-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Highlight bar inside card */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF7A00]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bento Layout Row 1: Focus Tasks & Stoic Motivation Banner */}
      <div id="dashboard-main-row" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Side: Today's Focus Checklist (7 cols) - REMAINS ACTIVE & CRISP EVEN IN DEEP FOCUS! */}
        <div 
          id="dashboard-col-focus" 
          className="lg:col-span-7 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-8 rounded-3xl sm:rounded-[36px] shadow-[0_12px_44px_rgba(148,163,184,0.08)] border-none flex flex-col transition-all duration-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold font-sans text-slate-800 dark:text-white tracking-tight">Today's Focus</h2>
              <p className="text-xs text-slate-400 font-mono">Completed items award direct XP parameters.</p>
            </div>
            <button 
              onClick={() => onNavigate("tasks")}
              className="text-[#FF7A00] font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Manage all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Categorised Filter Pills Tray */}
          <div className="flex flex-wrap gap-1.5 mb-5 border-b border-slate-50 dark:border-slate-800/45 pb-4">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/10"
                  : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-500 dark:text-slate-400"
              }`}
            >
              All Focus ({todayTasks.length})
            </button>
            {categoriesList.map((catConfig) => {
              const count = todayTasks.filter(t => t.category === catConfig.name).length;
              if (count === 0 && selectedCategory !== catConfig.name) return null;
              return (
                <button
                  key={catConfig.name}
                  onClick={() => setSelectedCategory(catConfig.name)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === catConfig.name
                      ? "bg-[#FF7A00] text-white shadow-sm shadow-orange-500/10"
                      : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-500 dark:text-slate-450"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedCategory === catConfig.name ? "bg-white" : catConfig.bg.replace("bg-", "bg-").concat(" ").concat(catConfig.color)}`} />
                  <span>{catConfig.name} ({count})</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No tasks mapped out for today.</p>
              </div>
            ) : filteredTodayTasks.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <p className="text-slate-400 text-xs font-mono">No today's focus items for this category.</p>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="mt-3 text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                >
                  Clear filter & show all
                </button>
              </div>
            ) : (
              filteredTodayTasks.map((task) => (
                <div 
                  id={`dashboard-task-card-${task.id}`}
                  key={task.id}
                  className={`p-4 rounded-2xl flex items-center justify-between gap-3 transition-all border-none ${
                    task.status === "Completed" 
                      ? "bg-slate-50/50 dark:bg-slate-800/30 text-slate-400" 
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.01)]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className="text-slate-200 hover:text-[#FF7A00] transition-colors shrink-0 cursor-pointer"
                    >
                      {task.status === "Completed" ? (
                        <div className="w-5 h-5 rounded-md flex items-center justify-center bg-[#FF7A00]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-700" />
                      )}
                    </button>
                    <span className={`text-sm font-semibold leading-snug truncate ${
                      task.status === "Completed" ? "line-through text-slate-400 font-medium" : "text-slate-700 dark:text-slate-200 font-bold"
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-200/40 dark:bg-slate-800 text-slate-400 dark:text-slate-450 uppercase tracking-wider rounded">
                      {task.category || "TASKS"}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-[#FF7A00]">+{task.xpReward} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Stoic / Personal Motivation Widget (5 cols) - DIMMED IN DEEP FOCUS */}
        <div 
          id="dashboard-col-stoic" 
          className={`lg:col-span-5 bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[36px] text-white flex flex-col justify-between relative overflow-hidden transition-all duration-1000 ${
            isDeepFocus 
              ? "opacity-15 pointer-events-none select-none filter saturate-50 blur-[0.2px] hover:opacity-100 hover:pointer-events-auto hover:blur-none hover:saturate-100" 
              : "opacity-100"
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF7A00]/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
          
          <div className="relative z-10 flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Stoic Focus ({motivation.category})
              </span>
              <button 
                onClick={onRefreshMotivation}
                disabled={isLoadingMotivation}
                className="text-slate-400 hover:text-white transition-all hover:scale-105 active:rotate-180 duration-500 cursor-pointer"
                title="Generate custom Stoic motivation with Gemini"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingMotivation ? "animate-spin text-[#FF7A00]" : ""}`} />
              </button>
            </div>
            
            <p className="text-base font-medium italic leading-relaxed text-slate-100 mt-2 font-serif opacity-95">
              "{motivation.quote}"
            </p>
            <p className="text-xs text-slate-400 font-mono text-right mt-2 font-bold">
              — {motivation.author}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 space-y-3 relative z-10 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-[#FF7A00] font-extrabold font-mono text-[10px] shrink-0 mt-0.5">CHALLENGE:</span>
              <p className="text-slate-300 font-medium">
                {motivation.challenge}
              </p>
            </div>

            <div 
              className="flex items-center gap-1 mt-4 pt-1 text-[11px] text-[#FF9F45] cursor-pointer hover:underline" 
              onClick={() => onNavigate("motivation")}
            >
              <span>Explore deck recommendations</span>
              <ChevronRight className="w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Layout Row 2: Planner Snippet & Quick Idea Capture Bento - DIMMED IN DEEP FOCUS */}
      <div 
        id="dashboard-row-bento-2" 
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-1000 ${
          isDeepFocus 
            ? "opacity-15 pointer-events-none select-none filter saturate-50 blur-[0.2px] hover:opacity-100 hover:pointer-events-auto hover:blur-none hover:saturate-100" 
            : "opacity-100"
        }`}
      >
        
        {/* Quick Idea Capture (1 Col) */}
        <div id="dashboard-quick-idea" className="bg-white/95 dark:bg-slate-900/95 p-5 sm:p-7 rounded-3xl sm:rounded-[36px] shadow-[0_12px_44px_rgba(148,163,184,0.08)] border-none flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF7A00]">
                <Lightbulb className="w-4 h-4 text-[#FF7A00] fill-orange-100" />
              </div>
              <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100">Quick Idea Vault</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-normal">
              Capture startup or video concepts. System organizes ideas instantly.
            </p>

            <form onSubmit={handleQuickIdeaSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Ex: API scanner SaaS..."
                value={quickIdeaTitle}
                onChange={(e) => setQuickIdeaTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-transparent text-slate-800 dark:text-slate-100 font-medium"
              />
              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-[#FF7A00] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Store Concept</span>
              </button>
            </form>
          </div>

          {successMsg && (
            <p className="text-[#FF7A00] font-mono text-[10px] text-center mt-3 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Saved! Visit 'Idea Vault'.</span>
            </p>
          )}
        </div>

        {/* Video Creator Hub Queue Snippet (1 Col) */}
        <div id="dashboard-creator-snippet" className="bg-white/95 dark:bg-slate-900/95 p-5 sm:p-7 rounded-3xl sm:rounded-[36px] shadow-[0_12px_44px_rgba(148,163,184,0.08)] border-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF7A00]">
                  <Video className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100">Active Video Reels</h3>
              </div>
              <button 
                onClick={() => onNavigate("content")}
                className="text-xs font-semibold text-[#FF7A00] hover:underline cursor-pointer"
              >
                Go to Hub
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/50 dark:bg-slate-850 rounded-xl flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">Discipline Beats Motivation</p>
                  <span className="text-[10px] text-slate-400 font-mono">YouTube</span>
                </div>
                <span className="bg-orange-500/10 text-[#FF7A00] px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">READY</span>
              </div>

              <div className="p-3 bg-slate-50/50 dark:bg-slate-850 rounded-xl flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate font-bold">Football Midfielders</p>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">Shorts</span>
                </div>
                <span className="bg-orange-500/5 text-orange-400 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">EDITING</span>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-[10px] font-mono italic text-center mt-3">
            Digital reels are synchronized inside video hub.
          </p>
        </div>

        {/* Micro Skills Bento Preview (1 Col) */}
        <div id="dashboard-skills-snippet" className="bg-white/95 dark:bg-slate-900/95 p-5 sm:p-7 rounded-3xl sm:rounded-[36px] shadow-[0_12px_44px_rgba(148,163,184,0.08)] border-none flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100/10 flex items-center justify-center text-[#FF7A00]">
                  <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 dark:text-slate-100" onClick={() => onNavigate("skills")}>Master Skills</h3>
              </div>
              <button 
                onClick={() => onNavigate("skills")}
                className="text-xs font-semibold text-[#FF7A00] hover:underline cursor-pointer"
              >
                All Skills
              </button>
            </div>

            <div className="space-y-3.5">
              {skills.slice(0, 3).map((s) => (
                <div key={s.name} id={`skills-snippet-row-${s.name}`}>
                  <div className="flex justify-between items-center text-xs text-slate-700 font-medium mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="font-mono text-slate-400 dark:text-slate-450 font-bold text-[10px]">Lvl {s.level} ({s.progress}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${s.progress}%` }}
                      className="bg-[#FF7A00] h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono italic text-center mt-4 pt-1">
            Unlock badges upon study matrix rank ups.
          </p>
        </div>

      </div>

      {/* ========================================================== */}
      {/* FLOATING ACTION BUTTON (FAB) FOR INSTANT NLP TASK CREATION */}
      {/* ========================================================== */}
      <div 
        id="nlp-fab-system" 
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[90] flex flex-col items-end gap-3.5 max-w-[calc(100vw-2rem)]"
      >
        {/* Expanded NLP Panel */}
        {fabOpen && (
          <div 
            className="mb-4 w-[290px] xs:w-[340px] sm:w-[360px] md:w-[410px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] p-5 sm:p-6 border-none text-left animate-in fade-in slide-in-from-bottom-6 duration-300 max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF7A00] animate-pulse" />
                <h4 className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200">Instant NLP Task Wizard</h4>
              </div>
              <button 
                onClick={() => setFabOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateNLPTask} className="space-y-4">
              <div className="relative">
                <input
                  ref={fabInputRef}
                  type="text"
                  placeholder="e.g. Code auth system tomorrow high priority"
                  value={nlpInput}
                  onChange={(e) => setNlpInput(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-sans font-medium"
                />
              </div>

              {/* Live Preview Badges Block */}
              {nlpInput.trim().length > 2 && (
                <div className="p-3 bg-slate-50/60 dark:bg-slate-850/60 rounded-2xl space-y-2 text-[11px] animate-in fade-in slide-in-from-top-1 duration-200">
                  <p className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-wide">Live Parsing Matrix:</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[9px] text-slate-400 uppercase font-mono">Title</span>
                      <span className="font-bold truncate text-slate-800 dark:text-slate-200">
                        {parsedTask.title}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-mono">Priority</span>
                      <span className="font-bold text-[#FF7A00] flex items-center gap-1">
                        <Flame className="w-3 h-3 text-[#FF7A00] shrink-0" />
                        <span>{parsedTask.priority}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-mono">Due Date</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{parsedTask.deadline}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 uppercase font-mono">Auto Class</span>
                      <span className="font-bold text-[#FF7A00] flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 fill-orange-100" />
                        <span>{parsedTask.category}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-slate-400 font-mono leading-relaxed max-w-[180px]">
                  Hit <strong>Enter ↵</strong> to construct the item instantly.
                </span>

                <button
                  type="submit"
                  disabled={!nlpInput.trim()}
                  className="bg-slate-900 hover:bg-[#FF7A00] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build Task</span>
                </button>
              </div>
            </form>

            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-[#FF7A00] shrink-0 mt-0.5" />
              <span>Supports words: 'today', 'tomorrow', 'friday', 'high', 'low', 'priority'.</span>
            </div>
          </div>
        )}

        {/* Quick Note Floating Button */}
        {!isDeepFocus && (
          <button
            id="quick-note-floating-btn"
            onClick={() => setQuickNoteOpen(true)}
            className="w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-800 border border-slate-850 dark:border-slate-700 text-white shadow-xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center relative hover:bg-slate-800"
            title="Capture Fleeting Thought"
          >
            <StickyNote className="w-5 h-5 text-[#FF7A00]" />
            {quickNotes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-white text-[9px] font-bold font-mono h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {quickNotes.length}
              </span>
            )}
          </button>
        )}

        {/* Floating Trigger Circle */}
        <button
          id="nlp-fab-btn"
          onClick={() => setFabOpen(!fabOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer relative ${
            fabOpen
              ? "bg-slate-900 rotate-45 select-none"
              : "bg-gradient-to-br from-[#FF7A00] to-[#FF9F45] shadow-orange-500/10 hover:shadow-orange-500/20"
          }`}
          title="Instant NLP Task Creator"
        >
          {nlpSuccess ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              className="text-white text-xs font-bold"
            >
              ✓
            </motion.div>
          ) : (
            <div className="relative">
              <Plus className="w-6 h-6 text-white stroke-[2.5]" />
              {!fabOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping pointer-events-none" />
              )}
            </div>
          )}
        </button>
      </div>

      {/* ========================================================== */}
      {/* QUICK NOTE / FLEETING THOUGHTS MODAL */}
      {/* ========================================================== */}
      {quickNoteOpen && (
        <div 
          id="quick-note-modal-overlay"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setQuickNoteOpen(false)}
        >
          <div 
            id="quick-note-modal"
            className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FF7A00]/10 text-[#FF7A00]">
                  <StickyNote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Fleeting Thoughts Deck</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-medium">Capture spontaneous ideas, raw brainstorms or key logs.</p>
                </div>
              </div>
              <button 
                onClick={() => setQuickNoteOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Form to add a new fleeting thought */}
              <form onSubmit={handleSaveQuickNote} className="space-y-4 bg-slate-50/50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concept Brief (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Brainstorming new layout idea, potential feature..."
                    value={quickNoteTitle}
                    onChange={(e) => setQuickNoteTitle(e.target.value)}
                    className="w-full text-xs font-medium font-sans p-3 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fleeting Raw Thought</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="What's on your mind? Capture it unfiltered here..."
                    value={quickNoteContent}
                    onChange={(e) => setQuickNoteContent(e.target.value)}
                    className="w-full text-xs font-medium font-sans p-3 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 dark:text-slate-200 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    {quickNoteSuccess && (
                      <div className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Saved to local deck</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!quickNoteContent.trim() && !quickNoteTitle.trim()}
                    className="bg-[#FF7A00] hover:bg-[#E06B00] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Archive Thought</span>
                  </button>
                </div>
              </form>

              {/* History list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans tracking-tight">Saved Fleeting Deck ({quickNotes.length})</h4>
                  <span className="text-[9px] text-slate-400 font-mono">Will be lost if browser cache is cleared.</span>
                </div>

                {quickNotes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-150 dark:border-slate-800/50 rounded-2xl flex flex-col items-center justify-center p-4">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-650 mb-2" />
                    <p className="text-xs text-slate-400 font-medium font-mono">Capture deck is empty. Fleeting thoughts are healthy!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {quickNotes.map((note) => (
                      <div 
                        key={note.id}
                        className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/65 flex flex-col justify-between gap-3 text-left hover:border-slate-200 dark:hover:border-slate-700/80 transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                              {note.title}
                            </span>
                            <span className="text-[9.5px] font-mono text-slate-400 dark:text-slate-500 shrink-0 font-bold uppercase">
                              {note.createdAt}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                            {note.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                          <button
                            onClick={(e) => handleConvertToTask(note, e)}
                            className="text-[10px] font-bold text-[#FF7A00] hover:text-[#E06B00] flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:underline"
                            title="Turn this note into an actionable task in your todo list"
                          >
                            <Zap className="w-3 h-3 fill-orange-200 text-[#FF7A00]" />
                            <span>Actionise Task (+15 XP)</span>
                          </button>
                          
                          <button
                            onClick={(e) => handleDeleteQuickNote(note.id, e)}
                            className="text-slate-450 dark:text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-lg cursor-pointer transition-colors"
                            title="Discard the thought"
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
