/**
 * Eskalasi Live Chat: jika pesan mengandung tim teknis / tim cs / cs / manusia → boleh kirim email.
 * Jika pesan mengandung kata utuh "vcs" (case insensitive) → jangan kirim email eskalasi.
 */
export function shouldSuppressEscalationForVcs(text: string): boolean {
  return /\bvcs\b/i.test(text);
}

export function matchesLiveChatEscalationKeywords(text: string): boolean {
  const t = (text || '').trim();
  if (!t) return false;
  if (shouldSuppressEscalationForVcs(t)) return false;

  return (
    /tim\s+teknis/i.test(t) ||
    /tim\s+cs/i.test(t) ||
    /\bmanusia\b/i.test(t) ||
    /\bcs\b/i.test(t)
  );
}
