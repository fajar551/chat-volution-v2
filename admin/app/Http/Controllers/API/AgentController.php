<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\ChatLabel;
use App\Models\PackageSet;
use App\Services\AgentService;
use App\Services\AgentStatusAliasService;
use App\Services\AgentOauthClientService;
use App\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Imports\ImportAgent;
use App\Rules\ChatFileRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class AgentController extends ApiController
{

    public $successStatus = 200;

    function __construct(Agent $agent_model)
    {
        $this->agent_model = $agent_model;
    }

    public function list(Request $request, AgentService $agent_service)
    {
        try {
            $request['current_route_name'] = Route::currentRouteName();
            $request['type'] = $request->type;
            $data = $agent_service->list($request->all());

            return response()->json([
                'code' => 200,
                'messgae' => isset($data['message']) ? $data['message'] : '',
                'message' => isset($data['message']) ? $data['message'] : '',
                'data' => isset($data['data']) ? $data['data'] : []
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Get list of all agents by company
     * Used in chatvolution v2
     *
     * @param String $request['uuid'] = uuid company
     * @param Integer $request['id_roles'] = filter by agent roles
     * @param String $request['api_key'] = (optional) client's api secret key
     */
    public function listByUnauthenticatedUser(Request $request, $type = null)
    {
        try {
            Log::info('listByUnauthenticatedUser called', [
                'api_key' => $request->api_key ? 'provided' : 'not provided',
                'type' => $type,
                'id_roles' => $request->id_roles ?? 'not provided',
                'has_auth' => Auth::check(),
            ]);

            $company_data = [];
            // Get Company Data by Secret Key
            if(isset($request->api_key) && !empty($request->api_key)) {
                try {
                    $agent_oauth_client_service = AgentOauthClientService::getInstance();
                    $company_data = $agent_oauth_client_service->getCompanyBySecret($request->api_key);

                    if(empty($company_data) || !isset($company_data['id'])) {
                        Log::warning('Company data not found by api_key', ['api_key' => substr($request->api_key, 0, 10) . '...']);
                    } else {
                        Log::info('Company data found by api_key', ['company_id' => $company_data['id']]);
                    }
                } catch (\Exception $e) {
                    Log::error('Error getting company by secret', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw new \Exception('Failed to validate API key: ' . $e->getMessage(), 403);
                }
            }

            // Get Company Data by UUID
            if(Auth::check() && Auth::user()) {
                $auth_user_data = Auth::user();
                $company_data['id'] = $auth_user_data->id;
                if($auth_user_data['id_roles'] != 2)
                    $company_data['id'] = $auth_user_data->id_company;
                Log::info('Company data from authenticated user', ['company_id' => $company_data['id']]);
            }

            if($type == 'from-socket-v2') {
                $company_data = []; // reset value of variable
                if(isset($request['uuid']) && !empty($request['uuid'])) {
                    $company = $this->agent_model->where('uuid', $request['uuid'])->first();
                    if($company)
                        $company_data['id'] = $company->id;
                }
            }

            if(empty($company_data) || !isset($company_data['id'])) {
                Log::warning('Company data is empty', [
                    'has_api_key' => !empty($request->api_key),
                    'has_auth' => Auth::check(),
                    'type' => $type
                ]);
                throw new \Exception( __('messages.data_not_found'), 404);
            }

            try {
                $query = $this->agent_model
                    ->select('id', 'id_roles', 'id_department', 'id_company', 'name', 'email', 'status', 'phone', 'avatar')
                    ->where('id_company', $company_data['id']);

                // Filter based on agent ids
                if(isset($request->agent_ids) && !empty($request->agent_ids) && is_array($request->agent_ids))
                    $query = $query->whereIn('id', $request->agent_ids);

                // Filter based on department
                if(isset($request->id_department) && !empty($request->id_department))
                    $query = $query->where('id_department', $request->id_department);

                // Filter by roles - default to role 4 (agent) if not specified
                if (isset($request->id_roles) && $request->id_roles == 3) {
                    $query = $query->where('id_roles', 3);
                } else {
                    $query = $query->where('id_roles', 4);
                }

                // Load relationships with error handling
                $query = $query->with([
                    'companyDetailByIdCompany' => function($q) {
                        $q->select('agent_id', 'company_name', 'company_phone_number');
                    },
                    'department' => function($q) {
                        $q->select('id', 'name');
                    }
                ]);

                $data = $query->get();

                Log::info('Query executed successfully', ['count' => $data->count()]);
            } catch (\Exception $e) {
                Log::error('Error executing query', [
                    'error' => $e->getMessage(),
                    'company_id' => $company_data['id'] ?? 'not set',
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

            // Map data and transform
            $data = $data->map(function($item, $key) {
                $item['company_name'] = "-";
                if (!empty($item['companyDetailByIdCompany'])) {
                    $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
                }
                unset($item['companyDetailByIdCompany']);

                $item['department_name'] = "-";
                if (!empty($item['department'])) {
                    $item['department_name'] = $item['department']['name'];
                }
                unset($item['department']);

                $avatar_url = !empty($item['avatar']) ? parseFileUrl($item['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['avatar'] = $avatar_url;

                return $item;
            });

            Log::info('Successfully retrieved agents', ['count' => $data->count()]);
            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            Log::error('Error in listByUnauthenticatedUser', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }

    }


    /**
     * Get list of all agents by company
     * Used in chatvolution v2
     *
     * @param String $request['uuid'] = uuid company
     * @param Integer $request['id_roles'] = filter by agent roles
     * @param String $request['api_key'] = (optional) client's api secret key
     */
    public function systemGetAgentList(Request $request)
    {
        try {
            $company_data = Agent::where('id_roles', 2)->where('uuid', $request->company_uuid)->first();
            if(empty($company_data))
                throw new \Exception( __('messages.data_not_found'), 404);

            $data = $this->agent_model
                ->select('id', 'id_roles', 'id_department', 'id_company', 'name', 'email', 'status', 'phone', 'avatar')
                ->with(['companyDetailByIdCompany', 'department'])
                ->where('id_company', $company_data['id']);
                // ;

            // Filter based on agent ids
            if(isset($request->agent_ids) && !empty($request->agent_ids) && is_array($request->agent_ids))
                $data = $data->whereIn('id', $request->agent_ids);

            // Filter based on department
            if(isset($request->id_department) && !empty($request->id_department))
                $data = $data->where('id_department', $request->id_department);

            if ($request->id_roles == 3) {
                $data = $data->where('id_roles', 3);
            } else {
                $data = $data->where('id_roles', 4);
            }
            $data = $data->get();

            $data->map(function($item, $key) {
                $item['company_name'] = "-";
                if (!empty($item['companyDetailByIdCompany'])) {
                    $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
                }
                unset($item['companyDetailByIdCompany']);

                $item['department_name'] = "-";
                if (!empty($item['department'])) {
                    $item['department_name'] = $item['department']['name'];
                }
                unset($item['department']);

                $avatar_url = !empty($item['avatar']) ? parseFileUrl($item['avatar']) : null;
                $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($item['name'] . '-' . $item['id'], 'name');
                $item['avatar'] = $avatar_url;

                return $item;
            });
            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }

    }


    public function listAgentInReportFilter(Request $request)
    {
        try {
            $request['current_route_name'] = Route::currentRouteName();
            $request['type'] = $request->type;
            $data = $agent_service->list($request->all());

            return response()->json([
                'code' => 200,
                'messgae' => isset($data['message']) ? $data['message'] : '',
                'message' => isset($data['message']) ? $data['message'] : '',
                'data' => isset($data['data']) ? $data['data'] : []
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function insert(Request $request, AgentService $agent_service)
    {
        $validator = Validator::make($request->all(), [
            'id_department' => 'required',
            'name' => 'required',
            'email' => 'required|email|unique:agent,email',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
        }

        try {
            // using service
            $id = Auth::user()->id;
            $store = $agent_service->store($request->all());
            return $this->successResponse($store, __('messages.save.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function update(Request $request, AgentService $agent_service)
    {

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'name' => 'required',
            'id_department' => 'required|integer',
            'status' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
        }

        try {
            $store = $agent_service->update($request->all());
            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function verification(Request $request, AgentService $agent_service)
    {
        $user_role = $agent_service->checkRoleByRegisterToken($request->all());
        if(!$user_role )
        {
            $error = new \Exception( __('messages.email_verification.error') );
            Log::error([
                'user_message' => __('messages.email_verification.error'),
                'system_message' => 'Token not found',
                'request_data' => $request->all()
            ]);
            return $this->errorResponse(null, $error->getMessage() );
        }

        $rules = [
            'password' => 'required',
            'confirm_password' => 'required|same:password',
            'phone' => 'required'
        ];
        if($user_role == 2) {
            $rules['company_name'] = 'required';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors());
        }

        try {
            $store = $agent_service->verification($request->all());

            return $this->successResponse($store, __('messages.update.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function updateStatus(Request $request, AgentService $agent_service)
    {

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'status' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $agent = null;
            if ($id === 1) {
                $agent = Agent::with(['companyDetailByIdCompany', 'department'])->where('id', $request->id)->first();
            } else {
                $agent = Agent::with(['companyDetailByIdCompany', 'department'])->where('id', $request->id)->where('id_company', $id)->first();
            }

            if (!$agent) {
                return response()->json([
                    'code' => 404,
                    'message' => 'Agent not found'
                ], 404);
            }

            $oldStatus = $agent->status;
            $agent->status = $request->status;
            $agent->save();

            // If status changed to disabled (0, 2, or 9), remove from Redis
            // Status values: 0 = Inactive, 1 = Active, 2 = Pending, 9 = Suspended
            $disabledStatuses = [0, 2, 9];
            if (in_array($request->status, $disabledStatuses)) {
                // Remove agent from Redis when disabled
                $agent_service->removeAgentFromRedis($agent);
                \Log::info("✅ Agent {$agent->id} removed from Redis due to status change to {$request->status}");
            } elseif ($request->status == 1 && $oldStatus != 1) {
                // If status changed to active and agent is online, update Redis
                if ($agent->online == 1) {
                    $agent_service->saveAgentToRedis($agent);
                    \Log::info("✅ Agent {$agent->id} saved to Redis due to status change to active");
                }
            } elseif ($request->status == 1 && $agent->online == 1) {
                // If status is active and agent is online, ensure Redis is updated with new status
                $agent_service->saveAgentToRedis($agent);
            }

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function detail(Request $request)
    {
        try {
            $user = Auth::user();
            $id_user = $user->id;
            $id_role = $user->id_roles;
            $id_department = $user->id_department;

            /* validation get data by role and id user */
            if ($id_role == 2) {
                /* by company id */
                $data = User::where('id', $request->id)->where('id_company', $id_user)->first();
            } elseif ($id_role == 3) {
                /* by department */
                $data = User::where('id', $request->id)->where('id_department', $id_department)->first();
            } else {
                /* by id */
                $data = User::where('id', $request->id)->first();
            }
            // if ($role == 2) {
            //     $data = User::where('id', $request->id)->where('id_company', $user_company)->first();
            // } else {
            //     $data = User::where('id', $request->id)->first();
            // }

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }


    ## ADMIN ##
    public function listAdmin(Request $request)
    {
        try {
            $id = Auth::user()->id;
            if ($request->type === 'company') {
                $data = User::where('id_roles', 2)->get();
            } else if ($request->type === 'staff') {
                $data = User::where('id_roles', 3)->get();
            } else {
                $data = User::where('id_roles', 4)->get();
            }
            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function detailAdmin(Request $request)
    {
        try {
            $data = User::where('id', $request->id)->first();
            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function updateAdmin(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'status' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
        }

        try {

            $data = User::where('id', $request->id)->first();
            $data->status = $request->status;
            $data->save();
            return $this->successResponse(null, __('messages.update.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function insertAdmin(Request $request, AgentService $agent_service)
    {
        $validator = Validator::make($request->all(), [
            'id_department' => 'required',
            'name' => 'required',
            'email' => 'required|email|unique:agent,email',
            // 'password' => 'required', // user does not asked to input password
            // 'confirm_password' => 'required|same:password',
            // 'level' => 'required|integer',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
        }

        try {
            // using service
            $id = Auth::user()->id;
            $store = $agent_service->store($request->all());
            return $this->successResponse($store, __('messages.save.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function storeOauthClient(Request $request, AgentOauthClientService $agent_oauth_client_service)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|min:2|max:100',
            'domain' => 'required|min:2|max:100|unique:agent_oauth_clients,domain',
        ]);
        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
        }

        try {
            $store = $agent_oauth_client_service->store($request->all());
            return $this->successResponse($store, __('messages.save.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function getListOauthClient(AgentOauthClientService $agent_oauth_client_service)
    {
        try {
            $data = $agent_oauth_client_service->list();
            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function showOauthClient($id, AgentOauthClientService $agent_oauth_client_service)
    {
        try {
            $data = $agent_oauth_client_service->show($id);
            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function destroyOauthClient($id, AgentOauthClientService $agent_oauth_client_service)
    {
        try {
            $data = $agent_oauth_client_service->destroy($id);
            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function validateCompany(Request $request, AgentOauthClientService $agent_oauth_client_service)
    {
        try {
            // Log request untuk debugging
            Log::info('validate-client API called', [
                'api_key' => $request->query('api_key'),
                'origin' => $request->header('origin'),
                'referer' => $request->header('referer'),
                'all_params' => $request->all(),
                'query_string' => $request->getQueryString()
            ]);

            // Get origin from header
            $origin = $request->header('origin');
            if (!$origin) {
                // Fallback to referer if origin is not available
                $referer = $request->header('referer');
                if ($referer) {
                    $parsed = parse_url($referer);
                    $origin = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
                }
            }

            $request['origin'] = $origin;

            // Check if api_key exists
            $api_key = $request->query('api_key') ?? $request->input('api_key');
            if (!$api_key) {
                Log::warning('validate-client: api_key is missing');
                return $this->errorResponse(null, 'API key is required', Response::HTTP_BAD_REQUEST);
            }

            $data = $agent_oauth_client_service->validate($request->all());

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                // Log error for debugging
                Log::warning('validate-client: validation failed', [
                    'code' => $data['code'] ?? 'unknown',
                    'message' => $data['message'] ?? 'unknown error'
                ]);
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (Exception $e) {
            Log::error('validate-client: exception occurred', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())), Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * List Available Agents
     * When agent wants to transfer chat
     */
    public function listAvailableTransfer(Request $request, AgentService $agent_service)
    {
        try {
            $list = $agent_service->getAvailableTransferAgentByAgent($request->all());
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
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

    public function checkDomain(Request $request)
    {
        // DEBUG, JUST FOR TESTING
        $parsed = parse_url($request->header('origin'));
        $response['origin'] = $parsed['host'];
        $response['params'] = $request->all();
        $response['headers'] = $request->header();

        return response()->json($response);
    }

    public function updateOnlineStatus(Request $request, AgentService $agent_service)
    {
        try {
            $update_online = $agent_service->updateOnlineStatus($request['online']);

            return response()->json([
                'code' => 200,
                'messgae' => __('messages.request.success'),
                'data' => $update_online
            ], $this->successStatus);

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function storeStatusAlias(Request $request, AgentStatusAliasService $agent_status_service)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status_name' => 'required|min:2|max:30',
                'expired_at' => 'required|date_format:Y-m-d H:i:s',
            ]);
            if ($validator->fails()) {
                return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $store = $agent_status_service->store($request->all());

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

    public function destroyStatusAlias(Request $request, AgentStatusAliasService $agent_status_service)
    {
        try {
            $delete = $agent_status_service->destroy($request->all());

            if ($delete['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $delete) ? $delete['data'] : null), $delete['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $delete) ? $delete['data'] : null),  $delete['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Generate Random String
     *
     * @return String
     */
    public function generatePassword(Request $request)
    {
        try {
            $generated_pass = generate_random_string(15);
            return $this->successResponse($generated_pass);
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * @param $type = null|all
     */
    public function getStatusAlias(
        Request $request,
        AgentStatusAliasService $agent_status_service,
        $type=null
    )
    {
        try {
            $data = $agent_status_service->list($request->all(), $type);

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

    public function importAgent(Request $request, AgentService $agent_service)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => [
                    'required',
                    new ChatFileRule([
                        'image' => '5120',
                        'video' => '5120',
                        'archive' => '10240',
                        'other' => '5120'
                    ])
                ],
            ]);
            if ($validator->fails()) {
                return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
            }

            $current_user_roles = null;
            if(Auth::check()) {
                $current_user = Auth::user();
                $current_user_roles = $current_user ? $current_user->id_roles : null;

                // ONLY SPECIFIC COMPANY
                if($current_user_roles != 2 && $current_user_roles != 1) {
                    $current_user_company = $this->agent_model->find($current_user->id_company);
                } else {
                    $current_user_company = $current_user;
                }
            }

            $import = new ImportAgent;
            Excel::import($import, $request->file('file'));

            if(empty($import->getData()))
                return $this->errorResponse(null, __('messages.request.error').' '.__('messages.data_not_found') );

            $insert_data = [];
            $failed_data = [];
            $failed_insert = [];
            foreach($import->getData() as $key => $val) {
                if(!empty($val['department'])) {
                    $dpt = \App\Models\Department::where('id_agent', $current_user_company['id'])->where('name', 'like', '%'.$val['department'].'%')->first();

                    if(!empty($dpt)) {
                        $insert_data[$key] = $val;
                        $insert_data[$key]['id_company'] = $current_user_company['id'];
                        $insert_data[$key]['id_roles'] = (strtolower($val['roles']) == 'staff') ? 3 : 4;
                        $insert_data[$key]['id_department'] = $dpt['id'];
                        $insert_data[$key]['level'] = null;
                        $insert_data[$key]['status'] = 1;
                        $insert_data[$key]['is_email_verified'] = 1;
                        $insert_data[$key]['password'] = 'Test123!';
                    } else {
                        $failed_data[$key] = $val;
                    }
                }
            }

            if(!empty($insert_data)) {
                foreach ($insert_data as $key => $value) {
                    $store = $agent_service->store($value);

                    if (!$store) {
                        $failed_insert[$key] = $value;
                    }

                }
            }

            createActivityLog(null, [
                'log_name' => 'register',
                'email' => $request->email,
                'request_sent' => $request->all(),
                'response' => [
                    'insert_data' => $insert_data,
                    'failed_data' => $failed_data,
                    'failed_insert' => $failed_insert
                ]
            ]);

            return $this->successResponse( [
                'insert_data' => $insert_data,
                'failed_data' => $failed_data,
                'failed_insert' => $failed_insert
                ]);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Get online agents by company from Redis
     * Used in clientarea React app
     * Similar to backend_v2: GET /agent/online
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOnlineAgents(Request $request)
    {
        try {
            $company_data = [];
            $company_name = null;

            // Get Company Data by Secret Key
            if(isset($request->api_key) && !empty($request->api_key)) {
                $agent_oauth_client_service = AgentOauthClientService::getInstance();
                $company_data = $agent_oauth_client_service->getCompanyBySecret($request->api_key);
            }

            // Get Company Data by UUID (for authenticated users)
            if(Auth::check() && Auth::user()) {
                $auth_user_data = Auth::user();
                $company_data['id'] = $auth_user_data->id;
                if($auth_user_data['id_roles'] != 2)
                    $company_data['id'] = $auth_user_data->id_company;
            }

            // If we have company_data, get company name from database
            if(!empty($company_data) && isset($company_data['id'])) {
                $company = $this->agent_model->with('companyDetailByIdCompany')->where('id', $company_data['id'])->first();
                if($company && $company->companyDetailByIdCompany) {
                    $company_name = $company->companyDetailByIdCompany->company_name;
                }
            }

            // Fallback: Get company_name directly from request (for client area)
            if(empty($company_name) && isset($request->company_name) && !empty($request->company_name)) {
                $company_name = $request->company_name;
            }

            if(empty($company_name)) {
                return $this->errorResponse(null, __('messages.data_not_found'), 404);
            }

            // Slugify company name (same as backend_v2)
            $slugified_company_name = \Illuminate\Support\Str::slug($company_name);

            // Connect to Redis
            $redis = \Illuminate\Support\Facades\Redis::connection();
            $companyOnlineUsersKey = "company:{$slugified_company_name}:online_users";

            // Get all online user IDs from sorted set
            $onlineUserIds = $redis->zrange($companyOnlineUsersKey, 0, -1);

            if(empty($onlineUserIds)) {
                return $this->successResponse([], __('messages.request.success'));
            }

            // Get user details for each online user
            $onlineAgents = [];
            foreach($onlineUserIds as $userId) {
                $userDataKey = "user:{$userId}";
                $userData = $redis->hgetall($userDataKey);

                if(!empty($userData)) {
                    // Remove sensitive data
                    unset($userData['token']);
                    unset($userData['company_uuid']);
                    unset($userData['uuid']);
                    unset($userData['password']);

                    // Only include agents (id_roles = 4)
                    if(isset($userData['roles_id']) && $userData['roles_id'] == 4) {
                        $onlineAgents[] = $userData;
                    }
                }
            }

            return $this->successResponse($onlineAgents, __('messages.request.success'));
        } catch (\Exception $e) {
            Log::error('Error getting online agents', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Get Redis data for debugging - shows all online users in Redis
     * GET /api/agent/redis-debug?company_name=demo-inc
     */
    public function getRedisDebugData(Request $request)
    {
        try {
            $company_name = $request->company_name ?? 'demo-inc';

            // Slugify company name
            $slugified_company_name = \Illuminate\Support\Str::slug($company_name);

            // Connect to Redis
            $redis = \Illuminate\Support\Facades\Redis::connection();
            $companyOnlineUsersKey = "company:{$slugified_company_name}:online_users";

            // Get all online user IDs from sorted set
            $onlineUserIds = $redis->zrange($companyOnlineUsersKey, 0, -1);

            $result = [
                'company_name' => $company_name,
                'slugified_company_name' => $slugified_company_name,
                'redis_key' => $companyOnlineUsersKey,
                'total_users_in_redis' => count($onlineUserIds),
                'user_ids' => $onlineUserIds,
                'users_detail' => []
            ];

            // Get user details for each online user
            foreach($onlineUserIds as $userId) {
                $userDataKey = "user:{$userId}";
                $userData = $redis->hgetall($userDataKey);

                if(!empty($userData)) {
                    // Get agent from database to compare
                    $agent = $this->agent_model->find($userId);

                    $userInfo = [
                        'id' => $userId,
                        'redis_data' => [
                            'name' => $userData['name'] ?? $userData['name_agent'] ?? 'N/A',
                            'email' => $userData['email'] ?? $userData['email_agent'] ?? 'N/A',
                            'roles_id' => $userData['roles_id'] ?? $userData['id_roles'] ?? 'N/A',
                            'status' => $userData['status'] ?? 'null',
                            'company_name' => $userData['company_name'] ?? 'N/A',
                            'department_name' => $userData['department_name'] ?? 'N/A',
                        ],
                        'database_data' => $agent ? [
                            'name' => $agent->name,
                            'email' => $agent->email,
                            'id_roles' => $agent->id_roles,
                            'status' => $agent->status,
                            'online' => $agent->online,
                        ] : 'NOT FOUND IN DATABASE',
                        'status_match' => $agent ? ($userData['status'] == $agent->status) : 'N/A',
                        'should_be_removed' => $agent ? ($agent->status != 1) : 'N/A'
                    ];

                    $result['users_detail'][] = $userInfo;
                } else {
                    $result['users_detail'][] = [
                        'id' => $userId,
                        'redis_data' => 'NO DATA IN REDIS',
                        'database_data' => 'N/A',
                        'status_match' => 'N/A',
                        'should_be_removed' => 'N/A'
                    ];
                }
            }

            return $this->successResponse($result, __('messages.request.success'));
        } catch (\Exception $e) {
            Log::error('Error getting Redis debug data', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

}
