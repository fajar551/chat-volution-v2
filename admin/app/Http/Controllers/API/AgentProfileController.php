<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\AgentProfileRequest;
use App\Models\Agent;
use App\Services\AgentService;
use App\Services\AgentOauthClientService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AgentProfileController extends ApiController
{
    public function __construct(AgentService $agent_service, Agent $agent_model)
    {
        $this->agent_service = $agent_service;
        $this->agent_model = $agent_model;
    }

    /**
     * update profile by agent
     * in profile menu
     */
    public function updateProfileByAgent(AgentProfileRequest $request)
    {
        try {
            $user = Auth::user();
            $id_user = $user->id;

            $input = $request->only(['name', 'status', 'phone', 'avatar']);
            $update = $this->agent_service->updateProfile($input, $id_user);

            if ($update['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $update) ? $update['data'] : null), $update['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $update) ? $update['data'] : null),  $update['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * update password by agant
     * in profile menu
     */
    public function updatePasswordByAgent(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'old_password' => 'required',
                'password' => 'required',
                'confirm_password' => 'required',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
            }

            $user = Auth::user();
            $id_user = $user->id;

            $input = $request->only(['old_password', 'password', 'confirm_password']);
            $update = $this->agent_service->updatePassword($input, $id_user);

            if ($update['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $update) ? $update['data'] : null), $update['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $update) ? $update['data'] : null),  $update['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show()
    {
        try {
            $user = Auth::user();
            $id_user = $user->id;
            $data = $this->agent_service->show($id_user);
            return $this->successResponse( $data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Show profile by company secret
     * (show company profile)
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showByCompanySecret(Request $request, AgentOauthClientService $agent_oauth_client_service)
    {
        try {
            $data = $agent_oauth_client_service->getCompanyBySecret($request->api_key);
            return $this->successResponse( $data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

}
