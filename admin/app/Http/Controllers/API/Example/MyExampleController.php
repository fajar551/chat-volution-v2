<?php

namespace App\Http\Controllers\API\Example;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\API\ApiController;
use Illuminate\Http\Response;

class MyExampleController extends ApiController
{
    public function success()
    {
        // Example response of success
        $user = [
            "id" => 10,
            "name" => "Afiani",
            "email" => 'afiani@qwords.co.id',
        ];

        return $this->successResponse($user, __('messages.save.success'), Response::HTTP_CREATED);
    }

    public function error()
    {
        // Example response of error
        return $this->errorResponse(null, __('messages.save.error'), Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
