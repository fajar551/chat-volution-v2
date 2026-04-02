<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\API\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;

class ForgotPasswordController extends ApiController
{
    protected function sendResetLinkResponse(Request $request)
    {
        $input = $request->only('email');
        $validator = Validator::make($input, [
            'email' => "required|email"
        ]);
        if ($validator->fails()) {
            return $this->errorResponseWithLog(null, $validator->errors() );
        }
        $response =  Password::sendResetLink($input);

        if ($response == Password::RESET_LINK_SENT) {
            return $this->successResponseWithLog(null, __('email.reset_password.email_sent_success'), null, 'forgot_password');
        } else {
            return $this->errorResponseWithLog(null, __('email.reset_password.email_sent_error'));
        }

    }
}
