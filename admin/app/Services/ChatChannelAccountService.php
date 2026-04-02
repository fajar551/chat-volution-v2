<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Channel;
use App\Models\ChannelAgent;
use App\Models\ChatChannelAccount;
use App\Models\CompanyDetail;
use App\Models\Menu;
use App\Models\PackageSet;
use App\Models\UserVerify;
use App\Services\SendEmailService;
use App\Services\AgentOauthClientService;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatChannelAccountService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        UserVerify $user_verify_model,
        SendEmailService $send_email_service,
        CompanyDetail $company_detail_model,
        Channel $channel_model,
        ChatChannelAccount $chat_channel_account_model,
        ChannelAgent $channel_agent_model,
        AgentOauthClientService $agent_oauth_client_service
    ) {
        $this->agent_model = $agent_model;
        $this->agent_oauth_client_service = $agent_oauth_client_service;
        $this->user_verify_model = $user_verify_model;
        $this->send_email_service = $send_email_service;
        $this->company_detail_model = $company_detail_model;
        $this->chat_channel_account_model = $chat_channel_account_model;
        $this->channel_model = $channel_model;
        $this->channel_agent_model = $channel_agent_model;

        $this->available_channels = [
            1 => 'livechat',
            2 => 'whatsapp',
            3 => 'telegram'
        ];
    }

    public function store($request, $type=null)
    {
        $current_user = null;

        // check auth for any type of channel
        if(Auth::check()) {
            // store by using auth
            $current_user = Auth::user();
        } elseif( $type == 'whatsapp' ) {
            // only for connect whatsapp with uuid
            $current_user = $this->agent_model->where('uuid', $request['uuid'])->first();
        } else {
            // store by using company secret key
            $company_data = $this->agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            $current_user = $company_data;
        }

        if( empty($current_user) )
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not exist');

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            return $this->errorResponse(null, __('messages.request.error') . ' Agent does not has permission to add this channel');
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        // we will add condition if package is present, later
        $channels = $this->channel_model->get();
        $filtered_channel = [];
        $filtered_channel = $channels->filter(function($item, $key) use ($type) {
            $chn_name = Str::slug($item['name']);
            if($type == $chn_name) {
                $assigned_channel = $item;
                return $item;
            }
        });
        if($filtered_channel->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not has permission to add this channel');

        $assigned_channel = array_values($filtered_channel->toArray());
        $assigned_channel = $assigned_channel[0];

        $check_phone = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id'])
            ->where('phone_number', $request['phone'])
            ->where('id_agent', '<>', $current_user->id)
            ->first();
        if(!empty($check_phone)) {
            $return_message = __('messages.channel.validation_error') . " " . __('messages.channel.phone_already_taken');
            return $this->errorResponse(null, $return_message);
        }

        // check_account_username
        // code...

        $query = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id']);
        $existing_data = $query->where('id_agent', $current_user->id)->first();

        if($existing_data) {
            $store = $existing_data;

            $send_code_retry = $existing_data->send_code_count;
            if($send_code_retry >= 3 && $type == 'telegram')
                return $this->errorResponse(null, __('messages.request.error').' '.__('messages.channel.too_many_request_code') );

            $send_code_retry = $send_code_retry+1;
        } else {
            $send_code_retry = 0;

            $store = $this->chat_channel_account_model;
            $store->id_agent = $current_user->id;
            $store->chat_channel_id = $assigned_channel['id'];
        }

        switch ($type) {
            case 'telegram':
                // check_account_username
                $check_account_username = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id'])
                    ->where('account_username', $request['account_username'])
                    ->where('id_agent', '<>', $current_user->id)
                    ->first();
                if(!empty($check_account_username)) {
                    $return_message = __('messages.channel.validation_error') . " " . __('messages.channel.account_username_already_taken');
                    return $this->errorResponse(null, $return_message);
                }

                $store->phone_number = $request['phone'];
                $store->api_id = $request['apiId'];
                $store->api_hash = $request['apiHash'];
                $store->account_name = isset($request['account_name']) && !empty($request['account_name']) ? $request['account_name'] : null;
                $store->account_username = isset($request['account_username']) && !empty($request['account_username']) ? $request['account_username'] : null;
                $store->account_id = isset($request['account_id']) && !empty($request['account_id']) ? $request['account_id'] : null;
                $store->account_session = (isset($request['account_session']) && !empty($request['account_session'])) ? $request['account_session'] : null;
                $store->wa_browser_id = null;
                $store->wa_secret_bundle = null;
                $store->wa_token_1 = null;
                $store->wa_token_2 = null;
                $store->raw_response = isset($request['raw_response']) && !empty($request['raw_response']) ? $request['raw_response'] : '{}';
                $store->send_code_count = $send_code_retry;
                $store->status = 1;
                $store->save();
                break;

            case 'whatsapp':
                $store->phone_number = $request['phone'];
                $store->api_id = null;
                $store->api_hash = null;
                $store->account_name = isset($request['account_name']) && !empty($request['account_name']) ? $request['account_name'] : null;
                $store->account_username = isset($request['account_username']) && !empty($request['account_username']) ? $request['account_username'] : null;
                $store->account_id = isset($request['account_id']) && !empty($request['account_id']) ? $request['account_id'] : null;
                $store->account_session = (isset($request['account_session']) && !empty($request['account_session'])) ? $request['account_session'] : null;
                $store->wa_browser_id = isset($request['wa_browser_id']) && !empty($request['wa_browser_id']) ? $request['wa_browser_id'] : null;
                $store->wa_secret_bundle = isset($request['wa_secret_bundle']) && !empty($request['wa_secret_bundle']) ? $request['wa_secret_bundle'] : null;
                $store->wa_token_1 = isset($request['wa_token_1']) && !empty($request['wa_token_1']) ? $request['wa_token_1'] : null;
                $store->wa_token_2 = isset($request['wa_token_2']) && !empty($request['wa_token_2']) ? $request['wa_token_2'] : null;
                $store->raw_response = isset($request['raw_response']) && !empty($request['raw_response']) ? $request['raw_response'] : '{}';
                $store->send_code_count = $send_code_retry;
                $store->status = isset($request['status']) && !empty($request['status']) ? $request['status'] : 0;
                $store->save();
                break;

            default:
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        if($store->save()) {
            $result = $this->successResponse($store, __('messages.request.success')." Store data ".ucwords($type)." success");
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }


    /**
     * @param $type = telegram|whatsapp
     */
    public function validateData($request, $type=null)
    {
        $current_user = null;
        if(Auth::check()) {
            $current_user = Auth::user();
        }

        $return_message = __('messages.channel.validation_success');
        $passed = 1;
        $error = false;

        // we will add condition if package is present, later
        $channels = $this->channel_model->get();
        $filtered_channel = [];
        $filtered_channel = $channels->filter(function($item, $key) use ($type) {
            $chn_name = Str::slug($item['name']);
            if($type == $chn_name) {
                $assigned_channel = $item;
                return $item;
            }
        });
        if($filtered_channel->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not has permission to access this channel');

        $assigned_channel = array_values($filtered_channel->toArray());
        $assigned_channel = $assigned_channel[0];

        $query = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id']);
        $existing_data = $query->where('phone_number', $request['phone'])->where('id_agent', '<>', $current_user->id)->first();

        if(!empty($existing_data)) {
            if($existing_data->id_agent != $current_user->id) {
                $return_message = __('messages.channel.validation_error') . " " . __('messages.channel.phone_already_taken');
                $passed = 0;
                return $this->errorResponse(null, $return_message);
            }
        }

        switch ($type) {
            case 'telegram':
                $send_code_data = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id'])
                    ->where('phone_number', $request['phone'])
                    ->where('id_agent', $current_user->id)
                    ->first();
                if(!empty($send_code_data)) {
                    if($send_code_data->send_code_count >= 3) {
                        $return_message = __('messages.channel.validation_error').' '.__('messages.channel.too_many_request_code');
                        $passed = 0;
                        return $this->errorResponse(null, $return_message);
                    }
                }

                // check duplicate api id
                if( isset($request['apiId']) ) {
                    $check_api_id = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id'])->where('api_id', $request['apiId'])->where('id_agent', '<>', $current_user->id)->first();

                    if(!empty($check_api_id)) {
                        $passed = 0;
                        return $this->errorResponse(null, __('messages.channel.validation_error') . " " . __('messages.channel.api_id_already_taken'));
                    }
                }
            break;
        }

        if($passed) {
            $result = $this->successResponse(true, $return_message);
        } else {
            $error = true;
            $result = $this->errorResponse(null, $return_message);
        }
        return $result;
    }

    /**
     * @param $type = telegram|whatsapp
     */
    public function updateStatus($type=null, $request)
    {
        $current_user = null;
        if(Auth::check()) {
            $current_user = Auth::user();
        } else {
            return $this->errorResponse(null, 'User: '. __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        $channel_id = null;
        $existing_data = $this->chat_channel_account_model->where('id_agent', $current_user->id);
        if(!empty($type)) {
            if(in_array($type, $this->available_channels)) {
                $channel_id = array_search($type, $this->available_channels);
                $existing_data = $existing_data->where('chat_channel_id', $channel_id);
            }
        }

        $existing_data = $existing_data->first();
        if(empty($existing_data))
            return $this->errorResponse(null, 'Channel Account: '. __('messages.request.error') . " " . __('messages.data_not_found'));

        $update = $existing_data;
        $update->status = $request['status'];
        if($request['status'] == 0)
            $update->send_code_count = 0;
        $update->save();

        if($update->save()) {
            $result = $this->successResponse($update, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function getCompanyChannelAccount($type=null)
    {
        $current_user = null;

        if(Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        // we will add condition if package is present, later
        $channels = $this->channel_model->get();
        $filtered_channel = [];
        $filtered_channel = $channels->filter(function($item, $key) use ($type) {
            $chn_name = Str::slug($item['name']);
            if($type == $chn_name) {
                $assigned_channel = $item;
                return $item;
            }
        });
        if($filtered_channel->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not has permission to add this channel');

        $requested_channel = array_values($filtered_channel->toArray());
        $requested_channel = $requested_channel[0];

        $existing_data = $this->channel_agent_model
            ->where('channel_id', $requested_channel['id'])
            ->where('id_agent', $current_user->id)
            ->first();

        if($existing_data) {
            $channel_user_data = $this->chat_channel_account_model->where('chat_channel_id', $requested_channel['id'])->where('id_agent', $current_user->id)->where('status', 1)->first();
            if( empty($channel_user_data))
                return  $this->errorResponse(null, __('messages.data_not_found'));

            $data = $channel_user_data;
            $data['channel_name'] = $requested_channel['name'];
        } else {
            return  $this->errorResponse(null, __('messages.data_not_found'));
        }

        if($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Only show active channel account
     *
     * $request = Array ['company_data']
     */
    public function companyChannelAccountList($request=null)
    {
        $current_user = null;

        if(Auth::check()) {
            $current_user = Auth::user();
        } else {
            $current_user = $request['company_data'];
        }
        $current_user_roles = $current_user ? $current_user['id_roles'] : null;
        $current_user_department = $current_user ? $current_user['id_department'] : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        $channel_user_data = $this->chat_channel_account_model->select('phone_number', 'chat_channel_id', 'status', 'account_username')
        ->where('id_agent', $current_user->id)
        ->where('status', 1)
        ->get();

        if( empty($channel_user_data))
            return  $this->errorResponse(null, __('messages.data_not_found'));

        $channel_user_data->map(function($q) {
            $q['chat_channel_name'] = $q->channel ? $q->channel->name : null;
            $q['url'] = null; // visit 3rd party chat url
            switch ($q['chat_channel_id']) {
                case '2':
                    if(isset($q['phone_number']) && !empty($q['phone_number']))
                        $q['url'] = env('WHATSAPP_ME_BASE_URL', "https://wa.me/") . urlencode($q['phone_number']);
                    break;

                case '3':
                    if(isset($q['account_username']) && !empty($q['account_username']))
                        $q['url'] = env('TELEGRAM_ME_BASE_URL', "https://t.me/") . urlencode($q['account_username']);
                    break;

                default:
                    $q['url'] = null;
                    break;
            }
            unset($q['channel']);
        });
        $data = $channel_user_data;
        if($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function checkChannelResendCode($request, $type=null)
    {
        $current_user = null;
        $data = null;

        if(Auth::check()) {
            // store by using auth
            $current_user = Auth::user();
        } else {
            // store by using company secret key
            $company_data = $this->agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            $current_user = $company_data;
        }

        // we will add condition if package is present, later
        $channels = $this->channel_model->get();
        $filtered_channel = [];
        $filtered_channel = $channels->filter(function($item, $key) use ($type) {
            $chn_name = Str::slug($item['name']);
            if($type == $chn_name) {
                $assigned_channel = $item;
                return $item;
            }
        });
        if($filtered_channel->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not has permission to add this channel');

        $assigned_channel = array_values($filtered_channel->toArray());
        $assigned_channel = $assigned_channel[0];

        // add condition if type telegram
        $existing_data = $this->chat_channel_account_model
            ->where('chat_channel_id', $assigned_channel['id'])
            ->where('id_agent', $current_user->id)
            ->first();

        if($existing_data) {
            $data = $existing_data;
            $data['remaining_retry'] = 0;

            $send_code_retry = $existing_data->send_code_count;
            if($send_code_retry >= 3) {
                return $this->errorResponse(null, __('messages.request.error').' '.__('messages.channel.too_many_request_code') );
            } else {
                $data['remaining_retry'] = 3 - $send_code_retry;
            }
        }

        if($data) {
            $result = $this->successResponse([ 'remaining_retry' => $data['remaining_retry']], __('messages.request.success') . " Remaining retry attempt: ".$data['remaining_retry']);
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function resetChannelResendCode($request, $type=null)
    {
        $current_user = null;
        if(Auth::check()) {
            $current_user = Auth::user();
        }

        // we will add condition if package is present, later
        $channels = $this->channel_model->get();
        $filtered_channel = [];
        $filtered_channel = $channels->filter(function($item, $key) use ($type) {
            $chn_name = Str::slug($item['name']);
            if($type == $chn_name) {
                $assigned_channel = $item;
                return $item;
            }
        });
        if($filtered_channel->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not has permission to access this channel');

        $assigned_channel = array_values($filtered_channel->toArray());
        $assigned_channel = $assigned_channel[0];

        // add condition if type telegram
        $query = $this->chat_channel_account_model->where('chat_channel_id', $assigned_channel['id']);
        if(!empty($current_user)) {
            // reset only for 1 agent
            $query = $query->where('id_agent', $current_user->id);
            $existing_data = $query->first();
        } else {
            // reset all agent accounts
            $existing_data = $query->get();
        }

        // update data
        if($existing_data)
            $store = $query->update(['send_code_count' => 0]);

        if($store) {
            $result = $this->successResponse($store, __('messages.request.success') );
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function getAccountsByChannel($type=null)
    {
        $data = $this->chat_channel_account_model->with(['agent:id,uuid', 'agent.company_detail'])->where('chat_channel_id', $type)->where('status', 1)->get();
        if($data->isNotEmpty()) {
            $data->map(function($item, $key) {
                $item['uuid'] = !empty($item['agent']) && isset($item['agent']['uuid']) ? $item['agent']['uuid'] : null;
                $item['company_name'] = !empty($item['agent']) && !empty($item['agent']['company_detail']) && isset($item['agent']['company_detail']['company_name']) ? $item['agent']['company_detail']['company_name'] : null;
                unset($item['agent']);
            });
        }

        if($data) {
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

}