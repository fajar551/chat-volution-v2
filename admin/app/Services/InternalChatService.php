<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AnonymousAgent;
use App\Models\ChatGroup;
use App\Models\ChatGroupInternalChat;
use App\Models\InternalChat;
use App\Models\InternalChatAgent;
use App\Models\InternalChatFile;
use App\Models\InternalChatJoinedHistory;
use App\Models\InternalChatNotification;
use App\Models\InternalChatReply;
use App\Notifications\SendPushNotification;
use App\Services\ChatService;
use App\Services\PollService;
use App\Services\SettingService;
use App\Traits\FormatResponserTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class InternalChatService
{
    use FormatResponserTrait;

    private $internal_chat_type = [
        'private' => 1,
        'group' => 2
    ];

    public function __construct(
        Agent $agent_model,
        AnonymousAgent $anonymous_agent_model,
        ChatGroup $chat_group_model,
        ChatGroupInternalChat $chat_group_internal_chat_model,
        InternalChat $internal_chat_model,
        InternalChatFile $internal_chat_file_model,
        InternalChatReply $internal_chat_reply_model,
        InternalChatAgent $internal_chat_agent_model,
        InternalChatJoinedHistory $internal_chat_joined_history_model,
        InternalChatNotification $internal_chat_notification_model
    ) {
        $this->chat_group_model = $chat_group_model;
        $this->chat_group_internal_chat_model = $chat_group_internal_chat_model;
        $this->agent_model = $agent_model;
        $this->anonymous_agent_model = $anonymous_agent_model;
        $this->internal_chat_model = $internal_chat_model;
        $this->internal_chat_file_model = $internal_chat_file_model;
        $this->internal_chat_reply_model = $internal_chat_reply_model;
        $this->internal_chat_agent_model = $internal_chat_agent_model;
        $this->internal_chat_joined_history_model = $internal_chat_joined_history_model;
        $this->internal_chat_notification_model = $internal_chat_notification_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new AnonymousAgent(),
            new ChatGroup(),
            new ChatGroupInternalChat(),
            new InternalChat(),
            new InternalChatFile(),
            new InternalChatReply(),
            new InternalChatAgent(),
            new InternalChatJoinedHistory(),
            new InternalChatNotification()
        );
    }

    /**
     * @param String $type = private|group
     */
    public function storeFirstChat($request, $type = null)
    {
        $current_user = null;
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
                $current_user_company_id = $current_user->id;
            }
        } else {
            // handle seeder
            $current_user_company_id = isset($request['company_id']) && !empty($request['company_id']) ? $request['company_id'] : null;
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        // check agent
        $agent_receiver = $this->agent_model->where('id', $request['receiver'])->first();
        if (!empty($agent_receiver)) {
            if ($agent_receiver->id_roles == 2) {
                if ($agent_receiver->id != $current_user_company_id)
                    return $this->errorResponse(null, 'Agent error when initiate chat: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            } else {
                if ($agent_receiver->id_company != $current_user_company_id)
                    return $this->errorResponse(null, 'Agent error when initiate chat: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            }
        } else {
            return $this->errorResponse(null, 'Agent error when initiate chat: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        $chat = $this->internal_chat_model
            ->with('private_chat_participants')
            ->whereHas('private_chat_participants', function ($q) use ($current_user, $request) {
                $q->where('id_agent', $request['receiver']);
            })
            ->where('chat_type', 1) // dynamic
            ->get();

        $arr_check_agents = [$current_user['id'], $request['receiver']];

        $chat = $chat->filter(function ($item, $key) use ($arr_check_agents) {
            if (!empty($item['private_chat_participants'])) {
                $participant_ids = [];
                foreach ($item['private_chat_participants'] as $key => $participant) {
                    $participant_ids[] = $participant['id_agent'];
                }

                $diff = array_diff($arr_check_agents, $participant_ids);
                $item['diff_id'] = $diff;
                $item['diff_id_is_empty'] = empty($diff);

                if (empty($diff)) { // means all requested agent_ids is using the same chat room
                    return $item;
                } else {
                    // do nothing
                }
            }
        });

        if ($chat->isNotEmpty()) {
            $existing_chat_room = $chat->first();
        } else {
            $existing_chat_room = null;
        }

        if ($existing_chat_room) {
            $store = $existing_chat_room;
        } else {
            // create chat room
            $chat_service = ChatService::getInstance();
            $chart_id = strtoupper($chat_service->generateChartID());
            $store = $this->internal_chat_model->create([
                'uuid' => $current_user_company_uuid,
                'chat_id' => $chart_id,
                'chat_type' => $this->internal_chat_type[$type],
                'status' => 1
            ]);
        }

        $chat_with_replies = null;
        if ($store) {
            // insert agents to chat
            $store_chat_agent = $store->agentsInChat()->syncWithoutDetaching([
                $current_user['id'] => ['chat_id' => $store->chat_id],
                $request['receiver'] => ['chat_id' => $store->chat_id]
            ]);

            // insert message to internal_chat_reply
            // $store_reply = $this->internal_chat_reply_model->create([
            //     'id_chat' => $store->id,
            //     'chat_id' => $store->chat_id,
            //     'from_agent_id' => $current_user->id,
            //     'message' => $request['message']
            // ]);
            // $update = $this->updateByField($store->chat_id, [ 'updated_at' => now() ]);

            // only for private chat
            $update_deleted_conv = $store->agentsInDeletedConv()->syncWithoutDetaching([
                $current_user['id'] => ['chat_id' => $store->chat_id, 'conversation_deleted' => false]
            ]);

            $chat_with_replies = $this->showBubbleChatByChatId(['chat_id' => $store->chat_id], $type = 'only-latest-chat');
            if ($chat_with_replies['data'] != null) {
                $msg = $chat_with_replies['data']['internal_chat_replies']['data'];
                if ( isset($msg['data']) && !empty($msg['data']) ) {
                    $chat_with_replies['data']['message'] = $msg[0]['message'];
                    // $item['from_agent_name'] = $msg[0]['agent_name'];
                    // $item['from_agent_email'] = $msg[0]['agent_email'];
                    $chat_with_replies['data']['is_sender'] = $msg[0]['is_sender'];
                    $chat_with_replies['data']['file_name'] = $msg[0]['file_name'];
                    $chat_with_replies['data']['file_type'] = $msg[0]['file_type'];
                    $chat_with_replies['data']['file_path'] = $msg[0]['file_path'];
                    $chat_with_replies['data']['file_url'] = $msg[0]['file_url'];
                }
                $chat_with_replies = $chat_with_replies['data'];
            } else {
                $chat_with_replies = $store;
            }
        }

        if ($chat_with_replies) {
            $result = $this->successResponse($chat_with_replies, __('messages.save.success'));
        } else {
            // $result = $this->errorResponse(null, __('messages.save.error') );
            $result = $this->successResponse($chat_with_replies, __('messages.save.error'));
        }
        return $result;
    }

    public function storeFirstChatToGroup($request, $type = null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
        }

        // check group
        $group = $this->chat_group_model
            ->with('internal_chat_relation.internal_chat.private_chat_participants')
            ->with('group_participants')
            ->whereHas('group_participants', function ($query) use ($current_user) {
                $query->where('agent_id', $current_user->id);
            })
            ->where('uuid', $current_user_company_uuid)
            ->where('id', $request['group_id'])
            ->first();

        $arr_check_agents = [$current_user->id];

        if (!empty($group->internal_chat_relation)) {
            if (!empty($group->internal_chat_relation->internal_chat)) {;
                $parts = $group->internal_chat_relation->internal_chat->private_chat_participants;
                if (!empty($parts)) {
                    $participant_ids = [];
                    foreach ($parts as $key => $participant) {
                        $participant_ids[] = $participant['id_agent'];
                    }

                    $diff = array_diff($arr_check_agents, $participant_ids);
                    $check['diff_id'] = $diff;
                    $check['diff_id_is_empty'] = empty($diff);

                    if (empty($diff)) { // means all requested agent_ids is using the same chat room
                        // do nothing
                    } else {
                        $group_participants = $group->agentsInGroup;
                        $group = null;
                    }
                }
            }
        }

        $internal_chat_room = null;
        $existing_chat_room = null;
        if (!empty($group['internal_chat_relation'])) {
            if (!empty($group['internal_chat_relation']['internal_chat'])) {
                $internal_chat_room = $group->internal_chat_relation->internal_chat;
                $existing_chat_room = $internal_chat_room;
            }
        }

        if ($existing_chat_room) {
            $store = $existing_chat_room;
        } else {
            return $this->errorResponseWithLog(null, 'Chat Group error when initiate chat: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        $chat_with_replies = null;
        if ($store) {
            // insert message to internal_chat_reply
            $store_reply = $this->internal_chat_reply_model->create([
                'id_chat' => $store->id,
                'chat_id' => $store->chat_id,
                'from_agent_id' => $current_user->id,
                'message' => $request['message']
            ]);

            $update = $this->updateByField($store->chat_id, ['updated_at' => now()]);

            $chat_with_replies = $this->showBubbleChatByChatId(['chat_id' => $store->chat_id], $type = 'only-latest-chat');
            if ($chat_with_replies['data'] != null) {
                $msg = $chat_with_replies['data']['internal_chat_replies']['data'];
                if ( isset($msg) && !empty($msg) ) {
                    $chat_with_replies['data']['message'] = $msg[0]['message'];
                    // $item['from_agent_name'] = $msg[0]['agent_name'];
                    // $item['from_agent_email'] = $msg[0]['agent_email'];
                    $chat_with_replies['data']['is_sender'] = $msg[0]['is_sender'];
                    $chat_with_replies['data']['file_name'] = $msg[0]['file_name'];
                    $chat_with_replies['data']['file_type'] = $msg[0]['file_type'];
                    $chat_with_replies['data']['file_path'] = $msg[0]['file_path'];
                    $chat_with_replies['data']['file_url'] = $msg[0]['file_url'];
                }
                $chat_with_replies = $chat_with_replies['data'];
            } else {
                $chat_with_replies = null;
            }
        }

        if ($chat_with_replies) {
            $result = $this->successResponseWithLog($chat_with_replies, __('messages.save.success'), null, 'send_chat_group');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error'));
        }
        return $result;
    }

    /**
     * @param String $request_meeting = true|false
     */
    public function replyChat($request, $request_meeting = false)
    {
        $current_user = null;
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
                $current_user_company_id = $current_user->id;
            }
        } else {
            // handle seeder
            $current_user_company_id = isset($request['company_id']) && !empty($request['company_id']) ? $request['company_id'] : null;
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        // check whether chat_id is present (chat room)
        $chat_room = $this->internal_chat_model->where('uuid', $current_user_company_uuid)
            ->where('chat_id', $request['chat_id'])
            ->with('private_chat_participants')
            ->first();
        if (empty($chat_room)) {
            return $this->errorResponseWithLog(null, 'Chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        // check whether agent is allowed to send message in chat room
        $agents_in_chat_room = $chat_room->private_chat_participants->where('id_agent', $current_user['id']);
        if ($agents_in_chat_room->isEmpty()) {
            return $this->errorResponseWithLog(null, 'Chat error: ' . __('messages.request.error') . " " . __('chat.not_permitted'));
        }

        $existing_bubble_parent = null;
        if( isset($request['parent']) && !empty($request['parent']) ) {
            $existing_reply_data = $this->internal_chat_reply_model
                ->where('chat_id', $request['chat_id'])
                ->where('id', $request['parent'])
                ->first();

            if (empty($existing_reply_data)) {
                $this->errorResponseWithLog(null, 'Reply bubble chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            } else {
                $existing_bubble_parent = $existing_reply_data->id;
            }
        }

        $store_chat_agent = $chat_room->agentsInChat()->syncWithoutDetaching([
            $current_user['id'] => ['chat_id' => $chat_room->chat_id],
            $request['receiver'] => ['chat_id' => $chat_room->chat_id]
        ]);

        $store_reply = $this->internal_chat_reply_model->create([
            'id_chat' => $chat_room->id,
            'chat_id' => $chat_room->chat_id,
            'from_agent_id' => $current_user['id'],
            'message' => isset($request['message']) && !empty($request['message']) ? $request['message'] : null,
            'parent' => $existing_bubble_parent,
            'meeting_url' => $request_meeting ? generate_random_letters('meeting') : null
        ]);

        $update = $this->updateByField($chat_room->chat_id, ['updated_at' => now()]);

        // update delete state only for private chat
        $update_deleted_conv = $chat_room->agentsInDeletedConv()->syncWithoutDetaching([
            $current_user['id'] => ['chat_id' => $chat_room->chat_id, 'conversation_deleted' => false],
            $request['receiver'] => ['chat_id' => $chat_room->chat_id, 'conversation_deleted' => false]
        ]);

        // update read chat time
        $update_read = $chat_room->agentsInReadConv()->syncWithoutDetaching([
            $current_user['id'] => [
                'chat_id' => $request['chat_id'],
                'unread_date' => now(),
                'read_date' => now()
            ],
            $request['receiver'] => [
                'chat_id' => $request['chat_id'],
                'unread_date' => now()
            ]
        ]);

        if ($store_reply) {
            $date = $store_reply['created_at'];
            $store_reply['formatted_date'] = dateTimeFormat($date->toDateTimeString());
            $store_reply['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

            // update file chat reply
            if (isset($request['file_id']) && !empty($request['file_id'])) {
                $fileReply = $this->internal_chat_file_model->where('id', $request['file_id'])->whereNull('internal_chat_reply_id')->first();
                $upadteFileInReply = $fileReply->update([
                    'internal_chat_reply_id' => $store_reply['id'],
                    'chat_id' => $request['chat_id']
                ]);

                if (!$upadteFileInReply)
                    Log::error(['Error in Reply Internal Chat' => ['code' => 400, 'message' => 'File not found in database'], 'internal_chat_reply_id' => $store_reply['id'], 'chat_id' => $request['chat_id']]);
            }

            $chat_file = $store_reply->internal_file_reply;
            $store_reply['file_name'] = null;
            $store_reply['file_type'] = null;
            $store_reply['file_path'] = null;
            $store_reply['file_url'] = null;
            if (!empty($chat_file)) {
                $store_reply['file_name'] = $chat_file['name'] ?: null;
                $store_reply['file_type'] = $chat_file['type'] ?: null;
                $store_reply['file_path'] = $chat_file['path'] ?: null;
                $store_reply['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path']) : null;
            }
            unset($store_reply['internal_file_reply']);

            // chat room member read time
            $store_reply['has_read'] = false;
            $has_read_by = [];

            if(!empty($store_reply->internal_chat->read_conversation_relation)) {
                $readExceptMe = $store_reply->internal_chat->read_conversation_relation->where('id_agent', '<>', $current_user['id']);

                foreach($readExceptMe as $key => $val) {
                    $memberReadDate = $val['read_date'];
                    $has_read_status = Carbon::create($memberReadDate) ->greaterThanOrEqualTo($store_reply['created_at']);


                    if($has_read_status) {
                        $has_read_by[$key]['has_read'] = $has_read_status;
                        $has_read_by[$key]['read_date'] = $val['read_date'];

                        $has_read_by[$key]['has_read'] ?
                            $store_reply['has_read'] = $store_reply['has_read'] || $has_read_by[$key]['has_read'] :
                            $store_reply['has_read'] = $store_reply['has_read'] && $has_read_by[$key]['has_read'];

                        $has_read_by[$key]['id_agent'] = $val['id_agent'];
                        if(isset($val['agent']) && !empty($val['agent'])) {
                            $has_read_by[$key]['name'] = $val['agent']['name'];
                            $has_read_by[$key]['email'] = $val['agent']['email'];

                            // set avatar
                            $avatar_url = !empty($val['agent']['avatar']) ? parseFileUrl($val['agent']['avatar']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($val['agent']['name'] . '-' . $val['agent']['id'], 'name');
                            $has_read_by[$key]['avatar'] = $avatar_url;
                        }
                    }
                }
            }
            $store_reply['has_read_by'] = array_slice($has_read_by, 0, 3);
            unset($store_reply['internal_chat']);

            // has parent/reply to bubble chat
            $store_reply['has_parent_reply'] = false;
            $store_reply['parent_reply_id'] = null;
            $store_reply['parent_reply_message'] = null;
            $store_reply['parent_reply_from_agent_id'] = null;
            $store_reply['parent_reply_from_agent_name'] = null;
            $store_reply['parent_reply_file_name'] = null;
            $store_reply['parent_reply_file_type'] = null;
            $store_reply['parent_reply_file_path'] = null;
            $store_reply['parent_reply_file_url'] = null;
            $store_reply['parent_is_meeting'] = false;
            $store_reply['parent_meeting_url'] = null;
            if(!empty($store_reply['has_parent'])) {
                $store_reply['has_parent_reply'] = true;
                $store_reply['parent_reply_id'] = $store_reply['has_parent']['id'];
                $store_reply['parent_reply_message'] = $store_reply['has_parent']['message'];
                $store_reply['parent_reply_from_agent_id'] = $store_reply['has_parent']['from_agent_id'];
                $store_reply['parent_reply_from_agent_name'] = isset($store_reply['has_parent']['agent']) && !empty($store_reply['has_parent']['agent']) ? $store_reply['has_parent']['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                $store_reply['parent_is_meeting'] = $store_reply['has_parent']['is_meeting'];
                $store_reply['parent_meeting_url'] = $store_reply['has_parent']['meeting_url'];

                // parent file
                $parent_file = $store_reply->has_parent->internal_file_reply;
                $store_reply['parent_reply_file_name'] = isset($parent_file['name']) ? $parent_file['name'] : null;
                $store_reply['parent_reply_file_type'] = isset($parent_file['type']) ? $parent_file['type'] : null;
                $store_reply['parent_reply_file_path'] = isset($parent_file['path']) ? $parent_file['path'] : null;
                $store_reply['parent_reply_file_url'] = isset($parent_file['path']) ? parseFileUrl($parent_file['path']) : null;
            }
            unset($store_reply['has_parent']);

            $result = $this->successResponseWithLog($store_reply, __('messages.save.success'), null, 'send_chat');

            // send push notification
            $receiver_data = $this->agent_model->find($request['receiver']);
            if(!empty($receiver_data->fcm_token)) {
                $avatar_url = !empty($current_user['avatar']) ? parseFileUrl($current_user['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($current_user['name'] . '-' . $current_user['id'], 'name');
                $current_user_avatar = $avatar_url;

                Notification::route('firebase', $current_user->fcm_token)
                    ->notify(new SendPushNotification(
                        $current_user->name, 'New message', $receiver_data->fcm_token, $current_user_avatar
                    ));
            }

        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error'));
        }
        return $result;
    }

    /**
     * @param String $request_meeting = true|false
     */
    public function replyChatToGroup($request, $request_meeting = false)
    {
        dd('reply chat group yg asli', $request);
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        // check group
        $group = $this->chat_group_model
            ->with('internal_chat_relation.internal_chat.private_chat_participants')
            ->with('group_participants')
            ->whereHas('group_participants', function ($query) use ($current_user) {
                $query->where('agent_id', $current_user->id);
            })
            ->where('uuid', $current_user_company_uuid)
            ->where('id', $request['group_id'])
            ->first();

        $internal_chat_room = null;
        $existing_chat_room = null;
        if (!empty($group['internal_chat_relation'])) {
            if (!empty($group['internal_chat_relation']['internal_chat'])) {
                $internal_chat_room = $group->internal_chat_relation->internal_chat;
                $existing_chat_room = $internal_chat_room;
            }
        }

        if (empty($existing_chat_room)) {
            return $this->errorResponseWithLog(null, 'Chat Group error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        $existing_bubble_parent = null;
        if( isset($request['parent']) && !empty($request['parent']) ) {
            $existing_reply_data = $this->internal_chat_reply_model
                ->where('chat_id', $existing_chat_room['chat_id'])
                ->where('id', $request['parent'])
                ->first();

            if (empty($existing_reply_data)) {
                $this->errorResponseWithLog(null, 'Reply bubble chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            } else {
                $existing_bubble_parent = $existing_reply_data->id;
            }
        }

        $store_reply = $this->internal_chat_reply_model->create([
            'id_chat' => $existing_chat_room->id,
            'chat_id' => $existing_chat_room->chat_id,
            'from_agent_id' => $current_user->id,
            // 'message' => isset($request['message']) && !empty($request['message']) ? $request['message'] : null,
            'message' => 'ini sistem',
            'parent' => $existing_bubble_parent,
            'meeting_url' => $request_meeting ? generate_random_letters('meeting') : null
        ]);

        // assign agents to table of read chat time
        $group_participants = $group->agentsInGroup;
        $assigned_participants = [];
        if ($group_participants->isNotEmpty()) {
            foreach ($group_participants as $key => $part) {
                $assigned_participants[$part->id] = [
                    'chat_id' => $existing_chat_room->chat_id,
                    'unread_date' => now()
                ];

                if ($part->id == $current_user->id)
                    $assigned_participants[$part->id]['read_date'] = now();
            }
            $update_read = $existing_chat_room->agentsInReadConv()->syncWithoutDetaching($assigned_participants);
        }

        $update = $this->updateByField($existing_chat_room->chat_id, ['updated_at' => now()]);

        if ($store_reply) {
            $date = $store_reply['created_at'];
            $store_reply['formatted_date'] = dateTimeFormat($date->toDateTimeString());
            $store_reply['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

            // update file chat reply
            if (isset($request['file_id']) && !empty($request['file_id'])) {
                $fileReply = $this->internal_chat_file_model->where('id', $request['file_id'])->whereNull('internal_chat_reply_id')->first();
                $upadteFileInReply = $fileReply->update([
                    'internal_chat_reply_id' => $store_reply['id'],
                    'chat_id' => $existing_chat_room->chat_id
                ]);

                if (!$upadteFileInReply)
                    Log::error(['Error in Reply Internal Chat' => ['code' => 400, 'message' => 'File not found in database'], 'internal_chat_reply_id' => $store_reply['id'], 'chat_id' => $existing_chat_room->chat_id]);
            }

            $chat_file = $store_reply->internal_file_reply;
            $store_reply['file_name'] = null;
            $store_reply['file_type'] = null;
            $store_reply['file_path'] = null;
            $store_reply['file_url'] = null;
            if (!empty($chat_file)) {
                $store_reply['file_name'] = $chat_file['name'] ?: null;
                $store_reply['file_type'] = $chat_file['type'] ?: null;
                $store_reply['file_path'] = $chat_file['path'] ?: null;
                $store_reply['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path']) : null;
            }
            unset($store_reply['internal_file_reply']);

            // chat room member read time
            $store_reply['has_read'] = false;
            $has_read_by = [];
            $notif_receiver_tokens = [];
            $notif_receiver_ids = [];
            if(!empty($store_reply->internal_chat->read_conversation_relation)) {
                $readExceptMe = $store_reply->internal_chat->read_conversation_relation; // show all group participant
                // $readExceptMe = $readExceptMe->where('id_agent', '<>', $current_user['id']);

                foreach($readExceptMe as $key => $val) {
                    $memberReadDate = $val['read_date'];
                    $has_read_status = Carbon::create($memberReadDate) ->greaterThanOrEqualTo($store_reply['created_at']);

                    if($has_read_status) {
                        $has_read_by[$key]['has_read'] = $has_read_status;
                        $has_read_by[$key]['read_date'] = $val['read_date'];

                        $has_read_by[$key]['has_read'] ?
                            $store_reply['has_read'] = $store_reply['has_read'] || $has_read_by[$key]['has_read'] :
                            $store_reply['has_read'] = $store_reply['has_read'] && $has_read_by[$key]['has_read'];

                        $has_read_by[$key]['id_agent'] = $val['id_agent'];
                        if(isset($val['agent']) && !empty($val['agent'])) {
                            $has_read_by[$key]['name'] = $val['agent']['name'];
                            $has_read_by[$key]['email'] = $val['agent']['email'];

                            // set avatar
                            $avatar_url = !empty($val['agent']['avatar']) ? parseFileUrl($val['agent']['avatar']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($val['agent']['name'] . '-' . $val['agent']['id'], 'name');
                            $has_read_by[$key]['avatar'] = $avatar_url;
                        }
                    }

                    // set notif receiver
                    if($val['id_agent'] != $current_user['id'] && !empty($val->agent->fcm_token)) {
                        $notif_receiver_tokens[] = $val['agent']['fcm_token'];
                        $notif_receiver_ids[] = $val['id_agent'];
                    }

                }
            }
            $store_reply['has_read_by'] = array_slice($has_read_by, 0, 3);
            unset($store_reply['internal_chat']);

            // has parent/reply to bubble chat
            $store_reply['has_parent_reply'] = false;
            $store_reply['parent_reply_id'] = null;
            $store_reply['parent_reply_message'] = null;
            $store_reply['parent_reply_from_agent_id'] = null;
            $store_reply['parent_reply_from_agent_name'] = null;
            $store_reply['parent_reply_file_name'] = null;
            $store_reply['parent_reply_file_type'] = null;
            $store_reply['parent_reply_file_path'] = null;
            $store_reply['parent_reply_file_url'] = null;
            $store_reply['parent_is_meeting'] = false;
            $store_reply['parent_meeting_url'] = null;
            if(!empty($store_reply['has_parent'])) {
                $store_reply['has_parent_reply'] = true;
                $store_reply['parent_reply_id'] = $store_reply['has_parent']['id'];
                $store_reply['parent_reply_message'] = $store_reply['has_parent']['message'];
                $store_reply['parent_reply_from_agent_id'] = $store_reply['has_parent']['from_agent_id'];
                $store_reply['parent_reply_from_agent_name'] = isset($store_reply['has_parent']['agent']) && !empty($store_reply['has_parent']['agent']) ? $store_reply['has_parent']['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                $store_reply['parent_is_meeting'] = $store_reply['has_parent']['is_meeting'];
                $store_reply['parent_meeting_url'] = $store_reply['has_parent']['meeting_url'];

                // parent file
                $parent_file = $store_reply->has_parent->internal_file_reply;
                $store_reply['parent_reply_file_name'] = isset($parent_file['name']) ? $parent_file['name'] : null;
                $store_reply['parent_reply_file_type'] = isset($parent_file['type']) ? $parent_file['type'] : null;
                $store_reply['parent_reply_file_path'] = isset($parent_file['path']) ? $parent_file['path'] : null;
                $store_reply['parent_reply_file_url'] = isset($parent_file['path']) ? parseFileUrl($parent_file['path']) : null;
            }
            unset($store_reply['has_parent']);

            $result = $this->successResponseWithLog($store_reply, __('messages.save.success'), null, 'send_chat_group');

            // send push notification
            if(!empty($notif_receiver_tokens)) {
                $avatar_url = !empty($group['icon']) ? parseFileUrl($group['icon']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($group['name'] . '-' . $group['id'], 'name');
                $group_icon = $avatar_url;
                Notification::route('firebase', '')
                    ->notify(new SendPushNotification(
                        $group->name, 'New message from '.$current_user['name'], $notif_receiver_tokens, $group_icon
                    ));
            }

        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error'));
        }
        return $result;
    }


    /**
     * Send message to group by webhook
     *
     * Base code is from replyChatToGroup()
     *
     * @param String $request_meeting = true|false
     */
    public function replyChatToGroupByAnonymous($request, $request_meeting = false)
    {
        // check secret key/token
        $decrypted_key = Crypt::decrypt($request['key']);
        if(empty($decrypted_key))
            return $this->errorResponseWithLog(null, 'Invalid Key: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $anonymous_agent = $this->anonymous_agent_model->where(['anonymous_agent_id' => $decrypted_key])->first();
        if(empty($anonymous_agent))
            return $this->errorResponseWithLog(null, 'Webhook Error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // check group
        $group = $this->chat_group_model
            ->with('internal_chat_relation.internal_chat.private_chat_participants')
            ->with('group_participants')
            ->where('id', $anonymous_agent['chat_group_id'])
            ->first();

        $internal_chat_room = null;
        $existing_chat_room = null;
        if (!empty($group['internal_chat_relation'])) {
            if (!empty($group['internal_chat_relation']['internal_chat'])) {
                $internal_chat_room = $group->internal_chat_relation->internal_chat;
                $existing_chat_room = $internal_chat_room;
            }
        }

        if (empty($existing_chat_room)) {
            return $this->errorResponseWithLog(null, 'Chat Group error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
        }

        $existing_bubble_parent = null;
        if( isset($request['parent']) && !empty($request['parent']) ) {
            $existing_reply_data = $this->internal_chat_reply_model
                ->where('chat_id', $existing_chat_room['chat_id'])
                ->where('id', $request['parent'])
                ->first();

            if (empty($existing_reply_data)) {
                $this->errorResponseWithLog(null, 'Reply bubble chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            } else {
                $existing_bubble_parent = $existing_reply_data->id;
            }
        }

        $store_reply = $this->internal_chat_reply_model->create([
            'id_chat' => $existing_chat_room->id,
            'chat_id' => $existing_chat_room->chat_id,
            'from_agent_id' => $anonymous_agent->id,
            'from_anonymous' => 1,
            'message' => isset($request['message']) && !empty($request['message']) ? $request['message'] : null,
            'parent' => $existing_bubble_parent,
            'meeting_url' => $request_meeting ? generate_random_letters('meeting') : null
        ]);

        if ($store_reply) {
            $date = $store_reply['created_at'];
            $store_reply['formatted_date'] = dateTimeFormat($date->toDateTimeString());
            $store_reply['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

            // update file chat reply

            // chat room member read time
            $store_reply['has_read'] = false;
            $has_read_by = [];
            $notif_receiver_tokens = [];
            $notif_receiver_ids = [];
            if(!empty($store_reply->internal_chat->read_conversation_relation)) {
                $readExceptMe = $store_reply->internal_chat->read_conversation_relation; // show all group participant
                // $readExceptMe = $readExceptMe->where('id_agent', '<>', $current_user['id']);

                foreach($readExceptMe as $key => $val) {
                    $memberReadDate = $val['read_date'];
                    $has_read_status = Carbon::create($memberReadDate) ->greaterThanOrEqualTo($store_reply['created_at']);

                    if($has_read_status) {
                        $has_read_by[$key]['has_read'] = $has_read_status;
                        $has_read_by[$key]['read_date'] = $val['read_date'];

                        $has_read_by[$key]['has_read'] ?
                            $store_reply['has_read'] = $store_reply['has_read'] || $has_read_by[$key]['has_read'] :
                            $store_reply['has_read'] = $store_reply['has_read'] && $has_read_by[$key]['has_read'];

                        $has_read_by[$key]['id_agent'] = $val['id_agent'];
                        if(isset($val['agent']) && !empty($val['agent'])) {
                            $has_read_by[$key]['name'] = $val['agent']['name'];
                            $has_read_by[$key]['email'] = $val['agent']['email'];

                            // set avatar
                            $avatar_url = !empty($val['agent']['avatar']) ? parseFileUrl($val['agent']['avatar']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($val['agent']['name'] . '-' . $val['agent']['id'], 'name');
                            $has_read_by[$key]['avatar'] = $avatar_url;
                        }
                    }

                    // set notif receiver
                    // send to all group's user
                    $notif_receiver_tokens[] = $val['agent']['fcm_token'];
                    $notif_receiver_ids[] = $val['id_agent'];
                }
            }
            $store_reply['has_read_by'] = array_slice($has_read_by, 0, 3);
            unset($store_reply['internal_chat']);

            // has parent/reply to bubble chat
            $store_reply['has_parent_reply'] = false;
            $store_reply['parent_reply_id'] = null;
            $store_reply['parent_reply_message'] = null;
            $store_reply['parent_reply_from_agent_id'] = null;
            $store_reply['parent_reply_from_agent_name'] = null;
            $store_reply['parent_reply_file_name'] = null;
            $store_reply['parent_reply_file_type'] = null;
            $store_reply['parent_reply_file_path'] = null;
            $store_reply['parent_reply_file_url'] = null;
            $store_reply['parent_is_meeting'] = false;
            $store_reply['parent_meeting_url'] = null;
            if(!empty($store_reply['has_parent'])) {
                $store_reply['has_parent_reply'] = true;
                $store_reply['parent_reply_id'] = $store_reply['has_parent']['id'];
                $store_reply['parent_reply_message'] = $store_reply['has_parent']['message'];
                $store_reply['parent_reply_from_agent_id'] = $store_reply['has_parent']['from_agent_id'];
                $store_reply['parent_reply_from_agent_name'] = isset($store_reply['has_parent']['agent']) && !empty($store_reply['has_parent']['agent']) ? $store_reply['has_parent']['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                $store_reply['parent_is_meeting'] = $store_reply['has_parent']['is_meeting'];
                $store_reply['parent_meeting_url'] = $store_reply['has_parent']['meeting_url'];

                // parent file
                $parent_file = $store_reply->has_parent->internal_file_reply;
                $store_reply['parent_reply_file_name'] = isset($parent_file['name']) ? $parent_file['name'] : null;
                $store_reply['parent_reply_file_type'] = isset($parent_file['type']) ? $parent_file['type'] : null;
                $store_reply['parent_reply_file_path'] = isset($parent_file['path']) ? $parent_file['path'] : null;
                $store_reply['parent_reply_file_url'] = isset($parent_file['path']) ? parseFileUrl($parent_file['path']) : null;
            }
            unset($store_reply['has_parent']);

            // send push notification
            if(!empty($notif_receiver_tokens)) {
                $avatar_url = !empty($group['icon']) ? parseFileUrl($group['icon']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($group['name'] . '-' . $group['id'], 'name');
                $group_icon = $avatar_url;
                Notification::route('firebase', '')
                    ->notify(new SendPushNotification(
                        $group->name, 'New message from '.$anonymous_agent['name'], $notif_receiver_tokens, $group_icon
                    ));
            }

            /** Send To API And Socket */
            // Mapping data to send to socket
            $post_fields = [
                'group_id' => $anonymous_agent['group_id'],
                'agent_email' => null,
                'agent_id' => $anonymous_agent['id'],
                'agent_name' => $anonymous_agent['name'],
                'is_sender' => false,
                'module' => 'is_chatCompany',
                'profileSender' => [
                    'online' => 0,
                    'agent_id' => $anonymous_agent['id'],
                    'agent_uuid' => null,
                    'agent_email' => null,
                    'agent_name' => $anonymous_agent['name'],
                    'agent_avatar' => isset($anonymous_agent['image']) && !empty($anonymous_agent['image']) ? $anonymous_agent['image'] : null,
                    'status_name' => null
                ],
                'receiverData' => $notif_receiver_ids,
            ];
            $arr_store_reply = !empty($store_reply) ? $store_reply->toArray() : [];
            $merged_post_fields = array_merge($post_fields, $arr_store_reply);

            $webhookApiUrl = env('SOCKET_QCHAT_URL', "http://localhost:4000")."/send-to-group";
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $webhookApiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($merged_post_fields),
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                ),
            ));
            $response = curl_exec($curl);
            curl_close($curl);

            $result = $this->successResponseWithLog($store_reply, __('messages.save.success'), null, 'send_chat_group');
            return $result;
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error'));
        }
        return $result;
    }

    public function uploadFileInternalChat($request)
    {
        $file = $request['files'];
        $file_type = 'other';
        $input_data['path'] = null;
        if (isset($file) && !empty($file)) {
            $uploadedFileExt = $file->extension();
            $uploadedFileMime = $file->getClientMimeType();
            $arr_uploaded_mime = explode('/', $uploadedFileMime);

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

            $store_file = uploadFile($file, 'public/assets/images/uploads/internal-chat', true); // upload file
            $input_data['path'] = $store_file['path']; // update data
            $input_data['name'] = $store_file['name']; // update data
            $file_type = $uploadedMime;
        }

        $input_data['type'] = $file_type;
        $store = $this->internal_chat_file_model->create($input_data);
        if ($store) {
            $store['url'] = parseFileUrl($store['path']);
            $result = $this->successResponseWithLog($store, __('messages.save.success'), null, 'upload_file');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.save.error'));
        }
        return $result;
    }

    /**
     * @param String $type = null|only-latest-chat|only-pinned
     */
    public function showBubbleChatByChatId($request, $type = null)
    {
        $current_user = (object)[];
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
                $current_user_company_id = $current_user->id;
            }
        } else {
            // handle seeder
            $current_user_company_id = isset($request['company_id']) && !empty($request['company_id']) ? $request['company_id'] : null;
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user->id = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        // get result of search message
        $check_search = [];
        if( isset($request['reply_id']) && !empty($request['reply_id']) ) {
            $check_search = $this->showBubbleChatByBubbleId($request, null);
        }

        $set_per_page = isset($request['set_per_page']) ? $request['set_per_page'] : 20;

        $poll_service = null;
        // $poll_service = PollService::getInstance();

        // start query to db
        $chat_room = $this->internal_chat_model->where('uuid', $current_user_company_uuid)
            ->where('chat_id', $request['chat_id']);

        // check if agent has deleted conversation
        $check_delete = $chat_room->with('deleted_conversation', function ($q) use ($current_user) {
            $q->where('id_agent', $current_user->id);
            $q->orderBy('id', 'desc');
        })->first();

        // check if agent has unread data
        $check_unread = $chat_room->with('read_conversation_relation', function ($q) use ($current_user) {
            $q->where('id_agent', $current_user->id);
            $q->orderBy('id', 'desc');
        })->first();

        # used to retrieve data reply chat when there is no pagination
        # but now only used for retrieve latest chat
        $chat_room = $chat_room->with('internal_chat_replies', function ($reply) use ($check_delete, $type, $check_unread) {
            // filter data for show chat only in the time after agent removed conversation
            if (isset($check_delete['deleted_conversation']) && $check_delete->deleted_conversation->isNotEmpty()) {
                $reply->with('internal_file_reply');

                if ($check_delete['deleted_conversation'][0]['removed_date']) {
                    $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['removed_date']);
                } else {
                    $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['added_date']);
                }

                if ($type == 'only-latest-chat') { // get only one latest chat
                    $reply->orderBy('updated_at', 'desc');
                    $reply->limit(1);
                }
            }
        });

        // count how many unread chat
        if (isset($check_unread['read_conversation_relation']) && $check_unread->read_conversation_relation->isNotEmpty()) {
            $chat_room = $chat_room->withCount([
                'internal_chat_replies as unread_chat' => function (Builder $rep_query) use ($check_unread, $type) {
                    if ($check_unread['read_conversation_relation'][0]['read_date']) {
                        $rep_query->where('updated_at', '>', $check_unread['read_conversation_relation'][0]['read_date']);
                    }
                }
            ]);
        }

        $chat_room = $chat_room->whereHas('private_chat_participants', function ($qry) use ($current_user) {
            $qry->whereIn('id_agent', [$current_user->id]);
        })
        ->with('chat_group_relation')
        // ->with('has_pin_replies') // dev debug
        ->first();
        // end of query to db


        // if(empty($chat_room) || $chat_room['internal_chat_replies']->isEmpty() )
        if (empty($chat_room))
            return $this->successResponse(null, 'Chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));


        $date = $chat_room['updated_at'];
        $chat_room['formatted_date'] = dateTimeFormat($date->toDateTimeString());
        $chat_room['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

        // query #2
        // get participant that has read the chat
        $chat_has_read_by = $this->internal_chat_model->where('uuid', $current_user_company_uuid)
            ->where('chat_id', $request['chat_id'])
            ->with('read_conversation_relation', function ($q) use ($current_user, $chat_room) {
                if(!$chat_room->chat_group_relation)
                    $q->where('id_agent', '<>', $current_user->id); // show all participant in chat group detail

                $q->orderBy('id', 'desc');
            })->first();
        // end of query #2

        // mapping message data

        // if ($chat_room['internal_chat_replies']->isNotEmpty()) {
            # use pagination if not request for 'only latest chat'
            if ($type != 'only-latest-chat' && $type != 'only-pinned') {
                $chat_room->setRelation('internal_chat_replies', $chat_room->internal_chat_replies()
                    ->when($check_delete, function ($reply) use ($check_delete, $type, $check_unread, $check_search) {
                        $reply->with('internal_file_reply');
                        $reply->with('has_parent');

                        if ($check_delete['deleted_conversation'][0]['removed_date']) {
                            $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['removed_date']);
                        } else {
                            $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['added_date']);
                        }

                    })
                    ->orderBy('id', 'desc')
                    ->paginate($set_per_page, ['*'], 'page', ($check_search ? $check_search['selected_page'] : null) )
                );
            }


            // get chat reply and reverse it
            $bubbles = $chat_room['internal_chat_replies']->reverse();

            // add remaining bubble chat to current bubble reply
            if($check_search) {
                $additional_bubbles = $this->internal_chat_reply_model->whereIn('id', $check_search['id_remaining_bubbles_to_show'])->get();
                if(!empty($additional_bubbles))
                    $bubbles = $bubbles->merge($additional_bubbles);
            }

            $bubbles = $bubbles->map(function ($msg, $key) use ($current_user, $chat_has_read_by, $poll_service) {
                $msg['unique_id'] = 'rply-'.$msg['id'].$msg['chat_id']; // unique identifier for frontend, prevent duplicate id from chat reply

                if (!empty($msg['created_at'])) {
                    $date = $msg['created_at'];
                    $msg['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                    $msg['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
                }

                if ($msg['deleted_at']) {
                    $msg['message'] = __('chat.internal_chat_label.deleted_bubble_chat');
                }

                if ($msg['is_pinned']) {
                    $msg['is_pinned'] = true;
                } else {
                    $msg['is_pinned'] = false;
                }

                $msg['agent_id'] = '';
                $msg['agent_name'] = '';
                $msg['agent_email'] = '';
                $msg['is_sender'] = false;
                if (!empty($msg->agent)) {
                    $msg['agent_id'] = $msg->agent->id;
                    $msg['agent_name'] = $msg->agent->name;
                    $msg['agent_email'] = $msg->agent->email;

                    if ($msg->agent->id == $current_user->id)
                        $msg['is_sender'] = true;
                }

                /**
                 * Handle if sender is system
                 * Used in feature webhook
                 */
                if(isset($msg['from_anonymous']) && $msg['from_anonymous']) {
                    $msg['is_sender'] = false;

                    $anonymous_sender = $this->anonymous_agent_model->find($msg['agent_id']);
                    if(!empty($anonymous_sender))
                        $msg['agent_id'] = isset($anonymous_sender['anonymous_agent_id']) ? $anonymous_sender['anonymous_agent_id'] : null;
                        $msg['agent_name'] = isset($anonymous_sender['name']) ? $anonymous_sender['name'] : '';

                    $msg['agent_email'] = null;
                }
                unset($msg['agent']);

                // file reply
                $msg['file_name'] = null;
                $msg['file_type'] = null;
                $msg['file_path'] = null;
                $msg['file_url'] = null;
                $chat_file = $msg['internal_file_reply'];
                if (!empty($chat_file)) {
                    $msg['file_name'] = $chat_file['name'] ?: null;
                    $msg['file_type'] = $chat_file['type'] ?: null;
                    $msg['file_path'] = $chat_file['path'] ?: null;
                    $msg['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path']) : null;
                }
                unset($msg['internal_file_reply']);

                // chat room member read time
                $msg['has_read'] = false;
                $has_read_by = [];
                if(!empty($chat_has_read_by->read_conversation_relation)) {
                    $readExceptMe = $chat_has_read_by->read_conversation_relation;

                    foreach($readExceptMe as $key => $val) {
                        $memberReadDate = $val['read_date'];
                        $has_read_status = Carbon::create($memberReadDate)->greaterThanOrEqualTo($msg['created_at']);

                        if($has_read_status) {
                            $has_read_by[$key]['has_read'] = $has_read_status;
                            $has_read_by[$key]['read_date'] = $val['read_date'];

                            $has_read_by[$key]['has_read'] ?
                                $msg['has_read'] = $msg['has_read'] || $has_read_by[$key]['has_read'] :
                                $msg['has_read'] = $msg['has_read'] && $has_read_by[$key]['has_read'];

                            $has_read_by[$key]['id_agent'] = $val['id_agent'];
                            if(isset($val['agent']) && !empty($val['agent'])) {
                                $has_read_by[$key]['name'] = $val['agent']['name'];
                                $has_read_by[$key]['email'] = $val['agent']['email'];

                                // set avatar
                                $avatar_url = !empty($val['agent']['avatar']) ? parseFileUrl($val['agent']['avatar']) : null;
                                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($val['agent']['name'] . '-' . $val['agent']['id'], 'name');
                                $has_read_by[$key]['avatar'] = $avatar_url;
                            }
                        }
                    }
                }
                $msg['has_read_by'] = array_slice($has_read_by, 0, 3);

                // has parent/reply to bubble chat
                $msg['has_parent_reply'] = false;
                $msg['parent_reply_id'] = null;
                $msg['parent_reply_message'] = null;
                $msg['parent_reply_from_agent_id'] = null;
                $msg['parent_reply_from_agent_name'] = null;
                $msg['parent_reply_file_name'] = null;
                $msg['parent_reply_file_type'] = null;
                $msg['parent_reply_file_path'] = null;
                $msg['parent_reply_file_url'] = null;
                $msg['parent_is_meeting'] = false;
                $msg['parent_meeting_url'] = null;
                if(!empty($msg['has_parent'])) {
                    $msg['has_parent_reply'] = true;
                    $msg['parent_reply_id'] = $msg['has_parent']['id'];
                    $msg['parent_reply_message'] = $msg['has_parent']['message'];
                    $msg['parent_reply_from_agent_id'] = $msg['has_parent']['from_agent_id'];
                    $msg['parent_reply_from_agent_name'] = isset($msg['has_parent']['agent']) && !empty($msg['has_parent']['agent']) ? $msg['has_parent']['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                    $msg['parent_is_meeting'] = $msg['has_parent']['is_meeting'];
                    $msg['parent_meeting_url'] = $msg['has_parent']['meeting_url'];

                    // parent file
                    $parent_file = $msg->has_parent->internal_file_reply;
                    $msg['parent_reply_file_name'] = isset($parent_file['name']) ? $parent_file['name'] : null;
                    $msg['parent_reply_file_type'] = isset($parent_file['type']) ? $parent_file['type'] : null;
                    $msg['parent_reply_file_path'] = isset($parent_file['path']) ? $parent_file['path'] : null;
                    $msg['parent_reply_file_url'] = isset($parent_file['path']) ? parseFileUrl($parent_file['path']) : null;
                }
                unset($msg['has_parent']);

                // polls/vote
                // $msg['has_poll'] = false;
                // if (!$msg['deleted_at']) {
                //     $poll_data = $msg->poll;
                //     if(!empty($poll_data)) {
                //         $msg['has_poll'] = true;
                //         $current_choice_data = $poll_data->poll_choices;
                //         $current_answer_data = $poll_data->poll_answers;
                //         $choice_with_answer = $poll_service->countPolling($current_choice_data, $current_answer_data); // mapping and count polling choice with polling answer
                //         unset($poll_data['poll_answers']);
                //     }
                // } else {
                //     $msg['poll'] = null;
                // }

                return $msg;
            });
        // }

            // add participants to return data
            $data_participants = [];
            if (!empty($chat_room['private_chat_participants'])) {
                foreach ($chat_room['private_chat_participants'] as $key => $prt) {
                    if ($prt['id_agent'] != $current_user->id) {
                        if ($prt['agent'] == null) {
                            // means data is not using current user logged in
                            $other_agent = $this->agent_model->find($prt->id_agent);
                            $data_participants['receiver_id'] = !empty($other_agent) ? $other_agent['id'] : null;
                            $data_participants['display_chat_name'] = !empty($other_agent) ? $other_agent['name'] : __('chat.internal_chat_label.account_not_found');
                            $data_participants['display_chat_email'] = !empty($other_agent) ? $other_agent['email'] : __('chat.internal_chat_label.account_not_found');
                            $data_participants['online'] = !empty($other_agent) ? $other_agent['online'] : 0;

                            $avatar_url = null;
                            if($other_agent) {
                                $avatar_url = !empty($other_agent) && !empty($other_agent['avatar']) ? parseFileUrl($other_agent['avatar']) : null;
                                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($other_agent['name'] . '-' . $other_agent['id'], 'name');
                            }
                            $data_participants['display_chat_image'] = $avatar_url;
                        } else {
                            $data_participants['receiver_id'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['id'] : null;
                            $data_participants['display_chat_name'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                            $data_participants['display_chat_email'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['email'] : __('chat.internal_chat_label.account_not_found');
                            $data_participants['online'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['online'] : 0;

                            $avatar_url = !empty($prt['agent']['avatar']) ? parseFileUrl($prt['agent']['avatar']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($prt['agent']['name'] . '-' . $prt['agent']['id'], 'name');
                            $data_participants['display_chat_image'] = $avatar_url;
                        }
                    }
                }
            }

        unset(
            $chat_room['deleted_conversation'],
            $chat_room['read_conversation_relation'],
            $chat_room['chat_group_relation'],
            $chat_room['private_chat_participants']
        );

        $pinned_replies = $chat_room->internal_chat_replies->where('is_pinned', 1);
        $chat_room['pinned_replies'] = $pinned_replies->isNotEmpty() ? array_values($pinned_replies->toArray()) : [];

        $data = $chat_room->toArray();
        $data['internal_chat_replies']['data'] = $bubbles ? ( array_values($bubbles->toArray()) ) : [];

        if($type == 'only-pinned')
            $data = array_reverse($data['pinned_replies']); // sort message from the newest

        $data = array_merge($data, $data_participants);

        $data = collect($data);
        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->successResponse($data, __('messages.request.error'));
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

        $internal_chat = $this->internal_chat_model->where('chat_id', $chat_id)->latest()->first();
        if (empty($internal_chat))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        $update = false;
        if (!empty($internal_chat) && !empty($request)) {
            $update = $internal_chat;

            foreach ($request as $field => $field_value) {
                if (in_array($field, $this->internal_chat_model->fillable)) {
                    $update->$field = $field_value;
                }
            }
            $update->update();
        }

        if ($update) {
            $result = $this->successResponse($internal_chat, __('messages.update.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * @param $type = private|group
     */
    public function listChat($request, $type = null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        $unread_list = collect([]);
        $data = [
            'chat_count' => 0,
            'unread_chat' => 0,
            'unread_bubble_chat' => 0,
            'list' => []
        ];

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        // start query to db
        $query = $this->internal_chat_model->where('uuid', $current_user_company_uuid);

        $chat_room = $query->orderBy('updated_at', 'desc')
            ->whereHas('private_chat_participants', function ($qry) use ($current_user, $request) {
                $qry->whereIn('id_agent', [$current_user->id]);
            })
            ->with('private_chat_participants.agent', function ($qry) use ($current_user, $request) {
                // filter by request
                if (isset($request['agent_name']) && !empty($request['agent_name']))
                    $qry->where('agent.name', 'like', '%' . $request['agent_name'] . '%');

                if (isset($request['agent_email']) && !empty($request['agent_email']))
                    $qry->where('agent.email', 'like', '%' . $request['agent_email'] . '%');

                if (isset($request['keyword']) && !empty($request['keyword'])) {
                    $qry->where(function ($subQ) use ($request) {
                        $subQ->orWhere('agent.name', 'like', '%' . $request['keyword'] . '%')
                            ->orWhere('agent.email', 'like', '%' . $request['keyword'] . '%')
                            ->orWhere('agent.phone', 'like', '%' . $request['keyword'] . '%');
                    });
                }
            })
            ->where('chat_type', 1)
            ->whereHas('deleted_conversation', function ($q) use ($current_user) {
                $q->where('id_agent', $current_user['id'])
                ->where('conversation_deleted', 0);
            })
            ->with('read_conversation_relation', function ($q) use ($current_user) {
                $q->where('id_agent', $current_user->id);
                $q->orderBy('id', 'desc');
            })
            ->limit(10)
            ->get();
        // end of query to db

        // set keys for response data
        $chat_room->map(function ($item, $key) use ($current_user) {
            $date = $item['updated_at'];
            $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
            $item['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');

            $item['display_chat_name'] = null;
            $item['display_chat_email'] = null;
            $item['display_chat_image'] = null;
            $item['online'] = 0;
            if (!empty($item['private_chat_participants'])) {
                foreach ($item['private_chat_participants'] as $key => $prt) {
                    if ($prt['id_agent'] != $current_user->id) {
                        if ($prt['agent'] == null) {
                            // means data is not using current user logged in
                            $other_agent = $this->agent_model->find($prt->id_agent);
                            $item['receiver_id'] = !empty($other_agent) ? $other_agent['id'] : null;
                            $item['display_chat_name'] = !empty($other_agent) ? $other_agent['name'] : __('chat.internal_chat_label.account_not_found');
                            $item['display_chat_email'] = !empty($other_agent) ? $other_agent['email'] : __('chat.internal_chat_label.account_not_found');
                            $item['online'] = !empty($other_agent) ? $other_agent['online'] : 0;

                            $avatar_url = null;
                            if($other_agent) {
                                $avatar_url = !empty($other_agent) && !empty($other_agent['avatar']) ? parseFileUrl($other_agent['avatar']) : null;
                                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($other_agent['name'] . '-' . $other_agent['id'], 'name');
                            }
                            $item['display_chat_image'] = $avatar_url;
                        } else {
                            $item['receiver_id'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['id'] : null;
                            $item['display_chat_name'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                            $item['display_chat_email'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['email'] : __('chat.internal_chat_label.account_not_found');
                            $item['online'] = isset($prt['agent']) && !empty($prt['agent']) ? $prt['agent']['online'] : 0;

                            $avatar_url = !empty($prt['agent']['avatar']) ? parseFileUrl($prt['agent']['avatar']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($prt['agent']['name'] . '-' . $prt['agent']['id'], 'name');
                            $item['display_chat_image'] = $avatar_url;
                        }

                        break 1;
                    }
                }
            }
            unset($item['private_chat_participants']);

            $item['unread_count'] = 0; // set to zero

            // get latest chat
            $item['message'] = null;
            $item['is_sender'] = null;
            $item['file_name'] = null;
            $item['file_type'] = null;
            $item['file_path'] = null;
            $item['file_url'] = null;
            $item['has_read'] = false;
            $item['reply_is_deleted'] = false;
            $item['meeting_url'] = null;
            $item['is_meeting'] = false;

            $memberReadDate = $item['read_conversation_relation']->isNotEmpty() ? $item['read_conversation_relation'][0]['read_date'] : null;
            if($memberReadDate) {
                $has_read_status = Carbon::create($memberReadDate)->greaterThanOrEqualTo($item['formatted_date']);
                if($has_read_status)
                    $item['has_read'] = true;
            }
            unset($item['read_conversation_relation']);
        });

        $arr_data_chats = $chat_room->toArray();
        $data['list'] = array_values($arr_data_chats);
        // end of filter and mapping for response data

        // count unread chat list
        $unread_list = $chat_room->filter(function ($item, $key) {
            if (!$item['has_read'])
                return $item;
        });
        $data['chat_count'] =  !empty($chat_room) ? $chat_room->count() : 0;
        $data['unread_chat'] = $unread_list->count();
        $data['unread_bubble_chat'] = 0; // set to zero

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->successResponse($data, __('messages.request.error'));
        }
        return $result;
    }

    /**
     * list of group that current user has joined
     */
    public function listChatGroup($request, $type = null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        $unread_list = collect([]);
        $data = [
            'chat_count' => 0,
            'unread_chat' => 0,
            'unread_bubble_chat' => 0,
            'list' => []
        ];

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        // start query to db
        $query = $this->internal_chat_model->where('uuid', $current_user_company_uuid);

        $chat_room = $query->orderBy('updated_at', 'desc')
            ->whereHas('private_chat_participants', function ($qry) use ($current_user, $request) {
                $qry->whereIn('id_agent', [$current_user->id]);
            })
            ->with('private_chat_participants.agent', function ($qry) use ($current_user, $request) {
                // filter by request
                if (isset($request['agent_name']) && !empty($request['agent_name']))
                    $qry->where('agent.name', 'like', '%' . $request['agent_name'] . '%');

                if (isset($request['agent_email']) && !empty($request['agent_email']))
                    $qry->where('agent.email', 'like', '%' . $request['agent_email'] . '%');

                if (isset($request['keyword']) && !empty($request['keyword'])) {
                    $qry->where(function ($subQ) use ($request) {
                        $subQ->orWhere('agent.name', 'like', '%' . $request['keyword'] . '%')
                            ->orWhere('agent.email', 'like', '%' . $request['keyword'] . '%')
                            ->orWhere('agent.phone', 'like', '%' . $request['keyword'] . '%');
                    });
                }
            })
            ->with('chat_group_relation.chat_group', function ($qry_group) use ($current_user, $request) {
                // filter by request
                if (isset($request['keyword']) && !empty($request['keyword'])) {
                    $qry_group->where(function ($sub) use ($request) {
                        $sub->orWhere('name', 'like', '%' . $request['keyword'] . '%');
                    });
                }
            })
            ->withCount('private_chat_participants as member_count')
            ->where('chat_type', 2)
            ->with('read_conversation_relation', function ($q) use ($current_user) {
                $q->where('id_agent', $current_user->id);
                $q->orderBy('id', 'desc');
            })
            ->limit(10)
            ->get();
        // end of query to db

        // filter and show data in list based on requested parameter
        $chat_room = $chat_room->filter(function ($item, $key) use ($current_user) {
            $is_in_participants = false;
            if (!empty($item['private_chat_participants'])) {
                $agent_exist = false;
                $check_agent = false;
                foreach ($item['private_chat_participants'] as $key => $prt) {
                    if ($prt['agent'] == null) {
                        // $check_agent = false;
                    } else {
                        // $agent_exist = true;
                        // return $item;
                        $is_in_participants = true; // requested keyword found in participants data
                    }
                }
            }

            $is_in_group = false;
            if (!empty($item->chat_group_relation)) {
                if ($item->chat_group_relation->chat_group != null) {
                    $is_in_group = true; // requested keyword found in group data
                }
            }

            if ($is_in_participants || $is_in_group) {
                return $item;
            }
        });

        // set keys for response data
        $chat_room->map(function ($item, $key) use ($current_user) {
            $date = $item['updated_at'];
            $item['formatted_date'] = dateTimeFormat($date->toDateTimeString());
            $item['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
            $item['id_chat'] = $item->id;

            // participants data
            unset($item['private_chat_participants']);

            // group data
            if (!empty($item->chat_group_relation)) {
                $item['display_chat_name'] = null;
                $item['display_chat_image'] = null;
                $item['id_chat_group'] = null;
                $item['id'] = null;
                $get_member = null;

                if (!empty($item->chat_group_relation->chat_group)) {
                    $group = $item->chat_group_relation->chat_group;
                    $get_member = $group;

                    $item['id_chat_group'] = isset($group['id']) && !empty($group['id']) ? $group['id'] : null;
                    $item['id'] = $item['id_chat_group'];
                    $item['display_chat_name'] = isset($group['name']) && !empty($group['name']) ? $group['name'] : __('chat.internal_chat_label.group_not_found');

                    $item['display_chat_image'] = getGravatar($item['display_chat_name']);
                    if($group) {
                        $avatar_url = !empty($group['icon']) ? parseFileUrl($group['icon']) : null;
                        $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($group['name'] . '-' . $group['id'], 'name');
                        $item['display_chat_image'] = $avatar_url;
                    }
                } else {
                    // get data group if detail is empty
                    $get_group = $this->chat_group_model->find($item->chat_group_relation->id_chat_group);
                    $get_member = $get_group;

                    $item['id_chat_group'] = isset($get_group['id']) && !empty($get_group) ? $get_group['id'] : null;
                    $item['id'] = $item['id_chat_group'];
                    $item['display_chat_name'] = isset($get_group['name']) && !empty($get_group) ? $get_group['name'] : __('chat.internal_chat_label.group_not_found');

                    $item['display_chat_image'] = getGravatar($item['display_chat_name']);
                    if($get_group) {
                        $avatar_url = !empty($get_group['icon']) ? parseFileUrl($get_group['icon']) : null;
                        $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($get_group['name'] . '-' . $get_group['id'], 'name');
                        $item['display_chat_image'] = $avatar_url;
                    }
                }

                // set member participants
                $item['participants'] = [];
                if (!empty($get_member)) {
                    $group_participants = $get_member->agentsInGroup;
                    $participant = [];
                    if ($group_participants->isNotEmpty()) {
                        foreach ($group_participants as $key => $group_agent) {
                            $participant[$key]['agent_id'] = !empty($group_agent->id) ? $group_agent->id : null;
                            $participant[$key]['agent_uuid'] = !empty($group_agent->uuid) ? $group_agent->uuid : null;
                            $participant[$key]['agent_email'] = !empty($group_agent->email) ? $group_agent->email : null;
                        }
                        $item['participants'] = array_values($participant);
                    }
                }
            }
            unset($item['chat_group_relation']);

            $item['unread_count'] = 0;

            // get latest chat
            $item['message'] = null;
            $item['receiver_id'] = null;
            $item['from_agent_name'] = null;
            // $item['from_agent_email'] = null;
            $item['is_sender'] = null;
            $item['file_name'] = null;
            $item['file_type'] = null;
            $item['file_path'] = null;
            $item['file_url'] = null;
            $item['has_read'] = false;
            $item['reply_is_deleted'] = false;
            $item['meeting_url'] = null;
            $item['is_meeting'] = false;

            $memberReadDate = $item['read_conversation_relation']->isNotEmpty() ? $item['read_conversation_relation'][0]['read_date'] : null;
            if($memberReadDate) {
                $has_read_status = Carbon::create($memberReadDate)->greaterThanOrEqualTo($item['formatted_date']);
                if($has_read_status)
                    $item['has_read'] = true;
            }
            unset($item['read_conversation_relation']);
        });

        $arr_data_chats = $chat_room->toArray();
        $list_chat = array_values($arr_data_chats);
        $data['list'] = $list_chat;
        // end of filter and mapping for response data

        // count unread chat list
        $unread_list = $chat_room->filter(function ($item, $key) {
            if (!$item['has_read'])
                return $item;
        });
        $data['chat_count'] =  !empty($chat_room) ? $chat_room->count() : 0;
        $data['unread_chat'] = $unread_list->count();
        $data['unread_bubble_chat'] = 0; // set to zero

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->successResponse($data, __('messages.request.error'));
        }
        return $result;
    }

    /**
     * Add unread_count value to chat by chat_id
     * or
     * Reset unread_count
     * Used in internal chat (agent to agent and group chat in a company)
     *
     * @param Array $request = ['chat_id' => ''] | null
     * @param String $type = null|reset_unread
     */
    public function countUnreadChatByID($request, $type = null)
    {
        $current_user = null;
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
                $current_user_company_id = $current_user->id;
            }
        } else {
            // handle seeder
            $current_user_company_id = isset($request['company_id']) && !empty($request['company_id']) ? $request['company_id'] : null;
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user['id'] = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        // check if chat exists
        $chat = $this->internal_chat_model->where('chat_id', $request['chat_id'])->first();
        if (empty($chat))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        // update read chat time
        $update_read = $chat->agentsInReadConv()->syncWithoutDetaching([
            $current_user['id'] => [
                'chat_id' => $request['chat_id'],
                'read_date' => now()
            ]
        ]);

        // $chat_detail = $this->showBubbleChatByChatId(['chat_id' => $request['chat_id']], 'only-latest-chat');
        // $update = $chat_detail;
        // if ($chat_detail['data'] != null) {

        //     $msg = $chat_detail['data']['internal_chat_replies']['data'];
        //     if ( isset($msg) && !empty($msg) ) {
        //         $chat_detail['message'] = $msg[0]['message'];
        //         $chat_detail['agent_name'] = $msg[0]['agent_name'];
        //         $chat_detail['agent_email'] = $msg[0]['agent_email'];
        //         $chat_detail['is_sender'] = $msg[0]['is_sender'];
        //         $chat_detail['file_name'] = $msg[0]['file_name'];
        //         $chat_detail['file_type'] = $msg[0]['file_type'];
        //         $chat_detail['file_path'] = $msg[0]['file_path'];
        //         $chat_detail['file_url'] = $msg[0]['file_url'];
        //     }

        //     $update = $chat_detail['data'];
        // }

        $update = true;

        if ($update) {
            $result = $this->successResponse($update, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
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
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $query = $this->chat_group_model->with('company.company_detail')->where('uuid', $current_user_company_uuid);
        if (!empty($type) && $type == 'agent')
            $query = $query->where('created_by', $current_user->id);
        $data = $query->orderBy('created_at', 'desc')->get();

        $data->map(function ($item, $key) {
            if (!empty($item['created_at'])) {
                $date = $item['created_at'];
                $item['formatted_date'] = dateTimeFormat($date->toDateTimeString(), 'Y-m-d');
                $item['created_date'] = $item['formatted_date'];
            }

            $item['company_name'] = null;
            if (!empty($item['company'])) {
                if (!empty($item['company']['company_detail'])) {
                    $item['company_name'] = $item['company']['company_detail']['company_name'];
                    unset($item['company']);
                }
            }

            if (isset($item['icon'])) {
                $avatar_url = !empty($item['icon']) ? parseFileUrl($item['icon']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['icon'] = $avatar_url;
            }
        });

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->successResponse($data, __('messages.request.error'));
            // $result = $this->errorResponse(null, __('messages.request.error') );
        }
        return $result;
    }

    public function destroy($id)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
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

        if (empty($data))
            return $this->errorResponse(null, __('messages.delete.error') . " " . __('messages.data_not_found'));

        if (!empty($data['icon'])) {
            if (Storage::disk()->exists($data['icon'])) {
                $delete = Storage::delete($data['icon']);
            }
        }

        $remove = $data->delete();
        if ($remove) {
            $result = $this->successResponse($remove, __('messages.delete.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.delete.error'));
        }
        return $result;
    }

    public function show($id)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data = $this->chat_group_model
            ->with(['company.company_detail', 'group_participants'])
            ->where('uuid', $current_user_company_uuid)
            ->where('created_by', $current_user->id)
            ->where('id', $id)
            ->first();

        if (empty($data))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        if (!empty($data['created_at'])) {
            $date = $data['created_at'];
            $data['formatted_date'] = dateTimeFormat($date->toDateTimeString(), 'Y-m-d');
            $data['created_date'] = $data['formatted_date'];
        }

        $data['company_name'] = null;
        if (!empty($data['company'])) {
            if (!empty($data['company']['company_detail'])) {
                $data['company_name'] = $data['company']['company_detail']['company_name'];
                unset($data['company']);
            }
        }

        if (isset($data['icon'])) {
            $avatar_url = !empty($data['icon']) ? parseFileUrl($data['icon']) : null;
            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($data['name'] . '-' . $data['id'], 'name');
            $data['icon'] = $avatar_url;
        }

        $data['participants'] = [];
        $participants = $data['group_participants'];
        if ($participants->isNotEmpty()) {
            $participants = $participants->map(function ($item, $key) {
                $item['agent_name'] = !empty($item->agent) ? $item->agent->name : null;
                unset($item['agent']);

                return $item;
            });
            unset($data['group_participants']);

            $data['participants'] = $participants;
        }

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error'));
        }
        return $result;
    }

    public function update($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data = $this->chat_group_model
            ->where('uuid', $current_user_company_uuid)
            ->where('created_by', $current_user->id)
            ->where('id', $request['id'])
            ->first();

        if (empty($data))
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        if (isset($request['icon'])) {
            $image = null;
            if (!empty($request['icon']) && ($request['icon'] != "null")) {
                $image = uploadFile($request['icon'], 'public/assets/images/uploads/chat-group-icon'); // upload file
            }

            if (Storage::disk()->exists($data['icon'])) {
                $delete = Storage::delete($data['icon']); // delete old file
            }
            $request['icon'] = $image ? $image : null; // update data
        }

        unset($request['id']);
        $update = $data->update($request);

        if ($update) {
            if (!empty($data['icon'])) {
                $data['icon'] = parseFileUrl($data['icon']);
            }
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error'));
        }
        return $result;
    }

    public function getAgentListInCompany($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
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
            'avatar'
        ];

        $company_data = $this->agent_model
            ->select($selected_fields)
            ->with(['company_detail'])
            ->where('id', $current_user_company_id)
            ->where('id', '<>', $current_user->id);

        $query = $this->agent_model
            ->select($selected_fields)
            ->with(['companyDetailByIdCompany'])
            ->where('id_company', $current_user_company_id)
            ->where('id', '<>', $current_user->id);

        if (isset($request['name']) && !empty($request['name'])) {
            $query = $query->where('name', 'like', '%' . $request['name'] . '%');
            $company_data = $company_data->where('name', 'like', '%' . $request['name'] . '%');
        }

        if (isset($request['email']) && !empty($request['email'])) {
            $query = $query->where('email', 'like', '%' . $request['email'] . '%');
            $company_data = $company_data->where('email', 'like', '%' . $request['email'] . '%');
        }

        if (isset($request['phone']) && !empty($request['phone'])) {
            $query = $query->where('phone', 'like', '%' . $request['phone'] . '%');
            $company_data = $company_data->where('phone', 'like', '%' . $request['phone'] . '%');
        }

        $agents = $query->orderBy('name', 'asc')->get();

        $agents->map(function ($item, $key) {
            $item['company_name'] = null;
            if (!empty($item['companyDetailByIdCompany'])) {
                $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
                unset($item['companyDetailByIdCompany']);
            }

            if (isset($item['avatar'])) {
                $avatar_url = !empty($item['avatar']) ? parseFileUrl($item['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['avatar'] = $avatar_url;
            }
        });

        $data = $agents;
        $arr_agents = [];
        if ($data->isNotEmpty()) {
            $arr_agents = $agents->toArray();
        }

        $arr_company = [];
        $company_data = $company_data->first();
        if (!empty($company_data)) {
            // mapping
            $company_data['company_name'] = null;
            if (!empty($company_data['company_detail'])) {
                $company_data['company_name'] = $company_data['company_detail']['company_name'];
                unset($company_data['company_detail']);
            }

            if (isset($company_data['avatar'])) {
                $avatar_url = !empty($company_data['avatar']) ? parseFileUrl($company_data['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($company_data['name'] . '-' . $company_data['id'], 'name');
                $company_data['avatar'] = $avatar_url;
            }
            $arr_company['company'] = $company_data->toArray(); // prevent override element
            if (!empty($arr_company))
                $data = array_merge($arr_company, $arr_agents);
            $data = array_values($data);
        }

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error'));
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
    public function updateAgentToGroup($request, $type = null)
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
        $group = $this->chat_group_model->where('id', $request['chat_group_id'])->first();
        if (empty($group))
            return $this->errorResponse(null, 'Chat Group error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // request for attach agents
        if ($type == 'attach')
            $update = $group->agentsInChat()->syncWithoutDetaching($assigned_agents);

        // request for detach/remove agents
        if ($type == 'detach')
            $update = $group->agentsInChat()->detach($assigned_agents);

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
            $result = $this->successResponse($return_data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function deleteConversation($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $chat_room = $this->internal_chat_model->where('chat_id', $request['chat_id'])->where('uuid', $current_user_company_uuid)->first();

        if (empty($chat_room))
            return $this->errorResponseWithLog(null, 'Delete Conversation error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        if (!isset($request['id_agent']) && empty($request['id_agent'])) {
            $request['id_agent'] = $current_user->id;
        }

        // $store = $this->internal_chat_joined_history_model->updateOrCreate(
        //     [
        //         'chat_id' => $request['chat_id'],
        //         'id_agent' => $request['id_agent'],
        //     ],
        //     [
        //         'id_chat' => $chat_room->id,
        //         'chat_id' => $request['chat_id'],
        //         'id_agent' => $request['id_agent'],
        //         'removed_date' => now()
        //     ]
        // );

        if ($chat_room->chat_type == 1) {
            $chat_room->timestamps = true;
            $store = $chat_room->agentsInDeletedConv()->syncWithoutDetaching([
                $request['id_agent'] => [
                    'chat_id' => $request['chat_id'],
                    'removed_date' => now(),
                    'conversation_deleted' => true
                ]
            ]);
        } else {
            // update removed date in the latest history
            $last_joined_data = $this->internal_chat_joined_history_model
                ->where('id_agent', $request['id_agent'])
                ->where('chat_id', $request['chat_id'])
                ->latest('id')
                ->first();

            if (!empty($last_joined_data)) {
                $store = $last_joined_data->update(['removed_date' => now()]);
                if ($store) {
                    $store = $last_joined_data; // insert data for success response
                }
            }
        }

        // update read chat time
        $update_read = $chat_room->agentsInReadConv()->syncWithoutDetaching([
            $current_user['id'] => [
                'chat_id' => $request['chat_id'],
                'read_date' => now()
            ]
        ]);

        if ($store) {
            $result = $this->successResponseWithLog($store, __('messages.request.success'), null, 'delete_conversation');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function deleteBubbleChat($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $chat_room = $this->internal_chat_model
            ->with('private_chat_participants')
            ->whereHas('private_chat_participants', function ($query) use ($current_user) {
                $query->where('id_agent', $current_user->id);
            })
            ->where('chat_id', $request['chat_id'])
            ->where('uuid', $current_user_company_uuid)
            ->first();
        if (empty($chat_room))
            return $this->errorResponseWithLog(null, 'Delete Message error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // check chat reply
        if( !isset($request['reply_id']) && empty($request['reply_id']) )
            return $this->errorResponseWithLog(null, 'Delete chat reply error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $existing_reply_data = $this->internal_chat_reply_model
            ->where('chat_id', $chat_room['chat_id'])
            ->where('id', $request['reply_id'])
            ->where('from_agent_id', $current_user->id) // can only be deleted by sender
            ->first();

        if (empty($existing_reply_data))
            return $this->errorResponseWithLog(null, 'Delete chat reply error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // condition for message can not be deleted
        $created_chat_reply = $existing_reply_data->created_at;
        $diff_in_days = Carbon::now()->diffInDays($created_chat_reply);
        if ($diff_in_days >= 1)
            return $this->errorResponseWithLog(null, __('chat.internal_chat.can_not_delete_bubble_chat'));

        $existing_reply_data->timestamps = false;
        $delete = $existing_reply_data->delete(); // use softdeletes

        if ($delete) {
            $result = $this->successResponseWithLog($existing_reply_data, __('messages.request.success'), null, 'delete_conversation');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function detailReadBubbleChat($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $chat_room = $this->internal_chat_model
            ->with(['read_conversation_relation'], function ($q) use ($current_user) {
                // if(!$chat_room->chat_group_relation)
                    $q->where('id_agent', '<>', $current_user->id); // show all participant in chat group detail
                $q->orderBy('id', 'desc');
            })
            ->with('private_chat_participants')
            ->whereHas('private_chat_participants', function ($query) use ($current_user) {
                $query->where('id_agent', $current_user->id);
            })
            ->where('chat_id', $request['chat_id'])
            ->where('uuid', $current_user_company_uuid)
            ->first();
        if (empty($chat_room))
            return $this->errorResponseWithLog(null, 'Show Detail Message error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $latest_bubble = $chat_room->latest_internal_chat_reply;
        $has_read_by = [];
        if(!empty($chat_room->read_conversation_relation)) {
            $readExceptMe = $chat_room->read_conversation_relation;

            foreach($readExceptMe as $key => $val) {
                $memberReadDate = $val['read_date'];
                $has_read_status = Carbon::create($memberReadDate)->greaterThanOrEqualTo($latest_bubble['created_at']);

                if($has_read_status) { // && ($val['id_agent'] != $current_user->id)
                    $has_read_by[$key]['has_read'] = $has_read_status;
                    $has_read_by[$key]['read_date'] = $val['read_date'];

                    $has_read_by[$key]['id_agent'] = $val['id_agent'];
                    if(isset($val['agent']) && !empty($val['agent'])) {
                        $has_read_by[$key]['name'] = $val['agent']['name'];
                        $has_read_by[$key]['email'] = $val['agent']['email'];

                        // set avatar
                        $avatar_url = !empty($val['agent']['avatar']) ? parseFileUrl($val['agent']['avatar']) : null;
                        $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($val['agent']['name'] . '-' . $val['agent']['id'], 'name');
                        $has_read_by[$key]['avatar'] = $avatar_url;
                    }
                }
            }
        }

        if ($has_read_by) {
            $result = $this->successResponseWithLog($has_read_by, __('messages.request.success'), null, 'delete_conversation');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * @param String $type = pin|unpin
     */
    public function updatePinBubbleChat($request, $type = null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $pin_reply = ($type == 'unpin') ? 0 : 1;
        $chat_room = $this->internal_chat_model
            ->with('private_chat_participants')
            ->whereHas('private_chat_participants', function ($query) use ($current_user) {
                $query->where('id_agent', $current_user->id);
            })
            ->where('chat_id', $request['chat_id'])
            ->where('uuid', $current_user_company_uuid)
            ->first();
        if (empty($chat_room))
            return $this->errorResponseWithLog(null, 'Pin message error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        // check chat reply
        if( !isset($request['reply_id']) && empty($request['reply_id']) )
            return $this->errorResponseWithLog(null, 'Pin message error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $existing_reply_data = $this->internal_chat_reply_model
            ->where('chat_id', $chat_room['chat_id'])
            ->where('id', $request['reply_id'])
            // ->where('from_agent_id', $current_user->id) // can only be updated by chat participant
            ->first();

        if (empty($existing_reply_data))
            return $this->errorResponseWithLog(null, 'Pin message error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $existing_reply_data->timestamps = false;
        $update = $existing_reply_data->update(['is_pinned' => $pin_reply]);
        if ($update) {
            if($existing_reply_data['is_pinned']) {
                $existing_reply_data['is_pinned'] = true;
            } else {
                $existing_reply_data['is_pinned'] = false;
            }

            $result = $this->successResponseWithLog($existing_reply_data, __('messages.request.success'), null, 'pin_message');
        } else {
            $result = $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function getNotification($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $notifs = $this->internal_chat_notification_model->with('actionToAgentRelation')->where('id_agent', $current_user['id'])->orderByDesc('id')->limit(10)->get();

        $notifs->map(function ($item, $key) {
            $item['action_from_agent_name'] = !empty($item['actionFromAgentRelation']) ? $item['actionFromAgentRelation']['name'] : null;
            $item['action_to_agent_name'] = !empty($item['actionToAgentRelation']) ? $item['actionToAgentRelation']['name'] : null;

            $item['group_name'] = __('chat.internal_chat_label.group_not_found');
            if (!empty($item->internal_chat)) {
                if (!empty($item->internal_chat->chat_group_relation)) {
                    if (!empty($item->internal_chat->chat_group_relation->chat_group)) {
                        $item['group_name'] = $item->internal_chat->chat_group_relation->chat_group->name;
                    }
                }
            }
            unset($item['actionToAgentRelation'], $item['actionFromAgentRelation'], $item['internal_chat']);
        });

        // count unread notifications
        $unread_list = $notifs->filter(function ($item, $key) {
            if (!$item['is_read']) {
                return $item;
            }
        });
        $data['unread_notif'] = $unread_list->count();
        $data['list'] = $notifs;

        // Show Settings Value
        $data['settings'] = [];
        $setting_service = SettingService::getInstance();
        $setting_rows = $setting_service->showMySetting(null);
        if($setting_rows && isset($setting_rows['code']) && $setting_rows['code'] == 200)
            $data['settings'] = $setting_rows['data'];

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function updateNotificationByField($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $notif_exists = $this->internal_chat_notification_model->where('id_agent', $current_user['id'])->get();
        if (empty($notif_exists))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        $unread_notifs = $notif_exists->where('is_read', 0);
        $update = false;
        if (!empty($unread_notifs) && !empty($request)) {
            $inputData = [];

            foreach ($request as $field => $field_value) {
                if (in_array($field, $this->internal_chat_notification_model->fillable)) {
                    $inputData[$field] = $field_value;
                }
            }
            $update = $this->internal_chat_notification_model->where('id_agent', $current_user['id'])->where('is_read', 0)->update($inputData);
        } else {
            $update = true;
        }

        if ($update) {
            $result = $this->successResponse($update, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * @param Array $request = ['keyword' => '']
     */
    public function searchMessage($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $list = $this->internal_chat_reply_model
        ->whereHas('internal_chat.private_chat_participants', function($qry) use ($current_user) {
            $qry->whereIn('id_agent', [$current_user->id]);
        })
        ->where(function ($subQ) use ($request) {
            $subQ->orWhere('message', 'like', '%' . $request['keyword'] . '%')
            ->orWhere('meeting_url', 'like', '%' . $request['keyword'] . '%');
        })
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

        $list = $list->filter(function ($msg, $key) use ($current_user) {
            $check_delete2 = $msg->internal_chat->deleted_conversation->where('id_agent', $current_user->id)->first();
            $available_deleted_date = $check_delete2['removed_date'] ? $check_delete2['removed_date'] : $check_delete2['added_date'];

            if($msg['updated_at'] >= $available_deleted_date) {
                return $msg;
            }
        })
        ->map(function ($msg, $key) use ($current_user) {
            $msg['unique_id'] = 'rply-'.$msg['id'].$msg['chat_id']; // unique identifier for frontend, prevent duplicate id from chat reply

            // chat data
            $msg['browser'] = $msg->internal_chat->browser;
            $msg['chat_type'] = $msg->internal_chat->chat_type;
            $msg['chat_type_name'] = $msg->internal_chat->chat_type_name;
            $msg['device'] = $msg->internal_chat->device;
            $msg['ip'] = $msg->internal_chat->ip;
            $msg['status'] = $msg->internal_chat->status;
            $msg['status_name'] = $msg->internal_chat->status_name;
            $msg['uuid'] = $msg->internal_chat->uuid;

            $msg['member_count'] = $msg->internal_chat->private_chat_participants->count();
            $msg['display_chat_name'] = null;
            $msg['display_chat_email'] = null;
            $msg['display_chat_image'] = null;
            $msg['online'] = 0;
            $msg['id_chat_group'] = null;
            $get_member = null;

            switch ($msg['chat_type']) {
                case 1:
                    foreach ($msg->internal_chat->private_chat_participants as $key => $prt) {
                        if ($prt['id_agent'] != $current_user->id) {

                            $selected_agent = $prt['agent'];
                            if ($prt['agent'] == null) {
                                // means data is not using current user logged in
                                $other_agent = $this->agent_model->find($prt->id_agent);
                                $selected_agent = $other_agent;
                            }
                            $msg['receiver_id'] = isset($selected_agent) && !empty($selected_agent) ? $selected_agent['id'] : null;
                            $msg['display_chat_name'] = isset($selected_agent) && !empty($selected_agent) ? $selected_agent['name'] : __('chat.internal_chat_label.account_not_found');
                            $msg['display_chat_email'] = isset($selected_agent) && !empty($selected_agent) ? $selected_agent['email'] : __('chat.internal_chat_label.account_not_found');
                            $msg['online'] = isset($selected_agent) && !empty($selected_agent) ? $selected_agent['online'] : 0;

                            $avatar_url = null;
                            if($selected_agent) {
                                $avatar_url = !empty($selected_agent) && !empty($selected_agent['avatar']) ? parseFileUrl($selected_agent['avatar']) : null;
                                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($selected_agent['name'] . '-' . $selected_agent['id'], 'name');
                            }
                            $msg['display_chat_image'] = $avatar_url;
                        }
                    }
                    break;

                case 2:
                    if (!empty($msg->internal_chat->chat_group_relation)) { // check if chat group relation exists
                        if (!empty($msg->internal_chat->chat_group_relation->chat_group)) {
                            $selected_group = $msg->internal_chat->chat_group_relation->chat_group;
                            $get_member = $selected_group;
                        } else {
                            // get data group if detail is empty
                            $selected_group = $this->chat_group_model->find($msg->internal_chat->chat_group_relation->id_chat_group);
                            $get_member = $selected_group;
                        }
                        $msg['id_chat_group'] = isset($selected_group['id']) && !empty($selected_group['id']) ? $selected_group['id'] : null;
                        $msg['display_chat_name'] = isset($selected_group['name']) && !empty($selected_group['name']) ? $selected_group['name'] : __('chat.internal_chat_label.group_not_found');
                        $msg['display_chat_image'] = getGravatar($msg['display_chat_name']);
                        if($selected_group) {
                            $avatar_url = !empty($selected_group['icon']) ? parseFileUrl($selected_group['icon']) : null;
                            $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($selected_group['name'] . '-' . $selected_group['id'], 'name');
                            $msg['display_chat_image'] = $avatar_url;
                        }
                    }
                    // set member participants
                    $msg['receiver_id'] = null;
                    $msg['participants'] = [];
                    if (!empty($get_member)) {
                        $group_participants = $get_member->agentsInGroup;
                        $participant = [];
                        if ($group_participants->isNotEmpty()) {
                            foreach ($group_participants as $key => $group_agent) {
                                $participant[$key]['agent_id'] = !empty($group_agent->id) ? $group_agent->id : null;
                                $participant[$key]['agent_uuid'] = !empty($group_agent->uuid) ? $group_agent->uuid : null;
                                $participant[$key]['agent_email'] = !empty($group_agent->email) ? $group_agent->email : null;
                            }
                            $msg['participants'] = array_values($participant);
                        }
                    }
                    break;
            }
            unset($msg['internal_chat']);

            if (!empty($msg['created_at'])) {
                $date = $msg['created_at'];
                $msg['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                $msg['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
            }

            if ($msg['deleted_at']) {
                $msg['message'] = __('chat.internal_chat_label.deleted_bubble_chat');
            }

            $msg['is_sender'] = false;
            $msg['from_agent_name'] = __('chat.internal_chat_label.account_not_found');
            if (!empty($msg->agent)) {
                if ($msg->agent->id == $current_user->id)
                    $msg['is_sender'] = true;
            }
            $msg['from_agent_name'] = $msg->agent->name ?: $msg['from_agent_name'];
            unset($msg['agent']);

            // file
            $msg['file_name'] = null;
            $msg['file_path'] = null;
            $msg['file_type'] = null;
            $msg['file_url'] = null;
            $chat_file = $msg->internal_file_reply;
            if (!empty($chat_file)) {
                $msg['file_name'] = $chat_file['name'] ?: null;
                $msg['file_type'] = $chat_file['type'] ?: null;
                $msg['file_path'] = $chat_file['path'] ?: null;
                $msg['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path']) : null;
            }
            unset($msg['internal_file_reply']);

            return $msg;
        });
        $list = array_values( $list->toArray() );

        if ($list) {
            $result = $this->successResponse($list, __('messages.request.success'));
        } else {
            $result = $this->successResponse([], __('messages.request.error') . " " . __('messages.data_not_found')); // only change the response code
        }
        return $result;
    }

    /**
     * This function use to complete return data in function showBubbleChatByChatId
     * Used in search message feature
     *
     * - Get remaining reply id (bubble chat id)
     * - Get which page should be retrieved
     */
    public function showBubbleChatByBubbleId($request, $type = null)
    {
        $current_user = (object)[];
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            // handle seeder
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user->id = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        $set_per_page = isset($request['set_per_page']) ? $request['set_per_page'] : 20;

        // start query to db
        $chat_room = $this->internal_chat_model->where('uuid', $current_user_company_uuid)
            ->where('chat_id', $request['chat_id']);

        // check if agent has deleted conversation
        $check_delete = $chat_room->with('deleted_conversation', function ($q) use ($current_user) {
            $q->where('id_agent', $current_user->id);
            $q->orderBy('id', 'desc');
        })->first();

        # get bubble chat
        $chat_room = $chat_room->with('internal_chat_replies', function ($reply) use ($check_delete) {
            // filter data for show chat only in the time after agent removed conversation
            if (isset($check_delete['deleted_conversation']) && $check_delete->deleted_conversation->isNotEmpty()) {
                $reply->select('id', 'updated_at', 'chat_id');
                if ($check_delete['deleted_conversation'][0]['removed_date']) {
                    $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['removed_date']);
                } else {
                    $reply->where('updated_at', '>=', $check_delete['deleted_conversation'][0]['added_date']);
                }
                $reply->orderBy('updated_at', 'desc');
            }
        })
        ->first();
        // end of query to db

        # search result
        $reply_index = null;
        // $total_bubbles = 0;
        $selected_page = null;
        $id_remaining_bubbles_to_show = [];
        if($chat_room->internal_chat_replies->isNotEmpty()) {
            $arr_bubbles = $chat_room->internal_chat_replies->toArray();
            $reply_index = array_search($request['reply_id'],
            array_column($arr_bubbles, 'id') );
            $total_bubbles = $chat_room['internal_chat_replies']->count();
            $total_page = $total_bubbles/$set_per_page;
            $total_page = ceil($total_page);
            $selected_page = $reply_index/$set_per_page;
            $selected_page = (int) $selected_page+1;

            $remaining_bubbles_to_show = array_slice($arr_bubbles, 0, $reply_index);
            $id_remaining_bubbles_to_show = array_column($remaining_bubbles_to_show, 'id');
        }

        $result = [
            'reply_id' => $request['reply_id'],
            'reply_index' => $reply_index,
            // 'total_bubbles' => $total_bubbles,
            'selected_page' => $selected_page, // Get which page should be retrieved
            'id_remaining_bubbles_to_show' => $id_remaining_bubbles_to_show // Get remaining reply id (bubble chat id)
        ];

        return $result;
    }

    /**
     * (Improved)
     * Show list pinned message by chat id (chat room)
     */
    public function listPinnedChat($request, $type = null)
    {
        $current_user = (object)[];
        $current_user_roles = null;
        $current_user_company_uuid = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }
        } else {
            // handle seeder
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
            $current_user->id = isset($request['current_user_id']) && !empty($request['current_user_id']) ? $request['current_user_id'] : null;
        }

        $check_delete = \App\Models\InternalChatJoinedHistory::where('chat_id', $request['chat_id'])->where('id_agent', $current_user->id)->first();

        # get bubble chat
        $bubbles = $this->internal_chat_reply_model
        ->where('chat_id', $request['chat_id'])
        ->where('is_pinned', 1)
        ->when($check_delete, function ($reply) use ($check_delete) {
            $reply->with('internal_file_reply');
            $reply->with('has_parent');

            if ($check_delete['removed_date']) {
                $reply->where('updated_at', '>=', $check_delete['removed_date']);
            } else {
                $reply->where('updated_at', '>=', $check_delete['added_date']);
            }
        })
        ->orderBy('updated_at', 'desc')
        ->get();

        # mapping data
        $poll_service = null;
        // $poll_service = PollService::getInstance();

        $bubbles = $bubbles->map(function ($msg, $key) use ($current_user, $poll_service) {
            $msg['unique_id'] = 'rply-'.$msg['id'].$msg['chat_id']; // unique identifier for frontend, prevent duplicate id from chat reply

            if (!empty($msg['created_at'])) {
                $date = $msg['created_at'];
                $msg['formatted_date'] = dateTimeFormat($date->toDateTimeString());
                $msg['formatted_time'] = dateTimeFormat($date->toDateTimeString(), 'H:i');
            }

            if ($msg['deleted_at']) {
                $msg['message'] = __('chat.internal_chat_label.deleted_bubble_chat');
            }

            if ($msg['is_pinned']) {
                $msg['is_pinned'] = true;
            } else {
                $msg['is_pinned'] = false;
            }

            $msg['agent_id'] = '';
            $msg['agent_name'] = '';
            $msg['agent_email'] = '';
            $msg['is_sender'] = false;
            if (!empty($msg->agent)) {
                $msg['agent_id'] = $msg->agent->id;
                $msg['agent_name'] = $msg->agent->name;
                $msg['agent_email'] = $msg->agent->email;

                if ($msg->agent->id == $current_user->id)
                    $msg['is_sender'] = true;
            }
            unset($msg['agent']);

            // file reply
            $msg['file_name'] = null;
            $msg['file_type'] = null;
            $msg['file_path'] = null;
            $msg['file_url'] = null;
            $chat_file = $msg['internal_file_reply'];
            if (!empty($chat_file)) {
                $msg['file_name'] = $chat_file['name'] ?: null;
                $msg['file_type'] = $chat_file['type'] ?: null;
                $msg['file_path'] = $chat_file['path'] ?: null;
                $msg['file_url'] = $chat_file['path'] ? parseFileUrl($chat_file['path']) : null;
            }
            unset($msg['internal_file_reply']);

            // chat room member read time
            $msg['has_read'] = false;
            $has_read_by = [];
            $msg['has_read_by'] = [];

            // has parent/reply to bubble chat
            $msg['has_parent_reply'] = false;
            $msg['parent_reply_id'] = null;
            $msg['parent_reply_message'] = null;
            $msg['parent_reply_from_agent_id'] = null;
            $msg['parent_reply_from_agent_name'] = null;
            $msg['parent_reply_file_name'] = null;
            $msg['parent_reply_file_type'] = null;
            $msg['parent_reply_file_path'] = null;
            $msg['parent_reply_file_url'] = null;
            $msg['parent_is_meeting'] = false;
            $msg['parent_meeting_url'] = null;
            if(!empty($msg['has_parent'])) {
                $msg['has_parent_reply'] = true;
                $msg['parent_reply_id'] = $msg['has_parent']['id'];
                $msg['parent_reply_message'] = $msg['has_parent']['message'];
                $msg['parent_reply_from_agent_id'] = $msg['has_parent']['from_agent_id'];
                $msg['parent_reply_from_agent_name'] = isset($msg['has_parent']['agent']) && !empty($msg['has_parent']['agent']) ? $msg['has_parent']['agent']['name'] : __('chat.internal_chat_label.account_not_found');
                $msg['parent_is_meeting'] = $msg['has_parent']['is_meeting'];
                $msg['parent_meeting_url'] = $msg['has_parent']['meeting_url'];

                // parent file
                $parent_file = $msg->has_parent->internal_file_reply;
                $msg['parent_reply_file_name'] = isset($parent_file['name']) ? $parent_file['name'] : null;
                $msg['parent_reply_file_type'] = isset($parent_file['type']) ? $parent_file['type'] : null;
                $msg['parent_reply_file_path'] = isset($parent_file['path']) ? $parent_file['path'] : null;
                $msg['parent_reply_file_url'] = isset($parent_file['path']) ? parseFileUrl($parent_file['path']) : null;
            }
            unset($msg['has_parent']);

            // polls/vote
            $msg['has_poll'] = false;
            // if (!$msg['deleted_at']) {
            //     $poll_data = $msg->poll;
            //     if(!empty($poll_data)) {
            //         $msg['has_poll'] = true;
            //         $current_choice_data = $poll_data->poll_choices;
            //         $current_answer_data = $poll_data->poll_answers;
            //         $choice_with_answer = $poll_service->countPolling($current_choice_data, $current_answer_data); // mapping and count polling choice with polling answer
            //         unset($poll_data['poll_answers']);
            //     }
            // } else {
            //     $msg['poll'] = null;
            // }

            return $msg;
        });

        $bubbles = array_values($bubbles->toArray());
        $bubbles = collect($bubbles);

        if ($bubbles) {
            $result = $this->successResponse($bubbles, __('messages.request.success'));
        } else {
            $result = $this->successResponse($bubbles, __('messages.request.error'));
        }
        return $result;
    }
}
