<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\OauthRest;
use App\Traits\FormatResponserTrait;
use Exception;
use Illuminate\Support\Facades\Auth;

class OauthRestService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        OauthRest $oauth_rest_model
    ) {
        $this->agent_model = $agent_model;
        $this->oauth_rest_model = $oauth_rest_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new OauthRest()
        );
    }

    public function list($request = null)
    {
        $current_user = null;
        $assigned_labels = null;

        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        if($current_user_roles != 2)
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.update.allow_for_company'));

        $data = $this->oauth_rest_model->select(
            'id',
            'name',
            'email as client_id',
            'secret',
            'created_at',
            'updated_at'
        )
        ->where('client_id', $current_user_company_id)
        ->orderBy('id', 'desc')->get();

        $result = $this->successResponse($data);

        return $result;
    }

    public function update($request)
    {
        $current_user = null;
        $assigned_labels = null;

        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        if($current_user_roles != 2)
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.update.allow_for_company'));

        $query = $this->oauth_rest_model->where('id', $request['id']);
        $update = $query->update([
            'name' => $request['name']
        ]);

        $data = null;
        if($update) {
            $data = $query->first();
            $result = $this->successResponse($data, __('messages.update.success'));
        } else {
            return $this->errorResponse(null, __('messages.update.error'));
        }

        return $result;
    }

    public function destroy($request)
    {
        $current_user = null;
        $assigned_labels = null;

        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        if($current_user_roles != 2)
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.update.allow_for_company'));

        $query = $this->oauth_rest_model->where('id', $request['id']);
        $remove = $query->delete();

        if($remove) {
            $result = $this->successResponse(true, __('messages.delete.success'));
        } else {
            return $this->errorResponse(null, __('messages.delete.error'));
        }

        return $result;
    }

    public function show($request = null)
    {
        $current_user = null;
        $assigned_labels = null;

        if (Auth::check()) {
            $current_user = Auth::user();
        }
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_id = $current_user->id; // uuid for agent with roles company
        }

        if ($current_user_roles != 2)
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.update.allow_for_company'));

        $data = $this->oauth_rest_model->select(
            'id',
            'name',
            'email as client_id',
            'secret',
            'created_at',
            'updated_at'
        )
            ->where('client_id', $current_user_company_id)
            ->where('id', $request['id'])
            ->first();

        if (!$data)
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        return $this->successResponse($data);
    }

}