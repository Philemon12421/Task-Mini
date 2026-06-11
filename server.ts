import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// API 1: Health Check
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// API 2: Motivation Center Generation
// ----------------------------------------------------
app.post("/api/motivation", async (req, res) => {
  const { category = "Discipline" } = req.body;
  const ai = getGemini();

  if (!ai) {
    // Elegant fallback data in case API key isn't provided or set
    const fallbacks: Record<string, any> = {
      Discipline: {
        quote: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln",
        videoTopic: "How to Build Unshakeable Self-Discipline (Atomic Habits Blueprint)",
        articleTitle: "Navigating Friction: Why Boring Work is the Secret to Expertise",
        challenge: "Write code or study with absolutely zero social media tabs open for 90 minutes straight."
      },
      Cybersecurity: {
        quote: "The quieter you become, the more you are able to hear.",
        author: "Kali Linux team",
        videoTopic: "Real-world Active Directory Hacker Tradecraft Red vs Blue",
        articleTitle: "Analyzing the anatomy of a zero-day vulnerability in modern protocols",
        challenge: "Deep dive into OSWAP Top 10 API Security risks and map out a local defensive test."
      },
      Entrepreneurship: {
        quote: "The best way to predict the future is to create it.",
        author: "Peter Drucker",
        videoTopic: "How to Bootstrap a SaaS App from $0 to $10k MRR",
        articleTitle: "Frictionless Onboarding: Lessons from Slack, Linear & Notion's signup flows",
        challenge: "Map out the exact pricing tiers and value hook for your next micro-SaaS idea."
      },
      Coding: {
        quote: "Simplicity is the soul of efficiency.",
        author: "Austin Freeman",
        videoTopic: "Architecting Ultra-Fast React Apps with Minimal Renders",
        articleTitle: "The V8 Engine Deep Dive: Explaining JIT, Garbage Collection & Assembly translation",
        challenge: "Refactor a heavily nested client helper using functional purity and typescript generics."
      },
      Success: {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        videoTopic: "The Art of Focus: How Elite Builders Eliminate Cognitive Overhead",
        articleTitle: "Designing Your Personal OS: Why Systems Beat Goals Every Single Time",
        challenge: "Conduct a 15-minute retrospective on your top priorities and discard 3 low-value tasks."
      }
    };

    const choice = fallbacks[category] || fallbacks["Discipline"];
    return res.json({ ...choice, source: "fallback" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Provide a high-energy motivation snippet specifically tailored for Philemon, a highly skilled tech builder, software engineer, cybersecurity enthusiast, athlete, and content creator. The category selected is "${category}". Include a powerful quote, its author, a YouTube video search topic recommendation, a highly technical article headline, and an action-oriented intense daily challenge. Output strictly in valid JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING, description: "A highly punchy, inspiring, or stoic quote" },
            author: { type: Type.STRING, description: "Author of the quote" },
            videoTopic: { type: Type.STRING, description: "Suggested YouTube search topic or video theme" },
            articleTitle: { type: Type.STRING, description: "Headline of a recommended high-level technical or mindset article" },
            challenge: { type: Type.STRING, description: "A difficult, highly specific daily challenge for that day" }
          },
          required: ["quote", "author", "videoTopic", "articleTitle", "challenge"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, source: "gemini" });
  } catch (error: any) {
    console.warn("Gemini Motivation Error (falling back to local default):", error.message || error);
    const fallbacks: Record<string, any> = {
      Discipline: {
        quote: "Discipline is choosing between what you want now and what you want most.",
        author: "Abraham Lincoln",
        videoTopic: "How to Build Unshakeable Self-Discipline (Atomic Habits Blueprint)",
        articleTitle: "Navigating Friction: Why Boring Work is the Secret to Expertise",
        challenge: "Write code or study with absolutely zero social media tabs open for 90 minutes straight."
      },
      Cybersecurity: {
        quote: "The quieter you become, the more you are able to hear.",
        author: "Kali Linux team",
        videoTopic: "Real-world Active Directory Hacker Tradecraft Red vs Blue",
        articleTitle: "Analyzing the anatomy of a zero-day vulnerability in modern protocols",
        challenge: "Deep dive into OSWAP Top 10 API Security risks and map out a local defensive test."
      },
      Entrepreneurship: {
        quote: "The best way to predict the future is to create it.",
        author: "Peter Drucker",
        videoTopic: "How to Bootstrap a SaaS App from $0 to $10k MRR",
        articleTitle: "Frictionless Onboarding: Lessons from Slack, Linear & Notion's signup flows",
        challenge: "Map out the exact pricing tiers and value hook for your next micro-SaaS idea."
      },
      Coding: {
        quote: "Simplicity is the soul of efficiency.",
        author: "Austin Freeman",
        videoTopic: "Architecting Ultra-Fast React Apps with Minimal Renders",
        articleTitle: "The V8 Engine Deep Dive: Explaining JIT, Garbage Collection & Assembly translation",
        challenge: "Refactor a heavily nested client helper using functional purity and typescript generics."
      },
      Success: {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        videoTopic: "The Art of Focus: How Elite Builders Eliminate Cognitive Overhead",
        articleTitle: "Designing Your Personal OS: Why Systems Beat Goals Every Single Time",
        challenge: "Conduct a 15-minute retrospective on your top priorities and discard 3 low-value tasks."
      }
    };
    const choice = fallbacks[category] || fallbacks["Discipline"];
    res.json({ ...choice, source: "fallback_error" });
  }
});

