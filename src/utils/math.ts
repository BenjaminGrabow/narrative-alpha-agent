export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const averageVectors = (vectors: number[][]): number[] => {
  const first = vectors[0];
  if (!first) {
    return [];
  }

  const totals = new Array<number>(first.length).fill(0);
  for (const vector of vectors) {
    for (let index = 0; index < vector.length; index += 1) {
      totals[index] = (totals[index] ?? 0) + (vector[index] ?? 0);
    }
  }

  return totals.map((value) => value / vectors.length);
};

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
