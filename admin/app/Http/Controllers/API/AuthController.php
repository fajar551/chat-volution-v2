<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\API\ApiController;
use App\Http\Controllers\Controller;
use App\Models\CompanyDetail;
use App\Models\Menu;
use App\Models\PackageSet;
use App\Models\User as ModelsUser;
use App\Models\UserVerify;
use App\Services\AgentService;
use App\User;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Validator;

class AuthController extends ApiController
{
    public $successStatus = 200;

    public function login(AgentService $agent_service)
    {
        try {

            if (Auth::attempt(['email' => request('email'), 'password' => request('password')])) {
                $user = Auth::user();
                $validate_agent = $agent_service->validateAgent([ 'id' => $user['id'] ]);
                if($validate_agent['code'] == 200) {
                    $data_response = $agent_service->addKeyToLoginResponse($user, false);
                    $update_online = $agent_service->updateOnlineStatus(true);

                    return $this->successResponseWithLog($data_response, __('messages.request.success'), null, 'login');
                } else {
                    return $this->errorResponseWithLog(null, $validate_agent['message'], Response::HTTP_UNAUTHORIZED);
                }
            } else {
                return $this->errorResponseWithLog(null, Response::$statusTexts[Response::HTTP_UNAUTHORIZED], Response::HTTP_UNAUTHORIZED);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function register(Request $request, AgentService $agent_service)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:agent,email',
            'password' => 'required',
            'confirm_password' => 'required|same:password',
            'company_name' => 'required',
            'phone' => 'required',
            'captcha' => 'required'
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(null, $validator->errors());
        }

        try {
            // validate captcha
            $verify_captcha = $this->verifyRecaptcha($request->all());
            if (!$verify_captcha['status']) {
                $user_error_message = ['captcha' => __('messages.auth.register.recaptcha_invalid')];
                Log::error([
                    'user_message' => $user_error_message,
                    'system_message' => ['errorRecaptcha' => $verify_captcha['data']],
                    'request_data' => $request->all()
                ]);
                return $this->errorResponse(null, $user_error_message);
            }

            $input['name'] = $request->name;
            $input['email'] = $request->email;
            $input['password'] = bcrypt($request->password);
            $input['phone'] = $request->phone;
            $user = User::create($input);
            // $success['token'] =  $user->createToken('nApp')->accessToken;
            $success['name'] =  $user->name;

            // Insert to company_details table
            $company = CompanyDetail::create([
                'agent_id' => $user->id,
                'company_name' => $request->company_name
            ]);

            $user->assignRole('company');
            if ($request->package) {
                $id = $user->id;
                $package = new PackageSet;
                $package->id_agent = $id;
                $package->id_package = $request->package;
                $package->save();
            } else {
                $id = $user->id;
                $package = new PackageSet;
                $package->id_agent = $id;
                $package->id_package = 1;
                $package->save();
            }

            // add internal chat permission
            $permission = Permission::where('name', 'like', '%-internal-chat')->get(); // get permission
            $give_pr = $user->givePermissionTo($permission);

            // attach channel to agent
            $storeChatChannelAgent = $agent_service->attachChannelToAgent($user->id);

            // User Verification Email
            $register_token = Str::random(64);
            UserVerify::create([
                'agent_id' => $user->id,
                'token' => $register_token
            ]);
            $details = [
                'name' => $user->name,
                'email' => $user->email,
                'token' => $register_token
            ];

            // Send User Verification Email Directly
            Mail::send('email.verification', ['details' => $details], function ($message) use ($request) {
                $message->to($request->email);
                $message->subject(__('email.subject.verify_email_request'));
            });

            $registered_user = $agent_service->show($user->id);

            createActivityLog(null, [
                'log_name' => 'register',
                'email' => $request->email,
                'request_sent' => $request->all(),
                'response' => $registered_user
            ]);
            return $this->successResponse($registered_user, __('messages.auth.register.success'));
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function details(Request $request)
    {
        try {
            /*$token = $request->bearerToken();
            var_dump($token);die;

            $tokenId= (new \Lcobucci\JWT\Parser())->parse($bearerToken)->getHeader('jti');
            $client = \Laravel\Passport\Token::find($tokenId)->user_id;
            return $client;
            */

            $user = auth()->user();
            if ($user->hasRole('root')) {
                var_dump('role root');
                die;
            } else {
                var_dump('bukan role root');
                die;
            }

            $res =  Auth::guard('api')->check();
            $user = Auth::guard('api')->user();

            return response()->json(['success' => $user], $this->successStatus);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'code'    => $e->getCode(),
                'message'    => trim(preg_replace('/\s+/', ' ', $e->getMessage()))
            ], 400);
        }
    }

    /**
     * Validate Token
     * type null = (normal use)
     * type 'from-socket-v2' = return less data
     *
     * @param String $type = null|'from-socket-v2'
     */
    public function validateToken(Request $request, $type = null)
    {
        $res =  Auth::guard('api')->check();
        $user = Auth::guard('api')->user();
        if ($res) {
            $agent_service = AgentService::getInstance();
            $agent_login_data = $agent_service->addKeyToLoginResponse($user);

            // Only return necessary data
            if($type == 'from-socket-v2') {
                $user = [
                    'email' => $user['email'],
                    'id_company' => $user['id_company'],
                    'id_department' => $user['id_department'],
                    'id_roles' => $user['id_roles'],
                    'name' => $user['name'],
                ];

                $agent_login_data = [];
            }

            return response()->json(['success' => true, 'user' => $user, 'login_data' => $agent_login_data], $this->successStatus);
        } else {
            return response()->json(['error' => false], 401);
        }
    }

    public function logout(Request $request, AgentService $agent_service)
    {
        $current_user = Auth::user();
        $update = User::find($current_user->id)->update(['fcm_token' => null]);

        Auth::user()->tokens->each(function ($token, $key) use ($agent_service) {
            if ($token->name == 'nApp') {
                $update_online = $agent_service->updateOnlineStatus(false);
                return $token->delete();
            }
        });
        $result_reponse = ['success' => 'Token Revoked'];

        createActivityLog(null, [
            'log_name' => 'logout',
            'request_sent' => 'user token',
            'response' => $result_reponse
        ]);

        return response()->json($result_reponse, $this->successStatus);
    }

    public function listToken()
    {
        return view('live-chat.auth.token');
    }

    public function verifyAccount($token, AgentService $agent_service)
    {
        $verifyUser = UserVerify::where('token', $token)->first();

        if (!is_null($verifyUser)) {
            // redirect to complete profile view

            $user = $verifyUser->agent;
            $verified = 0; // means false
            $need_complete_profile = 1; // means true

            // check user's roles
            if ($user->id_roles == 2) {
                $verified = $user->is_email_verified;
                $need_complete_profile = 0; // means false
            } else {
                $verified = $user->is_email_verified;
            }

            if (!$verified && $need_complete_profile) {
                // user is NOT verified and need to complete profile
                $message = __('messages.email_verification.complete_form_first');
                $user = $user->toArray();
                $response['id'] = $user['id'];
                $response['uuid'] = $user['uuid'];
                $response['token'] = $token;
                $response['email'] = $user['email'];
                $response['name'] = $user['name'];
                $response['phone'] = $user['phone'];
                $response['id_department'] = $user['id_department'];
                $response['id_company'] = $user['id_company'];
                $response['avatar'] = $user['avatar'];
                $response['code'] = Response::HTTP_OK;
                $response['message'] = $message;
                $response['title'] = 'Complete Profile';
                $response['js'] = [
                    '/assets/libs/sweetalert2/sweetalert2.min.js',
                    '/assets/libs/jquery-countdown/jquery.countdown.min.js',
                    '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                    '/assets/libs/parsleyjs/parsley.min.js',
                    '/js/complete-profile.js'
                ];
                $response['css'] = [
                    '/assets/libs/sweetalert2/sweetalert2.min.css',
                    '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
                    '/assets/libs/animate/animate.min.css'
                ];

                return view('layouts.app-verify.complete-profile', $response);
            } elseif (!$verified && !$need_complete_profile) {
                // user is NOT verified and NO NEED to complete profile
                try {
                    // update verify user table
                    $verifyUser->agent->online = 1; // automatically set agent to online
                    $verifyUser->agent->status = 1;
                    $verifyUser->agent->is_email_verified = 1;
                    $verifyUser->agent->save();
                    $data_response = $agent_service->addKeyToLoginResponse($user, false);
                    $data_response = $agent_service->addKeyToLoginResponse($user, false);
                    $data_page['id'] = $data_response['id'];
                    $data_page['uuid'] = $data_response['uuid'];
                    $data_page['token'] = $data_response['token'];
                    $data_page['email'] = $data_response['email'];
                    $data_page['name'] = $data_response['name'];
                    $data_page['phone'] = $data_response['phone'];
                    $data_page['id_department'] = $data_response['id_department'];
                    $data_page['department_name'] = $data_response['department_name'];
                    $data_page['id_company'] = $data_response['id_company'];
                    $data_page['company_name'] = $data_response['company_name'];
                    $data_page['avatar'] = $data_response['avatar'];
                    $data_page['permission'] = $data_response['permission'];
                    $data_page['permission_name'] = $data_response['roles_name'];
                    $data_page['live_chat'] = json_encode($data_response['live_chat']);
                    $data_page['crm'] = !empty($data_response['crm']) ? json_encode($data_response['crm']) : null;
                    $data_page['social_pilot'] = !empty($data_response['social_pilot']) ? json_encode($data_response['social_pilot']) : null;
                    $data_page['message'] = __('messages.email_verification.success');
                    $data_page['code'] = 200;
                    $data_page['title'] = 'Check Verification';
                    $data_page['js'] = [
                        '/js/verif-redirect-page.js'
                    ];
                    return view('layouts.app-verify.redirect-login', $data_page);
                } catch (Exception $e) {
                    return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
                }
            } else {
                // user is verified (and company already complete the profile)
                $data_response = $agent_service->addKeyToLoginResponse($user, false);
                $data_page['id'] = $data_response['id'];
                $data_page['uuid'] = $data_response['uuid'];
                $data_page['token'] = $data_response['token'];
                $data_page['email'] = $data_response['email'];
                $data_page['name'] = $data_response['name'];
                $data_page['phone'] = $data_response['phone'];
                $data_page['id_department'] = $data_response['id_department'];
                $data_page['department_name'] = $data_response['department_name'];
                $data_page['id_company'] = $data_response['id_company'];
                $data_page['company_name'] = $data_response['company_name'];
                $data_page['avatar'] = $data_response['avatar'];
                $data_page['permission'] = $data_response['permission'];
                $data_page['permission_name'] = $data_response['roles_name'];
                $data_page['live_chat'] = json_encode($data_response['live_chat']);
                $data_page['crm'] = !empty($data_response['crm']) ? json_encode($data_response['crm']) : null;
                $data_page['social_pilot'] = !empty($data_response['social_pilot']) ? json_encode($data_response['social_pilot']) : null;
                $data_page['message'] = __('messages.email_verification.already_verified');
                $data_page['code'] = 404;
                $data_page['title'] = 'Check Verification';
                $data_page['js'] = [
                    '/js/verif-redirect-page.js'
                ];
                return view('layouts.app-verify.redirect-login', $data_page);
            }
        } else {
            $message = __('messages.email_verification.email_not_found');
            $response = [
                'code' => Response::HTTP_UNAUTHORIZED,
                'status' => 'Error',
                'message' => $message,
                'data' => null
            ];
            return redirect('/')->with('message', $response);
        }
    }

    public function resendVerificationEmail(Request $request, AgentService $agent_service)
    {
        try {
            $post = $agent_service->resendVerificationEmail($request->all());
            if ($post['code'] == 200) {

                createActivityLog(null, [
                    'log_name' => 'resend_verification_email',
                    'email' => $request->email,
                    'request_sent' => $request->all(),
                    'response' => $post
                ]);

                return $this->successResponse($post['data'], $post['message']);
            } else {
                return $this->errorResponseWithLog($post['data'],  $post['message']);
            }
        } catch (Exception $e) {
            $verification_status = ['verification_status' => 'warning'];
            return $this->errorResponseWithLog($verification_status, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }

    public function verifyRecaptcha($data)
    {
        // try {
        $secret = env('CAPTCHA_SECRET_KEY');
        $client = new Client();
        $url = "https://www.google.com/recaptcha/api/siteverify";
        $query = ['secret' => $secret, 'response' => $data['captcha']];
        $response = $client->request('GET', $url, [
            'verify'  => false,
            'query' => $query
        ]);
        $responseBody = json_decode($response->getBody(), true);
        $responseCode = $response->getStatusCode();
        return [
            'status' => $responseBody['success'],
            'data' => $responseBody
        ];
        // } catch (ClientException $e) {
        //     return $this->errorResponse( Psr7\Message::toString($e->getResponse()), __('messages.auth.login.user_not_active'));
        //     // echo Psr7\Message::toString($e->getRequest());
        //     // echo Psr7\Message::toString($e->getResponse());
        // }
    }

    /**
     * Update device fcm token
     */
    public function updateToken(Request $request, $param = null)
    {
        try {
            $current_user = Auth::user();
            $update = User::find($current_user['id'])->update(['fcm_token' => ($param) ? $param['fcm_token'] : $request->token]);
            if ($update) {
                return $this->successResponse($update);
            } else {
                return $this->errorResponseWithLog($update);
            }
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponseWithLog(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())));
        }
    }
}
