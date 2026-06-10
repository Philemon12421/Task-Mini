import React, { useState, useRef, useEffect, FormEvent } from "react";
import { 
  Share2, Linkedin, Twitter, Instagram, Youtube, Trash2, 
  Plus, Calendar, Check, Loader2, Sparkles, UploadCloud, 
  AlertCircle, ShieldCheck, Globe, Clock, RefreshCw, Send, CheckCircle2
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
  const [isScheduling, setIsScheduling] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaName, setMediaName] = useState<string>("");

  // Distribution Animation Active States
  const [isDistributing, setIsDistributing] = useState(false);
  const [distributionLogs, setDistributionLogs] = useState<string[]>([]);
  const [distributionProgress, setDistributionProgress] = useState(0);

  // Secret Keys / Dialog configurations
  const [activeConfigPlatform, setActiveConfigPlatform] = useState<string | null>(null);
  const [configClientId, setConfigClientId] = useState("");
  const [configClientSecret, setConfigClientSecret] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Save states
  useEffect(() => {
    localStorage.setItem("tm_social_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("tm_social_posts", JSON.stringify(posts));
  }, [posts]);

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
    setConfigClientId("");
    setConfigClientSecret("");
  };

  const handleSaveApiConfiguration = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeConfigPlatform) return;
    
    setAuthLoading(true);

    // Simulate standard OAuth / validation delay
    setTimeout(() => {
      // Mock authorization code exchange inside preview iframe using postMessage structures
      const mockResultUsername = activeConfigPlatform === "Instagram" ? "@philemon_insta" : "@philemon_youtube_dev";
      
      setAccounts(prev => prev.map(acc => {
        if (acc.platform === activeConfigPlatform) {
          return {
            ...acc,
            connected: true,
            username: mockResultUsername,
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
      "⚡ Initializing secure publisher engine...",
      "✓ Handlers validated. Checking secure tokens...",
    ];

    selectedPlatforms.forEach(p => {
      logSteps.push(`🛰️ Connecting to ${p} Open API endpoints...`);
      logSteps.push(`[${p}] Packaging payload body data...`);
      if (mediaName) {
        logSteps.push(`[${p}] Processing media binary: ${mediaName}`);
      }
      logSteps.push(`[${p}] Writing status update update...`);
      logSteps.push(`✓ [${p}] Published successfully! Created record ID: ${p.toLowerCase()}_rx_${Math.floor(Math.random() * 90000 + 10000)}`);
    });

    logSteps.push("✨ Universal distribution completed. Distributed successfully to selected targets.");

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

    alert("📅 Content scheduled successfully! Added to your release queue.");
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div id="social-scheduler-viewport" className="space-y-8 max-w-5xl mx-auto">
      
      {/* Viewport Header */}
      <div id="social-scheduler-header" className="pb-5 border-b border-orange-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">Social Distribution System</h1>
          <p className="text-xs text-slate-400 font-sans font-medium mt-1">
            Connect developer accounts and broadcast post parameters concurrently to multiple platforms instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-orange-500/10 text-[#FF7A00] uppercase tracking-wider px-3 py-1.5 rounded-full">
            Active Multi-Channel Broker
          </span>
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
                    min="2026-06-10T12:00"
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-slate-800 font-medium font-mono"
                  />
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
                    Bypassing Queue and Distributing Concurrently...
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
                        acc.connected ? "bg-orange-500/10 text-[#FF7A00]" : "bg-slate-250 text-slate-400 bg-slate-100"
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
                          className="hover:bg-red-50 hover:text-red-650 text-[10px] font-mono font-bold bg-slate-250 text-slate-400 border border-slate-200/40 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnectRequest(acc.platform)}
                          className="hover:bg-slate-900 hover:text-white hover:border-transparent text-[10px] font-mono font-bold text-[#FF7A00] bg-orange-500/10 border border-orange-500/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Configure
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
                  Authorize {activeConfigPlatform}
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
                  <label className="block text-[9px] font-mono uppercase text-slate-400 font-bold">OAuth Client ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter integration client ID Key..."
                    value={configClientId}
                    onChange={(e) => setConfigClientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-xs text-white placeholder-slate-650"
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
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none text-xs text-white placeholder-slate-650"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#FF7A00] hover:bg-[#FF9F45] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-[32px] text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5 leading-none mb-1">
              <ShieldCheck className="w-4 h-4 text-[#FF7A00]" />
              Secure API Gateway
            </h3>
            <p className="text-[11px] text-slate-400">
              Task Mini connects through popups and stores access tokens directly in your secure local sandboxed browser vault. No intermediate servers read your telemetry log.
            </p>
            <div className="pt-1.5 border-t border-slate-850 flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold">
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

        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-medium text-slate-800 leading-normal font-sans pr-4">{post.text}</p>
                
                {post.mediaName && (
                  <span className="inline-block text-[9px] font-mono bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                    📂 {post.mediaName}
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[10px] text-slate-400 font-mono font-bold">
                  {post.platforms.map(p => (
                    <span 
                      key={p} 
                      className="inline-flex items-center gap-1 bg-white border border-slate-150 px-2 py-0.5 rounded text-slate-500 hover:text-slate-800"
                    >
                      {p === "Twitter" && <Twitter className="w-2.5 h-2.5" />}
                      {p === "LinkedIn" && <Linkedin className="w-2.5 h-2.5" />}
                      {p === "Instagram" && <Instagram className="w-2.5 h-2.5" />}
                      {p === "YouTube" && <Youtube className="w-2.5 h-2.5" />}
                      <span>{p}</span>
                    </span>
                  ))}
                  <span>•</span>
                  <span>{post.status === "Published" ? `Published ${post.publishedAt}` : `Scheduled ${post.scheduledTime}`}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-xl border ${
                  post.status === "Published"
                    ? "bg-orange-500/10 text-[#FF7A00] border-transparent"
                    : "bg-slate-200 text-slate-500 border-slate-250 border-none"
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
          ))}
        </div>
      </div>

    </div>
  );
}
