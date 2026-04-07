import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { MEXC_WS_URL } from '../api/mexc';

export const useMexcWebSocket = () => {
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const setLiveData = useMarketStore((state) => state.setLiveData);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!selectedSymbol) return;

    const ws = new WebSocket(MEXC_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: 'SUBSCRIPTION',
          params: [`spot@public.tickers.v3.api@${selectedSymbol}`],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.c && message.c.includes('spot@public.tickers.v3.api') && message.d) {
          const data = message.d;
          const price = data.c || data.p || data.lastPrice;
          const change = data.P || data.r || data.priceChangePercent;
          if (price) {
            setLiveData(price, change || null);
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {};

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            method: 'UNSUBSCRIPTION',
            params: [`spot@public.tickers.v3.api@${selectedSymbol}`],
          })
        );
      }
      ws.close();
    };
  }, [selectedSymbol, setLiveData]);
};

