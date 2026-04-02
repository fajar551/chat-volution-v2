<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends ApiController
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $list = Activity::select(
                'id',
                'log_name',
                'description',
                'causer_type',
                'causer_id',
                'ip',
                'user_agent',
                'email',
                'created_at'
            )
            ->orderByDesc('created_at');

            if (isset($request['keyword']) && !empty($request['keyword'])) {
                if(is_numeric($request['keyword'])) {
                    $list->where('causer_id', $request['keyword']);
                } else {
                    $list->where('email', 'like', '%' . $request['keyword'] . '%');
                }
            }

            $list = $list->paginate(25);

            return $this->successResponse($list);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
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
            $list = Activity::find($id);

            if ($list) {
                $list->properties = $list->properties ? json_decode($list->properties) : null;
                $list->request_sent = $list->request_sent ? json_decode($list->request_sent) : null;
                $list->response = $list->response ? json_decode($list->response) : null;

                return $this->successResponse($list);
            } else {
                return $this->errorResponse($list);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
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
    public function update(Request $request, $id)
    {
        //
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
