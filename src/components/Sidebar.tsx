import { motion } from "motion/react";
import { 
  Home, CheckSquare, Calendar, Target, Award, PlayCircle, Users, Lightbulb, 
  Video, BarChart3, Flame, Settings, Star, Share2, X
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userXP: number;
  userLevel: { level: number; title: string };
  streakDays: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userXP, 
  userLevel, 
  streakDays,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "planner", label: "Planner & Tracker", icon: Calendar },
    { id: "goals", label: "Goals (Vision Board)", icon: Target },
    { id: "skills", label: "Skill Roadmaps", icon: Star },
    { id: "academy", label: "Academy (Mentors)", icon: Award },
    { id: "team", label: "Team Collaboration", icon: Users },
    { id: "ideas", label: "Idea Vault", icon: Lightbulb },
    { id: "content", label: "Content Creator Hub", icon: Video },
    { id: "schedule", label: "Social Scheduler", icon: Share2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "motivation", label: "Motivation Center", icon: Flame },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300"
        />
      )}

      <aside 
        id="sidebar-container" 
        className={`bg-white border-r border-slate-100 flex flex-col h-screen fixed md:sticky top-0 z-50 md:z-auto transition-transform duration-300 ${
          isMobileOpen 
            ? "translate-x-0 w-64" 
            : "-translate-x-full md:translate-x-0 w-64"
        } left-0 shrink-0`}
      >
        {/* Brand Section */}
        <div id="sidebar-logo-lockup" className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF9F45] flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <span className="text-base font-extrabold select-none">✓</span>
            </div>
            <span className="font-bold text-xl tracking-tight uppercase text-slate-800">Task Mini</span>
          </div>

          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-800" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav id="sidebar-navigation" className="flex-1 overflow-y-auto px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 text-left cursor-pointer ${
                  isActive 
                    ? "bg-[#FF7A00]/10 text-[#FF7A00] font-semibold" 
                    : "hover:bg-slate-50 text-slate-500 font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? "text-[#FF7A00]" : "text-slate-400"
                }`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Gamified Profile & Progress */}
        <div id="sidebar-profile-card" className="mx-4 my-2 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1.5 font-bold">
            <span className="uppercase tracking-wide">Level {userLevel.level} XP</span>
            <span className="text-[#FF7A00]">{userXP} / {userLevel.level === 0 ? 500 : userLevel.level * 1000}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (userXP / (userLevel.level === 0 ? 500 : userLevel.level * 1000)) * 100)}%` }}
              className="bg-[#FF7A00] h-full rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Footer Philemon Card Block */}
        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                PK
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">Philemon</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">CEO | Drenchack Tech</div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 bg-orange-50 text-[#FF7A00] px-1.5 py-1 rounded-lg text-[10px] font-bold shrink-0">
              <Flame className="w-3.5 h-3.5 text-[#FF7A00] fill-orange-100" />
              <span>{streakDays}d</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
