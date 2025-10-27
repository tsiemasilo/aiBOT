import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertScheduleSettingsSchema, insertAutomationSettingsSchema, insertConnectedAccountSchema } from "@shared/schema";

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

      // Extract username from URL
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

      // Fetch profile data
      const profileResponse = await fetch(
        `https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_about.php?username_or_url=${username}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
          }
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();

      // Fetch recent posts for preview
      let recentPosts = [];
      const postEndpoints = ['get_user_posts.php', 'get_ig_posts.php'];
      
      for (const endpoint of postEndpoints) {
        try {
          const postsResponse = await fetch(
            `https://instagram-scraper-stable-api.p.rapidapi.com/${endpoint}?username_or_url=${username}`,
            {
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
              }
            }
          );

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            const posts = postsData.data?.items || postsData.items || postsData.data || [];
            if (posts.length > 0) {
              recentPosts = posts.slice(0, 12).map((post: any) => ({
                imageUrl: post.display_url || post.thumbnail_url || post.image_url,
                caption: post.caption?.text || post.caption || '',
                timestamp: post.taken_at || post.timestamp,
              }));
              break;
            }
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}, trying next...`);
        }
      }

      // Return preview data
      res.json({
        username,
        fullName: profileData.data?.full_name || profileData.full_name,
        bio: profileData.data?.biography || profileData.biography,
        profilePicUrl: profileData.data?.profile_pic_url || profileData.profile_pic_url,
        followersCount: profileData.data?.follower_count || profileData.follower_count,
        followingCount: profileData.data?.following_count || profileData.following_count,
        postsCount: profileData.data?.media_count || profileData.media_count,
        recentPosts,
      });
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

      // Fetch all posts from the profile for automation to use
      let allPosts = [];
      const username = profileData.username;
      const postEndpoints = ['get_user_posts.php', 'get_ig_posts.php'];
      
      for (const endpoint of postEndpoints) {
        try {
          const postsResponse = await fetch(
            `https://instagram-scraper-stable-api.p.rapidapi.com/${endpoint}?username_or_url=${username}`,
            {
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
              }
            }
          );

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            const posts = postsData.data?.items || postsData.items || postsData.data || [];
            if (posts.length > 0) {
              allPosts = posts;
              break;
            }
          }
        } catch (error) {
          console.log(`Failed to fetch posts from ${endpoint}`);
        }
      }

      // Save confirmed profile and posts to automation settings
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

      // Extract username from URL, handling query parameters and trailing slashes
      let username = '';
      try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        username = pathParts[0]?.replace('@', '') || '';
      } catch {
        // Fallback to simple split if URL parsing fails
        username = url.split('/').filter(Boolean).pop()?.split('?')[0]?.replace('@', '') || '';
      }
      
      if (!username || username.length > 30 || !/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.status(400).json({ error: "Invalid Instagram username format" });
      }

      const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      if (!RAPIDAPI_KEY) {
        return res.status(503).json({ error: "Profile analysis service is currently unavailable" });
      }

      // Fetch user profile data using correct endpoint format
      const profileResponse = await fetch(
        `https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_about.php?username_or_url=${username}`,
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
        throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      console.log('Profile data received:', JSON.stringify(profileData).substring(0, 300));

      // Try to fetch user posts/media - trying multiple endpoint patterns
      let posts = [];
      const postEndpoints = [
        'get_user_posts.php',
        'get_ig_posts.php',
        'user_posts.php',
        'ig_user_posts.php'
      ];

      for (const endpoint of postEndpoints) {
        try {
          const postsResponse = await fetch(
            `https://instagram-scraper-stable-api.p.rapidapi.com/${endpoint}?username_or_url=${username}`,
            {
              headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
              }
            }
          );

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            console.log(`Posts fetched from ${endpoint}:`, JSON.stringify(postsData).substring(0, 300));
            posts = postsData.data?.items || postsData.items || postsData.data || [];
            if (posts.length > 0) break;
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
        }
      }

      if (posts.length === 0) {
        console.log('Could not fetch posts from any endpoint. Analysis will be limited to profile data.');
      }

      // Analyze content
      const analyzedData = analyzeInstagramContent(username, profileData, posts);

      // Save analyzed data to automation settings (for backward compatibility with old analyzer)
      await storage.saveAutomationSettings({
        sourceProfileUrl: url,
        sourceProfileData: { username, ...profileData },
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

  const httpServer = createServer(app);
  return httpServer;
}
