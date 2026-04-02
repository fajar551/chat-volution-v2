<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

class InternalChatReplyRequest extends FormRequest
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
        $current_route_name = \Route::currentRouteName();

        if($current_route_name == 'webhook.reply_group')
            $type = $current_route_name;

        $return = [];
            switch ($type) {
                case 'webhook.reply_group':
                    $return = [
                        'message' => 'required',
                        'key' => 'required', // param
                    ];
                    break;

                case 'group':
                    $return = [
                        'group_id' => 'required',
                        'message' => '',
                        'file_id' => ($current_route_name == 'request.meeting' ? '' : 'required_without:message')
                    ];
                    break;

                default:
                    // livechat
                    $return = [
                        'chat_id' => 'required',
                        'receiver' => 'required',
                        'message' => '',
                        'file_id' => ($current_route_name == 'request.meeting' ? '' : 'required_without:message')
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
