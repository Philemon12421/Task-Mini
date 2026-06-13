import React, { useState, useRef, useEffect, FormEvent } from "react";
import {
  Share2, Linkedin, Twitter, Instagram, Youtube, Trash2,
  Plus, Calendar, Check, Loader2, Sparkles, UploadCloud,
  ShieldCheck, Send, Clock
} from "lucide-react";

interface ConnectedAccount {
  platform: "Twitter" | "LinkedIn" | "Instagram" | "YouTube";
  username: string;
  connected: boolean;
  avatar?: string;
  apiKey?: string;
  apiSecret?: string;
}

interface DistributionPost {
  id: string;
  text: string;
  mediaName?: string;
  platforms: string[];
  status: "Draft" | "Scheduled" | "Published";
  scheduledTime?: string;
  publishedAt?: string;
}

interface SocialScheduleViewProps {
  onAddXP: (xp: number) => void;
}

// Parses "YYYY-MM-DD HH:MM" (24h, from datetime-local) or "YYYY-MM-DD HH:MM AM/PM" (seed data)
function parseScheduledDate(str?: string): Date | null {
  if (!str) return null;
  const match = str.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  const [, datePart, hourStr, minStr, meridiem] = match;
  let hour = parseInt(hourStr, 10);
  if (meridiem) {
    const m = meridiem.toUpperCase();
    if (m === "PM" && hour !== 12) hour += 12;
    if (m === "AM" && hour === 12) hour = 0;
  }
  const d = new Date(`${datePart}T${String(hour).padStart(2, "0")}:${minStr}:00`);
  return isNaN(d.getTime()) ? null : d;
}

// Human readable countdown like "in 2h 14m" or "in 35m"
function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Publishing...";
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "in <1m";
  if (diffMins < 60) return `in ${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  if (diffHours < 24) return `in ${diffHours}h ${remMins}m`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays}d ${diffHours % 24}h`;
}

