<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AgentStatusAlias;
use App\Models\ChatGroup;
use App\Models\ChatGroupInternalChat;
use App\Models\InternalChat;
use App\Models\InternalChatAgent;
use App\Models\InternalChatReply;
use App\Services\ChatService;
use App\Services\ChatGroupService;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AgentStatusAliasService
{
    use FormatResponserTrait;

    private $internal_chat_type = [
        'private' => 1,
        'group' => 2
    ];

    public function __construct(
        Agent $agent_model,
        AgentStatusAlias $agent_status_alias_model
    ) {
        $this->agent_model = $agent_model;
        $this->agent_status_alias_model = $agent_status_alias_model;
    }

    public function store($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
        }

        $data_aliases = [ 'uuid' => $current_user_company_uuid ];
        if( isset($request['status_name']) && !empty($request['status_name']) )
            $data_aliases['name'] = $request['status_name'];

        if( isset($request['expired_at']) && !empty($request['expired_at']) )
            $data_aliases['expired_at'] = $request['expired_at']; // Y-m-d H:i:s

        $store = $this->agent_status_alias_model->updateOrCreate(
            ['agent_id' => $current_user->id],
            $data_aliases
        );

        if($store) {
            $agent = $this->agent_model->where('id', $current_user->id);
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $agent = $agent->where('id_company', $current_user_company_id);
            }
            $agent = $agent->first();

            $alias_data = $agent->status_alias;
            $alias = null;
            $expired_at = null;
            if(!empty($alias_data)) {
                $alias = $alias_data->name;
                $expired_at = $alias_data->expired_at;
            }

            $data = [
                'id' => $agent->id,
                'uuid' => $agent->uuid,
                'name' => $agent->name,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'online' => $agent->online,
                'status_alias' => $store->name,
                'status_alias_expired_at' => $store->expired_at,
                'display_status_alias' => $alias,
                'display_status_alias_expired_at' => $expired_at,
            ];

            $result = $this->successResponse( $data, __('messages.save.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.save.error') );
        }
        return $result;
    }

    public function destroy($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data = $this->agent_status_alias_model->where('uuid', $current_user_company_uuid)->where('agent_id', $current_user->id)->first();
        if(empty($data))
            return $this->errorResponse(null, 'Agent Status Alias error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $delete = $data->delete();

        if($delete) {
            $result = $this->successResponse( $delete, __('messages.delete.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.delete.error') );
        }
        return $result;
    }

    /**
     * @param $type = null|all
     */
    public function list($request, $type=null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
        }

        if($type == null) {
            $list = $this->agent_status_alias_model->where('uuid', $current_user_company_uuid)->where('agent_id', $current_user->id)->first();

            $agent = $this->agent_model->where('id', $current_user->id);
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $agent = $agent->where('id_company', $current_user_company_id);
            }
            $agent = $agent->first();

            $alias_data = $agent->status_alias;
            $alias = null;
            $expired_at = null;
            if(!empty($alias_data)) {
                $alias = $alias_data->name;
                $expired_at = $alias_data->expired_at;
            }

            $data = [
                'id' => $agent->id,
                'uuid' => $agent->uuid,
                'name' => $agent->name,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'online' => $agent->online,
                'status_alias' => $list->name,
                'status_alias_expired_at' => $list->expired_at,
                'display_status_alias' => $alias,
                'display_status_alias_expired_at' => $expired_at,
            ];

            if(empty($data))
                return $this->errorResponse(null, 'Agent Status Alias error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        } else {
            $data = $this->agent_status_alias_model->all();
        }

        if($data) {
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

}