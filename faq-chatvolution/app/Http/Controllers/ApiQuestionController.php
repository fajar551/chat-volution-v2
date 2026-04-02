<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\ProductHosting;
use App\Models\Payment;

class ApiQuestionController extends Controller
{
    public $successStatus = 200;
    
    public function getFaqsByCategory($category)
    {
        try{
            $faqs = Question::where('category', $category)
            ->select('id', 'category', 'question')
            ->with(['answers' => function ($query) {
                $query->select('question_id', 'answer');
            }])
            ->with(['relatedQuestions' => function ($query) {
                $query->select('question_id', 'type', 'related_question', 'answer');
            }])
            ->get();

            return response()->json([
                'code' => 200,
                'message' => 'Successfully Procces The Request!',
                'category' => $category,
                'data' => $faqs,
            ], $this->successStatus);

        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }   
    }

    public function getClassificationHosting()
    {
        try{
            $panels = ProductHosting::select('panel')->distinct()->pluck('panel')->toArray();
            $kapasitas = ProductHosting::select('kapasitas')->distinct()->pluck('kapasitas')->toArray();
            $akunEmail = ProductHosting::select('akun_email')->distinct()->pluck('akun_email')->toArray();
            $tipeHosting = ProductHosting::select('tipe_hosting')->distinct()->pluck('tipe_hosting')->toArray();

            $class = [
                'panels' => $panels,
                'kapasitas' => $kapasitas,
                'akun_email' => $akunEmail,
                'tipe_hosting' => $tipeHosting,
            ];

            return response()->json([
                'code' => 200,
                'message' => 'Successfully Procces The Request!',
                'data' => $class,
            ], $this->successStatus);
        }catch (\Exception $e){
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ',$e->getMessage()))
            ], 400);
        }   
    }

    public function searchHosting(Request $request)
    {
        $panel = $request->input('panel');
        $akunEmail = $request->input('akun_email');
        $kapasitas = $request->input('kapasitas');
        $tipeHosting = $request->input('tipe_hosting');

        // Query the database to search for hostings with the specified criteria
        $hostings = ProductHosting::where('panel', $panel)
            ->where('akun_email', $akunEmail)
            ->where('kapasitas', $kapasitas)
            ->where('tipe_hosting', $tipeHosting)
            ->get();

        // Prepare the response data
        if ($hostings->isEmpty()) {
            $similarHostings = ProductHosting::where('panel', $panel)
                ->orWhere('akun_email', $akunEmail)
                ->orWhere('kapasitas', $kapasitas)
                ->orWhere('tipe_hosting', $tipeHosting)
                ->selectRaw('*, 
                    (panel = ?) + 
                    (akun_email = ?) + 
                    (kapasitas = ?) + 
                    (tipe_hosting = ?) AS matched_criteria_count', [$panel, $akunEmail, $kapasitas, $tipeHosting])
                ->orderByRaw('matched_criteria_count DESC')
                ->first();

            return response()->json([
                'code' => 200,
                'message' => 'Hosting tidak ditemukan',
                'data' => [
                    'hostings' => [],
                    'similar_hostings' => $similarHostings,
                ],
            ], $this->successStatus);
        }

        return response()->json([
            'code' => 200,
            'message' => 'Hosting berhasil ditemukan',
            'data' => [
                'hostings' => $hostings,
                'similar_hostings' => [],
            ],
        ], $this->successStatus);
    }

    public function getAllPaymentMethods()
    {
        try{
            $paymentMethods = Payment::all();

            return response()->json([
                'code' => 200,
                'message' => 'Successfully Procces The Request!',
                'data' => $paymentMethods,
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
