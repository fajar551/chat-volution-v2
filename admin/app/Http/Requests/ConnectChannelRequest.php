<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class ConnectChannelRequest extends FormRequest
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
        $current_route = \Route::current()->parameters();
        $type = $current_route['type'];
        $method = strtolower(Request::method());
        $return = [];
            switch ($type) {
                case 'whmcs':
                    $return = [
                        'domain' => 'required',
                        'identifier' => 'required',
                        'secret' => 'required'
                    ];
                    break;

                case 'whatsapp':
                    $return = [
                        'phone' => 'required|regex:/^\+\d{8,17}$/' // example: +62123456 || +41234567
                    ];
                    break;


                case 'telegram':
                    $return = [
                        'phone' => 'required|regex:/^\+\d{8,17}$/',
                        // 'phone' => 'required|unique:chat_channel_accounts,phone_number',
                        'apiId' => 'required',
                        'apiHash' => 'required',
                        'account_username' => 'required|alpha_dash|min:2|max:100'
                    ];
                    break;

                default:
                    # code...
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
