<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\API\ApiController;
use App\Services\SmmSocmedAccountService;
use App\Http\Requests\SmmSocmedAccountRequest;

class SmmSocmedAccountController extends ApiController
{
    public function __construct(SmmSocmedAccountService $smm_socmed_account_service)
    {
        $this->smm_socmed_account_service = $smm_socmed_account_service;
    }

    public function getList(Request $request)
    {
        try {
            $data = $this->smm_socmed_account_service->list($request->status);
            return $this->successResponse($data);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
        }
    }

    public function update(SmmSocmedAccountRequest $request, $id)
    {
        try {
            $data = $this->smm_socmed_account_service->update($request->all(), $id);
            return $this->successResponse($data['updated_data']);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $data = $this->smm_socmed_account_service->show($id);
            return $this->successResponse($data);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $data = $this->smm_socmed_account_service->destroy($id);
            return $this->successResponse($data);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
        }
    }
}
