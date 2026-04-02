import { Controller, Get, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { LkhService, LkhQueryParams } from './lkh.service';

@Controller('api/lkh')
export class LkhController {
  private readonly logger = new Logger(LkhController.name);

  constructor(private readonly lkhService: LkhService) {}

  /**
   * GET /api/lkh/ping
   * Endpoint testing tanpa database. Cek apakah route LKH bisa diakses.
   */
  @Get('ping')
  ping() {
    return {
      status: 'success',
      message: 'LKH API reachablettt',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/lkh
   * Mengambil data LKH (Laporan Kegiatan Harian) dari tabel backend_messages.
   *
   * Query params (hanya 3):
   * - email: filter by agent email, opsional
   * - start_date: tanggal awal (YYYY-MM-DD), filter createdAt >= 00:00:00
   * - end_date: tanggal akhir (YYYY-MM-DD), filter createdAt <= 23:59:59
   */
  @Get()
  async getLkh(
    @Query('email') email?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const params: LkhQueryParams = {
      email,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      return await this.lkhService.getLkh(params);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`LKH getLkh error: ${message}`, stack);
      // Selalu kirim errorDetail di response agar bisa debug penyebab 500
      throw new InternalServerErrorException({
        message: 'Internal server error',
        errorDetail: message,
        ...(process.env.NODE_ENV !== 'production' && stack ? { stack } : {}),
      });
    }
  }
}
