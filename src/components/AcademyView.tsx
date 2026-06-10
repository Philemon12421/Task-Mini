import { useState, useEffect } from "react";
import { Lesson, AcademyRoadmap } from "../types";
import { Award, Share2, Loader2, Star, CheckSquare, Bookmark, Check } from "lucide-react";
import { motion } from "motion/react";

interface AcademyViewProps {
  onAddXP: (xp: number) => void;
  onUnlockBadge: (badge: string) => void;
  unlockedBadges: string[];
}

export default function AcademyView({
  onAddXP,
  onUnlockBadge,
  unlockedBadges
}: AcademyViewProps) {
  const [selectedRouteSkill, setSelectedRouteSkill] = useState("UI/UX Design");
  const [roadmap, setRoadmap] = useState<AcademyRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRoadmap = async (skillName: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/mentorship/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName }),
      });
      const data = await res.json();
      
      const lessonsWithCompletion = data.lessons.map((les: Lesson) => ({
        ...les,
        completed: unlockedBadges.includes(les.badge)
      }));

      setRoadmap({
        skillName,
        description: data.description,
        lessons: lessonsWithCompletion,
        unlockedBadgeCount: lessonsWithCompletion.filter((l: any) => l.completed).length
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(selectedRouteSkill);
  }, [selectedRouteSkill]);

  const handleLessonComplete = (lessonId: string) => {
    if (!roadmap) return;
    
    const updatedLessons = roadmap.lessons.map((l) => {
      if (l.id === lessonId && !l.completed) {
        onUnlockBadge(l.badge);
        onAddXP(l.xp);
        alert(`🏆 Course item complete! You completed the milestone lesson and unlocked the badge: "${l.badge}"!`);
        return { ...l, completed: true };
      }
      return l;
    });

    setRoadmap({
      ...roadmap,
      lessons: updatedLessons,
      unlockedBadgeCount: updatedLessons.filter((l) => l.completed).length
    });
  };

  const handleCopyLink = () => {
    const formatUrl = `https://taskmini.app/academy/${selectedRouteSkill.toLowerCase().replace(/\s+/g, "-")}-roadmap`;
    navigator.clipboard.writeText(formatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="academy-viewport" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div id="academy-header" className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight font-sans">Mentor Academy</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Map out curricula for students, share progress portal links, and track badges unlocked.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedRouteSkill}
            onChange={(e) => setSelectedRouteSkill(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-100 px-4 py-3 rounded-2xl text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#FF7A00] cursor-pointer"
          >
            <option value="UI/UX Design">UI/UX Curriculum Route</option>
            <option value="Cybersecurity">Cybersecurity Red Route</option>
            <option value="Web Development">Fullstack Web Architecture</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[32px] py-16 text-center shadow-sm">
          <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 font-sans">Generating syllabus from AI course matrix...</p>
          <p className="text-xs text-slate-400 mt-1">Stitching roadmap, XP milestones, and target achievements.</p>
        </div>
      ) : roadmap ? (
        <div id="academy-curriculum" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Course Description and Lesson checklist (8 columns) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-50">
              <div>
                <span className="text-[9px] font-sans bg-orange-50 text-[#FF7A00] font-bold px-2.5 py-1 rounded-lg border border-orange-100/50 uppercase tracking-widest">
                  Active Shared Path
                </span>
                <h2 className="text-xl font-bold font-sans text-slate-800 mt-1.5 tracking-tight">{roadmap.skillName} Roadmap</h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans">{roadmap.description}</p>
              </div>

              {/* Share link button */}
              <button
                onClick={handleCopyLink}
                className="bg-slate-50 hover:bg-[#FF7A00] text-slate-700 hover:text-white border border-slate-100 hover:border-transparent px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Syllabus"}</span>
              </button>
            </div>

            {/* Course Outline Title */}
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Lesson Sequence & Badges</h3>

            {/* List */}
            <div className="space-y-3">
              {roadmap.lessons.map((les, index) => (
                <div 
                  id={`roadmap-lesson-row-${les.id}`}
                  key={les.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                    les.completed
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                      : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      les.completed ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${les.completed ? "text-green-800" : "text-slate-700"}`}>
                        {les.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] font-mono text-slate-400">
                        <span className="bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg font-medium">Duration: {les.duration}</span>
                        <span className="text-[#FF7A00] font-bold">Unlocks badge: "{les.badge}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-emerald-600">+{les.xp} XP</span>
                    <button
                      disabled={les.completed}
                      onClick={() => handleLessonComplete(les.id)}
                      className={`text-[10px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                        les.completed
                          ? "bg-green-50 border-green-100 text-green-700 font-semibold cursor-default"
                          : "bg-slate-50 border-slate-100 text-slate-705 text-slate-700 hover:bg-[#FF7A00] hover:text-white hover:border-transparent"
                      }`}
                    >
                      {les.completed ? "Complete ✔" : "Pass Lesson"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Badge Closet (4 columns) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
                <Award className="w-4 h-4 text-[#FF7A00]" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">Achievements Closet</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[300px] pr-1">
                {unlockedBadges.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-slate-400 text-xs">
                    No learning badges unlocked yet. Complete lessons to lock them in!
                  </div>
                ) : (
                  unlockedBadges.map((badge, idx) => (
                    <motion.div 
                      layout
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      id={`badge-cell-${idx}`}
                      key={badge}
                      className="p-3 bg-orange-50/50 border border-orange-100/30 rounded-2xl text-center relative group flex flex-col justify-center items-center"
                    >
                      <span className="text-xl mb-1 filter drop-shadow">⭐</span>
                      <p className="font-sans font-bold text-slate-700 text-[10px] leading-tight truncate w-full">{badge}</p>
                      <p className="text-[8px] font-mono text-[#FF7A00] font-bold uppercase tracking-wider mt-0.5">Unlocked</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p className="font-bold text-slate-700">Rank Structure:</p>
              <ul className="space-y-1 font-mono text-[10px] text-slate-500">
                <li>• Level 1-2: Newbie / Explorer</li>
                <li>• Level 3: System Builder</li>
                <li>• Level 4: Senior Professional</li>
                <li>• Level 5: Master Architect</li>
              </ul>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
