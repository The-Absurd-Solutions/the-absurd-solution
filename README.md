# The Absurd Solution

Creative agency portfolio website built with React, Vite, and Tailwind CSS.

## Tech Stack

- React 19
- Vite 6
- Tailwind CSS 4
- Framer Motion
- Lucide React Icons
- TypeScript

## Features

- ✅ **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- ✅ **Accessible** - WCAG compliant, ARIA labels, skip-to-content, keyboard navigation
- ✅ **Error Handling** - ErrorBoundary component for graceful error recovery
- ✅ **Loading States** - Skeleton loaders and spinners
- ✅ **Contact Form** - Formspree integration with loading/success/error states
- ✅ **PWA Ready** - Web manifest for installability
- ✅ **Responsive** - Mobile-first design with hamburger menu
- ✅ **Animations** - Smooth scroll, hover effects, page transitions
- ✅ **Code Quality** - ESLint + Prettier configured

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run typecheck    # Run TypeScript type checking
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `VITE_FORMSPREE_ENDPOINT` | Formspree form endpoint URL |
| `VITE_SITE_URL` | Production site URL |

## Project Structure

```
├── components/
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── ErrorBoundary.tsx
│   ├── GlitchText.tsx
│   ├── Hero.tsx
│   ├── LoadingSpinner.tsx
│   ├── MobiusLoop.tsx
│   ├── Portfolio.tsx
│   ├── Process.tsx
│   ├── Services.tsx
│   └── SkipToContent.tsx
├── public/
│   ├── images/
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── App.tsx
├── index.css
├── index.html
├── index.tsx
├── types.ts
└── ...config files
```

## Deployment

Build the project and deploy the `dist` folder to any static hosting:

```bash
npm run build
```

Recommended platforms:
- Vercel
- Netlify
- AWS Amplify
- Cloudflare Pages

## License

© 2026 The Absurd Solution. All wrongs reserved.
