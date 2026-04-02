<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChatGroupRequest;
use App\Http\Requests\InternalChatReplyRequest;
use App\Http\Requests\InternalChatFileRequest;
use App\Services\InternalChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;

class InternalChatController extends ApiController
{
    public function __construct(
        InternalChatService $internal_chat_service
    ) {
        $this->internal_chat_service = $internal_chat_service;

        // dev test permission
        // $this->middleware('permission:create-internal-chat|read-internal-chat', ['only' => ['listChat','unreadCounter','getNotification','detailReadBubbleChat','showBubbleChatByChatId']]);
        // $this->middleware('permission:create-internal-chat', ['only' => ['newChat','replyChat','uploadFileInternalChat']]);
        // $this->middleware('permission:update-internal-chat', ['only' => ['updateNotification','updatePinBubbleChat']]);
        // $this->middleware('permission:delete-internal-chat', ['only' => ['deleteConversation','deleteBubbleChat']]);

        $route_name = Route::currentRouteName();
        if($route_name != 'webhook.reply_group')
            $this->middleware('company_feature_permission');
    }

    /**
     * @param $type = private-chat|group-chat
     */
    public function newChat(Request $request, $type)
    {
        try {
            if ($type == 'private-chat') {
                $store = $this->internal_chat_service->storeFirstChat($request->all(), 'private');
            } else {
                // for group
                $store = $this->internal_chat_service->storeFirstChatToGroup($request->all(), 'group');
            }

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * @param String $type = null|group|webhook.reply_group
     *
     * if type null, then it is for private chat
     */
    public function replyChat(InternalChatReplyRequest $request, $type = null)
    {
        try {
            $route_name = Route::currentRouteName();
            $request_meeting = $route_name == 'request.meeting' ? true : false;
            if($route_name == 'webhook.reply_group')
                $type = $route_name;

            switch ($type) {
                case 'group':
                    $store = $this->internal_chat_service->replyChatToGroup($request->all(), $request_meeting);
                    break;

                case 'webhook.reply_group':
                    $store = $this->internal_chat_service->replyChatToGroupByAnonymous($request->all(), null);
                    break;

                default:
                    $store = $this->internal_chat_service->replyChat($request->all(), $request_meeting);
                    break;
            }

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function uploadFileInternalChat(InternalChatFileRequest $request)
    {
        try {
            $store = $this->internal_chat_service->uploadFileInternalChat($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function showBubbleChatByChatId(Request $request)
    {
        try {
            $list = [];
            $reset_counter = $this->internal_chat_service->countUnreadChatByID($request->all(), 'reset_unread');
            if($reset_counter['code'] == 200)
                $list = $this->internal_chat_service->showBubbleChatByChatId($request->all());

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * List chat based on type, there are two types = private|group
     * type 'pin-message' is for showing pinned message by its chat room
     *
     * @param $type = private-chat|group-chat|pin-message
     */
    public function listChat(Request $request, $type)
    {
        try {
            if ($type == 'private-chat') {
                $list = $this->internal_chat_service->listChat($request->all(), 'private');
            } elseif ($type == 'group-chat') {
                $list = $this->internal_chat_service->listChatGroup($request->all(), 'group');
            } elseif ($type == 'pinned-message') {
                $list = $this->internal_chat_service->listPinnedChat($request->all());
            } else {
                return $this->errorResponseWithLog( null,  'List chat error: Undefined type. '. __('messages.request.error'));
            }

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function unreadCounter(Request $request)
    {
        try {
            // $validator = Validator::make($request->all(), [
            //     'chat_id' => 'required'
            // ]);

            // if ($validator->fails()) {
            //     return response()->json(['error' => $validator->errors()], 401);
            // }
            $store = $this->internal_chat_service->countUnreadChatByID($request->all());

            if ($store['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $store) ? $store['data'] : null), $store['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $store) ? $store['data'] : null),  $store['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function deleteConversation(Request $request, $type = null)
    {
        try {
            $remove = $this->internal_chat_service->deleteConversation($request->all());

            if ($remove['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $remove) ? $remove['data'] : null), $remove['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $remove) ? $remove['data'] : null),  $remove['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function deleteBubbleChat(Request $request, $type = null)
    {
        try {
            $remove = $this->internal_chat_service->deleteBubbleChat($request->all());

            if ($remove['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $remove) ? $remove['data'] : null), $remove['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $remove) ? $remove['data'] : null),  $remove['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function detailReadBubbleChat(Request $request, $type = null)
    {
        try {
            $remove = $this->internal_chat_service->detailReadBubbleChat($request->all());

            if ($remove['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $remove) ? $remove['data'] : null), $remove['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $remove) ? $remove['data'] : null),  $remove['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function getNotification(Request $request)
    {
        try {
            $list = $this->internal_chat_service->getNotification($request->all());

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function updateNotification(Request $request)
    {
        try {
            $list = $this->internal_chat_service->updateNotificationByField(['is_read' => 1]);

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * @param String $type = pin|unpin
     */
    public function updatePinBubbleChat(Request $request, $type = null)
    {
        try {
            $type = Route::currentRouteName();
            if ($type == 'pin' || $type == 'unpin') {
                $remove = $this->internal_chat_service->updatePinBubbleChat($request->all(), $type);
            } else {
                return $this->errorResponseWithLog( null,  'Pin message error: Undefined type. '. __('messages.request.error'));
            }

            if ($remove['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $remove) ? $remove['data'] : null), $remove['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $remove) ? $remove['data'] : null),  $remove['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Search message in all chat room
     */
    public function searchMessage(Request $request)
    {
        try {
            $list = $this->internal_chat_service->searchMessage($request);

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    /**
     * Show chat detail by chat bubble id
     */
    public function showBubbleChatByBubbleId(Request $request, $type=null)
    {
        try {
            $list = $this->internal_chat_service->showBubbleChatByChatId($request->all());

            if ($list['code'] == 200) {
                return $this->successResponse((array_key_exists('data', $list) ? $list['data'] : null), $list['message']);
            } else {
                return $this->errorResponseWithLog((array_key_exists('data', $list) ? $list['data'] : null),  $list['message']);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }
}
