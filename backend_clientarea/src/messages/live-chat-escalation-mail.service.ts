import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nativeHttpRequest } from '../common/native-http.util';
import { matchesLiveChatEscalationKeywords } from './utils/live-chat-escalation.util';

/**
 * Penerima default jika LIVE_CHAT_ESCALATION_TO tidak di-set di .env.
 * Pengiriman selalu lewat Laravel admin (POST /api/internal/multi-recipient-mail), bukan SMTP di Nest.
 */
const DEFAULT_TO =
  'teknis@gfn.axl.id,saepudin@qwords.co.id,fajarhabibzaelani@gmail.com';

const DEFAULT_APP_BASE = 'https://v2chat.genio.id';

function buildLiveChatAgentPath(chatSessionId: string): string {
  const id = (chatSessionId || '').trim();
  return `/chat-with-client/livechat-${id}-LIVE`;
}

export type LiveChatEscalationPayload = {
  chatSessionId: string;
  body: string;
  clientName?: string;
  fromNumber?: string;
};

@Injectable()
export class LiveChatEscalationMailService {
  private readonly logger = new Logger(LiveChatEscalationMailService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Laravel admin: POST /api/internal/multi-recipient-mail
   * Wajib: LIVE_CHAT_ESCALATION_ADMIN_API_URL dan LIVE_CHAT_ESCALATION_ADMIN_API_SECRET
   * (secret sama dengan MULTI_RECIPIENT_MAIL_API_SECRET di admin/.env).
   */
  private async sendViaAdminApi(
    recipients: string[],
    subject: string,
    bodyPlain: string,
    chatSessionId: string,
  ): Promise<boolean> {
    const url = (
      this.config.get<string>('LIVE_CHAT_ESCALATION_ADMIN_API_URL') ?? ''
    ).trim();
    const secret = (
      this.config.get<string>('LIVE_CHAT_ESCALATION_ADMIN_API_SECRET') ?? ''
    ).trim();
    if (!url || !secret) {
      this.logger.warn(
        'Eskalasi email tidak dikirim: set LIVE_CHAT_ESCALATION_ADMIN_API_URL dan LIVE_CHAT_ESCALATION_ADMIN_API_SECRET (kirim lewat admin Laravel, tanpa nodemailer di sini).',
      );
      return false;
    }

    try {
      const payload = {
        recipients: recipients.join(','),
        subject,
        body: bodyPlain,
      };
      const { statusCode, body: raw } = await nativeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${secret}`,
          'User-Agent': 'Chatvolution-backend_clientarea/1.0',
        },
        body: JSON.stringify(payload),
      });
      let data: { success?: boolean; message?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        this.logger.warn(
          `Admin API bukan JSON (HTTP ${statusCode}). Awal respons: ${raw.slice(0, 400)}`,
        );
        return false;
      }
      const ok = statusCode >= 200 && statusCode < 300;
      if (ok && data.success) {
        this.logger.log(
          `Email eskalasi terkirim lewat admin Laravel (sesi ${chatSessionId}).`,
        );
        return true;
      }
      this.logger.warn(
        `Admin API mail gagal (HTTP ${statusCode}): ${data.message ?? ''} — ${raw.slice(0, 500)}`,
      );
    } catch (e) {
      this.logger.warn(
        `Admin API mail error (HTTP): ${e instanceof Error ? e.message : e}`,
      );
    }
    return false;
  }

  async maybeNotifyEscalation(
    payload: LiveChatEscalationPayload,
  ): Promise<void> {
    const text = payload.body || '';
    if (!matchesLiveChatEscalationKeywords(text)) return;

    this.logger.log(
      `Eskalasi: kata kunci terdeteksi pada pesan klien (session ${payload.chatSessionId}), memanggil admin Laravel…`,
    );

    const toRaw =
      this.config.get<string>('LIVE_CHAT_ESCALATION_TO')?.trim() || DEFAULT_TO;
    const to = toRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const baseUrl = (
      this.config.get<string>('LIVE_CHAT_APP_BASE_URL')?.trim() ||
      DEFAULT_APP_BASE
    ).replace(/\/$/, '');
    const path = buildLiveChatAgentPath(payload.chatSessionId);
    const chatUrl = `${baseUrl}${path}`;

    const userLabel = (payload.clientName || '').trim() || 'Klien (tanpa nama)';
    const subject = '[Chatvolution] - Ada Client Yang Membutuhkan Tim Teknis';

    const detailLines: (string | null)[] = [
      `Chat ID (session): ${payload.chatSessionId}`,
      `Nama pengguna: ${userLabel}`,
      payload.fromNumber ? `Identitas / kontak: ${payload.fromNumber}` : null,
      `Buka percakapan (agent): ${chatUrl}`,
    ];

    const intro =
      'Pengguna live chat mengirim pesan yang membutuhkan tim teknis. Mohon ditinjau dan ditindaklanjuti sesuai SOP.';

    const textBody = [
      'Halo Tim Teknis,',
      '',
      intro,
      '',
      '─── Detail ───',
      ...detailLines.filter((l) => l != null),
      '',
      '─── Isi pesan klien ───',
      text.slice(0, 8000),
      '',
      '—',
      'Email otomatis dari Chatvolution Live Chat (backend client area).',
    ].join('\n');

    await this.sendViaAdminApi(to, subject, textBody, payload.chatSessionId);
  }
}
