# ApexMarket - High-Concurrency Financial Dashboard

ApexMarket is a high-performance, real-time cryptocurrency financial dashboard built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS 4**. Designed with a modern **blue glassmorphic** aesthetic, it targets high-concurrency environments and offloads intensive processing to Web Workers, optimized rendering selectors, and a custom security middleware to ensure a buttery-smooth 60 FPS user experience.

---

## Key Features & Visual Layout

### 1. Unified Split Workspace
- **Dynamic Split View Layout**: The main dashboard functions as a dual-pane workspace constrained to the viewport (`h-screen max-h-screen overflow-hidden`). Selecting any cryptocurrency opens the Deep Analysis Panel side-by-side with the active asset grid/treemap, with independent vertical scrolling in each pane.
- **Full-Height Drag-to-Resize Handler**: On desktop screens ($\ge 1280\text{px}$), the Deep Analysis Panel features a full-height resize handle anchored to the outer container. Spanning 100% of the visible viewport, it remains fully active and draggable even when scrolling down through deep analysis content. Resizing locks the body cursor to `ew-resize`, disables document user selection, and triggers a CSS override (`body.is-resizing *`) that temporarily suspends element transition animations to eliminate drag lag.
- **Adaptive Stacking**: On mobile and tablet screens, the layout gracefully stacks vertically to preserve full usability.

### 2. Live Market Grid (Table View)
- **High-Frequency Tickers**: Fetches 24-hour market ticker data via an internal Next.js API route (`/api/tickers`) connected to the MEXC REST API, and overlays live price updates via WebSockets (`wss://wbs.mexc.com/ws`) for the active selected symbol.
- **Search & Clear Controls**: Features a debounced search input (150ms debounce) filtering USDT pairs with volume > $100k, complete with an instant clear button (`X`) and a dynamic result counter badge.
- **Intuitive Pagination**: Displays 20 assets per page with responsive arrow navigation and smart ellipsis pagination controls.

### 3. Dynamic Pixel-Based Market Treemap (Default View)
- **Default Dashboard Mode**: The application loads directly into the visual Market Treemap view on initial visit for an immediate overview of market capitalizations and price trends.
- **Mathematical Squarified Treemap Algorithm**: Fully implements the classic Treemap layout algorithm on the client (`squarify`). It partitions a fluid boundary space into non-overlapping, square-ish rectangles.
- **Universal Power-Law Normalization Layer**: Compresses extreme market capitalization disparities across all assets using a universal power compression curve ($W_i = M_i^{0.35}$). This preserves monotonic ranking and visual leadership of mega-caps (BTC, ETH) while allocating balanced, readable card areas to mid and small-cap assets without truncating their metrics.
- **Separation of Real Dominance vs. Layout Area**: Displays the exact financial market dominance percentage ($\text{Dom: } X.XX\%$) on badges while utilizing normalized weights for coordinate and area geometry.
- **ResizeObserver Integration**: Registers dynamic `ResizeObserver` instances on the section containers to recalculate card coordinates (`x, y, width, height`) in real-time when the window resizes or when the Deep Analysis Panel is dragged.
- **Structured Group Filtering**: Groups the top 40 assets into:
  - **Bitcoin & Derivatives** (BTC, BCH, WBTC)
  - **Infrastructure & Platform** (ETH, BNB, SOL, XRP, TRX, ADA, AVAX, SUI, NEAR, etc.)
  - **Others** (Any newly capitalizing or alternative assets)
- **Adaptive Card Content**: Automatically scales card layouts and typography depending on its exact pixel dimensions:
  - **Large** ($\ge 140\text{px} \times 110\text{px}$): Displays full symbol name, price, change percent with icon, and dominance percentage.
  - **Medium** ($\ge 80\text{px} \times 60\text{px}$): Displays symbol, formatted price, and change percent.
  - **Small** ($\ge 45\text{px} \times 35\text{px}$): Compact stacked layout with tiny typography.
  - **Micro** ($< 45\text{px} \text{ or } < 35\text{px}$): Displays symbol name only to fit the bounding area.

