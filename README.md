# VitaForge Website (React + Vite)

This is the refactored version of the VitaForge website, built with **React** and **Vite**.

## Technology Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router DOM 6
- **Styling**: Vanilla CSS (Global + Component-based imports)
- **Data**: JSON-based configuration (`src/data/assets.json`, `src/data/treasury.json`)

## Project Structure

```
/src
  /assets        # Images (Logo, etc.)
  /components    # Reusable UI (Navbar, AuthGuard, CapitalFlowChart)
  /hooks         # Custom Hooks (useAssets)
  /pages         # Page Views (Home, Investors, Dashboard, Treasury)
  /styles        # CSS Stylesheets
  App.jsx        # Main Router
  main.jsx       # Entry Point

/public
  /data          # JSON Data files (assets.json, treasury.json)
```

## Setup & Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

## Key features
- **AuthGuard**: Protects the application with a hashed password gate.
- **Asset Dashboard**: Interactive gauge grid and detailed modal with SVG capital flow visualization.
- **Bitcoin Treasury**: Canvas-based particle simulation of the treasury mechanics.

