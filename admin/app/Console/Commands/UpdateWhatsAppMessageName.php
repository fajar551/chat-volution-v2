<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Agent;

class UpdateWhatsAppMessageName extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:update-name';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update name and perusahaan columns in whatsapp_messages table';

    /**
     * Mapping instance to perusahaan
     */
    private function getPerusahaanByInstance($instance)
    {
        $mapping = [
            'wa1' => 'qwords',
            'wa2' => 'gfn',
            'wa3' => 'relabs',
            'wa4' => 'aksara',
            'wa5' => 'gssl',
            'wa6' => 'bw',
        ];

        return $mapping[$instance] ?? null;
    }

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
            $nameUpdatedCount = 0;
            $nameNotFoundCount = 0;
            $perusahaanUpdatedCount = 0;

            // 1. Update name dari agent_id
            $messages = DB::table('whatsapp_messages')
                ->whereNull('name')
                ->whereNotNull('agent_id')
                ->where('agent_id', '!=', '')
                ->get();

            if (!$messages->isEmpty()) {
                foreach ($messages as $message) {
                    $agentId = $message->agent_id;

                    // Cari agent berdasarkan id
                    // agent_id di whatsapp_messages bisa string, jadi perlu konversi ke integer jika perlu
                    $agent = Agent::find((int)$agentId);

                    if ($agent && !empty($agent->name)) {
                        // Update name di whatsapp_messages
                        DB::table('whatsapp_messages')
                            ->where('id', $message->id)
                            ->update(['name' => $agent->name]);

                        $nameUpdatedCount++;
                        // \Log::info("Updated whatsapp_messages id {$message->id} with agent name: {$agent->name}");
                    } else {
                        $nameNotFoundCount++;
                        // \Log::warning("Agent with id {$agentId} not found or has no name for whatsapp_messages id {$message->id}");
                    }
                }
            }

            // 2. Update perusahaan dari instance
            $messagesForPerusahaan = DB::table('whatsapp_messages')
                ->where(function($query) {
                    $query->whereNull('perusahaan')
                          ->orWhere('perusahaan', '=', '');
                })
                ->whereNotNull('instance')
                ->whereIn('instance', ['wa1', 'wa2', 'wa3', 'wa4', 'wa5', 'wa6'])
                ->get();

            if (!$messagesForPerusahaan->isEmpty()) {
                foreach ($messagesForPerusahaan as $message) {
                    $instance = $message->instance;
                    $perusahaan = $this->getPerusahaanByInstance($instance);

                    if ($perusahaan) {
                        DB::table('whatsapp_messages')
                            ->where('id', $message->id)
                            ->update(['perusahaan' => $perusahaan]);

                        $perusahaanUpdatedCount++;
                        // \Log::info("Updated whatsapp_messages id {$message->id} with perusahaan: {$perusahaan} (instance: {$instance})");
                    }
                }
            }

            $this->info("Name update: {$nameUpdatedCount} updated, {$nameNotFoundCount} not found. Perusahaan update: {$perusahaanUpdatedCount} updated.");
            // \Log::info("WhatsApp message update completed. Name: {$nameUpdatedCount} updated, {$nameNotFoundCount} not found. Perusahaan: {$perusahaanUpdatedCount} updated.");

            return 0;
        } catch (\Exception $e) {
            report($e);

            $this->error('Error: ' . trim(preg_replace('/\s+/', ' ', $e->getMessage())));
            return 1;
        }
    }
}

