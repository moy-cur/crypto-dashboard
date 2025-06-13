import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import CryptoCard from "components/CryptoCard";
import { useDarkMode } from "hooks/useDarkMode";
import { useEffect, useState } from "react";
import { PriceEntry } from "types/common";

const STORAGE_KEY = "crypto-coin-order";

const INITIAL_COINS = [
  "ETH",
  "SOL",
  "LTC",
  "DOGE",
  "ADA",
  "AVAX",
  "MATIC",
  "LINK",
  "BCH",
  "XLM",
];

const PRODUCT_IDS = INITIAL_COINS.flatMap((coin) => [
  `${coin}-USD`,
  `${coin}-BTC`,
]);

export default function Index() {
  const [prices, setPrices] = useState<Record<string, PriceEntry>>({});
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [searchTerm, setSearchTerm] = useState("");
  const { isDark, toggle } = useDarkMode();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.every((v) => typeof v === "string")
        ) {
          setCoins(parsed);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse saved coin order:", err);
      }
    }
    setCoins(INITIAL_COINS);
  }, []);

  const persistCoinOrder = (order: string[]) => {
    setCoins(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  };

  useEffect(() => {
    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: PRODUCT_IDS,
          channels: ["ticker"],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ticker") {
        const [coin, currency] = data.product_id.split("-");

        setPrices((prev) => ({
          ...prev,
          [coin]: {
            ...prev[coin],
            [currency.toLowerCase()]: data.price,
          },
        }));
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "unsubscribe",
            product_ids: PRODUCT_IDS,
            channels: ["ticker"],
          })
        );
      }
      ws.close();
    };
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = coins.indexOf(active.id);
      const newIndex = coins.indexOf(over.id);
      const newOrder = arrayMove(coins, oldIndex, newIndex);
      persistCoinOrder(newOrder);
    }
  };

  const filteredCoins = coins.filter((coin) =>
    coin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Live Crypto Prices
      </h1>
      <div className="flex justify-between">
      <input
        type="text"
        placeholder="Search by name or symbol (e.g. SOL, ETH)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
        focus:outline-none focus:ring focus:border-blue-300"
      />
      <button
        onClick={toggle}
        className="mb-4 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        
        Switch to {isDark ? "Light" : "Dark"} Mode
      </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={coins} strategy={verticalListSortingStrategy}>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCoins.map((coin) => (
              <CryptoCard key={coin} data={prices[coin]} id={coin} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
