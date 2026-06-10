import { useState, FormEvent } from "react";
import { Goal } from "../types";
import { Target, Plus, CheckCircle, Circle, Flame, Sparkles, Trash2 } from "lucide-react";

interface GoalsViewProps {
  goals: Goal[];
  addGoal: (title: string, timeframe: "Weekly" | "Monthly" | "Yearly", category: string) => void;
  toggleGoalStatus: (id: string) => void;
  deleteGoal: (id: string) => void;
}

export default function GoalsView({
  goals,
  addGoal,
  toggleGoalStatus,
  deleteGoal
}: GoalsViewProps) {
  // Add goal states per column
  const [weeklyInput, setWeeklyInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [yearlyInput, setYearlyInput] = useState("");

  const handleAddGoalSubmit = (
    e: FormEvent, 
    timeframe: "Weekly" | "Monthly" | "Yearly", 
    inp: string, 
    setInp: (v: string) => void
  ) => {
    e.preventDefault();
    if (!inp.trim()) return;

    // Smart pick category
    let category = "General";
    const lower = inp.toLowerCase();
    if (lower.includes("video") || lower.includes("edit") || lower.includes("upload") || lower.includes("content")) {
      category = "Content Creation";
    } else if (lower.includes("code") || lower.includes("software") || lower.includes("frontend") || lower.includes("app")) {
      category = "Software Engineering";
    } else if (lower.includes("cyber") || lower.includes("security") || lower.includes("hack") || lower.includes("lab")) {
      category = "Cybersecurity";
    } else if (lower.includes("client") || lower.includes("business")) {
      category = "Business";
    }

    addGoal(inp.trim(), timeframe, category);
    setInp("");
  };

  // Group goals
  const weeklyGoals = goals.filter(g => g.timeframe === "Weekly");
  const monthlyGoals = goals.filter(g => g.timeframe === "Monthly");
  const yearlyGoals = goals.filter(g => g.timeframe === "Yearly");

  // Completion metrics
  const getCompletionStats = (list: Goal[]) => {
    if (list.length === 0) return 0;
    const completed = list.filter(g => g.completed).length;
    return Math.round((completed / list.length) * 100);
  };

  return (
    <div id="vision-board-viewport" className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div id="vision-board-header" className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Vision Board</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Map out high stakes objectives over Weekly, Monthly, and Yearly sprints.</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-[#FF7A00] border border-orange-100/50 px-4 py-2 rounded-xl text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Systems Beat Goals</span>
        </div>
      </div>

      {/* Vision Grid Columns */}
      <div id="vision-columns-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Goals Column */}
        <div id="weekly-goals-column" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF7A00]">
                  <Flame className="w-4 h-4 fill-orange-100" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Weekly Sprints</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                {getCompletionStats(weeklyGoals)}% DONE
              </span>
            </div>

            {/* Micro progress line */}
            <div className="w-full bg-slate-50 border border-slate-100/50 h-2 rounded-full overflow-hidden mb-5">
              <div 
                style={{ width: `${getCompletionStats(weeklyGoals)}%` }}
                className="bg-[#FF7A00] h-full rounded-full transition-all duration-300"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 mb-5 max-h-[350px] overflow-y-auto pr-1">
              {weeklyGoals.map((g) => (
                <div 
                  id={`goal-item-${g.id}`}
                  key={g.id}
                  className="p-3 bg-white hover:bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start justify-between gap-2.5 group transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleGoalStatus(g.id)}
                      className="mt-0.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-[#FF7A00]" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold leading-relaxed ${g.completed ? "line-through text-slate-400 font-medium" : "text-slate-700 font-bold"}`}>
                        {g.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 font-bold tracking-wider uppercase mt-1 block">
                        {g.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={(e) => handleAddGoalSubmit(e, "Weekly", weeklyInput, setWeeklyInput)} className="mt-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Add weekly sprint item..."
                value={weeklyInput}
                onChange={(e) => setWeeklyInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-3 text-[#FF7A00] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </form>
        </div>

        {/* Monthly Goals Column */}
        <div id="monthly-goals-column" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF7A00]/5 rounded-xl flex items-center justify-center text-[#FF7A00]">
                  <Target className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Monthly Anchors</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                {getCompletionStats(monthlyGoals)}% DONE
              </span>
            </div>

            {/* Micro progress line */}
            <div className="w-full bg-slate-50 border border-slate-100/50 h-2 rounded-full overflow-hidden mb-5">
              <div 
                style={{ width: `${getCompletionStats(monthlyGoals)}%` }}
                className="bg-[#FF7A00] h-full rounded-full transition-all duration-300"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 mb-5 max-h-[350px] overflow-y-auto pr-1">
              {monthlyGoals.map((g) => (
                <div 
                  id={`goal-item-${g.id}`}
                  key={g.id}
                  className="p-3 bg-white hover:bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start justify-between gap-2.5 group transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleGoalStatus(g.id)}
                      className="mt-0.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-[#FF7A00]" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold leading-relaxed ${g.completed ? "line-through text-slate-400 font-medium" : "text-slate-700 font-bold"}`}>
                        {g.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 font-bold tracking-wider uppercase mt-1 block">
                        {g.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={(e) => handleAddGoalSubmit(e, "Monthly", monthlyInput, setMonthlyInput)} className="mt-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Add monthly anchor item..."
                value={monthlyInput}
                onChange={(e) => setMonthlyInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-3 text-[#FF7A00] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </form>
        </div>

        {/* Yearly Goals Column */}
        <div id="yearly-goals-column" className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF7A00]/5 rounded-xl flex items-center justify-center text-[#FF7A00]">
                  <Target className="w-4 h-4 text-[#FF7A00]" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">Yearly Milestones</h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                {getCompletionStats(yearlyGoals)}% DONE
              </span>
            </div>

            {/* Micro progress line */}
            <div className="w-full bg-slate-50 border border-slate-100/50 h-2 rounded-full overflow-hidden mb-5">
              <div 
                style={{ width: `${getCompletionStats(yearlyGoals)}%` }}
                className="bg-[#FF7A00] h-full rounded-full transition-all duration-300"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 mb-5 max-h-[350px] overflow-y-auto pr-1">
              {yearlyGoals.map((g) => (
                <div 
                  id={`goal-item-${g.id}`}
                  key={g.id}
                  className="p-3 bg-white hover:bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start justify-between gap-2.5 group transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => toggleGoalStatus(g.id)}
                      className="mt-0.5 shrink-0 transition-colors cursor-pointer"
                    >
                      {g.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 hover:text-[#FF7A00]" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold leading-relaxed ${g.completed ? "line-through text-slate-400 font-medium" : "text-slate-700 font-bold"}`}>
                        {g.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 font-bold tracking-wider uppercase mt-1 block">
                        {g.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={(e) => handleAddGoalSubmit(e, "Yearly", yearlyInput, setYearlyInput)} className="mt-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Add yearly milestone item..."
                value={yearlyInput}
                onChange={(e) => setYearlyInput(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 pl-4 pr-10 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-3 text-[#FF7A00] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
