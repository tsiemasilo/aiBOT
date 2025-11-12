const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface PageData {
  id: string;
  name: string;
  access_token: string;
}

interface InstagramAccountResponse {
  instagram_business_account?: {
    id: string;
  };
}

interface MediaContainerResponse {
  id: string;
}

interface PublishResponse {
  id: string;
}

function getRedirectUri(): string {
  const replSlug = process.env.REPL_SLUG;
  const replOwner = process.env.REPL_OWNER;
  
  if (replSlug && replOwner) {
    return `https://${replSlug}.${replOwner}.repl.co/auth/instagram/callback`;
  }
  
  return `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/auth/instagram/callback`;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  
  if (!appId || !appSecret) {
    throw new Error("Instagram App ID or Secret not configured");
  }

  const redirectUri = getRedirectUri();
  
  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.append("client_id", appId);
  url.searchParams.append("client_secret", appSecret);
  url.searchParams.append("code", code);
  url.searchParams.append("redirect_uri", redirectUri);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to exchange code for token");
  }

  return response.json();
}

export async function getLongLivedToken(shortLivedToken: string): Promise<TokenResponse> {
  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  
  if (!appId || !appSecret) {
    throw new Error("Instagram App ID or Secret not configured");
  }

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.append("grant_type", "fb_exchange_token");
  url.searchParams.append("client_id", appId);
  url.searchParams.append("client_secret", appSecret);
  url.searchParams.append("fb_exchange_token", shortLivedToken);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to get long-lived token");
  }

  return response.json();
}

export async function refreshAccessToken(currentToken: string): Promise<TokenResponse> {
  return getLongLivedToken(currentToken);
}

export async function getInstagramBusinessAccountId(accessToken: string): Promise<{ accountId: string; username: string; profilePictureUrl?: string }> {
  const pagesUrl = `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`;
  
  const pagesResponse = await fetch(pagesUrl);
  
  if (!pagesResponse.ok) {
    const error = await pagesResponse.json();
    throw new Error(error.error?.message || "Failed to fetch Facebook Pages");
  }

  const pagesData = await pagesResponse.json();
  const pages: PageData[] = pagesData.data || [];

  if (pages.length === 0) {
    throw new Error("No Facebook Pages found. You need a Facebook Page connected to an Instagram Business Account.");
  }

  for (const page of pages) {
    const igUrl = `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
    
    const igResponse = await fetch(igUrl);
    
    if (igResponse.ok) {
      const igData: InstagramAccountResponse = await igResponse.json();
      
      if (igData.instagram_business_account) {
        const igAccountId = igData.instagram_business_account.id;
        
        const profileUrl = `${GRAPH_API_BASE}/${igAccountId}?fields=username,profile_picture_url&access_token=${page.access_token}`;
        const profileResponse = await fetch(profileUrl);
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          return {
            accountId: igAccountId,
            username: profileData.username || page.name,
            profilePictureUrl: profileData.profile_picture_url,
          };
        }
        
        return {
          accountId: igAccountId,
          username: page.name,
        };
      }
    }
  }

  throw new Error("No Instagram Business Account found. Please connect your Instagram Business Account to your Facebook Page.");
}

export async function publishToInstagram(
  accountId: string,
  imageUrl: string,
  caption: string,
  accessToken: string
): Promise<{ mediaId: string }> {
  const containerUrl = `${GRAPH_API_BASE}/${accountId}/media`;
  
  const containerResponse = await fetch(containerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken,
    }),
  });

  if (!containerResponse.ok) {
    const error = await containerResponse.json();
    throw new Error(error.error?.message || "Failed to create media container");
  }

  const containerData: MediaContainerResponse = await containerResponse.json();
  const creationId = containerData.id;

  await new Promise(resolve => setTimeout(resolve, 2000));

  const publishUrl = `${GRAPH_API_BASE}/${accountId}/media_publish`;
  
  const publishResponse = await fetch(publishUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: accessToken,
    }),
  });

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(error.error?.message || "Failed to publish media");
  }

  const publishData: PublishResponse = await publishResponse.json();

  return {
    mediaId: publishData.id,
  };
}

export function buildAuthUrl(state: string): string {
  const appId = process.env.INSTAGRAM_APP_ID;
  
  if (!appId) {
    throw new Error("Instagram App ID not configured");
  }

  const redirectUri = getRedirectUri();
  const scopes = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
  
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.append("client_id", appId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("scope", scopes);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("state", state);

  return url.toString();
}
