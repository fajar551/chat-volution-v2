<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Labels;
use App\Models\InternalChat;
use App\Models\Poll;
use App\Models\PollAnswer;
use App\Models\PollChoice;
use App\Services\InternalChatService;
use App\Traits\FormatResponserTrait;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class PollService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        InternalChat $internal_chat_model,
        Poll $poll_model,
        PollAnswer $poll_answer_model,
        PollChoice $poll_choice_model
    ) {
        $this->agent_model = $agent_model;
        $this->poll_model = $poll_model;
        $this->poll_answer_model = $poll_answer_model;
        $this->poll_choice_model = $poll_choice_model;
        $this->internal_chat_model = $internal_chat_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new InternalChat(),
            new Poll(),
            new PollAnswer(),
            new PollChoice()
        );
    }

    public function store($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $carbon_date = Carbon::now();
        $carbon_date = $carbon_date->addDay();

        // check whether chat_id is present (chat room)
        $chat_room = null;
        if(isset($request['chat_id']) && !empty($request['chat_id'])) {
            $chat_room = $this->internal_chat_model->where('uuid', $current_user_company_uuid)
                ->where('chat_id', $request['chat_id'])
                // ->with('private_chat_participants')
                ->with('chat_group_relation')
                ->whereHas('chat_group_relation')
                ->first();
            if (empty($chat_room)) {
                return $this->errorResponseWithLog(null, 'Chat error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));
            }
        }

        $store = $this->poll_model->create([
            'description' => isset($request['description']) && !empty($request['description']) ? $request['description'] : null,
            'created_by' => $current_user->id,
            'status' => 1,
            'expired_at' => isset($request['expired_at']) && !empty($request['expired_at']) ? $request['expired_at'] : $carbon_date,
            'id_chat' => $chat_room ? $chat_room['id'] : null,
            'chat_id' => $chat_room ? $chat_room['chat_id'] : null,
        ]);

        if($store) {
            $choices = [];
            foreach($request['choices'] as $key => $val) {
                $choices[] = new PollChoice(['choice' => $val]);
            }
            $save_choice = $store->poll_choices()->saveMany($choices);

            $store['poll_choices'] = $store->poll_choices;
        }

        if(isset($request['chat_id']) && !empty($request['chat_id']) && !empty($chat_room->chat_group_relation)) {
            $request['group_id'] = $chat_room->chat_group_relation->id;
            $request['message'] = $store['description'];
            $internal_chat_service = InternalChatService::getInstance();
            $rep = $internal_chat_service->replyChatToGroup($request);

            if($rep['data']) {
                $update_poll = $this->poll_model->find($store['id'])->update([ 'chat_reply_id' => $rep['data']['id'] ]); // update chat reply

                $poll_data = $store;
                $store = $rep['data'];
                $store['has_poll'] = true;
                $store['poll'] = $poll_data;
                $store['poll']['poll_choices'] = $poll_data->poll_choices->map(function($item) {
                    $item['number_of_voters'] = 0;
                    $item['percentage'] = 0;
                    $item['voted_by'] = [];
                    return $item;
                });
            }
        }


        if ($store) {
            $result = $this->successResponse($store, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function submitChoice($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $existing_poll = $this->poll_model
            ->with('poll_choices')
            ->whereHas('poll_choices', function($q) use ($request) {
                $q->where('id', $request['choice_id']);
            })->find($request['poll_id']);
        if (empty($existing_poll))
            return $this->errorResponseWithLog(null, 'Poll error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $expired = Carbon::now()->greaterThan($existing_poll['expired_at']);
        if ($expired)
            return $this->errorResponseWithLog(null, __('messages.poll.expired'));

        if($existing_poll->internal_chat_reply) {
            $participants = $existing_poll->internal_chat->private_chat_participants->where('id_agent', $current_user['id']);
            if($participants->isEmpty())
                return $this->errorResponseWithLog(null, __('messages.poll.not_permitted'));
        }

        $assign_answer = [];
        $assign_answer[$current_user->id] = [
            'choice_id' => $request['choice_id']
        ];
        $existing_poll->answerOfPoll()->syncWithoutDetaching($assign_answer);

        $choice_data = $existing_poll->poll_choices;
        $answer_data = $existing_poll->poll_answers;
        $choice_with_answer = $this->countPolling($choice_data, $answer_data); // mapping and count polling choice with polling answer
        unset($existing_poll['poll_answers']); // remove unnecessary data

        if ($existing_poll) {
            $result = $this->successResponse($existing_poll, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * @param $choice_data, $answer_data = collection of model/result of model relationship
     * @return $result = collection of model
     */
    public function countPolling($choice_data, $answer_data)
    {
        $choice_data = $choice_data;
        $answer_data = $answer_data;
        $total_answer_count = $answer_data->count();
        $result = [];

        $choice_data->map(function($item) {
            $item['number_of_voters'] = 0;
            $item['percentage'] = 0;
            $item['voted_by'] = [];
            return $item;
        });
        $result = $choice_data->keyBy('id');

        $grouped_answer = $answer_data->groupBy('choice_id');
        foreach ($grouped_answer as $key => $val) {
            // get voters/agent data
            $current_answer_voters = $val->map(function($voters) {
                if(!empty($voters->agent)) {
                    return [
                        'agent_name' => $voters->agent->name,
                        'agent_email' => $voters->agent->email,
                        'agent_id' => $voters->agent->id,
                    ];
                }
            });

            // mapping data
            $number_of_voters = $val->count();
            $result[$key]['number_of_voters'] = $number_of_voters;
            $result[$key]['percentage'] = $number_of_voters/$total_answer_count * 100;
            $result[$key]['voted_by'] = $current_answer_voters;
        }

        return $result;
    }

    public function show($id)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $existing_poll = $this->poll_model
            ->with('poll_choices')
            ->whereHas('poll_choices')
            ->find($id);
        if (empty($existing_poll))
            return $this->errorResponseWithLog(null, 'Poll error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $choice_data = $existing_poll->poll_choices;
        $answer_data = $existing_poll->poll_answers;
        $choice_with_answer = $this->countPolling($choice_data, $answer_data); // mapping and count polling choice with polling answer
        unset($existing_poll['poll_answers']); // remove unnecessary data

        if ($existing_poll) {
            $result = $this->successResponse($existing_poll, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function destroy($id)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $existing_poll = $this->poll_model
            ->with('poll_choices')
            ->where('created_by', $current_user['id'])
            ->find($id);
        if (empty($existing_poll))
            return $this->errorResponseWithLog(null, 'Poll error: ' . __('messages.delete.error') . " " . __('messages.data_not_found'));

        $remove = $existing_poll->delete();

        if ($remove) {
            $result = $this->successResponse($remove, __('messages.delete.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.delete.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

}