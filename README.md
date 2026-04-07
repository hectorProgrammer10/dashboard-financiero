# ApexMarket - High-Concurrency Financial Dashboard

ApexMarket is a high-performance, real-time financial dashboard built with Next.js and React. Designed with a stunning, modern **blue glassmorphism** aesthetic, it targets high-concurrency environments and offloads intensive processing to Web Workers to ensure a buttery smooth 60 FPS user experience.

## Capabilities & Architecture

- **Real-Time Data Streaming**: Leverages the live MEXC REST API and WebSocket streams for blazing-fast price updates, 24h market activity, and deep chart data tracking (`BTCUSDT`, `ETHUSDT`, `SOLUSDT` and more).
- **Web Workers**: Heavy mathematical operations (such as calculating the Simple Moving Averages - SMA 50/SMA 200) run off the main thread.
- **Dynamic News Ecosystem**: Integrates the NewsAPI for broad crypto-market updates inside an auto-rotating carousel, and provides asset-specific intelligence deeply coupled with the asset charts. Built-in, stylized fallback error screens exist for graceful degradation.
- **Performant State Management**: Core application state lives within a scalable `zustand` store, decoupling complex logic from React renders.
- **Modern Aesthetic Engine**: Fully designed utilizing glassmorphism principles. `framer-motion` adds sleek, hardware-accelerated animations (such as the landing page heartbeat pulse), while `backdrop-blur` heavily styles the Next.js layouts.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variable Requirements

To enable the targeted streaming of Live News from the internal endpoints (`src/app/api/news`), be sure to update the `.env.local` variable at the root folder:

```bash
NEWS_API_KEY="YOUR_API_KEY_HERE"
```

## Built With
- [Next.js](https://nextjs.org/) (App Router format)
- [React](https://reactjs.org/) + [Zustand](https://zustand-demo.pmnd.rs/) for State Management
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/icons)
