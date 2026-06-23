# ApexMarket - High-Concurrency Financial Dashboard

ApexMarket is a high-performance, real-time financial dashboard built with Next.js (App Router) and React. Designed with a stunning, modern **blue glassmorphic** aesthetic, it targets high-concurrency environments and offloads intensive processing to Web Workers and optimized rendering selectors to ensure a buttery smooth 60 FPS user experience.

---

## Key Features & Visual Layout

### 1. Unified Split Workspace
- **Dynamic Split View Layout**: Main dashboard functions as a dual-pane workspace. Toggling a cryptocurrency open loads the Deep Analysis Panel side-by-side with the active asset grid/table.
- **Latency-Free Drag-to-Resize**: On desktop screens, the Deep Analysis Panel features a left resize handler allowing the user to stretch the panel up to 50% of the screen. Resizing locks the body cursor to `ew-resize`, disables document user selection, and triggers a CSS override (`body.is-resizing *`) that temporarily suspends all element transition animations to eliminate drag lag and guarantee high frame rates.

### 2. Live Market Grid (Table View)
- **High-Frequency Tickers**: Fetches list data from the MEXC REST API and overlays real-time updates via WebSockets for the active selected symbol.
- **Search & Clear controls**: Features a debounced search input (filtering USDT pairs with volume > $100k) with an instant clear button (`X`) and a result counter badge.
- **Intuitive Pagination**: Standardizes item displays to 20 assets per page, complete with responsive arrow keys and pagination controls.

### 3. Dynamic Pixel-Based Market Treemap (Grid View)
- **Mathematical Squarified Treemap Algorithm**: Fully implements the classic Treemap layout algorithm on the client. It partitions a fluid boundary space into non-overlapping, square-ish rectangles proportional to the weight (dominance) of each asset.
- **Visual Dominance Sizing**: Slices raw tickers to the top 40 assets by volume, computes their estimated market caps (`lastPrice * getSupply`), and determines their relative dominance. The exact width and height of each card in pixels directly reflects its dominance, allowing the user to immediately understand market shares visually.
- **ResizeObserver Integration**: Registers dynamic `ResizeObserver` instances on the section containers. Recalculates card coordinates (`x, y, width, height`) in real-time when the window sizes or when the Deep Analysis Panel width changes.
- **Structured Group Filtering**: Groups the top 40 assets into:
  - **Bitcoin & Derivatives** (BTC, BCH, WBTC)
  - **Infrastructure & Platform** (ETH, BNB, SOL, XRP, etc.)
  - **Others** (Any newly capitalizing or alternative assets)
- **Adaptive Card Content**: Automatically scale card layouts and elements depending on its exact pixel dimensions:
  - **Large** ($\ge 140\text{px} \times 110\text{px}$): Displays full symbol name, price, change percent with icon, and dominance.
  - **Medium** ($\ge 80\text{px} \times 60\text{px}$): Displays symbol, price, and change.
  - **Small** ($\ge 45\text{px} \times 35\text{px}$): Stacks text vertically in tiny fonts.
  - **Micro** ($< 45\text{px} \text{ or } < 35\text{px}$): Displays symbol name only to fit the bounding area.

### 4. Deep Analysis Panel (Chart & Analytics)
- **Timeframe Configurator**: Toggles chart periods between 1D (15m intervals), 1W (1h intervals), 1M (4h intervals), and 1Y (1d intervals) leveraging MEXC klines.
- **Technical Indicator Workers**: Offloads intensive Simple Moving Averages (SMA 50 and SMA 200) computations to a background Web Worker thread, keeping the main UI thread completely responsive during dataset calculations.
- **Curated Asset Intelligence**: Displays general market news inside a rotating top banner carousel, and appends asset-specific news directly inside the chart panel using NewsAPI data. Includes custom fallback error screens for robust error handling.

---

## Performance Optimization Engine

