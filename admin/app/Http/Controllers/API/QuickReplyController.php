<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Agent;
use App\Models\QuickReply;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class QuickReplyController extends Controller
{

    public $successStatus = 200;

    public function insert(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'type' => 'required|integer',
            'shortcut' => 'required|string',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $data = QuickReply::where('shortcut', $request->shortcut)->where('id_agent', $id)->first();
            if(!$data){
                $data = new QuickReply;
                $data->type = $request->type;
                $data->id_agent = $id;
                $data->shortcut = $request->shortcut;
                $data->message = $request->message;
                $data->save();
            }else{
                return response()->json([
                    'code' => 400,
                    'messgae' => 'Shortcut already available'
                ], $this->successStatus);
            }

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
            'shortcut' => 'required|string',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $data = QuickReply::where('id', $request->id)->where('id_agent', $id)->first();
            $data->shortcut = $request->shortcut;
            $data->message = $request->message;
            $data->save();

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

    public function list(Request $request, QuickReply $quickreply_model, Agent $agent_model)
    {
        try {
            $current_user = Auth::user();

            $available_type = [ 1, 2 ];
            $type = null;
            $req_type = strtolower($request->type);
            if($req_type) {
                $type = in_array($req_type, $available_type) ? $req_type : null;
            }

            $current_user_roles = $current_user ? $current_user->id_roles : null;
            $current_user_company_id = null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $agent_model->find($current_user->id_company);
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_id = $current_user->id; // uuid for agent with roles company
            }

            $data = $quickreply_model;
            if( isset($request->q) && !empty($request->q))
                $data = $data->where('shortcut', 'like', '%'.$request->q.'%');

            if($current_user_roles != 2) {
                switch ($type) {
                    case 1:
                        $data = $data->where('type', 1)->where('id_agent', $current_user_company_id);
                        break;

                    case 2:
                        $data = $data->where('id_agent', $current_user->id)->where('type', 2);
                        break;

                    default:
                        $data = $data->where('id_agent', $current_user->id);
                        $data->orWhere(function ($subQ) use ($current_user_company_id, $request) {
                            $subQ->where('type', 1)
                                ->where('id_agent', $current_user_company_id);
                            if( isset($request->q) && !empty($request->q))
                                $subQ->where('shortcut', 'like', '%'.$request->q.'%');
                        })->limit(5);
                        break;
                }
            } else {
                $data = $data->where('id_agent', $current_user->id);
                if($request->type) {
                    $data = $data->where('type', $type);
                } else {
                    $data->orWhere(function ($subQ) use ($current_user_company_id, $request) {
                        $subQ->where('id_agent', $current_user_company_id);
                        if( isset($request->q) && !empty($request->q))
                            $subQ->where('shortcut', 'like', '%'.$request->q.'%');
                    })->limit(5);
                }
            }
            $data = $data->orderBy('id', 'desc')->get();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function detail(Request $request, Agent $agent_model)
    {
        try {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;
            $current_user_company_id = null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $agent_model->find($current_user->id_company);
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_id = $current_user->id; // uuid for agent with roles company
            }

            $data = QuickReply::where('id', $request->id)->where('id_agent', $current_user_company_id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
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
            QuickReply::where('id', $request->id)->where('id_agent', $id)->first()->delete();

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

    /**
     * Get all quick replies for authenticated user (GET method)
     * Used by React frontend for quick reply autocomplete
     */
    public function getAllQuickReplies(Request $request, QuickReply $quickreply_model, Agent $agent_model)
    {
        // Helper function to get CORS headers
        $getCorsHeaders = function($request) {
            $origin = $request->headers->get('Origin');
            $allowedOrigins = [
                'https://v2chat.genio.id',
                'https://admin-chat.genio.id',
                'https://client-chat.genio.id',
                'https://waserverlive.genio.id',
                'https://chatvolution.my.id',
                'http://localhost:3000',
                'http://localhost:8000',
                'http://127.0.0.1:8000',
                'http://localhost:3001',
            ];
            $corsOrigin = in_array($origin, $allowedOrigins) ? $origin : '*';

            return [
                'Access-Control-Allow-Origin' => $corsOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
                'Access-Control-Allow-Credentials' => 'true',
            ];
        };

        try {
            // Handle OPTIONS request for CORS preflight
            if ($request->getMethod() === 'OPTIONS') {
                $headers = $getCorsHeaders($request);
                return response()->json([], 200)->withHeaders($headers);
            }

            $current_user = Auth::user();
            if (!$current_user) {
                $headers = $getCorsHeaders($request);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401)->withHeaders($headers);
            }

            $current_user_roles = $current_user ? $current_user->id_roles : null;
            $current_user_company_id = null;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $agent_model->find($current_user->id_company);
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_id = $current_user->id; // uuid for agent with roles company
            }

            $data = $quickreply_model;

            // Get both personal (type 2) and general (type 1) quick replies
            if($current_user_roles != 2) {
                // For non-root users: get personal + company general
                $data = $data->where(function($query) use ($current_user, $current_user_company_id) {
                    $query->where('id_agent', $current_user->id) // Personal quick replies
                          ->orWhere(function($subQ) use ($current_user_company_id) {
                              $subQ->where('type', 1) // General quick replies
                                   ->where('id_agent', $current_user_company_id);
                          });
                });
            } else {
                // For root users: get all their quick replies
                $data = $data->where('id_agent', $current_user->id);
            }

            $data = $data->orderBy('type', 'asc') // General first, then personal
                         ->orderBy('id', 'desc')
                         ->get();

            $headers = $getCorsHeaders($request);
            return response()->json([
                'success' => true,
                'message' => 'Successfully fetched quick replies',
                'data' => $data
            ], $this->successStatus)->withHeaders($headers);
        } catch (\Exception $e) {
            report($e);
            $headers = $getCorsHeaders($request);
            return response()->json([
                'success' => false,
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400)->withHeaders($headers);
        }
    }
}
