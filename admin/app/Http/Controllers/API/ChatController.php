<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Agent;
use App\Models\Chat;
use App\Models\User;
use App\Models\ChatReply;
use App\Models\Rating;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewChatRequest;
use App\Http\Requests\ChatFileRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\API\ApiController;
use App\Services\AgentOauthClientService;
use App\Services\AgentService;
use App\Services\ChatService;

class ChatController extends ApiController
{
    public $successStatus = 200;

    public function __construct(AgentService $agent_service)
    {
        $this->agent_service = $agent_service;
    }

    public function newChat(
        NewChatRequest $re,
        $type = null,
        AgentOauthClientService $agent_oauth_client_service,
        ChatService $chat_service,
        Agent $agent_model
    ) {
        try {
            switch ($type) {
                case 'telegram':
                    $id_users = $this->getUserID(null, $re->fullName, $re->senderPhoneNumber);
                    $re['id_users'] = $id_users;

                    // get company by company uuid
                    $re['company_data'] = $agent_model->where('uuid', $re->companyUuid)->first();
                    if (empty($re['company_data']))
                        return ['code' => 400, 'messgae' => __('messages.data_not_found')];

                    $store = $chat_service->sendChatWithSocmed($re->all(), 'telegram');
                    break;

                case 'whatsapp':
                    $id_users = $this->getUserID(null, null, $re->senderPhoneNumber);
                    $re['id_users'] = $id_users;

                    // get company by company uuid
                    $re['company_data'] = $agent_model->where('uuid', $re->companyUuid)->first();
                    if (empty($re['company_data']))
                        return ['code' => 400, 'messgae' => __('messages.data_not_found')];

                    $store = $chat_service->sendChatWithSocmed($re->all(), 'whatsapp');
                    break;

                default:
                    // livechat
                    $company_data = $agent_oauth_client_service->getCompanyBySecret($re->api_key);
                    $re['company_data'] = $company_data;

                    $id_users = $this->getUserID($re->email, $re->name, null, $re->api_key);
                    $re['id_users'] = $id_users;

                    $store = $chat_service->storeFirstChat($re->all());
                    break;
            }

            $data = $store['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            return response()->json([
                'code' => 200,
                'data' => $data,
                'messgae' => __('messages.request.success')
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message'    => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function generateChartID()
    {
        $string = Str::random(10);
        $chart_id = 'Q' . $string;

        return $chart_id;
    }

    public function getUserID($email, $name, $phone = null, $api_key = null)
    {
        // validate by phone number
        if (!empty($phone)) {
            $phone = preg_replace('/\s+/', '', $phone); // remove whitespace

            $is_from_wa = strpos($phone, '@');
            if ($is_from_wa) {
                $arr_phone = explode('@', $phone);
                $phone = $arr_phone[0];
            }

            $pattern = preg_match('/[#$%^&*()+=\-\[\]\';,.\/{}|":<>?~\\\\]/', $phone); // detect special char
            if (!$pattern)
                $phone = '+' . $phone;

            $existing_user = User::where('phone', $phone)->first();
        }

        // validate by email
        $user_whmcs = [];
        if (!empty($email)) {
            $existing_user = User::where('email', $email)->first();

            // check if user is existing user by email
            $company_acc = $this->agent_service->getCompanyWhmcsAccount(['api_key' => $api_key]);
            if ($company_acc['code'] == 200) {
                $get_user_whmcs = $this->agent_service->checkWhmcsClient([
                    'identifier' => $company_acc['data']['identifier'],
                    'secret' => $company_acc['data']['secret'],
                    'email' => $email
                ]);

                if ($get_user_whmcs['code'] == 200)
                    $user_whmcs = $get_user_whmcs['data'];
            }
        }

        if (empty($existing_user)) {
            //get data from portal
            $client = $this->getClientPortal($email);
            $user = new User;

            // if($client=="null"){
            $user->id_whmcs = !empty($user_whmcs) ? $user_whmcs['id'] : 0;
            $user->reg_whmcs = null;
            $user->total_transaction = 0;
            $user->whmcs = '';
            $user->name = !empty($name) ? $name : (!empty($phone) ? $phone : null);
            $user->email = !empty($email) ? $email : null;
            $user->phone = !empty($phone) ? $phone : null;
            $user->noted = '';
            // } else{
            //     $dataclient = json_decode($client);

            //     if(isset($dataclient->paid_invoices)!=null){
            //         $inv_paid = count($dataclient->paid_invoices);
            //     }else{
            //         $inv_paid = 0;
            //     }

            //     $user->id_whmcs = $dataclient->id;
            //     $user->reg_whmcs = $dataclient->datecreated;
            //     $user->total_transaction = $inv_paid;
            //     $user->whmcs = '';
            //     $user->name = $dataclient->firstname.' '.$dataclient->lastname;
            //     $user->email = $email;
            //     $user->phone = $dataclient->phonenumber;
            //     $user->noted = '';
            // }

            $user->save();

            $userid = $user->id;
        } else {
            $update = $existing_user;
            $update->id_whmcs = !empty($user_whmcs) ? $user_whmcs['id'] : 0;
            $update->save();

            $userid = $existing_user->id;
        }

        return $userid;
    }

    public function getClientPortal($email)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://portal.qwords.com/apis/qchat/getData.php?email=" . $email);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $output = curl_exec($ch);
        curl_close($ch);
        return $output;
    }

    public function replyChatUser(
        Request $re,
        AgentOauthClientService $agent_oauth_client_service,
        ChatService $chat_service
    ) {
        /** Check client key */
        $re['origin'] = $re->header('origin');
        $data = $agent_oauth_client_service->validate($re->all(), false);
        if ($data['code'] !== 200) {
            return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
        }

        $validator = Validator::make($re->all(), [
            'chat_id' => 'required',
            'id_users' => 'required|integer',
            'message' => '',
            'file_id' => 'required_without:message'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }
        try {
            $company = $agent_oauth_client_service->getCompanyBySecret($re->api_key);

            // create new chatreply
            $reply = new ChatReply;
            $reply->chat_id = $re->chat_id;
            $reply->id_users = $re->id_users;
            $reply->id_agent = null; // set id agent to null
            //$reply->id_chat_files = $re->id_chat_files;
            $reply->message = $re->message;
            $reply->save();

            $update = $chat_service->updateByField($re['chat_id'], ['updated_at' => now()]);
            Log::info('Action triggered by reply chat from client: Update table chat');

            if ($reply) {
                $re['chat_id'] = $re->chat_id;
                $re['company_data'] = $company;
                $data_chat = $chat_service->historyByChatID($re, 'latest_by_client');
                $data = isset($data_chat['data'][1]) ? $data_chat['data'][1] : $data_chat['data'][0]; // get index 1 because 0 always contain first chat

                // will check it later
                // $data['email'] = 'user email';
                // update history chat action
                // $store_history = $this->storeChatHistory($chart_id, 'newchat', $id_users);

                // update file chat reply
                if (isset($re['file_id']) && !empty($re['file_id'])) {
                    $dataToUpdate = $reply;
                    $dataToUpdate['file_id'] = $re['file_id'];
                    $update = $chat_service->updateUploadedFileInChat($reply);

                    if (isset($update['data']) && !empty($update['data'])) {
                        $data['file_name'] = $update['data']['file_name'];
                        $data['file_type'] = $update['data']['file_type'];
                        $data['file_path'] = $update['data']['file_path'];
                        $data['file_url'] = $update['data']['file_url'];
                    }
                }
            }

            return $this->successResponseWithLog($data, __('messages.request.success'), null, 'reply_chat');
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null,  trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    public function replyChatAgent(
        Request $re,
        AgentOauthClientService $agent_oauth_client_service,
        ChatService $chat_service
    ) {
        if (!Auth::check()) {
            /**
             * for unauthorized user
             * used for company that integrated its secret key
             */

            /** Check client key */
            $re['origin'] = $re->header('origin');
            $data = $agent_oauth_client_service->validate($re->all(), false);
            if ($data['code'] !== 200) {
                return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
            }
        }

        $validator = Validator::make($re->all(), [
            'chat_id' => 'required',
            'id_agent' => 'required|integer',
            'id_users' => 'required|integer',
            'message' => '',
            'file_id' => 'required_without:message'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            if (isset($re['chat_id']) && !empty($re['chat_id'])) {
                $chat_data = ChatReply::where('chat_id', $re['chat_id'])->first();
                $is_first_response = false;
                if (empty($chat_data)) {
                    $is_first_response = true;
                    $store_history = $chat_service->storeChatHistory($re['chat_id'], 'first_response_sent', $re->id_users, $re->id_agent); // update history chat action
                }
            }

            // create new chatreply
            $reply = new ChatReply;
            $reply->chat_id = $re->chat_id;
            $reply->id_agent = $re->id_agent;
            $reply->id_users = $re->id_users;
            //$reply->id_chat_files = $re->id_chat_files;
            $reply->message = $re->message;
            $reply->save();

            $update = $chat_service->updateByField($re['chat_id'], ['updated_at' => now()]);
            Log::info('Action triggered by reply chat from agent: Update table chat');

            if ($reply) {
                // update file chat reply
                if (isset($re['file_id']) && !empty($re['file_id'])) {
                    $dataToUpdate = $reply;
                    $dataToUpdate['file_id'] = $re['file_id'];
                    $update = $chat_service->updateUploadedFileInChat($reply);
                }

                $list = $chat_service->historyByChatID($re->all(), 'latest');
                if (isset($list['data']) && !empty($list['data'])) {
                    $reply = isset($list['data'][1]) ? $list['data'][1] : $list['data'][0]; // get index 1 because 0 always contain first chat
                }
            }

            // insert to activity log
            createActivityLog(null, [
                'log_name' => $is_first_response ? 'first_response_sent' : 'reply_chat',
                'request_sent' => \Request::except('_token'),
                'response' => $reply
            ]);

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $reply
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null,  trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    /**
     * type null = for livechat
     * type socmed = for handle incoming message with file from telegram/whatsapp
     * type from-dashboard-to-socmed = for upload file from agent dashboard to socmed
     *
     * @param String $type = null|socmed|from-dashboard-to-socmed
     */
    public function uploadFileInChat(
        ChatFileRequest $request,
        ChatService $chat_service,
        $type = null
    ) {
        try {
            $store = $chat_service->uploadFileInChat($request->all(), $type);

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }


    public function showAllUploadedFiles(Request $request, ChatService $chat_service) {
        try {
            $store = $chat_service->showAllUploadedFiles($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }



    public function getFileInChat(ChatService $chat_service, $id)
    {
        try {
            $data = $chat_service->getFileInChat($id);

            if ($data['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function listChatUser(
        Request $request,
        ChatService $chat_service,
        AgentOauthClientService $agent_oauth_client_service
    ) {
        /**
         * for unauthorized user
         * used for company that integrated its secret key
         */

        /** Check client key */
        $request['origin'] = $request->header('origin');
        $data = $agent_oauth_client_service->validate($request->all(), false);
        if ($data['code'] !== 200) {
            return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
        }

        try {
            $list = $chat_service->listChatForClient($request->all(), 'history');
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

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

    public function listChatByAgent(Request $request, $type = null, ChatService $chat_service)
    {
        try {
            if ($type) {
                $list = $chat_service->listChatForAgent($request->all(), $type);
            } else {
                $list = $chat_service->listChatForAgent($request->all(), 'resolved');
            }

            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }


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

    public function chatListReportByAgent(Request $request, ChatService $chat_service)
    {
        try {
            if (!empty($request->status_name)) {
                $list = $chat_service->listChatForAgent($request->all(), $request->status_name);
            } else {
                $list = $chat_service->listChatForAgent($request->all(), 'resolved');
            }

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) && isset($list['data']['list']) ? $list['data']['list'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }

        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null,  trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    public function historyChatUser(Request $request, ChatService $chat_service)
    {
        try {
            $list = $chat_service->historyByChatID($request->all(), 'reset_unread');
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

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

    public function historyChatByUser(
        Request $request,
        ChatService $chat_service,
        AgentOauthClientService $agent_oauth_client_service
    ) {
        try {
            if (!Auth::check()) { // get data for client/user
                $company_data = $agent_oauth_client_service->getCompanyBySecret($request->api_key);
                $request['company_data'] = $company_data;
            }

            $list = $chat_service->historyByChatID($request->all(), 'newchat');
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

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

    public function chatInformation(Request $request, ChatService $chat_service)
    {
        try {
            $list = $chat_service->chatInformation($request->all());
            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null,  trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    // public function detailChat(Request $request)
    // {
    //     try {
    //         $data = Chat::where('chat_id', $request->chat_id)->first();

    //         return response()->json([
    //             'code' => 200,
    //             'messgae' => __('messages.request.success'),
    //             'data' => $data
    //         ], $this->successStatus);
    //     } catch (\Exception $e) {
    //         report($e);
    //         return response()->json([
    //             'code'    => $e->getCode(),
    //             'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
    //         ], 400);
    //     }
    // }

    public function updateChatStatus(Request $re, AgentOauthClientService $agent_oauth_client_service, ChatService $chat_service)
    {
        if (!Auth::check()) {
            /**
             * for unauthorized user
             * used for company that integrated its secret key
             */

            /** Check client key */
            $re['origin'] = $re->header('origin');
            $data = $agent_oauth_client_service->validate($re->all(), false);
            if ($data['code'] !== 200) {
                return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
            }

            $user = $agent_oauth_client_service->getCompanyBySecret($re->api_key);
            $re['company_data'] = $user;
        }

        $validator = Validator::make($re->all(), [
            'chat_id' => 'required',
            'status' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $update = $chat_service->updateChatStatus($re->all());
            $data = $update['data'];

            if ($update['code'] == 200) {
                return $this->successResponseWithLog((array_key_exists('data', $update) ? $update['data'] : null), $update['message'], null, 'update_chat_status');
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $update) ? $update['data'] : null),  $update['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null,  trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    public function uploadAttachFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required',
            'file' => 'mimes:jpeg,jpg,png,gif|required|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $file = $request->file('file');
            $fileName = $id . 'chat_' . Carbon::now()->timestamp . '.' . $file->getClientOriginalExtension();
            $dir = 'public/chat_img/' . $client_id . '/' . $fileName;
            Storage::putFileAs('chat_img/' . $client_id, $file, $fileName);

            return $fileName;
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code' => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function giveChatRating(Request $request, Rating $rating_model)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required',
            'id_agent' => 'required',
            'rating' => 'required|integer|between:1,5'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $input = $request->only('chat_id', 'id_agent', 'rating');
            $store = $rating_model->updateOrCreate(['chat_id' => $request->chat_id], $input);

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.save.success')
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code' => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    /**
     * Transfer chat/handover case
     * to department/agent
     *
     * @param $request
     */
    public function transferChatByAgent(Request $request, ChatService $chat_service)
    {
        try {
            $store = $chat_service->transferChatByAgent($request->all());
            $data = $store['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => $store['message'],
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

    /**
     * Add label/update label to chat
     * Attach/detach label from chat
     *
     * @param $request
     * @param $type = attach-to-chat|detach-to-chat
     */
    public function attachLabelToChat(Request $request, ChatService $chat_service, $type = null)
    {
        $validator = Validator::make($request->all(), [
            'id_labels' => 'required|array',
            'chat_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            if ($type == 'attach-to-chat') {
                $store = $chat_service->updateLabelToChat($request->all(), 'attach');
            } else {
                $store = $chat_service->updateLabelToChat($request->all(), 'detach');
            }
            $data = $store['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => $store['message'],
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

    /**
     * Show chat labels by chat_id
     */
    public function getLabelByChatId(Request $request, ChatService $chat_service)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $store = $chat_service->getLabelByChatId($request->all());
            $data = $store['data']['chat_labels'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => $store['message'],
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

    public function unreadCounter(Request $request, ChatService $chat_service)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $store = $chat_service->countUnreadChatByID($request->all());
            $data = $store['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => $store['message'],
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

    /**
     * Get company information by chat_id
     *
     * @param $request "chat_id"
     */
    public function getCompanyByChatId(Request $request, ChatService $chat_service)
    {
        try {
            $validator = Validator::make($request->all(), [
                'chat_id' => 'required',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(null, $validator->errors());
            }

            $store = $chat_service->getCompanyByChatId($request->all());
            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function historyChatAction(Request $request, ChatService $chat_service)
    {
        try {
            $validator = Validator::make($request->all(), [
                'chat_id' => 'required',
            ]);

            if ($validator->fails())
                return $this->errorResponse(null, $validator->errors());

            $list = $chat_service->historyChatActionByChatID($request->all());
            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * For cron job and handle on going chat
     */
    public function autoUpdateChatStatus(Request $request, ChatService $chat_service)
    {
        try {
            $list = $chat_service->autoUpdateChatStatus();
            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Send chat history to client's email
     */
    public function sendChatHistory(
        Request $request,
        ChatService $chat_service,
        $type = null)
    {
        try {
            $data = $chat_service->sendChatHistory($request->all(), $type);
            if ($data['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e )));
        }
    }

}
