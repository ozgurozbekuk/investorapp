export const runtime = "nodejs";

let clients = [];
let ws = null;
let wsConnected = false;

const SYMBOLS = [
  "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "GOOGL", "NFLX",
  "BINANCE:BTCUSDT", "BINANCE:ETHUSDT",
  "BABA", "TSM", "ORCL", "INTC", "AMD", "BA", "NIO",
  "VTI", "VOO", "QQQ", "DIA", "ARKK", "XLF", "XLK",
];

function startWS() {
  if (wsConnected) return;

  const token = process.env.FINNHUB_KEY;
  ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);

  ws.onopen = () => {
    console.log("WS connected");
    wsConnected = true;

    SYMBOLS.forEach((symbol) => {
      ws.send(JSON.stringify({ type: "subscribe", symbol }));
    });
  };

  ws.onmessage = (event) => {
    const msg = `data: ${event.data}\n\n`;

    // Broadcast
    clients.forEach((client) => {
      try {
        client.controller.enqueue(client.encoder.encode(msg));
      } catch (e) {
        // Controller closed → clean up client
        console.log("Removing closed client");
        client.active = false;
      }
    });

    // clean up inactive clients
    clients = clients.filter((c) => c.active);
  };

  ws.onclose = () => {
    console.log("WS closed → reconnecting...");
    wsConnected = false;
    ws = null;
    setTimeout(startWS, 2000);
  };

  ws.onerror = (err) => {
    console.error("WS error:", err);
  };
}

export async function GET() {
  startWS();

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const client = {
        controller,
        encoder,
        active: true,
      };

      clients.push(client);

      // Initial connection message
      try {
        controller.enqueue(encoder.encode(`event: connected\ndata: ok\n\n`));
      } catch (_) {
        client.active = false;
      }
    },

    cancel() {
      // SSE disconnect
      clients = clients.filter((c) => c.controller !== this.controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
