<?php

namespace App\Services;

use App\User;
use App\Models\Agent;
use App\Models\CompanyDetail;
use App\Traits\FormatResponserTrait;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class CompanyDetailService
{
    use FormatResponserTrait;

    public function __construct(
        CompanyDetail $company_detail_model,
        Agent $agent_model,
        User $user_model
    ) {
        $this->company_detail_model = $company_detail_model;
        $this->agent_model = $agent_model;
        $this->user_model = $user_model;
    }

    /**
     * List and show company detail
     *
     * @param Integer $id = null|id
     */
    public function list($id = null)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user->id_department;
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

        $companies = $this->company_detail_model->whereHas('agent')->orderByDesc('created_at')
        ->when($id, function ($cmp) use ($id) {
            $cmp->where('id', $id);
        })
        ->get();

        $companies->map(function ($item, $key){
            $item['owner_name'] = $item->agent->name;
            $item['owner_email'] = $item->agent->email;
            $item['owner_status'] = $item->agent->status;
            $item['owner_status_name'] = $item->agent->status_name;
            unset($item['agent']);
        });

        if($id && $companies->isNotEmpty())
            $companies = $companies[0];

        if($companies) {
            return $this->successResponse( $companies, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') );
        }
    }

    public function update($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user->id_department;
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

        $data_company = $this->company_detail_model->whereHas('agent')->where('id', $request['id'])->first();

        if (empty($data_company))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        // Set update data value
        $allowedUpdateFields = [ 'company_name', 'company_phone_number' ];
        $update = false;
        $input_data = [];
        $input_agent_data = [];
        if (!empty($data_company) && !empty($request)) {
            $allowedUpdateAgentFields = [ 'owner_status' ]; // status, email

            foreach ($request as $field => $field_value) {
                if (in_array($field, $allowedUpdateFields))
                    $input_data[$field] = $field_value;

                if (in_array($field, $allowedUpdateAgentFields)) {
                    $field = ($field == 'owner_status' ? 'status' : $field);
                    $input_agent_data[$field] = $field_value;
                }
            }
        }

        // Update Company Data
        if($input_data)
            $update = $data_company->update($input_data);

        // Update Company Owner
        if($input_agent_data) {
            $update = $this->agent_model->find($data_company->agent_id)->update($input_agent_data);
        }

        // Update User Permissions
        if(isset($request['permissions'])) {
            $user = $this->user_model->find($data_company->agent_id);
            $update = $user->syncPermissions($request['permissions']); // sync permissions

            // dev debug
            // $internal_chat_permission = Permission::where('name', 'like', '%-internal-chat')->get();
            // $give_pr = $user->givePermissionTo($internal_chat_permission);
            // $revoke_pr = $user->revokePermissionTo(['read-internal-chat', 'delete-internal-chat']);

            $permissions = $user->getAllPermissions();
            $data_company['permissions'] = $permissions;
        }

        if($update) {
            $agent = $this->agent_model->find($data_company->agent->id);
            $data_company['owner_name'] = $agent ? $agent->name : null;
            $data_company['owner_email'] = $agent ? $agent->email : null;
            $data_company['owner_status'] = $agent ? $agent->status : null;
            $data_company['owner_status_name'] = $agent ? $agent->status_name : null;
            unset($data_company['agent']);

            return $this->successResponse( $data_company, __('messages.update.success'));
        } else {
            return $this->errorResponse(null, __('messages.update.error') );
        }
    }

    public function show($id)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user->id_department;
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

        $company_data = $this->company_detail_model->whereHas('agent')->orderByDesc('created_at')->where('id', $id)->first();
        $company_data['owner_name'] = $company_data->agent->name;
        $company_data['owner_email'] = $company_data->agent->email;
        $company_data['owner_status'] = $company_data->agent->status;
        $company_data['owner_status_name'] = $company_data->agent->status_name;
        unset($company_data['agent']);

        $user = $this->user_model->find($company_data->agent_id);
        $permissions = $user->getAllPermissions();
        $company_data['permissions'] = $permissions;

        if($company_data) {
            return $this->successResponse( $company_data, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') );
        }
    }
}