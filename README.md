# Rua Sadiq Admin Portal (Next.js)

Standalone Next.js admin portal for managing products, categories, and materials.

## Features

- Separate deployable project (portal only)
- **Edit / Create open as full pages** (no popup modals)
- Full-page **loader** while saving / uploading / deleting
- **Confirmation toast** after successful create, update, or delete
- Same API contract as the original portal (`/api/products`, `/api/categories`, `/api/materials`, admin auth)

## Requirements

- Node.js 18+
- Running backend API (the same one your storefront uses)

## Setup

```bash
# 1. Unzip and enter the project
cd portal-next

# 2. Install dependencies
npm install

# 3. Configure API URL
cp .env.example .env.local
# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
# (no trailing slash)

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy (Vercel example)

```bash
# From portal-next folder
npx vercel
# Set env var NEXT_PUBLIC_API_URL in the Vercel dashboard
```

Or any Node host:

```bash
npm run build
npm start
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Portal landing |
| `/login` | Admin login |
| `/dashboard` | Main dashboard (tabs: products / categories / materials) |
| `/products/new` | Create product (full page) |
| `/products/[id]/edit` | Edit product (full page) |
| `/categories/new` | Create category |
| `/categories/[id]/edit` | Edit category |
| `/materials/new` | Create material |
| `/materials/[id]/edit` | Edit material |

## Notes

- Auth token is stored in `localStorage` (`admin_token`).
- CORS must allow this portal origin on your backend.
- Image uploads use the same FormData endpoints as before.
