# HackFlow — React version

A React + React Router rewrite of the three HackFlow pages (Home, Join Hackathon,
Available Hackathons), built with Vite.

## Project structure

```
hackflow-react/
├── index.html                       ← Vite entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                     ← ReactDOM root + BrowserRouter
    ├── App.jsx                      ← <Routes> definitions
    ├── index.css                    ← all shared styles (design system)
    ├── components/
    │   ├── Navbar.jsx                ← shared nav bar + mobile menu (useState)
    │   └── Footer.jsx
    └── pages/
        ├── Home.jsx                  ← "/"
        ├── JoinHackathon.jsx         ← "/join-hackathon"  (controlled form + validation)
        └── AvailableHackathons.jsx   ← "/available-hackathons" (search + track filter)
```

## Run it in VS Code

1. Unzip this folder and open it in VS Code (`File → Open Folder...`).
2. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) and install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the URL it prints (usually `http://localhost:5173`) in your browser.
   Vite hot-reloads automatically whenever you save a file.

## How it's wired up

- **Routing** — `react-router-dom`'s `<BrowserRouter>` / `<Routes>` / `<Route>` replace
  the separate `.html` files. `<Link>` and `<NavLink>` replace plain `<a href="...">`
  tags for internal navigation (logo, nav links, action cards, "View Details", etc.),
  so the page never reloads.
- **Mobile menu toggle** — was vanilla `addEventListener`/`style.display`, now a
  `useState` boolean in `Navbar.jsx`, with a `useEffect` that closes it on resize.
- **Join Hackathon form** — was manual DOM validation, now a controlled form: one
  `useState` object holds the field values, another holds per-field error flags,
  and `handleSubmit` validates and shows the success message via state instead of
  toggling `style.display` directly.
- **Available Hackathons search/filter** — the hackathon list is now a plain JS
  array of objects (easy to extend or fetch from an API later), filtered with
  `useMemo` based on the `query` and `track` state instead of looping over DOM
  nodes and toggling their visibility.

## Build for production

```
npm run build
```
Outputs static files to `dist/`, which you can deploy anywhere (Vercel, Netlify,
GitHub Pages, etc.).
