import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { OpenaiProxyService } from './openai-proxy.service';

@Controller('api-socket')
export class ConfigController {
  constructor(private readonly openaiProxy: OpenaiProxyService) {}

  /**
   * GET /api-socket/config/openai
   * Mengembalikan api_key dari table api_keys (WHERE service = 'openai') untuk clientarea.
   */
  @Get('config/openai')
  async getOpenAIConfig(@Res() res: Response) {
    try {
      const result = await this.openaiProxy.getApiKey();
      return res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: result.api_key ? 'OK' : 'OpenAI config not found',
      });
    } catch (error) {
      console.error('❌ ConfigController getOpenAIConfig:', error);
      return res.status(HttpStatus.OK).json({
        success: true,
        data: { api_key: '', assistant_id: '' },
        message: 'OpenAI config error',
      });
    }
  }

  /**
   * POST /api-socket/openai/chat
   * Proxy: backend ambil api_key dari DB, panggil OpenAI, return teks.
   * Client tidak perlu akses API key; build aman (tidak ada fetch config di client).
   */
  @Post('openai/chat')
  async openaiChat(
    @Body() body: { chatId?: string; userMessage?: string; message?: string },
    @Res() res: Response,
  ) {
    try {
      const chatId = body?.chatId ?? '';
      const userMessage = body?.userMessage ?? body?.message ?? '';
      const result = await this.openaiProxy.generateResponse(chatId, userMessage);
      if (result.error) {
        return res.status(HttpStatus.OK).json({
          success: false,
          error: result.error,
          message: result.message,
          details: result.details,
        });
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        data: { text: result.text ?? null },
      });
    } catch (error) {
      console.error('❌ ConfigController openaiChat:', error);
      return res.status(HttpStatus.OK).json({
        success: false,
        error: 'UNKNOWN',
        message: error?.message || 'Gagal generate respons AI.',
      });
    }
  }
}
