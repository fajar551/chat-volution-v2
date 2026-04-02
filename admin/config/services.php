<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'facebook' => [
        /**
         * Local
         *
         * email: afiani@qwords
         * fb app name: Qwords Socmed Test
         */

        'client_id' => '229651075948530',
        'client_secret' => 'e9b193a5586e888c08ca4f0889179b46',
        'redirect' => 'http://localhost:8000/auth/facebook/callback',

        /**
         * Proto
         *
         * fb app in live mode
         */
        // 'client_id' => '3037102409896584',
        // 'client_secret' => 'a9710f7defff35556f844b3dc0aceaf8',
        // 'redirect' => 'http://proto.qwords.com/laravel-socmed/auth/facebook/callback',

        /**
         * Proto
         *
         * fb app in testing mode
         * fb app name: Qwords Socmed Test 1
         */
        // 'client_id' => '229651075948530',
        // 'client_secret' => 'e9b193a5586e888c08ca4f0889179b46',
        // 'redirect' => 'http://proto.qwords.com/laravel-socmed/auth/facebook/callback',
    ],

    'twitter' => [
        /** Key used is in development mode */
        'client_id' => env('TWITTER_CLIENT_ID', 'YAoeW12juyX4L2iGkDfaphGaR'),
        'client_secret' => env('TWITTER_CLIENT_SECRET', 'ED1e4XOQKPCxlLFr8b7okTzcNFRaiooVGuSeQr8tvZrZh4fJvw'),
        'redirect' => env('TWITTER_REDIRECT_URI', 'http://127.0.0.1:8000/auth/twitter/callback')
    ],

    'instagram' => [
        'client_id' => env('INSTAGRAM_CLIENT_ID'),
        'client_secret' => env('INSTAGRAM_CLIENT_SECRET'),
        'redirect' => env('INSTAGRAM_REDIRECT_URI')
      ],

    'tiktok' => [
        /** Key used is in development mode */
        'client_id' => env('TIKTOK_CLIENT_ID', 'aw9g5hmi1o4sunp0'),
        'client_secret' => env('TIKTOK_CLIENT_SECRET', 'af42db8dfbb1734d2f31a8c292a25c2c'),
        'redirect' => env('TIKTOK_REDIRECT_URI', 'http://127.0.0.1:8000/auth/tiktok/callback')
    ],

    'youtube' => [
        'client_id' => env('YOUTUBE_CLIENT_ID'),
        'client_secret' => env('YOUTUBE_CLIENT_SECRET'),
        'redirect' => env('YOUTUBE_REDIRECT_URI')
      ],

];