// ----------------------------------------------------
// API 3: Idea Vault AI Categorization
// ----------------------------------------------------
app.post("/api/ideas/categorize", async (req, res) => {
  const { title, description } = req.body;
  const ai = getGemini();

  if (!title) {
    return res.status(400).json({ error: "Title is required for categorization." });
  }

  if (!ai) {
    // Fallback: rule-based local classification
    const combined = `${title} ${description}`.toLowerCase();
    let category = "Startup Ideas";
    let tags = ["Concept"];

    if (combined.includes("video") || combined.includes("youtube") || combined.includes("tiktok") || combined.includes("channel") || combined.includes("soccer") || combined.includes("football") || combined.includes("motivation")) {
      category = "Video Ideas";
      tags = ["Media", "YouTube"];
    } else if (combined.includes("app") || combined.includes("software") || combined.includes("saas") || combined.includes("code") || combined.includes("platform") || combined.includes("website") || combined.includes("frontend") || combined.includes("backend")) {
      category = "App Ideas";
      tags = ["Development", "SaaS"];
    } else if (combined.includes("research") || combined.includes("cyber") || combined.includes("security") || combined.includes("study") || combined.includes("vulnerability") || combined.includes("exploit") || combined.includes("labs")) {
      category = "Research Ideas";
      tags = ["Cybersecurity", "Deep Dive"];
    } else if (combined.includes("business") || combined.includes("startup") || combined.includes("agency") || combined.includes("client") || combined.includes("revenue")) {
      category = "Startup Ideas";
      tags = ["Business", "Revenue"];
    }

    return res.json({
      category,
      tags: [...tags, "LocalAI"],
      commentary: "Auto-classified using high-performance local heuristics.",
      source: "fallback"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Categorize this idea for Philemon:
Title: "${title}"
Description: "${description || 'No description provided'}"

Classify it strictly into one of these four categories: "Startup Ideas", "App Ideas", "Video Ideas", "Research Ideas".
Provide three highly descriptive micro-tags and a sharp, witty 1-sentence analytical commentary from an elite tech-venture builder perspective.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Must be exactly: 'Startup Ideas', 'App Ideas', 'Video Ideas', or 'Research Ideas'" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly descriptive single-word tags or key technical frameworks"
            },
            commentary: { type: Type.STRING, description: "1-sentence highly intelligent builder analysis" }
          },
          required: ["category", "tags", "commentary"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, source: "gemini" });
  } catch (error: any) {
    console.warn("Gemini Idea Categorization Error (falling back to local heuristics):", error.message || error);
    const combined = `${title} ${description || ""}`.toLowerCase();
    let category = "Startup Ideas";
    let tags = ["Concept"];

    if (combined.includes("video") || combined.includes("youtube") || combined.includes("tiktok") || combined.includes("channel") || combined.includes("soccer") || combined.includes("football") || combined.includes("motivation")) {
      category = "Video Ideas";
      tags = ["Media", "YouTube"];
    } else if (combined.includes("app") || combined.includes("software") || combined.includes("saas") || combined.includes("code") || combined.includes("platform") || combined.includes("website") || combined.includes("frontend") || combined.includes("backend")) {
      category = "App Ideas";
      tags = ["Development", "SaaS"];
    } else if (combined.includes("research") || combined.includes("cyber") || combined.includes("security") || combined.includes("study") || combined.includes("vulnerability") || combined.includes("exploit") || combined.includes("labs")) {
      category = "Research Ideas";
      tags = ["Cybersecurity", "Deep Dive"];
    } else if (combined.includes("business") || combined.includes("startup") || combined.includes("agency") || combined.includes("client") || combined.includes("revenue")) {
      category = "Startup Ideas";
      tags = ["Business", "Revenue"];
    }

    res.json({
      category,
      tags: [...tags, "LocalAI"],
      commentary: "Auto-classified using high-performance local heuristics.",
      source: "fallback_error"
    });
  }
});

