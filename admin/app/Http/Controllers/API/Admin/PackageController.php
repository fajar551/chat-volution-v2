<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PackageSetting;
use App\Models\Package;
use Validator;

class PackageController extends Controller
{
    public $successStatus = 200;

    public function listPackage(Request $request)
    {
        try {
            $data = Package::all();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
            ], $this->successStatus);
            
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function list(Request $request)
    {
        try {
            $data = PackageSetting::all();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
            ], $this->successStatus);
            
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function detail(Request $request)
    {
        try {

            $data = Package::where('id', $request->id)->get();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
            ], $this->successStatus);
            
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'settings' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);            
        }

        try {

            $data = Package::where('id', $request->id)->first();
            $data->settings = $request->settings;
            $data->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!' 
            ], $this->successStatus);
            
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }
    
}
