# How to Find Your API Endpoints

Since you've subscribed to Instagram APIs, you can see the exact endpoints in your RapidAPI dashboard. Here's how:

## Step 1: Go to Your Subscribed API

Pick ONE API you subscribed to (I recommend starting with just one):

- Instagram Scraper Stable API: https://rapidapi.com/thetechguy32744/api/instagram-scraper-stable-api
- OR Instagram28 (IG): https://rapidapi.com/yuananf/api/instagram28
- OR Instagram API 2023: https://rapidapi.com/mrngstar/api/instagram-api-20231

## Step 2: Find the "User Info" or "User Posts" Endpoint

1. **Click on the "Endpoints" tab** (left sidebar)
2. **Look for these endpoint names:**
   - "Get User Info" / "User Info" / "User Data"
   - "Get User Posts" / "User Posts" / "User Feed"

3. **Click on one of them**

4. **On the right side**, you'll see a code example like this:

```javascript
const options = {
  method: 'GET',
  url: 'https://instagram-scraper-api.p.rapidapi.com/v1/info',  // ← THIS IS THE ENDPOINT PATH
  params: {username: 'instagram'},
  headers: {
    'X-RapidAPI-Key': 'YOUR_KEY',
    'X-RapidAPI-Host': 'instagram-scraper-api.p.rapidapi.com'
  }
};
```

## Step 3: Tell Me What You Found

From the code example above, I need these 3 things:

1. **The API Host** (example: `instagram-scraper-api.p.rapidapi.com`)
2. **The Endpoint Path for User Info** (example: `/v1/info`)
3. **The Endpoint Path for User Posts** (example: `/v1/posts`)
4. **The parameter name** (example: `username` or `user_name` or `username_or_url`)

## Step 4: Test It First

Before telling me, **test it on RapidAPI**:

1. Enter `instagram` as the username parameter
2. Click "Test Endpoint"
3. You should see JSON data with follower counts, bio, etc.

If it works ✅, tell me those 3-4 things above and I'll update the code!

---

## Example Response

Tell me something like this:

> "I'm using Instagram28 API:
> - Host: `instagram28.p.rapidapi.com`
> - User Info endpoint: `/user_info`
> - User Posts endpoint: `/user_feed`
> - Parameter name: `user_name`"

Then I can fix the code in 1 minute! 🚀
