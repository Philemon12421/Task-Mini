# ┌─┐
# │✓│ Task Mini
# └─┘

> **Control Your Time. Grow Your Skills. Build Your Future.**

**Task Mini** is a highly crafted **Personal Operating System (Personal OS)** built with React, Vite, Tailwind CSS, and powered by Gemini. Designed around speed, discipline, and minimalism, Task Mini consolidates active life modules into a unified terminal workspace.

---

## 🎨 Visual Identity & Key Styling

Task Mini employs a premium **"Clean Minimalism"** aesthetic featuring:
*   **Aesthetic Palette**: High-contrast modern interface leveraging rich off-white background canvases (`#F8F9FB`), deep charcoal typography (`#1E293B`), and vibrant solar workspace accents (Primary Solar Orange `#FF7A00` & Secondary `#FF9F45`).
*   **Depth-Aware Layers**: Fluid floating-glass panels styled using borderless visual layers, custom micro-blur structures, and soft cast shadows.
*   **Dynamic Responsive Scaling**: Full fluid layouts supporting desktop monitors down to mobile touchscreen viewport heights.

---

## ✨ Primary Workspace Modules

### 1. Unified Command Palette (`Cmd + K` / `Ctrl + K`)
The entire operating system is accessible instantly via keyboard navigation. Search and swap between tasks, goals, digital ideas, and navigational tabs without lifting your hands from the home row.

### 2. Instant Natural Language Processing FAB
Create tasks in milliseconds by typing commands like a human. Click the floating orange spark FAB (bottom right) and write queries. The local engine extracts deadlines and priorities on-the-fly:
*   **Query**: *`Code authentications tomorrow high priority`*
    *   **Result**: Task titled `"Code authentications"`, set to `High` Priority and scheduled for tomorrow, categorized under `"Software Engineering"`.
*   **Query**: *`Audit database friday`*
    *   **Result**: Task titled `"Audit database"`, scheduled for upcoming Friday, categorized under `"Cybersecurity"`.

### 3. Deep Focus Concentration Mode
Maximize concentration cycles by toggling the header **🎯 Deep Focus** button:
*   Hides and collapses the sidebar navigation completely to remove visual drift.
*   Converts the main background canvas into a dark cosmic night theme (`#060A13`).
*   Dims irrelevant interface modules (Video Hub queues, Ideation vaults, Master skill matrix grids) using soft blur and low opacity.
*   Holds the **Today's Focus** active checklists in crisp 100% focus fidelity to coordinate with your deep Pomodoro sessions.

### 4. Gamified Discipline Engine (Level 0 – 5)
Every completed goal, timeline checkpoint, and skill rank awards dynamic Experience Points (XP).
*   **Level 0**: `Acolyte Initiate` (0 – 499 XP)
*   **Level 1**: `Newbie Builder` (500 – 1,199 XP)
*   **Level 2**: `Explorer Node` (1,200 – 2,499 XP)
*   **Level 3**: `System Builder` (2,500 – 4,499 XP)
*   **Level 4**: `Professional Engineer` (4,500 – 6,999 XP)
*   **Level 5**: `Master Architect` (7,000+ XP)

---

## 🚀 Setting Up the Application

### 1. Requirements
*   Node.js (version 18 or above)
*   Google Gemini API Key (Optional — automatically injected in our cloud workspace)

### 2. Install Dependencies
```bash
npm install
```

### 3. Boot Server in Dev mode
```bash
npm run dev
```
The application will boot on port `3000` under our sandboxed reverse proxy.

---

## 🎮 Command Guide & Keyboard Shortcuts

*   `Cmd + K` or `Ctrl + K` : Launches global search Command Palette.
*   `Arrow Up / Down` : Navigates command list results.
*   `Enter ↵` : Jump to selected destination state.
*   `Escape` : Closes search dialog panel.