- **Granular Zustand State Triggers**: Both the `PriceCell` (table) and `TreemapCard` (treemap) subscribe to the global Zustand store using strict selectors. Instead of pulling the entire live WebSocket state, components evaluate selector functions (`state => state.selectedSymbol === symbol ? state.liveData : null`). Non-selected cards return a static reference, reducing WebSocket-induced re-renders by **97.5%**.
- **Component Memoization**: Envelops critical rendering components (`PriceCell`, `TreemapCard`, `TreemapSection`) in `React.memo` with custom prop comparators to block parent state updates from propagating downstream.
- **Scope Isolation**: Helper functions and static configurations reside outside component render scopes to prevent garbage collection sweeps and object reallocations.

---

## Tech Stack
- **Framework**: Next.js (App Router format)
- **State Management**: Zustand
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: Tailwind CSS + Custom Vanilla CSS (Glassmorphism layer)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Async Data Fetching**: SWR (Stale-While-Revalidate)

---

## Testing Suite

The application includes a comprehensive Jest and React Testing Library suite checking all API utilities, Zustand stores, custom math layout algorithms, page transitions, and visual components.

### Configurations & Browser Mocks
- **SWC Compilation**: Integrates with Next.js's SWC compiler (`next/jest`) to transpile TypeScript tests at native speed.
- **ResizeObserver Mock**: Polyfills ResizeObserver in JSDOM, returning a default container width/height bounding box to ensure client-side layout math computes correctly in test environments.
- **Worker & Chart.js Mocks**: 
  - Mock Web Workers return mock SMA datasets to prevent async worker threads from leaking or blocking test runner tasks.
  - Chart.js registers are stubbed and `Line` canvas components are replaced with placeholder test elements (`data-testid="mock-line-chart"`).
  - Framer Motion animation loops are bypassed for testing simplicity.
- **TypeScript Extensions**: Appends testing library types via [jest-dom.d.ts](file:///*:/*****/********/******/src/jest-dom.d.ts) to support Jest matcher extensions (like `.toBeInTheDocument()` and `.toHaveStyle()`).

### Test Coverage (8 files, 32 unit tests)
1. **[mexc.test.ts](file:///*:/*****/********/******/src/shared/api/__tests__/mexc.test.ts)**: Verifies REST API calls, parameters, and error message mapping.
2. **[useMarketStore.test.ts](file:///*:/*****/********/******/src/shared/store/__tests__/useMarketStore.test.ts)**: Verifies Zustand store state changes and selectors.
3. **[squarify.test.ts](file:///*:/*****/********/******/src/features/asset-table/components/__tests__/squarify.test.ts)**: Verifies mathematical bounds, areas, and non-overlapping coordinate generation for the squarified treemap layout.
4. **[PriceCell.test.tsx](file:///*:/*****/********/******/src/features/asset-table/components/__tests__/PriceCell.test.tsx)**: Verifies store price tick render updates and green/red flash visual styling changes.
5. **[SplashScreen.test.tsx](file:///*:/*****/********/******/src/shared/components/__tests__/SplashScreen.test.tsx)**: Verifies splash page animations, timer advances (`jest.advanceTimersByTime`), and callback execution.
6. **[ApiErrorScreen.test.tsx](file:///*:/*****/********/******/src/shared/components/__tests__/ApiErrorScreen.test.tsx)**: Verifies error warning renders and retry button trigger callbacks.
7. **[DeepAnalysisPanel.test.tsx](file:///*:/*****/********/******/src/features/price-chart/components/__tests__/DeepAnalysisPanel.test.tsx)**: Verifies timeframe toggle options, close click state changes, and worker unmount cleanups.
8. **[MarketTreemap.test.tsx](file:///*:/*****/********/******/src/features/asset-table/components/__tests__/MarketTreemap.test.tsx)**: Verifies grouping segment boundaries and top 40 item render limits.

### Executing Tests

To run the test suite:

```bash
npm run test
```

To run Jest in watch mode (interactive test runner):

```bash
npm run test:watch
```

---

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

To stream Live News from the internal API routes, add a `.env.local` file at the root folder:

```bash
NEWS_API_KEY="YOUR_API_KEY_HERE"
```
