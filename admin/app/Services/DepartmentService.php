<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\CompanyDetail;
use App\Models\Department;
use App\Models\Menu;
use App\Models\PackageSet;
use App\Models\UserVerify;
use App\Services\SendEmailService;
use App\Traits\FormatResponserTrait;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DepartmentService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        UserVerify $user_verify_model,
        SendEmailService $send_email_service,
        CompanyDetail $company_detail_model,
        Department $department_model
    ) {
        $this->agent_model = $agent_model;
        $this->user_verify_model = $user_verify_model;
        $this->send_email_service = $send_email_service;
        $this->company_detail_model = $company_detail_model;
        $this->department_model = $department_model;
    }

    /**
     * List Available Departments
     * When agent wants to transfer chat
     * filtered by logged in agent
     *
     * @return array $departments
     * return list of departments
     * except the logged in agent's department
     */
    public function getAvailableTransferDeptByAgent()
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user->id_roles;
        $current_user_department= $current_user->id_department;
        $is_company_online = 0;

        // CHEK HOW MANY AGENTS ONLINE FIRST
        $agents = $this->agent_model->where('online', 1)->count();
        if( $agents <= 1)
            return $this->successResponse( $departments = [], __('messages.request.success'));

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $is_company_online = $current_user_company->online;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
            $is_company_online = $current_user->online;
        }

        $departments = $this->department_model->where('id_agent', $current_user_company_id);
        // if( $current_user_roles != 1 && !$is_company_online) // show all department when company is online
        if( $current_user_roles != 1 ) {
            $departments = $departments->whereHas('agentsOnDepartment', function($q) use ($current_user_department) {
                if(!empty($current_user_department)) {
                    $q->where('id_department', '<>', $current_user_department);
                    $q->where('online', 1);
                    $q->where('id_roles', 4);
                }
            });
        }

        $departments = $departments->withCount([
            'agentsOnDepartment',
            'agentsOnDepartment as online_agents' => function (Builder $query) {
                $query->where('online', 1);
            },
        ])
        // ->with('agentsOnDepartment', function($q) { // show login agent in department
        //     $q->where('online', 1);
        // })
        ->orderBy('online_agents', 'desc') // show online department first
        ->orderBy('name', 'asc')
        ->get();

        $departments->map(function($item, $key) {
            $item['is_online'] = false;
            if($item['online_agents'] > 0)
                $item['is_online'] = true;
        });

        if( !empty($departments) ) {
            return $this->successResponse( $departments, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error').' '.__('messages.data_not_found') );
        }

    }

    public function store($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user->id_roles;
        $current_user_department= $current_user->id_department;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $is_company_online = $current_user_company->online;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
            $is_company_online = $current_user->online;
        }

        if(is_array($request)) {
            $arr_data = $request[0]; // first sheet data
            $input = [];
            foreach($arr_data as $key => $value) {
                if(!empty($value)) {
                    if(isset($value[0]) && !empty($value[0])) {
                        $input[$key] = [
                            'name' => $value[0],
                            'id_agent' => $current_user_company_id,
                            'description' => $value[0],
                            'status' => 1,
                        ];

                        $store_department = $this->department_model->updateOrCreate(
                            [
                                'name' => $value[0],
                                'id_agent' => $current_user_company_id,
                            ], $input[$key]
                        );
                    }
                }
            }
            // $store_department = $this->department_model->upsert($input, ['name', 'id_agent']);
        } else {
            $input = [
                'id_agent' => $current_user_company_id,
                'name' => $request['name'],
                'description' => $request['description'] ?: $request['name'],
            ];

            $store_department = $this->department_model->updateOrCreate(
                [
                    'name' => $request['name'],
                    'id_agent' => $current_user_company_id
                ], $input
            );
        }

        if($store_department) {
            return $this->successResponseWithLog( $store_department, 'Import Department: '. __('messages.request.success'), null, 'import_department');
        } else {
            return $this->errorResponseWithLog(null, 'Import Department: '. __('messages.request.error').' '.__('messages.data_not_found') );
        }
    }

}
