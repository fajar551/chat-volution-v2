<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\API\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;

class ResetPasswordController extends ApiController
{
    protected function sendResetResponse(Request $request)
    {
        $input = $request->only('email', 'token', 'password', 'password_confirmation');
        $validator = Validator::make($input, [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);
        if ($validator->fails()) {
            return $this->errorResponseWithLog(null, $validator->errors() );
        }
        $response = Password::reset($input, function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->save();
            event(new PasswordReset($user));
        });

        if ($response == Password::PASSWORD_RESET) {
            return $this->successResponseWithLog(null, __('email.reset_password.success'), null, 'reset_password');
        } else {
            return $this->errorResponseWithLog(null, __('email.reset_password.error'));
        }

    }
}
