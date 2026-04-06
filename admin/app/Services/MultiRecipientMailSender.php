<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MultiRecipientMailSender
{
    /**
     * @return string[]
     */
    public function parseRecipients(string $raw): array
    {
        $parts = preg_split('/[\s,;]+/', trim($raw), -1, PREG_SPLIT_NO_EMPTY);
        $emails = [];
        foreach ($parts as $part) {
            $email = strtolower(trim($part));
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emails[] = $email;
            }
        }

        return array_values(array_unique($emails));
    }

    /**
     * @param string[] $to
     * @return array{ok: bool, message: string, recipients?: string[]}
     */
    public function send(array $to, string $subject, string $bodyPlain): array
    {
        if ($to === []) {
            return ['ok' => false, 'message' => 'Tidak ada alamat email valid.'];
        }

        $subject = trim($subject);
        if ($subject === '') {
            return ['ok' => false, 'message' => 'Subjek wajib diisi.'];
        }

        $bodyPlain = trim($bodyPlain);
        if ($bodyPlain === '') {
            return ['ok' => false, 'message' => 'Isi pesan wajib diisi.'];
        }

        try {
            $html = nl2br(htmlspecialchars($bodyPlain, ENT_QUOTES, 'UTF-8'));
            Mail::send([], [], function ($message) use ($to, $subject, $bodyPlain, $html) {
                $message->to($to)
                    ->subject($subject)
                    ->setBody($html, 'text/html')
                    ->addPart($bodyPlain, 'text/plain');
            });

            return ['ok' => true, 'message' => 'Email terkirim.', 'recipients' => $to];
        } catch (\Throwable $e) {
            Log::error('MultiRecipientMailSender: '.$e->getMessage());

            return ['ok' => false, 'message' => $e->getMessage()];
        }
    }
}
