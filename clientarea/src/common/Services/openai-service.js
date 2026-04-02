/**
 * OpenAI response via backend proxy.
 * Backend ambil api_key dari DB (api_keys WHERE service = 'openai'), panggil OpenAI, return teks.
 * Build aman: tidak ada akses DB/config dari client.
 */

const getApiBase = () =>
  'https://cvbev2.genio.id';

/**
 * Generate balasan AI untuk pesan user (via backend proxy).
 * @param {string} chatId - ID chat
 * @param {string} userMessage - Pesan dari user
 * @returns {Promise<string|null|{error:string, message?:string, details?:object}>}
 */
export async function generateAIResponse(chatId, userMessage) {
  try {
    const trimmed = typeof userMessage === 'string' ? userMessage.trim() : '';
    if (!trimmed) {
      console.error('❌ openai-service: userMessage kosong atau invalid');
      return null;
    }

    const res = await fetch(`${getApiBase()}/api-socket/openai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ chatId, userMessage: trimmed }),
    });

    const json = await res.json().catch(() => ({}));

    if (json.success && json.data && typeof json.data.text === 'string') {
      return json.data.text;
    }

    if (json.error) {
      return {
        error: json.error,
        message: json.message || 'Gagal generate respons AI.',
        details: json.details,
      };
    }

    return null;
  } catch (err) {
    console.error('❌ openai-service: error', err);
    return { error: 'UNKNOWN', message: err?.message || 'Gagal generate respons AI.' };
  }
}
