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
            return response('Enlace de comanda no válido o expirado', 403);
        }

        $expected = hash_hmac('sha256', "{$id}:{$expires}", (string) config('app.key'));

        if (! hash_equals($expected, $signature)) {
            return response('Enlace de comanda no válido', 403);
        }

        return $next($request);
    }
}
