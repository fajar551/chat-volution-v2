<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Labels;
use App\Http\Controllers\Controller;
use App\Services\LabelService;
use Validator;
use Illuminate\Support\Facades\Auth;

use App\Http\Controllers\API\ApiController;

class LabelController extends ApiController
{

    public $successStatus = 200;

    public function insert(Request $request){

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required|string',
            'color' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);
        }

        try{

            $id = Auth::user()->id;
            $label = new Labels;
            $label->id_agent = $id;
            $label->name = $request->name;
            $label->description = $request->description;
            $label->color = $request->color;
            $label->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    public function update(Request $request){

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required|string',
            'color' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);
        }

        try{

            $id = Auth::user()->id;
            $label = Labels::where('id',$request->id)->where('id_agent',$id)->first();
            $label->name = $request->name;
            $label->description = $request->description;
            $label->color = $request->color;
            $label->save();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!'
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    public function list(Request $request){
        try{

            $id = Auth::user()->id;
            $label = Labels::where('id_agent',$id)->get();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!....',
                'data' => $label
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    public function detail(Request $request){
        try{
            $id = Auth::user()->id;
            $label = Labels::where('id',$request->id)->where('id_agent',$id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $label
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    public function delete(Request $request){
        try{
            //delete on cascade  agent chat topic
            $id = Auth::user()->id;
            $delete = Labels::where('id',$request->id)->where('id_agent',$id)->first()->delete();

            $msg = __('messages.delete.error');
            if( $delete )
                $msg = __('messages.delete.success');

            return response()->json([
                'code' => 200,
                'messgae' => $msg,
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    /**
     * Show available chat labels
     * based on logged in agent
     *
     * used in chat feature
     */
    public function getLabelsByAgent(Request $request, LabelService $label_service)
    {
        try {
            $list = $label_service->chatLabelsByAgent($request->all());
            $data = $list['data'];
            // uncomment this later, when there is modification from current response to general response
            // if ($list['code'] == 200) {
            //     return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            // } else {
            //     return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            // }

            return response()->json([
                'code' => 200,
                'messgae' => $list['message'],
                'data' => $data
            ], $this->successStatus);

        } catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }

    /**
     * Show all chat labels
     *
     * used in show list resolve chat feature in v2
     */
    public function getAllLabels(Request $request, LabelService $label_service)
    {
        try {
            $list = $label_service->getAllLabels($request->all());
            $data = $list['data'];

            if ($list['code'] == 200) {
                return $this->successResponse( (array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponse( (array_key_exists('data', $list) ? $list['data'] : null),  $list['message'] );
            }
        } catch (\Exception $e){
            report($e);
            return $this->errorResponse( null, trim(preg_replace('/\s+/', ' ',$e->getMessage())), $e->getCode() );
        }
    }
}
