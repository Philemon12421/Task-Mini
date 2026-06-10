import { useState, FormEvent } from "react";
import { Task, Priority, Category, TaskStatus } from "../types";
import { Plus, Search, Trash2, Calendar, Award, CheckCircle2, Circle, Clock, Filter, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TasksViewProps {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  toggleTaskStatus: (id: string) => void;
}

export default function TasksView({
  tasks,
  addTask,
  deleteTask,
  updateTaskStatus,
  toggleTaskStatus
}: TasksViewProps) {
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("Software Engineering");
  const [deadline, setDeadline] = useState("2026-06-11");
  const [xpReward, setXpReward] = useState(100);
  const [notes, setNotes] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [category, priority];

    addTask({
      title,
      priority,
      category,
      deadline,
      status: "Todo",
      xpReward,
      notes: notes.trim() || undefined,
      tags
    });

    // Reset
    setTitle("");
    setNotes("");
    setTagsInput("");
    setXpReward(100);
    setShowForm(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "All" || task.category === filterCategory;
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div id="tasks-manager-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Header section with Plus Button */}
      <div id="tasks-list-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-slate-400 font-medium">Structure and track milestones for your operating system.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 hover:bg-[#FF7A00] text-white px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2 self-start transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Hide Editor" : "New Task"}</span>
        </button>
      </div>

      {/* Creation form dropdown (Animated via AnimatePresence) */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            id="task-create-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Refactor micro-SaaS web endpoint..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                />
              </div>

              {/* Task Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                >
                  <option value="Cybersecurity">Cybersecurity (Labs, Research, Defends)</option>
                  <option value="Software Engineering">Software Engineering (Frontend, Backend, Design)</option>
                  <option value="Content Creation">Content Creation (YouTube Football, Gaming, Design)</option>
                  <option value="Business">Business (Drenchack, Agency Clients, Partnerships)</option>
                  <option value="Personal">Personal (Reading, Wealth, Fitness)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                <div id="priority-selector-grid" className="grid grid-cols-3 gap-2">
                  {(["Low", "Medium", "High"] as Priority[]).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`text-xs py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        priority === p
                          ? "bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF7A00]"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline & XP reward */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 px-2.5 py-2 rounded-xl text-xs text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">XP Reward</label>
                  <select
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-100 px-2.5 py-2 rounded-xl text-xs text-slate-800 font-medium"
                  >
                    <option value={50}>50 XP (Minor)</option>
                    <option value={80}>80 XP (Average)</option>
                    <option value={100}>100 XP (Standard)</option>
                    <option value={150}>150 XP (Major Lab)</option>
                    <option value={200}>200 XP (Massive Push)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes / description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes & Context</label>
              <textarea
                placeholder="Enter requirements, URLs, or command blueprints..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm text-slate-800 font-medium focus:outline-none"
              />
            </div>

            {/* Tags comma list */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tags (separated by comma)</label>
              <input
                type="text"
                placeholder="Ex: RedTeam, ActiveDirectory, ClientDrenchack"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-xs text-slate-800 font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#FF7A00] hover:bg-[#FF7A00]/95 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#FF7A00]/10 cursor-pointer"
              >
                Assemble Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter panel & Search bar */}
      <div id="tasks-filter-bar" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        {/* Search Input */}
        <div id="task-search-input-wrapper" className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 pl-9 pr-4 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none"
          />
        </div>

        {/* Filter dropboxes */}
        <div id="filter-selectors" className="flex flex-wrap items-center gap-2 w-full md:w-auto md:ml-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Content Creation">Content Creation</option>
              <option value="Business">Business</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-xl text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task list Display */}
      <div id="tasks-list-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[28px] py-16 text-center">
            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-500">No active tasks match your search criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Create a new milestone above or adjust criteria.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <motion.div
              layout
              id={`task-manager-card-${task.id}`}
              key={task.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`bg-white border rounded-[28px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                task.status === "Completed" ? "opacity-75 border-slate-100" : "border-slate-100"
              }`}
            >
              <div>
                {/* Meta Row: Category + Priority tags */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{task.category}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                      task.priority === "High" ? "bg-red-50 text-red-500 border border-red-100" :
                      task.priority === "Medium" ? "bg-amber-50 text-amber-500 border border-amber-100" :
                      "bg-slate-50 text-slate-500 border border-slate-100"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-bold text-[#FF7A00] font-mono bg-[#FF7A00]/5 px-2 py-0.5 rounded-md">
                      +{task.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Task Title */}
                <div className="flex items-start gap-3 mb-3">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                  >
                    {task.status === "Completed" ? (
                      <div className="w-5 h-5 rounded-md border-2 border-[#FF7A00] flex items-center justify-center bg-[#FF7A00]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-200" />
                    )}
                  </button>
                  <p className={`text-sm font-bold leading-snug font-sans ${
                    task.status === "Completed" ? "line-through text-slate-400 font-medium" : "text-slate-800"
                  }`}>
                    {task.title}
                  </p>
                </div>

                {/* Description notes */}
                {task.notes && (
                  <p className="text-xs text-slate-400 pl-8 mb-4 line-clamp-2">
                    {task.notes}
                  </p>
                )}

                {/* Micro tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-8 mb-5">
                    {task.tags.map((tag, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-400 border border-slate-100/50 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Deadline + Quick Actions */}
              <div className="border-t border-slate-50 pt-4 flex items-center justify-between text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{task.deadline}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 font-semibold">
                  {task.status !== "Completed" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === "Todo" ? "In Progress" : "Completed")}
                      className="bg-slate-50 border border-slate-100 text-slate-500 hover:bg-[#FF7A00]/10 hover:text-[#FF7A00] hover:border-transparent px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
                    >
                      {task.status === "Todo" ? "Start" : "Done"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete task milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
