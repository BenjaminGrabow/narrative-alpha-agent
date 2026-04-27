import { clamp01 } from "../utils/math.js";
import { tokenize } from "../utils/text.js";

const POSITIVE = new Set(["surge", "breakout", "bullish", "adoption", "partnership", "record"]);
const NEGATIVE = new Set(["hack", "risk", "fraud", "bearish", "crash", "selloff"]);

export class SentimentService {
  score(texts: string[]): number {
    let positive = 0;
    let negative = 0;

    for (const text of texts) {
      for (const token of tokenize(text)) {
        if (POSITIVE.has(token)) {
          positive += 1;
        }
        if (NEGATIVE.has(token)) {
          negative += 1;
        }
      }
    }

    const total = positive + negative;
    if (total === 0) {
      return 0.5;
    }

    return clamp01((positive - negative + total) / (2 * total));
  }
}
