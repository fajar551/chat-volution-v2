<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class SmmSocmedChannelRequest extends FormRequest
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
        $id = Request::route('id');
        $return = [];
        switch ($method) {
            case 'post':
                $return = [
                    'name' => 'required|unique:App\Models\SmmSocmedChannel,name',
                    'description' => 'max:255',
                    'image_logo' => '',
                    'ic_logo' => '',
                    'slug' => '',
                    'status' => '',
                ];
                break;

            case 'put':
            case 'patch':
                $return = [
                    'name' => 'required|unique:App\Models\SmmSocmedChannel,name,'.$id,
                    'description' => 'max:255',
                ];
                break;
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
