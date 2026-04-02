<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RefIndustry;
use Illuminate\Http\Request;

class RefIndustryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $data = RefIndustry::orderBy('name', 'ASC')->get();

            return response()->json([
                'code' => 200,
                'message' => 'Successfully Process The Request',
                'data' => $data
            ]);
        } catch (\Exception $error) {
            report($error);
            return response()->json([
                'code' => $error->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $error->getMessage()))
            ], 400);
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
     * @param  \App\RefIndustry  $refIndustry
     * @return \Illuminate\Http\Response
     */
    public function show(RefIndustry $refIndustry)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\RefIndustry  $refIndustry
     * @return \Illuminate\Http\Response
     */
    public function edit(RefIndustry $refIndustry)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\RefIndustry  $refIndustry
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, RefIndustry $refIndustry)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\RefIndustry  $refIndustry
     * @return \Illuminate\Http\Response
     */
    public function destroy(RefIndustry $refIndustry)
    {
        //
    }
}
