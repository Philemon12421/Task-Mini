import { useState, FormEvent } from "react";
import { TeamMember } from "../types";
import { Mail, UserPlus, Trash } from "lucide-react";

interface TeamViewProps {
  team: TeamMember[];
  onInviteMember: (name: string, email: string, role: "CEO" | "Manager" | "Member" | "Viewer") => void;
  onRemoveMember: (id: string) => void;
}

export default function TeamView({
  team,
  onInviteMember,
  onRemoveMember
}: TeamViewProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CEO" | "Manager" | "Member" | "Viewer">("Member");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onInviteMember(name.trim(), email.trim(), role);
    setName("");
    setEmail("");
    setShowInviteForm(false);
  };

  return (
    <div id="team-collaboration-viewport" className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div id="team-header" className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 tracking-tight">Team Collaboration</h1>
          <p className="text-sm text-slate-400 font-sans font-medium">Coordinate with designers, developers, and collaborators supporting other milestones.</p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors self-start cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showInviteForm ? "Close Form" : "Invite Collaborator"}</span>
        </button>
      </div>

      {/* Invite form dropdown */}
      {showInviteForm && (
        <form 
          onSubmit={handleSubmit}
          className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-5 max-w-xl"
        >
          <h3 className="font-sans font-bold text-slate-800 text-sm">Send Associate Invite Link</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Full Name</label>
              <input
                required
                type="text"
                placeholder="Ex: Marcus Aurelius"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Email Address</label>
              <input
                required
                type="email"
                placeholder="associate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#FF7A00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-2">Organizational Role</label>
            <div className="grid grid-cols-4 gap-2">
              {(["CEO", "Manager", "Member", "Viewer"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-xs py-2.5 rounded-2xl border font-semibold transition-all cursor-pointer ${
                    role === r
                      ? "bg-orange-50 border-orange-100 text-[#FF7A00] font-bold"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 py-1.5 px-3 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-50 border border-slate-100 hover:bg-[#FF7A00] hover:text-white text-slate-700 hover:border-transparent text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Dispatch Link
            </button>
          </div>
        </form>
      )}

      {/* Team grid display list */}
      <div id="team-associates-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div 
            id={`team-member-card-${member.id}`}
            key={member.id}
            className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center relative group"
          >
            {member.role !== "CEO" && (
              <button
                onClick={() => onRemoveMember(member.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                title="Remove associate"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Avatar block with high-contrast text */}
            <div className="w-14 h-14 rounded-full bg-orange-50/55 border border-orange-100/40 flex items-center justify-center text-[#FF7A00] font-sans font-bold text-lg shadow-sm mb-3">
              {member.avatar || member.name[0]}
            </div>

            {/* Info details */}
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm">{member.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{member.email}</span>
              </div>
            </div>

            {/* Badge role overlay */}
            <div className="mt-4 w-full">
              <span className={`inline-block w-full text-center text-[10px] font-mono font-bold uppercase border rounded-full py-1 ${
                member.role === "CEO" ? "bg-red-50 text-red-600 border-red-100/50" :
                member.role === "Manager" ? "bg-blue-50 text-blue-600 border-blue-100/50" :
                member.role === "Member" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                "bg-slate-50 text-slate-500 border-slate-100"
              }`}>
                {member.role}
              </span>
            </div>

            {/* Micro details */}
            <div className="mt-4 pt-4 border-t border-slate-50 w-full text-center text-[10px] text-slate-400 font-mono font-bold uppercase">
              Assigned Tasks: {member.activeTaskCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
