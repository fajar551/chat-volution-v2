/**
 * Eskalasi email tim teknis: hanya jika pesan mengandung "tim teknis" atau kata "manusia".
 * "tim cs" dan "cs" tidak memicu email (ditangani terpisah / tidak ikut eskalasi ini).
 * Kata utuh "vcs" menekan pengiriman.
 */
export function shouldSuppressEscalationForVcs(text: string): boolean {
  return /\bvcs\b/i.test(text);
}

export function matchesLiveChatEscalationKeywords(text: string): boolean {
  const t = (text || '').trim();
  if (!t) return false;
  if (shouldSuppressEscalationForVcs(t)) return false;

  return /tim\s+teknis/i.test(t) || /\bmanusia\b/i.test(t);
}
