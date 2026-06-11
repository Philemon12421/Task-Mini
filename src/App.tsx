import { useState, useEffect, FormEvent } from "react";
import { Task, Goal, Skill, TeamMember, Idea, ContentChannel, MotivationState, ContentVideo, TaskStatus, Category } from "./types";
import { Plus, Flame, Calendar, Sparkles, CheckCircle2, Check, Menu } from "lucide-react";
import { 
  INITIAL_TASKS, INITIAL_GOALS, INITIAL_SKILLS, INITIAL_TEAM, INITIAL_IDEAS, 
  INITIAL_CHANNELS, INITIAL_MOTIVATION, HOURLY_TIMELINE 
} from "./data";

// Component imports
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import TasksView from "./components/TasksView";
import PlannerView from "./components/PlannerView";
import GoalsView from "./components/GoalsView";
import SkillsView from "./components/SkillsView";
import AcademyView from "./components/AcademyView";
import TeamView from "./components/TeamView";
import IdeaVaultView from "./components/IdeaVaultView";
import ContentHubView from "./components/ContentHubView";
import MotivationView from "./components/MotivationView";
import AnalyticsView from "./components/AnalyticsView";
import SocialScheduleView from "./components/SocialScheduleView";
import CommandPalette from "./components/CommandPalette";

