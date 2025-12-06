"use client";

import { useEffect, useState } from "react";
import { getTickerPrices } from "../lib/getTickerData";

export default function Ticker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTickerPrices();
        if (data && data.length) {
          setItems(data);
        }
      } catch (e) {
        console.error("Ticker load error", e);
      }
    }


    load();

    const interval = setInterval(load, 180000); // refresh every 3 minutes

    return () => clearInterval(interval);
  }, []);

  if (!items.length) return null;

  return (
    <div className="w-full overflow-hidden bg-card text-xs text-card-foreground border-b border-border py-4 shadow-sm">
      <div className="ticker-move flex whitespace-nowrap">
        {items.map((item) => (
          <span
            key={item.symbol}
            className="mx-6 inline-flex items-center gap-1"
          >
            <span className="font-semibold">
              {item.symbol}
            </span>
            <span
              className={
                item.isUp === null
                  ? "text-muted-foreground"
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
            {item.percent != null && (
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
