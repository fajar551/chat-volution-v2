<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Chat;
use App\Models\Setting;
use App\Services\AgentOauthClientService;
use App\Services\ChatService;
use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SettingController extends ApiController
{

    public $successStatus = 200;

    public function insert(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'meta' => 'required|string',
            // 'value' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $data = Setting::where('id_agent', $id)->where('meta', $request->meta)->first();
            if ($data) {
                $data->meta = $request->meta;
                $data->value = $request->value;
                $data->status = $request->status;
                $data->save();
            } else {
                $data = new Setting;
                $data->id_agent = $id;
                $data->meta = $request->meta;
                $data->value = $request->value;
                $data->status = $request->status;
                $data->save();
            }

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $data
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage())),
                'data' => null
            ], 400);
        }
    }

    public function update(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'meta' => 'required',
            'value' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $id = Auth::user()->id;
            $data = Setting::where('id', $request->id)->first();
            $data->id_agent = $id;
            $data->meta = $request->meta;
            $data->value = $request->value;
            $data->status = $request->status;
            $data->save();

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success')
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function list(Request $request)
    {
        try {

            $id = Auth::user()->id;
            $data = Setting::where('id_agent', $id)->get();

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $data
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function show(
        Request $request,
        $id=null,
        AgentOauthClientService $agent_oauth_client_service,
        ChatService $chat_service
        )
    {
        try {
            $data = null;
            $current_user = null;
            $current_user_roles = null;
            $current_user_company_id = null;
            if(Auth::check()) {
                $current_user = Auth::user();
                $current_user_roles = $current_user ? $current_user->id_roles : null;

                // ONLY SPECIFIC COMPANY
                if($current_user_roles != 2 && $current_user_roles != 1) {
                    $current_user_company = Agent::find($current_user->id_company);
                    $current_user_company_id = $current_user_company ? $current_user_company->id : null;
                } else {

                    $current_user_company_id = $current_user->id;
                }
            } else {
                /** for unauthorized user
                 * used for company that integrated its secret key */
                /** Check client key by middleware */
                $current_user_company = $agent_oauth_client_service->getCompanyBySecret($request->api_key); // get company id
                $current_user_company_uuid = $current_user_company->uuid;
                $current_user_company_id = $current_user_company->id;
            }

            // show value by meta
            $avalibale_fields = [
                'welcome_message',
                'away_message',
                'closing_message',
                'inbox_agent'
            ];

            if ( isset($request->meta) ) {
                if( in_array($request->meta, $avalibale_fields) ) {
                    $data = Setting::with(['agent' => function($q) {
                        $q->select('id', 'uuid', 'name', 'email');
                    }])
                    ->where('meta', $request->meta)
                    ->where('id_agent', $current_user_company_id)
                    ->first();
                } else {
                    $data = null;
                }
            }

            // show data by id
            if($id)
                $data = Setting::where('id', $id)->where('id_agent', $current_user_company_id)->first();

            if( empty($data)) {
                return response()->json([
                    'code' => 200,
                    'message' => __('messages.request.success'),
                    'data' => $data
                ], $this->successStatus);
            }

            if(isset($request['chat_id']) && !empty($request['chat_id'])) {
                $chat_data = Chat::with('chat_agent')->where('chat_id', $request['chat_id'])->first(); // get chat data
                if( !empty($chat_data) ) {
                    $store_history = $chat_service->storeChatHistory(
                        $request['chat_id'], $request->meta.'_sent',
                        $chat_data->id_users,
                        ( !empty($chat_data->chat_agent) ? $chat_data->chat_agent->id_agent : $current_user_company_id)
                    ); // update history chat action
                }
            }

            $data_with_agent = $data;
            $data_with_agent['agent_uuid'] = $data['agent']['uuid'];
            $data_with_agent['agent_name'] = $data['agent']['name'];
            $data_with_agent['agent_email'] = $data['agent']['email'];
            unset($data_with_agent['agent']);

            if( isset($data_with_agent['status']) && $data_with_agent['status'] == 1 ) {
                createActivityLog(null, [
                    'log_name' => $request->meta.'_sent',
                    'request_sent' => $request->all(),
                    'response' => $data_with_agent
                ]);
            }

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $data_with_agent
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function message(Request $request)
    {
        try {

            $id = Auth::user()->id;
            $data = Setting::where('meta', $request->meta)->where('id_agent', $id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $data
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function delete(Request $request)
    {
        try {

            $id = Auth::user()->id;
            Setting::where('id', $request->id)->where('id_agent', $id)->first()->delete();

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function showMySetting(Request $request, $type = null)
    {
        try {
            $setting_service = SettingService::getInstance();
            $detail = $setting_service->showMySetting($request->all(), $type);

            return $this->successResponse((array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function storeMySetting(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'meta' => [
                    'required',
                    Rule::in(['sound_notification'])
                ],
                'status' => 'integer|between:0,1'
            ]);
            if ($validator->fails())
                return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNPROCESSABLE_ENTITY);

            $setting_service = SettingService::getInstance();
            $store = $setting_service->storeMySetting($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

}
