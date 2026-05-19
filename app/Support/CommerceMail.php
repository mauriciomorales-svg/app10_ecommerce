<?php

namespace App\Support;

class CommerceMail
{
    public static function canSend(): bool
    {
        $mailer = (string) config('mail.default', 'log');

        if (in_array($mailer, ['log', 'array'], true)) {
            return false;
        }

        if ($mailer === 'resend') {
            return trim((string) config('services.resend.key', '')) !== '';
        }

        if ($mailer === 'smtp') {
            return trim((string) config('mail.mailers.smtp.username', '')) !== ''
                && trim((string) config('mail.mailers.smtp.password', '')) !== '';
        }

        return true;
    }
}
