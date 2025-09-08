# Alpha - Project Management App

A modern, full-featured project management application built with Next.js 14+, Supabase, and shadcn/ui components. Features authentication, real-time database, dark mode, and is optimized for static deployment to CDNs like Cloudflare Pages, Vercel, or Netlify.

## Features

- ✅ **Authentication System**: Email/password signup, login, logout, password reset
- ✅ **Protected Routes**: Secure pages that require authentication
- ✅ **User Profile Management**: Update profile information and settings
- ✅ **Task Management**: Create, update, delete, and organize tasks with priorities and due dates
- ✅ **Project Management**: Organize work into projects with different statuses
- ✅ **Dashboard**: Overview of tasks and projects with statistics
- ✅ **Real-time Updates**: Live updates when data changes
- ✅ **Dark Mode**: System, light, and dark theme support
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Static Export**: Optimized for CDN deployment
- ✅ **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React 19, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui components, Lucide icons
- **Backend**: Supabase (Auth, Database, Real-time)
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Static export for CDN deployment

## Database Schema

The application uses the following Supabase tables:

### profiles
```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### tasks
```sql
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
```

### projects
```sql
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own projects
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd alpha-app

# Install dependencies
npm install
```

### 3. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings → API
3. Copy your project URL and anon key
4. In the SQL Editor, run the database schema provided above
5. Go to Authentication → Settings and configure:
   - Enable email confirmations (optional)
   - Set up OAuth providers if desired (Google, GitHub, etc.)

### 4. Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 6. Build and Export

```bash
# Build and export for static deployment
npm run build

# The static files will be in the 'out' directory
```

## Deployment

This app is configured for static export and can be deployed to any CDN or static hosting service.

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set the build command: `npm run build`
3. Set the build output directory: `out`
4. Add your environment variables in the Pages settings
5. Deploy!

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js and configure build settings
3. Add your environment variables in the project settings
4. Deploy!

### Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `out`
4. Add your environment variables in the site settings
5. Deploy!

### Custom CDN

After building (`npm run build`), upload the contents of the `out` directory to your CDN or static hosting service.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `ASSET_PREFIX` | CDN asset prefix (optional) | No |
| `NEXT_PUBLIC_SITE_URL` | Your deployed app URL | No |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects page
│   ├── tasks/             # Tasks page
│   ├── profile/           # Profile page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── projects/          # Project components
│   ├── tasks/             # Task components
│   ├── theme/             # Theme components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
    └── database.ts        # Database types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server (not needed for static export)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
