<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CloseExpiredWhatsAppMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:close-expired {--number= : Nomor WhatsApp spesifik (contoh: 6285210843921)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Close WhatsApp messages yang received_at sudah melewati hari ini dengan status masih open';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        try {
            $number = $this->option('number');
            $today = Carbon::today();

            $this->info("Memulai proses penutupan pesan WhatsApp yang expired...");
            $this->info("Tanggal hari ini: {$today->format('Y-m-d')}");

            \Log::info("WhatsApp close expired: Memulai proses", [
                'number' => $number ?? 'all',
                'today' => $today->format('Y-m-d'),
                'timestamp' => now()
            ]);

            $totalUpdated = 0;

            // Jika nomor spesifik diberikan, proses nomor tersebut saja
            if ($number) {
                $this->info("Filter nomor spesifik: {$number}");
                \Log::info("WhatsApp close expired: Memproses nomor spesifik", [
                    'number' => $number,
                    'today' => $today->format('Y-m-d')
                ]);

                $updated = $this->closeExpiredForNumber($number, $today);
                $totalUpdated = $updated;

                \Log::info("WhatsApp close expired: Selesai memproses nomor spesifik", [
                    'number' => $number,
                    'updated' => $updated
                ]);
            } else {
                // Ambil semua nomor unik dari from_number dan to_number
                $this->info("Mengambil semua nomor unik dari tabel...");
                \Log::info("WhatsApp close expired: Mengambil semua nomor unik dari tabel");

                $fromNumbers = DB::table('whatsapp_messages')
                    ->select('from_number')
                    ->whereNotNull('from_number')
                    ->where('from_number', '!=', '')
                    ->where('from_number', '!=', 'me')
                    ->distinct()
                    ->pluck('from_number')
                    ->toArray();

                \Log::info("WhatsApp close expired: Selesai mengambil from_number", [
                    'total_from_numbers' => count($fromNumbers),
                    'sample_from_numbers' => array_slice($fromNumbers, 0, 5)
                ]);

                $toNumbers = DB::table('whatsapp_messages')
                    ->select('to_number')
                    ->whereNotNull('to_number')
                    ->where('to_number', '!=', '')
                    ->distinct()
                    ->pluck('to_number')
                    ->toArray();

                \Log::info("WhatsApp close expired: Selesai mengambil to_number", [
                    'total_to_numbers' => count($toNumbers),
                    'sample_to_numbers' => array_slice($toNumbers, 0, 5)
                ]);

                // Gabungkan dan ambil nomor unik
                $allNumbers = array_unique(array_merge($fromNumbers, $toNumbers));
                $allNumbers = array_filter($allNumbers, function($num) {
                    return !empty($num) && $num !== 'me';
                });

                $totalNumbers = count($allNumbers);
                $this->info("Ditemukan {$totalNumbers} nomor unik untuk dicek.");

                \Log::info("WhatsApp close expired: Nomor unik setelah merge dan filter", [
                    'total_numbers' => $totalNumbers,
                    'sample_numbers' => array_slice($allNumbers, 0, 10)
                ]);

                if ($totalNumbers == 0) {
                    $this->info("Tidak ada nomor yang ditemukan.");
                    \Log::warning("WhatsApp close expired: Tidak ada nomor yang ditemukan");
                    return 0;
                }

                // Loop setiap nomor dan close pesan yang expired
                $this->info("Memproses {$totalNumbers} nomor...");
                \Log::info("WhatsApp close expired: Memulai loop untuk memproses nomor", [
                    'total_numbers' => $totalNumbers
                ]);

                $progressBar = $this->output->createProgressBar($totalNumbers);
                $progressBar->start();

                $processedCount = 0;
                foreach ($allNumbers as $num) {
                    $updated = $this->closeExpiredForNumber($num, $today);
                    $totalUpdated += $updated;
                    $processedCount++;

                    if ($updated > 0) {
                        \Log::info("WhatsApp close expired: Nomor diproses dengan update", [
                            'number' => $num,
                            'updated' => $updated,
                            'processed_count' => $processedCount,
                            'total_updated_so_far' => $totalUpdated
                        ]);
                    }

                    $progressBar->advance();
                }

                $progressBar->finish();
                $this->newLine();

                \Log::info("WhatsApp close expired: Selesai loop semua nomor", [
                    'total_processed' => $processedCount,
                    'total_updated' => $totalUpdated
                ]);
            }

            $this->info("Berhasil mengupdate {$totalUpdated} pesan menjadi closed.");
            \Log::info("WhatsApp close expired: Proses selesai", [
                'total_updated' => $totalUpdated,
                'filter_number' => $number ?? 'all',
                'today' => $today->format('Y-m-d'),
                'timestamp' => now()
            ]);

            return 0;
        } catch (\Exception $e) {
            report($e);
            \Log::error('WhatsApp close expired: Error terjadi', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            $this->error('Error: ' . trim(preg_replace('/\s+/', ' ', $e->getMessage())));
            return 1;
        }
    }

    /**
     * Close expired messages untuk nomor tertentu
     *
     * @param string $number
     * @param Carbon $today
     * @return int
     */
    private function closeExpiredForNumber($number, $today)
    {
        try {
            // Query untuk mencari pesan yang perlu di-close untuk nomor tertentu
            // Cek berdasarkan from_number atau to_number
            // Status harus 'open' dan received_at < today
            $countQuery = DB::table('whatsapp_messages')
                ->where('chat_status', 'open')
                ->whereDate('received_at', '<', $today)
                ->where(function($q) use ($number) {
                    $q->where('from_number', 'like', '%' . $number . '%')
                      ->orWhere('to_number', 'like', '%' . $number . '%');
                });

            $countBeforeUpdate = $countQuery->count();

            \Log::info("WhatsApp close expired: Cek pesan untuk nomor", [
                'number' => $number,
                'today' => $today->format('Y-m-d'),
                'count_before_update' => $countBeforeUpdate
            ]);

            if ($countBeforeUpdate == 0) {
                return 0;
            }

            // Update status menjadi closed
            $updateQuery = DB::table('whatsapp_messages')
                ->where('chat_status', 'open')
                ->whereDate('received_at', '<', $today)
                ->where(function($q) use ($number) {
                    $q->where('from_number', 'like', '%' . $number . '%')
                      ->orWhere('to_number', 'like', '%' . $number . '%');
                });

            $updated = $updateQuery->update([
                'chat_status' => 'closed',
                'updatedAt' => now()
            ]);

            \Log::info("WhatsApp close expired: Update selesai untuk nomor", [
                'number' => $number,
                'count_before' => $countBeforeUpdate,
                'updated' => $updated
            ]);

            return $updated;
        } catch (\Exception $e) {
            \Log::error("WhatsApp close expired: Error saat memproses nomor", [
                'number' => $number,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return 0;
        }
    }
}