### 4. Deep Analysis Panel (Interactive Charts & Indicators)
- **Standard Candlestick Timeframes**: Toggles candlestick granularities between **15m** (15-minute bars), **1h** (1-hour bars), **4h** (4-hour bars, default), **1D** (daily bars), and **1W** (weekly bars) matching TradingView and exchange standards, querying MEXC klines data through `/api/klines`.
- **Fixed-Height Desktop Viewport**: The chart container maintains a compact static height of 220px on desktop (`xl:h-[220px]`), allowing the panel to smoothly scroll downwards to display the timeframe controls, asset-specific news, and market sentiment widgets.
- **Technical Indicator Web Worker**: Offloads intensive Simple Moving Average (SMA 50 and SMA 200) computations to a background Web Worker thread (`algorithms.worker.ts`), keeping the main UI thread completely responsive during dataset calculations.
- **Chart.js Visuals**: Responsive canvas charts powered by `chart.js` and `react-chartjs-2` with custom gradient fills, custom tooltips, and loading spinner overlays.
- **Crypto Fear & Greed Index Widget**: Integrates a live sentiment widget exclusively when Bitcoin (`BTCUSDT`) is selected, rendered below the news feed.

### 5. Curated Market Intelligence & News Feed
- **Rotating Market Intel Banner**: `NewsCarousel` presents the latest global crypto news in a rotating banner with smooth motion transitions, auto-pause on mouse hover, and direct links to full articles.
- **Asset-Specific News Feed**: `AssetNewsCard` automatically pulls recent news for the currently selected cryptocurrency inside the analysis panel.
- **Backend News Gateway**: Powered by the `/api/news` route which queries the **GNews API**, complete with query sanitization, 5-minute cache revalidation, and graceful fallback error screens.

### 6. Design System & Micro-Interactions
- **Hairline Ultra-Thin Borders (`0.5px`)**: Custom CSS utilities (`@utility border-subtle`, `border-t-subtle`, etc.) and `border-[0.5px]` classes provide crisp, high-DPI glassmorphism contours across all cards, modals, headers, and buttons.
- **Custom Auto-Hiding Scrollbars (`.custom-scrollbar`)**: Scrollbars remain 100% transparent and invisible during idle states, smoothly fading in as an ultra-thin (5px) blue-glass thumb on mouse hover or scroll.
- **Animated Intro Splash Screen**: Features an SVG laser-trace animation that converges into an ECG-style pulse on initial app load, transitioning smoothly into the main dashboard interface.

---

## Security & Middleware Architecture

ApexMarket implements defense-in-depth security measures at both the edge middleware and server route levels:

### 1. Edge/Server Middleware (`src/middleware.ts`)
- **Sliding Window Rate Limiting**:
  - `/api/*` endpoints: **100 requests per minute** per IP.
  - Page routes: **300 requests per minute** per IP.
  - Returns `429 Too Many Requests` with standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After` headers.
- **Automated Bot & Vulnerability Scanner Blocker**:
  - Detects and rejects malicious User-Agent signatures (e.g. `sqlmap`, `nikto`, `masscan`, `nmap`, `dirbuster`, `burpsuite`, `zgrab`, `python-requests`, `curl`, `fuzzer`, `exploit`, etc.) with `403 Forbidden` (`X-Security-Block: ua`).
- **IP Extraction & Cache Pruning**:
  - Resolves client IP via `x-real-ip` or `x-forwarded-for`.
  - Automatically prunes expired rate limit records every 5 minutes to prevent memory leaks.

### 2. HTTP Security Headers & Strict CSP (`next.config.ts`)
- **Content-Security-Policy (CSP)**:
  - Restricts script, style, font, image, and worker blob origins.
  - Authorizes API/WebSocket connections to `self`, `https://api.mexc.com`, `wss://wbs.mexc.com`, and `https://gnews.io`.
- **Hardened HTTP Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), ...`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: credentialless`
  - `poweredByHeader: false`

