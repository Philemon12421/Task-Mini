import { useState, useEffect, useRef } from "react";
import { Search, Compass, CheckSquare, Target, Lightbulb, CornerDownLeft } from "lucide-react";
import { Task, Goal, Idea } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  ideas: Idea[];
  onNavigate: (tab: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Navigation" | "Tasks" | "Goals" | "Ideas";
  icon: any;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  tasks,
  goals,
  ideas,
  onNavigate
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Core navigation commands
  const navigationItems: Omit<CommandItem, "id">[] = [
    { title: "Jump to Dashboard", category: "Navigation", icon: Compass, action: () => onNavigate("dashboard") },
    { title: "Jump to Tasks Workspace", category: "Navigation", icon: CheckSquare, action: () => onNavigate("tasks") },
    { title: "Jump to Daily Planner & Tracker", category: "Navigation", icon: Compass, action: () => onNavigate("planner") },
    { title: "Jump to Goals Vision Board", category: "Navigation", icon: Target, action: () => onNavigate("goals") },
    { title: "Jump to Skill Matrix", category: "Navigation", icon: Compass, action: () => onNavigate("skills") },
    { title: "Jump to Learning Academy", category: "Navigation", icon: Compass, action: () => onNavigate("academy") },
    { title: "Jump to Team Collaboration Space", category: "Navigation", icon: Compass, action: () => onNavigate("team") },
    { title: "Jump to Idea Vault", category: "Navigation", icon: Lightbulb, action: () => onNavigate("ideas") },
    { title: "Jump to Creator Hub", category: "Navigation", icon: Compass, action: () => onNavigate("content") },
    { title: "Jump to Analytics Performance", category: "Navigation", icon: Compass, action: () => onNavigate("analytics") },
    { title: "Jump to Stoic Catalyst Center", category: "Navigation", icon: Compass, action: () => onNavigate("motivation") }
  ];

  // Compile all searchable commands
  const allItems: CommandItem[] = [
    ...navigationItems.map((n, idx) => ({ ...n, id: `nav-${idx}` })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      subtitle: `Task • Priority: ${t.priority} • Status: ${t.status}`,
      category: "Tasks" as const,
      icon: CheckSquare,
      action: () => {
        onNavigate("tasks");
      }
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: g.title,
      subtitle: `Goal • Timeframe: ${g.timeframe} • ${g.completed ? "Completed" : "Active"}`,
      category: "Goals" as const,
      icon: Target,
      action: () => {
        onNavigate("goals");
      }
    })),
    ...ideas.map((i) => ({
      id: `idea-${i.id}`,
      title: i.title,
      subtitle: `Idea • Category: ${i.category}`,
      category: "Ideas" as const,
      icon: Lightbulb,
      action: () => {
        onNavigate("ideas");
      }
    }))
  ];

  // Filter list by query
  const filteredItems = allItems.filter((item) => {
    const s = `${item.title} ${item.subtitle || ""} ${item.category}`.toLowerCase();
    return s.includes(query.toLowerCase());
  });

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle outside click & escape layout
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle keyboard binds inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-start justify-center pt-[12vh] p-4"
      onClick={onClose}
    >
      <div
        id="command-palette-window"
        className="w-full max-w-xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100/80 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search keywords (e.g., 'tasks', 'portfolio')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-mono bg-slate-200/60 hover:bg-slate-200/80 text-slate-500 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Stream list */}
        <div
          ref={listRef}
          className="flex-1 max-h-[350px] overflow-y-auto p-2 space-y-0.5"
        >
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-8 h-8 text-slate-350 mx-auto mb-2 text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">No results found for "{query}"</p>
              <p className="text-[10px] text-slate-350 font-mono mt-1">Try searching for other builder concepts.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  id={`cmd-palette-item-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{item.title}</p>
                      {item.subtitle && (
                        <p className={`text-[10px] mt-0.5 truncate font-medium ${
                          isSelected ? "text-slate-300" : "text-slate-400"
                        }`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg ${
                      isSelected
                        ? "bg-white/15 text-white/90 border border-white/10"
                        : "bg-slate-100 text-slate-400 border border-slate-200/30"
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-white/80 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts strip */}
        <div className="border-t border-slate-100/80 bg-slate-50/50 px-5 py-3.5 flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>⏎ Select</span>
          </div>
          <span className="text-[#FF7A00]/90">Linear Speed OS</span>
        </div>
      </div>
    </div>
  );
}
