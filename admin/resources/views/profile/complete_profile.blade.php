<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Complete Profile</title>
</head>
<body>
    <h1 class="fs-3">Complete your profile before login</h1>
    <form action="" method="POST">
        @csrf
        @method('PUT')
        <input type="password" name="password" placeholder="Your password" class="form-control">
        <input type="password" name="password_confirmation" placeholder="Password Confirmation" class="form-control">
        <input type="text" name="name" placeholder="My Company" class="form-control">
        <input type="number" name="phone_number" placeholder="085614041202" class="form-control">

        <p>User Role:
            @php
                echo "<pre>";
                print_r($response);
                echo "<br>";
                echo "</pre>";
            @endphp
        </p>

        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</body>
</html>
