<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\SmmSocmedChannelRequest;
use App\Services\SmmSocmedChannelService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SmmSocmedChannelController extends ApiController
{
    public function __construct(SmmSocmedChannelService $smm_socmed_channel_service)
    {
        $this->smm_socmed_channel_service = $smm_socmed_channel_service;
    }

    public function getList(Request $request)
    {
        try {
            $data = $this->smm_socmed_channel_service->list($request->status);
            return $this->successResponse($data);
        } catch (Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function store(SmmSocmedChannelRequest $request)
    {
        try {
            $data = $this->smm_socmed_channel_service->store($request->all());
            return $this->successResponse($data, __('messages.save.success') );
        } catch (Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function destroy($id)
    {
        try {
            $data = $this->smm_socmed_channel_service->destroy($id);
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

    public function show($id)
    {
        try {
            $data = $this->smm_socmed_channel_service->show($id);
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

    public function update(SmmSocmedChannelRequest $request, $id)
    {
        try {
            $data = $this->smm_socmed_channel_service->update($request->all(), $id);
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

    public function updateStatus(Request $request)
    {
        try {
            $data = $this->smm_socmed_channel_service->updateStatus($request->all());
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
}
