import type { Queue } from "../types/ports.js";

export class InMemoryQueue<T> implements Queue<T> {
  private readonly items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  drain(): T[] {
    return this.items.splice(0, this.items.length);
  }

  size(): number {
    return this.items.length;
  }
}