// ----------------------------------------------------
// API 4: Learn Academy Roadmap Generation
// ----------------------------------------------------
app.post("/api/mentorship/roadmap", async (req, res) => {
  const { skillName = "UI/UX Design" } = req.body;
  const ai = getGemini();

  if (!ai) {
    // Beautiful default academy roadmap fallbacks
    const roadmaps: Record<string, any> = {
      "UI/UX Design": {
        description: "An elite visual curriculum starting from structural typography to high-fidelity micro-interactions.",
        lessons: [
          { id: "ui-1", title: "Spacing Systems & The 8pt Grid", xp: 50, badge: "Pixel Cadet", duration: "1.5h" },
          { id: "ui-2", title: "Typography Hierarchies & Brand Scaling", xp: 75, badge: "Font Alchemist", duration: "2h" },
          { id: "ui-3", title: "Establishing Light & Dark Mode Semantic Tokens", xp: 100, badge: "Contrast Master", duration: "3h" },
          { id: "ui-4", title: "Interactive Micro-animations in Framer Motion", xp: 150, badge: "Motion Builder", duration: "4h" }
        ]
      },
      "Cybersecurity": {
        description: "Hands-on offensive and defensive tactics targeting contemporary network protocols and web structures.",
        lessons: [
          { id: "sec-1", title: "Network Sniffing & Port Attack Mapping", xp: 50, badge: "Port Surveyor", duration: "2h" },
          { id: "sec-2", title: "OWASP Top 10 Red-Teaming Exploitations", xp: 75, badge: "Vulnerability Hunter", duration: "3h" },
          { id: "sec-3", title: "API Gateway Interception & Token Tampering", xp: 100, badge: "Cookie Captain", duration: "3h" },
          { id: "sec-4", title: "Mitigating Buffer Overflows in Hardened Systems", xp: 150, badge: "Binary Shield", duration: "4.5h" }
        ]
      },
      "Web Development": {
        description: "Modern full-stack architecture specializing in state caching, edge handlers, and server processing.",
        lessons: [
          { id: "dev-1", title: "TypeScript Generics & Rigid Type Guarding", xp: 50, badge: "TS Knight", duration: "2h" },
          { id: "dev-2", title: "Optimizing Client DOM: Virtual vs Concurrent Rendering", xp: 80, badge: "Dom Doctor", duration: "2.5h" },
          { id: "dev-3", title: "Caching Strategies with Redis & Edge Storage", xp: 120, badge: "Memory Guard", duration: "3h" },
          { id: "dev-4", title: "Building Scalable Custom Websocket State Servers", xp: 150, badge: "Socket Streamer", duration: "4h" }
        ]
      }
    };

    const choice = roadmaps[skillName] || roadmaps["UI/UX Design"];
    return res.json({ ...choice, source: "fallback" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Create a highly structured gamified Academy Learning Roadmap for the custom skill: "${skillName}". Provide a general description, and 4 sequential, high-quality, hands-on tasks/lessons. Each lesson must have a title, short active duration (e.g. "2h", "1.5h"), specific XP reward (between 40 and 150 XP), and a unique badass Badge unlocked name upon completion. Output strictly in valid JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A highly exciting summary of this skill academy path" },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique short identifier (e.g., les-1)" },
                  title: { type: Type.STRING, description: "Short lesson module title focused on hands-on creation" },
                  xp: { type: Type.INTEGER, description: "XP reward amount" },
                  badge: { type: Type.STRING, description: "Badge unlock name" },
                  duration: { type: Type.STRING, description: "Approximate completion time" }
                },
                required: ["id", "title", "xp", "badge", "duration"]
              }
            }
          },
          required: ["description", "lessons"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, source: "gemini" });
  } catch (error: any) {
    console.warn("Gemini Academy Roadmap Error (falling back to local default):", error.message || error);
    const roadmaps: Record<string, any> = {
      "UI/UX Design": {
        description: "An elite visual curriculum starting from structural typography to high-fidelity micro-interactions.",
        lessons: [
          { id: "ui-1", title: "Spacing Systems & The 8pt Grid", xp: 50, badge: "Pixel Cadet", duration: "1.5h" },
          { id: "ui-2", title: "Typography Hierarchies & Brand Scaling", xp: 75, badge: "Font Alchemist", duration: "2h" },
          { id: "ui-3", title: "Establishing Light & Dark Mode Semantic Tokens", xp: 100, badge: "Contrast Master", duration: "3h" },
          { id: "ui-4", title: "Interactive Micro-animations in Framer Motion", xp: 150, badge: "Motion Builder", duration: "4h" }
        ]
      },
      "Cybersecurity": {
        description: "Hands-on offensive and defensive tactics targeting contemporary network protocols and web structures.",
        lessons: [
          { id: "sec-1", title: "Network Sniffing & Port Attack Mapping", xp: 50, badge: "Port Surveyor", duration: "2h" },
          { id: "sec-2", title: "OWASP Top 10 Red-Teaming Exploitations", xp: 75, badge: "Vulnerability Hunter", duration: "3h" },
          { id: "sec-3", title: "API Gateway Interception & Token Tampering", xp: 100, badge: "Cookie Captain", duration: "3h" },
          { id: "sec-4", title: "Mitigating Buffer Overflows in Hardened Systems", xp: 150, badge: "Binary Shield", duration: "4.5h" }
        ]
      },
      "Web Development": {
        description: "Modern full-stack architecture specializing in state caching, edge handlers, and server processing.",
        lessons: [
          { id: "dev-1", title: "TypeScript Generics & Rigid Type Guarding", xp: 50, badge: "TS Knight", duration: "2h" },
          { id: "dev-2", title: "Optimizing Client DOM: Virtual vs Concurrent Rendering", xp: 80, badge: "Dom Doctor", duration: "2.5h" },
          { id: "dev-3", title: "Caching Strategies with Redis & Edge Storage", xp: 120, badge: "Memory Guard", duration: "3h" },
          { id: "dev-4", title: "Building Scalable Custom Websocket State Servers", xp: 150, badge: "Socket Streamer", duration: "4h" }
        ]
      }
    };
    const choice = roadmaps[skillName] || roadmaps["UI/UX Design"];
    res.json({ ...choice, source: "fallback_error" });
  }
});

// ----------------------------------------------------
// Mounting Vite Dev Middleware & Catch-All Frontend
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Task Mini] Server running in host '0.0.0.0' on port ${PORT}`);
  });
}

startServer();
