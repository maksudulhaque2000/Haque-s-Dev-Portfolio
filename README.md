# Maksudul Haque - Portfolio Website

A modern, fast, and feature-rich portfolio website built with Next.js 16, Tailwind CSS 4, MongoDB, and shadcn/ui.

## Features

- 🚀 **Modern Tech Stack**: Next.js 16, Tailwind CSS 4, MongoDB, TypeScript
- 🎨 **Beautiful UI**: Responsive design with light/dark mode support
- 📱 **Fully Responsive**: Works perfectly on all devices
- ⚡ **Fast Performance**: Optimized for speed and SEO
- 🔐 **Admin Dashboard**: Full CRUD operations for all sections
- 🔑 **Authentication**: Email/Password, Google, and Facebook OAuth (restricted)
- 📄 **Dynamic Resume**: Generate ATS-friendly LaTeX resume
- 📝 **Blog System**: Full blog management with comments and reactions
- 🎯 **GitHub Integration**: Sync projects from GitHub
- 📧 **Contact Form**: Email integration with Resend

## Sections

- **Home**: Hero section with profile image and CTA buttons
- **About**: Personal information, languages, interests, and resume download
- **Skills**: Filterable skills by category (Frontend, Backend, Others)
- **Projects**: GitHub-integrated projects with filtering and pagination
- **Resume**: Experience and Education tabs with certificates
- **Blogs**: Full blog system with search, pagination, comments, and reactions
- **Contact**: Contact form with email integration

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)
- GitHub Personal Access Token
- Google OAuth credentials (optional)
- Facebook App credentials (optional)
- Resend API key for email functionality

## 🚀 Quick Deployment to Vercel

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Quick Steps:
1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add all environment variables (see [ENV_VARIABLES.md](./ENV_VARIABLES.md))
4. Deploy!

**Important**: File uploads won't work on Vercel without cloud storage. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md#step-6-file-upload-configuration-important) for setup instructions.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd haque-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_GOOGLE_EMAIL=smmaksudulhaque2000@gmail.com

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
ALLOWED_FACEBOOK_ID=maksudulhaque2000

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=smmaksudulhaque2000@gmail.com

# GitHub (for Projects)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=maksudulhaque2000
```

4. Generate NextAuth secret:
```bash
openssl rand -base64 32
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Initial Setup

1. **Create Admin User**:
   - Go to `/login`
   - Use email: `smmaksudulhaque2000@gmail.com` and password: `474975moon@`
   - Or use Google/Facebook OAuth (must be your authorized accounts)

2. **Setup Database**:
   - The application will automatically create collections on first run
   - You can also seed initial data using API routes

3. **Configure GitHub Integration**:
   - Create a GitHub Personal Access Token with `repo` scope
   - Add it to `.env` as `GITHUB_TOKEN`
   - Projects will sync automatically in the dashboard

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Admin dashboard
│   ├── login/         # Login page
│   └── page.tsx       # Home page
├── components/
│   ├── sections/      # Page sections
│   ├── ui/           # Reusable UI components
│   └── providers/    # Context providers
├── lib/
│   ├── models/       # MongoDB models
│   └── utils/        # Utility functions
└── public/           # Static files
```

## Admin Dashboard

Access the dashboard at `/dashboard` after logging in. You can manage:

- **Home**: Update profile image, name, title, description
- **About**: Edit about section, add languages, interests, location
- **Skills**: Add, edit, delete skills
- **Projects**: Approve/disapprove GitHub projects, add custom projects
- **Experience**: Manage work experience entries
- **Education**: Manage education entries with certificates
- **Blogs**: Create, edit, delete blog posts

## Technologies Used

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **UI Components**: shadcn/ui, Lucide Icons
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod
- **Email**: Resend
- **PDF Generation**: jsPDF (for resume)

## License

© 2025 Maksudul Haque. All rights reserved.

## Support

For issues or questions, please contact: smmaksudulhaque2000@gmail.com
