# Vercel Deployment Guide

This guide will help you deploy your portfolio to Vercel step by step.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
3. **MongoDB Atlas**: Free MongoDB database (or your existing MongoDB)
4. **Environment Variables**: All required credentials

## Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

## Step 2: Environment Variables Setup

Before deploying, prepare all your environment variables. You'll need to add them in Vercel dashboard.

### Required Environment Variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_GOOGLE_EMAIL=smmaksudulhaque2000@gmail.com

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
ALLOWED_FACEBOOK_ID=maksudulhaque2000

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=smmaksudulhaque2000@gmail.com

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=maksudulhaque2000
```

### Generate NextAuth Secret:

```bash
openssl rand -base64 32
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account

2. **Import Your Repository**:
   - Click "Import Project"
   - Select your portfolio repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each variable from Step 2 above
   - **Important**: Set `NEXTAUTH_URL` to your Vercel URL (you can update this after first deployment)
   - For production, add all variables with "Production" selected

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (usually 2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   # ... add all other variables
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Update OAuth Redirect URLs

After deployment, update your OAuth provider redirect URLs:

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client
4. Add authorized redirect URI:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

### Facebook OAuth:
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Select your app
3. Go to Settings > Basic
4. Add Valid OAuth Redirect URIs:
   ```
   https://your-app-name.vercel.app/api/auth/callback/facebook
   ```

## Step 5: Update NEXTAUTH_URL

After first deployment:

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `NEXTAUTH_URL` to your production URL:
   ```
   https://your-app-name.vercel.app
   ```
3. Redeploy (or wait for automatic redeploy)

## Step 6: File Upload Configuration (Important!)

**⚠️ Important**: Vercel's serverless functions are stateless and don't persist files. The current file upload system writes to the local filesystem, which won't work on Vercel.

### Option 1: Use Vercel Blob Storage (Recommended)

1. **Install Vercel Blob**:
   ```bash
   npm install @vercel/blob
   ```

2. **Get Blob Storage Token**:
   - Go to Vercel Dashboard > Storage > Create Database
   - Select "Blob" and create
   - Copy the token

3. **Update Upload Route**:
   - Replace `app/api/dashboard/upload/route.ts` to use Vercel Blob
   - Example code:
   ```typescript
   import { put } from '@vercel/blob';
   // ... other imports
   
   const blob = await put(path, buffer, {
     access: 'public',
     contentType: file.type,
   });
   ```

4. **Add Environment Variable**:
   ```
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

### Option 2: Use Cloudinary (Alternative)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Get your API credentials
3. Update upload route to use Cloudinary SDK
4. Add environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Option 3: Use AWS S3

1. Create S3 bucket
2. Configure IAM user with S3 permissions
3. Update upload route to use AWS SDK
4. Add environment variables

**Note**: For now, file uploads will fail on Vercel. You need to implement one of the above solutions before file uploads will work.

## Step 7: Verify Deployment

1. **Check Build Logs**:
   - Go to Vercel Dashboard > Your Project > Deployments
   - Click on the latest deployment to see logs

2. **Test Your Site**:
   - Visit your deployed URL
   - Test all features:
     - Home page loads
     - Navigation works
     - Login works
     - Dashboard accessible
     - API routes respond

3. **Check Environment Variables**:
   - Verify all variables are set correctly
   - Check for any missing variables in logs

## Step 8: Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain
5. Update OAuth redirect URLs

## Troubleshooting

### Build Fails

1. **Check Build Logs**: Look for specific errors
2. **Common Issues**:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies
   - Build timeout (increase in vercel.json)

### Runtime Errors

1. **Check Function Logs**: Vercel Dashboard > Functions
2. **Common Issues**:
   - Database connection errors (check MONGODB_URI)
   - Missing environment variables
   - OAuth callback URL mismatches

### File Upload Issues

1. **Implement Cloud Storage**: See Step 6 above
2. **Check File Size Limits**: Vercel has 4.5MB limit for serverless functions
3. **Use Vercel Blob**: Best option for Vercel deployments

### API Routes Not Working

1. **Check Function Duration**: Default is 10s, max is 30s
2. **Check Body Size**: Limited to 4.5MB by default
3. **Check CORS**: If calling from different domain

## Performance Optimization

1. **Enable Edge Functions** (if applicable)
2. **Use ISR** (Incremental Static Regeneration) for static pages
3. **Optimize Images**: Already configured in next.config.mjs
4. **Enable Compression**: Already enabled in next.config.mjs

## Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Error Tracking**: Check Function Logs regularly
3. **Performance**: Monitor Core Web Vitals

## Continuous Deployment

Vercel automatically deploys when you push to your main branch. To deploy specific branches:

1. Go to Settings > Git
2. Configure branch deployments
3. Add preview deployments for PRs

## Security Checklist

- ✅ All environment variables are set
- ✅ `NEXTAUTH_SECRET` is strong and unique
- ✅ OAuth redirect URLs are correctly configured
- ✅ MongoDB connection string is secure
- ✅ API keys are not exposed in code
- ✅ File uploads use secure cloud storage

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

---

**Happy Deploying! 🚀**

