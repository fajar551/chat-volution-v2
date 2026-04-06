<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\MultiRecipientMailSender;
use Illuminate\Http\Request;

/**
 * Dipanggil dari backend lain (mis. backend_clientarea) di domain berbeda.
 * Autentikasi: Authorization: Bearer {MULTI_RECIPIENT_MAIL_API_SECRET} atau header X-Multi-Mail-Secret.
 */
class InternalMultiMailController extends Controller
{
    public function send(Request $request, MultiRecipientMailSender $sender)
    {
        $recipientsRaw = $request->input('recipients');
        if (is_array($recipientsRaw)) {
            $raw = implode(',', array_map('strval', $recipientsRaw));
        } else {
            $raw = (string) $recipientsRaw;
        }

        $to = $sender->parseRecipients($raw);
        $subject = (string) $request->input('subject', '');
        $body = (string) $request->input('body', '');

        $result = $sender->send($to, $subject, $body);

        return response()->json([
            'success' => $result['ok'],
            'message' => $result['message'],
            'recipients' => $result['recipients'] ?? [],
        ], $result['ok'] ? 200 : 422);
    }
}
