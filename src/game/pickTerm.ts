import { terms } from '../data/terms';

const DAY_MS = 24 * 60 * 60 * 1000;
const EPOCH = Date.UTC(2026, 0, 1);

export function pickDailyTerm(now = new Date()) {
  const day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - EPOCH) / DAY_MS);
  return terms[Math.abs(day) % terms.length];
}

export function pickRandomTerm(previousWord?: string) {
  if (terms.length === 1) {
    return terms[0];
  }

  let next = terms[Math.floor(Math.random() * terms.length)];
  while (next.word === previousWord) {
    next = terms[Math.floor(Math.random() * terms.length)];
  }
  return next;
}