// Local datetime string suitable for <input type="datetime-local"> min attribute
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SocialScheduleView({ onAddXP }: SocialScheduleViewProps) {
  // Connected Accounts State
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(() => {
    const saved = localStorage.getItem("tm_social_accounts");
    return saved ? JSON.parse(saved) : [
      { platform: "Twitter", username: "@philemon_dev", connected: true, avatar: "PK" },
      { platform: "LinkedIn", username: "Philemon Kusi", connected: true, avatar: "PK" },
      { platform: "Instagram", username: "", connected: false },
      { platform: "YouTube", username: "", connected: false }
    ];
  });

  // Schedule Posts State
  const [posts, setPosts] = useState<DistributionPost[]>(() => {
    const saved = localStorage.getItem("tm_social_posts");
    return saved ? JSON.parse(saved) : [
      {
        id: "post-1",
        text: "Building 'Task Mini' - a premium minimalist Personal Operating System engineered for flow state. Check out Cmd+K keyboard control maps!",
        platforms: ["Twitter", "LinkedIn"],
        status: "Published",
        publishedAt: "2026-06-10 11:20 AM"
      },
      {
        id: "post-2",
        text: "Discipline is the fuel of elite technical execution. Action points today are simple: shut the tabs, open terminal tunnels, code 90mins without blinking.",
        platforms: ["LinkedIn"],
        status: "Scheduled",
        scheduledTime: "2026-06-11 09:00 AM"
      }
    ];
  });

  // Form states
  const [postText, setPostText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Twitter", "LinkedIn"]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaName, setMediaName] = useState<string>("");

  // Distribution Animation Active States
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionLogs, setDistributionLogs] = useState<string[]>([]);
  const [distributionProgress, setDistributionProgress] = useState(0);

  // Secret Keys / Dialog configurations
  const [activeConfigPlatform, setActiveConfigPlatform] = useState<string | null>(null);
  const [configHandle, setConfigHandle] = useState("");
  const [configClientId, setConfigClientId] = useState("");
  const [configClientSecret, setConfigClientSecret] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Live clock — drives countdowns and the auto-publish check
  const [now, setNow] = useState(() => new Date());

  // Save states
  useEffect(() => {
    localStorage.setItem("tm_social_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("tm_social_posts", JSON.stringify(posts));
  }, [posts]);

  // Tick the clock every 15s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Real-time scheduler: auto-publish any scheduled post whose time has arrived
  useEffect(() => {
    const due = posts.filter(p => {
      if (p.status !== "Scheduled") return false;
      const target = parseScheduledDate(p.scheduledTime);
      return target && target.getTime() <= now.getTime();
    });
    if (due.length === 0) return;

    const stamp = now.toISOString().replace("T", " ").substring(0, 16);
    setPosts(prev => prev.map(p =>
      due.some(d => d.id === p.id)
        ? { ...p, status: "Published", publishedAt: stamp, scheduledTime: undefined }
        : p
    ));
    due.forEach(p => onAddXP(50 * p.platforms.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Handle Drag-n-drop file uploading
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setMediaFile(file);
      setMediaName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      setMediaName(file.name);
    }
  };

  // Launch direct popup connection flow
  const handleConnectRequest = (platform: "Twitter" | "LinkedIn" | "Instagram" | "YouTube") => {
    setActiveConfigPlatform(platform);
    setConfigHandle("");
    setConfigClientId("");
    setConfigClientSecret("");
  };

  const handleSaveApiConfiguration = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConfigPlatform) return;

    setAuthLoading(true);

    // Simulate standard OAuth / validation delay
    setTimeout(() => {
      const fallbackUsername = activeConfigPlatform === "Instagram" ? "@philemon_insta" : "@philemon_youtube_dev";
      const resolvedUsername = configHandle.trim() || fallbackUsername;

      setAccounts(prev => prev.map(acc => {
        if (acc.platform === activeConfigPlatform) {
          return {
            ...acc,
            connected: true,
            username: resolvedUsername,
            apiKey: configClientId || "oauth_client_prod_829a",
            apiSecret: configClientSecret || "oauth_secret_prod_128z"
          };
        }
        return acc;
      }));

      // Award build level XP for establishing integration
      onAddXP(100);
      setAuthLoading(false);
      setActiveConfigPlatform(null);
    }, 1500);
  };

  const handleDisconnect = (platform: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.platform === platform) {
        return { ...acc, connected: false, username: "", apiKey: "", apiSecret: "" };
      }
      return acc;
    }));
    setSelectedPlatforms(prev => prev.filter(p => p !== platform));
  };

  const togglePlatformSelection = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };

  // Run Distribution Queue Animation
  const handlePublishNow = async () => {
    if (!postText.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one active distribution channel.");
      return;
    }

    setIsDistributing(true);
    setDistributionProgress(0);
    setDistributionLogs([]);

    const logSteps = [
      "Initializing secure publisher engine...",
      "Handlers validated. Checking secure tokens...",
    ];

    selectedPlatforms.forEach(p => {
      logSteps.push(`Connecting to ${p} Open API endpoints...`);
      logSteps.push(`[${p}] Packaging payload body data...`);
      if (mediaName) {
        logSteps.push(`[${p}] Processing media binary: ${mediaName}`);
      }
      logSteps.push(`[${p}] Writing status update...`);
      logSteps.push(`[${p}] Published successfully. Record ID: ${p.toLowerCase()}_rx_${Math.floor(Math.random() * 90000 + 10000)}`);
    });

    logSteps.push("Universal distribution completed. Distributed successfully to selected targets.");

    // Sequence logs with timeouts to depict a realistic multi-channel server publish
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setDistributionLogs(prev => [...prev, logSteps[currentStep]]);
        setDistributionProgress(Math.floor(((currentStep + 1) / logSteps.length) * 100));
        currentStep++;
      } else {
        clearInterval(interval);

        // Add post to history
        const newPost: DistributionPost = {
          id: `post-${Date.now()}`,
          text: postText,
          platforms: [...selectedPlatforms],
          status: "Published",
          mediaName: mediaName || undefined,
          publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        setPosts(prev => [newPost, ...prev]);
        setPostText("");
        setMediaFile(null);
        setMediaName("");
        onAddXP(50 * selectedPlatforms.length); // 50 XP per channel

        setTimeout(() => {
          setIsDistributing(false);
          setDistributionProgress(0);
        }, 1500);
      }
    }, 450);
  };

  const handleSchedulePost = () => {
    if (!postText.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one active distribution channel.");
      return;
    }
    if (!scheduleTime) {
      alert("Please set a date and time to schedule this post.");
      return;
    }

    const target = parseScheduledDate(scheduleTime.replace('T', ' '));
    if (!target || target.getTime() <= Date.now()) {
      alert("Please pick a date and time in the future.");
      return;
    }

    const newPost: DistributionPost = {
      id: `post-${Date.now()}`,
      text: postText,
      platforms: [...selectedPlatforms],
      status: "Scheduled",
      mediaName: mediaName || undefined,
      scheduledTime: scheduleTime.replace('T', ' ')
    };

    setPosts(prev => [newPost, ...prev]);
    setPostText("");
    setScheduleTime("");
    setMediaFile(null);
    setMediaName("");
    onAddXP(30); // 30 XP for scheduling ahead
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Soonest upcoming scheduled post, for the live status banner
  const upcoming = posts
    .filter(p => p.status === "Scheduled")
    .map(p => ({ post: p, target: parseScheduledDate(p.scheduledTime) }))
    .filter((x): x is { post: DistributionPost; target: Date } => x.target !== null)
    .sort((a, b) => a.target.getTime() - b.target.getTime())[0];

  return (
    <div id="social-scheduler-viewport" className="space-y-8 max-w-5xl mx-auto">

      {/* Viewport Header */}
      <div id="social-scheduler-header" className="pb-5 border-b border-orange-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">Social Distribution System</h1>
          <p className="text-xs text-slate-400 font-sans font-medium mt-1">
            Connect your platform handles and broadcast or schedule posts across channels in real time.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-mono font-bold bg-orange-500/10 text-[#FF7A00] uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#FF7A00] rounded-full animate-pulse" />
            Active Multi-Channel Broker
          </span>
          {upcoming && (
            <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Next post {formatCountdown(upcoming.target, now)}
            </span>
          )}
        </div>
      </div>

      {/* Grid containing Channel Bridge & Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Hand: Publisher Module (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[36px] shadow-[0_20px_50px_rgba(255,122,0,0.02),0_24px_50px_-16px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_60px_rgba(255,122,0,0.03),0_28px_60px_-12px_rgba(15,23,42,0.06)] transition-all flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
              <Share2 className="w-5 h-5 text-[#FF7A00]" />
              <h2 className="text-base font-bold text-slate-800 font-sans">Draft Distribution Payload</h2>
            </div>

            {/* Input Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">Write Post Body</label>
                <textarea
                  disabled={isDistributing}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share what you are coding, building, or learning... (#buildinpublic)"
                  rows={4}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] focus:bg-white text-xs text-slate-800 font-medium leading-relaxed transition-all"
                />
                <div className="flex justify-between mt-1 text-[10px] font-mono font-bold text-slate-400">
                  <span>No emojis permitted. Pure text and hashtags.</span>
                  <span className={postText.length > 280 ? "text-[#FF7A00]" : ""}>
                    {postText.length} characters
                  </span>
                </div>
              </div>

              {/* Target Platforms Picker */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">Target Channels</label>
                <div className="flex flex-wrap gap-2.5">
                  {accounts.map((acc) => {
                    const isSelected = selectedPlatforms.includes(acc.platform);
                    const isConnected = acc.connected;
                    return (
                      <button
                        key={acc.platform}
                        type="button"
                        disabled={!isConnected || isDistributing}
                        onClick={() => togglePlatformSelection(acc.platform)}
                        title={!isConnected ? `Connect ${acc.platform} in Connection Nodes to enable` : undefined}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all border ${
                          !isConnected
                            ? "opacity-45 bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                            : isSelected
                              ? "bg-slate-900 border-transparent text-white shadow-md shadow-slate-950/10"
                              : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        }`}
                      >
                        {acc.platform === "Twitter" && <Twitter className="w-3.5 h-3.5 text-current" />}
                        {acc.platform === "LinkedIn" && <Linkedin className="w-3.5 h-3.5 text-current" />}
                        {acc.platform === "Instagram" && <Instagram className="w-3.5 h-3.5 text-current" />}
                        {acc.platform === "YouTube" && <Youtube className="w-3.5 h-3.5 text-current" />}
                        <span>{acc.platform}</span>
                        {isConnected && isSelected && <Check className="w-3.5 h-3.5 text-[#FF7A00] stroke-[3.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag and Drop File Uploder */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">Attach Media File</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="p-5 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-slate-50/50 cursor-pointer transition-all"
                  onClick={() => document.getElementById("post-file-upload")?.click()}
                >
                  <input
                    id="post-file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                  />
                  <UploadCloud className="w-7 h-7 text-[#FF7A00] mb-2" />
                  {mediaName ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">{mediaName}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMediaFile(null); setMediaName(""); }}
                        className="text-[10px] font-mono text-red-500 font-bold hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-600">Drag or click to attach image or video</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Maximum size 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Planning Schedule options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">Schedule Release Date</label>
                  <input
                    disabled={isDistributing}
                    type="datetime-local"
                    value={scheduleTime}
                    min={toLocalInputValue(now)}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 font-medium font-mono"
                  />
                  {scheduleTime && (
                    (() => {
                      const target = parseScheduledDate(scheduleTime.replace('T', ' '));
                      if (!target) return null;
                      return (
                        <p className="text-[10px] font-mono text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Will publish {formatCountdown(target, now)}
                        </p>
                      );
                    })()
                  )}
                </div>
                <div className="flex items-end gap-2.5">
                  {scheduleTime ? (
                    <button
                      type="button"
                      disabled={isDistributing || !postText.trim()}
                      onClick={handleSchedulePost}
                      className="w-full bg-slate-900 text-white hover:bg-[#FF7A00] p-3 rounded-2xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Post</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isDistributing || !postText.trim()}
                      onClick={handlePublishNow}
                      className="w-full bg-[#FF7A00] text-white hover:bg-slate-900 p-3 rounded-2xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Distribute Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Distribution Terminal Output Log */}
            {isDistributing && (
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#FF7A00]">
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Distributing concurrently...
                  </span>
                  <span>{distributionProgress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${distributionProgress}%` }}
                    className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F45] transition-all duration-300"
                  />
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl font-mono text-[9px] text-[#FF9F45]/90 space-y-1 h-[140px] overflow-y-auto leading-normal">
                  {distributionLogs.map((log, idx) => (
                    <p key={idx} className="opacity-95">{log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Connected Channels list & API token setting (5 columns) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Account Matrix */}
          <div className="bg-white p-8 rounded-[36px] shadow-[0_20px_50px_rgba(255,122,0,0.02),0_24px_50px_-16px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_60px_rgba(255,122,0,0.03),0_28px_60px_-12px_rgba(15,23,42,0.06)] transition-all">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-bold text-slate-800 font-sans">Connection Nodes</h2>
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">OAuth Gateway</span>
            </div>

            <div className="space-y-4">
              {accounts.map((acc) => {
                return (
                  <div
                    key={acc.platform}
                    className="p-4 rounded-2xl bg-slate-50/75 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        acc.connected ? "bg-orange-500/10 text-[#FF7A00]" : "bg-slate-100 text-slate-400"
                      }`}>
                        {acc.platform === "Twitter" && <Twitter className="w-4 h-4 text-current" />}
                        {acc.platform === "LinkedIn" && <Linkedin className="w-4 h-4 text-current" />}
                        {acc.platform === "Instagram" && <Instagram className="w-4 h-4 text-current" />}
                        {acc.platform === "YouTube" && <Youtube className="w-4 h-4 text-current" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{acc.platform}</p>
                        <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">
                          {acc.connected ? acc.username : "Offline Node"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {acc.connected ? (
                        <button
                          onClick={() => handleDisconnect(acc.platform)}
                          className="hover:bg-red-50 hover:text-red-600 text-[10px] font-mono font-bold bg-slate-100 text-slate-400 border border-slate-200/40 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnectRequest(acc.platform)}
                          className="hover:bg-slate-900 hover:text-white hover:border-transparent text-[10px] font-mono font-bold text-[#FF7A00] bg-orange-500/10 border border-orange-500/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection configuration overlay dialog */}
          {activeConfigPlatform && (
            <div className="bg-slate-900 text-white p-7 rounded-[32px] border border-slate-800 shadow-md">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF7A00] uppercase">
                  Connect {activeConfigPlatform}
                </span>
                <button
                  onClick={() => setActiveConfigPlatform(null)}
                  className="text-slate-400 hover:text-white font-mono text-[10px]"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveApiConfiguration} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">Account Handle</label>
                  <input
                    type="text"
                    required
                    placeholder={`@your-${activeConfigPlatform.toLowerCase()}-handle`}
                    value={configHandle}
                    onChange={(e) => setConfigHandle(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">OAuth Client ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter integration client ID Key..."
                    value={configClientId}
                    onChange={(e) => setConfigClientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">OAuth Client Secret</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter integration client secret token..."
                    value={configClientSecret}
                    onChange={(e) => setConfigClientSecret(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#FF7A00] hover:bg-[#FF9F45] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exchanging Handshake...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Connect Securely</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Developer Credentials Explainer */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5 leading-none mb-1">
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
              Secure API Gateway
            </h3>
            <p className="text-[11px] text-slate-400">
              Task Mini connects through popups and stores access tokens directly in your secure local sandboxed browser vault. No intermediate servers read your telemetry log.
            </p>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold">
              <span>SANDBOX ENGINE v1.2</span>
              <span className="text-[#FF7A00]">ONLINE</span>
            </div>
          </div>

        </div>
      </div>

      {/* History log block */}
      <div className="p-8 bg-white rounded-[36px] shadow-[0_20px_50px_rgba(255,122,0,0.02),0_24px_50px_-16px_rgba(15,23,42,0.04)]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800 font-sans">Distribution History Logs</h2>
          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Archive</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm border border-dashed border-slate-100 rounded-3xl">
            Nothing distributed yet. Draft a post above to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const target = post.status === "Scheduled" ? parseScheduledDate(post.scheduledTime) : null;
              return (
                <div
                  key={post.id}
                  className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-xs font-medium text-slate-800 leading-normal font-sans pr-4">{post.text}</p>

                    {post.mediaName && (
                      <span className="inline-block text-[9px] font-mono bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                        {post.mediaName}
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[10px] text-slate-400 font-mono font-bold">
                      {post.platforms.map(p => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1 bg-white border border-slate-100 px-2 py-0.5 rounded text-slate-500 hover:text-slate-800"
                        >
                          {p === "Twitter" && <Twitter className="w-2.5 h-2.5" />}
                          {p === "LinkedIn" && <Linkedin className="w-2.5 h-2.5" />}
                          {p === "Instagram" && <Instagram className="w-2.5 h-2.5" />}
                          {p === "YouTube" && <Youtube className="w-2.5 h-2.5" />}
                          <span>{p}</span>
                        </span>
                      ))}
                      <span>•</span>
                      {post.status === "Published" ? (
                        <span>Published {post.publishedAt}</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#FF7A00]">
                          <Clock className="w-3 h-3" />
                          {post.scheduledTime} ({target ? formatCountdown(target, now) : "pending"})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-xl border ${
                      post.status === "Published"
                        ? "bg-orange-500/10 text-[#FF7A00] border-transparent"
                        : "bg-slate-100 text-slate-500 border-transparent"
                    }`}>
                      {post.status}
                    </span>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 hover:text-red-500 text-slate-300 transition-colors cursor-pointer"
                      title="Remove from history logger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
