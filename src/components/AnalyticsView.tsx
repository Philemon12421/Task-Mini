import { Task, Skill } from "../types";
import { Clock, Flame, Award } from "lucide-react";

interface AnalyticsViewProps {
  tasks: Task[];
  skills: Skill[];
  streakDays: number;
  timeSpentToday: number;
}

export default function AnalyticsView({
  tasks,
  streakDays,
}: AnalyticsViewProps) {
  
  // Calculate completed stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Study hours logs across core disciplines
  const subjectTimeSpent = [
    { label: "Software Engineering & Coding", hours: 40, color: "bg-[#FF7A00]" },
    { label: "Cybersecurity & AD Hacking Labs", hours: 25, color: "bg-red-500" },
    { label: "Video Editing & Animation Rails", hours: 18, color: "bg-blue-500" },
    { label: "Business Administration", hours: 12, color: "bg-amber-500" }
  ];

  const barChartMax = 40;

  return (
    <div id="analytics-viewport" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div id="analytics-header" className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-400 font-sans font-medium">Statistical breakdown of focus sessions, skill achievements, and course progress.</p>
      </div>

      {/* Grid boxes */}
      <div id="analytics-bento-card-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-3">
              <Clock className="w-4 h-4 text-[#FF7A00]" />
              <span>Sprints Success Rate</span>
            </div>
            <h3 className="text-3xl font-extrabold font-sans text-slate-800 leading-none">{rate}%</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Milestones Completion Index</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-[#FF7A00] font-bold font-mono uppercase">
            {completedTasks} of {totalTasks} milestones processed
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-3">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-50" />
              <span>Discipline Streak</span>
            </div>
            <h3 className="text-3xl font-extrabold font-sans text-slate-800 leading-none">{streakDays} Days</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Active Gamified Streak Days</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-orange-500 font-bold font-mono uppercase">
            Multiplier active: 1.5x XP Boost
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-3">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Level Tier Status</span>
            </div>
            <h3 className="text-3xl font-extrabold font-sans text-slate-800 leading-none font-sans">Level 2</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Active Explorer Node</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-[#FF7A00] font-bold font-mono uppercase">
            3 Badges active in Academy shelf
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Time Allocated Hours */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm">Focus Hours Logged (Weekly)</h3>
              <p className="text-xs text-slate-400 font-medium font-sans">Hour log calculations across study disciplines.</p>
            </div>
            <span className="text-slate-400 font-mono text-xs font-bold">Total: 95h</span>
          </div>

          <div className="space-y-4">
            {subjectTimeSpent.map((subj) => {
              const perc = (subj.hours / barChartMax) * 100;
              return (
                <div key={subj.label} id={`analytics-chart-row-${subj.hours}`}>
                  <div className="flex justify-between text-xs text-slate-650 text-slate-700 font-bold mb-1.5">
                    <span>{subj.label}</span>
                    <span className="font-mono text-slate-450 text-slate-400 font-semibold">{subj.hours} Hours</span>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100/30 h-3 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${perc}%` }}
                      className={`${subj.color} h-full rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Ring Skill Graph overview representation */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-sans font-bold text-slate-800 text-sm">Mastery Distribution</h3>
              <p className="text-xs text-slate-400 font-medium font-sans font-medium">Visual dynamic skill progression distribution index.</p>
            </div>

            <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  className="stroke-[#FF7A00] fill-transparent"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * 0.15}
                  strokeLinecap="round"
                />
                
                <circle
                  cx="88"
                  cy="88"
                  r="54"
                  className="stroke-blue-500 fill-transparent"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * 0.25}
                  strokeLinecap="round"
                />

                <circle
                  cx="88"
                  cy="88"
                  r="38"
                  className="stroke-red-500 fill-transparent"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * 0.35}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute text-center text-xs font-mono font-bold text-slate-500">
                <span>9 Modules Active</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 text-[10px] font-mono font-bold text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded bg-[#FF7A00]" />
              <span>UI Design</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded bg-blue-550 bg-blue-500" />
              <span>Full Web</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded bg-red-500" />
              <span>Cyber</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
