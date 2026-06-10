import { Skill } from "../types";
import { Star, GraduationCap, Flame, Dumbbell, ShieldAlert, Video, Palette, Code, Briefcase } from "lucide-react";

interface SkillsViewProps {
  skills: Skill[];
  onTrainSkill: (skillName: string) => void;
  userXP: number;
}

export default function SkillsView({
  skills,
  onTrainSkill,
  userXP
}: SkillsViewProps) {

  // Map icons dynamically
  const getSkillIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("design") || lower.includes("graphic")) return <Palette className="w-5 h-5 text-indigo-500" />;
    if (lower.includes("video") || lower.includes("animation")) return <Video className="w-5 h-5 text-[#FF7A00]" />;
    if (lower.includes("web") || lower.includes("app") || lower.includes("dev")) return <Code className="w-5 h-5 text-blue-500" />;
    if (lower.includes("cyber") || lower.includes("security")) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (lower.includes("leadership") || lower.includes("business")) return <Briefcase className="w-5 h-5 text-amber-500" />;
    return <GraduationCap className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div id="skills-hub-viewport" className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div id="skills-hub-header" className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Skills Hub</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Gain XP from completing real milestones or trigger practice rounds to advance limits.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-4 py-2 rounded-xl text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
          <span>Learn by Creating</span>
        </div>
      </div>

      {/* Main Grid containing Skills */}
      <div id="skills-card-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const isMaxed = skill.progress >= 100;

          return (
            <div 
              id={`skill-hub-card-${skill.name.replace(/\s+/g, "-")}`}
              key={skill.name}
              className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Icon & Level */}
                <div className="flex justify-between items-start mb-5">
                  <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl">
                    {getSkillIcon(skill.name)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF7A00] font-bold">
                      Rank {skill.level}
                    </span>
                    <h4 className="text-xs font-bold text-slate-400 font-sans mt-0.5">
                      {skill.level === 1 ? "Newbie" :
                       skill.level === 2 ? "Explorer" :
                       skill.level === 3 ? "Builder" :
                       skill.level === 4 ? "Professional" : "Master"}
                    </h4>
                  </div>
                </div>

                {/* Skill Name */}
                <div className="mb-4">
                  <h3 className="font-sans font-bold text-slate-800 text-base leading-snug">{skill.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">Primary Core Node Track</p>
                </div>

                {/* Progress Bar with numbers */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-xs font-sans font-bold">
                    <span className="text-slate-450">Mastery progress</span>
                    <span className="text-slate-800">{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, skill.progress)}%` }}
                      className="bg-[#FF7A00] h-full rounded-full transition-all duration-305"
                    />
                  </div>
                </div>
              </div>

              {/* Practice Loop Trigger Button */}
              <div>
                <button
                  onClick={() => onTrainSkill(skill.name)}
                  className={`w-full text-xs font-bold py-3 rounded-2xl border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isMaxed 
                      ? "bg-slate-50 border-slate-100 text-slate-400" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-[#FF7A00] hover:text-white hover:border-transparent"
                  }`}
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>{isMaxed ? "Maxed Block mastery!" : "Practice Skill (+15%)"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom informational box linking academy */}
      <div className="p-6 rounded-[28px] border border-slate-100 bg-slate-50 text-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold font-sans">Public Roadmap Active</h3>
          <p className="text-xs text-slate-500">
            Share student portals directly via the <strong>Mentor Academy</strong> portal to provide lessons and grade exercises.
          </p>
        </div>
        <div className="shrink-0 text-slate-500 text-xs font-mono font-bold bg-white border border-slate-100 py-1.5 px-3 rounded-xl">
          Student Traffic Enabled
        </div>
      </div>
    </div>
  );
}
