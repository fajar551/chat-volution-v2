<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('login', 'API\AuthController@login')->name('login');
Route::post('register', 'API\AuthController@register')->name('register');
Route::get('validate/{type?}', 'API\AuthController@validateToken'); // null|'from-socket-v2'
Route::get('validate-client', 'API\AgentController@validateCompany'); // for company

// Test endpoint untuk debugging - HAPUS SETELAH TESTING
Route::get('external/clients/test', function () {
    \Log::info('✅ Test endpoint terpanggil!');
    return response()->json([
        'success' => true,
        'message' => 'Test endpoint works!',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Used in v2
Route::post('all-agents', 'API\AgentController@listByUnauthenticatedUser')->middleware('withClientKey');
Route::post('all-agents/{type}', 'API\AgentController@listByUnauthenticatedUser');
Route::post('all-uploaded-files', 'API\ChatController@showAllUploadedFiles')->middleware('withClientKey');
Route::post('from-system/all-agents', 'API\AgentController@systemGetAgentList'); // add middleware whitelist domain soon

// Get online agents from Redis (for clientarea)
Route::post('agent/online', 'API\AgentController@getOnlineAgents')->middleware('withClientKey');
Route::get('agent/online', 'API\AgentController@getOnlineAgents')->middleware('withClientKey');

// Debug endpoint to check Redis data
Route::get('agent/redis-debug', 'API\AgentController@getRedisDebugData');
Route::post('agent/redis-debug', 'API\AgentController@getRedisDebugData');
// Feature Webhook
Route::post('message-group', 'API\InternalChatController@replyChat')->name('webhook.reply_group'); // using param ?key=random_key

Route::prefix("chat")->group(function () {
    Route::post('/', 'API\ChatController@listChatUser')->name('listChatUser'); // list chat by client
    Route::post('new', 'API\ChatController@newChat')->name('newChat')->middleware('withClientKey');
    Route::post('/upload-file', 'API\ChatController@uploadFileInChat')->middleware('withClientKey');
    Route::post('/upload-file/{type}', 'API\ChatController@uploadFileInChat');
    Route::post('/send-chat/channel/{type}', 'API\ChatController@newChat'); // send chat by channel socmed (whatsapp, telegram)

    Route::post('reply', 'API\ChatController@replyChatUser')->name('replyChat'); // reply chat by user/client
    Route::post('unread-counter', 'API\ChatController@unreadCounter')->middleware('withClientKey');
    Route::post('status/update', 'API\ChatController@updateChatStatus')->name('updateChatStatus');
    Route::post('history', 'API\ChatController@historyChatUser')->name('historyChatUser');
    Route::post('history-detail', 'API\ChatController@historyChatByUser')->name('getHistoryChatByUser')->middleware('withClientKey'); // show detail chat by user/client
    // Route::get('{chat_id}', 'API\ChatController@detailChat')->name('detailChat');

    Route::post('/channel-list', 'API\ChannelController@listChannelByClient')->middleware('withClientKey');
    Route::get('/messages/default', 'API\SettingController@show')->middleware('withClientKey');
    Route::post('/submit-rating', 'API\ChatController@giveChatRating')->middleware('withClientKey');

    Route::post('agent/reply', 'API\ChatController@replyChatAgent')->name('replyChatByAgentNoAuth'); // Reply chat by agent with no auth
});

Route::prefix("industry")->group(function () {
    Route::get('/', 'API\RefIndustryController@index')->name('industries');
});

Route::group(['middleware' => ['auth:api', 'valid_agent']], function () {

    Route::prefix("agent")->group(function () {
        Route::post('all-agents', 'API\AgentController@listByUnauthenticatedUser'); // Used in v2
        Route::post('all-uploaded-files', 'API\ChatController@showAllUploadedFiles'); // Used in v2

        Route::get('generate-password', 'API\AgentController@generatePassword');

        Route::post('/', 'API\AgentController@insert');
        Route::put('/', 'API\AgentController@update');
        Route::put('/status', 'API\AgentController@updateStatus');
        Route::get('list/{type}', 'API\AgentController@list')->name('agent.list'); //middleware('hasActiveStatus');
        Route::get('/{id}', 'API\AgentController@detail');

        Route::get('details/login', 'API\AuthController@details');

        // CRUD DEPARTMENT (ONLY FOR COMPANY)
        Route::post('department/list', 'API\DepartmentController@list');
        Route::post('department', 'API\DepartmentController@insert');
        Route::put('department', 'API\DepartmentController@update');
        Route::get('department/{id}', 'API\DepartmentController@detail');
        Route::delete('department', 'API\DepartmentController@delete');

        // CRUD TOPIC
        Route::post('topic', 'API\TopicAgentController@insert');
        Route::post('topic/list', 'API\TopicAgentController@list');
        Route::put('topic', 'API\TopicAgentController@update');
        Route::get('topic/{id}', 'API\TopicAgentController@detail');
        Route::delete('topic', 'API\TopicAgentController@delete');
        Route::post('topic/select', 'API\TopicAgentController@listAgent');

        // Agent Oauth Client
        Route::get('oauth-client/list', 'API\AgentController@getListOauthClient'); // admin and company use the same endpoint
        Route::post('oauth-client', 'API\AgentController@storeOauthClient');
        Route::get('oauth-client/{id}', 'API\AgentController@showOauthClient');
        Route::delete('oauth-client/{id}', 'API\AgentController@destroyOauthClient');

        // Profile
        Route::get('profile/show', 'API\AgentProfileController@show');
        Route::post('profile/update', 'API\AgentProfileController@updateProfileByAgent');
        Route::put('profile/change-password', 'API\AgentProfileController@updatePasswordByAgent');

        // Switch Account
        // Route::get('profile/my-accounts', 'API\AgentProfileController@currentUserAccounts');
        // Route::post('/switch-account', 'API\AuthController@switchAccount');

        Route::post('chat-label', 'API\LabelController@insert');
        Route::post('chat-label/list', 'API\LabelController@list');
        Route::put('chat-label', 'API\LabelController@update');
        Route::get('chat-label/{id}', 'API\LabelController@detail');
        Route::delete('chat-label', 'API\LabelController@delete');

        // CHANNEL INTEGRATION
        Route::post('/validate-connect-channel/{type}', 'API\ChannelController@validateConnectChannel');
        Route::post('/connect-channel/{type}', 'API\ChannelController@connectChannel');
        Route::post('/disconnect-channel/{type}', 'API\ChannelController@disconnectChannel');

        Route::get('/company-channel/{type}', 'API\ChannelController@getCompanyChannelAccount');
        Route::get('/check-resend-attempt/{type}', 'API\ChannelController@checkChannelResendCode');
        Route::post('/reset-resend-attempt/{type}', 'API\ChannelController@resetChannelResendCode'); // reset only for one agent

        // CHAT GROUP
        Route::get('/chat-group/list', 'API\ChatGroupController@getList');
        Route::get('/chat-group/{id}', 'API\ChatGroupController@show');
        Route::post('/chat-group', 'API\ChatGroupController@store');
        Route::post('/chat-group/update', 'API\ChatGroupController@update');
        Route::delete('/chat-group/{id}', 'API\ChatGroupController@destroy');
        Route::post('/chat-group/{type}', 'API\ChatGroupController@attachAgentToChatGroup'); // add agent to chat group/detach agent

        Route::post('/agents-in-company', 'API\ChatGroupController@getAgentListInCompany');

        // MANAGE WEBHOOKS IN CHAT GROUP
        Route::get('/chat-webhook/list/{chat_group_id}', 'API\ChatGroupController@getListWebhook');
        Route::get('/chat-webhook/{id}', 'API\ChatGroupController@showWebhook');
        Route::post('/chat-webhook', 'API\ChatGroupController@storeWebhook');
        Route::post('/chat-webhook/update', 'API\ChatGroupController@updateWebhook');
        Route::delete('/chat-webhook/delete-image/{id}', 'API\ChatGroupController@destroyImageWebhook');
        Route::delete('/chat-webhook/{id}', 'API\ChatGroupController@destroyWebhook');

        // STATUS ALIAS
        Route::post('/status-alias', 'API\AgentController@storeStatusAlias');
        Route::delete('/status-alias', 'API\AgentController@destroyStatusAlias');
        Route::post('/get-status-alias', 'API\AgentController@getStatusAlias');

        // IMPORT FILE
        Route::post('/import-agents', 'API\AgentController@importAgent')->name('importAgent');
        Route::post('/import-departments', 'API\DepartmentController@importDepartment')->name('importDepartment');

        /** POLLS/VOTING/VOTE */
        Route::post('vote', 'API\PollController@store');
        Route::post('vote/submit-choice', 'API\PollController@submitChoice');
        // Route::post('vote/list', 'API\PollController@list');
        Route::put('vote', 'API\PollController@update');
        Route::get('vote/{id}', 'API\PollController@show');
        Route::delete('vote/{id}', 'API\PollController@destroy');

        // Manage Secret Key/Oauth REST Key
        Route::prefix("key")->group(function () {
            Route::get('list', 'API\SecretKeyController@index');
            Route::get('{id}', 'API\SecretKeyController@show');
            Route::put('{id}', 'API\SecretKeyController@update');
            Route::delete('{id}', 'API\SecretKeyController@destroy');
        });
    });

    Route::prefix("chat")->group(function () {
        // AGENT CHAT
        Route::post('agent/replytoclient', 'API\ChatController@replyChatAgent')->name('replyChatByAgent');
        Route::post('agent/upload-file', 'API\ChatController@uploadFileInChat');
        Route::post('agent/upload-file/{type}', 'API\ChatController@uploadFileInChat');
        Route::post('agent/status/update', 'API\ChatController@updateChatStatus')->name('updateChatStatusByAgent');
        Route::post('agent/history', 'API\ChatController@listChatByAgent')->name('listResolvedChatUserByAgent');
        Route::post('agent/list-chat/{type}', 'API\ChatController@listChatByAgent');
        Route::post('agent/chat-details', 'API\ChatController@historyChatUser')->name('historyChatUser'); // show chat details (chat and its replies)
        Route::post('agent/chat-info', 'API\ChatController@chatInformation'); // show chat information in details
        Route::post('agent/history-chat-action', 'API\ChatController@historyChatAction');
        Route::post('agent/unread-counter', 'API\ChatController@unreadCounter');
        Route::post('agent/send-chat-history/{type?}', 'API\ChatController@sendChatHistory')->name('sendChatHistory');

        // AGENT CHAT: FOR REPLY TO CLIENT TELEGRAM
        Route::post('agent/get-company-by-chat', 'API\ChatController@getCompanyByChatId');

        // Welcome messages/away/closing
        Route::get('agent/messages/default', 'API\SettingController@show');
        Route::post('agent/messages/default', 'API\SettingController@show');

        // TRANSFER CHAT
        Route::get('agent/available-departments-transfer', 'API\DepartmentController@listAvailableTransfer');
        Route::get('agent/available-agents-transfer', 'API\AgentController@listAvailableTransfer');
        Route::post('agent/transfer-chat', 'API\ChatController@transferChatByAgent');

        // CHAT LABEL
        Route::post('agent/chat-label/all', 'API\LabelController@getAllLabels');
        Route::get('agent/chat-label/list', 'API\LabelController@getLabelsByAgent');
        Route::post('agent/chat-label/{type}', 'API\ChatController@attachLabelToChat'); // add labels to chat/detach labels
        Route::post('agent/show-chat-label', 'API\ChatController@getLabelByChatId');

        // CHAT FILE
        Route::get('agent/get-file/{file_id}', 'API\ChatController@getFileInChat');

        Route::post('channel/list', 'API\ChannelController@list');
        Route::group(['middleware' => 'role:root'], function () {
            Route::post('channel', 'API\ChannelController@insert');
            Route::put('channel', 'API\ChannelController@update');
            Route::put('channel/status', 'API\ChannelController@updateStatus');
            Route::get('channel/{id}', 'API\ChannelController@detail');
            Route::delete('channel', 'API\ChannelController@delete');
        });

        // CRUD Topic
        Route::post('topic', 'API\TopicController@insert');
        Route::post('topic/list', 'API\TopicController@list');
        Route::put('topic', 'API\TopicController@update');
        Route::get('topic/{id}', 'API\TopicController@detail');
        Route::delete('topic', 'API\TopicController@delete');

        /** CHAT AGENT TO AGENT & INTERNAL CHAT GROUP */
        Route::group(['prefix' => 'agent/internal'], function () {
            Route::post('/new-{type}', 'API\InternalChatController@newChat')->name('newChatAgent'); // type private-chat|group-chat
            Route::post('/reply', 'API\InternalChatController@replyChat');
            Route::post('/reply-{type}', 'API\InternalChatController@replyChat');
            Route::post('/upload-file', 'API\InternalChatController@uploadFileInternalChat');
            // Route::post('/list-{type}', 'API\InternalChatController@listChat')->middleware('throttle:api-internal-chat');
            Route::post('/list-{type}', 'API\InternalChatController@listChat');
            Route::post('/chat-details', 'API\InternalChatController@showBubbleChatByChatId');
            Route::post('/delete-conversation', 'API\InternalChatController@deleteConversation');

            // DELETE BUBBLE CHAT (TARIK PESAN)
            Route::delete('/delete-chat-reply', 'API\InternalChatController@deleteBubbleChat');

            Route::post('/detail-read-chat-reply', 'API\InternalChatController@detailReadBubbleChat');

            // PIN MESSAGE
            Route::post('/pin-message', 'API\InternalChatController@updatePinBubbleChat')->name('pin');
            Route::post('/unpin-message', 'API\InternalChatController@updatePinBubbleChat')->name('unpin');

            Route::post('/reset-counter', 'API\InternalChatController@unreadCounter');

            # Chat group notification
            Route::post('/get-notification', 'API\InternalChatController@getNotification')->name('group-notification');
            Route::post('/update-read-notification', 'API\InternalChatController@updateNotification')->name('update.read-notification');

            // REQUEST MEETING LINK
            Route::post('/request-meeting/{type?}', 'API\InternalChatController@replyChat')->name('request.meeting');

            // SEARCH MESSAGE
            Route::post('search-message', 'API\InternalChatController@searchMessage')->name('searchMessage');
            // Route::post('chat-details-by-search', 'API\InternalChatController@showBubbleChatByBubbleId')->name('showBubbleChatByBubbleId');
        });

        /** CHAT LIST REPORT */
        Route::post('agent/chat-list-report', 'API\ChatController@chatListReportByAgent'); // is as the same as listChatByAgent
        Route::get('agent/agent-list', 'API\AgentController@listAgentInReportFilter')->name('report.agent.list');
    });

    Route::prefix("quick")->group(function () {
        Route::post('reply', 'API\QuickReplyController@insert');
        Route::put('reply', 'API\QuickReplyController@update');
        Route::post('reply/list', 'API\QuickReplyController@list');
        Route::get('reply/{id}', 'API\QuickReplyController@detail');
        Route::delete('reply', 'API\QuickReplyController@delete');
    });

    // Quick Replies - GET endpoint for React frontend
    Route::options('quick-replies', 'API\QuickReplyController@getAllQuickReplies'); // CORS preflight
    Route::get('quick-replies', 'API\QuickReplyController@getAllQuickReplies');

    Route::post('faq', 'API\FaqController@insert');
    Route::put('faq', 'API\FaqController@update');
    Route::get('faq/{id}', 'API\FaqController@detail');
    Route::delete('faq', 'API\FaqController@delete');

    Route::prefix("setting")->group(function () {
        Route::post('/', 'API\SettingController@insert');
        Route::put('/', 'API\SettingController@update');
        Route::post('list', 'API\SettingController@list');
        Route::get('{id}', 'API\SettingController@show');
        Route::post('message', 'API\SettingController@message');
        Route::delete('/', 'API\SettingController@delete');
    });

    Route::prefix("settings")->group(function () {
        Route::get('/', 'API\SettingController@show'); // show welcome/closing message by meta value

        // My Settings (for Agent)
        Route::prefix("me")->group(function () {
            Route::post('/', 'API\SettingController@storeMySetting');
            Route::get('{type?}', 'API\SettingController@showMySetting'); // show sound-notification
        });
    });

    Route::prefix("dummy")->group(function () {
        Route::get('accounts', 'API\DummyController@contactLists');
        Route::get('contacts', 'API\DummyController@contactLists');
        Route::get('billings', 'API\DummyController@billingLists');
        Route::get('leads', 'API\DummyController@leadLists');
        Route::get('opportunities', 'API\DummyController@opportunityList');
        Route::get('tasks', 'API\DummyController@taskLists');
        Route::get('accounts-social', 'API\DummyController@accountListSocial');
        Route::get('groups-social', 'API\DummyController@groupListSocial');
    });


    //ROUTE ROLE ROOT ATAU ADMINISTRATOR
    Route::group(['middleware' => 'role:root'], function () {

        Route::prefix("settings")->group(function () {
            Route::get('package/list', 'API\Admin\PackageController@listPackage');
            Route::post('package/set/list', 'API\Admin\PackageController@list');
            Route::get('package/set/{id}', 'API\Admin\PackageController@detail');
            Route::put('package/set', 'API\Admin\PackageController@update');
        });

        Route::prefix("agent")->group(function () {
            Route::post('roles/list', 'API\Admin\RolesController@list');
            Route::post('roles', 'API\Admin\RolesController@insert');
            Route::put('roles', 'API\Admin\RolesController@update');
            Route::put('roles/status', 'API\Admin\RolesController@updateStatus');
            Route::get('roles/{id}', 'API\Admin\RolesController@detail');
            Route::delete('roles', 'API\Admin\RolesController@delete');

            Route::post('admin', 'API\AgentController@insertAdmin');
            Route::put('admin', 'API\AgentController@updateAdmin');
            Route::get('admin/list/{type}', 'API\AgentController@listAdmin');
            Route::get('admin/{id}', 'API\AgentController@detailAdmin');

            // COMPANY DETAIL
            Route::group(['prefix' => 'admin/company'], function () {
                Route::get('/list', 'API\CompanyDetailController@list');
                Route::get('/show/{id}', 'API\CompanyDetailController@show');
                Route::put('/update', 'API\CompanyDetailController@update');
            });
            Route::post('company/department/list', 'API\DepartmentController@listCompanyDepartment');

            // USER PERMISSION
            Route::group(['prefix' => 'admin/permission'], function () {
                Route::get('/list', 'API\PermissionController@list');
            });
        });

        Route::prefix("chat")->group(function () {
            Route::post('channel/list', 'API\ChannelController@list');
            Route::post('channel', 'API\ChannelController@insert');
            Route::put('channel', 'API\ChannelController@update');
            Route::get('channel/{id}', 'API\ChannelController@detail');
            Route::delete('channel', 'API\ChannelController@delete');
        });

        Route::post('topic/admin/list', 'API\TopicAgentController@listAdmin');

        // ACTIVITY LOG
        Route::prefix("/activity-log")->group(function () {
            Route::post('/', 'API\ActivityLogController@index');
            Route::get('/{id}', 'API\ActivityLogController@show');
        });
    });

    // EXAMPLE GENERAL API
    Route::prefix("example")->group(function () {
        Route::get('/success', 'API\Example\MyExampleController@success');
        Route::get('/error', 'API\Example\MyExampleController@error');
    });

    Route::prefix('smm')->group(function () {

        // SMM Socmed Channel
        Route::get('socmed-channel', 'API\SmmSocmedChannelController@getList');
        Route::post('socmed-channel', 'API\SmmSocmedChannelController@store');
        Route::put('socmed-channel/update-status', 'API\SmmSocmedChannelController@updateStatus');
        Route::get('socmed-channel/{id}', 'API\SmmSocmedChannelController@show');
        Route::delete('socmed-channel/{id}', 'API\SmmSocmedChannelController@destroy');
        Route::put('socmed-channel/{id}', 'API\SmmSocmedChannelController@update');

        // SMM Socmed Account
        Route::get('socmed-account', 'API\SmmSocmedAccountController@getList');
        Route::get('socmed-account/{id}', 'API\SmmSocmedAccountController@show');
        Route::put('socmed-account/{id}', 'API\SmmSocmedAccountController@update');
        Route::delete('socmed-account/{id}', 'API\SmmSocmedAccountController@destroy');

        // SMM Post
        Route::get('post', 'API\SmmPostController@getList');
        Route::get('post/{id}', 'API\SmmPostController@show');
        Route::post('post', 'API\SmmPostController@store');
        Route::put('post/{id}', 'API\SmmPostController@update');
        Route::delete('post/{id}', 'API\SmmPostController@destroy');
    });

    // Set App Language
    Route::get('language/{locale}', 'API\LocalizationController@setLang');

    /* logout */
    Route::post('logout', 'API\AuthController@logout');
    Route::post('agent/online-status/update', 'API\AgentController@updateOnlineStatus')->name('updateOnlineStatusByAgent');

    // Update User Device Token
    Route::patch('/fcm-token', 'API\AuthController@updateToken')->name('fcmToken');
});

// NO AUTH ROUTE
Route::put('agent/verification', 'API\AgentController@verification');
Route::post('agent/verification/resend', 'API\AuthController@resendVerificationEmail');
Route::post('/connect-channel/{type}', 'API\ChannelController@connectChannel'); // connect whatsapp with uuid
Route::post('/get-status-alias/{all}', 'API\AgentController@getStatusAlias'); // ALL AGENTS STATUS ALIAS
Route::get('/profile/show', 'API\AgentProfileController@showByCompanySecret')->middleware('withClientKey'); // show agent profile by secret key
Route::get('/auto-solve-chat', 'API\ChatController@autoUpdateChatStatus'); // auto solve active chat, exists in web routes too
Route::post('faq/list', 'API\FaqController@list');

// CHAT
Route::get('/available-channel-account/list', 'API\ChannelController@getCompanyChannelAccountList');
Route::get('/available-topics/list', 'API\TopicController@list'); // list topic by company
Route::get('/available-departments/list', 'API\DepartmentController@listCompanyDepartment'); // departmen by company

// CHAT TELEGRAM
Route::get('/channel-account-list/{type}', 'API\ChannelController@getAccListByChannel');
Route::post('/reset-resend-attempt/{type}', 'API\ChannelController@resetChannelResendCode'); // reset all agents telegram resend code

Route::get('checkdomain', 'API\AgentController@checkDomain'); // TEST DEV

// FORGOT PASSWORD/RESET PASSWORD
Route::post('password/forgot-password', 'API\ForgotPasswordController@sendResetLinkResponse')->name('passwords.sent');
Route::post('password/reset', 'API\ResetPasswordController@sendResetResponse');

// CRUD File Example
Route::get('images', 'API\FileController@list');
Route::post('images', 'API\FileController@store');
Route::delete('images/{id}', 'API\FileController@destroy');
Route::post('update-images/{id}', 'API\FileController@update');

// External Database - Get clients from external database
// MOVED TO WEB ROUTES (routes/web.php) - No authentication required
