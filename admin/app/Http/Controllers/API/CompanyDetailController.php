<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Services\CompanyDetailService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CompanyDetailController extends ApiController
{
    function __construct(CompanyDetailService $company_detail_service)
    {
        $this->company_detail_service = $company_detail_service;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function list($id = null)
    {
        try {
            $list = $this->company_detail_service->list($id);

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
            $data = $this->company_detail_service->show($id);

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
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        try {
            $update = $this->company_detail_service->update($request->all());

            if ($update['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $update) ? $update['data'] : null), $update['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $update) ? $update['data'] : null),  $update['message'] );
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
        //
    }
}
