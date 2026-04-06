<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyMultiMailApiSecret
{
    public function handle(Request $request, Closure $next)
    {
        $secret = trim((string) config('services.multi_mail.api_secret', ''));
        if ($secret === '') {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint tidak dikonfigurasi (MULTI_RECIPIENT_MAIL_API_SECRET kosong).',
            ], 503);
        }

        $bearer = $request->bearerToken();
        $header = $request->header('X-Multi-Mail-Secret');
        $raw = is_string($bearer) && $bearer !== '' ? $bearer : (string) $header;
        $provided = trim($raw);
        if ($provided === '' || ! hash_equals($secret, $provided)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        return $next($request);
    }
}
