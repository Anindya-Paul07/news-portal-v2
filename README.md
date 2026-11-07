# The Contemporary News – Frontend

BBC/CNN-inspired news experience with a Material-tinted palette. Public reader site plus `/admin` CMS, wired to the backoffice APIs (`/api/v1`) hosted at `backoffice.thecontemporary.news`.

## Stack
- Next.js 16 (App Router), React 19
- Tailwind CSS v4
- @tanstack/react-query for data + caching
- Next fonts: Playfair Display (headlines) + Work Sans (body)

## Environment
Create a `.env.local` or export the following:

```
NEXT_PUBLIC_API_BASE=https://backoffice.thecontemporary.news
FRONTEND_URL=http://localhost:3000
```

## Run locally
```bash
pnpm install
pnpm dev
# build / lint
pnpm build
pnpm lint
```

## Run with Docker
```bash
docker compose up -d --build web
```

This rebuilds the image and recreates the web container when it changes. Building an image alone does not update a running container. The runtime image uses Next.js standalone output, including its required dependencies, so it does not download packages at startup or during the final image stage. The initial dependency installation still requires registry access.

## Structure
- `src/app/(public)`: reader-facing routes (home, article, category, search, auth, profile)
- `src/app/(admin)/admin`: protected backoffice (dashboard, articles, categories, ads, media, users, settings)
- `src/components`: shared layout, news cards, ads, UI primitives
- `src/hooks/api-hooks.ts`: API query/mutation hooks against `/api/v1` endpoints with graceful fallbacks
- `src/lib/api-client.ts`: fetch client with token + refresh handling

## Notes
- Theme toggle (light/dark) plus language toggle (EN/BN placeholder) in header.
- Ads consume `/advertisements/active` and track impressions/clicks; placeholders render if offline.
- Forms in admin call respective endpoints (`/articles`, `/categories`, `/advertisements`, `/users`, `/media/upload`).
- Reader/auth flows hit `/auth/login`, `/auth/register`, `/auth/me`, `/auth/change-password`, `/auth/profile` via shared client.
