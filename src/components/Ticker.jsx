"use client";

import { useEffect, useState } from "react";

export default function Ticker() {
  const [items, setItems] = useState({});

  useEffect(() => {
    const sse = new EventSource("/api/stream");

    sse.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type !== "trade" || !Array.isArray(msg.data)) return;

        setItems((prev) => {
          const next = { ...prev };

          msg.data.forEach((trade) => {
            const sym = trade.s;
            const price = trade.p;

            const prevItem = next[sym];
            const prevPrice = prevItem?.price ?? null;

            const isUp =
              prevPrice != null ? price > prevPrice : null;

            const change =
              prevPrice != null ? price - prevPrice : null;

            const percent =
              prevPrice && prevPrice !== 0
                ? (change / prevPrice) * 100
                : null;

            next[sym] = {
              symbol: sym,
              price,
              isUp,
              change,
              percent,
            };
          });

          return next;
        });
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    sse.onerror = (err) => {
      console.error("SSE connection error", err);
    };

    return () => sse.close();
  }, []);

  const list = Object.values(items);
  if (!list.length) return null;

  return (
    <div className="w-full overflow-hidden bg-black text-xs text-white border-b border-zinc-700 py-2">
      <div className="ticker-move flex">
        {list.map((item) => (
          <span
            key={item.symbol}
            className="mx-6 flex items-center gap-1"
          >
            <span className="font-semibold">{item.symbol}</span>

            <span
              className={
                item.isUp === null
                  ? "text-zinc-200"
                  : item.isUp
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {item.price?.toFixed(2)}
            </span>

            {item.isUp === null ? null : item.isUp ? (
              <span className="text-green-400">▲</span>
            ) : (
              <span className="text-red-400">▼</span>
            )}

            {item.percent && (
              <span
                className={
                  item.isUp ? "text-green-400" : "text-red-400"
                }
              >
                {item.percent.toFixed(2)}%
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
