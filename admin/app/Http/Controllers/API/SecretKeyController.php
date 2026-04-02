<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Services\OauthRestService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class SecretKeyController extends ApiController
{
    public $successStatus = 200;

    function __construct(OauthRestService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $data = $this->service->list($request->all());
            if ($data['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $data) ? $data['data'] : null), $data['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $data) ? $data['data'] : null),  $data['message'] );
            }

            return $this->successResponse($data, __('messages.request.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|max:100',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(null, $validator->errors(), Response::HTTP_UNAUTHORIZED);
            }

            $request['id'] = $id;
            $store = $this->service->update($request->all());
            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
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
            $request['id'] = $id;
            $store = $this->service->destroy($request);
            if ($store['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $store) ? $store['data'] : null),  $store['message'] );
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Get item detail.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $request['id'] = $id;
            $detail = $this->service->show($request);
            if ($detail['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $detail) ? $detail['data'] : null), $detail['message']);
            } else {
                return $this->errorResponse((array_key_exists('data', $detail) ? $detail['data'] : null),  $detail['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }
}
