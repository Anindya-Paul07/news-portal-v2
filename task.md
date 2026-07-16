# Frontend/UI task brief – News Portal (Next.js)

Goal: Build a public news site plus CMS/Admin panels, inspired by BBC/CNN clarity and hierarchy, leveraging existing backend APIs (Express + Prisma). Prioritize fast load, strong typography, clean grids, high contrast, minimal ornamentation.

Backend modules to mirror
- Auth: register/login/refresh/logout, profile, change password.
- Users: admin-only user CRUD, role assignment (super_admin/admin/journalist/reader), activation flags.
- Articles: public browse/search/sort/filter; featured/breaking/trending/latest; single article view with hero; related articles; stats (admin).
- Categories: hierarchical menu + landing pages; menu-friendly tree.
- Advertisements: placements (banner/sidebar/in-content/popup), priority, active window, impressions/clicks (tracked).
- Media: upload/list/manage assets with metadata, folder/tags; per-role permissions.
- Dashboard: counts/graphs for articles/users/ads/media; top content.

Public site (reader-facing)
- Home: hero lead story, secondary grid, breaking ticker, trending rail, category blocks, ad slots.
- Article page: hero image, title, author/time/reading-time, bilingual content blocks, inline media/gallery, related stories, ad placements, share actions.
- Category page: list with filters (latest/featured/trending), pagination, subcategory navigation.
- Search results: keyword search, facets (category, date), sort by relevance/date.
- Global: top nav with categories + dropdown, sticky header, footer with sections, language toggle (EN/BN), login entry.
- Responsive: mobile-first; collapsible nav; cards stack; ads reposition.

CMS/Admin (authenticated)
- Dashboard: KPIs (articles published/draft/scheduled, views), top articles, active ads, media counts, recent uploads.
- Articles: list with filters/status, create/edit with bilingual fields, featured/breaking/trending toggles, schedule publish, read-time display, slug preview, related articles picker, category selector, media picker.
- Categories: tree view/manage order/visibility (showInMenu), create/edit with meta fields.
- Ads: list/create/edit with type/position, active window, priority, upload image, link target, display pages, categories; show impressions/clicks.
- Media: upload (image/video/doc), library with grid/list, filters by type/folder/tags, metadata edit.
- Users: list/create/edit roles, activate/deactivate, reset password flow.
- Settings: rate limit inputs, frontend URL, API version (read-only display is fine).
- Auth flows: login, forgot/reset password (if not in API, mock UI), profile edit, change password.

Design direction (BBC/CNN-inspired)
- Typography: newsy serif for headlines (e.g., Playfair/Libre Baskerville) + clean sans for body (e.g., Source Sans/Work Sans). Strong hierarchy: bold headlines, tight decks, legible body.
- Layout: clear grids, generous whitespace, restrained color. High-contrast backgrounds (light theme default) with purposeful accent color (e.g., deep red or navy). Avoid purple. Keep cards borderless or with subtle dividers. Use image-led hero.
- Navigation: sticky topbar, prominent category nav, breadcrumb on article/category pages.
- Motion: subtle fades on load, hover lifts on cards, no excessive micro-animations.
- Ads: defined slots with labels, sized containers to prevent CLS.
- Accessibility: readable line lengths, focus states, aria labels, alt text from media metadata.

Key tasks for the frontend agent
1) Inspect backend API (paths: `/api/v1/...`) and map to services/hooks. Define API client with auth token handling + refresh.
2) Set up Next.js app structure: public site + protected `/admin` area. Use route groups/layouts for separation.
3) Implement global layout (header/nav/footer), language toggle, SEO tags, analytics hooks.
4) Build public pages: Home, Article, Category, Search, Auth (login/register), Profile.
5) Build admin: Dashboard, Articles CRUD, Categories, Ads, Media library, Users, Settings. Include role-based access UI (hide/disable actions based on role).
6) Media picker component reusable in article/ad forms. Ad slot components consuming `/advertisements` public endpoints.
7) State mgmt/query: use SWR/React Query; caching, pagination controls; optimistic updates where safe.
8) Styling: choose consistent system (CSS Modules/Tailwind). Define a token set (colors/spacing/type). No default system font stack; pick purposeful pairs.
9) Handle empty/error/loading states everywhere; skeletons for lists/cards.
10) Responsive and performance: image optimization, lazy load media, prefetch links, avoid layout shift with fixed media aspect ratios.
11) Testing: smoke tests for key pages, basic form validation, protected route guards.

