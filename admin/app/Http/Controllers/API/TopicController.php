<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Topic;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\API\ApiController;
use App\Services\AgentOauthClientService;

class TopicController extends ApiController
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

            $id = Auth::user()->id;
            $topic = new Topic;
            $topic->id_agent = $id;
            $topic->name = $request->name;
            $topic->description = $request->description;
            $topic->save();

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

            $id = Auth::user()->id;
            $topic = Topic::where('id', $request->id)->where('id_agent', $id)->first();
            $topic->name = $request->name;
            $topic->description = $request->description;
            $topic->status = $request->status;
            $topic->save();

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

    public function list(Request $request, AgentOauthClientService $agent_oauth_client_service)
    {

        try {
            if (Auth::check()) {
                $id = Auth::user()->id;
            } else {
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
                $id = $user->id;
            }

            $topic = Topic::where('id_agent', $id)->orderBy('name', 'asc')->get();

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

    public function detail(Request $request)
    {
        try {
            $id = Auth::user()->id;
            $topic = Topic::where('id', $request->id)->where('id_agent', $id)->first();

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
            $id = Auth::user()->id;
            Topic::where('id', $request->id)->where('id_agent', $id)->first()->delete();

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
}
