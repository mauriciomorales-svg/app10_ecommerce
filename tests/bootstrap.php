<?php

declare(strict_types=1);

/*
 * PHPUnit sets APP_ENV=testing before this file runs. Cached config ignores
 * phpunit.xml env vars and would keep e.g. session.driver=redis from production .env.
 */
if ((getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? '')) === 'testing') {
    $cached = dirname(__DIR__).'/bootstrap/cache/config.php';
    if (is_file($cached)) {
        @unlink($cached);
    }
}

require dirname(__DIR__).'/vendor/autoload.php';
