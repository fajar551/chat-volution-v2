<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Labels;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class LabelService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        Labels $label_model
    ) {
        $this->agent_model = $agent_model;
        $this->label_model = $label_model;
    }

    /**
     * Show available chat labels
     * based on logged in agent
     *
     * used in chat feature
     */
    public function chatLabelsByAgent($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        $label_query = $this->label_model;
        $label_query = $label_query->where('id_agent', $current_user->id);
        $label_query = $label_query->orWhere('id_agent', $current_user_company_id);
        if($current_user_roles == 4) {
            if(!empty($current_user_department)) {
                $staffs_in_dept = $this->agent_model->where('id_department', $current_user_department)->pluck('id');

                if( $staffs_in_dept->isNotEmpty() ) {
                    $label_query = $label_query->orWhereIn('id_agent', $staffs_in_dept);
                }

            }
        }

        $labels = $label_query->orderBy('id_agent', 'asc')->orderBy('name', 'asc')->get();

        if ($labels) {
            $result = $this->successResponse($labels, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Show all chat labels
     *
     * used in show list resolve chat feature in v2
     */
    public function getAllLabels($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        $label_query = $this->label_model;
        if(isset($request['label_ids']) && !empty($request['label_ids'])) {
            $label_query = $label_query->whereIn('id', $request['label_ids']);
        }
        $labels = $label_query->orderBy('id', 'asc')->orderBy('name', 'asc')->get();

        if ($labels) {
            $result = $this->successResponse($labels, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

}