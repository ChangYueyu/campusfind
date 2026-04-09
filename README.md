CampusFind is an offline-first Lost & Found Progressive Web App (PWA) for campus use. Users can create lost/found posts with optional photo and location, browse the feed, and manage their own posts. All data is stored locally on the device using IndexedDB (via Dexie).

- GitHub repo: https://github.com/ChangYueyu/campusfind
- Live (Vercel): https://campusfind-eight.vercel.app/

- Create Lost/Found posts (type, category, title, description, time)
- Optional photo upload (stored locally with the post)
- Optional geolocation capture (save latitude/longitude)
- Feed filtering (type/category/keyword) and distance-based browsing (optional)
- Manage posts: edit / mark returned / delete
- Local persistence: posts remain after refresh and can be viewed offline (after first load)

- React + Vite
- React Router (SPA navigation)
- Dexie (IndexedDB) for on-device persistent storage
- Vite PWA plugin (Web App Manifest + Service Worker)
- Deployment: Vercel (HTTPS)

- Node.js (LTS recommended) + npm

```bash
git clone https://github.com/ChangYueyu/campusfind.git
cd campusfind
npm install
npm run dev