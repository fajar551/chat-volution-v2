<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ __('email.body.page_title') }}</title>
</head>
<body>
    <h1>{{ __('email.body.page_title') }}</h1>
    <p>{{ __('email.body.greetings', ['name' => $details['name']]) }}</p>
    <p>
        {{ __('email.body.content') }}
        <a href="{{ route('user.verify', $details['token']) }}">{{ route('user.verify', $details['token']) }}</a>
        <p>{{ __('email.body.or') }}</p>
        <a href="{{ route('user.verify', $details['token']) }}">Verify Email</a>
    </p>
</body>
</html>