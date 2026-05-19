<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyOrderTicketSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('commerce.ticket_require_signature', true)) {
            return $next($request);
        }

        $id = (int) $request->route('id');
        $expires = (int) $request->query('expires', 0);
        $signature = (string) $request->query('sig', '');

        if ($id <= 0 || $expires < time() || $signature === '') {
            return $this->deny($request, 'Enlace no válido o expirado');
        }

        $expected = hash_hmac('sha256', "{$id}:{$expires}", (string) config('app.key'));

        if (! hash_equals($expected, $signature)) {
            return $this->deny($request, 'Enlace no válido');
        }

        return $next($request);
    }

    private function deny(Request $request, string $message): Response
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json(['success' => false, 'message' => $message], 403);
        }

        return response($message, 403);
    }
}
