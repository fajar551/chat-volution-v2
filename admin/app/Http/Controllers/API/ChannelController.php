<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConnectChannelRequest;
use App\Models\Channel;
use App\Models\ChannelAgent;
use App\Models\ChatChannelAccount;
use App\Services\AgentService;
use App\Services\AgentOauthClientService;
use App\Services\ChatChannelAccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChannelController extends ApiController
{

    public $successStatus = 200;

    public function insert(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $channel = new Channel;
            $channel->name = $request->name;
            $channel->description = $request->description;
            $channel->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function update(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $channel = Channel::where('id', $request->id)->first();
            $channel->name = $request->name;
            $channel->description = $request->description;
            $channel->status = $request->status;
            $channel->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $channel = Channel::where('id', $request->id)->first();
            $channel->status = $request->status;
            $channel->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
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
            $channel = Channel::all();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $channel
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function listChannelByClient(Request $request, Channel $channel_model)
    {
        try {
            $channel = $channel_model->all();
            // later will be changed into list channel by company
            // this data has relation with package

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $channel
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function detail(Request $request)
    {
        try {
            $channel = Channel::where('id', $request->id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $channel
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
            Channel::where('id', $request->id)->delete();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function insertAgent(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id_agent' => 'required|integer',
            'channel_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $channel = new ChannelAgent;
            $channel->id_agent = $request->id_agent;
            $channel->channel_id = $request->channel_id;
            $channel->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function updateAgent(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id_agent' => 'required|integer',
            'channel_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $channel = ChannelAgent::where('id', $request->id)->first();
            $channel->id_agent = $request->id_agent;
            $channel->channel_id = $request->channel_id;
            $channel->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function listAgent(Request $request)
    {
        try {

            $channel = ChannelAgent::all();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $channel
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function detailAgent(Request $request)
    {
        try {
            $channel = ChannelAgent::where('id', $request->id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $channel
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function deleteAgent(Request $request)
    {
        try {
            ChannelAgent::where('id', $request->id)->delete();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    // CONNECT WITH SOCMED
    /**
     *
     * @param String $type = whatsapp|telegram
     */
    public function checkChannelResendCode(
        Request $request,
        $type=null,
        ChatChannelAccountService $chat_channel_account_service
    )
    {
        try {
            $store = $chat_channel_account_service->checkChannelResendCode($request->all(), $type);
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

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    public function resetChannelResendCode(
        Request $request,
        $type=null,
        ChatChannelAccountService $chat_channel_account_service
    )
    {
        try {
            $store = $chat_channel_account_service->resetChannelResendCode($request->all(), $type);
            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        }catch (\Exception $e){
            report($e);
            return $this->errorResponse( trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Store data after connect with channel
     * @param String $type = whatsapp|telegram
     */
    public function connectChannel(
        ConnectChannelRequest $request,
        $type=null,
        ChatChannelAccountService $chat_channel_account_service,
        AgentService $agent_service
    )
    {
        try {
            if($type == 'whmcs') {
                $store = $agent_service->connectToWhmcs($request->all());
            } else {
                $store = $chat_channel_account_service->store($request->all(), $type);
            }
            $data = $store['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($store['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            // }

            createActivityLog(null, [
                'log_name' => 'connect_channel',
                'request_sent' => $request->all(),
                'response' => $data
            ]);

            return response()->json([
                'code' => $store['code'],
                'messgae' => $store['message'],
                'message' => $store['message'],
                'data' => $data
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Only validates data before connect to channel
     * @param String $type = whatsapp|telegram
     */
    public function validateConnectChannel(
        Request $request,
        $type=null,
        ChatChannelAccountService $chat_channel_account_service
    )
    {
        try {
            $rules = [ 'phone' => 'required' ];
            if($type == 'telegram') {
                $rules['apiId'] = 'required';
                $rules['account_username'] = 'required|alpha_dash|min:2|max:100';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails())
                return $this->errorResponse( null, $validator->errors() );

            if($type == 'telegram' || $type == 'whatsapp') {
                $data = $chat_channel_account_service->validateData($request->all(), $type);
            }

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'], 200 );
            }

        }catch (\Exception $e){
            report($e);
            return $this->errorResponse( trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Disconnect channel
     *
     * @param String $type = whatsapp|telegram
     */
    public function disconnectChannel(
        Request $request,
        $type=null,
        ChatChannelAccountService $chat_channel_account_service,
        AgentService $agent_service
    )
    {
        try {
            if($type == 'whmcs') {
                $store = $agent_service->updateStatusCompanyWhmcs(['status' => 0]);
            } else {
                $store = $chat_channel_account_service->updateStatus($type, ['status' => 0]);
            }

            if ($store['code'] == 200) {
                return $this->successResponseWithLog(
                    (array_key_exists('data', $store) ? $store['data'] : null),
                    __('messages.channel.disconnect_success', ['ChannelName' => ucwords($type)]),
                    null,
                    'disconnect_channel'
                );
            } else {
                return $this->errorResponseWithLog( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }

        }catch (\Exception $e){
            report($e);
            return $this->errorResponseWithLog( trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Get channel account by type
     * for agent with roles=company
     *
     * @param String $type = whatsapp|telegram
     */
    public function getCompanyChannelAccount(
        $type=null,
        ChatChannelAccountService $chat_channel_account_service,
        AgentService $agent_service
    )
    {
        try {
            if($type == 'whmcs') {
                $list = $agent_service->getCompanyWhmcsAccount();
            } else {
                $list = $chat_channel_account_service->getCompanyChannelAccount($type);
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
                'messgae' => $list['message'],
                'data' => $data
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    /**
     * Get account list by channel
     * used for sync session in socket
     */
    public function getAccListByChannel($type=null, ChatChannelAccountService $chat_channel_account_service)
    {
        try {
            $list = $chat_channel_account_service->getAccountsByChannel($type);
            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        }catch (\Exception $e){
            report($e);
            return $this->errorResponse( trim(preg_replace('/\s+/', ' ',
            $e->getMessage())) );
        }
    }

    /**
     * Get all available channel account
     * for agent with roles=company
     *
     * @param String $type = whatsapp|telegram
     */
    public function getCompanyChannelAccountList(
        Request $request,
        ChatChannelAccountService $chat_channel_account_service,
        AgentService $agent_service,
        AgentOauthClientService $agent_oauth_client_service
    )
    {
        try {
            /**
             * for unauthorized user
             * used for company that integrated its secret key
             */

             /** Check client key */
            $request['origin'] = $request->header('origin');
            $data = $agent_oauth_client_service->validate($request->all(), false);
            if ($data['code'] !== 200) {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }

            $user = $agent_oauth_client_service->getCompanyBySecret($request->api_key);

            $list = $chat_channel_account_service->companyChannelAccountList(['company_data' => $user]);
            $data = $list['data'];
            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }

        } catch (\Exception $e){
            report($e);
            return $this->errorResponse( trim(preg_replace('/\s+/', ' ',$e->getMessage())) );
        }
    }
}
