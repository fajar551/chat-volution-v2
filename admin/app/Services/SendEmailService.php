<?php

namespace App\Services;

use App\Models\User;
use App\Models\SmmSocmedAccount;
use App\Models\SmmSocmedChannel;
use App\Models\SmmPost;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Exception, SymfonyResponse, Validator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Mail;
use App\Models\UserVerify;
use Illuminate\Support\Str;

class SendEmailService
{
    private
        $successCode = Response::HTTP_OK,
        $errorCode = Response::HTTP_BAD_REQUEST;

    public function __construct(UserVerify $user_verify_model)
    {
        $this->user_verify_model = $user_verify_model;
        $this->email_view = 'email.verification';
        $this->email_subject = __('email.subject.verify_email_request');
    }

    public static function getInstance()
    {
        return new static(
            new UserVerify()
        );
    }

    public function handle($data, $type = 'verify_user')
    {
        if ($type == 'verify_user' || $type == 'verify_change_email_request') {
            $this->email_subject = __('email.subject.'.$type);
            $this->email_view = ($type == 'verify_change_email_request') ? 'email.verification-change-email' : $this->email_view;

            // New Agent Notification Email
            $decypted_pass = isset($data['decrypted_password']) && !empty($data['decrypted_password']) ? $data['decrypted_password'] : null;
            if($decypted_pass && $data['status'] == 1) {
                $this->email_subject = __('email.new_agent_notification.subject');
                $this->email_view = 'email.new-agent-notification';
            }

            // User Verification Email
            $register_token = Str::random(64);
            $this->user_verify_model->create([
                'agent_id' => $data['id'],
                'token' => $register_token
            ]);

            $details = [
                'name' => $data['name'],
                'email' => $data['email'],
                'token' => $register_token,
                'decrypted_password' => $decypted_pass,
                'company_details' => $data['company_details']
            ];
        }

        // Send User Email Directly
        Mail::send($this->email_view, ['details' => $details], function($message) use($details){
            $message->to($details['email']);
            $message->subject( $this->email_subject );
        });

        return true;
    }

    public function withQueue($details)
    {
        // Send User Verification Email with Queue
        dispatch(new \App\Jobs\SendUserVerificationEmailJob($details));
    }
}