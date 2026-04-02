<?php

namespace App\Services;

use App\Models\Agent;;
use App\Models\Setting;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class SettingService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        Setting $setting_model
    ) {
        $this->agent_model = $agent_model;
        $this->setting_model = $setting_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new Setting()
        );
    }

    /**
     * Update or Insert Settings
     * For Agent
     *
     * Example:
     * - sound_notification
     */
    public function storeMySetting($request)
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

        $query = $this->setting_model->updateOrInsert(
            ['id_agent' => $current_user->id, 'meta' => $request['meta']],
            ['status' => $request['status']]
        );
        if($query) {
            $data = $this->setting_model->where('id_agent', $current_user->id)->where('meta', $request['meta'])->first();
            return $this->successResponse($data);
        }

        return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));
    }

    /**
     * Show All Settings by Agent
     * or by Type
     *
     * Example:
     * - sound_notification
     */
    public function showMySetting($request, $type = null)
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

        $query = $this->setting_model->where('id_agent', $current_user->id);
        if($type) {
            $data = $query->where('meta', $type)->first();
        } else {
            $data = $query->orderBy('meta', 'desc')->get();
        }

        return $this->successResponse($data);
    }

}