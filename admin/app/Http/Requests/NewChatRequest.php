<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class NewChatRequest extends FormRequest
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
        $type = isset($current_route['type']) ? $current_route['type'] : null;
        $method = strtolower(Request::method());
        $return = [];
            switch ($type) {
                case 'whatsapp':
                    $return = [
                        'companyUuid' => 'required',
                        'senderPhoneNumber' => 'required', // 6282218471234@c.us
                        'message' => '',
                        'file_id' => 'required_without:message'
                    ];
                    break;


                case 'telegram':
                    $return = [
                        'companyUuid' => 'required',
                        'senderPhoneNumber' => '', // 6282218471234
                        'senderId' => 'required|required',
                        'message' => '',
                        'file_id' => 'required_without:message',
                        'fullName' => 'required'
                    ];
                    break;

                default:
                    // livechat
                    $return = [
                        'id_channel' => 'required|integer',
                        'name' => 'required|string',
                        'email' => 'required|string',
                        'id_topic' => 'required|integer',
                        'id_department' => 'required|integer',
                        'message' => '',
                        'file_id' => 'required_without:message'
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
