<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page | FAQ Manager - Genio Chatvolution</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="{{ asset('css/login.css') }}" rel="stylesheet">
</head>
<body>
    <div class="login-page">
        <h1>Login FAQ Manager</h1>
        <p>by Genio Chatvolution</p>
        <form method="POST" action="{{ route('login') }}">
            @csrf
          <div class="login-email mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" name="email" id="email" aria-describedby="emailHelp" placeholder="Enter Your Email" required>
          </div>
          <div class="login-password mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" name="password" id="password" placeholder="Enter Your Password" required>
          </div>
          <div class="forgot-password d-flex"><a href="#">Forgot Password?</a></div>
          <button type="submit" class="login-button btn btn-primary">Login</button>
        </form>
    </div>
</body>
</html>