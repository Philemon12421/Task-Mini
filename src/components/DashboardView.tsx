import { motion } from "motion/react";
import { Task, Goal, Skill, MotivationState } from "../types";
import { 
  CheckCircle2, Circle, Clock, Flame, BookOpen, ChevronRight, 
  Lightbulb, ShieldCheck, Video, RefreshCw, Zap
} from "lucide-react";
import { useState, FormEvent } from "react";

interface DashboardViewProps {
  tasks: Task[];
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
}

export default function DashboardView({
  tasks,
  goals,
  skills,
  motivation,
  streakDays,
  timeSpentToday,
  toggleTaskStatus,
  addQuickIdea,
  onRefreshMotivation,
  isLoadingMotivation,
  onNavigate
}: DashboardViewProps) {
  // Quick Idea state
  const [quickIdeaTitle, setQuickIdeaTitle] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const handleQuickIdeaSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quickIdeaTitle.trim()) return;
    addQuickIdea(quickIdeaTitle, "Captured quickly from your primary personal dashboard.");
    setQuickIdeaTitle("");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  };

  // Process numbers
  const todayTasks = tasks.filter(t => t.deadline === "2026-06-11" || t.id === "task-1" || t.id === "task-2");
  const completedTodayCount = todayTasks.filter(t => t.status === "Completed").length;
  const totalTodayCount = todayTasks.length;

  const numCompletedTotal = tasks.filter(t => t.status === "Completed").length;

  return (
    <div id="dashboard-viewport" className="space-y-8 max-w-6xl mx-auto">
      {/* Header section with Greeting and quick micro stats */}
      <div id="dashboard-greeting-hero" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-slate-900 tracking-tight">
            Good Morning Philemon 👋
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Your daily operating system is ready to grow your future.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("planner")}
            className="flex items-center gap-2 bg-white px-5 py-2.5 border border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm hover:bg-[#F8F9FB] active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#FF7A00]" />
            <span>Open Timer</span>
          </button>
        </div>
      </div>

      {/* Grid: High Stakes Stats Cards */}
      <div id="dashboard-bento-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Streak */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF7A00] shrink-0 font-bold">
            🔥
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Streak</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{streakDays} Days</h3>
          </div>
        </div>

        {/* Metric 2: Time Used Today */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
            <Clock className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Focus Time</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 mt-0.5">{timeSpentToday.toFixed(1)} hrs</h3>
          </div>
        </div>

        {/* Metric 3: Task Progress */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0 font-bold text-sm">
            ✓
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tasks Done</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 mt-0.5">
              {completedTodayCount} / {totalTodayCount || "3"}
            </h3>
          </div>
        </div>

        {/* Metric 4: Multiplier/XP Booster */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF7A00] shrink-0">
            <Zap className="w-5 h-5 text-[#FF7A00] fill-orange-200" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Focus Multiplier</p>
            <h3 className="text-xl font-bold font-sans text-slate-800 mt-0.5">1.5x Boost</h3>
          </div>
        </div>
      </div>

      {/* Bento Layout Row 1: Focus Tasks & Stoic Motivation Banner */}
      <div id="dashboard-main-row" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Today's Focus Checklist (7 cols) */}
        <div id="dashboard-col-focus" className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Today's Focus</h2>
              <p className="text-xs text-slate-400 font-mono">Gain XP bonuses for each checkoff.</p>
            </div>
            <button 
              onClick={() => onNavigate("tasks")}
              className="text-[#FF7A00] font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Manage all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {todayTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No tasks mapped out for today.</p>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div 
                  id={`dashboard-task-card-${task.id}`}
                  key={task.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    task.status === "Completed" 
                      ? "bg-slate-50/50 border-slate-100 text-slate-400" 
                      : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className="text-slate-200 hover:text-[#FF7A00] transition-colors shrink-0 cursor-pointer"
                    >
                      {task.status === "Completed" ? (
                        <div className="w-5 h-5 rounded-md border-2 border-[#FF7A00] flex items-center justify-center bg-[#FF7A00]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200" />
                      )}
                    </button>
                    <span className={`text-sm font-medium leading-snug truncate ${
                      task.status === "Completed" ? "line-through text-slate-400" : "text-slate-700 font-semibold"
                    }`}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 uppercase tracking-widest">
                      {task.category || "TASKS"}
                    </span>
                    <span className="text-[11px] font-bold font-mono text-emerald-500">+{task.xpReward} XP</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Stoic / Personal Motivation Widget (5 cols) */}
        <div id="dashboard-col-stoic" className="lg:col-span-5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[28px] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
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

          <div className="mt-6 border-t border-slate-700/60 pt-4 space-y-3 relative z-10 text-xs">
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

      {/* Layout Row 2: Planner Snippet & Quick Idea Capture Bento */}
      <div id="dashboard-row-bento-2" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Idea Capture (1 Col) */}
        <div id="dashboard-quick-idea" className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7A00]">
                <Lightbulb className="w-4 h-4 text-[#FF7A00] fill-orange-100" />
              </div>
              <h3 className="font-sans font-bold text-slate-800">Quick Idea Vault</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-normal">
              Enter any flash startup or video concept. AI will auto-categorize inside Vault.
            </p>

            <form onSubmit={handleQuickIdeaSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Ex: API scanner SaaS..."
                value={quickIdeaTitle}
                onChange={(e) => setQuickIdeaTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:border-transparent text-slate-800 font-medium"
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
            <p className="text-emerald-500 font-mono text-[10px] text-center mt-3 font-semibold">
              ✓ Added to Vault! Check 'Idea Vault'.
            </p>
          )}
        </div>

        {/* Video Creator Hub Queue Snippet (1 Col) */}
        <div id="dashboard-creator-snippet" className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF7A00]">
                  <Video className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800">Active Video Reels</h3>
              </div>
              <button 
                onClick={() => onNavigate("content")}
                className="text-xs font-semibold text-[#FF7A00] hover:underline cursor-pointer"
              >
                Go to Hub
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-1">
                  <p className="font-semibold text-slate-800 truncate">Discipline Beats Motivation</p>
                  <span className="text-[10px] text-slate-400 font-mono">YouTube</span>
                </div>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">READY</span>
              </div>

              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-1">
                  <p className="font-semibold text-slate-800 truncate">Football Midfielders</p>
                  <span className="text-[10px] text-slate-400 font-mono">Shorts</span>
                </div>
                <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">EDITING</span>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-[10px] font-mono italic text-center mt-3">
            Active channels tracked in creator hub.
          </p>
        </div>

        {/* Micro Skills Bento Preview (1 Col) */}
        <div id="dashboard-skills-snippet" className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100/10 flex items-center justify-center text-[#FF7A00]">
                  <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800" onClick={() => onNavigate("skills")}>Master Skills</h3>
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
                    <span className="font-semibold text-slate-700">{s.name}</span>
                    <span className="font-mono text-slate-400 font-bold">Lvl {s.level} ({s.progress}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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
            Unlock badge progress via skills roadmaps.
          </p>
        </div>

      </div>
    </div>
  );
}
