# Deployment Guide for LearnAI

## Prerequisites
- Node.js 18+ installed
- Git repository set up
- Vercel account
- Supabase account
- Google Cloud Console account

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be created

### 1.2 Get API Keys
1. In your project dashboard, go to Settings → API
2. Copy the following:
   - Project URL
   - Anon public key

### 1.3 Enable Google Auth
1. Go to Authentication → Providers
2. Find Google and click "Edit"
3. Note the callback URL (you'll need this for Google Cloud Console)
4. Keep this page open for later

## Step 2: Set Up Google Cloud Console

### 2.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://your-project-name.vercel.app` (for production)
7. Add authorized redirect URIs:
   - Copy the callback URL from Supabase Google provider
8. Copy the Client ID and Client Secret

### 2.2 Configure OAuth Consent Screen
1. Go to OAuth consent screen
2. Choose "External" user type
3. Fill in app information
4. Add your Vercel domain to authorized domains

## Step 3: Configure Supabase Google Auth

### 3.1 Add Google Credentials
1. Go back to Supabase → Authentication → Providers → Google
2. Paste the Client ID and Client Secret from Google Cloud Console
3. Click "Save"

### 3.2 Configure Site URL
1. Go to Authentication → URL Configuration
2. Set Site URL to your Vercel domain: `https://your-project-name.vercel.app`
3. Add redirect URLs if needed

## Step 4: Deploy to Vercel

### 4.1 Push to Git
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 4.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 4.3 Set Environment Variables
In Vercel project settings → Environment Variables, add:

**Production:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=https://your-project-name.vercel.app/graphql
```

**Development:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:3001/graphql
```

### 4.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your production URL

## Step 5: Final Configuration

### 5.1 Update Supabase Site URL
1. Go back to Supabase → Authentication → URL Configuration
2. Ensure Site URL matches your Vercel domain exactly

### 5.2 Test Authentication
1. Visit your deployed app
2. Try signing in with Google
3. Check browser console for any errors

## Step 6: Local Development

### 6.1 Create .env.local
```bash
cp env.example .env.local
```

### 6.2 Fill in local values
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:3001/graphql
```

### 6.3 Install dependencies and run
```bash
npm install
npm run dev
```

## Troubleshooting

### Common Issues

1. **Google Sign-In not working**
   - Check redirect URIs in Google Cloud Console
   - Verify Site URL in Supabase matches exactly
   - Check browser console for CORS errors

2. **Environment variables not loading**
   - Ensure variable names start with `VITE_`
   - Redeploy after adding environment variables
   - Check Vercel function logs

3. **GraphQL API errors**
   - Verify API endpoint in environment variables
   - Check Vercel function logs
   - Ensure all dependencies are installed

### Support
- Check Vercel deployment logs
- Review Supabase authentication logs
- Verify Google Cloud Console OAuth configuration
