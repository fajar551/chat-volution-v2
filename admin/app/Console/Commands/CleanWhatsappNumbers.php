<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanWhatsappNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:clean-lid';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove @lid suffix from from_number and to_number columns in whatsapp_messages table';

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
            $sql = "
                UPDATE whatsapp_messages
                SET
                    from_number = REPLACE(from_number, '@lid', ''),
                    to_number   = REPLACE(to_number, '@lid', '')
                WHERE from_number LIKE '%@lid'
                   OR to_number LIKE '%@lid'
            ";

            $affected = DB::affectingStatement($sql);

            $message = "Successfully cleaned @lid suffix from whatsapp_messages. Affected rows: {$affected}";
            $this->info($message);
            Log::info($message);

            return 0;
        } catch (\Exception $e) {
            $errorMessage = 'Error cleaning @lid suffix from whatsapp_messages: ' . trim(preg_replace('/\s+/', ' ', $e->getMessage()));

            report($e);
            Log::error($errorMessage, [
                'exception' => $e,
            ]);

            $this->error($errorMessage);

            return 1;
        }
    }
}


