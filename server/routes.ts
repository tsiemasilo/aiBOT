import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertScheduleSettingsSchema, insertAutomationSettingsSchema, insertConnectedAccountSchema } from "@shared/schema";

// Helper function to analyze Instagram content
function analyzeInstagramContent(username: string, profileData: any, posts: any[]) {
  const postCount = posts.length;
  
  // Analyze content types based on captions and media types
  const contentTypeMap: { [key: string]: number } = {};
  const allHashtags: string[] = [];
  const postTimestamps: number[] = [];
  
  posts.forEach(post => {
    const caption = post.caption?.text || '';
    const mediaType = post.media_type;
    
    // Extract hashtags
    const hashtagMatches = caption.match(/#[\w]+/g) || [];
    allHashtags.push(...hashtagMatches);
    
    // Categorize content based on caption keywords and media type
    const lowerCaption = caption.toLowerCase();
    
    if (mediaType === 'GraphVideo' || post.is_video) {
      contentTypeMap['Video Content'] = (contentTypeMap['Video Content'] || 0) + 1;
    } else if (lowerCaption.includes('product') || lowerCaption.includes('shop') || lowerCaption.includes('sale')) {
      contentTypeMap['Product Photos'] = (contentTypeMap['Product Photos'] || 0) + 1;
    } else if (lowerCaption.includes('quote') || lowerCaption.includes('motivation') || caption.split(' ').length < 10) {
      contentTypeMap['Quotes & Text'] = (contentTypeMap['Quotes & Text'] || 0) + 1;
    } else if (lowerCaption.includes('behind') || lowerCaption.includes('making') || lowerCaption.includes('process')) {
      contentTypeMap['Behind the Scenes'] = (contentTypeMap['Behind the Scenes'] || 0) + 1;
    } else if (lowerCaption.includes('repost') || lowerCaption.includes('credit') || lowerCaption.includes('via')) {
      contentTypeMap['User Generated'] = (contentTypeMap['User Generated'] || 0) + 1;
    } else {
      contentTypeMap['Lifestyle Shots'] = (contentTypeMap['Lifestyle Shots'] || 0) + 1;
    }
    
    // Collect timestamps
    if (post.taken_at) {
      postTimestamps.push(post.taken_at);
    }
  });
  
  // Calculate content type percentages
  const contentTypes = Object.entries(contentTypeMap).map(([type, count]) => ({
    type,
    percentage: Math.round((count / postCount) * 100),
    examples: count
  })).sort((a, b) => b.percentage - a.percentage);
  
  // Get top hashtags
  const hashtagFrequency: { [key: string]: number } = {};
  allHashtags.forEach(tag => {
    const normalized = tag.toLowerCase();
    hashtagFrequency[normalized] = (hashtagFrequency[normalized] || 0) + 1;
  });
  
  const topHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
  
  // Calculate posting frequency
  if (postTimestamps.length > 1) {
    postTimestamps.sort((a, b) => b - a);
    const oldestTimestamp = postTimestamps[postTimestamps.length - 1];
    const newestTimestamp = postTimestamps[0];
    const daysDiff = (newestTimestamp - oldestTimestamp) / (24 * 60 * 60);
    const weeksDiff = daysDiff / 7;
    const avgPostsPerWeek = weeksDiff > 0 ? postCount / weeksDiff : 0;
    
    // Find best posting time
    const hours = postTimestamps.map(ts => {
      const date = new Date(ts * 1000);
      return date.getHours();
    });
    
    const hourFrequency: { [key: number]: number } = {};
    hours.forEach(hour => {
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
    });
    
    const bestHour = Object.entries(hourFrequency)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 19;
    
    const bestPostingTime = `${bestHour.toString().padStart(2, '0')}:00`;
    
    return {
      username,
      contentTypes,
      hashtags: topHashtags,
      avgPostsPerWeek: parseFloat(avgPostsPerWeek.toFixed(1)),
      bestPostingTime,
      postCount,
    };
  }
  
  // Fallback if insufficient data
  return {
    username,
    contentTypes: contentTypes.length > 0 ? contentTypes : [
      { type: "General Content", percentage: 100, examples: postCount }
    ],
    hashtags: topHashtags.length > 0 ? topHashtags : ["#instagram"],
    avgPostsPerWeek: 0,
    bestPostingTime: "19:00",
    postCount,
  };
}

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

      const username = url.split('/').filter(Boolean).pop()?.replace('@', '') || '';
      if (!username) {
        return res.status(400).json({ error: "Invalid Instagram URL" });
      }

      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      if (!RAPIDAPI_KEY) {
        return res.status(500).json({ error: "API key not configured" });
      }

      // Fetch user profile and posts data
      const profileResponse = await fetch(
        `https://instagram-scraper-stable-api.p.rapidapi.com/userinfo?username=${username}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
          }
        }
      );

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile fetch error:', profileResponse.status, errorText);
        throw new Error(`Failed to fetch profile: ${profileResponse.status}. Please ensure you're subscribed to the Instagram Scraper Stable API on RapidAPI.`);
      }

      const profileData = await profileResponse.json();

      // Fetch user posts/media
      const postsResponse = await fetch(
        `https://instagram-scraper-stable-api.p.rapidapi.com/usermedia?username=${username}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
          }
        }
      );

      if (!postsResponse.ok) {
        const errorText = await postsResponse.text();
        console.error('Posts fetch error:', postsResponse.status, errorText);
        throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
      }

      const postsData = await postsResponse.json();
      const posts = postsData.data?.items || [];

      // Analyze content
      const analyzedData = analyzeInstagramContent(username, profileData, posts);

      // Save analyzed data to automation settings
      await storage.saveAutomationSettings({
        profileUrl: url,
        analyzedData,
        lastAnalyzedAt: new Date(),
      });

      res.json(analyzedData);
    } catch (error) {
      console.error('Profile analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to analyze profile" 
      });
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
