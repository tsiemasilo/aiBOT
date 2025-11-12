interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  profilePicUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  recentPosts: Array<{
    imageUrl: string;
    caption: string;
    timestamp: any;
  }>;
}

interface ScraperConfig {
  name: string;
  host: string;
  endpoints: {
    profile?: string;
    posts?: string;
  };
  extractProfile: (data: any, username: string) => Partial<InstagramProfile>;
  extractPosts: (data: any) => any[];
}

const scrapers: ScraperConfig[] = [
  {
    name: "Instagram API 2023 (mrngstar)",
    host: "instagram-api-20231.p.rapidapi.com",
    endpoints: {
      profile: "/user",
      posts: "/user/posts"
    },
    extractProfile: (data: any, username: string) => {
      const user = data?.user || data?.data?.user || data;
      return {
        username: user.username || username,
        fullName: user.full_name || user.fullName || "",
        bio: user.biography || user.bio || "",
        profilePicUrl: user.profile_pic_url_hd || user.profile_pic_url || user.hd_profile_pic_url_info?.url || "",
        followersCount: user.follower_count || user.edge_followed_by?.count || 0,
        followingCount: user.following_count || user.edge_follow?.count || 0,
        postsCount: user.media_count || user.edge_owner_to_timeline_media?.count || 0,
      };
    },
    extractPosts: (data: any) => {
      return data?.items || data?.data?.items || data?.posts || data?.data || [];
    }
  },
  {
    name: "Instagram Scraper Stable API",
    host: "instagram-scraper-stable-api.p.rapidapi.com",
    endpoints: {
      profile: "/ig_get_fb_profile_hover.php",
      posts: "/get_ig_user_reels.php"
    },
    extractProfile: (data: any, username: string) => {
      const user = data?.user_data || data?.user || data?.data?.user || data?.data || data;
      return {
        username: user.username || username,
        fullName: user.full_name || user.fullName || user.name || "",
        bio: user.biography || user.bio || user.description || "",
        profilePicUrl: user.profile_pic_url || user.profile_pic_url_hd || user.hd_profile_pic_url_info?.url || user.profile_picture || user.profile_pic || "",
        followersCount: user.follower_count || user.edge_followed_by?.count || user.followers || user.followers_count || 0,
        followingCount: user.following_count || user.edge_follow?.count || user.following || user.following_count || 0,
        postsCount: user.media_count || user.edge_owner_to_timeline_media?.count || user.posts_count || user.posts || 0,
      };
    },
    extractPosts: (data: any) => {
      const items = data?.medias || data?.reels || data?.data?.items || data?.items || data?.data || [];
      return Array.isArray(items) ? items : [];
    }
  },
  {
    name: "Instagram Scraper 2024",
    host: "instagram-scraper-20243.p.rapidapi.com",
    endpoints: {
      profile: "/v1/info",
      posts: "/v1/posts"
    },
    extractProfile: (data: any, username: string) => {
      const user = data?.data || data?.user || data;
      return {
        username: user.username || username,
        fullName: user.full_name || user.fullName || user.name || "",
        bio: user.biography || user.bio || "",
        profilePicUrl: user.profile_pic_url || user.profile_pic_url_hd || user.profilePicUrl || user.hd_profile_pic_url_info?.url || "",
        followersCount: user.follower_count || user.edge_followed_by?.count || user.followers || 0,
        followingCount: user.following_count || user.edge_follow?.count || user.following || 0,
        postsCount: user.post_count || user.media_count || user.edge_owner_to_timeline_media?.count || user.posts || 0,
      };
    },
    extractPosts: (data: any) => {
      return data?.data?.items || data?.items || data?.data?.posts || data?.posts || [];
    }
  },
  {
    name: "Instagram API – Fast & Reliable",
    host: "instagram-api-fast-reliable-data-scraper.p.rapidapi.com",
    endpoints: {
      profile: "/user/info",
      posts: "/user/posts"
    },
    extractProfile: (data: any, username: string) => {
      const user = data?.data || data?.user || {};
      return {
        username: user.username || username,
        fullName: user.full_name || user.fullName || user.name || "",
        bio: user.biography || user.bio || "",
        profilePicUrl: user.profile_pic_url || user.profile_pic_url_hd || user.profilePicUrl || "",
        followersCount: user.follower_count || user.followers_count || user.followers || 0,
        followingCount: user.following_count || user.followings_count || user.following || 0,
        postsCount: user.media_count || user.posts_count || user.posts || 0,
      };
    },
    extractPosts: (data: any) => {
      return data?.data?.items || data?.items || data?.posts || [];
    }
  }
];

