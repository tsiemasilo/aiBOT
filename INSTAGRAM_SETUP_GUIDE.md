# Instagram Graph API Setup Guide

## Connect Your Real Instagram Account to InstaScheduler

This guide will help you set up **real Instagram posting** for your InstaScheduler app using Instagram's official Graph API.

---

## Prerequisites

### 1. Instagram Account Requirements
Your Instagram account MUST be:
- ✅ **Instagram Business** or **Creator** account (NOT a personal account)
- ✅ Connected to a Facebook Page
- ✅ Public (private accounts won't work)

**Don't have a Business/Creator account?** [Convert your account here](https://help.instagram.com/502981923235522)

---

## Setup Steps

### Step 1: Create a Meta Developer App

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Log in with your Facebook account (the same account connected to your Instagram Business account)

2. **Create a New App**
   - Click "My Apps" → "Create App"
   - Select app type: **Business**
   - Fill in app details:
     - App Name: `InstaScheduler` (or your preferred name)
     - Contact Email: Your email
   - Click "Create App"

3. **Add Instagram Graph API**
   - In your app dashboard, find "Instagram Graph API"
   - Click "Set Up"

### Step 2: Configure Instagram Graph API

1. **Add Product**
   - Go to your app → Products → "Add Products"
   - Find "Instagram Graph API" and click "Set Up"

2. **Get Your App ID and App Secret**
   - Go to Settings → Basic
   - Copy your:
     - **App ID** (e.g., `123456789012345`)
     - **App Secret** (click "Show", then copy)
   - ⚠️ **Keep these secret!** Never share or commit to code

3. **Configure App Settings**
   - In Settings → Basic:
     - **App Domains**: Add your Replit domain
     - **Privacy Policy URL**: Add a privacy policy (required for review)
     - **Terms of Service URL**: Optional but recommended

4. **Set Up OAuth Redirect URIs**
   - Go to Instagram Graph API → Settings
   - Add Valid OAuth Redirect URIs:
     ```
     https://your-replit-app.replit.dev/auth/instagram/callback
     ```
   - Replace `your-replit-app` with your actual Replit URL

### Step 3: Get Required Permissions

The app needs these permissions to post to Instagram:

**Required Scopes:**
- `instagram_basic` - Basic profile data
- `instagram_content_publish` - Create and publish content
- `pages_show_list` - List Facebook Pages
- `pages_read_engagement` - Read Page data

**Optional (for analytics):**
- `instagram_manage_insights` - View insights and metrics

### Step 4: Connect Instagram Business Account

1. **Go to Instagram API → Tools**
2. **Click "Instagram Account" → "Add or Remove Instagram Business Accounts"**
3. **Select your Instagram Business Account**
4. **Confirm**

### Step 5: Get Your Instagram Business Account ID

1. **Use Graph API Explorer**
   - Go to: https://developers.facebook.com/tools/explorer/
   - Select your app from dropdown
   - Add permissions: `instagram_basic`, `pages_show_list`
   - Click "Generate Access Token"
   - Accept permissions

2. **Get Instagram Account ID**
   - In Graph API Explorer, query:
     ```
     me/accounts
     ```
   - Find your Facebook Page
   - Query the page's Instagram account:
     ```
     {page-id}?fields=instagram_business_account
     ```
   - Copy the `instagram_business_account` ID

---

## Step 6: Add Secrets to Replit

Add these environment variables to your Replit Secrets:

1. **INSTAGRAM_APP_ID**: Your Meta App ID
2. **INSTAGRAM_APP_SECRET**: Your Meta App Secret
3. **INSTAGRAM_BUSINESS_ACCOUNT_ID**: Your Instagram Business Account ID

---

## Testing Checklist

Before going live:

- [ ] Instagram account is Business/Creator (not personal)
- [ ] Facebook Page is connected to Instagram account
- [ ] Meta Developer App is created
- [ ] Instagram Graph API product is added
- [ ] OAuth redirect URI is configured
- [ ] All required permissions are added
- [ ] Instagram Business Account ID is obtained
- [ ] All secrets are added to Replit

---

## Rate Limits & Constraints

- **Daily Posting Limit**: 25 posts per 24 hours
- **Image Format**: JPEG only (no PNG)
- **Image Size**: 600px - 1920px width recommended
- **Aspect Ratio**: Between 4:5 and 1.91:1
- **File Size**: Maximum 8MB
- **Container Expiration**: Media must be published within 24 hours

---

## Going to Production

For production use, you'll need to submit your app for **App Review**:

1. Go to App Review in your Meta Developer App
2. Request permissions:
   - `instagram_content_publish`
   - `instagram_basic`
3. Provide:
   - Detailed use case description
   - Screencast showing your app's functionality
   - Privacy policy and terms of service

**Note:** Until approved, the app only works for you and Test Users you add.

---

## Troubleshooting

### Error: "Instagram account is not a Business account"
- Convert your account to Business or Creator
- Make sure it's connected to a Facebook Page

### Error: "Invalid OAuth Redirect URI"
- Check that your redirect URI exactly matches what's in Meta Developer settings
- Include `https://` and the exact path

### Error: "Permission denied"
- Make sure all required permissions are added in App Review
- Generate a new access token with correct scopes

### Error: "Image format not supported"
- Instagram only accepts JPEG images
- Convert PNG to JPEG before uploading

---

## Need Help?

- **Meta Developer Docs**: https://developers.facebook.com/docs/instagram-api/
- **Content Publishing**: https://developers.facebook.com/docs/instagram-platform/content-publishing/
- **Graph API Reference**: https://developers.facebook.com/docs/graph-api/
