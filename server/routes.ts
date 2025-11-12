import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertScheduleSettingsSchema, insertAutomationSettingsSchema, insertConnectedAccountSchema } from "@shared/schema";
import { paraphraseCaption } from "./openai";
import { fetchInstagramProfile, fetchInstagramPosts } from "./instagram-scrapers";

// Helper function to analyze Instagram content
function analyzeInstagramContent(username: string, profileData: any, posts: any[]) {
  const postCount = posts.length;
  
  // If no posts data, provide a placeholder analysis
  if (postCount === 0) {
    console.log('No posts data available, providing placeholder analysis');
    return {
      username,
      contentTypes: [
        { type: "Mixed Content", percentage: 100, examples: 0 }
      ],
      hashtags: ["#instagram", "#content", "#social"],
      avgPostsPerWeek: 0,
      bestPostingTime: "19:00",
      postCount: 0,
      note: "Limited analysis - posts data not available from API"
    };
  }
  
  // Analyze content types based on captions and media types
  const contentTypeMap: { [key: string]: number } = {};
  const allHashtags: string[] = [];
  const postTimestamps: number[] = [];
  
  posts.forEach(post => {
    const caption = post.caption?.text || post.caption || '';
    const mediaType = post.media_type || post.type;
    
    // Extract hashtags
    const hashtagMatches = caption.match(/#[\w]+/g) || [];
    allHashtags.push(...hashtagMatches);
    
    // Categorize content based on caption keywords and media type
    const lowerCaption = caption.toLowerCase();
    
    if (mediaType === 'GraphVideo' || mediaType === 'video' || post.is_video) {
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
    } else if (post.timestamp) {
      postTimestamps.push(new Date(post.timestamp).getTime() / 1000);
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
      hashtags: topHashtags.length > 0 ? topHashtags : ["#instagram"],
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
        sourceProfileUrl: null,
        sourceProfileData: null,
        sourceProfilePosts: null,
        isProfileConfirmed: false,
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

  // Profile Search Route (for preview before confirmation)
  app.post("/api/search-profile", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Profile URL is required" });
      }

      const urlPattern = /^https?:\/\/(www\.)?instagram\.com\//i;
      if (!urlPattern.test(url)) {
        return res.status(400).json({ error: "Please provide a valid Instagram URL" });
      }

      let username = '';
      try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        username = pathParts[0]?.replace('@', '') || '';
      } catch {
        username = url.split('/').filter(Boolean).pop()?.split('?')[0]?.replace('@', '') || '';
      }
      
      if (!username || username.length > 30 || !/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.status(400).json({ error: "Invalid Instagram username format" });
      }

      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      if (!RAPIDAPI_KEY) {
        return res.status(503).json({ error: "Profile search service is currently unavailable" });
      }

      const profileData = await fetchInstagramProfile(username, RAPIDAPI_KEY);
      console.log('Profile data retrieved:', JSON.stringify(profileData, null, 2).substring(0, 1000));
      res.json(profileData);
    } catch (error) {
      console.error('Profile search error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to search profile" 
      });
    }
  });

  // Confirm Profile Route (save for automation)
  app.post("/api/confirm-profile", async (req, res) => {
    try {
      const { url, profileData } = req.body;
      if (!url || !profileData) {
        return res.status(400).json({ error: "Profile URL and data are required" });
      }

      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      if (!RAPIDAPI_KEY) {
        return res.status(503).json({ error: "Service is currently unavailable" });
      }

      const allPosts = await fetchInstagramPosts(profileData.username, RAPIDAPI_KEY);
      console.log(`Fetched ${allPosts.length} posts for automation`);

      await storage.saveAutomationSettings({
        sourceProfileUrl: url,
        sourceProfileData: profileData,
        sourceProfilePosts: allPosts,
        isProfileConfirmed: true,
        lastAnalyzedAt: new Date(),
      });

      res.json({ success: true, message: "Profile confirmed successfully" });
    } catch (error) {
      console.error('Profile confirmation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to confirm profile" 
      });
    }
  });

  // Profile Analysis Route
  app.post("/api/analyze-profile", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Profile URL is required" });
      }

      const urlPattern = /^https?:\/\/(www\.)?instagram\.com\//i;
      if (!urlPattern.test(url)) {
        return res.status(400).json({ error: "Please provide a valid Instagram URL" });
      }

      let username = '';
      try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        username = pathParts[0]?.replace('@', '') || '';
      } catch {
        username = url.split('/').filter(Boolean).pop()?.split('?')[0]?.replace('@', '') || '';
      }
      
      if (!username || username.length > 30 || !/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.status(400).json({ error: "Invalid Instagram username format" });
      }

      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      if (!RAPIDAPI_KEY) {
        return res.status(503).json({ error: "Profile analysis service is currently unavailable" });
      }

      const profileData = await fetchInstagramProfile(username, RAPIDAPI_KEY);
      const posts = await fetchInstagramPosts(username, RAPIDAPI_KEY);
      
      if (posts.length === 0) {
        console.log('Could not fetch posts. Analysis will be limited to profile data.');
      }

      const analyzedData = analyzeInstagramContent(username, profileData, posts);

      await storage.saveAutomationSettings({
        sourceProfileUrl: url,
        sourceProfileData: profileData,
        sourceProfilePosts: posts,
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

  // Get queued automated posts from confirmed source profile
  app.get("/api/queued-posts", async (req, res) => {
    try {
      const automationSettings = await storage.getAutomationSettings();
      
      if (!automationSettings || !automationSettings.isProfileConfirmed) {
        return res.json([]);
      }

      const sourcePosts = automationSettings.sourceProfilePosts as any[] || [];
      if (sourcePosts.length === 0) {
        return res.json([]);
      }

      const limit = parseInt(req.query.limit as string) || 6;
      
      const shuffled = [...sourcePosts].sort(() => Math.random() - 0.5);
      const selectedPosts = shuffled.slice(0, limit);

      const queuedPosts = selectedPosts.map((post: any, index: number) => ({
        id: `queued-${index}`,
        imageUrl: post.display_url || post.thumbnail_url || post.image_url || '',
        caption: post.caption?.text || post.caption || 'No caption available',
        sourceUsername: (automationSettings.sourceProfileData as any)?.username || 'source',
        status: 'queued',
        scheduledDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
        postData: {
          timestamp: post.taken_at || post.timestamp,
          likes: post.like_count,
          comments: post.comment_count,
        },
      })).filter((post: any) => post.imageUrl);

      res.json(queuedPosts);
    } catch (error) {
      console.error('Get queued posts error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get queued posts" 
      });
    }
  });

  // Generate repost content from confirmed source profile
  app.post("/api/generate-repost", async (req, res) => {
    try {
      const automationSettings = await storage.getAutomationSettings();
      
      if (!automationSettings || !automationSettings.isProfileConfirmed) {
        return res.status(400).json({ error: "No confirmed source profile found. Please confirm a profile first." });
      }

      const sourcePosts = automationSettings.sourceProfilePosts as any[] || [];
      if (sourcePosts.length === 0) {
        return res.status(400).json({ error: "No posts available from the source profile" });
      }

      // Select a random post
      const randomPost = sourcePosts[Math.floor(Math.random() * sourcePosts.length)];
      
      // Extract image URL and caption
      const imageUrl = randomPost.display_url || randomPost.thumbnail_url || randomPost.image_url || '';
      const originalCaption = randomPost.caption?.text || randomPost.caption || '';
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Selected post has no image" });
      }

      // Get all captions for style learning
      const allCaptions = sourcePosts
        .map((post: any) => post.caption?.text || post.caption || '')
        .filter((caption: string) => caption.length > 0);

      // Paraphrase the caption using OpenAI
      const paraphrasedCaption = await paraphraseCaption({
        originalCaption,
        profileUsername: (automationSettings.sourceProfileData as any)?.username || 'source',
        sampleCaptions: allCaptions,
      });

      res.json({
        imageUrl,
        originalCaption,
        paraphrasedCaption,
        sourceUsername: (automationSettings.sourceProfileData as any)?.username,
        postData: {
          timestamp: randomPost.taken_at || randomPost.timestamp,
          likes: randomPost.like_count,
          comments: randomPost.comment_count,
        },
      });
    } catch (error) {
      console.error('Generate repost error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate repost content" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
