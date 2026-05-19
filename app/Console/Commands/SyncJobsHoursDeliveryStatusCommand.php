<?php

namespace App\Console\Commands;

use App\Services\JobsHoursDeliveryStatusService;
use Illuminate\Console\Command;

class SyncJobsHoursDeliveryStatusCommand extends Command
{
    protected $signature = 'commerce:sync-jobshours-status';

    protected $description = 'Sincroniza estado del mandado JobsHours en ventas con envío';

    public function handle(): int
    {
        $n = JobsHoursDeliveryStatusService::syncPending();
        $this->info("Ventas sincronizadas: {$n}");

        return self::SUCCESS;
    }
}