Admin UX notes
- Article editor: bilingual fields side-by-side tabs, status dropdown (draft/published/scheduled), date-time picker for scheduled/publishedAt, toggles for featured/breaking/trending, meta fields, tags, category select, related articles picker.
- Ads: placement preview hints (banner/sidebar/popup), schedule pickers, priority slider.
- Categories: drag/drop ordering if possible; otherwise, order input with save.
- Media: bulk upload, per-file edit drawer.

Branding/content seeds
- Use placeholder images and seed stories until real content arrives.
- Respect rate limits; expose frontend base URL via env; point API base URL to backend domain.

Deliverables
- Next.js project with documented env vars (API base, FRONTEND_URL, etc.).
- Screens implemented per above, styled and responsive.
- Short README for running locally (npm/yarn) and via Docker, plus how to set admin base URL and API URL.

API endpoints (v1) and frontend wiring guide
- Base: `${API_BASE}/api/v1`
- Auth (`/auth`): `POST /register` (public), `POST /login` (public), `POST /refresh-token` (public), `POST /logout` (auth), `GET /me` (auth), `PUT /change-password` (auth), `PUT /profile` (auth). Frontend: auth service with token + refresh handling; guards for protected routes; profile forms; login/register screens.
- Users (`/users`): all protected; `GET /` (admin/super_admin) with pagination/filter/sort; `POST /` create user; `GET/PUT/DELETE /:id` (admin); `DELETE /:id/permanent` (super_admin); `GET /stats` (admin/super_admin). Frontend: admin Users list/detail forms, role toggle, activation; stats widgets.
- Articles (`/articles`): public `GET /` (optional auth) with filters (category, author, status for admins), sort, pagination; `GET /featured/list`, `/breaking/list`, `/trending/list`, `/latest/list`, `/search/query`, `GET /:identifier` (id or slug, optional auth), `GET /:id/related`. Protected: `POST /` create (admin/super_admin/journalist), `PUT /:id`, `DELETE /:id`. Stats: `GET /stats/overview` (admin/super_admin). Frontend: home/category/search pages consume public endpoints; article page uses `GET /:identifier`; related uses `/related`; admin article list/editor uses protected CRUD; dashboard uses stats.
- Categories (`/categories`): public `GET /` (filters: isActive, showInMenu, parent), `GET /tree` (active tree for nav), `GET /menu` (menu entries), `GET /:identifier` (id or slug), `GET /:identifier/articles` (with pagination). Protected: `POST /`, `PUT /:id`, `DELETE /:id` (admin/super_admin). Frontend: header nav uses `/menu` or `/tree`; category pages use `/:identifier` + `/articles`; admin category manager uses CRUD.
- Advertisements (`/advertisements`): public `GET /active` (filters: type, position, page) to render slots. Protected: `GET /` list with filters, `GET /stats` (admin/super_admin), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /:id/impression`, `POST /:id/click`. Frontend: public ad components call `/active` to fetch ads; track interactions with impression/click endpoints. Admin ads list/editor uses CRUD and stats.
- Media (`/media`): protected only. `GET /` list with filters (type, folder, uploadedBy, search, sort, pagination); `GET /:id`; `POST /upload` single upload (multer), `POST /upload/multiple`; `PUT /:id` update metadata (alt/caption/tags/folder/isPublic); `DELETE /:id`. Frontend: admin Media library uses list/upload/update/delete; media picker in article/ads forms.
- Dashboard (`/dashboard`): protected admin/super_admin. `GET /overview` for aggregated metrics (articles, users, ads, media). Frontend: admin dashboard widgets.
- [x] Modify admin dashboard `admin/page.tsx` to replace `bg-white` with `bg-[var(--newsos-bg-secondary)]`
- [x] Verify the fixes manually in the browser in dark mode

API request/response patterns
- Responses: typically `{ success: boolean, message, data }` (see `sendResponse` utils). Errors: standardized via `errorHandler`.
- Pagination: query params `page`, `limit`, `sort`; response includes `pagination: { page, limit, total }`.
- Auth: Bearer token (`Authorization: Bearer <token>`); refresh token via `/auth/refresh-token`.
- File uploads: multipart/form-data to media endpoints; backend stores under `/uploads` (served statically).

Frontend wiring tips
- Create an API client module with base URL + interceptors for 401 to call `/auth/refresh-token`.
- Define per-module hooks/services (auth, articles, categories, ads, media, users, dashboard).
- Centralize type definitions from backend shapes (inspect mappings in services to mirror fields).
- Handle role-based UI: hide/disable actions based on `role` and permissions; reader vs journalist vs admin.
- Ad slots: render placeholders with fixed sizes; fetch from `/advertisements/active` with `type/position/page` params; fire `/impression` on view and `/click` on click.
