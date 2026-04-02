<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AnonymousAgent;
use App\Models\ChatGroup;
use App\Models\ChatGroupInternalChat;
use App\Models\InternalChat;
use App\Models\InternalChatNotification;
use App\Services\InternalChatService;
use App\Services\ChatService;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class ChatGroupService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        AnonymousAgent $anonymous_agent_model,
        ChatGroup $chat_group_model,
        ChatGroupInternalChat $chat_group_internal_chat_model,
        InternalChat $internal_chat_model,
        InternalChatNotification $internal_chat_notification_model,

        ChatService $chat_service,
        InternalChatService $internal_chat_service
    ) {
        $this->agent_model = $agent_model;
        $this->anonymous_agent_model = $anonymous_agent_model;
        $this->chat_group_model = $chat_group_model;
        $this->chat_group_internal_chat_model = $chat_group_internal_chat_model;
        $this->internal_chat_model = $internal_chat_model;
        $this->internal_chat_notification_model = $internal_chat_notification_model;

        $this->chat_service = $chat_service;
        $this->internal_chat_service = $internal_chat_service;
    }

    public function store($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        foreach($request as $key => $item) {
            if( empty($item) ) {
                unset($request[$key]);
            }
        }

        $request['uuid'] = $current_user_company_uuid;
        $request['created_by'] = $current_user['id'];

        if( !empty($request['icon']) ) {
            $image = uploadFile($request['icon'], 'public/assets/images/uploads/chat-group-icon'); // upload file
            // if (Storage::disk()->exists($current_user['icon']) ) {
            //     $delete = Storage::delete($current_user['icon'] ); // delete old file
            // }
            $request['icon'] = $image; // update data
        }

        $store = $this->chat_group_model->create($request);

        if($store) {
            // create chat room
            // insert message ke tabel internal_chat
            $chart_id = strtoupper($this->chat_service->generateChartID());
            $create_room = $this->internal_chat_model->create([
                'uuid' => $current_user_company_uuid,
                'chat_id' => $chart_id,
                'chat_type' => 2,
                'status' => 1
            ]);

            $room_relation = $this->chat_group_internal_chat_model->updateOrCreate(
                ['id_chat_group' => $store->id],
                [
                    'id_chat' => $create_room->id,
                    'chat_id' => $create_room->chat_id,
                ]
            );

            // automaticaly add group creator to group as participant
            $add_agent = $this->updateAgentToGroup([
                "chat_group_id" => $store->id,
                "agent_ids" => [$current_user['id']]
            ], 'attach');

            $data = [
                'chat_details' => $create_room,
                'group_details' => $store,
            ];

            $result = $this->successResponseWithLog($data, __('messages.save.success'), null, 'create_group');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error') );
        }
        return $result;
    }

    /**
     * Get list groups
     * that created by agent
     *
     * type: company
     * is used to get all group list in that company
     *
     * @param Array $request
     * @param String $type = agent|company
     */
    public function list($request, $type)
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

        $query = $this->chat_group_model->with('company.company_detail')->where('uuid', $current_user_company_uuid);
        if(!empty($type) && $type == 'agent')
            $query = $query->where('created_by', $current_user->id);
        $data = $query->orderBy('created_at', 'desc')->get();

        $data->map(function ($item, $key) {
            if (!empty($item['created_at'])) {
                $date = $item['created_at'];
                $item['formatted_date'] = dateTimeFormat($date->toDateTimeString(), 'Y-m-d');
                $item['created_date'] = $item['formatted_date'];
            }

            $item['company_name'] = null;
            if( !empty($item['company']) ) {
                if( !empty($item['company']['company_detail']) ) {
                    $item['company_name'] = $item['company']['company_detail']['company_name'];
                    unset($item['company']);
                }
            }

            if( isset($item['icon']) ) {
                $avatar_url = !empty($item['icon']) ? parseFileUrl($item['icon']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['icon'] = $avatar_url;
            }
        });

        if($data) {
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

    public function destroy($id)
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

        $data = $this->chat_group_model
            ->where('uuid', $current_user_company_uuid)
            ->where('created_by', $current_user->id)
            ->where('id', $id)
            ->first();

        if( empty($data) )
            return $this->errorResponseWithLog(null, __('messages.delete.error') . " " . __('messages.data_not_found'));

        if( !empty($data['icon']) ) {
            if (Storage::disk()->exists($data['icon']) ) {
                $delete = Storage::delete($data['icon'] );
            }
        }

        $remove = $data->delete();
        if($remove) {
            $result = $this->successResponseWithLog( $remove, __('messages.delete.success'), null, 'delete_group');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.delete.error') );
        }
        return $result;
    }

    public function show($id)
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

        $data = $this->chat_group_model
            ->with(['company.company_detail'])
            ->with('agentsInGroup', function($q) {
                $q->select('agent.id','uuid','name','email','avatar','online')->orderBy('agent.name', 'asc');
            })
            ->withCount([
                'agentsInGroup as member_count' => function (Builder $query) {
                    // $query->where('online', 1);
                },
            ])
            ->whereHas('agentsInGroup', function($qry) use ($current_user) {
                $qry->where('agent.id', $current_user->id);
            })
            ->where('uuid', $current_user_company_uuid)
            ->where('id', $id)
            ->first();

        if( empty($data) )
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        if (!empty($data['created_at'])) {
            $date = $data['created_at'];
            $data['formatted_date'] = dateTimeFormat($date->toDateTimeString(), 'Y-m-d');
            $data['created_date'] = $data['formatted_date'];
        }

        $data['company_name'] = null;
        if( !empty($data['company']) ) {
            if( !empty($data['company']['company_detail']) ) {
                $data['company_name'] = $data['company']['company_detail']['company_name'];
                unset($data['company']);
            }
        }

        if( isset($data['icon']) ) {
            $avatar_url = !empty($data['icon']) ? parseFileUrl($data['icon']) : null;
            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($data['name'] . '-' . $data['id'], 'name');
            $data['icon'] = $avatar_url;
        }

        if( !empty($data['created_by']) ) {
            $data['created_by_name'] = !empty($data->created_by_relation->name) ? $data->created_by_relation->name : __('chat.internal_chat_label.account_not_found');
        }

        $data['participants'] = [];
        $participants = $data['agentsInGroup'];
        if ($participants->isNotEmpty()) {
            $participants = $participants->map(function ($item, $key) {
                $item['agent_id'] = !empty($item->id) ? $item->id : null;
                $item['agent_uuid'] = !empty($item->uuid) ? $item->uuid : null;
                $item['agent_email'] = !empty($item->email) ? $item->email : null;
                $item['agent_name'] = !empty($item->name) ? $item->name : __('chat.internal_chat_label.account_not_found');

                $avatar_url = !empty($item->avatar) ? parseFileUrl($item->avatar) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['agent_avatar'] = $avatar_url;

                unset(
                    $item['pivot'],
                    $item['id'],
                    $item['uuid'],
                    $item['email'],
                    $item['name'],
                    $item['avatar']
                );

                return $item;
            });
            unset($data['agentsInGroup']);

            $data['participants'] = $participants;
        }

        unset($data['created_by_relation']);

        if($data) {
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

    public function update($request)
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

        $data = $this->chat_group_model
            ->where('uuid', $current_user_company_uuid)
            // ->where('created_by', $current_user->id)
            ->where('id', $request['id'])
            ->first();

        if( empty($data) )
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        if( isset($request['icon']) ) {
            $image = null;
            if( !empty($request['icon']) && ($request['icon'] != "null") ) {
                $image = uploadFile($request['icon'], 'public/assets/images/uploads/chat-group-icon'); // upload file
            }

            if (Storage::disk()->exists($data['icon']) ) {
                $delete = Storage::delete($data['icon'] ); // delete old file
            }
            $request['icon'] = $image ? $image : null; // update data
        }

        unset( $request['id'] );
        $update = $data->update($request);

        if($update) {
            if( !empty($data['icon']) ) {
                $data['icon'] = parseFileUrl($data['icon']);
            }
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

    public function getAgentListInCompany($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company = $current_user;
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $selected_fields = [
            'id',
            'uuid',
            'id_roles',
            'id_department',
            'id_company',
            'name',
            'email',
            'phone',
            'avatar',
            'online'
        ];

        $company_data = $this->agent_model
        ->select($selected_fields)
        ->with(['company_detail'])
        ->where('id', $current_user_company_id)
        ->where('id', '<>', $current_user->id);

        $query = $this->agent_model
        ->select($selected_fields)
        ->with(['companyDetailByIdCompany'])
        ->with('department:id,name')
        ->where('id_company', $current_user_company_id)
        ->where('id', '<>', $current_user->id);

        if( isset($request['name']) && !empty($request['name']) ) {
            $query = $query->where('name', 'like', '%'.$request['name'].'%');
            $company_data = $company_data->where('name', 'like', '%'.$request['name'].'%');
        }

        if( isset($request['email']) && !empty($request['email']) ) {
            $query = $query->where('email', 'like', '%'.$request['email'].'%');
            $company_data = $company_data->where('email', 'like', '%'.$request['email'].'%');
        }

        if( isset($request['phone']) && !empty($request['phone']) ) {
            $company_data = $company_data->where('phone', 'like', '%'.$request['phone'].'%');
        }

        if( isset($request['keyword']) && !empty($request['keyword']) ) {
            $query = $query->where(function($subQ) use ($request) {
                $subQ->orWhere('name', 'like', '%'.$request['keyword'].'%')
                ->orWhere('email', 'like', '%'.$request['keyword'].'%')
                ->orWhere('phone', 'like', '%'.$request['keyword'].'%');
            });

            $company_data = $company_data->where(function($subQ) use ($request) {
                $subQ->orWhere('name', 'like', '%'.$request['keyword'].'%')
                ->orWhere('email', 'like', '%'.$request['keyword'].'%')
                ->orWhere('phone', 'like', '%'.$request['keyword'].'%');
            });
        }

        // relationship for show chat_id if agents has a chat room with another agent
        $query = $query->with('agentsInChat', function($relation) use ($current_user) {
            $relation->where('chat_type', 1);
            $relation->with('private_chat_participants', function($subRelation) use ($current_user) {
                $subRelation->where('id_agent', $current_user->id);
            });
            $relation->whereHas('private_chat_participants', function($subRelation) use ($current_user) {
                $subRelation->where('id_agent', $current_user->id);
            });
        });

        $company_data = $company_data->with('agentsInChat', function($relation) use ($current_user) {
            $relation->where('chat_type', 1);
            $relation->with('private_chat_participants', function($subRelation) use ($current_user) {
                $subRelation->where('id_agent', $current_user->id);
            });
            $relation->whereHas('private_chat_participants', function($subRelation) use ($current_user) {
                $subRelation->where('id_agent', $current_user->id);
            });
        });

        $agents = $query->orderBy('name', 'asc')->get();

        $agents->map(function ($item, $key) {
            $item['company_name'] = null;
            if( !empty($item['companyDetailByIdCompany']) ) {
                $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
                unset($item['companyDetailByIdCompany']);
            }

            $item['department_name'] = null;
            if( !empty($item['department']) )
                $item['department_name'] = $item['department']['name'];
            unset($item['department']);

            // agent avatar
            $avatar_url = !empty($item->avatar) ? parseFileUrl($item->avatar) : null;
            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item->name . '-' . $item->id, 'name');
            $item['avatar'] = $avatar_url;

            // show chat_id
            $item['chat_id'] = null;
            if( $item->agentsInChat->isNotEmpty() ) {
                $data_agentChat = $item->agentsInChat->first();
                $item['chat_id'] = $data_agentChat->chat_id;
            }
            unset($item['agentsInChat']);
        });

        $data = $agents;
        $arr_agents = [];
        if( $data->isNotEmpty() ) {
            $arr_agents = $agents->toArray();
        }

        $arr_company = [];
        $company_data = $company_data->first();
        if(!empty($company_data)) {
            // mapping
            $company_data['company_name'] = null;
            if( !empty($company_data['company_detail']) ) {
                $company_data['company_name'] = $company_data['company_detail']['company_name'];
                unset($company_data['company_detail']);
            }

            // company avatar
            $avatar_url = !empty($company_data['avatar']) ? parseFileUrl($company_data['avatar']) : null;
            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($company_data['name'] . '-' . $company_data['id'], 'name');
            $company_data['avatar'] = $avatar_url;

            // show chat_id
            $company_data['chat_id'] = null;
            if( $company_data->agentsInChat->isNotEmpty() ) {
                $data_agentChat = $company_data->agentsInChat->first();
                $company_data['chat_id'] = $data_agentChat->chat_id;
            }
            unset($company_data['agentsInChat']);

            $arr_company['company'] = $company_data->toArray(); // prevent override element
            if( !empty($arr_company) )
            $data = array_merge($arr_company, $arr_agents);
            $data = array_values($data);
        }

        if($data) {
            $result = $this->successResponse( $data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

    /**
     * Add agent/update agent to chat group
     * Attach/detach agent from chat group
     *
     * @param $request
     * @param $type = attach|detach
     */
    public function updateAgentToGroup($request, $type=null)
    {
        $current_user = null;
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        $agent_group_action = null;

        // check if agent exists
        $agents = $this->agent_model->whereIn('id', $request['agent_ids'])->pluck('id');
        if ($agents->isEmpty())
            return $this->errorResponse(null, 'Agent error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // match the agents
        $false_agents = array_diff($request['agent_ids'], $agents->toArray());
        $res_agents = array_diff($request['agent_ids'], $false_agents);

        if (empty($res_agents))
            return $this->errorResponse(null, 'Agent error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $assigned_agents = $res_agents;

        // check if group exists
        $group = $this->chat_group_model->where('id', $request['chat_group_id'])
            ->with('internal_chat_relation.internal_chat')
            ->first();
        if (empty($group))
            return $this->errorResponse(null, 'Chat Group error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // request for attach agents
        if($type == 'attach') {
            $update = $group->agentsInGroup()->syncWithoutDetaching($assigned_agents);

            if( !empty($group['internal_chat_relation']) ) {
                if( !empty($group['internal_chat_relation']['internal_chat']) ) {
                    $internal_chat_room = $group->internal_chat_relation->internal_chat;

                    # assign agents to internal_chat_agent
                    $group_participants = $group->agentsInGroup;
                    $assigned_participants = [];
                    $input_data_notif = [];
                    $agentNameAsSubject = null;
                    if($group_participants->isNotEmpty()) {
                        // prepare agents to be assigned
                        foreach( $group_participants as $key => $part ) {
                            // assign agents to chat
                            $assigned_participants[$part->id] = [ 'chat_id' => $internal_chat_room->chat_id ];

                            # assign to internal chat notification
                            foreach($assigned_agents as $keyAgentNotifContent => $valAgentNotifContent) {
                                $agentSubjectData = $group_participants->where('id', $valAgentNotifContent)->first();
                                $agentNameAsSubject = !empty($agentSubjectData) ? $agentSubjectData->name : null;

                                $input_data_notif[] = [
                                    'chat_id' => $internal_chat_room->chat_id,
                                    'chat_type' => 2,
                                    'id_chat' => $internal_chat_room->id,
                                    'id_agent' => $part->id,
                                    'from_agent' => $current_user['id'],
                                    'to_agent' => $valAgentNotifContent,
                                    'action' => 'join',
                                    'description' => $agentNameAsSubject . ' has joined the '. $group->name .' group.',
                                    'is_read' => 0
                                ];
                            }
                        }
                        // asign agents to chat
                        $store_chat_agent = $internal_chat_room->agentsInChat()->syncWithoutDetaching($assigned_participants);

                        ## update read chat time
                        # function to set counter chat and bubble chat for agent that just joined to group
                        # attached agent id in $store_chat_agent returns new members of group
                        if( isset($store_chat_agent['attached']) && !empty($store_chat_agent['attached']) ) {
                            $assigned_read_participants = [];
                            foreach($store_chat_agent['attached'] as $agentRead) {
                                $assigned_read_participants[$agentRead] = [
                                    'chat_id' => $internal_chat_room->chat_id,
                                    'read_date' => now()
                                ];
                            }

                            # assign agents to read chat time
                            $update_read = $internal_chat_room->agentsInReadConv()->syncWithoutDetaching($assigned_read_participants);
                        }

                        ## assign to internal chat notification
                        $store_notif = $this->internal_chat_notification_model->insert($input_data_notif);

                        $agent_group_action = 'add_agent_group';
                    }
                }
            }
        }

        // request for detach/remove agents
        if($type == 'detach') {
            // remove from chat room
            if( !empty($group['internal_chat_relation']) ) {
                if( !empty($group['internal_chat_relation']['internal_chat']) ) {
                    $internal_chat_room = $group->internal_chat_relation->internal_chat;

                        $group_participants = $group->agentsInGroup;
                        $input_data_notif = [];
                        $agentNameAsSubject = null;
                        // assign to internal chat notification
                        if($group_participants->isNotEmpty()) {
                            foreach( $group_participants as $key => $part ) {
                                // assign to internal chat notification
                                foreach($assigned_agents as $keyAgentNotifContent => $valAgentNotifContent) {
                                    $agentSubjectData = $group_participants->where('id', $valAgentNotifContent)->first();
                                    $agentNameAsSubject = !empty($agentSubjectData) ? $agentSubjectData->name : null;

                                    if($current_user['id'] == $valAgentNotifContent) {
                                        $description = __('messages.chat_group.leave_group', [
                                            'action_from' => $current_user['name'],
                                            'group_name' => $group->name
                                        ]);
                                    } else {
                                        $description = __('messages.chat_group.remove_agent_group', [
                                            'action_from' => $current_user['name'],
                                            'action_to' => $agentNameAsSubject,
                                            'group_name' => $group->name
                                        ]);
                                    }

                                    $input_data_notif[] = [
                                        'chat_id' => $internal_chat_room->chat_id,
                                        'chat_type' => 2,
                                        'id_chat' => $internal_chat_room->id,
                                        'id_agent' => $part->id,
                                        'from_agent' => $current_user['id'],
                                        'to_agent' => $valAgentNotifContent,
                                        'action' => 'leave',
                                        'description' => $description,
                                        'is_read' => 0
                                    ];
                                }
                            }
                            // assign to internal chat notification
                            $store_notif = $this->internal_chat_notification_model->insert($input_data_notif);
                        }

                        # remove agents from chat
                        $store_chat_agent = $internal_chat_room->agentsInChat()->detach($assigned_agents);

                        # remove agents from read chat time
                        $update_read = $internal_chat_room->agentsInReadConv()->detach($assigned_agents);

                        # remove from group
                        $update = $group->agentsInGroup()->detach($assigned_agents);

                        # add agents to deleted conversation
                        // AND
                        // show chats when date is greater than date of agents leave group
                        // updated in trigger

                        $agent_group_action = 'remove_agent_group';
                    }
            }
        }

        $updated_group = $this->chat_group_model->with('group_participants')->where('id', $request['chat_group_id'])->first();
        $participants = $updated_group['group_participants'];
        if ($participants->isNotEmpty()) {
            $participants = $participants->map(function ($item, $key) {
                $item['agent_name'] = !empty($item->agent) ? $item->agent->name : null;
                unset($item['agent']);

                return $item;
            });
        }
        $return_data = $updated_group;

        if ($participants) {
            $result = $this->successResponseWithLog($return_data, __('messages.request.success'), null, $agent_group_action);
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Create New Webhook
     */
    public function storeWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model->with('internal_chat_relation')->find($request['chat_group_id']);
        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        // Store data
        if( !empty($request['image']) ) {
            $image = uploadFile($request['image'], 'public/assets/images/uploads'); // upload file
            // if (Storage::disk()->exists($current_user['icon']) ) {
            //     $delete = Storage::delete($current_user['icon'] ); // delete old file
            // }
            $request['image'] = $image; // update data
        }
        $request = array_merge($request, [
            'chat_group_id' => $existing_chat_group['id'],
            'chat_group_internal_chat_id' => isset($existing_chat_group['internal_chat_relation']) ? $existing_chat_group['internal_chat_relation']['id'] : null,
            'chat_id' => isset($existing_chat_group['internal_chat_relation']) ? $existing_chat_group['internal_chat_relation']['chat_id'] : null,
            'id_chat' => isset($existing_chat_group['internal_chat_relation']) ? $existing_chat_group['internal_chat_relation']['id_chat'] : null,
            'created_by' => $current_user['id'],
            'name' => $request['name'],
        ]);

        $store = $this->anonymous_agent_model->create($request);

        if($store) {
            $anonymous_id = 'AAG'.$store['id'];
            $encrypted = Crypt::encrypt($anonymous_id);
            $update_latest_data = $store->update([
                'anonymous_agent_id' => $anonymous_id,
                'key' => $encrypted, // encrypt/decrypt using .env APP_KEY
            ]);

            $result_url = route('webhook.reply_group', ['key' => $encrypted]);
            if( isset($store['image']) ) {
                $avatar_url = !empty($store['image']) ? parseFileUrl($store['image']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($store['name'] . '-' . $store['id'], 'name');
                $store['image'] = $avatar_url;
            }
            $result_data = [
                'webhook_url' => $result_url,
                'name' => $store['name'],
                'image' => $store['image'],
            ];

            $result = $this->successResponseWithLog($result_data, __('messages.save.success'), null, 'create_group_webhook');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error') );
        }
        return $result;
    }

    public function getListWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model
            ->with(['anonymous_agents' => function($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->whereHas('group_participants', function($q) use ($current_user) {
                $q->where('agent_id', $current_user['id']);
            })
            ->find($request['chat_group_id']);

        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $result_data = $existing_chat_group['anonymous_agents']->map(function($item) {
            $result_url = route('webhook.reply_group', ['key' => $item['key']]);
            if( isset($item['image']) ) {
                $avatar_url = !empty($item['image']) ? parseFileUrl($item['image']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['image'] = $avatar_url;
            }

            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'image' => $item['image'],
                'key' => $item['key'],
                'webhook_url' => $result_url,
            ];
        });

        $result = $this->successResponseWithLog($result_data, __('messages.save.success'), null, 'create_group_webhook');
        return $result;
    }

    public function showWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model
            ->with(['anonymous_agents' => function($q) use ($request) {
                $q->orderBy('created_at', 'desc');
                $q->where('id', $request['id']);
            }])
            ->whereHas('anonymous_agents', function($q) use ($request) {
                $q->where('id', $request['id']);
            })
            ->whereHas('group_participants', function($q) use ($current_user) {
                $q->where('agent_id', $current_user['id']);
            })
            ->first();

        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $result_data = $existing_chat_group['anonymous_agents']->map(function($item) {
            $result_url = route('webhook.reply_group', ['key' => $item['key']]);
            if( isset($item['image']) ) {
                $avatar_url = !empty($item['image']) ? parseFileUrl($item['image']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['image'] = $avatar_url;
            }

            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'image' => $item['image'],
                'key' => $item['key'],
                'webhook_url' => $result_url,
            ];
        });

        if(empty(!empty($result_data)))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $result = $this->successResponseWithLog($result_data[0], __('messages.save.success'), null, 'create_group_webhook');
        return $result;
    }

    public function destroyWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model
            ->with(['anonymous_agents' => function($q) use ($request) {
                $q->orderBy('created_at', 'desc');
                $q->where('id', $request['id']);
            }])
            ->whereHas('anonymous_agents', function($q) use ($request) {
                $q->where('id', $request['id']);
            })
            ->whereHas('group_participants', function($q) use ($current_user) {
                $q->where('agent_id', $current_user['id']);
            })
            ->first();

        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $data = $existing_chat_group['anonymous_agents'][0];
        if( !empty($data['image']) ) {
            if (Storage::disk()->exists($data['image']) ) {
                $delete = Storage::delete($data['image'] );
            }
        }

        $remove = $this->anonymous_agent_model->where('id', $request['id'])->delete();
        if($remove) {
            $result = $this->successResponseWithLog( true, __('messages.delete.success'), null, 'delete_anonymous_agent');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.delete.error') );
        }
        return $result;
    }

    public function updateWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model
            ->with(['anonymous_agents' => function($q) use ($request) {
                $q->orderBy('created_at', 'desc');
                $q->where('id', $request['id']);
            }])
            ->whereHas('anonymous_agents', function($q) use ($request) {
                $q->where('id', $request['id']);
            })
            ->whereHas('group_participants', function($q) use ($current_user) {
                $q->where('agent_id', $current_user['id']);
            })
            ->first();

        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $data = $existing_chat_group['anonymous_agents'][0];
        if( !empty($data['image']) ) {
            if (Storage::disk()->exists($data['image']) ) {
                $delete = Storage::delete($data['image'] );
            }
        }

        if( isset($request['image']) ) {
            $image = null;
            if( !empty($request['image']) ) {
                $image = uploadFile($request['image'], 'public/assets/images/uploads'); // upload file
            }

            if (Storage::disk()->exists($data['image']) ) {
                $delete = Storage::delete($data['image'] ); // delete old file
            }
            $request['image'] = $image ? $image : null; // update data
        }

        $id = $request['id'];
        unset( $request['id'] );
        $update = $this->anonymous_agent_model->where('id', $id)->update($request);
        if($update) {
            $updated_data = $this->anonymous_agent_model->where('id', $id)->first();

            $result_url = route('webhook.reply_group', ['key' => $updated_data['key']]);
            if( isset($updated_data['image']) ) {
                $avatar_url = !empty($updated_data['image']) ? parseFileUrl($updated_data['image']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($updated_data['name'] . '-' . $updated_data['id'], 'name');
                $updated_data['image'] = $avatar_url;
            }
            $result_data = [
                'id' => $updated_data['id'],
                'name' => $updated_data['name'],
                'image' => $updated_data['image'],
                'key' => $updated_data['key'],
                'webhook_url' => $result_url,
            ];

            $result = $this->successResponse( $result_data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }

        return $result;
    }

    public function destroyImageWebhook($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if(Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['created_by']) && !empty($request['created_by']) ? $request['created_by'] : null;
        }

        // Validate chat group
        $existing_chat_group = $this->chat_group_model
            ->with(['anonymous_agents' => function($q) use ($request) {
                $q->orderBy('created_at', 'desc');
                $q->where('id', $request['id']);
            }])
            ->whereHas('anonymous_agents', function($q) use ($request) {
                $q->where('id', $request['id']);
            })
            ->whereHas('group_participants', function($q) use ($current_user) {
                $q->where('agent_id', $current_user['id']);
            })
            ->first();

        if(empty($existing_chat_group))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $data = $existing_chat_group['anonymous_agents'][0];
        if (Storage::disk()->exists($data['image']) ) {
            $delete = Storage::delete($data['image'] );
        }

        $update = $this->anonymous_agent_model->where('id', $request['id'])->update(['image' => null]);
        if($update) {
            $result = $this->successResponse( true, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') );
        }

        return $result;
    }

}