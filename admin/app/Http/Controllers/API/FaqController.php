<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\Faq;
use App\Http\Controllers\Controller;
use Validator;
use Illuminate\Support\Facades\DB;

class FaqController extends Controller
{
    public $successStatus = 200;
    
    public function insert(Request $request){

        $validator = Validator::make($request->all(), [
            'question' => 'required|string',
            'answer' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);            
        }

        try{

            $data = new Faq;
            $data->question = $request->question;
            $data->answer = $request->answer;
            $data->save();

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
            'question' => 'required|string',
            'answer' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error'=>$validator->errors()], 401);            
        }

        try{

            $data = Faq::where('id',$request->id)->first();
            $data->question = $request->question;
            $data->answer = $request->answer;
            $data->save();

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

            if(isset($request->search)){
                $data = DB::select("SELECT * FROM faq WHERE MATCH (question,answer) AGAINST ('".$request->search."' IN NATURAL LANGUAGE MODE)");
            }else{
                $data = Faq::all();
            }

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
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
            $data = Faq::where('id',$request->id)->first();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
                'data' => $data
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
            Faq::where('id',$request->id)->delete();

            return response()->json([
                'code' => 200,
                'messgae' => 'Successfully Procces The Request!',
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }
    }
}