### 3. API Proxy Routes & Input Validation (`src/app/api/`)
- **`/api/tickers`**: Proxies MEXC 24h ticker data with 30-second cache revalidation, 10-second abort timeouts, and CORS protection.
- **`/api/klines`**: Validates symbol format against SSRF/path-traversal via alphanumeric regex (`/^[A-Z0-9]{2,20}$/`), enforces strict interval allowlist (`1m`, `5m`, `15m`, `30m`, `60m`, `4h`, `1d`, `1W`, `1M`), and clamps query limits (1–1000).
- **`/api/news`**: Sanitizes incoming search queries, applies regex filtering and character limits, and connects to GNews API with 5-minute caching and normalized article responses.

---

## Performance Optimization Engine

- **Granular Zustand State Triggers**: `PriceCell` (table) and `TreemapCard` (treemap) subscribe to the global Zustand store using strict selectors (`state => state.selectedSymbol === symbol ? state.liveData : null`). Non-selected cards return a static reference, reducing WebSocket-induced re-renders by **>95%**.
- **Component Memoization**: Envelops critical rendering components (`PriceCell`, `TreemapCard`, `TreemapSection`, `FinancialChart`) in `React.memo` with custom prop comparators to block parent state updates from propagating downstream unnecessarily.
- **Worker Thread Offloading**: Dedicated Web Workers (`algorithms.worker.ts`, `calculator.worker.ts`, `marketData.worker.ts`) handle intensive mathematical calculations (moving averages, high-frequency tick simulations) off the main thread.
- **GPU Layer Promotion**: Constant CSS animations and background decorative blur orbs are promoted to GPU compositor layers via `will-change` and `translateZ(0)` to prevent main thread repaints.
- **Scope & Allocation Isolation**: Single instances of `Intl.NumberFormat` and cached coin supply lookups (`Map<string, number>`) reside outside render scopes to prevent garbage collection spikes.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 |
| **State Management** | Zustand 5 |
| **Data Fetching & Caching** | SWR 2 (Stale-While-Revalidate) |
| **Data Visualization** | Chart.js 4 + react-chartjs-2 |
| **Styling** | Tailwind CSS 4 + PostCSS + Custom CSS Glassmorphism |
| **Animations** | Framer Motion 12 |
| **Icons** | Lucide React |
| **Testing Suite** | Jest 29 + React Testing Library 16 + JSDOM |

---

## Project Structure

