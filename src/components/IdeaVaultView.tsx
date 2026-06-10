import { useState, FormEvent } from "react";
import { Idea } from "../types";
import { Lightbulb, Plus, Zap, Trash2, Folder, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IdeaVaultViewProps {
  ideas: Idea[];
  onAddIdea: (title: string, desc?: string) => void;
  onCategorizeIdea: (id: string) => Promise<void>;
  onRemoveIdea: (id: string) => void;
}

export default function IdeaVaultView({
  ideas,
  onAddIdea,
  onCategorizeIdea,
  onRemoveIdea
}: IdeaVaultViewProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [activeFolder, setActiveFolder] = useState<string>("All");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddIdea(title.trim(), desc.trim() || undefined);
    setTitle("");
    setDesc("");
    setShowAdd(false);
  };

  const runAICategorize = async (id: string) => {
    setLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await onCategorizeIdea(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredIdeas = activeFolder === "All" 
    ? ideas 
    : ideas.filter(i => i.category === activeFolder);

  const folders = [
    { name: "All", count: ideas.length },
    { name: "Startup Ideas", count: ideas.filter(i => i.category === "Startup Ideas").length },
    { name: "App Ideas", count: ideas.filter(i => i.category === "App Ideas").length },
    { name: "Video Ideas", count: ideas.filter(i => i.category === "Video Ideas").length },
    { name: "Research Ideas", count: ideas.filter(i => i.category === "Research Ideas").length },
    { name: "Unsorted", count: ideas.filter(i => i.category === "Unsorted").length }
  ];

  return (
    <div id="idea-vault-container" className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div id="idea-header" className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Idea Vault</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Capture sudden inspirations and leverage intelligent sorting to tag and evaluate concepts.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? "Close" : "Draft Idea"}</span>
        </button>
      </div>

      {/* Draft capture form */}
      {showAdd && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-4 max-w-xl animate-fade-in"
        >
          <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-[#FF7A00]" />
            <span>Capture Inspiration Draft</span>
          </h3>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Concept Name *</label>
            <input
              required
              type="text"
              placeholder="Ex: OSINT scanner platform/Discord integration..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Elaborate Notes</label>
            <textarea
              placeholder="What problems does this solve? What is the main value hook?"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white hover:border-transparent text-slate-700 text-xs font-bold py-2.5 px-4.5 rounded-xl transition-colors cursor-pointer"
            >
              Lock Into Chest
            </button>
          </div>
        </form>
      )}

      {/* Folders navigation panel */}
      <nav id="idea-folder-categories" className="flex flex-wrap items-center gap-2">
        {folders.map((fold) => (
          <button
            key={fold.name}
            onClick={() => setActiveFolder(fold.name)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFolder === fold.name
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <span>{fold.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
              activeFolder === fold.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {fold.count}
            </span>
          </button>
        ))}
      </nav>

      {/* Idea list viewport */}
      <div id="ideas-view-grid" className="space-y-5">
        {filteredIdeas.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] py-16 text-center shadow-sm">
            <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
            <p className="text-sm font-bold text-slate-600">No active ideas inside the "{activeFolder}" vault.</p>
            <p className="text-xs text-slate-400 mt-1">Scribble concepts or trigger categorizations above.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredIdeas.map((idea) => {
              const isLoading = !!loadingMap[idea.id];
              const isUnsorted = idea.category === "Unsorted";

              return (
                <motion.div
                  layout
                  id={`idea-vault-row-${idea.id}`}
                  key={idea.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-white border p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                    isUnsorted ? "border-orange-100 bg-orange-50/10" : "border-slate-100"
                  }`}
                >
                  <div>
                    {/* Upper row */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-mono uppercase font-bold tracking-widest px-2.5 py-1 rounded-lg border ${
                          idea.category === "Startup Ideas" ? "bg-purple-50 text-purple-600 border-purple-100" :
                          idea.category === "App Ideas" ? "bg-blue-50 text-blue-600 border-blue-100" :
                          idea.category === "Video Ideas" ? "bg-amber-50 text-amber-605 text-amber-600 border-amber-100" :
                          idea.category === "Research Ideas" ? "bg-red-50 text-red-600 border-red-100" :
                          "bg-orange-50/50 text-[#FF7A00] border-orange-100/50"
                        }`}>
                          {idea.category}
                        </span>
                        
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] font-mono text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{idea.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUnsorted && (
                          <button
                            disabled={isLoading}
                            onClick={() => runAICategorize(idea.id)}
                            className="bg-orange-50 text-[#FF7A00] border border-orange-100/40 px-3.5 py-2 rounded-2xl text-[11px] font-bold flex items-center gap-1 hover:bg-[#FF7A00] hover:text-white hover:border-transparent transition-colors cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-current" />
                            <span>{isLoading ? "Analyzing..." : "AI Viability Scan"}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveIdea(idea.id)}
                          className="text-slate-300 hover:text-red-500 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Erase concept"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Title */}
                    <h3 className="font-sans font-bold text-slate-800 text-base mb-1.5 leading-snug tracking-tight">{idea.title}</h3>
                    
                    {/* Content Description */}
                    {idea.description && (
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 pr-4">
                        {idea.description}
                      </p>
                    )}

                    {/* Tag list */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {idea.tags.map((tg, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-500 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-100">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gemini Commentary Box */}
                  {idea.commentary && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 text-xs text-slate-705 text-slate-700 flex items-start gap-2.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-2 py-0.5 font-mono text-[8px] font-bold text-[#FF7A00] uppercase bg-orange-50 border-l border-b border-orange-100/30 rounded-bl">
                        Viability Score
                      </div>
                      <Sparkles className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[10px] uppercase text-slate-400 font-mono tracking-wider">AI Venture Commentary</p>
                        <p className="mt-1 leading-relaxed text-slate-700 font-medium font-sans">
                          "{idea.commentary}"
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
}
