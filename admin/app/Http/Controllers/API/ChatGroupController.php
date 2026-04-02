<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChatGroupRequest;
use App\Services\ChatGroupService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ChatGroupController extends ApiController
{
    public function __construct(
        ChatGroupService $chat_group_service
    )
    {
        $this->chat_group_service = $chat_group_service;
    }
    /**
     * Display a listing of the resource.
     *
     * @param $type = agent|company
     * @return \Illuminate\Http\Response
     */
    public function getList(Request $request)
    {
        try {
            $list = $this->chat_group_service->list(null, $request['type']);

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Show list of agents in company
     * Except the logged in agents
     */
    public function getAgentListInCompany(Request $request)
    {
        try {
            $list = $this->chat_group_service->getAgentListInCompany($request->all());

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ChatGroupRequest $request)
    {
        try {
            $store = $this->chat_group_service->store($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $data = $this->chat_group_service->show($id);

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(ChatGroupRequest $request)
    {
        try {
            $update = $this->chat_group_service->update($request->all());

            if ($update['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $update) ? $update['data'] : null), $update['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $update) ? $update['data'] : null),  $update['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $data = $this->chat_group_service->destroy($id);

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Add agent/update agent to chat group
     * Attach/detach agent from chat group
     *
     * @param $request
     * @param $type = attach-agent|detach-agent
     */
    public function attachAgentToChatGroup(Request $request, $type = null)
    {
        $validator = Validator::make($request->all(), [
            'agent_ids' => 'required|array',
            'chat_group_id' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            if($type == 'attach-agent') {
                $store = $this->chat_group_service->updateAgentToGroup($request->all(), 'attach');
            } else {
                $store = $this->chat_group_service->updateAgentToGroup($request->all(), 'detach');
            }

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Create New Webhook
     */
    public function storeWebhook(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|min:2|max:100',
                'chat_group_id' => 'required',
                'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120', // 5mb max
            ]);
            if ($validator->fails())
                return $this->errorResponse(null, $validator->errors() );

            $store = $this->chat_group_service->storeWebhook($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Show list webhook by chat group
     */
    public function getListWebhook(Request $request, $chat_group_id)
    {
        try {
            $request = $request->all();
            $request['chat_group_id'] = $chat_group_id;
            $list = $this->chat_group_service->getListWebhook($request);

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function showWebhook(Request $request, $id)
    {
        try {
            $request = $request->all();
            $request['id'] = $id;
            $detail = $this->chat_group_service->showWebhook($request);

            if ($detail['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $detail) ? $detail['data'] : null),  $detail['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function destroyWebhook(Request $request, $id)
    {
        try {
            $request = $request->all();
            $request['id'] = $id;
            $detail = $this->chat_group_service->destroyWebhook($request);

            if ($detail['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $detail) ? $detail['data'] : null),  $detail['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function destroyImageWebhook(Request $request, $id)
    {
        try {
            $request = $request->all();
            $request['id'] = $id;
            $detail = $this->chat_group_service->destroyImageWebhook($request);

            if ($detail['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $detail) ? $detail['data'] : null),  $detail['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function updateWebhook(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required',
                'name' => 'required|min:2|max:100',
                'image' => 'nullable|file|mimes:jpg,jpeg,png|max:5120', // 5mb max
            ]);
            if ($validator->fails())
                return $this->errorResponse(null, $validator->errors() );

            $detail = $this->chat_group_service->updateWebhook($request->all());

            if ($detail['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $detail) ? $detail['data'] : null),  $detail['message'] );
            }
        } catch (\Exception $e){
            dd($e);
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

}
