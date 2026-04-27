import type { Document } from "../types/domain.js";

const HOUR = 60 * 60 * 1000;
const START = 1_735_689_600_000;

export const demoDataset: Document[] = [
  {
    id: "doc_001",
    source: "twitter",
    author: "defi_researcher",
    text: "Early chatter: AI agents are starting to route stablecoin payments across wallets",
    timestamp: START,
    engagement: { likes: 14, shares: 3 }
  },
  {
    id: "doc_002",
    source: "telegram",
    author: "alpha_room",
    text: "AI agent wallets could become the next adoption story for stablecoin payments",
    timestamp: START + HOUR,
    engagement: { shares: 7 }
  },
  {
    id: "doc_003",
    source: "news",
    author: "ChainDesk",
    text: "New partnership brings autonomous AI agent payments to stablecoin commerce",
    timestamp: START + 2 * HOUR
  },
  {
    id: "doc_004",
    source: "twitter",
    author: "macro_chain",
    text: "Bullish breakout forming around AI agent payments and wallet adoption",
    timestamp: START + 3 * HOUR,
    engagement: { likes: 240, shares: 58 }
  },
  {
    id: "doc_005",
    source: "telegram",
    author: "builder_chat",
    text: "Several teams shipping agent wallet payment rails this week, adoption surge talk everywhere",
    timestamp: START + 4 * HOUR,
    engagement: { shares: 42 }
  },
  {
    id: "doc_006",
    source: "news",
    author: "MarketWire",
    text: "Record developer activity reported for AI agent stablecoin payment infrastructure",
    timestamp: START + 5 * HOUR
  },
  {
    id: "doc_007",
    source: "twitter",
    author: "risk_watch",
    text: "Some analysts warn of wallet permission risk as AI agent payment hype peaks",
    timestamp: START + 8 * HOUR,
    engagement: { likes: 92, shares: 11 }
  },
  {
    id: "doc_008",
    source: "news",
    author: "Daily Ledger",
    text: "AI agent wallet payment narrative cools after security risk debate",
    timestamp: START + 12 * HOUR
  },
  {
    id: "doc_009",
    source: "twitter",
    author: "unrelated_trader",
    text: "Layer two gas fees remain low while perps funding stays flat",
    timestamp: START + 2 * HOUR
  }
];

export const demoTimeline = [
  START,
  START + HOUR,
  START + 2 * HOUR,
  START + 3 * HOUR,
  START + 4 * HOUR,
  START + 5 * HOUR,
  START + 8 * HOUR,
  START + 12 * HOUR
];
