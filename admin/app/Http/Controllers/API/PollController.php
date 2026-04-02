<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChatGroupRequest;
use App\Http\Requests\PollRequest;
use App\Services\PollService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PollController extends ApiController
{
    public function __construct(
        PollService $poll_service
    )
    {
        $this->poll_service = $poll_service;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PollRequest $request)
    {
        try {
            $store = $this->poll_service->store($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    public function submitChoice(Request $request)
    {
        try {
            $store = $this->poll_service->submitChoice($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e){
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
    public function show($id)
    {
        try {
            $data = $this->poll_service->show($id);

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
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
            $data = $this->poll_service->destroy($id);

            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

}
