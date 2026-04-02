<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;

use App\Rules\ChatFileRule;

class ChatFileRequest extends FormRequest
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
                case 'socmed':
                    return [
                        'path' => 'required',
                        'type' => 'required'
                    ];
                break;

                case 'from-dashboard-to-socmed':
                    return [
                        'files' => ['required',
                            new ChatFileRule([
                                'image' => '5120',
                                'video' => '102400',
                                'archive' => '10240',
                                'other' => '5120'
                            ])
                        ],
                    ];
                break;
            }

            switch ($method) {
                case 'post':
                    $return = [
                        'file' => ['required',
                            new ChatFileRule([
                                'image' => '5120',
                                'video' => '102400',
                                'archive' => '10240',
                                'other' => '5120'
                            ])
                        ],
                    ];
                    break;

                default:
                $return = [
                    'file' => 'required',
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
