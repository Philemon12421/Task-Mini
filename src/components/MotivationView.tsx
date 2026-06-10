import { useState } from "react";
import { MotivationState } from "../types";
import { Flame, RefreshCw, Youtube, BookOpen, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

interface MotivationViewProps {
  motivation: MotivationState;
  onRefreshMotivationAndCategory: (category: MotivationState["category"]) => Promise<void>;
  onAddXP: (xp: number) => void;
  isLoading: boolean;
}

export default function MotivationView({
  motivation,
  onRefreshMotivationAndCategory,
  onAddXP,
  isLoading
}: MotivationViewProps) {
  const [activeCategory, setActiveCategory] = useState<MotivationState["category"]>(motivation.category || "Discipline");
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const categories: MotivationState["category"][] = [
    "Discipline",
    "Cybersecurity",
    "Entrepreneurship",
    "Coding",
    "Success"
  ];

  const handleCategorySwitch = async (cat: MotivationState["category"]) => {
    setActiveCategory(cat);
    setChallengeCompleted(false);
    await onRefreshMotivationAndCategory(cat);
  };

  const handleCompleteChallenge = () => {
    if (challengeCompleted) return;
    setChallengeCompleted(true);
    onAddXP(50);
    alert("Daily discipline challenge complete! Earned +50 XP.");
  };

  return (
    <div id="motivation-center-viewport" className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div id="motivation-header" className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Stoic Catalyst</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Channel discipline directly into coding, business architecture, and cybersecurity labs.</p>
        </div>

        {/* Gemini Trigger button */}
        <button
          disabled={isLoading}
          onClick={() => onRefreshMotivationAndCategory(activeCategory)}
          className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 hover:border-transparent px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 self-start transition-colors cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-current" />
          ) : (
            <RefreshCw className="w-4 h-4 text-current" />
          )}
          <span>{isLoading ? "Consulting..." : "Fetch Stoic Mindset"}</span>
        </button>
      </div>

      {/* Category selector strip */}
      <div id="motivation-cats" className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySwitch(cat)}
            className={`px-4 py-2.5 border text-xs font-bold rounded-2xl transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-slate-800 text-white border-transparent"
                : "bg-white border-slate-100 text-slate-650 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>{cat}</span>
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-[32px] py-20 text-center shadow-sm">
          <Loader2 className="w-10 h-10 text-[#FF7A00] animate-spin mx-auto mb-3" />
          <h3 className="font-sans font-bold text-slate-700 text-base">Gathering mindset patterns...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans leading-relaxed">
            Gemini is drafting active discipline challenges and preparing tailored study quotes based on active parameters.
          </p>
        </div>
      ) : (
        <div id="motivation-deck-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main big block Quote board (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900 text-white p-7 rounded-[32px] border border-slate-800 shadow-md flex flex-col justify-between relative overflow-hidden h-[330px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full filter blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-mono font-bold tracking-widest text-orange-400 uppercase bg-orange-500/10 border border-orange-400/10 px-3 py-1 rounded-lg">
                {activeCategory} Pillar Quote
              </span>
              <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>

            <p className="text-lg leading-relaxed text-slate-100 font-semibold font-sans mt-6 italic pl-4 border-l-2 border-[#FF7A00]">
              "{motivation.quote}"
            </p>

            <p className="text-xs text-slate-400 font-mono text-right font-bold mt-4">
              — {motivation.author}
            </p>

            <div className="mt-6 border-t border-slate-800 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold">
              <span>CATALYST CENTRE MODULE</span>
              <span className="text-orange-400/80">STOIC SYSTEM</span>
            </div>
          </div>

          {/* Activity Cards sidebar board (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* YouTube recommended search concept */}
            <div className="bg-white p-6 border border-slate-100 rounded-[32px] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0 border border-red-100/30">
                <Youtube className="w-5 h-5 fill-red-50 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Suggested Video Search</p>
                <p className="font-bold text-xs text-slate-800 mt-1.5 leading-relaxed">{motivation.videoTopic}</p>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(motivation.videoTopic)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex text-[11px] font-bold text-[#FF7A00] hover:underline mt-2.5 items-center gap-1 cursor-pointer"
                >
                  <span>Launch video query</span>
                  <Youtube className="w-3.5 h-3.5 text-current" />
                </a>
              </div>
            </div>

            {/* Technical Article link suggestion */}
            <div className="bg-white p-6 border border-slate-100 rounded-[32px] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-550 text-blue-500 shrink-0 border border-blue-100/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Recommended Study Reading</p>
                <p className="font-bold text-xs text-slate-800 mt-1.5 leading-relaxed line-clamp-2">{motivation.articleTitle}</p>
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(motivation.articleTitle)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block text-[11px] font-bold text-[#FF7A00] hover:underline mt-2.5 cursor-pointer"
                >
                  Search scientific abstract →
                </a>
              </div>
            </div>

          </div>

          {/* Daily Active Mindset Challenge full row */}
          <div className={`col-span-full border p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
            challengeCompleted
              ? "bg-green-50/50 border-green-100"
              : "bg-white border-slate-100 hover:border-slate-200"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                challengeCompleted ? "bg-green-50 border-green-100/50 text-green-500" : "bg-orange-50 border-orange-100/50 text-orange-500"
              }`}>
                <Flame className={`w-5 h-5 ${challengeCompleted ? "fill-green-100/20" : "fill-orange-100/20"}`} />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                  Daily Catalyst Mission
                </span>
                <p className={`font-sans font-bold mt-1.5 text-sm ${
                  challengeCompleted ? "line-through text-slate-400 font-semibold" : "text-slate-700"
                }`}>
                  {motivation.challenge}
                </p>
                <span className="text-[10px] font-mono text-slate-400 block mt-1">Award: <strong className="text-green-600">+50 XP</strong> • Resets daily</span>
              </div>
            </div>

            <button
              disabled={challengeCompleted}
              onClick={handleCompleteChallenge}
              className={`text-xs font-bold py-3 px-6 rounded-2xl transition-all font-sans tracking-wide self-stretch md:self-auto flex items-center justify-center gap-2 cursor-pointer ${
                challengeCompleted
                  ? "bg-green-50 border border-green-100 text-green-700 cursor-default"
                  : "bg-slate-50 border border-slate-100 text-slate-700 hover:bg-[#FF7A00] hover:text-white hover:border-transparent shadow-sm"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-current" />
              <span>{challengeCompleted ? "STRICTLY LOCKED IN" : "Verify Challenge Completion"}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