```text
sistema-financiero-app/
├── public/                     # Static assets (MEXC logo, SVG brand icons)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Secure server-side API proxy routes
│   │   │   ├── klines/         # MEXC klines proxy with parameter allowlist
│   │   │   ├── news/           # GNews API gateway & article mapper
│   │   │   └── tickers/        # MEXC 24h ticker data proxy
│   │   ├── globals.css         # Tailwind tokens, GPU hints & glassmorphism
│   │   ├── layout.tsx          # Root layout & Geist typography metadata
│   │   └── page.tsx            # Main dashboard split workspace
│   ├── features/               # Feature-based architecture
│   │   ├── asset-table/        # MarketGrid, MarketTreemap, PriceCell, squarify
│   │   ├── market/             # Dashboard metrics & financial charts
│   │   ├── market-worker/      # Web Workers for technical indicator math
│   │   ├── news/               # NewsCarousel, AssetNewsCard, useNewsApi
│   │   ├── price-chart/        # DeepAnalysisPanel & timeframe controls
│   │   └── ticker-tape/        # Continuous ticker tape marquis component
│   ├── shared/                 # Reusable cross-cutting modules
│   │   ├── api/                # Client API fetchers (MEXC REST & SWR hooks)
│   │   ├── components/         # SplashScreen, ApiErrorScreen
│   │   ├── hooks/              # useMexcWebSocket (live WebSocket manager)
│   │   └── store/              # Zustand global state (useMarketStore)
│   ├── jest-dom.d.ts           # Testing library type definitions
│   └── middleware.ts           # Security rate limiter & bot scanner blocker
├── jest.config.js              # Next.js SWC Jest configuration
├── jest.setup.js               # Polyfills (ResizeObserver, Workers, Chart.js)
├── next.config.ts              # Security headers, CSP & Next.js config
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## Testing Suite

The application includes a comprehensive test suite built with **Jest** and **React Testing Library**, verifying API fetchers, Zustand stores, mathematical layout algorithms, animation cycles, and user interactions.

### Configurations & Mocks (`jest.setup.js`)
- **Next.js SWC Integration**: Transpiles TypeScript and JSX at native speed via `next/jest`.
- **ResizeObserver Mock**: Polyfills `ResizeObserver` in JSDOM, returning a default container bounding box (`800x600`) to guarantee deterministic mathematical computations for the treemap algorithm in tests.
- **Worker & Chart.js Mocks**: 
  - Mock Web Workers return mock SMA datasets to prevent async worker threads from blocking or leaking during test runs.
  - Chart.js registrations and `Line` canvas components are replaced with test stubs (`data-testid="mock-line-chart"`).
  - Framer Motion animation loops are simplified for synchronous testing.
- **TypeScript Extensions**: Appends testing library types via [`src/jest-dom.d.ts`](./src/jest-dom.d.ts) to support Jest DOM matchers (`.toBeInTheDocument()`, `.toHaveStyle()`).

### Test Coverage (8 files, 32 unit tests)

| Test File | Description |
|---|---|
| [`src/shared/api/__tests__/mexc.test.ts`](./src/shared/api/__tests__/mexc.test.ts) | Verifies REST API calls, parameters, and error message handling |
| [`src/shared/store/__tests__/useMarketStore.test.ts`](./src/shared/store/__tests__/useMarketStore.test.ts) | Verifies Zustand store state updates, symbols, and live data setters |
| [`src/features/asset-table/components/__tests__/squarify.test.ts`](./src/features/asset-table/components/__tests__/squarify.test.ts) | Verifies mathematical bounds, area calculations, and non-overlapping coordinate generation for the squarified treemap layout |
| [`src/features/asset-table/components/__tests__/PriceCell.test.tsx`](./src/features/asset-table/components/__tests__/PriceCell.test.tsx) | Verifies store price tick render updates and green/red flash visual styling changes |
| [`src/shared/components/__tests__/SplashScreen.test.tsx`](./src/shared/components/__tests__/SplashScreen.test.tsx) | Verifies splash screen animations, timer advances (`jest.advanceTimersByTime`), and completion callbacks |
| [`src/shared/components/__tests__/ApiErrorScreen.test.tsx`](./src/shared/components/__tests__/ApiErrorScreen.test.tsx) | Verifies error message rendering and retry button trigger callbacks |
| [`src/features/price-chart/components/__tests__/DeepAnalysisPanel.test.tsx`](./src/features/price-chart/components/__tests__/DeepAnalysisPanel.test.tsx) | Verifies timeframe toggle options, close click state changes, and worker unmount cleanups |
| [`src/features/asset-table/components/__tests__/MarketTreemap.test.tsx`](./src/features/asset-table/components/__tests__/MarketTreemap.test.tsx) | Verifies grouping segment boundaries and top-40 item render limits |

### Executing Tests

To run the complete test suite:

```bash
npm run test
```

To run Jest in interactive watch mode:

```bash
npm run test:watch
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm**, **pnpm**, or **yarn**

### Installation & Development

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables (optional for news feed):
Create a `.env.local` file at the project root:
```bash
NEWS_API_KEY="YOUR_GNEWS_API_KEY_HERE"
```
*(Get a free API key at [gnews.io](https://gnews.io))*

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` — Starts the local Next.js development server.
- `npm run build` — Builds the production bundle.
- `npm run start` — Runs the built production server.
- `npm run lint` — Runs ESLint to inspect code quality.
- `npm run test` — Executes the Jest unit testing suite.
- `npm run test:watch` — Runs Jest in interactive watch mode.
