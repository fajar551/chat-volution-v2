<?php

use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/register', 'WEB\GuestController@Register');
Route::get('/login', 'WEB\GuestController@Login');
Route::prefix('verify')->group(function () {
    Route::get('/register', 'WEB\GuestController@verifyRegister');
});

// FORGOT PASSWORD/RESET PASSWORD
Route::get('/forgot-password', 'WEB\GuestController@forgotPassword')->name('password.request');
Route::get('/reset-password', 'WEB\GuestController@resetPassword')->name('password.reset'); // view for reset password

Route::prefix('profile')->group(function () {
    Route::get('/', 'WEB\LiveChatController@profile');
    Route::get('/update', 'WEB\LiveChatController@profileUpdate');
    Route::get('/change-password', 'WEB\LiveChatController@profileChangePassword');
});

Route::prefix("client_ui")->group(function () {
    Route::get('channel', 'API\ChannelController@list');
    Route::get('department', 'API\DepartmentController@list');
    Route::get('topic', 'API\TopicController@list');
});

Route::get('/external/clientsqwords', 'API\ExternalClientController@getClientsQwords');
Route::get('/external/clientsrelabs', 'API\ExternalClientController@getClientsRelabs');
Route::get('/external/clientsgoldenfast', 'API\ExternalClientController@getClientsGoldenFast');
Route::get('/external/clientsbikinwebsite', 'API\ExternalClientController@getClientsBikinWebsite');
Route::get('/external/clientsgudangssl', 'API\ExternalClientController@getClientsGudangSsl');

Route::get('/external/clientqwordsbyphone', 'API\ExternalClientController@getClientByPhoneQwords');
Route::get('/external/clientrelabsbyphone', 'API\ExternalClientController@getClientByPhoneRelabs');
Route::get('/external/clientgoldenfastbyphone', 'API\ExternalClientController@getClientByPhoneGoldenFast');
Route::get('/external/clientbikinwebsitebyphone', 'API\ExternalClientController@getClientByPhoneBikinWebsite');
Route::get('/external/clientgudangsslbyphone', 'API\ExternalClientController@getClientByPhoneGudangSsl');



Route::get('/roles', 'WEB\LiveChatController@roleList');
Route::get('/add-role', 'WEB\LiveChatController@roleAdd');
Route::get('/departments', 'WEB\LiveChatController@departmentList');
Route::get('/add-department', 'WEB\LiveChatController@departmentAdd');
Route::get('/edit-department', 'WEB\LiveChatController@departmentEdit');

Route::get('/', function () {
    return view('live-chat.auth.login', ['guest' => true]);
});

/* home page */
Route::get('/home', 'WEB\LiveChatController@welcome');

/** DEV DEBUG */
// Route::patch('/fcm-token', 'WEB\LiveChatController@updateToken')->name('fcmToken');
// Route::get('/send-notification', 'WEB\LiveChatController@notification')->name('notification');

/* chatting route */
// Route::prefix("agent-chatting")->group(function () {
// Route::get('/', 'WEB\AgentChatController@Chat');
// Route::get('/testing', 'WEB\AgentChatController@ChatTesting');
// });
// Route::get('/dashoard', 'WEB\LiveChatController@dashboard');


Route::prefix('chat')->group(function () {
    Route::get('/client', 'WEB\LiveChatController@dashboard');
    Route::get('/internal', 'WEB\AgentChatController@Chat');
    Route::get('/internal-testing', 'WEB\AgentChatController@ChatTesting');
    Route::prefix('report')->group(function () {
        Route::get('/', 'WEB\LiveChatController@reportChat');
        Route::get('/detail/{chat_id}', 'WEB\LiveChatController@reportChatDetail');
    });
});


