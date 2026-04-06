import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getHeader, nativeHttpRequest } from '../common/native-http.util';

const OPENAI_BASE = 'https://api.openai.com/v1';
const ASSISTANTS_BETA = 'assistants=v2';
const OPENAI_ASSISTANT_ID = 'asst_4QVwsQkyg7uZcRXbuiLpZOY5';

@Injectable()
export class OpenaiProxyService {
  private readonly threadsByChatId: Record<string, string> = {};

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getApiKey(): Promise<{ api_key: string; assistant_id: string }> {
    const rows = await this.dataSource.query(
      "SELECT api_key FROM api_keys WHERE service = 'openai' AND is_active = 1 LIMIT 1",
    );
    const first = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    const api_key = first?.api_key ? String(first.api_key).trim() : '';
    return { api_key, assistant_id: OPENAI_ASSISTANT_ID };
  }
  
  async generateResponse(
    chatId: string,
    userMessage: string,
  ): Promise<{ text?: string; error?: string; message?: string; details?: unknown }> {
    const trimmed = typeof userMessage === 'string' ? userMessage.trim() : '';
    if (!trimmed) {
      return { error: 'INVALID_INPUT', message: 'Pesan kosong atau invalid' };
    }

    const { api_key, assistant_id } = await this.getApiKey();
    if (!api_key) {
      return {
        error: 'NO_API_KEY',
        message: 'OpenAI API key tidak ditemukan. Periksa table api_keys.',
      };
    }
    const assistantId = (assistant_id && String(assistant_id).trim()) || '';
    if (!assistantId) {
      return {
        error: 'NO_ASSISTANT_ID',
        message:
          "OpenAI assistant_id belum dikonfigurasi. Set OPENAI_ASSISTANT_ID di openai-proxy.service.ts.",
      };
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': ASSISTANTS_BETA,
    };

    try {
      let threadId = this.threadsByChatId[chatId];

      if (!threadId) {
        const threadRes = await nativeHttpRequest(`${OPENAI_BASE}/threads`, {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
        });
        if (threadRes.statusCode < 200 || threadRes.statusCode >= 300) {
          let errData: { error?: { message?: string } } = {};
          try {
            errData = JSON.parse(threadRes.body) as typeof errData;
          } catch {
            /* ignore */
          }
          return {
            error: 'THREAD_ERROR',
            message: errData.error?.message || 'Gagal membuat thread',
            details: errData,
          };
        }
        const threadData = JSON.parse(threadRes.body) as { id: string };
        threadId = threadData.id;
        this.threadsByChatId[chatId] = threadId;
      }

      const addMsgRes = await nativeHttpRequest(
        `${OPENAI_BASE}/threads/${threadId}/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            role: 'user',
            content: [{ type: 'text', text: trimmed }],
          }),
        },
      );
      if (addMsgRes.statusCode < 200 || addMsgRes.statusCode >= 300) {
        let errData: { error?: { message?: string } } = {};
        try {
          errData = JSON.parse(addMsgRes.body) as typeof errData;
        } catch {
          /* ignore */
        }
        return {
          error: 'MESSAGE_ERROR',
          message: errData.error?.message || 'Gagal menambah pesan',
          details: errData,
        };
      }

      const runRes = await nativeHttpRequest(
        `${OPENAI_BASE}/threads/${threadId}/runs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ assistant_id: assistantId }),
        },
      );
      if (runRes.statusCode < 200 || runRes.statusCode >= 300) {
        let errData: { error?: { message?: string } } = {};
        try {
          errData = JSON.parse(runRes.body) as typeof errData;
        } catch {
          /* ignore */
        }
        const status = runRes.statusCode;
        if (status === 429) {
          const retryAfter = getHeader(runRes.headers, 'retry-after') || '60';
          return {
            error: 'RATE_LIMIT',
            message: `Terlalu banyak permintaan. Coba lagi setelah ${retryAfter} detik.`,
          };
        }
        if (status === 402 || status === 403) {
          return {
            error: 'QUOTA_ERROR',
            message: 'Kuota OpenAI habis atau pembayaran diperlukan.',
            details: errData,
          };
        }
        return {
          error: 'CREATE_RUN_ERROR',
          message: errData.error?.message || 'Gagal menjalankan asisten',
          details: errData,
        };
      }

      const runData = JSON.parse(runRes.body) as { id?: string };
      const runId = runData?.id;
      if (!runId) return { error: 'RUN_ERROR', message: 'run.id tidak ada' };

      const maxAttempts = 30;
      let attempts = 0;
      let runStatus: { status?: string; last_error?: { message?: string } };

      while (attempts < maxAttempts) {
        const statusRes = await nativeHttpRequest(
          `${OPENAI_BASE}/threads/${threadId}/runs/${runId}`,
          { method: 'GET', headers },
        );
        if (statusRes.statusCode < 200 || statusRes.statusCode >= 300) {
          return { error: 'STATUS_ERROR', message: 'Gagal cek status run' };
        }
        runStatus = JSON.parse(statusRes.body) as typeof runStatus;

        if (runStatus.status === 'completed') break;
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          return {
            error: 'RUN_FAILED',
            message: runStatus.last_error?.message || runStatus.status,
          };
        }
        await new Promise((r) => setTimeout(r, 1000));
        attempts++;
      }

      if (!runStatus || runStatus.status !== 'completed') {
        return { error: 'TIMEOUT', message: 'Timeout menunggu run selesai' };
      }

      const messagesRes = await nativeHttpRequest(
        `${OPENAI_BASE}/threads/${threadId}/messages`,
        { method: 'GET', headers },
      );
      if (messagesRes.statusCode < 200 || messagesRes.statusCode >= 300) {
        return { error: 'MESSAGES_ERROR', message: 'Gagal ambil messages' };
      }
      const messagesData = JSON.parse(messagesRes.body) as {
        data?: Array<{
          role: string;
          content?: Array<{ text?: { value?: string } }>;
        }>;
      };
      const list = messagesData.data || [];
      const assistantMessages = list.filter((m) => m.role === 'assistant');
      if (assistantMessages.length > 0) {
        const latest = assistantMessages[0];
        const content = latest.content?.[0];
        const text = content?.text?.value;
        if (typeof text === 'string') return { text };
      }
      return { error: 'NO_RESPONSE', message: 'Tidak ada balasan dari asisten' };
    } catch (err) {
      console.error('OpenaiProxyService error:', err);
      return {
        error: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Gagal generate respons AI.',
      };
    }
  }
}
