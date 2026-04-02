<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\SmmPostRequest;
use App\Services\SmmPostService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SmmPostController extends ApiController
{
    public function __construct(SmmPostService $smm_post_service)
    {
        $this->smm_post_service = $smm_post_service;
    }

    public function getList(Request $request)
    {
        try {
            $data = $this->smm_post_service->list($request->smm_account_id);
            return $this->successResponse($data, __('messagges.request.success'));
        } catch (Exception $e) {
            return $this->errorResponse(null, $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(SmmPostRequest $request)
    {
        try {
            $post = $this->smm_post_service->store($request->all());
            if($post['code'] == 200) {
                return $this->successResponse($post['data'], __('messages.save.success'));
            } else {
                Log::error($post['data']);
                return $this->errorResponse($post['data'], __('messages.save.error'));
            }

        } catch (Exception $e) {
            return $this->errorResponse(null, $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $data = $this->smm_post_service->show($id);
            return $this->successResponse($data, __('messages.request.success'));
        } catch (Exception $e) {
            return $this->errorResponse(null, $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(SmmPostRequest $request, $id)
    {
        try {
            $data = $this->smm_post_service->update($request->all(), $id);
            return $this->successResponse($data, __('messages.update.success'));
        } catch (Exception $e) {
            return $this->errorResponse(null, $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $data = $this->smm_post_service->destroy($id);
            return $this->successResponse($data, __('messages.delete.success'));
        } catch (Exception $e) {
            return $this->errorResponse(null, $e->getMessage());
        }
    }
}
