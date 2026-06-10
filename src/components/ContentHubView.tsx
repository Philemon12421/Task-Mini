import { useState, FormEvent } from "react";
import { ContentChannel, ContentVideo } from "../types";
import { Plus, Eye, BookOpen, Trash, AlertTriangle, Calendar, Video, Palette } from "lucide-react";

interface ContentHubViewProps {
  channels: ContentChannel[];
  onAddVideoToChannel: (channelId: string, video: Omit<ContentVideo, "id">) => void;
  onRemoveVideoFromChannel: (channelId: string, videoId: string) => void;
  onUpdateVideoInChannel: (channelId: string, videoId: string, updatedFields: Partial<ContentVideo>) => void;
}

export default function ContentHubView({
  channels,
  onAddVideoToChannel,
  onRemoveVideoFromChannel,
  onUpdateVideoInChannel
}: ContentHubViewProps) {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id || "ch-1");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ContentVideo["status"]>("Drafting");
  const [thumbnailConcept, setThumbnailConcept] = useState("");
  const [scriptNotes, setScriptNotes] = useState("");

  const activeChannel = channels.find(c => c.id === selectedChannelId);
  const activeVideo = activeChannel?.queue.find(v => v.id === activeVideoId) || activeChannel?.queue[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeChannel) return;

    onAddVideoToChannel(activeChannel.id, {
      title,
      status,
      thumbnailConcept: thumbnailConcept.trim() || undefined,
      scriptNotes: scriptNotes.trim() || undefined
    });

    setTitle("");
    setThumbnailConcept("");
    setScriptNotes("");
    setShowAdd(false);
  };

  const updateScript = (txt: string) => {
    if (!activeChannel || !activeVideo) return;
    onUpdateVideoInChannel(activeChannel.id, activeVideo.id, { scriptNotes: txt });
  };

  const updateThumbnail = (txt: string) => {
    if (!activeChannel || !activeVideo) return;
    onUpdateVideoInChannel(activeChannel.id, activeVideo.id, { thumbnailConcept: txt });
  };

  const updateStatus = (st: ContentVideo["status"]) => {
    if (!activeChannel || !activeVideo) return;
    onUpdateVideoInChannel(activeChannel.id, activeVideo.id, { status: st });
  };

  return (
    <div id="creator-hub-viewport" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div id="creator-hub-header" className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Content Hub</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Manage video queues, plan voice triggers, and sketch thumbnail outlines inside schedules.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 self-start transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAdd ? "Close Form" : "Queue Concept"}</span>
        </button>
      </div>

      {/* Draft capture form */}
      {showAdd && activeChannel && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-4 max-w-xl animate-fade-in"
        >
          <h3 className="font-sans font-bold text-slate-800 text-sm">Draft concept inside ({activeChannel.name})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Video Title *</label>
              <input
                required
                type="text"
                placeholder="Ex: Coding React Challenges..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-slate-55 bg-slate-50 border border-slate-100 p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentVideo["status"])}
                className="w-full text-xs bg-slate-55 bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00] cursor-pointer"
              >
                <option value="Drafting">Draft Hook</option>
                <option value="Scripting">Writing Scripts</option>
                <option value="Editing">Timeline Cut</option>
                <option value="Ready">Export Complete</option>
                <option value="Published">Published Live</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Thumbnail Outline</label>
            <input
              type="text"
              placeholder="Ex: Display fonts reading 'STOPS DOING THIS'. Avatar left."
              value={thumbnailConcept}
              onChange={(e) => setThumbnailConcept(e.target.value)}
              className="w-full text-xs bg-slate-55 bg-slate-50 border border-slate-100 p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Voice script hook</label>
            <textarea
              placeholder="Ex: This single line of code will crash your build instantly. Here is why..."
              rows={2}
              value={scriptNotes}
              onChange={(e) => setScriptNotes(e.target.value)}
              className="w-full text-xs bg-slate-55 bg-slate-50 border border-slate-100 p-3 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 hover:border-transparent text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Add To Queue
            </button>
          </div>
        </form>
      )}

      {/* Channel folders tabs */}
      <div id="channel-tabs" className="flex flex-wrap gap-2 pb-1 border-b border-slate-100">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => {
              setSelectedChannelId(ch.id);
              setActiveVideoId(null);
            }}
            className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
              selectedChannelId === ch.id
                ? "border-[#FF7A00] text-[#FF7A00]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="flex items-center gap-1.5 justify-center">
              <Video className="w-3.5 h-3.5" />
              <span>{ch.name}</span>
            </span>
          </button>
        ))}
      </div>

      {activeChannel ? (
        <div id="creator-workspace-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel: Video list sequence queue (5 columns) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sans font-bold text-slate-800 text-sm">Media Queue</h3>
                <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-bold">
                  {activeChannel.queue.length} Tracks
                </span>
              </div>

              <div className="space-y-3">
                {activeChannel.queue.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-100 rounded-[24px]">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                    No active video projects inside queue folder.
                  </div>
                ) : (
                  activeChannel.queue.map((vid) => {
                    const isSelected = activeVideoId === vid.id || (!activeVideoId && activeChannel.queue[0]?.id === vid.id);

                    return (
                      <div
                        id={`video-queue-row-${vid.id}`}
                        key={vid.id}
                        onClick={() => setActiveVideoId(vid.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? "border-[#FF7A00] bg-orange-50/5 shadow-sm"
                            : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-750 text-slate-700 truncate leading-snug">{vid.title}</p>
                          <span className={`inline-block mt-2 text-[8px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                            vid.status === "Ready" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                            vid.status === "Editing" ? "bg-amber-50 text-amber-700 border-amber-100/50" :
                            vid.status === "Scripting" ? "bg-indigo-50 text-indigo-700 border-indigo-100/50" :
                            vid.status === "Published" ? "bg-slate-50 text-slate-700 border-slate-100" :
                            "bg-slate-50 text-slate-500 border-slate-100"
                          }`}>
                            {vid.status}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveVideoFromChannel(activeChannel.id, vid.id);
                            if (activeVideoId === vid.id) setActiveVideoId(null);
                          }}
                          className="text-slate-305 text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                          title="Flush video"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono italic text-center mt-6">
              Assigned category tracking matches local folder schemas.
            </p>
          </div>

          {/* Right panel: Active Script editor and interactive metadata planner (7 columns) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            {activeVideo ? (
              <div id="video-composer-panel" className="space-y-6">
                
                {/* Upper Meta description */}
                <div className="border-b border-slate-50 pb-4">
                  <span className="text-[9px] font-sans bg-orange-50 text-[#FF7A00] font-bold px-2.5 py-1 rounded-lg border border-orange-100/30">
                    Composer Workspace
                  </span>
                  <h2 className="text-lg font-bold font-sans text-slate-800 mt-2 tracking-tight">{activeVideo.title}</h2>
                  
                  {/* Status Picker slider */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase font-mono tracking-wider mr-2">Status Stage:</span>
                    {(["Drafting", "Scripting", "Editing", "Ready", "Published"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateStatus(st)}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1.5 border rounded-lg transition-all uppercase cursor-pointer ${
                          activeVideo.status === st
                            ? "bg-[#FF7A00] text-white border-transparent"
                            : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-grid 1: Script Notebook Editor */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
                    <BookOpen className="w-4 h-4 text-[#FF7A00]" />
                    <span>Script Scripting Planner Notes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">Write specific video dialogues, timings overlay references and sound cues below.</p>
                  <textarea
                    rows={4}
                    value={activeVideo.scriptNotes || ""}
                    onChange={(e) => updateScript(e.target.value)}
                    placeholder="Enter script text hook lines. Example: [TIMECODE 0:00 - SHOW AVATAR]: React vs Angular Challanges..."
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00] text-slate-750 leading-relaxed"
                  />
                </div>

                {/* Sub-grid 2: Interactive Thumbnail Planner */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
                    <Eye className="w-4 h-4 text-[#FF7A00]" />
                    <span>Thumbnail Conceptual Overlay Designer</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">Configure layouts, screen highlights or font display sizes below for student catalog overlays:</p>
                  
                  <textarea
                    rows={2}
                    value={activeVideo.thumbnailConcept || ""}
                    onChange={(e) => updateThumbnail(e.target.value)}
                    placeholder="Scribble layout: glowing elements, display word, colors scheme..."
                    className="w-full text-xs bg-slate-55 bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
                  />

                  {/* Thumbnail Sketch Preview Card Box */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-32 text-white relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full filter blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start text-[9px] font-mono text-slate-500">
                      <span>PREVIEW OVERLAY MOCK</span>
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold border border-slate-700">1920 X 1080</span>
                    </div>

                    <div className="text-center font-bold tracking-tight z-10">
                      {activeVideo.thumbnailConcept ? (
                        <p className="text-xs italic text-orange-200">
                          "{activeVideo.thumbnailConcept}"
                        </p>
                      ) : (
                        <p className="text-sm font-sans font-extrabold uppercase text-slate-500">
                          Empty layout draft. Scribble label details above.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-end text-[8px] font-mono text-slate-400 bg-white/5 p-1 rounded">
                      <span className="flex items-center gap-1">
                        <Palette className="w-3 h-3 text-[#FF7A00]" />
                        <span>Recommendation: Primary accent highlights #FF7A00, high contrast slate background.</span>
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                Choose a video concept from the media queue to edit outlines.
              </div>
            )}
          </div>

        </div>
      ) : null}

    </div>
  );
}