/* integrations route */
Route::get('/tokens', 'WEB\LiveChatController@tokens');
Route::prefix("integrations")->group(function () {
    Route::get('/telegram', 'WEB\LiveChatController@integrationTelegram');
    Route::get('/whatsapp', 'WEB\LiveChatController@integrationWhatsapp');
    Route::get('/whatsapp-irsfa', 'WEB\LiveChatController@integrationWhatsappIrsfa');
    Route::get('/whatsapp-relabs', 'WEB\LiveChatController@integrationWhatsappRelabs');
    Route::get('/whatsapp-agent-1', 'WEB\LiveChatController@integrationWhatsappAgent1');
    Route::get('/whatsapp-agent-2', 'WEB\LiveChatController@integrationWhatsappAgent2');
    Route::get('/whatsapp-agent-3', 'WEB\LiveChatController@integrationWhatsappAgent3');
    Route::get('/whatsapp-agent-4', 'WEB\LiveChatController@integrationWhatsappAgent4');
    Route::get('/whatsapp-agent-5', 'WEB\LiveChatController@integrationWhatsappAgent5');
    Route::get('/whatsapp-agent-6', 'WEB\LiveChatController@integrationWhatsappAgent6');
    // Route::get('/whmcs', 'WEB\LiveChatController@integrationWHMCS');
});

// secret key route
Route::get('/keys', 'WEB\LiveChatController@integrationKeys');
Route::get('/add-key', 'WEB\LiveChatController@addKeys');
Route::get('/edit-key', 'WEB\LiveChatController@editKeys');


/* topic route */
Route::get('/edit-topic', 'WEB\LiveChatController@editTopic');
Route::get('/topics', 'WEB\LiveChatController@listTopics');
Route::get('/add-topic', 'WEB\LiveChatController@addTopics');

/* channel route */
Route::get('/channels', 'WEB\LiveChatController@listChannel');
Route::get('/add-channel', 'WEB\LiveChatController@addChannel');
Route::get('/edit-channel', 'WEB\LiveChatController@editChannel');

/* company route */
Route::get('/company', 'WEB\LiveChatController@listCompany');
Route::get('/add-company', 'WEB\LiveChatController@addCompany');

/* staff route */
Route::get('/staff', 'WEB\LiveChatController@listStaff');
Route::get('/add-staff', 'WEB\LiveChatController@addStaff');
Route::get('/edit-staff', 'WEB\LiveChatController@editStaff');

/* agent route */
Route::get('/add-agent', 'WEB\LiveChatController@addAgent');
Route::get('/agents', 'WEB\LiveChatController@listAgents');
Route::get('/edit-agent', 'WEB\LiveChatController@editAgent');
Route::get('/detail-agent', 'WEB\LiveChatController@detailAgent');

/* labels route */
Route::get('/labels', 'WEB\LiveChatController@listLabels');
Route::get('/add-label', 'WEB\LiveChatController@addLabel');
Route::get('/edit-label', 'WEB\LiveChatController@editLabel');

/* FAQs route */
Route::get('/faq', 'WEB\LiveChatController@listFaq');
Route::get('/add-faq', 'WEB\LiveChatController@addFaq');
Route::get('/edit-faq', 'WEB\LiveChatController@editFaq');

/* billings route */
Route::get('/billings', 'WEB\LiveChatController@listBilling');


/* quick reply */
Route::get('/general-quick-replies', 'WEB\LiveChatController@general');
Route::get('/personal-quick-replies', 'WEB\LiveChatController@personal');
Route::get('/add-general-quick-replies', 'WEB\LiveChatController@addQuickGeneral');
Route::get('/add-personal-quick-replies', 'WEB\LiveChatController@addQuickPersonal');
Route::get('/edit-general-quick-replies', 'WEB\LiveChatController@editQuickGeneral');
Route::get('/edit-personal-quick-replies', 'WEB\LiveChatController@editQuickPersonal');

/* setting messages */
Route::get('/welcome-message', 'WEB\LiveChatController@welcomeMessage');
Route::get('/away-message', 'WEB\LiveChatController@awayMessage');
Route::get('/closing-message', 'WEB\LiveChatController@closingMessage');
Route::get('/inbox-setting', 'WEB\LiveChatController@inboxSetting');


Route::prefix("testing")->group(function () {
    Route::get('code', 'API\AuthController@testing');
});

