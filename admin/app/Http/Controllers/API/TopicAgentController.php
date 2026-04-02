<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Topic;
use App\Models\TopicAgent;
use App\Http\Controllers\Controller;
use App\Http\Controllers\API\ApiController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TopicAgentController extends ApiController
{

    public $successStatus = 200;

    public function insert(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_agent' => 'required|array',
                'id_topic' => 'required|integer',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 401);
            }

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

            $topic = Topic::where('id', $request->id_topic)->first();
            $assigned_participants = [];
            if( is_array($request->id_agent) ) {
                foreach($request->id_agent as $val) {
                    $assigned_participants[$val] = [ 'idagent' =>  $current_user_company_id];
                }
            } else {
                $assigned_participants[$request->id_agent] = [ 'idagent' =>  $current_user_company_id];
            }
            $update = $topic->agentsInTopic()->syncWithoutDetaching($assigned_participants); // asign agents to topic

            createActivityLog('User has created Topic Agent', [
                'log_name' => 'topic_agent',
                'request_sent' => $request->all(),
                'response' => $update
            ]);

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
            $user = Auth::user();
            // for company
            if($user->id_roles == 2) {
                $topic = Topic::where('id_agent', $user->id);
                $topic = $topic->orderByDesc('id')->get();
            } else {
                // for staff/agent
                $topic = TopicAgent::with('topic');
                $topic = $topic->where('id_agent', $user->id);
                if ($request->id_topic) {
                    $topic = $topic->where('id_topic', $request->id_topic);
                }
                $topic = $topic->orderByDesc('id')->get();

                if(!empty($topic)) {
                    $topic->map(function($item, $key) {
                        if( !empty($item['topic']) ) {
                            $item['name'] = $item['topic']['name'];
                            $item['description'] = $item['topic']['description'];
                            $item['status'] = $item['topic']['status'];
                            $item['status_name'] = $item['topic']['status_name'];
                        }
                        unset($item['topic']);
                    });
                }
            }

            return $this->successResponse($topic, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    public function detail(Request $request)
    {
        try {
            $id = Auth::user()->id;
            $topic = Topic::with(['topic_agents.agent'], function($q) {
                $q->orderBy('agent.name', 'asc');
            })->where('id', $request->id)->where('id_agent', $id)->first();
            if( !empty($topic->topic_agents) ) {
                $topic->topic_agents->map(function($item, $key) {
                    if( !empty($item->agent) ) {
                        $item['agent_name'] = $item->agent->name ?: null;
                        $item['agent_email'] = $item->agent->email ?: null;
                    }
                    unset($item['agent']);
                });
            }

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $topic
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
            $current_user = null;
            if(Auth::check()) {
                $current_user = Auth::user();
            }
            $current_user_roles = $current_user ? $current_user->id_roles : null;
            $current_user_department = $current_user ? $current_user->id_department : null;
            $current_user_company_id = null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1)
                return $this->errorResponse(null, __('auth.not_permitted'));

            $current_user_company_id = $current_user->id;
            TopicAgent::where('id', $request->id)->where('idagent', $current_user_company_id)->first()->delete();
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

    public function listAgent(Request $request){
        try{
            $id = Auth::user()->id;
            $topic = DB::select("SELECT * FROM agent WHERE id_company='".$id."' AND id NOT IN (SELECT id_agent FROM chat_topic_agent WHERE idagent='".$id."' AND id_topic='".$request->id_topic."')");

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $topic
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

}
