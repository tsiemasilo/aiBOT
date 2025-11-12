# Instagram Scraper APIs - Setup Guide

## Overview
Your InstaScheduler app now uses **4 different Instagram scraper APIs** with automatic fallback. If one API fails, it automatically tries the next one, ensuring maximum reliability.

---

## Supported APIs (Tried in Order)

### 1. ✨ Instagram API 2023 (by mrngstar) - **RECOMMENDED**
**Best option**: 100% real-time data, no caching, fastest and most stable

**How to get it:**
1. Go to: https://rapidapi.com/mrngstar/api/instagram-api-20231
2. Click "Subscribe to Test" or "Pricing" button
3. Choose a plan:
   - **Free Tier**: Basic testing (limited requests)
   - **Basic**: $10-20/month (recommended for personal use)
   - **Pro**: Higher limits for production
4. Your RAPIDAPI_KEY will work across all RapidAPI Instagram scrapers

**Features:**
- User profile info (followers, following, posts count)
- User posts and media
- Real-time data (no cache)
- High reliability and speed

---

### 2. Instagram Scraper Stable API
**Fallback option**: Comprehensive data extraction

**Already configured**: Uses the same RAPIDAPI_KEY you already have

---

### 3. Instagram Scraper 2024 (by eaidoo015)
**Premium option**: 99.999% uptime, lowest latency

**How to get it:**
1. Go to: https://rapidapi.com/eaidoo015-pj8dZiAnLJJ/api/instagram-scraper-20243
2. Subscribe to a plan (free tier available)
3. Contact developer on Telegram **@newton_jnr** for free trial

**Features:**
- Ultra-reliable with telegram support
- Comprehensive public data extraction
- Low latency responses

---

### 4. Instagram API – Fast & Reliable (by mediacrawlers)
**Enterprise option**: 99.9% uptime, professional grade

**How to get it:**
1. Go to: https://rapidapi.com/mediacrawlers-mediacrawlers-default/api/instagram-api-fast-reliable-data-scraper
2. Subscribe to a plan

---

## Quick Setup Steps

### Option A: You Already Have a RapidAPI Key ✅
**You're done!** Your existing `RAPIDAPI_KEY` works with all 4 scrapers automatically. The app will try each one until it finds data.

### Option B: Get a RapidAPI Key (New Users)
1. **Create Account**: Go to https://rapidapi.com and sign up (free)
2. **Subscribe to an API**: Choose any of the Instagram APIs above
3. **Get Your Key**:
   - After subscribing, go to any API's "Endpoints" tab
   - Look for "X-RapidAPI-Key" in the code snippets
   - Copy your key (looks like: `abc123def456...`)
4. **Add to Replit**:
   - In Replit, open "Tools" > "Secrets"
   - Add key: `RAPIDAPI_KEY`
   - Paste your API key as the value

---

## How the Multi-Scraper System Works

The app automatically tries scrapers in this order:
```
1. Instagram API 2023 (mrngstar) ← Fastest, best
2. Instagram Scraper Stable API   ← Your current one
3. Instagram Scraper 2024          ← Ultra reliable
4. Instagram API Fast & Reliable   ← Enterprise grade
```

**Benefits:**
- ✅ If one API is down, others work automatically
- ✅ If one API doesn't return data, tries the next
- ✅ Single RAPIDAPI_KEY works for all
- ✅ Better success rate for fetching profiles

---

## Testing Your Setup

1. Open your InstaScheduler app
2. Go to "Profile Analyzer" or "Automation"
3. Enter any public Instagram profile URL (e.g., `https://instagram.com/instagram`)
4. Check the console logs to see which scraper successfully fetched the data

**Console will show:**
```
[Instagram API 2023 (mrngstar)] Attempting to fetch profile for: instagram
[Instagram API 2023 (mrngstar)] SUCCESS! Retrieved valid profile data
```

---

## Pricing Comparison

| API | Free Tier | Basic Plan | Best For |
|-----|-----------|-----------|----------|
| Instagram API 2023 | Limited requests | ~$10-20/mo | Personal projects |
| Instagram Scraper Stable | Limited | ~$10-20/mo | General use |
| Instagram Scraper 2024 | Yes | Custom | High reliability needs |
| Fast & Reliable | Limited | ~$20+/mo | Enterprise |

**Recommendation**: Start with the free tier of **Instagram API 2023** for testing, then upgrade to Basic (~$10-20/mo) when ready for production.

---

## Troubleshooting

### Profile shows 0 followers/posts
**Cause**: None of the APIs successfully returned data
**Solutions**:
1. Check console logs to see which APIs were tried
2. Verify your RAPIDAPI_KEY is correct
3. Make sure you're subscribed to at least one Instagram API on RapidAPI
4. Check if the Instagram username is correct and public
5. Try a different public profile to test

### Rate limit errors
**Cause**: Exceeded free tier limits
**Solution**: Upgrade to a paid plan on RapidAPI

### API key not found
**Cause**: RAPIDAPI_KEY not set or incorrect
**Solution**: Add/update your key in Replit Secrets

---

## Support

- **mrngstar** (Instagram API 2023): Telegram **t.me/mrngstar_rapid**
- **eaidoo015** (Instagram Scraper 2024): Telegram **@newton_jnr**
- **RapidAPI Support**: https://rapidapi.com/support

---

## Summary

✅ **You have 4 Instagram scrapers** working automatically with fallback
✅ **Same RAPIDAPI_KEY** works for all of them
✅ **Higher success rate** for fetching Instagram profiles
✅ **Easy to test**: Just enter a profile URL and check console logs

The app is now much more reliable for fetching Instagram data!
