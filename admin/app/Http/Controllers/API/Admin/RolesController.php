<?php

namespace App\Http\Controllers\API\Admin;

use Illuminate\Http\Request;
use App\Models\Roles;
use App\Http\Controllers\Controller;
use Validator;

class RolesController extends Controller
{
    public $successStatus = 200;

    public function insert(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'permission' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $roles = new Roles;
            $roles->guard_name = 'api';
            $roles->name = $request->name;
            $roles->permission = $request->permission;
            $roles->save();

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

    public function update(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'permission' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {

            $roles = Roles::where('id', $request->id)->first();
            $roles->name = $request->name;
            $roles->permission = $request->permission;
            $roles->status = $request->status;
            $roles->save();

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

    public function updateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 401);
        }

        try {
            $roles = Roles::where('id', $request->id)->first();
            $roles->status = $request->status;
            $roles->save();

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

    public function list(Request $request)
    {
        try {

            $roles = Roles::all();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $roles
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
            $roles = Roles::where('id', $request->id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $roles
            ], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    public function delete(Request $request)
    {
        try {
            Roles::where('id', $request->id)->delete();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
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
