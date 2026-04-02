<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Channel;
use App\Models\Chat;
use App\Models\ChatAgent;
use App\Models\ChatChannelAccount;
use App\Models\ChatFile;
use App\Models\ChatLabel;
use App\Models\ChatReply;
use App\Models\ChatTransfer;
use App\Models\Department;
use App\Models\HistoryChatAction;
use App\Models\Labels;
use App\Models\Topic;
use App\Models\User;
use App\Services\AgentOauthClientService;
use App\Traits\FormatResponserTrait;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use PDF;

class ChatService
{
    use FormatResponserTrait;

    private $chat_model_fields = [
        'uuid',
        'id',
        'id_users',
        'chat_id',
        'message',
        'first_response',
        'first_response_duration',
        'resolve_time',
        'case_duration',
        'noted',
        'rating',
        'no_whatsapp',
        'id_telegram',
        'status',
        'id_department',
        'id_channel',
        'id_topic',
        'unread_count',
        'created_at',
        'updated_at'
    ];

    private $chat_status_list = [
        'pending' => 0,
        'ongoing' => 1,
        'pendingtransfer' => 2,
        'resolved' => 9,
        'canceled_by_user' => 10,
        'canceled_by_system' => 11,
    ];

    public function __construct(
        Agent $agent_model,
        Channel $chat_channel_model,
        Chat $chat_model,
        ChatAgent $chat_agent_model,
        ChatChannelAccount $chat_channel_account_model,
        ChatFile $chat_file_model,
        ChatLabel $chat_label_model,
        ChatReply $chat_reply_model,
        ChatTransfer $chat_transfer_model,
        Department $department_model,
        HistoryChatAction $history_chat_action_model,
        Labels $label_model,
        Topic $topic_model,
        User $user_model
    ) {
        $this->agent_model = $agent_model;
        $this->chat_agent_model = $chat_agent_model;
        $this->chat_channel_account_model = $chat_channel_account_model;
        $this->chat_channel_model = $chat_channel_model;
        $this->chat_file_model = $chat_file_model;
        $this->chat_label_model = $chat_label_model;
        $this->chat_model = $chat_model;
        $this->chat_reply_model = $chat_reply_model;
        $this->chat_transfer_model = $chat_transfer_model;
        $this->department_model = $department_model;
        $this->history_chat_action_model = $history_chat_action_model;
        $this->label_model = $label_model;
        $this->topic_model = $topic_model;
        $this->user_model = $user_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new Channel(),
            new Chat(),
            new ChatAgent(),
            new ChatChannelAccount(),
            new ChatFile(),
            new ChatLabel(),
            new ChatReply(),
            new ChatTransfer(),
            new Department(),
            new HistoryChatAction(),
            new Labels(),
            new Topic(),
            new User()
        );
    }

    /**
     * Contains first chat from customer
     * and chat history from customer and agent
     *
     * data fetch by chat_id
     *
     * $type latest = only for retrieve response from reply from agent to user
     * $type latest_by_client = get latest chat without using Auth
     *
     * @param array $request
     * @param String $type = 'newchat|pending|pendingtransfer|ongoing|history|reset_unread|latest|latest_by_client'
     */
    public function historyByChatID($request, $type = null)
    {
        if (!Auth::check()) {
            $current_user = $request['company_data']; // get data for client
        } else {
            $current_user = Auth::user();
        }

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;
        $current_user_company_id = null;
        $allowed_agents = [1]; // admin

        /* comment current user by faiz */
        // if (empty($current_user)) {
        //     return $this->successResponse($current_user, __('messages.request.success'));
        // }

        // ONLY SPECIFIC COMPANY
        if ($type != 'newchat' && $type != 'latest_by_client') {
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company['uuid'] : null;
                $current_user_company_id = $current_user_company ? $current_user_company['id'] : null;
            } else {
                $current_user_company_uuid = $current_user['uuid']; // uuid for agent with roles company
                $current_user_company_id = $current_user['id'];
            }
        } else {
            $current_user_company_uuid = $current_user['uuid']; // uuid for agent with roles company
            $current_user_company_id = isset($current_user['id']) ? $current_user['id'] : $current_user_company_id;
        }
        array_push($allowed_agents, $current_user_company_id);

        // FILTER FOR ADMIN
        $admin = false;
        if ($current_user_roles == 1)
            $admin = true;

        /**
         * BASE QUERY BEGIN
         */
        $query_chats = $this->chat_model->select($this->chat_model_fields)
            ->with('user', function ($firstuser_query) {
                $firstuser_query->select(
                    'id',
                    'name',
                    'email',
                    'phone'
                );
            })
            ->with('chat_replies', function ($q) use ($current_user, $type) {
                $q->with('user', function ($user_query) {
                    $user_query->select(
                        'id',
                        'name',
                        'email',
                        'phone'
                    );
                });
                $q->with('agent', function ($agent_query) {
                    $agent_query->select(
                        'id',
                        'uuid',
                        'name',
                        'email'
                    );
                });
                if ($type == 'latest' || $type == 'latest_by_client') {
                    $q->orderBy('created_at', 'desc');
                }
            })
            ->with('chat_agent')
            ->with('department:id,name')
            ->with('channel:id,name')
            ->with('topic:id,name')
            ->where('chat_id', $request['chat_id']);
        if (!$admin && !empty($current_user_company_uuid)) {
            $query_chats = $query_chats->where('uuid', $current_user_company_uuid); // only get chat in specific company
        }
        # BASED ON TYPE
        if (!empty($tpe)) {
            if (in_array($type, array_keys($this->chat_status_list))) {
                $query_chats = $query_chats->where('status', $this->chat_status_list[$type]);
            }
        }

        if ($type != 'newchat') {
            // BASED ON AGENTS'S DEPARTMENT
            // if (!$admin && $current_user_roles != 2) {
            //     $query_chats = $query_chats
            //         ->where('id_department', $current_user->id_department)
            //         ->orWhereNull('id_department');
            // }
        }
        $query_chats = $query_chats->orderBy('created_at', 'desc');
        /** BASE QUERY END (only query, not returning collection) */

        # HANDLE CHAT REPLIES
        $check_replies = $query_chats->first();
        if (empty($check_replies)) // if data chat empty
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        # SET ALLOWED AGENTS THAT CAN SEE CHAT DETAIL
        $chatHandledByAgents = $check_replies->many_chat_agents->unique('id_agent');
        $chatHandledByAgentsId = $chatHandledByAgents->pluck('id_agent');
        if ($chatHandledByAgentsId->isNotEmpty())
            $allowed_agents = array_merge($allowed_agents, $chatHandledByAgentsId->toArray());

        $chatHandledByDepartments = [];
        $chatHandledByAgentsName = [];
        foreach ($chatHandledByAgents as $takenByAgent) {
            if (!empty($takenByAgent->agent->toArray())) {
                $takenByAgent->agent->id_department ? array_push($chatHandledByDepartments, $takenByAgent->agent->id_department) : $chatHandledByDepartments = $chatHandledByDepartments;

                $takenByAgent->agent->name ? array_push($chatHandledByAgentsName, limit_words($takenByAgent->agent->name, 2)) : $chatHandledByAgentsName = $chatHandledByAgentsName;
            }
        }
        if (in_array($current_user->id_department, $chatHandledByDepartments))
            array_push($allowed_agents, $current_user->id);

        /**
         * RESET UNREAD COUNT
         * executed everytime agent open chat detail
         */
        if ($type == 'reset_unread') {
            $update_unread = $this->countUnreadChatByID(['chat_id' => $request['chat_id']], 'reset_unread');
        }

        /**
         * BUBBLE CHAT CONDITION
         */
        # ONLY IF CHAT HAS REPLIED BY AGENT
        if ($check_replies['chat_replies']->isNotEmpty()) {
            if ($chatHandledByAgents->isNotEmpty() && in_array($current_user['id'], $allowed_agents)) {
                $data_chats = $query_chats
                    ->whereHas('chat_agent', function ($query) use ($type, $check_replies) {
                        if ($type != 'newchat' && $type != 'latest_by_client') {
                            // $query->where('id_agent', $current_user->id);
                            $query->where('id_agent', $check_replies->chat_agent->id_agent);
                        }
                    })
                    ->first();
            } else {
                $data_chats = $query_chats->first();
            }
        } else {
            # CHAT DOES NOT HAVE AGENT REPLY
            # or closed (resolved) by client before chat assignned to agent
            $status_option_ids = [0, 10, 11];
            $status_option_name = ['pending', 'canceled_by_user', 'canceled_by_system'];

            if ((!empty($type) && in_array($type, $status_option_name)) || in_array($check_replies->status, $status_option_ids)) {
                $data_chats = $query_chats->first();
            } else {

                if ($current_user->id_roles == 2 && empty($check_replies['chat_agent'])) {
                    $data_chats = $query_chats->first(); // show chat that does not have replies and resolved by client
                } else {
                    $data_chats = $query_chats;
                    if ($current_user->id_roles != 2) { // show chat in client area
                        $data_chats = $data_chats->whereHas('chat_agent', function ($subq) use ($check_replies) {
                            // $subq->where('id_agent', $current_user->id);
                            $subq->where('id_agent', $check_replies->chat_agent->id_agent);
                        });
                    }
                    $data_chats = $data_chats->first();
                }
            }
        }

        /** MAPPING DATA RESPONSE */
        $data = [];
        if ($data_chats) {
            // set keys for feeding result response
            if (!empty($data_chats['updated_at'])) {
                $date = $data_chats['updated_at'];
                $data_chats['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                $data_chats['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

                $diff_in_days = Carbon::now()->diffInDays($date);
                $data_chats['day_difference'] = $diff_in_days; // difference between current time and updated at
            }

            if (!empty($data_chats['department'])) {
                $data_chats['department_name'] = $data_chats['department']['name'];
            }
            unset($data_chats['department']);

            if (!empty($data_chats['channel'])) {
                $data_chats['channel_name'] = $data_chats['channel']['name'];
            }
            unset($data_chats['channel']);

            if (!empty($data_chats['topic'])) {
                $data_chats['topic_name'] = $data_chats['topic']['name'];
            }
            unset($data_chats['topic']);

            $data_chats['handled_by_agents'] = $chatHandledByAgentsName;

            // add user key to first response
            $data_chats['is_sender'] = false;
            $data_chats['file_name'] = null;
            $data_chats['file_type'] = null;
            $data_chats['file_path'] = null;
            $data_chats['file_url'] = null;
            if ($data_chats['id_users'] == $current_user['id'])
                $data_chats['is_sender'] = true;

            if (!empty($data_chats['user'])) {
                $data_chats['user_id'] = $data_chats['user']['id'];
                $data_chats['user_name'] = $data_chats['user']['name'];
                $data_chats['user_email'] = $data_chats['user']['email'];
                $data_chats['user_phone'] = $data_chats['user']['phone'];

                // set avatar
                $avatar_url = isset($data_chats['user']['avatar']) && !empty($data_chats['user']['avatar']) ? parseFileUrl($data_chats['user']['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($data_chats['user']['name'] . '-' . $data_chats['user']['id'], 'name');
                $data_chats['user_avatar'] = $avatar_url;
            }
            unset($data_chats['user']);

            // set replies key
            $replies = $data_chats->chat_replies;
            $replies = $replies->map(function ($item, $key) use ($data_chats, $current_user) {
                $item['unique_id'] = 'rply-' . $item['id'] . $item['chat_id']; // unique identifier for frontend, prevent duplicate id from chat reply

                if (!empty($item['updated_at'])) {
                    $date = $item['updated_at'];
                    $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                    $item['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
                }

                // additional keys
                $item['user_name'] = null;
                $item['user_email'] = null;
                $item['user_phone'] = null;
                $item['agent_uuid'] = null;
                $item['agent_name'] = null;
                $item['agent_email'] = null;
                $item['is_sender'] = false;

                if (!empty($item['user'])) {
                    $item['user_name'] = $item['user']['name'];
                    $item['user_email'] = $item['user']['email'];
                    $item['user_phone'] = $item['user']['phone'];

                    // set avatar
                    $avatar_url = isset($item['user']['avatar']) && !empty($item['user']['avatar']) ? parseFileUrl($item['user']['avatar']) : null;
                    $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['user']['name'] . '-' . $item['user']['id'], 'name');
                    $item['user_avatar'] = $avatar_url;

                    unset($item['user']);
                }

                $item['is_sender'] = false;
                if (!empty($item['agent'])) {
                    $item['agent_uuid'] = $item['agent']['uuid'];
                    $item['agent_name'] = $item['agent']['name'];
                    $item['agent_email'] = $item['agent']['email'];
                    if ($item['agent']['id'] == $current_user['id'])
                        $item['is_sender'] = true;
                }
                unset($item['agent']); // unset outside the condition because the key always present

                // file reply
                $item['file_name'] = null;
                $item['file_type'] = null;
                $item['file_path'] = null;
                $item['file_url'] = null;
                $chat_file = $item->file_reply;
                if (!empty($chat_file)) {
                    $item['file_name'] = $chat_file['name'] ?: null;
                    $item['file_type'] = $chat_file['type'] ?: null;
                    $item['file_path'] = $chat_file['path'] ?: null;
                    $item['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path'], null, $data_chats['id_channel']) : null;
                }
                unset($item['file_reply']);
                return $item;
            });
            $replies = $replies->toArray();

            unset($data_chats['chat_replies']);
            unset($data_chats['chat_agent']);

            // add key to first chat
            $first_chat[0] = $data_chats->toArray();
            $first_chat[0]['unique_id'] = 'frst-' . $data_chats['id'] . $data_chats['chat_id']; // unique identifier for frontend, prevent duplicate id from chat reply
            $first_chat[0]['agent_uuid'] = null;
            $first_chat[0]['agent_name'] = null;
            $first_chat[0]['agent_email'] = null;
            $first_chat[0]['id_agent'] = null; // id_agent on first chat is always null
            $first_chat[0]['is_sender'] = false;
            $first_chat[0]['company_name'] = !empty($data_chats->owned_by) ? (!empty($data_chats->owned_by->company_detail) ? $data_chats->owned_by->company_detail->company_name : null) : null;

            $data = array_merge($first_chat, $replies);
        }

        if ($data_chats) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * List Chat
     * Used in dashboard to show list of chats
     * can be filtered by $chat_model_fields
     *
     * @params String $type = 'pending|pendingtransfer|ongoing|history'
     */
    public function listChatForAgent($request, $type = 'pending')
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user->id_roles;
        $unread_list = 0;

        $more_chat_fields = ['uuid', 'id_department', 'id_channel', 'id_topic'];
        $this->chat_model_fields = array_merge($this->chat_model_fields, $more_chat_fields);

        // start query
        $data_chats = $this->chat_model->select($this->chat_model_fields);
        $data_chats = $data_chats->with('chat_replies', function ($cr) { // used for show last message in list
            $cr->orderBy('id', 'desc');
        })
            ->with('chat_rating')
            ->with('chat_transfer');

        // FIILTER SECTTON

        // FILTER FOR ADMIN
        $admin = false;
        if ($current_user_roles == 1)
            $admin = true;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        // CHAT STATUS
        if (in_array($type, array_keys($this->chat_status_list))) {
            $data_chats = $data_chats->where('status', $this->chat_status_list[$type]); // get all pending chat

            if (!$admin && $current_user->id_roles != 2) {
                // CONDITION ONLY APPLY FOR AGENT AND STAFF
                // SHOW CHAT WITH STATUSES BELOW AND BASED ON COMPANY
                $status_option = [0, 10, 11];
                if (in_array($this->chat_status_list[$type], $status_option)) {
                    $data_chats = $data_chats
                        ->where('id_department', $current_user->id_department)
                        ->orWhereNull('id_department');
                }
            }

            if (!$admin) {
                $data_chats = $data_chats->where('uuid', $current_user_company_uuid); // only get chat in specific company
            }

            if ($this->chat_status_list[$type] == 9) {
                if (!$admin && $current_user->id_roles != 2) {
                    $agentsInDepartment = $this->agent_model->where('id_department', $current_user->id_department)
                        ->where('id_roles', 4)->pluck('id');

                    $data_chats = $data_chats->whereHas('chat_agent', function ($cr) use ($current_user, $admin, $agentsInDepartment) {
                        $cr->where('id_agent', $current_user->id); // get chat by assigned agent
                        if ($current_user->id_roles == 3 && $agentsInDepartment->isNotEmpty())
                            $cr->orWhereIn('id_agent', $agentsInDepartment); // show chat that assigned to agent role
                    });
                }
            }
            if ($this->chat_status_list[$type] == 1) {
                $data_chats = $data_chats->with('chat_agent', function ($cr) use ($current_user, $admin) { // show chat ongoing by logged in agent
                    if (!$admin && $current_user->id_roles != 2) { // condition only for agent and staff
                        $cr->with('agent_chat_transfer', function ($ctf) use ($current_user, $admin) { // show chat ongoing with relation with chat_transfers table
                        });
                    }
                });
            }
        }

        // CHAT FIELDS
        foreach ($request as $req_field_key => $req_field_val) {
            if (in_array($req_field_key, $this->chat_model_fields)) {
                $data_chats = $data_chats->where($req_field_key, $req_field_val);
            }

            // FILTER BY CREATED DATE/CHAT DATE
            if (isset($request['start_date']) && !empty($request['start_date'])) {
                $startDate = isset($request['start_date']) && !empty($request['start_date']) ?
                    Carbon::createFromFormat('d-m-Y', $request['start_date']) :
                    Carbon::today();
                $startDate = $startDate->startOfDay()->format('Y-m-d H:i:s');
                $endDate = isset($request['end_date']) && !empty($request['end_date']) ?
                    Carbon::createFromFormat('d-m-Y', $request['end_date']) :
                    Carbon::createFromFormat('d-m-Y', $request['start_date']);
                $endDate = $endDate->endOfDay()->format('Y-m-d H:i:s');

                $data_chats = $data_chats->where('created_at', '>=', $startDate);
                $data_chats = $data_chats->where('created_at', '<=', $endDate);
            }
        }

        // relationship
        // user
        $data_chats = $data_chats->whereHas('user', function ($user_q) use ($request) {
            $user_q->select(
                'id',
                'name',
                'email',
                'phone'
            );
            if (array_key_exists('user_name', $request))
                $user_q->where('name', $request['user_name']);
            if (array_key_exists('user_email', $request))
                $user_q->where('email', $request['user_email']);
            if (array_key_exists('user_phone', $request))
                $user_q->where('phone', $request['user_phone']);
        });

        // department
        // $data_chats = $data_chats->whereHas('department', function($dpt) use ($request) { // this line changed because id_department allows null value
        $data_chats = $data_chats->with('department', function ($dpt) use ($request) {
            $dpt->select('id', 'name');
            if (array_key_exists('department_name', $request))
                $dpt->where('name', $request['department_name']);
        });

        // channel
        $data_chats = $data_chats->whereHas('channel', function ($dpt) use ($request) {
            $dpt->select('id', 'name');
            if (array_key_exists('channel_name', $request))
                $dpt->where('name', $request['channel_name']);
        });

        // topic
        // $data_chats = $data_chats->whereHas('topic', function($tpc) use ($request) { // this line changed because id_topic allows null value
        $data_chats = $data_chats->with('topic', function ($tpc) use ($request) {
            $tpc->select('id', 'name');
            if (array_key_exists('topic_name', $request))
                $tpc->where('name', $request['topic_name']);
        });

        // chat agent
        $data_chats = $data_chats->with('many_chat_agents');
        if (array_key_exists('id_agent', $request) && !empty($request['id_agent'])) {
            $data_chats = $data_chats->whereHas('many_chat_agents', function ($tpc) use ($request) {
                $tpc->where('id_agent', $request['id_agent']);
            });
        }

        // closing query statement
        $data_chats = $data_chats->orderBy('updated_at', 'desc');
        $data_chats = $data_chats->get();

        // set keys for feeding result response
        $data_chats = $data_chats
            ->filter(function ($item, $key) use ($current_user, $type, $current_user_company_uuid) {
                if ($item['uuid'] == $current_user_company_uuid) { // list based on company
                    switch (true) {
                        case ($this->chat_status_list[$type] == 1 && $item['status'] == 1):
                            if ($item['chat_agent']) {
                                if ($item['chat_agent']['id_agent'] == $current_user->id) { // only show chat that assign to specific agent
                                    return $item;
                                }
                            }
                            break;

                        case ($this->chat_status_list[$type] == 0 && $item['status'] == 0): // pending
                            return $item;
                            break;

                        case ($this->chat_status_list[$type] == 2 && $item['status'] == 2): // pending transfer
                            if ($current_user->uuid == $item->chat_transfer->to_agent) // transfer to agent
                                return $item;

                            if ($current_user->id_department == $item->chat_transfer->id_department && empty($item->chat_transfer->to_agent)) // transfer to department
                                return $item;
                            break;

                        case ($this->chat_status_list[$type] == 9 && $item['status'] == 9): // filter resolved chat
                            return $item;

                        case ($this->chat_status_list[$type] == 10 && $item['status'] == 10):
                            if ($current_user->id_roles != 4) {
                                return $item;
                            }

                        case ($this->chat_status_list[$type] == 11 && $item['status'] == 11):
                            if ($current_user->id_roles != 4) {
                                return $item;
                            }
                    }
                }
            })
            ->map(function ($item, $key) use ($data_chats, $current_user) {
                if (!empty($item['user'])) {
                    $item['user_name'] = $item['user']['name'];
                    $item['user_email'] = $item['user']['email'];
                    $item['user_phone'] = $item['user']['phone'];

                    // set avatar
                    $avatar_url = isset($item['user']['avatar']) && !empty($item['user']['avatar']) ? parseFileUrl($item['user']['avatar']) : null;
                    $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['user']['name'] . '-' . $item['user']['id'], 'name');
                    $item['user_avatar'] = $avatar_url;

                    $item['is_whmcs_user'] = !empty($item['user']['id_whmcs']) ? true : false;
                    unset($item['user']);
                }

                if (!empty($item['department'])) {
                    $item['department_name'] = $item['department']['name'];
                }
                unset($item['department']);

                if (!empty($item['channel'])) {
                    $item['channel_name'] = $item['channel']['name'];
                }
                unset($item['channel']);

                if (!empty($item['topic'])) {
                    $item['topic_name'] = $item['topic']['name'];
                }
                unset($item['topic']);

                if (!empty($item['updated_at'])) {
                    $date = $item['updated_at'];
                    $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                    $item['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
                }

                // Update message
                // used for show last message in list
                $item['first_message'] = $item['message'];
                $item['message'] = $item['message'] ?: null; // show first message in list if there is no chat reply
                $item['id_agent'] = null;
                $item['agent_uuid'] = null;
                $item['agent_name'] = null;
                $item['agent_email'] = null;
                $item['is_sender'] = false;
                $item['file_name'] = null;
                $item['file_type'] = null;
                $item['file_path'] = null;
                $item['file_url'] = null;
                if (isset($item['chat_replies'])) {
                    if (count($item['chat_replies']) > 0) {
                        $latest_reply = $item['chat_replies']->first();
                        $item['message'] = $latest_reply['message']; // assign last chat reply to list
                        $item['id_agent'] = $latest_reply['id_agent'];
                        if (isset($item['chat_replies']['id_agent']) && $item['chat_replies']['id_agent'] == $current_user['id'])
                            $item['is_sender'] = true;

                        // chat reply agent
                        if (!empty($latest_reply->agent)) {
                            $item['agent_uuid'] = $latest_reply['agent']['uuid'];
                            $item['agent_name'] = $latest_reply['agent']['name'];
                            $item['agent_email'] = $latest_reply['agent']['email'];
                        }

                        // file reply
                        $chat_file = $latest_reply->file_reply;
                        if (!empty($chat_file)) {

                            $item['file_name'] = $chat_file['name'] ?: null;
                            $item['file_type'] = $chat_file['type'] ?: null;
                            $item['file_path'] = $chat_file['path'] ?: null;
                            $item['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path'], null, $item['id_channel']) : null;
                        }
                    }
                }
                unset($item['chat_replies']);

                // chat labels
                $item['chat_labels'] = $item->chat_labels;
                if ($item['chat_labels']->isNotEmpty()) {
                    $chat_labels = $item['chat_labels']->map(function ($item, $key) {
                        $item['label_name'] = !empty($item->label_detail) ? $item->label_detail->name : null;
                        $item['label_color'] = !empty($item->label_detail) ? $item->label_detail->color : null;
                        $item['label_description'] = !empty($item->label_detail) ? $item->label_detail->description : null;
                        unset($item['label_detail']);

                        return $item;
                    });
                }

                // chat rating
                if (!empty($item->chat_rating)) {
                    $item['rating'] = $item->chat_rating->rating ?: null;
                }

                // chat is handled by which agents
                $chatHandledByAgents = $item->many_chat_agents->unique('id_agent');
                $chatHandledByAgentsName = [];
                foreach ($chatHandledByAgents as $takenByAgent) {
                    if (!empty($takenByAgent->agent->toArray())) {
                        $takenByAgent->agent->name ? array_push($chatHandledByAgentsName, limit_words($takenByAgent->agent->name, 2)) : $chatHandledByAgentsName = $chatHandledByAgentsName;
                    }
                }
                $item['handled_by_agents'] = $chatHandledByAgentsName;

                unset(
                    $item['chat_rating'],
                    $item['chat_agent'],
                    $item['many_chat_agents']
                );

                return $item;
            });
        $arr_data_chats = $data_chats->toArray();

        $unread_list = $data_chats->filter(function ($item, $key) {
            if ($item['unread_count'] != null && $item['unread_count'] != 0) {
                return $item;
            }
        });

        $data['chat_count'] =  !empty($data_chats) ? $data_chats->count() : 0;
        $data['unread_chat'] = $unread_list->count();
        $data['unread_bubble_chat'] = !empty($data_chats) ? $data_chats->where('unread_count', '<>', 0)->sum('unread_count') : 0;
        $data['list'] = array_values($arr_data_chats);
        if ($data_chats) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function listChatForClient($request, $type = 'history')
    {
        $client_id = $request['id_users'];
        $more_chat_fields = ['id_department', 'id_channel', 'id_topic', 'created_at'];
        $this->chat_model_fields = array_merge($this->chat_model_fields, $more_chat_fields);

        // start query
        $data_chats = $this->chat_model->select($this->chat_model_fields)->where('id_users', $client_id);
        $data_chats = $data_chats->orWhereHas('chat_replies', function ($cr) use ($client_id) { // show chat history by client/customer
            $cr->where('id_users', $client_id);
        })
            ->with('chat_rating');

        // FIILTER SECTTON

        // CHAT STATUS
        // for chat history (resolved chat)
        // $data_chats = $data_chats->where('status', 9);

        // CHAT FIELDS
        foreach ($request as $req_field_key => $req_field_val) {
            if (in_array($req_field_key, $this->chat_model_fields)) {
                $data_chats = $data_chats->where($req_field_key, $req_field_val);
            }
        }

        // relationship
        // user
        $data_chats = $data_chats->whereHas('user', function ($user_q) use ($request) {
            $user_q->select(
                'id',
                'name',
                'email',
                'phone'
            );
            if (array_key_exists('user_name', $request))
                $user_q->where('name', $request['user_name']);
            if (array_key_exists('user_email', $request))
                $user_q->where('email', $request['user_email']);
            if (array_key_exists('user_phone', $request))
                $user_q->where('phone', $request['user_phone']);
        });

        // department
        $data_chats = $data_chats->with('department', function ($dpt) use ($request) { // can get with null department
            $dpt->select('id', 'name');
            if (array_key_exists('department_name', $request))
                $dpt->where('name', $request['department_name']);
        });

        // channel
        $data_chats = $data_chats->whereHas('channel', function ($dpt) use ($request) {
            $dpt->select('id', 'name');
            if (array_key_exists('channel_name', $request))
                $dpt->where('name', $request['channel_name']);
        });

        // topic
        $data_chats = $data_chats->with('topic', function ($tpc) use ($request) { // can get with null topic
            $tpc->select('id', 'name');
            if (array_key_exists('topic_name', $request))
                $tpc->where('name', $request['topic_name']);
        });

        // closing query statement
        $data_chats = $data_chats->orderBy('created_at', 'desc');
        $data_chats = $data_chats->get();

        // set keys for feeding result response
        $data_chats = $data_chats->map(function ($item, $key) use ($client_id) {
            if (!empty($item['user'])) {
                $item['user_name'] = $item['user']['name'];
                $item['user_email'] = $item['user']['email'];
                $item['user_phone'] = $item['user']['phone'];

                // set avatar
                $avatar_url = isset($item['user']['avatar']) && !empty($item['user']['avatar']) ? parseFileUrl($item['user']['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['user']['name'] . '-' . $item['user']['id'], 'name');
                $item['user_avatar'] = $avatar_url;

                $item['is_whmcs_user'] = !empty($item['user']['id_whmcs']) ? true : false;
                unset($item['user']);
            }

            if (!empty($item['department'])) {
                $item['department_name'] = $item['department']['name'];
            }
            unset($item['department']);

            if (!empty($item['channel'])) {
                $item['channel_name'] = $item['channel']['name'];
            }
            unset($item['channel']);

            if (!empty($item['topic'])) {
                $item['topic_name'] = $item['topic']['name'];
            }
            unset($item['topic']);

            if (!empty($item['updated_at'])) {
                $date = $item['updated_at'];
                $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                $item['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
            }

            // Update message
            // used for show last message in list
            $item['message'] = $item['message'] ?: null; // show first message in list if there is no chat reply
            $item['id_agent'] = null;
            $item['agent_uuid'] = null;
            $item['agent_name'] = null;
            $item['agent_email'] = null;
            $item['is_sender'] = false;
            $item['file_name'] = null;
            $item['file_type'] = null;
            $item['file_path'] = null;
            $item['file_url'] = null;
            if (isset($item['chat_replies'])) {
                if (count($item['chat_replies']) > 0) {
                    $latest_reply = $item['chat_replies']->first();
                    $item['message'] = $latest_reply['message']; // assign last chat reply to list
                    $item['id_agent'] = $latest_reply['id_agent'];
                    // will check later
                    // if (isset($item['chat_replies']['id_agent']) && $item['chat_replies']['id_agent'] == $client_id) // $current_user['id']
                    //     $item['is_sender'] = true;

                    // chat reply agent
                    if (!empty($latest_reply->agent)) {
                        $item['agent_uuid'] = $latest_reply['agent']['uuid'];
                        $item['agent_name'] = $latest_reply['agent']['name'];
                        $item['agent_email'] = $latest_reply['agent']['email'];
                    }

                    // file reply
                    $chat_file = $latest_reply->file_reply;
                    if (!empty($chat_file)) {

                        $item['file_name'] = $chat_file['name'] ?: null;
                        $item['file_type'] = $chat_file['type'] ?: null;
                        $item['file_path'] = $chat_file['path'] ?: null;
                        $item['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path'], null, $item['id_channel']) : null;
                    }
                }
            }
            unset($item['chat_replies']);

            // chat rating
            if (!empty($item->chat_rating)) {
                $item['rating'] = $item->chat_rating->rating ?: null;
            }

            return $item;
        });
        $data = $data_chats;

        if ($data_chats) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Initiate new chat
     * from client/user to agent
     *
     * Store first chat to chat table
     */
    public function storeFirstChat($request)
    {
        $chart_id = strtoupper($this->generateChartID());

        // create new chat
        $chat = $this->chat_model;
        $id_users = $request['id_users'];
        $chat->id_users = $id_users;
        $chat->id_department = $request['id_department'];
        $chat->id_channel = $request['id_channel'];
        $chat->id_topic = $request['id_topic'];
        $chat->chat_id = $chart_id;
        $chat->message = $request['message'];
        $chat->browser = array_key_exists('browser', $request) ? $request['browser'] : null;
        $chat->device = array_key_exists('device', $request) ? $request['device'] : null;
        $chat->ip = array_key_exists('ip', $request) ? $request['ip'] : null;
        $chat->no_whatsapp = array_key_exists('no_whatsapp', $request) ? $request['no_whatsapp'] : null;
        $chat->id_telegram = array_key_exists('id_telegram', $request) ? $request['id_telegram'] : null;
        $chat->uuid = $request['company_data']['uuid'];
        $chat->save();

        $data = [
            'file_name' => null,
            'file_type' => null,
            'file_path' => null,
            'file_url' => null,
        ];
        if ($chat) {

            $request['chat_id'] = $chart_id;
            $data_chat = $this->historyByChatID($request, 'newchat');
            $data = $data_chat['data'][0];
            $data['email'] = $request['email'];

            // update history chat action
            $store_history = $this->storeChatHistory($chart_id, 'newchat', $id_users);

            // update file chat reply
            if (isset($request['file_id']) && !empty($request['file_id'])) {
                // create new chatreply
                $reply = $this->chat_reply_model;
                $reply->chat_id = $chart_id;
                $reply->id_users = $request['id_users'];
                $reply->id_agent = null; // set id agent to null
                $reply->message = null;
                $reply->save();

                $dataToUpdate = $reply;
                $dataToUpdate['file_id'] = $request['file_id'];
                $update = $this->updateUploadedFileInChat($reply);

                if (isset($update['data']) && !empty($update['data'])) {
                    $data['file_name'] = $update['data']['file_name'];
                    $data['file_type'] = $update['data']['file_type'];
                    $data['file_path'] = $update['data']['file_path'];
                    $data['file_url'] = $update['data']['file_url'];
                }
            }

            $result = $this->successResponseWithLog($data, __('messages.request.success'), null, 'new_chat');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function sendChatWithSocmed($request, $socmed_type = null)
    {
        switch ($socmed_type) {
            case 'telegram':
                $request['id_telegram'] = $request['senderId'];
                $request['id_department'] = null;
                $request['id_channel'] = 3;
                $request['id_topic'] = null;
                $request['email'] = null;

                // check if chat exists
                $ongoing_chat = $this->chat_model->where('id_telegram', $request['senderId'])->where('status', 1)->orWhere('status', 2)->where('id_channel', $request['id_channel'])->first();
                $pending_chat = $this->chat_model->where('id_telegram', $request['senderId'])->where('status', 0)->where('id_channel', $request['id_channel'])->first();
                break;

            case 'whatsapp':
                $request['no_whatsapp'] = $request['senderPhoneNumber'];
                $request['id_department'] = null;
                $request['id_channel'] = 2;
                $request['id_topic'] = null;
                $request['email'] = null;

                // check if chat exists
                $ongoing_chat = $this->chat_model->where('no_whatsapp', $request['senderPhoneNumber'])->where('status', 1)->orWhere('status', 2)->where('id_channel', $request['id_channel'])->first(); // on going or pending transfer
                $pending_chat = $this->chat_model->where('no_whatsapp', $request['senderPhoneNumber'])->where('status', 0)->where('id_channel', $request['id_channel'])->first();
                break;
        }

        if ($ongoing_chat) {
            // reply to on going chat
            // or pending transfer (because chat has been assigned)
            $store = $this->chat_reply_model;
            $store->chat_id = $ongoing_chat->chat_id;
            $store->id_users = $ongoing_chat->id_users;
            $store->id_agent = null; // set id agent to null
            $store->message = $request['message'];
            $store->save();

            if ($store) {
                $request['chat_id'] = $store->chat_id;
                $data_chat = $this->historyByChatID($request, 'latest_by_client');
                $data = isset($data_chat['data'][1]) ? array_merge($data_chat['data'][0], $data_chat['data'][1]) : $data_chat['data'][0]; // get index 1 because 0 always contain first chat
                $data['email'] = $request['email'];

                $data['id_agent'] = null;
                $chatAgentRelation = $this->chat_model->where('chat_id', $request['chat_id'])->first()->chat_agent;
                if (!empty($chatAgentRelation))
                    $data['id_agent'] = $chatAgentRelation['id_agent'];

                $update = $this->updateByField($request['chat_id'], ['updated_at' => now()]);

                // update file chat reply
                if (isset($request['file_id']) && !empty($request['file_id'])) {
                    $dataToUpdate = $store;
                    $dataToUpdate['file_id'] = $request['file_id'];
                    $update = $this->updateUploadedFileInChat($dataToUpdate);

                    if (isset($update['data']) && !empty($update['data'])) {
                        $data['file_name'] = $update['data']['file_name'];
                        $data['file_type'] = $update['data']['file_type'];
                        $data['file_path'] = $update['data']['file_path'];
                        $data['file_url'] = $update['data']['file_url'];
                    }
                }

                return $this->successResponseWithLog($data, __('messages.request.success'), null, 'send_chat');
            } else {
                return $this->errorResponseWithLog(null, 'Telegram Chat Reply: ' . __('messages.request.error'));
            }
        } elseif ($pending_chat) {
            // reply to existing pending chat
            $store = $this->chat_reply_model;
            $store->chat_id = $pending_chat->chat_id;
            $store->id_users = $pending_chat->id_users;
            $store->id_agent = null; // set id agent to null
            $store->message = $request['message'];
            $store->save();

            if ($store) {
                $request['chat_id'] = $store->chat_id;
                $data_chat = $this->historyByChatID($request, 'latest_by_client');
                $data = isset($data_chat['data'][1]) ? array_merge($data_chat['data'][0], $data_chat['data'][1]) : $data_chat['data'][0]; // get index 1 because 0 always contain first chat
                $data['email'] = $request['email'];

                // update file chat reply
                if (isset($request['file_id']) && !empty($request['file_id'])) {
                    $dataToUpdate = $store;
                    $dataToUpdate['file_id'] = $request['file_id'];
                    $update = $this->updateUploadedFileInChat($dataToUpdate);

                    if (isset($update['data']) && !empty($update['data'])) {
                        $data['file_name'] = $update['data']['file_name'];
                        $data['file_type'] = $update['data']['file_type'];
                        $data['file_path'] = $update['data']['file_path'];
                        $data['file_url'] = $update['data']['file_url'];
                    }
                }

                return $this->successResponseWithLog($data, __('messages.request.success'), null, 'send_chat');
            } else {
                return $this->errorResponseWithLog(null, 'Telegram Chat Reply: ' . __('messages.request.error'));
            }
        } else {
            // create first chat
            $store = $this->storeFirstChat($request);
            return $store;
        }
    }

    /**
     * Generate chat ID
     *
     * Used when client/user start to chat
     */
    public function generateChartID()
    {
        $string = Str::random(10);
        $chart_id = 'Q' . $string;

        return $chart_id;
    }

    /**
     * Insert history chat action
     * of client/user/agent
     *
     */
    public function storeChatHistory($chart_id, $type = null, $users_id = null, $agent_id = null, $assigned_agent_id = null)
    {
        $agent_id = ($agent_id == "system") ? null : $agent_id;

        $user_data = $this->user_model->find($users_id);
        $users_name = !empty($user_data) ? $user_data->name : null;

        $agent_data = $this->agent_model->find($agent_id);
        $agent_name = !empty($agent_data) ? $agent_data->name : null;

        $assigned_agent_name = null;
        if (!empty($assigned_agent_id)) {
            $assigned_agent_data = $this->agent_model->find($assigned_agent_id);
            $assigned_agent_name = !empty($assigned_agent_data) ? $assigned_agent_data->name : null;
        }

        switch ($type) {
            case 'newchat': // case opened
                $description = __('chat.user_action.newchat', ['name' => $users_name]);
                break;

            case 'assign_agent':
                $description = __('chat.user_action.assign_agent', ['name' => $agent_name]);
                break;

            case 'pending':
                $description = __('chat.user_action.pending', ['name' => $agent_name]);
                break;

            case 'pending_transfer':
                $description = __('chat.user_action.pending_transfer', ['name' => $agent_name]);
                break;

            case 'resolved':
                if (!empty($agent_name)) {
                    $description = __('chat.user_action.resolved_by_agent', ['name' => $agent_name]);
                } else {
                    $description = __('chat.user_action.resolved_by_user', ['name' => $users_name]);
                }
                break;

            case 'canceled_by_user':
                $description = __('chat.user_action.canceled_by_user', ['name' => $users_name]); // similar as resolved by user
                break;

            case 'welcome_message_sent':
                $description = __('chat.user_action.welcome_message_sent', ['name' => $agent_name]);
                break;

            case 'away_message_sent':
                $description = __('chat.user_action.away_message_sent', ['name' => $agent_name]);
                break;

            case 'closing_message_sent':
                $description = __('chat.user_action.closing_message_sent', ['name' => $agent_name]);
                break;

            case 'first_response_sent':
                $description = __('chat.user_action.first_response_sent', ['name' => $agent_name]);
                break;

            case 'transfer_to_agent':
                $description = __('chat.user_action.transfer_to_agent', ['from' => $agent_name, 'to' => $assigned_agent_name]);
                break;

            case 'canceled_by_system':
                $description = __('chat.user_action.canceled_by_system');
                break;

            default:
                $description = __('chat.user_action.unknown');
                break;
        }

        // insert into table
        $history = $this->history_chat_action_model->create([
            'chat_id' => $chart_id,
            'id_user' => !empty($users_id) ? $users_id : null,
            'id_agent' => !empty($agent_id) ? $agent_id : null,
            'action_name' => $description
        ]);

        Log::info($description);
        Log::info($history);

        if ($history) {
            return true;
        }
        return false;
    }

    /**
     * Update chat status
     *
     * @param Array $request
     * @param string $type = transfer_to_agent
     */
    public function updateChatStatus($request, $type = null)
    {
        $agent_id = null;

        if (!Auth::check()) {
            $current_user = $request['company_data']; // get data for client
        } else {
            $current_user = Auth::user();
            $agent_id = $current_user['id'];
        }

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company['uuid'] : null;
            $current_user_company_id = $current_user_company ? $current_user_company['id'] : null;
        } else {
            $current_user_company_uuid = $current_user['uuid']; // uuid for agent with roles company
            $current_user_company_id = $current_user['id'];
        }

        if ($current_user->id_roles == 2 && $request['status'] != 9)
            return $this->errorResponse(null, __('messages.update.error') . " " . __('chat.not_permitted'));

        $chat = $this->chat_model->where('chat_id', $request['chat_id'])->latest()->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        $update = false;
        if (!empty($chat)) {
            $handled_by_agent = $chat->chat_agent;
            if ($request['status'] == 9 && empty($handled_by_agent))
                $request['status'] = 10; // canceled by user/client

            $update = $chat;
            $update->status = $request['status'];
            $update->update();
        }

        // Handle update status on transfer chat
        $assigned_agent_id = null;
        if ($type == 'transfer_to_agent')
            $assigned_agent_id = $request['to_agent_id'];
        if ($update) {
            // update history chat action
            switch ($request['status']) {
                case '1':
                    if ($type == 'transfer_to_agent') {
                        $update_chat_agent = $this->chat_agent_model->create(['id_chat' => $chat->id, 'id_agent' => $assigned_agent_id]);
                        $store_history = $this->storeChatHistory($request['chat_id'], 'transfer_to_agent', $chat->id_users, $agent_id, $assigned_agent_id);
                    } else {
                        $update_chat_agent = $this->chat_agent_model->create(['id_chat' => $chat->id, 'id_agent' => $agent_id]); // update chat_agent table
                        $store_history = $this->storeChatHistory($request['chat_id'], 'assign_agent', $chat->id_users, $agent_id); // update history
                    }
                    break;

                case '0':
                    $store_history = $this->storeChatHistory($request['chat_id'], 'pending', $chat->id_users, $agent_id);
                    break;

                case '2':
                    if ($type == 'transfer_to_agent') {
                        $update_chat_agent = $this->chat_agent_model->create(['id_chat' => $chat->id, 'id_agent' => $assigned_agent_id]);
                        $store_history = $this->storeChatHistory($request['chat_id'], 'transfer_to_agent', $chat->id_users, $agent_id, $assigned_agent_id);
                    } else {
                        $store_history = $this->storeChatHistory($request['chat_id'], 'pending_transfer', $chat->id_users, $agent_id);
                    }
                    break;

                case '9':
                    $store_history = $this->storeChatHistory($request['chat_id'], 'resolved', $chat->id_users, $agent_id);
                    break;

                case '10':
                    $store_history = $this->storeChatHistory($request['chat_id'], 'canceled_by_user', $chat->id_users, $agent_id);
                    break;

                default:
                    $store_history = $this->storeChatHistory($request['chat_id'], null, $chat->id_users, $agent_id);
                    break;
            }

            // get bubble chat
            if ($agent_id) {
                $chat_and_bubble = $this->historyByChatID($chat);
            } else {
                // get user data and complete chat data
                $chat['company_data'] = $request['company_data'];
                $chat_and_bubble = $this->historyByChatID($chat, 'latest_by_client');

                $chat_and_bubble['data'] = [
                    'id' => $chat_and_bubble['data'][0]['id'],
                    'chat_id' => $chat_and_bubble['data'][0]['chat_id'],
                    'status' => $chat_and_bubble['data'][0]['status'],
                    'status_name' => $chat_and_bubble['data'][0]['status_name'],
                    'id_users' => $chat_and_bubble['data'][0]['id_users'],
                    'user_name' => $chat_and_bubble['data'][0]['user_name'],
                    'user_email' => $chat_and_bubble['data'][0]['user_email'],
                    'user_phone' => $chat_and_bubble['data'][0]['user_phone'],
                    'last_update_time' => $chat_and_bubble['data'][0]['formatted_date'],
                ];

                // check if chat has assigned to agent
                if (!empty($chat->chat_agent)) {
                    $chat_and_bubble['data']['id_agent'] = $chat->chat_agent->id_agent;
                } else {
                    $chat_and_bubble['data']['id_agent'] = null;
                }
            }

            $result = $this->successResponse($chat_and_bubble['data'], __('messages.update.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function updateByField($chat_id, $request)
    {
        $current_user = null;
        $agent_id = null;

        if (Auth::check()) {
            $current_user = Auth::user();
            $agent_id = $current_user->id;
        }

        $chat = $this->chat_model->where('chat_id', $chat_id)->latest()->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        $update = false;
        if (!empty($chat) && !empty($request)) {
            $update = $chat;

            foreach ($request as $field => $field_value) {
                if (in_array($field, array_keys($this->chat_model_fields))) {
                    $update->$field = $field_value;
                }
            }
            $update->update();
        }

        if ($update) {
            $result = $this->successResponse($chat, __('messages.update.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Transfer chat/handover case
     * from agent
     * to department/agent
     *
     * @param $request
     */
    public function transferChatByAgent($request)
    {
        $current_user = null;
        $assigned_agent_id = null;
        $assigned_agent_roles = null;
        $assigned_agent_uuid = null;
        $assigned_department_id = null;
        $assigned_chat_status = 0;

        if (Auth::check()) {
            $current_user = Auth::user();
        }

        if ($request['to_agent']) { // transfer chat to agent
            $assigned_agent_data = $this->agent_model->where('uuid', $request['to_agent'])->first();
            if (!empty($assigned_agent_data)) {
                $assigned_agent_id = $assigned_agent_data ? $assigned_agent_data->id : null;
                $assigned_agent_uuid = $assigned_agent_data ? $assigned_agent_data->uuid : null;
                $assigned_agent_roles = $assigned_agent_data ? $assigned_agent_data->id_roles : null;
                $assigned_department_id = $assigned_agent_data ? $assigned_agent_data->id_department : null;
                $assigned_chat_status = 2; // change status to pending transfer

                $update_status = $this->updateChatStatus([
                    'chat_id' => $request['chat_id'],
                    'status' => $assigned_chat_status,
                    'to_agent_id' => $assigned_agent_id
                ], 'transfer_to_agent');
                Log::info('Update chat status. Action triggered from transfer chat feature');
            } else {
                $message = 'Error Agent Data: ' . __('messages.request.error') . " " . __('messages.data_not_found');
                Log::error($message);
                return $this->errorResponse(null, $message);
            }
        }

        if ($request['id_department']) { // transfer chat to department
            $assigned_department_data = $this->department_model->where('id', $request['id_department'])->first();
            if (!empty($assigned_department_data)) {
                $assigned_agent_uuid = null;
                $assigned_department_id = $assigned_department_data ? $assigned_department_data->id : null;
                $assigned_chat_status = 2; // change status to pending transfer

                $update_status = $this->updateChatStatus(['chat_id' => $request['chat_id'], 'status' => $assigned_chat_status]);
                Log::info('Update chat status. Action triggered from transfer chat feature');
            } else {

                $message = 'Error Department Data: ' . __('messages.request.error') . " " . __('messages.data_not_found');
                Log::error($message);
                return $this->errorResponse(null, $message);
            }
        }

        $chat = $this->chat_model->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $data_request = [
            'id_chat' => $chat->id,
            'from_agent' => $current_user->id,
            'id_department' => $assigned_department_id,
            'to_agent' => $assigned_agent_uuid
        ];

        if ($assigned_agent_roles != 2) {
            $update_dept = $chat;
            $update_dept->id_department = $assigned_department_id;
            $update_dept->save();
            Log::info('Update chat department. Action triggered from transfer chat feature');
        } else {
            Log::info('Chat department does not updated. Chat transfered to company. Action triggered from transfer chat feature');
        }

        $store = $this->chat_transfer_model->create($data_request);

        if ($store) {
            $return_data['chat_id'] = $chat->chat_id;

            $department_name = !empty($store->department) ? $store->department->name : null;
            $return_data['department_name'] = $department_name;

            $to_agent_name = !empty($store->assigned_agent) ? $store->assigned_agent->name : null;
            $to_agent_id = !empty($store->assigned_agent) ? $store->assigned_agent->id : null;
            $return_data['to_agent_name'] = $to_agent_name;
            $return_data['to_agent_id'] = $to_agent_id;

            $from_agent_name = !empty($store->agent) ? $store->agent->name : null;
            $return_data['from_agent_name'] = $from_agent_name;

            $department_member = !empty($store->department) ?  $store->department->agentsOnDepartment : [];
            $return_data['department_member'] = !empty($department_member) ? $department_member->pluck('id') : [];

            unset(
                $store['department'],
                $store['assigned_agent'],
                $store['agent']
            );

            $return_data = array_merge($return_data, $store->toArray());
            $result = $this->successResponse($return_data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }


    /**
     * Add label/remove label to chat
     * Attach/detach label from chat
     *
     * @param $request
     * @param $type = attach|detach
     */
    public function updateLabelToChat($request, $type = null)
    {
        $current_user = null;
        $assigned_labels = null;

        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        // check if label exists
        $labels = $this->label_model->whereIn('id', $request['id_labels'])->where('id_agent', $current_user->id)->orWhere('id_agent', $current_user_company_id)->pluck('id');
        if ($labels->isEmpty())
            return $this->errorResponse(null, 'Label error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // match the labels
        $false_labels = array_diff($request['id_labels'], $labels->toArray());
        $res_labels = array_diff($request['id_labels'], $false_labels);

        if (empty($res_labels))
            return $this->errorResponse(null, 'Label error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $assigned_labels = $res_labels;

        // check if chat exists
        $chat = $this->chat_model->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, 'Chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // check if chat has details
        $chat_detail = $this->historyByChatID(['chat_id' => $chat->chat_id]);
        if ($chat_detail['code'] == 400)
            return $this->errorResponse($chat_detail['data'], $chat_detail['message']);

        // request for attach labels
        if ($type == 'attach')
            $update = $chat->labelsInChat()->sync($assigned_labels);

        // request for detach/remove labels
        if ($type == 'detach')
            $update = $chat->labelsInChat()->detach($assigned_labels);

        $updated_chat = $this->chat_model->with('chat_labels')->where('chat_id', $request['chat_id'])->first();
        $chat_labels = $updated_chat['chat_labels'];
        if ($chat_labels->isNotEmpty()) {
            $chat_labels = $chat_labels->map(function ($item, $key) {
                $item['label_name'] = !empty($item->label_detail) ? $item->label_detail->name : null;
                $item['label_color'] = !empty($item->label_detail) ? $item->label_detail->color : null;
                $item['label_description'] = !empty($item->label_detail) ? $item->label_detail->description : null;
                unset($item['label_detail']);

                return $item;
            });
        }
        $return_data = $updated_chat;

        if ($chat_labels) {
            $result = $this->successResponse($return_data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Show chat labels by chat_id
     */
    public function getLabelByChatId($request)
    {
        // check if chat exists
        $chat = $this->chat_model->with('chat_labels')->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $chat_detail = $this->historyByChatID(['chat_id' => $chat->chat_id]);
        if ($chat_detail['code'] == 400)
            return $this->errorResponse($chat_detail['data'], $chat_detail['message']);

        $chat_labels = $chat['chat_labels'];
        if ($chat_labels->isNotEmpty()) {
            $chat_labels = $chat_labels->map(function ($item, $key) {
                $item['label_name'] = !empty($item->label_detail) ? $item->label_detail->name : null;
                $item['label_color'] = !empty($item->label_detail) ? $item->label_detail->color : null;
                $item['label_description'] = !empty($item->label_detail) ? $item->label_detail->description : null;
                unset($item['label_detail']);

                return $item;
            });
        }
        $return_data = $chat;

        if ($return_data) {
            $result = $this->successResponse($return_data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Add unread_count value to chat by chat_id
     * or
     * Reset unread_count
     *
     * @param Array $request = ['chat_id' => ''] | null
     * @param String $type = null|reset_unread
     */
    public function countUnreadChatByID($request, $type = null)
    {
        // check if chat exists
        $chat = $this->chat_model->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $current_unread_value = $chat->unread_count;
        $input_unread = $current_unread_value + 1;

        if ($type == 'reset_unread') {
            $input_unread = 0;
        }

        $update = $chat;
        $update->unread_count = $input_unread;
        $update->timestamps = false;
        $update->save();

        $chat_detail = $this->historyByChatID(['chat_id' => $request['chat_id']], 'newchat');
        // $return_data = $chat_detail['data'][0];

        if ($update) {
            // $result = $this->successResponse($return_data, __('messages.request.success'));
            $result = $this->successResponse(null, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function getCompanyByChatId($request)
    {
        // check if chat exists
        $chat = $this->chat_model->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, 'Chat: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $company_uuid = $chat->uuid;
        $company = $this->agent_model
            ->whereHas('chat_channel_agent', function ($q) use ($chat) {
                $q->where('channel_id', $chat->id_channel);
            })
            ->with('chat_channel_agent')
            // ->with('chat_channel_agent.chat_channel_account')
            ->where('uuid', $company_uuid)->first();

        if (empty($company))
            return $this->errorResponse(null, 'Company: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // check chat_channel_account table
        $acc = $this->chat_channel_account_model->where('id_agent', $company->id)->where('chat_channel_id', $chat->id_channel)->first();
        if (empty($acc))
            return $this->errorResponse(null, 'Channel Account: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $data = [
            'id_agent' => $acc->id_agent,
            'api_id' => $acc->api_id,
            'api_hash' => $acc->api_hash,
            'account_session' => $acc->account_session,
            'senderTelegramId' => $chat->id_telegram,
            'senderWaNumber' => $chat->no_whatsapp
        ];

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function historyChatActionByChatID($request)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;
        $current_user_company_id = null;
        $allowed_agents = [1]; // admin

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company['id'] : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = isset($current_user['id']) ? $current_user['id'] : $current_user_company_id;
        }
        array_push($allowed_agents, $current_user_company_id);

        $query = $this->chat_model->where('chat_id', $request['chat_id']);
        if ($current_user_roles != 1)
            $query = $query->where('uuid', $current_user_company_uuid);
        $query = $query
            ->with('chat_agent')
            ->with('history_chat_actions', function ($q) {
                $q->orderBy('created_at', 'desc');
            });
        $data = $query->orderBy('created_at', 'desc')->first();

        if (empty($data) || $data['history_chat_actions']->isEmpty())
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        # SET ALLOWED AGENTS THAT CAN SEE DETAIL
        $chatHandledByAgents = $data->many_chat_agents->unique('id_agent');
        $chatHandledByAgentsId = $chatHandledByAgents->pluck('id_agent');
        if ($chatHandledByAgentsId->isNotEmpty())
            $allowed_agents = array_merge($allowed_agents, $chatHandledByAgentsId->toArray());

        $chatHandledByDepartments = [];
        foreach ($chatHandledByAgents as $takenByAgent) {
            if (!empty($takenByAgent->agent->toArray())) {
                $takenByAgent->agent->id_department ? array_push($chatHandledByDepartments, $takenByAgent->agent->id_department) : $chatHandledByDepartments = $chatHandledByDepartments;
            }
        }
        if (in_array($current_user->id_department, $chatHandledByDepartments))
            array_push($allowed_agents, $current_user->id);

        $status_option = [0, 10, 11];
        if ($current_user->id_roles == 3 && $current_user->id_department == $data->id_department &&  in_array($data->status, $status_option))
            array_push($allowed_agents, $current_user->id);

        if (!in_array($current_user['id'], $allowed_agents))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('chat.not_permitted'));


        /** MAPPING DATA RESPONSE */
        $actions = $data['history_chat_actions'];
        $actions->map(function ($item, $key) {
            $date = $item['created_at'];
            $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
        });

        if ($actions) {
            $result = $this->successResponse($actions, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function chatInformation($request)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;
        $current_user_company_id = null;
        $allowed_agents = [1]; // admin

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company['id'] : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = isset($current_user['id']) ? $current_user['id'] : $current_user_company_id;
        }
        array_push($allowed_agents, $current_user_company_id);

        // start query
        $query = $this->chat_model->where('uuid', $current_user_company_uuid)->where('chat_id', $request['chat_id'])
            ->with('chat_agent')
            // relationship
            ->whereHas('user')->with('user:id,name,email,phone') // user
            ->with('department:id,name') // department
            ->whereHas('channel')->with('channel:id,name') // channel
            ->with('topic:id,name') // topic
            ->with('chat_rating')
            ->with('chat_labels');
        // end of query
        $data = $query->orderBy('created_at', 'desc')->first();

        if (empty($data))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        # SET ALLOWED AGENTS THAT CAN SEE DETAIL
        $chatHandledByAgents = $data->many_chat_agents->unique('id_agent');
        $chatHandledByAgentsId = $chatHandledByAgents->pluck('id_agent');
        if ($chatHandledByAgentsId->isNotEmpty())
            $allowed_agents = array_merge($allowed_agents, $chatHandledByAgentsId->toArray());

        $chatHandledByDepartments = [];
        foreach ($chatHandledByAgents as $takenByAgent) {
            if (!empty($takenByAgent->agent->toArray())) {
                $takenByAgent->agent->id_department ? array_push($chatHandledByDepartments, $takenByAgent->agent->id_department) : $chatHandledByDepartments = $chatHandledByDepartments;
            }
        }
        if (in_array($current_user->id_department, $chatHandledByDepartments))
            array_push($allowed_agents, $current_user->id);

        if (!in_array($current_user['id'], $allowed_agents))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('chat.not_permitted'));


        /** MAPPING DATA RESPONSE */
        unset($data['chat_agent']);
        if (!empty($data['user'])) {
            $data['user_name'] = $data['user']['name'];
            $data['user_email'] = $data['user']['email'];
            $data['user_phone'] = $data['user']['phone'];

            // set avatar
            $avatar_url = isset($data['user']['avatar']) && !empty($data['user']['avatar']) ? parseFileUrl($data['user']['avatar']) : null;
            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($data['user']['name'] . '-' . $data['user']['id'], 'name');
            $data['user_avatar'] = $avatar_url;

            unset($data['user']);
        }

        if (!empty($data['department']))
            $data['department_name'] = $data['department']['name'];
        unset($data['department']);

        if (!empty($data['channel']))
            $data['channel_name'] = $data['channel']['name'];
        unset($data['channel']);

        if (!empty($data['topic']))
            $data['topic_name'] = $data['topic']['name'];
        unset($data['topic']);

        if (!empty($data['created_at'])) {
            $date = $data['created_at'];
            $data['case_created_time'] = dateTimeFormat($date->toDateTimeString());
        }
        unset($data['created_at'], $data['updated_at']);

        if (!empty($data['first_response'])) {
            $data['first_response_time'] = dateTimeFormat($data['first_response']);
            unset($data['first_response']);
        }

        if (!empty($data['resolve_time'])) {
            $data['resolve_time'] = dateTimeFormat($data['resolve_time']);
        }

        if (!empty($data['first_response_duration'])) {
            $date = $data['first_response_duration'];
            $date = Carbon::now()->subSeconds($date)->diffForHumans([
                'parts' => 3,
                'join' => ' ',
                'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE
            ]);
            $data['first_response_wait_duration'] = $date;
            unset($data['first_response_duration']);
        }

        if (!empty($data['case_duration'])) {
            $date = $data['case_duration'];
            $date = Carbon::now()->subSeconds($date)->diffForHumans([
                'parts' => 3,
                'join' => ' ',
                'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE
            ]);
            $data['case_duration'] = $date;
        }

        if (!empty($data->chat_rating))
            $data['rating'] = $data->chat_rating->rating ?: null;
        unset($data['chat_rating']);

        $data['chat_labels'] = $data->chat_labels;
        if ($data['chat_labels']->isNotEmpty()) {
            $chat_labels = $data['chat_labels']->map(function ($data, $key) {
                $data['label_name'] = !empty($data->label_detail) ? $data->label_detail->name : null;
                $data['label_color'] = !empty($data->label_detail) ? $data->label_detail->color : null;
                $data['label_description'] = !empty($data->label_detail) ? $data->label_detail->description : null;
                unset($data['label_detail']);

                return $data;
            });
        }

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function getFileInChat($id)
    {
        $detail = $this->chat_file_model->with('chat_reply.chat')->where('id', $id)->first();
        $data_result = [];
        if ($detail) {
            $data_result['file_name'] = $detail['name'] ?: null;
            $data_result['file_type'] = $detail['type'] ?: null;
            $data_result['file_path'] = $detail['path'] ?: null;
            $data_result['file_url'] = null;

            if (!empty($detail['chat_reply']) && isset($detail['chat_reply']['chat'])) {
                $data_result['file_url'] = $detail['path'] ? parseFileUrl($detail['path'], null, $detail->chat_reply->chat->id_channel) : null;
            }

            $result = $this->successResponse($data_result, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error'));
        }
        return $result;
    }

    /**
     * @param $type = null|socmed
     */
    public function uploadFileInChat($request, $type = null)
    {
        $file = isset($request['file']) ? $request['file'] : null;
        $file_type = 'other';
        $input_data['path'] = null;
        $input_data['name'] = null;

        if ($file) {
            if($file->getClientOriginalExtension() == 'svg' || $this->isSvgFile($file->getPathname())){
                return $this->errorResponse(null, 'Invalid SVG file.');
            }
        }

        switch ($type) {
            case 'socmed':
                /**
                 * only store data to database
                 * incoming file from socmed is stored in socket server
                 */
                $file_type = $request['type'];
                $input_data['path'] = $request['path'];
                $input_data['name'] = isset($request['name']) ? $request['name'] : null;
                break;

            case 'from-dashboard-to-socmed':
                /**
                 * used for upload file to socmed
                 * file stored in socket server
                 */
                if (isset($request['files'])) {
                    // try {

                    // $client = new Client();
                    // $post_url = env('SOCKET_QCHAT_URL', "http://localhost:4000")."/upload-file";

                    // $image_path = $request['files']->getPathname();
                    // $image_mime = $request['files']->getmimeType();
                    // $image_org  = $request['files']->getClientOriginalName();

                    // $store_file = $client->request('POST',
                    // $post_url, [
                    //     'multipart' => [
                    //         [
                    //             'name'     => 'files',
                    //             'filename' => $image_org,
                    //             'Mime-Type'=> $image_mime,
                    //             // 'contents' => fopen( $image_path, 'r' ),
                    //             'contents' => \GuzzleHttp\Psr7\stream_for(file_get_contents($image_path))
                    //         ],
                    //     ],
                    //     ['timeout' => 60]
                    // ]);
                    // if(!empty($store_file) && $store_file->getStatusCode() != 200)
                    //     return $this->errorResponse(null, 'error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

                    // $store_res = $store_file->getBody()->getContents();
                    // $arr_store_res = json_decode($store_res, true);
                    // // return $this->successResponse($store_res);

                    // $file_type = $arr_store_res['data']['type'];
                    // $input_data['path'] = $arr_store_res['data']['path'];
                    // $input_data['name'] = $arr_store_res['data']['name'];
                    // } catch(\GuzzleHttp\Exception\GuzzleException $e) {
                    //     return $e;
                    // }

                    # Method 2 (Handle Large Files)
                    $image_path = $request['files']->getPathname();
                    $image_mime = $request['files']->getmimeType();
                    $image_org  = $request['files']->getClientOriginalName();
                    //The URL that accepts the file upload.
                    $url = env('SOCKET_QCHAT_URL', "http://localhost:4000") . "/upload-file";

                    //The name of the field for the uploaded file.
                    $uploadFieldName = 'files';

                    // save to local storage
                    $save_to_path = 'assets/images/uploads/agent-client-chat/';
                    $store_file = uploadFile($request['files'], 'public/' . $save_to_path, true);

                    //The full path to the file that you want to upload
                    $filePath = 'storage/' . $save_to_path . $store_file['name'];

                    //Initiate cURL
                    $ch = curl_init();

                    //Set the URL
                    curl_setopt($ch, CURLOPT_URL, $url);

                    //Set the HTTP request to POST
                    curl_setopt($ch, CURLOPT_POST, true);

                    //Tell cURL to return the output as a string.
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

                    //If the function curl_file_create exists
                    if (function_exists('curl_file_create')) {
                        //Use the recommended way, creating a CURLFile object.
                        $filePath = curl_file_create($filePath, $image_mime, $image_org);
                    } else {
                        //Otherwise, do it the old way.
                        //Get the canonicalized pathname of our file and prepend
                        //the @ character.
                        $filePath = '@' . realpath($filePath);
                        //Turn off SAFE UPLOAD so that it accepts files
                        //starting with an @
                        curl_setopt($ch, CURLOPT_SAFE_UPLOAD, false);
                    }

                    $tempFile = tempnam(sys_get_temp_dir(), 'File_');
                    file_put_contents($tempFile, fopen($image_path, 'r'));
                    //Setup our POST fields
                    $postFields = array(
                        $uploadFieldName => $filePath,
                        // 'blahblah' => 'Another POST FIELD'
                    );

                    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);

                    //Execute the request
                    $result = curl_exec($ch);

                    //If an error occured, throw an exception
                    //with the error message.
                    if (curl_errno($ch)) {
                        throw new Exception(curl_error($ch));
                    }
                    //Print out the response from the page
                    $result = json_decode($result, true);

                    $file_type = $result['data']['type'];
                    $input_data['path'] = $result['data']['path'];
                    $input_data['name'] = $result['data']['name'];
                }
                break;

            default:
                if (isset($file) && !empty($file)) {
                    $uploadedFileExt = $file->extension();
                    $uploadedFileMime = $file->getClientMimeType();
                    $arr_uploaded_mime = explode('/', $uploadedFileMime);
                    $file_type = null;

                    # set file type
                    # this function is similar as chatfilerule
                    $defined_extensions = config('validation_rules.allowed_file');
                    $allowed_extensions = [];
                    $requestedType = array_keys($defined_extensions);
                    $uploadedMime = null;
                    $this->uploadedExtension = $uploadedFileExt;
                    foreach ($defined_extensions as $keyEx => $valEx) {
                        foreach ($requestedType as $reqType) {
                            if ($keyEx == $reqType) { // validate based on requested file type
                                foreach ($valEx as $subVal) {
                                    $allowed_extensions[] = $subVal;
                                    if ($this->uploadedExtension == $subVal) {
                                        $uploadedMime = $keyEx;
                                    }
                                }
                            }
                        }
                    }

                    $store_file = uploadFile($file, 'public/assets/images/uploads/agent-client-chat', true); // upload file
                    $input_data['path'] = $store_file['path']; // update data
                    $input_data['name'] = $store_file['name']; // update data
                    $file_type = $uploadedMime;
                }
                break;
        }

        $input_data['type'] = $file_type;
        $store = $this->chat_file_model->create($input_data);
        if ($store) {
            $store['url'] = parseFileUrl($store['path'], null, $type);
            $result = $this->successResponse($store, __('messages.save.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.save.error'));
        }
        return $result;
    }

    private function isSvgFile($filePath)
    {
        $fileContent = file_get_contents($filePath, false, null, 0, 1000);
        return preg_match('/<svg\s/', $fileContent) === 1;
    }

    /**
     * Get all list uploaded files
     *
     * used in chatvolution version 2
     */
    public function showAllUploadedFiles($request)
    {
        $company_data = [];
        // Get Company Data by Secret Key
        if (isset($request['api_key']) && !empty($request['api_key'])) {
            $agent_oauth_client_service = AgentOauthClientService::getInstance();
            $company_data = $agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            // $request['company_data'] = $company_data;
        }

        // Get Company Data by UUID
        if (Auth::check() && Auth::user())
            $company_data['id'] = Auth::user()->id;

        if (empty($company_data))
            throw new \Exception(__('messages.data_not_found'), 404);

        $list_query = $this->chat_file_model;
        if (isset($request['file_ids']) && !empty($request['file_ids'])) {
            $list_query = $list_query->whereIn('id', $request['file_ids']);
        } else {
            $list_query = $list_query->limit(50);
        }
        $list = $list_query->orderBy('id', 'desc')->get();

        $list = $list->map(function ($item, $key) {
            $item['url'] = $item['path'] ? parseFileUrl($item['path'], null, null) : null;
            return $item;
        });

        if ($list) {
            $result = $this->successResponse($list, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error'));
        }
        return $result;
    }



    public function updateUploadedFileInChat($request)
    {
        // update file chat reply
        if (isset($request['file_id']) && !empty($request['file_id'])) {
            $fileReply = $this->chat_file_model->where('id', $request['file_id'])->whereNull('chat_reply_id')->first();
            if ($fileReply) {
                $upadteFileInReply = $fileReply->update([
                    'chat_reply_id' => $request['id'],
                    'chat_id' => $request['chat_id']
                ]);

                if (!$upadteFileInReply)
                    Log::error(['Error in Reply Internal Chat' => ['code' => 400, 'message' => 'File not found in database'], 'chat_reply_id' => $request['id'], 'chat_id' => $request['chat_id']]);
            }
        }

        $reply = $this->chat_reply_model->with('chat')->where('id', $request['id'])->first();
        $chat_file = $reply->file_reply;
        if (!empty($chat_file)) {
            $reply['file_name'] = $chat_file['name'] ?: null;
            $reply['file_type'] = $chat_file['type'] ?: null;
            $reply['file_path'] = $chat_file['path'] ?: null;
            $reply['file_url'] = null;
            if (!empty($reply['chat']))
                $reply['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path'], null, $reply->chat->id_channel) : null;
        }
        unset($reply['file_reply'], $reply['chat']);

        if ($reply) {
            $reply['url'] = $reply['file_url'];
            $result = $this->successResponse($reply, __('messages.save.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.save.error'));
        }
        return $result;
    }

    /**
     * For cron job and handle on going chat
     */
    public function autoUpdateChatStatus()
    {
        $time_limit = 1; // 1 day
        $status_number = null;
        $status_name = null;
        $caused_by = null;

        $companys = $this->chat_model->where('status', 1)
            ->orWhere('status', 0)
            ->orderBy('updated_at', 'asc')->pluck('uuid')->unique();

        $list_company_hour = $this->agent_model
            ->whereIn('uuid', $companys)
            ->where('id_roles', 2)
            ->with('company_detail.settings', function ($q) {
                $q->where('meta', 'chat_expired_time');
            })
            ->get();

        $list_chat = $this->chat_model->where('status', 1)->orWhere('status', 0)->orderBy('updated_at', 'asc')->get();

        $debug = [];
        $update = false;
        $update_action_history = false;
        if ($list_chat->isNotEmpty()) {
            $update_action_history = false;
            foreach ($list_chat as $key => $value) {
                $date = $value->updated_at;
                $diff_in_days = Carbon::now()->diffInDays($date);

                $company_data = $list_company_hour->where('uuid', $value['uuid'])->first();
                if ($company_data) {
                    $company_settings = $company_data->company_detail ? $company_data->company_detail->settings : null;
                    $company_limit_chat_time = !empty($company_settings) && isset($company_settings[0]['value']) ? $company_settings[0]['value'] : null;
                    $time_limit = $company_limit_chat_time ? $company_limit_chat_time : $time_limit;
                }

                $status_number = null;
                if ($diff_in_days >= (int) $time_limit) {
                    if ($value['status'] == 1) {
                        $status_number = 9;
                        $status_name = 'resolved';
                        $caused_by = ($value->chat_agent ? $value->chat_agent->id_agent : null);
                    } elseif ($value['status'] == 0) {
                        $status_number = 11;
                        $status_name = 'canceled_by_system';
                        $caused_by = 'system';
                    }

                    if ($status_number) {
                        $update = $this->updateByField($value['chat_id'], ['status' => $status_number]);

                        $debug[$value['chat_id']]['update_res'] = $update;
                        $debug[$value['chat_id']]['updated_chat_id'] = $value['chat_id'];

                        $update_action_history = $this->storeChatHistory($value['chat_id'], $status_name, $value['id_users'], $caused_by);

                        $debug[$value['chat_id']]['action_res'] = $update_action_history;
                        $debug[$value['chat_id']]['updated_action_chat_id'] = $value['chat_id'];
                    }
                }
            }
        }
        Log::info(['Update chat status automatically: ', $debug]);

        $chat_list = $this->chat_model->where('status', 1)->orderBy('updated_at', 'asc')->get();
        $subset['chat_count'] =  !empty($chat_list) ? $chat_list->count() : 0;
        $subset['list'] = $chat_list->map(function ($chat) {
            $date = $chat['updated_at'];
            $chat['formatted_date'] = dateTimeFormat($date->toDateTimeString());

            return $chat->only(['chat_id', 'status', 'updated_at', 'formatted_date']);
        });

        $result = $this->successResponse($subset, __('messages.update.success'));
        return $result;
    }

    public function sendChatHistory($request, $type = null)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }
        $chat_id = null;

        if (!$type) {
            // Used in v1
            $chat_id = $request['chat_id'];
            $all_chat_bubbles = $this->historyByChatID(['chat_id' => $request['chat_id']], 'history');
            if ($all_chat_bubbles['data'] == null)
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

            $email_receiver = isset($request['email']) && !empty($request['email']) ? $request['email'] : $all_chat_bubbles['data'][0]['user_email'];
            if (!$email_receiver)
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.email_is_empty'));

            $receiver_data = [
                'name' => $all_chat_bubbles['data'][0]['user_name'],
                'email' => $email_receiver,
                'chat_id' => $request['chat_id'],
                'company_name' => isset($all_chat_bubbles['data'][0]['company_name']) && !empty($all_chat_bubbles['data'][0]['company_name']) ? $all_chat_bubbles['data'][0]['company_name'] : env('APP_NAME'),
            ];

            $pdf = PDF::loadView('email.attachment.chat-history-pdf', $all_chat_bubbles);
        } elseif ($type == 'from-v2') {
            $chat_id = null;
            // Source data is from v2
            $all_chat_bubbles = [];
            if (!$request['content'])
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

            if (!$request['content']['chat_reply'])
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

            $chat_id = $request['content']['chat_id'];
            $all_chat_bubbles = $request['content']['chat_reply'];

            // Get Email Receiver
            $email_in_chat_info = $request['content']['user_email'];
            $email_receiver = isset($request['receiver_email']) && !empty($request['receiver_email']) ? $request['receiver_email'] : $email_in_chat_info;
            if (!$email_receiver)
                return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.email_is_empty'));

            // Get Company Name
            $company_info = $this->agent_model->with('company_detail')->where('uuid', $request['content']['company_uuid'])->first();
            $company_name = !empty($company_info) && !empty($company_info->company_detail) ? $company_info->company_detail->company_name : null;

            $receiver_data = [
                'chat_id' => $request['content']['chat_id'],
                'company_name' => $company_name ? $company_name : env('APP_NAME'),
                'email' => $email_receiver,
                'name' => $request['content']['user_name'],
            ];

            // Get Handled By Agent
            $handled_by_agents_data = [];
            if (!empty($request['handled_by_agent_ids'])) {
                $get_agents = $this->agent_model->select('id', 'name')->whereIn('id', $request['handled_by_agent_ids'])->get();
                if ($get_agents->isNotEmpty()) {
                    $handled_by_agents_data = $get_agents->map(function ($item, $key) {
                        return $item['name'];
                    });
                    $handled_by_agents_data = $handled_by_agents_data->toArray();
                }
            }

            // Get Department
            $department_name = null;
            if (!empty($request['content']['department_id'])) {
                $get_dept = $this->department_model->select('id', 'name')->where('id', $request['content']['department_id'])->first();
                if (!empty($get_dept))
                    $department_name = $get_dept['name'];
            }

            // Get Topic
            $topic_name = null;
            if (!empty($request['content']['topic_id'])) {
                $get_topic = $this->topic_model->select('id', 'name')->where('id', $request['content']['topic_id'])->first();
                if (!empty($get_topic))
                    $topic_name = $get_topic['name'];
            }

            $pdf = PDF::loadView('email.attachment.chat-history-pdf-v2', [
                'data' => $request['content'],
                'department_name' => $department_name,
                'handled_by_agents_data' => $handled_by_agents_data,
                'topic_name' => $topic_name,
            ]);
        } else {
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        \Mail::send('email.chat-history', $receiver_data, function ($message) use ($pdf, $request, $email_receiver, $chat_id) {
            $message->to($email_receiver)
                ->subject(__('email.subject.chat_history', ['chat_id' => $chat_id]))
                ->attachData($pdf->output(), 'Chat History ' . $chat_id . ".pdf");
        });

        if ($all_chat_bubbles) {
            $result = $this->successResponse(['chat_id' => $chat_id, 'email' => $email_receiver], __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

}
