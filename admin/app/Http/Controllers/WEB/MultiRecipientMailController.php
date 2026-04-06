<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use App\Services\MultiRecipientMailSender;
use Illuminate\Http\Request;

class MultiRecipientMailController extends Controller
{
    /** Alamat contoh untuk formulir (bisa diganti di UI). */
    public const DEFAULT_RECIPIENTS = 'fajarhabibzaelani@gmail.com, fajararrahman551@gmail.com';

    public function index()
    {
        return view('live-chat.tools.multi-recipient-mail', [
            'title' => 'Kirim Email Multi Penerima',
            'default_recipients' => self::DEFAULT_RECIPIENTS,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
            ],
        ]);
    }

    public function send(Request $request, MultiRecipientMailSender $sender)
    {
        $raw = (string) $request->input('recipients', '');
        $subject = (string) $request->input('subject', '');
        $body = (string) $request->input('body', '');

        $to = $sender->parseRecipients($raw);
        $result = $sender->send($to, $subject, $body);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => $result['ok'],
                'message' => $result['message'],
                'recipients' => $result['recipients'] ?? [],
            ], $result['ok'] ? 200 : 422);
        }

        return redirect()
            ->back()
            ->withInput()
            ->with($result['ok'] ? 'status' : 'error', $result['message']);
    }
}