export async function fetchInstagramProfile(username: string, rapidApiKey: string): Promise<InstagramProfile> {
  let lastError: any = null;
  
  for (const scraper of scrapers) {
    try {
      console.log(`\n[${scraper.name}] Attempting to fetch profile for: ${username}`);
      
      let profileData: Partial<InstagramProfile> = { username };
      let postsData: any[] = [];
      
      const usernameParam = scraper.host === "instagram-scraper-stable-api.p.rapidapi.com" 
        ? "username_or_url" 
        : "username";
      
      if (scraper.endpoints.profile) {
        try {
          const profileUrl = `https://${scraper.host}${scraper.endpoints.profile}?${usernameParam}=${username}`;
          console.log(`[${scraper.name}] Profile URL: ${profileUrl}`);
          
          const response = await fetch(profileUrl, {
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': scraper.host
            }
          });
          
          console.log(`[${scraper.name}] Profile response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`[${scraper.name}] Profile data received:`, JSON.stringify(data).substring(0, 500));
            profileData = { ...profileData, ...scraper.extractProfile(data, username) };
          }
        } catch (error) {
          console.log(`[${scraper.name}] Profile fetch failed:`, error);
        }
      }
      
      if (scraper.endpoints.posts) {
        try {
          const isStableAPI = scraper.host === "instagram-scraper-stable-api.p.rapidapi.com";
          
          let response;
          if (isStableAPI) {
            const formData = new URLSearchParams();
            formData.append('username', username);
            
            console.log(`[${scraper.name}] Posts URL (POST): https://${scraper.host}${scraper.endpoints.posts}`);
            response = await fetch(`https://${scraper.host}${scraper.endpoints.posts}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': scraper.host
              },
              body: formData
            });
          } else {
            const postsUrl = `https://${scraper.host}${scraper.endpoints.posts}?username=${username}`;
            console.log(`[${scraper.name}] Posts URL: ${postsUrl}`);
            response = await fetch(postsUrl, {
              headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': scraper.host
              }
            });
          }
          
          console.log(`[${scraper.name}] Posts response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`[${scraper.name}] Posts data received:`, JSON.stringify(data).substring(0, 500));
            
            const extractedProfile = scraper.extractProfile(data, username);
            profileData = { ...profileData, ...extractedProfile };
            
            postsData = scraper.extractPosts(data);
            console.log(`[${scraper.name}] Extracted ${postsData.length} posts`);
          }
        } catch (error) {
          console.log(`[${scraper.name}] Posts fetch failed:`, error);
        }
      }
      
      const recentPosts = postsData.slice(0, 12).map((post: any) => ({
        imageUrl: post.display_url || post.thumbnail_url || post.image_url || post.url || 
                  post.image_versions2?.candidates?.[0]?.url || post.media_url || "",
        caption: post.caption?.text || post.caption || post.edge_media_to_caption?.edges?.[0]?.node?.text || "",
        timestamp: post.taken_at || post.timestamp || post.taken_at_timestamp || Date.now() / 1000,
      })).filter((post: any) => post.imageUrl);
      
      const hasValidData = (
        (profileData.followersCount && profileData.followersCount > 0) ||
        (profileData.postsCount && profileData.postsCount > 0) ||
        recentPosts.length > 0
      );
      
      if (hasValidData) {
        console.log(`[${scraper.name}] SUCCESS! Retrieved valid profile data`);
        return {
          username,
          fullName: profileData.fullName || "",
          bio: profileData.bio || "",
          profilePicUrl: profileData.profilePicUrl || "",
          followersCount: profileData.followersCount || 0,
          followingCount: profileData.followingCount || 0,
          postsCount: profileData.postsCount || recentPosts.length,
          recentPosts
        };
      }
      
      console.log(`[${scraper.name}] No valid data extracted, trying next scraper...`);
      
    } catch (error) {
      lastError = error;
      console.log(`[${scraper.name}] Error:`, error);
    }
  }
  
  throw new Error(
    lastError?.message || 
    "All Instagram scrapers failed. Please verify the username exists and try again."
  );
}

export async function fetchInstagramPosts(username: string, rapidApiKey: string): Promise<any[]> {
  for (const scraper of scrapers) {
    if (!scraper.endpoints.posts) continue;
    
    try {
      console.log(`[${scraper.name}] Fetching posts for: ${username}`);
      
      const isStableAPI = scraper.host === "instagram-scraper-stable-api.p.rapidapi.com";
      
      let response;
      if (isStableAPI) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        
        response = await fetch(`https://${scraper.host}${scraper.endpoints.posts}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': scraper.host
          },
          body: formData
        });
      } else {
        const postsUrl = `https://${scraper.host}${scraper.endpoints.posts}?username=${username}`;
        response = await fetch(postsUrl, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': scraper.host
          }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        const posts = scraper.extractPosts(data);
        
        if (posts.length > 0) {
          console.log(`[${scraper.name}] Successfully fetched ${posts.length} posts`);
          return posts;
        }
      }
    } catch (error) {
      console.log(`[${scraper.name}] Failed to fetch posts:`, error);
    }
  }
  
  return [];
}
