import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, ShieldAlert, Award, Calendar, CheckSquare, Activity, VolumeX } from "lucide-react";
import { motion } from "motion/react";

interface PlannerViewProps {
  onAddXP: (xp: number) => void;
  timelineData: { time: string; activity: string; completed: boolean }[];
  toggleTimelineItem: (index: number) => void;
}

export default function PlannerView({
  onAddXP,
  timelineData,
  toggleTimelineItem
}: PlannerViewProps) {
  // Pomodoro timer states
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [sessionCount, setSessionCount] = useState(2);
  const [focusedMinutesTotal, setFocusedMinutesTotal] = useState(50);

  // Focus sound
  const [soundTrack, setSoundTrack] = useState("Lo-Fi Study Beats");
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // Time ticker ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Visualizer bar array
  const visualizerBars = Array.from({ length: 18 }, () => Math.floor(Math.random() * 80) + 20);

  // Manage count
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Completed!
            setIsActive(false);
            if (!isBreak) {
              // Gained focus session XP!
              onAddXP(30);
              setSessionCount(prevCount => prevCount + 1);
              setFocusedMinutesTotal(prevTotal => prevTotal + 25);
              alert("🔥 Fantastic work, Philemon! Session completed. Earned +30 XP. Time for a 5-minute breather!");
              // Go to break
              setIsBreak(true);
              return 5 * 60;
            } else {
              alert("☀️ Break over. Time to lock back in!");
              setIsBreak(false);
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isBreak]);

  const handleStartPause = () => {
    setIsActive(!isActive);
    setIsSoundPlaying(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsSoundPlaying(false);
    setSecondsLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const skipSession = () => {
    setIsActive(false);
    setIsSoundPlaying(false);
    if (!isBreak) {
      setIsBreak(true);
      setSecondsLeft(5 * 60);
    } else {
      setIsBreak(false);
      setSecondsLeft(25 * 60);
    }
  };

  // Convert seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Sound selection tracks
  const tracks = [
    "Lo-Fi Study Beats",
    "Cyber Defense White Noise",
    "Football Stadium Crowd Volumizer",
    "Nature Rain Forest Aura",
    "Deep Focus Coding Synthwave"
  ];

  const percentageLeft = (secondsLeft / (isBreak ? 5 * 60 : 25 * 60)) * 100;

  return (
    <div id="planner-tracker-board" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      
      {/* LEFT AREA: Pomodoro Focus Chamber (5 columns) */}
      <section id="pomodoro-chamber" className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">

        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full ${
                isBreak ? "bg-green-50 text-green-600" : "bg-[#FF7A00]/10 text-[#FF7A00]"
              }`}>
                {isBreak ? "💆 Break Mode" : "🎯 Intense Focus"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Activity className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
              <span>Interval #{sessionCount + 1}</span>
            </div>
          </div>

          {/* Radial Timer SVG Container */}
          <div id="pomodoro-svg-clock" className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
            {/* SVG circle stroke representation */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Slate base trail */}
              <circle
                cx="96"
                cy="96"
                r="86"
                className="stroke-slate-50 fill-transparent"
                strokeWidth="6"
              />
              {/* Dynamic Orange Progress bar */}
              <motion.circle
                cx="96"
                cy="96"
                r="86"
                className={`${isBreak ? "stroke-green-500" : "stroke-[#FF7A00]"} fill-transparent`}
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 86}
                strokeDashoffset={2 * Math.PI * 86 * (1 - percentageLeft / 100)}
                strokeLinecap="round"
                transition={{ duration: 0.2 }}
              />
            </svg>

            {/* Centered Timer Text Counter */}
            <div className="absolute text-center animate-fade-in">
              <span className="text-4xl font-sans font-bold text-slate-800 block leading-none font-mono tracking-tight select-none">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF7A00] font-bold block mt-2">
                {isBreak ? "Breathe" : "LOCK IN"}
              </span>
            </div>
          </div>

          {/* Control Bar */}
          <div id="timer-action-buttons" className="flex items-center justify-center gap-4 mt-6">
            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-3 bg-slate-50 border border-slate-100 text-slate-500 rounded-full hover:bg-slate-100 transition-all active:scale-90 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Main */}
            <button
              onClick={handleStartPause}
              className={`p-4 rounded-full text-white shadow-md transition-transform active:scale-95 cursor-pointer ${
                isActive 
                  ? "bg-slate-900" 
                  : "bg-[#FF7A00]"
              }`}
            >
              {isActive ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            {/* Skip */}
            <button
              onClick={skipSession}
              className="px-3.5 py-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 cursor-pointer"
              title="Skip state"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Ambient Sound Controller & Visualizer Box */}
        <div id="ambient-sound-board" className="mt-8 border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsSoundPlaying(!isSoundPlaying)}>
              {isSoundPlaying ? (
                <Volume2 className="w-4 h-4 text-[#FF7A00] animate-bounce" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-bold text-slate-700">Ambient Focus Deck</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest uppercase">
              {isSoundPlaying ? "Active Audio" : "MUTED"}
            </span>
          </div>

          {/* Visualization waves (faked) */}
          <div className="flex items-end justify-between h-8 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 overflow-hidden gap-1">
            {visualizerBars.map((h, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isSoundPlaying ? [`${h * 0.2}%`, `${h * 1.2}%`, `${h * 0.5}%`] : "4px"
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8 + (i % 5) * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1 bg-[#FF7A00]/50 rounded-full"
              />
            ))}
          </div>

          {/* Sound selector */}
          <select
            value={soundTrack}
            onChange={(e) => setSoundTrack(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A00] cursor-pointer"
          >
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Local Timer statistics footer */}
        <div className="mt-6 grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 text-center border border-slate-100 text-xs">
          <div>
            <p className="text-slate-400 font-mono text-[9px] uppercase font-bold text-center">Focus Sessions</p>
            <p className="font-bold text-slate-850 text-sm mt-0.5">{sessionCount} blocks</p>
          </div>
          <div>
            <p className="text-slate-400 font-mono text-[9px] uppercase font-bold text-center">Total Minutes</p>
            <p className="font-bold text-slate-850 text-sm mt-0.5">{focusedMinutesTotal} mins</p>
          </div>
        </div>

      </section>

      {/* RIGHT AREA: Daily Calendar Timeline planner (7 columns) */}
      <section id="daily-timeline-calendar" className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold font-sans text-slate-800 tracking-tight">Milestone Calendar</h2>
              <p className="text-xs text-slate-400 font-mono">Map out critical time brackets for maximum focus alignment.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>June 10, 2026</span>
            </div>
          </div>

          <div className="space-y-3.5 mt-5">
            {timelineData.map((slot, index) => (
              <div 
                id={`timeline-card-row-${index}`}
                key={index} 
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  slot.completed 
                    ? "bg-slate-50 border-slate-100 opacity-60 text-slate-400" 
                    : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                }`}
              >
                {/* Time Indicator column */}
                <div className="w-20 shrink-0 select-none pt-0.5 font-mono text-[11px] font-bold text-[#FF7A00] tracking-wider uppercase">
                  {slot.time}
                </div>

                {/* Vertical Divider line */}
                <div className="w-[1.5px] bg-slate-100 self-stretch min-h-6 shrink-0 relative">
                  <div className={`absolute top-1.5 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    slot.completed ? "bg-green-500" : "bg-[#FF7A00]"
                  }`} />
                </div>

                {/* Activity and Check Column */}
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                  <p className={`text-xs font-semibold leading-relaxed truncate ${
                    slot.completed ? "line-through text-slate-400 font-medium" : "text-slate-700 font-bold"
                  }`}>
                    {slot.activity}
                  </p>

                  <button 
                    onClick={() => toggleTimelineItem(index)}
                    className="shrink-0 text-slate-300 hover:text-green-500 transition-colors cursor-pointer"
                  >
                    {slot.completed ? (
                      <CheckSquare className="w-4 h-4 text-green-500 fill-green-50" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-slate-200 rounded hover:border-[#FF7A00]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 text-xs flex items-center gap-3">
          <span className="text-xl">💡</span>
          <p className="text-slate-600 font-medium leading-relaxed">
            <span className="font-bold text-[#FF7A00]">Philemon's Tip</span>: Complete a daily timetabled block to earn <span className="font-bold text-slate-700">+10 XP</span> instantly! Build structural discipline.
          </p>
        </div>

      </section>

    </div>
  );
}
