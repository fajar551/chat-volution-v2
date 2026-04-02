<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function Login()
    {
        $data = [
            'guest' => true,
            'title' => 'login'
        ];

        return view('live-chat.auth.login', $data);
    }

    public function Register()
    {
        $data = [
            'guest' => true,
            'CAPTCHA_SITE_KEY' => env('CAPTCHA_SITE_KEY'),
            'CAPTCHA_SECRET_KEY' => env('CAPTCHA_SECRET_KEY'),
        ];
        return view('live-chat.auth.register', $data);
    }

    public function verifyRegister()
    {
        $data = [
            'title' => 'Verify Register',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/jquery-countdown/jquery.countdown.min.js',
                '/js/verify-register.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];

        return view('layouts.app-verify.verify-register', $data);
    }

    public function redirectPage()
    {
        $data = [
            'title' => 'Redirect Page',
            'js' => [
                '/js/verif-redirect-page.js'
            ],
            'css' => [
                '/assets/libs/animate/animate.min.css'
            ]
        ];

        return view('layouts.app-verify.redirect-login', $data);
    }

    public function forgotPassword()
    {
        $data = [
            'guest' => true,
            'title' => __('auth.title.forgot_password')
        ];
        return view('live-chat.auth.forgot-password', $data);
    }

    public function resetPassword(Request $request)
    {
        $data = [
            'title' => 'Reset Password',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/jquery-countdown/jquery.countdown.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/reset-password.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
            'token' => $request->query('token'),
            'email' => $request->query('email'),
        ];

        return view('live-chat.auth.reset-password', $data);
    }
}
