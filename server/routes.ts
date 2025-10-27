import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertScheduleSettingsSchema, insertAutomationSettingsSchema, insertConnectedAccountSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Post Management Routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create post" });
      }
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.updatePost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Schedule Settings Routes
  app.get("/api/schedule", async (req, res) => {
    try {
      const settings = await storage.getScheduleSettings();
      res.json(settings || {
        selectedDays: ["mon", "wed", "fri"],
        postsPerDay: 3,
        timeSlots: [
          { id: "1", time: "09:00" },
          { id: "2", time: "14:00" },
          { id: "3", time: "19:00" },
        ],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedule settings" });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const validatedData = insertScheduleSettingsSchema.parse(req.body);
      const settings = await storage.saveScheduleSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to save schedule settings" });
      }
    }
  });

  // Automation Settings Routes
  app.get("/api/automation", async (req, res) => {
    try {
      const settings = await storage.getAutomationSettings();
      res.json(settings || {
        enabled: false,
        profileUrl: null,
        analyzedData: null,
        lastAnalyzedAt: null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automation settings" });
    }
  });

  app.post("/api/automation", async (req, res) => {
    try {
      const settings = await storage.saveAutomationSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to save automation settings" });
    }
  });

  // Profile Analysis Route
  app.post("/api/analyze-profile", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Profile URL is required" });
      }

      // Simulate profile analysis (in production, this would call Instagram API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const analyzedData = {
        username: url.split('/').pop() || 'username',
        contentTypes: [
          { type: "Product Photos", percentage: 35, examples: 18 },
          { type: "Lifestyle Shots", percentage: 28, examples: 14 },
          { type: "Quotes & Text", percentage: 20, examples: 10 },
          { type: "Behind the Scenes", percentage: 12, examples: 6 },
          { type: "User Generated", percentage: 5, examples: 2 },
        ],
        hashtags: ["#fashion", "#style", "#ootd", "#inspo", "#lifestyle", "#aesthetic", "#trend", "#vibes"],
        avgPostsPerWeek: 5.2,
        bestPostingTime: "19:00",
        postCount: 50,
      };

      // Save analyzed data to automation settings
      await storage.saveAutomationSettings({
        profileUrl: url,
        analyzedData,
        lastAnalyzedAt: new Date(),
      });

      res.json(analyzedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze profile" });
    }
  });

  // Connected Accounts Routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getConnectedAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connected accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getConnectedAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertConnectedAccountSchema.parse(req.body);
      const account = await storage.createConnectedAccount(validatedData);
      res.status(201).json(account);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid account data", details: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to connect account" });
      }
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const partialSchema = insertConnectedAccountSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const account = await storage.updateConnectedAccount(req.params.id, validatedData);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid account data", details: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update account" });
      }
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConnectedAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
