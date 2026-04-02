<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WhatsAppReportController extends Controller
{
    /**
     * Get list of WhatsApp messages for report
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getListReport(Request $request)
    {
        try {
            // Validasi parameter
            $validator = Validator::make($request->all(), [
                'page' => 'nullable|integer|min:1',
                'message' => 'nullable|string',
                'chat_id' => 'nullable|string',
                'user_name' => 'nullable|string',
                'user_email' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
                'agent_id' => 'nullable|integer',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'code' => 400,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Ambil parameter
            $page = $request->input('page', 1);
            $perPage = 15; // Default per page
            $message = $request->input('message', '');
            $chatId = $request->input('chat_id', '');
            $userName = $request->input('user_name', '');
            $userEmail = $request->input('user_email', '');
            $startDate = $request->input('start_date', '');
            $endDate = $request->input('end_date', '');
            $agentId = $request->input('agent_id', '');

            // Query builder
            $query = DB::table('whatsapp_messages')
                ->select([
                    'id',
                    'message_id',
                    'from_number',
                    'to_number',
                    'body',
                    'rating',
                    'is_read',
                    'chat_status',
                    'assigned_to',
                    'media_data',
                    'message_type',
                    'direction',
                    'timestamp',
                    'received_at',
                    'agent_id',
                    'name',
                    'chat_session_id',
                    'status',
                    'createdAt',
                    'updatedAt',
                    'instance',
                    'perusahaan'
                ]);

            // Filter berdasarkan message (body)
            if (!empty($message)) {
                $query->where('body', 'like', '%' . $message . '%');
            }

            // Filter berdasarkan chat_id (message_id atau chat_session_id)
            if (!empty($chatId)) {
                $query->where(function($q) use ($chatId) {
                    $q->where('message_id', 'like', '%' . $chatId . '%')
                      ->orWhere('chat_session_id', 'like', '%' . $chatId . '%');
                });
            }

            // Filter berdasarkan user_name (from_number)
            if (!empty($userName)) {
                $query->where('from_number', 'like', '%' . $userName . '%');
            }

            // Filter berdasarkan agent_id
            if (!empty($agentId)) {
                $query->where('agent_id', $agentId);
            }

            // Filter berdasarkan tanggal
            if (!empty($startDate)) {
                $query->whereDate('received_at', '>=', $startDate);
            }

            if (!empty($endDate)) {
                $query->whereDate('received_at', '<=', $endDate);
            }

            // Order by received_at descending (terbaru dulu)
            $query->orderBy('received_at', 'desc');

            // Hitung total data
            $totalData = $query->count();

            // Pagination
            $offset = ($page - 1) * $perPage;
            $messages = $query->skip($offset)->take($perPage)->get();

            // Format data sesuai kebutuhan React
            $formattedData = $messages->map(function ($message) {
                return [
                    'chat_id' => $message->chat_session_id ?? $message->message_id ?? null,
                    'message' => $message->body ?? '',
                    'user_name' => $message->from_number ?? '',
                    'agent_name' => $message->name ?? '',
                    'user_site_url' => null, // Tidak ada di whatsapp_messages
                    'user_email' => null, // Tidak ada di whatsapp_messages
                    // Data lengkap untuk detail jika diperlukan
                    'id' => $message->id,
                    'message_id' => $message->message_id,
                    'from_number' => $message->from_number,
                    'to_number' => $message->to_number,
                    'body' => $message->body,
                    'rating' => $message->rating,
                    'is_read' => $message->is_read,
                    'chat_status' => $message->chat_status,
                    'assigned_to' => $message->assigned_to,
                    'media_data' => $message->media_data,
                    'message_type' => $message->message_type,
                    'direction' => $message->direction,
                    'timestamp' => $message->timestamp,
                    'received_at' => $message->received_at,
                    'agent_id' => $message->agent_id,
                    'name' => $message->name,
                    'chat_session_id' => $message->chat_session_id,
                    'status' => $message->status,
                    'createdAt' => $message->createdAt,
                    'updatedAt' => $message->updatedAt,
                    'instance' => $message->instance,
                    'perusahaan' => $message->perusahaan,
                ];
            });

            // Hitung total page
            $totalPage = ceil($totalData / $perPage);

            return response()->json([
                'code' => 200,
                'data' => [
                    'data' => [
                        'list' => $formattedData,
                        'current_page' => (int)$page,
                        'total' => $totalData,
                        'total_data' => $totalData,
                        'total_page' => $totalPage,
                        'per_page' => $perPage,
                        'first_page' => 1,
                        'last_page' => $totalPage,
                        'next_page' => $page < $totalPage ? $page + 1 : null,
                        'prev_page' => $page > 1 ? $page - 1 : null,
                    ]
                ],
                'message' => 'Success'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

