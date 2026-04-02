<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class SmmPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $method = strtolower(Request::method());
        $return = [];
        switch ($method) {
            case 'post':
                $return = [
                ];

            case 'put':
            case 'patch':
                $return = [
                ];
        }

        return $return;
    }

    // Custom failedValidation Response
    protected function failedValidation(Validator $validator) {
        throw new HttpResponseException(
            response()->json(
                [
                    'code' => Response::HTTP_UNPROCESSABLE_ENTITY,
                    'status'=>'Error',
                    'message' => $validator->errors(),
                    'data' => null,
                ]
            , Response::HTTP_UNPROCESSABLE_ENTITY));
    }
}
