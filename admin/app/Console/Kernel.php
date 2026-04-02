<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\AutoSolveOnGoingChat::class,
        Commands\UpdateWhatsAppMessageName::class,
        Commands\CloseExpiredWhatsAppMessages::class,
        Commands\CleanWhatsappNumbers::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('chat:autosolve')->cron('* * * * *');
        $schedule->command('whatsapp:update-name')->cron('* * * * *');
        $schedule->command('whatsapp:clean-lid')->cron('* * * * *');
        // Jalankan sekali sehari di jam 00:00 untuk close expired messages
        // Bisa juga diubah ke ->daily() atau ->twiceDaily(0, 12) untuk 2x sehari
        $schedule->command('whatsapp:close-expired')->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
