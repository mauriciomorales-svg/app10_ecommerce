<?php

namespace App\Console\Commands;

use App\Services\JobsHoursStoreDemandService;
use Illuminate\Console\Command;

class RetryJobsHoursPublishCommand extends Command
{
    protected $signature = 'commerce:retry-jobshours-publish';

    protected $description = 'Reintenta publicar en JobsHours ventas con envío sin request_id o con error';

    public function handle(): int
    {
        $n = JobsHoursStoreDemandService::retryPending();
        $this->info("Republicaciones exitosas: {$n}");

        return self::SUCCESS;
    }
}
