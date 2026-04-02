<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Illuminate\Support\Facades\Mail;
use App\Mail\SendMail;
use App\Services\ChatService;

class AutoSolveOnGoingChat extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:autosolve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Solve on going chat automatically when chat exceed more than 24 hours.';

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
            $chat_service = ChatService::getInstance();
            $list = $chat_service->autoUpdateChatStatus();
            if ($list['code'] == 200) {
                \Log::info('Successfully update chat status');
                // return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                \Log::error('Error cron when updating chat status automatically');
                // return $this->errorResponse((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            \Log::error(['Error cron when updating chat status automatically', $e]);
            $this->error(trim(preg_replace('/\s+/', ' ', $e->getMessage())));
            // return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }
}