export default function App() {
  // --------------------------------------------------
  // Command Palette & Deep Focus State
  // --------------------------------------------------
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDeepFocus, setIsDeepFocus] = useState<boolean>(() => {
    return localStorage.getItem("tm_deep_focus") === "true";
  });

  // --------------------------------------------------
  // Fresh Restart Trigger: Sets state to 0 XP & Level 0
  // --------------------------------------------------
  useEffect(() => {
    const isReset = localStorage.getItem("tm_v3_fresh_reset");
    if (!isReset) {
      localStorage.clear();
      // Set initial fresh state parameters
      localStorage.setItem("tm_v3_fresh_reset", "true");
      localStorage.setItem("tm_user_xp", "0");
      localStorage.setItem("tm_unlocked_badges", "[]");
      localStorage.setItem("tm_deep_focus", "false");
      // Load baseline non-completed tasks
      const defaultUncompletedTasks = INITIAL_TASKS.map(t => ({ ...t, status: t.status === "Completed" ? "Todo" as const : t.status }));
      localStorage.setItem("tm_tasks", JSON.stringify(defaultUncompletedTasks));
      window.location.reload();
    }
  }, []);

  // --------------------------------------------------
  // Routing / View Tab State
  // --------------------------------------------------
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // --------------------------------------------------
  // Core Profile & XP Gamification States
  // --------------------------------------------------
  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem("tm_user_xp");
    return saved ? Number(saved) : 0; // starts afresh with 0 XP
  });

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem("tm_unlocked_badges");
    return saved ? JSON.parse(saved) : []; // starts afresh with no badges
  });

  const streakDays = 32;
  const timeSpentToday = 4.4; // hours

  // Compute Level
  const getUserLevel = (xp: number) => {
    if (xp < 500) return { level: 0, title: "Acolyte Initiate" };
    if (xp < 1200) return { level: 1, title: "Newbie Builder" };
    if (xp < 2500) return { level: 2, title: "Explorer Node" };
    if (xp < 4500) return { level: 3, title: "Discipline Architect" };
    if (xp < 7000) return { level: 4, title: "Vibe Engineer" };
    return { level: 5, title: "Master Architect" };
  };

  const userLevel = getUserLevel(userXP);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem("tm_user_xp", userXP.toString());
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem("tm_unlocked_badges", JSON.stringify(unlockedBadges));
  }, [unlockedBadges]);

  useEffect(() => {
    localStorage.setItem("tm_deep_focus", isDeepFocus.toString());
    if (isDeepFocus) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDeepFocus]);

  // Hook for Cmd+K Command Palette
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // --------------------------------------------------
  // Header-integrated 'Add Task' States & NLP Parser
  // --------------------------------------------------
  const [headerTaskText, setHeaderTaskText] = useState("");
  const [isHeaderFocused, setIsHeaderFocused] = useState(false);
  const [headerSuccess, setHeaderSuccess] = useState(false);

  const parseHeaderTask = (input: string) => {
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

    // 3. Simple Offset Matcher (Defaulting to Today 2026-06-11)
    let offsetDays = 0;
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
          const todayIndex = 4; // Thursday June 11, 2026
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

    const refDate = new Date("2026-06-11");
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

    if (!title) title = input.trim() || "";

    return { title, priority, category, deadline };
  };

  const handleHeaderTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!headerTaskText.trim()) return;

    const parsed = parseHeaderTask(headerTaskText);
    addTask({
      title: parsed.title || headerTaskText.trim(),
      priority: parsed.priority,
      category: parsed.category,
      deadline: parsed.deadline,
      status: "Todo",
      tags: ["HeaderQuickAdd"],
      xpReward: parsed.priority === "High" ? 30 : parsed.priority === "Medium" ? 20 : 10
    });

    setHeaderTaskText("");
    setHeaderSuccess(true);
    setTimeout(() => {
      setHeaderSuccess(false);
    }, 2000);
  };

  const addXP = (amount: number) => {
    setUserXP((prev) => {
      const next = prev + amount;
      const prevLvl = getUserLevel(prev);
      const nextLvl = getUserLevel(next);
      if (nextLvl.level > prevLvl.level) {
        setTimeout(() => {
          alert(`🎉 LEVEL UP! Philemon upgraded to Level ${nextLvl.level}: "${nextLvl.title}"! Keep moving limits.`);
        }, 500);
      }
      return next;
    });
  };

  const unlockBadge = (badge: string) => {
    if (!unlockedBadges.includes(badge)) {
      setUnlockedBadges(prev => [...prev, badge]);
    }
  };

  // --------------------------------------------------
  // Checklist Tasks Workspace States
  // --------------------------------------------------
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tm_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  useEffect(() => {
    localStorage.setItem("tm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTaskData: Omit<Task, "id">) => {
    const fresh: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [fresh, ...prev]);
    addXP(20);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = (id: string, st: TaskStatus) => {
    setTasks(prev => prev.map((t) => {
      if (t.id === id) {
        if (st === "Completed" && t.status !== "Completed") {
          addXP(t.xpReward);
        }
        return { ...t, status: st };
      }
      return t;
    }));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map((t) => {
      if (t.id === id) {
        const completing = t.status !== "Completed";
        if (completing) {
          addXP(t.xpReward);
          return { ...t, status: "Completed" };
        } else {
          return { ...t, status: "Todo" };
        }
      }
      return t;
    }));
  };

  // --------------------------------------------------
  // Daily Planner Calendar States
  // --------------------------------------------------
  const [timeline, setTimeline] = useState(() => {
    const saved = localStorage.getItem("tm_timeline");
    return saved ? JSON.parse(saved) : HOURLY_TIMELINE;
  });

  useEffect(() => {
    localStorage.setItem("tm_timeline", JSON.stringify(timeline));
  }, [timeline]);

  const toggleTimelineItem = (index: number) => {
    setTimeline((prev: any) => prev.map((item: any, idx: number) => {
      if (idx === index) {
        const isCompleting = !item.completed;
        if (isCompleting) addXP(10);
        return { ...item, completed: isCompleting };
      }
      return item;
    }));
  };

  // --------------------------------------------------
  // Vision board goals States
  // --------------------------------------------------
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("tm_goals");
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  useEffect(() => {
    localStorage.setItem("tm_goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = (title: string, timeframe: "Weekly" | "Monthly" | "Yearly", category: string) => {
    const fresh: Goal = {
      id: `g-${Date.now()}`,
      title,
      timeframe,
      completed: false,
      category: category as any
    };
    setGoals(prev => [...prev, fresh]);
    addXP(15);
  };

  const toggleGoalStatus = (id: string) => {
    setGoals(prev => prev.map((g) => {
      if (g.id === id) {
        const completing = !g.completed;
        if (completing) addXP(35);
        return { ...g, completed: completing };
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --------------------------------------------------
  // Skill matrix progress states
  // --------------------------------------------------
  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem("tm_skills");
    return saved ? JSON.parse(saved) : INITIAL_SKILLS;
  });

  useEffect(() => {
    localStorage.setItem("tm_skills", JSON.stringify(skills));
  }, [skills]);

  const trainSkill = (skillName: string) => {
    setSkills(prev => prev.map((s) => {
      if (s.name === skillName) {
        let nextProg = s.progress + 15;
        let nextLvl = s.level;
        if (nextProg >= 100) {
          nextProg = 0;
          nextLvl = Math.min(5, nextLvl + 1);
          setTimeout(() => {
            alert(`🔥 SKILL RANK BUMPED! Philemon scaled "${skillName}" to Rank ${nextLvl}!`);
          }, 300);
          addXP(100);
        } else {
          addXP(15);
        }
        return { ...s, progress: nextProg, level: nextLvl };
      }
      return s;
    }));
  };

  // --------------------------------------------------
  // Team Associates workspace States
  // --------------------------------------------------
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("tm_team");
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });

  useEffect(() => {
    localStorage.setItem("tm_team", JSON.stringify(team));
  }, [team]);

  const inviteMember = (name: string, email: string, role: "CEO" | "Manager" | "Member" | "Viewer") => {
    const fresh: TeamMember = {
      id: `m-${Date.now()}`,
      name,
      email,
      role,
      avatar: name[0].toUpperCase(),
      activeTaskCount: 0
    };
    setTeam(prev => [...prev, fresh]);
    addXP(25);
  };

  const removeMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  // --------------------------------------------------
  // Idea Vault core States
  // --------------------------------------------------
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem("tm_ideas");
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  useEffect(() => {
    localStorage.setItem("tm_ideas", JSON.stringify(ideas));
  }, [ideas]);

  const addIdea = (title: string, desc?: string) => {
    const fresh: Idea = {
      id: `idea-${Date.now()}`,
      title,
      description: desc,
      category: "Unsorted",
      tags: ["Draft"],
      createdAt: new Date().toISOString().split("T")[0]
    };
    setIdeas(prev => [fresh, ...prev]);
    addXP(10);
  };

  const categorizeIdea = async (id: string) => {
    const target = ideas.find(i => i.id === id);
    if (!target) return;

    try {
      const res = await fetch("/api/ideas/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: target.title, description: target.description }),
      });
      const data = await res.json();

      setIdeas(prev => prev.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            category: data?.category || "Startup Ideas",
            tags: Array.isArray(data?.tags) ? data.tags : ["Draft"],
            commentary: data?.commentary || "Draft idea recorded."
          };
        }
        return i;
      }));
      addXP(40);
    } catch (e) {
      console.error(e);
    }
  };

  const removeIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const addQuickIdea = (title: string, desc: string) => {
    addIdea(title, desc);
  };

  // --------------------------------------------------
  // Content Channels workspace States
  // --------------------------------------------------
  const [channels, setChannels] = useState<ContentChannel[]>(() => {
    const saved = localStorage.getItem("tm_channels");
    return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
  });

  useEffect(() => {
    localStorage.setItem("tm_channels", JSON.stringify(channels));
  }, [channels]);

  const addVideoToChannel = (channelId: string, video: Omit<ContentVideo, "id">) => {
    const fresh: ContentVideo = {
      ...video,
      id: `v-${Date.now()}`
    };

    setChannels(prev => prev.map((ch) => {
      if (ch.id === channelId) {
        return { ...ch, queue: [fresh, ...ch.queue] };
      }
      return ch;
    }));
    addXP(15);
  };

  const removeVideoFromChannel = (channelId: string, videoId: string) => {
    setChannels(prev => prev.map((ch) => {
      if (ch.id === channelId) {
        return { ...ch, queue: ch.queue.filter(v => v.id !== videoId) };
      }
      return ch;
    }));
  };

  const updateVideoInChannel = (channelId: string, videoId: string, updatedFields: Partial<ContentVideo>) => {
    setChannels(prev => prev.map((ch) => {
      if (ch.id === channelId) {
        return {
          ...ch,
          queue: ch.queue.map(v => v.id === videoId ? { ...v, ...updatedFields } : v)
        };
      }
      return ch;
    }));
  };

  // --------------------------------------------------
  // Stoic Motivation states matching Gemini fetches
  // --------------------------------------------------
  const [motivation, setMotivation] = useState<MotivationState>(() => {
    const saved = localStorage.getItem("tm_motivation");
    return saved ? JSON.parse(saved) : INITIAL_MOTIVATION;
  });
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  useEffect(() => {
    localStorage.setItem("tm_motivation", JSON.stringify(motivation));
  }, [motivation]);

  const refreshMotivationAndCategory = async (cat: MotivationState["category"]) => {
    setLoadingMotivation(true);
    try {
      const res = await fetch("/api/motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat })
      });
      const data = await res.json();
      setMotivation({
        quote: data?.quote || "Discipline is choosing between what you want now and what you want most.",
        author: data?.author || "Abraham Lincoln",
        videoTopic: data?.videoTopic || "How to Build Unshakeable Self-Discipline (Atomic Habits Blueprint)",
        articleTitle: data?.articleTitle || "Navigating Friction: Why Boring Work is the Secret to Expertise",
        challenge: data?.challenge || "Write code or study with absolutely zero social media tabs open.",
        category: cat
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMotivation(false);
    }
  };

  const handleRefreshDefaultMotivation = () => {
    refreshMotivationAndCategory(motivation.category || "Discipline");
  };

  // --------------------------------------------------
  // Layout views toggler router helper
  // --------------------------------------------------
  const renderActiveTab = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardView
            tasks={tasks}
            addTask={addTask}
            goals={goals}
            skills={skills}
            motivation={motivation}
            streakDays={streakDays}
            timeSpentToday={timeSpentToday}
            toggleTaskStatus={toggleTaskStatus}
            addQuickIdea={addQuickIdea}
            onRefreshMotivation={handleRefreshDefaultMotivation}
            isLoadingMotivation={loadingMotivation}
            onNavigate={setCurrentTab}
            isDeepFocus={isDeepFocus}
          />
        );
      case "tasks":
        return (
          <TasksView
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
            updateTaskStatus={updateTaskStatus}
            toggleTaskStatus={toggleTaskStatus}
          />
        );
      case "planner":
        return (
          <PlannerView
            onAddXP={addXP}
            timelineData={timeline}
            toggleTimelineItem={toggleTimelineItem}
          />
        );
      case "goals":
        return (
          <GoalsView
            goals={goals}
            addGoal={addGoal}
            toggleGoalStatus={toggleGoalStatus}
            deleteGoal={deleteGoal}
          />
        );
      case "skills":
        return (
          <SkillsView
            skills={skills}
            onTrainSkill={trainSkill}
            userXP={userXP}
          />
        );
      case "academy":
        return (
          <AcademyView
            onAddXP={addXP}
            onUnlockBadge={unlockBadge}
            unlockedBadges={unlockedBadges}
          />
        );
      case "team":
        return (
          <TeamView
            team={team}
            onInviteMember={inviteMember}
            onRemoveMember={removeMember}
          />
        );
      case "ideas":
        return (
          <IdeaVaultView
            ideas={ideas}
            onAddIdea={addIdea}
            onCategorizeIdea={categorizeIdea}
            onRemoveIdea={removeIdea}
          />
        );
      case "content":
        return (
          <ContentHubView
            channels={channels}
            onAddVideoToChannel={addVideoToChannel}
            onRemoveVideoFromChannel={removeVideoFromChannel}
            onUpdateVideoInChannel={updateVideoInChannel}
          />
        );
      case "schedule":
        return (
          <SocialScheduleView onAddXP={addXP} />
        );
      case "analytics":
        return (
          <AnalyticsView
            tasks={tasks}
            skills={skills}
            streakDays={streakDays}
            timeSpentToday={timeSpentToday}
          />
        );
      case "motivation":
        return (
          <MotivationView
            motivation={motivation}
            onRefreshMotivationAndCategory={refreshMotivationAndCategory}
            onAddXP={addXP}
            isLoading={loadingMotivation}
          />
        );
      default:
        return (
          <div className="py-20 text-center text-slate-400 text-sm">
            View under assembly structure. Navigate using standard side panel items.
          </div>
        );
    }
  };

  return (
    <div
      id="personal-os-app-root"
      className={`flex min-h-screen transition-colors duration-1000 ${
        isDeepFocus ? "bg-[#0B0F19] text-slate-100" : "bg-[#F8F9FB] text-[#1E293B]"
      }`}
    >
      {/* Collapsible Left Sidebar Navigation */}
      {!isDeepFocus && (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          userXP={userXP}
          userLevel={userLevel}
          streakDays={streakDays}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Viewport Content Area */}
      <main
        id="main-viewport-content"
        className={`flex-1 overflow-y-auto px-4 md:px-8 py-6 h-screen flex flex-col transition-all duration-1000 ${
          isDeepFocus ? "bg-[#0B0F19]" : "bg-[#F8F9FB]"
         }`}
      >
        {/* Universal Sticky Header Bar */}
        <div
          id="universal-top-header"
          className={`flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between pb-4 mb-6 border-b shrink-0 transition-all ${
            isDeepFocus ? "border-slate-800/60" : "border-slate-100"
          }`}
        >
          {/* Row 1 / Left indicator trail & focus switch on mobile */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Trigger Menu */}
              {!isDeepFocus && (
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                  aria-label="Toggle Navigation Panel"
                >
                  <Menu className="w-4 h-4 text-slate-800" />
                </button>
              )}

              {isDeepFocus && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF7A00]"></span>
                </span>
              )}
              <span
                className={`text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${
                  isDeepFocus ? "text-orange-400" : "text-slate-400"
                }`}
              >
                {isDeepFocus ? "⚡ Focus Mode" : `System // ${currentTab}`}
              </span>
            </div>

            {/* Mobile Deep Focus Switch */}
            <button
              onClick={() => setIsDeepFocus(!isDeepFocus)}
              className={`md:hidden px-3 py-1.5 rounded-xl text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isDeepFocus
                  ? "bg-gradient-to-r from-orange-500 to-[#FF7A00] text-white border-transparent"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{isDeepFocus ? "✨ Exit Focus" : "🎯 Focus"}</span>
            </button>
          </div>

          {/* Quick Task Capture input field */}
          <form
            onSubmit={handleHeaderTaskSubmit}
            className="relative w-full md:flex-1 md:max-w-md lg:max-w-lg xl:max-w-xl md:mx-4"
          >
            <div
              className={`relative flex items-center h-10 rounded-2xl border transition-all ${
                headerSuccess
                  ? "bg-orange-500/10 border-orange-300 animate-pulse"
                  : isHeaderFocused
                  ? "bg-white dark:bg-slate-900 border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.1)]"
                  : isDeepFocus
                  ? "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 shadow-sm"
              }`}
            >
              {/* Left Plus/Sparkles Icon */}
              <div className="pl-3.5 pr-2 flex items-center justify-center text-slate-400 shrink-0">
                {headerSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-[#FF7A00] animate-bounce" />
                ) : (
                  <Plus className={`w-4 h-4 transition-colors ${isHeaderFocused ? "text-[#FF7A00]" : "text-slate-400"}`} />
                )}
              </div>

              <input
                type="text"
                placeholder={
                  headerSuccess
                    ? "Task Captured! +20 XP ✨"
                    : 'Quick add task (e.g. "Fix layout high tomorrow Software Engineering")...'
                }
                value={headerTaskText}
                onChange={(e) => setHeaderTaskText(e.target.value)}
                onFocus={() => setIsHeaderFocused(true)}
                onBlur={() => setTimeout(() => setIsHeaderFocused(false), 200)}
                disabled={headerSuccess}
                className={`w-full bg-transparent text-xs font-medium focus:outline-none placeholder-slate-400/90 ${
                  headerSuccess ? "text-[#FF7A00] font-bold" : "text-slate-850 dark:text-slate-100"
                }`}
              />

              {/* Submitting indicator or clear/submit button */}
              {headerTaskText.trim() && !headerSuccess && (
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-xl bg-[#FF7A00] text-white text-[10px] font-bold font-mono shadow hover:bg-orange-600 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Enter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Real-time NLP Feedback dropdown panel when typing */}
            {isHeaderFocused && headerTaskText.trim() && (
              <div
                className={`absolute z-50 left-0 right-0 mt-2 p-3.5 rounded-2xl border shadow-xl flex flex-col gap-2 transition-all duration-300 backdrop-blur-md ${
                  isDeepFocus
                    ? "bg-slate-950/95 border-slate-800 text-slate-200"
                    : "bg-white/95 border-slate-200/60 text-slate-755"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider font-bold">
                  <span className="text-[#FF7A00] flex items-center gap-1 uppercase">
                    <Sparkles className="w-3.5 h-3.5 fill-orange-100 dark:fill-orange-950" />
                    <span>Smart Live Parser</span>
                  </span>
                  <span className="text-slate-400 uppercase">Interactive Preview</span>
                </div>

                {/* Render inline parsing output badges */}
                {(() => {
                  const parsed = parseHeaderTask(headerTaskText);
                  return (
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wider">Priority</span>
                        <span className="text-xs font-extrabold text-[#FF7A00] flex items-center gap-1">
                          <Flame className={`w-3.5 h-3.5 ${parsed.priority === 'High' ? "fill-orange-200 text-red-500 animate-pulse" : "text-orange-400"}`} />
                          <span>{parsed.priority}</span>
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wider">Category</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {parsed.category}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-orange-500/5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wider">Due Date</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono text-[10px]">{parsed.deadline}</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-1 text-[9px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span>💡 Tip: Type priority, category & dates inline</span>
                  <span className="font-bold text-[#FF7A00]">Press Enter to Save</span>
                </div>
              </div>
            )}
          </form>

          {/* Right Action buttons (Search & Focus switch) on desktop */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Core Cmd+K indicator */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[10px] font-mono transition-all cursor-pointer ${
                isDeepFocus
                  ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-705"
                  : "bg-white border-slate-200/50 text-slate-400 hover:text-slate-600 hover:border-slate-350 shadow-sm"
              }`}
            >
              <span>Search Workspace</span>
              <kbd className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[8px] font-bold">⌘K</kbd>
            </button>

            {/* Desktop Deep Focus Switch */}
            <button
              id="deep-focus-switch"
              onClick={() => setIsDeepFocus(!isDeepFocus)}
              className={`hidden md:flex px-4 py-2 rounded-2xl text-xs font-bold font-sans transition-all items-center gap-2 cursor-pointer shadow-sm ${
                isDeepFocus
                  ? "bg-gradient-to-r from-orange-500 to-[#FF7A00] text-white hover:scale-[1.03] active:scale-95 border-transparent"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>{isDeepFocus ? "✨ Exit Focus Mode" : "🎯 Deep Focus"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic active view body viewport */}
        <div
          className={`flex-1 transition-all duration-700 ${
            isDeepFocus ? "max-w-4xl mx-auto w-full pt-4" : "w-full"
          }`}
        >
          {renderActiveTab()}
        </div>
      </main>

      {/* Shortcuts Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        goals={goals}
        ideas={ideas}
        onNavigate={setCurrentTab}
      />
    </div>
  );
}
