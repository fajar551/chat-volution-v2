<?php

namespace App\Http\Controllers\API;

use App\Models\Agent;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\API\ApiController;
use App\Services\AgentOauthClientService;
use App\Services\DepartmentService;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ImportDepartment;
use App\Rules\ChatFileRule;
use Illuminate\Http\Response;

class DepartmentController extends ApiController
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
            $department = new Department;
            $department->id_agent = $id;
            $department->name = $request->name;
            $department->description = $request->description;
            $department->save();

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
            'name' => 'required',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $id = Auth::user()->id;
            $department = Department::where('id', $request->id)->where('id_agent', $id)->first();
            $department->name = $request->name;
            $department->description = $request->description;
            $department->status = $request->status;
            $department->save();

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
            $id = $user->id;

            $department = [];
            if ($user->id_roles == 2) {
                $department = Department::where('id_agent', $id)->orderby('name')->get();
            }

            return $this->successResponse($department, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())), $e->getCode());
        }
    }

    public function detail(Request $request)
    {
        try {

            $id = Auth::user()->id;
            $department = Department::where('id', $request->id)->where('id_agent', $id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $department
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
            Department::where('id', $request->id)->where('id_agent', $id)->first()->delete();

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

    public function listCompanyDepartment(Request $request, AgentOauthClientService $agent_oauth_client_service)
    {
        $request_method = strtolower($request->method());
        if ($request_method == 'post') { // for list in admin page
            $validator = Validator::make($request->all(), [
                'id_company' => 'required:interger',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 401);
            }

            $id = $request->id_company;
        } elseif ($request_method == 'get') {
            /**
             * for unauthorized user
             * used for company that integrated its secret key
             */

            /** Check client key */
            $request['origin'] = $request->header('origin');
            $data = $agent_oauth_client_service->validate($request->all(), false);
            if ($data['code'] !== 200) {
                return $this->errorResponse((array_key_exists('data', $data) ? $data['data'] : null),  $data['message']);
            }

            $user = $agent_oauth_client_service->getCompanyBySecret($request->api_key);
            $id = $user->id;
            $is_company_online = $user->online;
        }

        try {
            $department = Department::where('id_agent', $id);
            $department = $department->whereHas('agentsOnDepartment', function ($q) {
                $q->where('online', 1);
                $q->where('id_roles', 4); // only show when there is online agent
            });
            $department = $department->orderBy('name', 'asc')->get();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $department
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
     * List Available Departments
     * When agent wants to transfer chat
     */
    public function listAvailableTransfer(Request $request, DepartmentService $department_service)
    {
        try {
            $list = $department_service->getAvailableTransferDeptByAgent();
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

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

    public function importDepartment(Request $request, DepartmentService $department_service)
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

            $import = new ImportDepartment;
            $imported_data = Excel::toArray($import, $request->file('file'));

            if (empty($imported_data))
                return $this->errorResponse(null, __('messages.request.error') . ' ' . __('messages.data_not_found'));

            $store = $department_service->store($imported_data);

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }
}
