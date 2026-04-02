<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Messages Language Lines
    |--------------------------------------------------------------------------
    */

    'email_already_registered' => 'Email already registered',

    'verify_email' => [
        'success' => '',
        'failed' => '',
    ],

    'subject' => [
        'verify_email_request' => 'Verify Your Account',
        'verify_user' => 'Verify Your Account',
        'verify_change_email_request' => 'Your Account Email Has Been Changed',
        'chat_history' => 'Chat History :CHAT_ID',
    ],

    'body' => [
        'page_title' => 'Verify Your '. env('APP_NAME') .' Account',
        'greetings' => 'Hello, <strong> :Name</strong>!',
        'content' => 'Thank you for registering your account to '. env('APP_NAME') .'. Please verify your account by click the following link ',
        'or' => 'Or click button below',
        'button_confirm' => 'Verify Account',
        'verify_change_email_request' => [
            'page_title' => 'Re-verify Your '. env('APP_NAME') .' Account',
            'greetings' => 'Hello, <strong> :Name</strong>!',
            'content' => 'Your account email of  '. env('APP_NAME') .' has been changed by the administrator. Please re-verify your account by click the following link ',
            'or' => 'Or click button below',
            'button_confirm' => 'Re-verify Account',
        ],
        'chat_history' => [
            'page_title' => 'Chat History :CompanyName Account',
            'greetings' => 'Hello, <strong> :Name</strong>!',
            'content' =>
                'Thank you for using our services. We attach your chat history with our agent in pdf file. Please kindly check it and let us know if you have feedback.
                <br><br>
                Thank You,
                <br><br>
                :CompanyName',
        ],
    ],


    // Reset Password Email
    'reset_password' => [
        'success' => 'Password changed successfully. You can now login.',
        'error' => 'Failed to change your password. Wait for a moment or request for reset password later.',
        'email_sent_success' => 'Reset password link has been sent to your email. Please check your inbox.',
        'email_sent_error' => 'Failed to send reset password email. Please contact administrator for further information.',

        'subject' => [
            'reset_password_request' => 'Reset Password',
        ],
        'body' => [
            'page_title' => 'Reset Your '. env('APP_NAME') .' Password',
            'greetings' => 'Hello!',
            'content' => 'You are receiving this email because we received a password reset request for your account.',
            'button_reset' => 'Reset Password',
            'or' => 'If you are having trouble from click the button, use this link instead',
            'content_closing' =>
                'This password reset link will expire in 60 minutes.
                <br>
                If you did not request a password reset, no further action is required.
                <br>',
            'regards' => 'Regards',
        ],
    ],

    // New Agent Notification
    'new_agent_notification' => [
        'success' => 'Your account has successfully created and active. You can now login.',
        'error' => 'Failed to create account. Wait for a moment or contact our Customer Service.',
        'email_sent_success' => 'Successfully create a new account, we have sent email address and password to your email. Please check your inbox.',
        'email_sent_error' => 'Failed to send new agent email notification. Please contact administrator for further information.',
        'subject' => 'Your Account Has Been Created!',
        'body' => [
            'page_title' => 'Welcome to ' . env('APP_NAME') . '!',
            'greetings' => 'Hello, <strong> :Name</strong>!',
            'content' => 'Your account has been created and activated! Use these email and password below to login.',
            'credential_email' => '<strong>Email: :Email</strong>',
            'credential_password' => '<strong>Password: :Password</strong>',
            'content_closing' =>
                '<br><br>
                Thank You,
                <br><br>
                :CompanyName',
        ],
    ],

];