/* Route CRM Dashboard*/
Route::get('/crm', function () {
    return view('crm.dashboard.crm-dashboard', ["title" => "Dashboard"]);
});

/* Route CRM Accounts */
Route::get('/crm-accounts', 'WEB\CRMController@accounts');
Route::get('/crm-detail-account', 'WEB\CRMController@detailAccount');

/* Route CRM Contacts */
Route::get('/crm-contacts', 'WEB\CRMController@contacts');

/* Route CRM leads */
Route::get('/crm-leads', 'WEB\CRMController@leads');

/* Route CRM Opportunity */
Route::get('/crm-opportunities', 'WEB\CRMController@opportunities');

/* Route CRM Tasks */
Route::get('/crm-tasks', 'WEB\CRMController@tasks');

/* Route CRM Calendar */
Route::get('/crm-calendar', 'WEB\CRMController@calendar');

/* Route CRM Notes */
Route::get('/crm-notes', 'WEB\CRMController@notes');

/* Route Social Dashboard */
Route::get('/social-dashboard', 'WEB\SocialController@dashboard');

/* Route Social Account */
Route::get('/social-create-account', 'WEB\SocialController@createAccounts');
Route::get('/social-accounts', 'WEB\SocialController@accounts');

/* Route Social Groups */
Route::get('/social-groups', 'WEB\SocialController@groups');
Route::get('/social-create-group', 'WEB\SocialController@addGroup');
Route::get('/social-edit-group', 'WEB\SocialController@editGroup');

/* Route Social Posts */
Route::get('/social-create-post', 'WEB\SocialController@addPost');

// Facebook
Route::get('auth/facebook', 'WEB\SocialController@facebookRedirect')->name('facebook.login');
Route::get('auth/facebook/callback', 'WEB\SocialController@loginWithFacebook');

// Twitter
Route::get('auth/twitter', 'WEB\SocialController@twitterRedirect')->name('twitter.login');
Route::get('auth/twitter/callback', 'WEB\SocialController@loginWithTwitter');

// Tiktok
Route::get('auth/tiktok', 'WEB\SocialController@tiktokRedirect')->name('tiktok.login');
Route::get('auth/tiktok/callback', 'WEB\SocialController@loginWithTiktok');

Route::get('auth/check', 'WEB\SocialController@check');

// ACCOUNT VERIFICATION BY EMAIL
Route::get('account/verify/{token}', 'API\AuthController@verifyAccount')->name('user.verify');

/* testing template email */
Route::get('/email', 'WEB\LiveChatController@emailTest');

/* automatical redirect page */
Route::get('/redirect', 'WEB\GuestController@redirectPage');

// packages
Route::get('/packages', 'WEB\LiveChatController@packagesList');
Route::get('/edit-package', 'WEB\LiveChatController@editPackages');

/* scan page */
Route::get('/scan', 'WEB\LiveChatController@scan');

/** no auth route */
Route::get('/auto-solve-chat', 'API\ChatController@autoUpdateChatStatus')->name('autoUpdateChatStatus');
Route::get('/api/whatsapp/report-chat', 'API\WhatsAppReportController@getListReport');
Route::get('/api/whatsapp/report/list', 'API\WhatsAppReportController@getListReport');
Route::post('/api/whatsapp/report/list', 'API\WhatsAppReportController@getListReport');

/* error page */
Route::get('/page-404', 'WEB\ErrorController@index');
Route::get('/404', 'WEB\ErrorController@index');
//Route::get('/{name}', 'WEB\ErrorController@index');

// CUSTOM ROUTES FOR DOCUMENTATION
// Auth::routes();
// Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
Route::get('dev/login', 'Auth\LoginController@showLoginForm')->name('dev.login-form');
Route::post('dev/login', 'Auth\LoginController@login')->name('dev.login');
Route::post('dev/logout', 'Auth\LoginController@logout')->name('dev.logout');
Route::get('dev/register', 'Auth\RegisterController@showRegistrationForm')->name('dev.register-form');
Route::post('dev/register', 'Auth\RegisterController@register')->name('dev.register');
