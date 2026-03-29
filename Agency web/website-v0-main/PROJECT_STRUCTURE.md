# Impact Visuals - Next.js Project Structure

## Project Overview
This is a modern React/Next.js conversion of the Impact Visuals marketing agency website.

## Directory Structure

```
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home page
│   └── admin/
│       └── page.tsx         # Admin dashboard page
│
├── components/              # React components
│   ├── Background.tsx      # Animated background with stars and video
│   ├── Header.tsx          # Navigation header with scroll spy
│   ├── Hero.tsx            # Hero section
│   ├── About.tsx           # About section
│   ├── Services.tsx        # Services grid
│   ├── Packages.tsx        # Pricing packages
│   ├── Team.tsx            # Team members grid
│   ├── Contact.tsx         # Contact form
│   ├── Footer.tsx          # Footer
│   ├── AdminLogin.tsx      # Admin authentication
│   └── AdminDashboard.tsx  # Admin leads dashboard
│
├── styles/                  # Global styles
│   ├── globals.css         # Main stylesheet
│   └── animations.css      # Background animations
│
├── public/                  # Static assets
│   └── assets/             # Images and videos
│       ├── *.jpeg          # Team member photos
│       └── animation video.mp4
│
├── package.json            # Dependencies
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Key Features

### 1. **Home Page** (`app/page.tsx`)
- Hero section with animated background
- About section
- Services showcase
- Pricing packages
- Team members
- Contact form

### 2. **Admin Dashboard** (`app/admin/page.tsx`)
- PIN-based authentication (PIN: 1907)
- View all leads/inquiries
- Statistics (total leads, today's leads)
- Delete leads functionality
- Data stored in localStorage

### 3. **Components**
All components are client-side rendered (`'use client'`) to support:
- Scroll animations
- Form handling
- Interactive navigation
- State management

### 4. **Styling**
- Global CSS with CSS variables
- Responsive design
- Smooth animations
- Dark theme with accent colors

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Admin Access

- URL: `/admin`
- PIN: `1907`
- Features: View and manage contact form submissions

## Data Storage

Contact form submissions are stored in `localStorage` under the key `impactVisualsLeads`. This allows the admin dashboard to view all inquiries without a backend.

## Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **CSS3** - Styling with animations
- **Font Awesome** - Icons

## Notes

- All assets are in the `public/assets` directory
- The video background is loaded from `/assets/animation video.mp4`
- Team member images are loaded from `/assets/[name].jpeg`
- Form submissions are client-side only (localStorage)
- For production, consider integrating a backend API for form submissions




