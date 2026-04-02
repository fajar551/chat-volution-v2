<?php

namespace App\Services;

use App\User;
use App\Models\Agent;
use App\Models\AgentWhmcsAccount;
use App\Models\Channel;
use App\Models\ChannelAgent;
use App\Models\Chat;
use App\Models\CompanyDetail;
use App\Models\Department;
use App\Models\Menu;
use App\Models\Oauth_Rest;
use App\Models\Rest;
use App\Models\PackageSet;
use App\Models\UserVerify;
use App\Services\SendEmailService;
use App\Services\AgentOauthClientService;
use App\Traits\FormatResponserTrait;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AgentService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        AgentWhmcsAccount $agent_whmcs_account_model,
        UserVerify $user_verify_model,
        CompanyDetail $company_detail_model,
        ChannelAgent $chat_channel_agent_model,
        Channel $chat_channel_model,
        Chat $chat_model,
        Department $department_model,
        User $user_model
    ) {
        $this->agent_model = $agent_model;
        $this->agent_whmcs_account_model = $agent_whmcs_account_model;
        $this->user_verify_model = $user_verify_model;
        $this->company_detail_model = $company_detail_model;
        $this->chat_channel_agent_model = $chat_channel_agent_model;
        $this->chat_channel_model = $chat_channel_model;
        $this->chat_model = $chat_model;
        $this->department_model = $department_model;
        $this->user_model = $user_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new AgentWhmcsAccount(),
            new UserVerify(),
            new CompanyDetail(),
            new ChannelAgent(),
            new Channel(),
            new Chat(),
            new Department(),
            new User()
        );
    }

    public function store($request)
    {
        $current_user_roles = null;
        $current_user_company_uuid = null;
        $current_user_company = null;
        $current_user_company_detail = null;
        if (Auth::check()) {
            $current_user = Auth::user();
            $current_user_roles = $current_user ? $current_user->id_roles : null;

            // ONLY SPECIFIC COMPANY
            if ($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;

                // Company Detail
                $current_user_company_detail = $current_user_company->company_detail;
            } else {
                $current_user_company = $current_user;
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company

                // Company Detail
                $current_user_company_detail = $this->agent_model->find($current_user->id)->company_detail;
            }
        } else {
            $current_user_company_uuid = isset($request['uuid']) && !empty($request['uuid']) ? $request['uuid'] : null;
        }

        $input['name'] = $request['name'];
        $input['email'] = $request['email'];

        // Set password field value
        $decrypted_password = generate_random_string(15);
        if( isset($request['password']) && !empty($request['password']) )
            $decrypted_password = $request['password'];
        $input['password'] = bcrypt($decrypted_password); // user does not asked to input password & set default password because column can not null

        $input['level'] = $request['level'];
        $input['id_roles'] = $request['id_roles'];
        $input['id_company'] = !empty($request['id_company']) ? $request['id_company'] : $current_user_company['id']; // handle id company field for staff/agent
        $input['id_department'] = $request['id_department'];
        $input['is_email_verified'] = isset($request['is_email_verified']) ? $request['is_email_verified'] : 0; // handle seeder

        $input['status'] = 1; // default value
        if (isset($request['status']) && $request['status'] == 1) {
            $input['status'] = 1; // handle seeder
            $input['is_email_verified'] = 1;
        }

        if ($request['id_roles'] == 2) {
            $input['id_company'] = null; // assign null value if role is company
            $input['id_department'] = null; // assign null value if role is company
        }

        // Insert full_access value
        if( isset($request['full_access']) ) {
            if ($current_user_roles != 2) {
                return $this->errorResponse(null, __('messages.update.only_for_agent') .' '. __('messages.update.allow_for_company'));
            }

            if($request['id_roles'] != 4) {
                return $this->errorResponse(null, __('messages.update.only_for_agent'));
            }

            $input['full_access'] = $request['full_access'];
        }

        // insert data to database
        $user = $this->agent_model->updateOrCreate(['email' => $request['email']], $input);

        if ($request['id_roles'] == 2) {
            $user->assignRole('company');

            // assign package for company
            if (array_key_exists('package', $request)) {
                $id = $user->id;
                $package = new PackageSet;
                $package->id_agent = $id;
                $package->id_package = $request['package'];
                $package->save();
            } else {
                $id = $user->id;
                $package = new PackageSet;
                $package->id_agent = $id;
                $package->id_package = 1;
                $package->save();
            }

            // attach channel to agent
            $storeChatChannelAgent = $this->attachChannelToAgent($user->id);
        } elseif ($request['id_roles'] == 3) {
            $user->assignRole('staff');
        } elseif ($request['id_roles'] == 4) {
            $user->assignRole('agent');
        }

        // Send Email
        $send_email_service = SendEmailService::getInstance();

        // Set data
        $user_details = $user;
        $user_details['send_email'] = isset($request['send_email']) ? $request['send_email'] : 1;
        $user_details['decrypted_password'] = $decrypted_password;
        $user_details['company_details'] = $current_user_company_detail;
        if($user_details['send_email'])
            $send_email_service->handle($user_details);

        $success['token'] =  $user->createToken('nApp')->accessToken;
        $success['name'] =  $user->name;

        return $success;
    }

    public function update($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user->id_department;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company = $current_user;
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data_agent = $this->agent_model->where('id', $request['id']);
        if ($current_user->id === 1) {
            $data_agent = $data_agent;
        } else {
            $data_agent = $data_agent->where('id_company', $current_user_company_id);
            if ($current_user_roles != 2 && $current_user_roles != 1)
                $data_agent = $data_agent->where('id_department', $current_user_department);
        }
        $data_agent = $data_agent->first();

        if (empty($data_agent))
            return $this->errorResponse(null, __('messages.update.error') . " " . __('messages.data_not_found'));

        $allowedUpdateFields = ['name', 'status', 'is_email_verified', 'email']; // 'name', 'status', 'is_email_verified', 'email', 'full_access'
        $update = false;
        $send_change_email = false;
        $input_data = [];
        if (!empty($data_agent) && !empty($request)) {
            foreach ($request as $field => $field_value) {
                if (in_array($field, $allowedUpdateFields))
                    $input_data[$field] = $field_value;
            }
        }

        // Update full_access value
        if( isset($request['full_access']) ) {
            if ($current_user_roles != 2)
                return $this->errorResponse(null, __('messages.update.only_for_agent') .' '. __('messages.update.allow_for_company'));

            if($request['full_access'] != $data_agent->full_access && $data_agent->id_roles != 4)
                return $this->errorResponse(null, __('messages.update.only_for_agent'));

            $input_data['full_access'] = $request['full_access'];
        }

        if( $current_user_roles == 2 ) {
            // Update id_department value
            if( isset($request['id_department']) && !empty($request['id_department']) ) {
                $company_departments = $this->department_model->where('id_agent', $current_user_company_id)->where('id', $request['id_department'])->first();
                if(!$company_departments)
                    return $this->errorResponse(null, 'Department error: '.__('messages.update.error') . " " . __('messages.data_not_found'));

                $input_data['id_department'] = $request['id_department'];
            }

            // Update id_roles value
            if( isset($request['id_roles']) && !empty($request['id_roles']) )
            $input_data['id_roles'] = $request['id_roles'];

            // Update Password
            if( isset($request['password']) && !empty($request['password']) ) {
                // Set password field value
                $decrypted_password = generate_random_string(15);
                if( isset($request['password']) && !empty($request['password']) )
                    $decrypted_password = $request['password'];
                $input_data['password'] = bcrypt($decrypted_password);
            }

            // Update Email
            if (isset($request['email']) && !empty($request['email']) ) {
                if ($request['email'] != $data_agent['email']) {
                    if($request['status'] == 1) {
                        $send_change_email = false;
                        $input_data['status'] = 1;
                        $input_data['is_email_verified'] = 1;
                    } else {
                        $send_change_email = true;
                        $input_data['status'] = 2; // set agent status to pending
                        $input_data['is_email_verified'] = 0;
                    }
                }
            }
        } // End if roles is company

        // Validate Input Data
        if (empty($input_data))
            return $this->errorResponse(null, __('messages.update.nothing_to_update'));

        $update = $data_agent->update($input_data);
        if ($update) {
            if ($send_change_email) {
                // Send Email
                $send_email_service = SendEmailService::getInstance();
                $send_email_service->handle($data_agent, 'verify_change_email_request');
            }

            return $this->successResponse($data_agent, __('messages.update.success'));
        } else {
            return $this->errorResponse(null, __('messages.update.error'));
        }
    }

    public function updateProfile($request, $id)
    {
        $current_user = $this->agent_model->find($id);
        $input = $request;

        foreach ($input as $key => $item) {
            if (empty($item)) {
                unset($input[$key]);
            }
        }

        if (!empty($request['avatar'])) {
            $image = uploadFile($request['avatar'], 'public/assets/images/uploads'); // upload file
            if (Storage::disk()->exists($current_user['avatar'])) {
                $delete = Storage::delete($current_user['avatar']); // delete old file
            }
            $input['avatar'] = $image; // update data
        }

        $update = true;
        if (!empty($input)) {
            $update = $current_user->update($input);
            $current_user['avatar'] = $current_user->avatar ? parseFileUrl($current_user->avatar) : null;
            return $this->successResponse($current_user, __('messages.update.success'));
        } else {
            return $this->errorResponse(null, __('messages.update.nothing_to_update'));
        }
    }

    public function updatePassword($request, $id)
    {
        $current_user = $this->agent_model->find($id);
        $input = $request;

        foreach ($input as $key => $item) {
            if (empty($item)) {
                unset($input[$key]);
            }
        }

        // check old password
        $old_password = $current_user->password;
        if (Hash::check($request['old_password'], $old_password)) {
            if (!Hash::check($request['password'], $old_password)) {
                $update = $current_user->update(['password' => bcrypt($input['password'])]);
                return $this->successResponse($update, __('messages.update.success'));
            } else {
                return $this->errorResponse(null, __('messages.update.password_same_as_old'));
            }
        } else {
            return $this->errorResponse(null, __('messages.update.old_password_not_match'));
        }
    }

    /**
     * Update column 'online'
     * by logged in user
     *
     * @param int $status = 1|0
     */
    public function updateOnlineStatus($status = 0)
    {
        $id = Auth::user()->id;
        $data = $this->agent_model->with(['companyDetailByIdCompany', 'department'])->where('id', $id)->first();
        $data->online = ($status == 1) ? 1 : 0;
        $data->save();

        // If online, save to Redis (for socket gateway detection)
        // Only save to Redis if agent status is Active (status = 1)
        if ($status == 1 && $data->status == 1) {
            $this->saveAgentToRedis($data);
        } else {
            $this->removeAgentFromRedis($data);
        }

        return $data;
    }

    /**
     * Save agent data to Redis (similar to backend_v2 createUserAuth)
     * This allows socket gateway to detect online agents
     * Only saves agents with status = 1 (Active)
     */
    public function saveAgentToRedis($agent)
    {
        try {
            // Only save to Redis if agent status is Active (status = 1)
            // Status values: 0 = Inactive, 1 = Active, 2 = Pending, 9 = Suspended
            if ($agent->status != 1) {
                \Log::info("⏭️ Skipped saving agent {$agent->id} to Redis - status is {$agent->status} (not active)");
                // Remove from Redis if already exists
                $this->removeAgentFromRedis($agent);
                return;
            }

            $redis = \Illuminate\Support\Facades\Redis::connection();

            // Get company name
            $company = $agent->companyDetailByIdCompany;
            if (!$company) {
                return;
            }

            $company_name = $company->company_name;
            $slugified_company_name = \Illuminate\Support\Str::slug($company_name);

            // Format avatar URL - use parseFileUrl if available, otherwise use Storage::url() or getGravatar as fallback
            $avatar_url = '';
            if (!empty($agent->avatar)) {
                if (function_exists('parseFileUrl')) {
                    $avatar_url = parseFileUrl($agent->avatar);
                } else {
                    // If parseFileUrl not available, try to construct full URL from storage path
                    $avatar_path = $agent->avatar;

                    // If path starts with 'storage/app/public/', convert to '/storage/' format
                    if (strpos($avatar_path, 'storage/app/public/') === 0) {
                        $avatar_path = '/storage/' . str_replace('storage/app/public/', '', $avatar_path);
                    } elseif (strpos($avatar_path, 'storage/') === 0 && strpos($avatar_path, 'storage/app/public/') !== 0) {
                        // If starts with 'storage/' but not 'storage/app/public/', assume it's already in correct format
                        $avatar_path = '/' . $avatar_path;
                    } elseif (!str_starts_with($avatar_path, '/') && !str_starts_with($avatar_path, 'http')) {
                        // If relative path, assume it's storage path
                        $avatar_path = '/storage/' . ltrim($avatar_path, '/');
                    }

                    // If already a full URL, use as is
                    if (filter_var($avatar_path, FILTER_VALIDATE_URL)) {
                        $avatar_url = $avatar_path;
                    } else {
                        // Construct full URL
                        $baseUrl = config('app.url', 'https://admin-chat.genio.id');
                        $avatar_url = $baseUrl . $avatar_path;
                    }
                }
            }

            // If still no avatar, use Gravatar
            if (empty($avatar_url) || $avatar_url === 'null' || $avatar_url === 'undefined') {
                if (function_exists('getGravatar')) {
                    $avatar_url = getGravatar($agent->name . '-' . $agent->id, 'name');
                } else {
                    // Fallback to ui-avatars if getGravatar not available
                    $avatar_url = 'https://ui-avatars.com/api/?name=' . urlencode($agent->name) . '&background=f5f7fb&color=000';
                }
            }

            // Prepare user data for Redis (similar to backend_v2 format)
            $userData = [
                'id' => $agent->id,
                'agent_id' => $agent->id,
                'id_roles' => $agent->id_roles,
                'id_department' => $agent->id_department,
                'id_company' => $agent->id_company,
                'name' => $agent->name,
                'name_agent' => $agent->name,
                'email' => $agent->email,
                'email_agent' => $agent->email,
                'phone' => $agent->phone ?? '',
                'phone_agent' => $agent->phone ?? '',
                'avatar' => $avatar_url,
                'company_name' => $slugified_company_name,
                'department_name' => $agent->department ? \Illuminate\Support\Str::slug($agent->department->name) : '',
                'roles_id' => $agent->id_roles,
                'full_access' => $agent->full_access ?? 0,
                'status' => $agent->status ?? 1, // Add status field to Redis
                'token' => $agent->token ?? '',
                'uuid' => $agent->uuid ?? '',
                'company_uuid' => $company->uuid ?? '',
            ];

            // Save user data to Redis hash
            $userDataKey = "user:{$agent->id}";
            $redis->hmset($userDataKey, $userData);

            // Add to online users sorted set
            $companyOnlineUsersKey = "company:{$slugified_company_name}:online_users";
            $unixTime = time();
            $redis->zadd($companyOnlineUsersKey, $unixTime, $agent->id);

            // Add to department users set
            if ($agent->department) {
                $departmentSlug = \Illuminate\Support\Str::slug($agent->department->name);
                $usersInDepartmentKey = "company:{$slugified_company_name}:dept:{$departmentSlug}:users";
                $redis->sadd($usersInDepartmentKey, $agent->id);
            }

            \Log::info("✅ Agent {$agent->id} saved to Redis for company: {$slugified_company_name}");
        } catch (\Exception $e) {
            \Log::error("❌ Error saving agent to Redis: " . $e->getMessage());
        }
    }

    /**
     * Remove agent from Redis when offline
     */
    public function removeAgentFromRedis($agent)
    {
        try {
            $redis = \Illuminate\Support\Facades\Redis::connection();

            // Get company name
            $company = $agent->companyDetailByIdCompany;
            if (!$company) {
                return;
            }

            $company_name = $company->company_name;
            $slugified_company_name = \Illuminate\Support\Str::slug($company_name);

            // Remove from online users sorted set
            $companyOnlineUsersKey = "company:{$slugified_company_name}:online_users";
            $redis->zrem($companyOnlineUsersKey, $agent->id);

            // Remove from department users set
            if ($agent->department) {
                $departmentSlug = \Illuminate\Support\Str::slug($agent->department->name);
                $usersInDepartmentKey = "company:{$slugified_company_name}:dept:{$departmentSlug}:users";
                $redis->srem($usersInDepartmentKey, $agent->id);
            }

            \Log::info("✅ Agent {$agent->id} removed from Redis for company: {$slugified_company_name}");
        } catch (\Exception $e) {
            \Log::error("❌ Error removing agent from Redis: " . $e->getMessage());
        }
    }

    public function verification($request)
    {
        // check user register token from email
        $token = $request['token'];
        $verifyUser = $this->user_verify_model->where('token', $token)->firstOrFail();

        // update email verify
        $user = $verifyUser->agent;
        if (!$user->is_email_verified) {
            $verifyUser->agent->is_email_verified = 1;
            $verifyUser->agent->save();
        } else {
            // Email is already verified
            $message = __('messages.email_verification.already_verified');
            return $message;
        }

        // update user data
        $verifyUser->agent->status = $request['status']; // set user status to active
        $verifyUser->agent->phone = $request['phone'];
        $verifyUser->agent->online = 1;
        if (isset($request['password'])) {
            $verifyUser->agent->password = bcrypt($request['password']);
        }
        $verifyUser->agent->save();

        /**
         * update company_name and phone
         * only for user with company roles
         */
        $company_data['company_phone_number'] = isset($request['company_phone_number']) ? $request['company_phone_number'] : null;
        if (isset($request['company_name'])) {
            $company_data['company_name'] = $request['company_name'];
        }
        if ($user->id_roles == 2) {
            $this->company_detail_model->updateOrCreate(
                ['agent_id' => $user->id],
                $company_data
            );
        }

        $data_response['name'] = $user->name;
        if ($verifyUser->agent->save()) {
            $data_response = $this->addKeyToLoginResponse($user, false);
        }

        createActivityLog(null, [
            'log_name' => 'user_verify',
            'email' => $user->email,
            'request_sent' => \Request::except('confirm_password', 'password', 'password_confirmation', '_token'),
            'response' => $data_response
        ]);

        return $data_response;
    }

    public function checkRoleByRegisterToken($data)
    {
        $verifyUser = $this->user_verify_model->where('token', $data['token'])->first();
        if ($verifyUser) {
            $verifyUser = $verifyUser->agent->id_roles;
        }

        return $verifyUser;
    }


    /**
     * Generate user access token
     *
     * @params $user_data = mostly collection from get user data
     * @return string $token
     */
    public function generateUserAccessToken($user_data)
    {
        $token =  $user_data->createToken('nApp')->accessToken;
        return $token;
    }

    public function generateSecretKey($user_data){
        $secret = Oauth_Rest::where('secret', $user_data)->get();
        return $secret;
    }

    /**
     * Get user permission
     *
     * Used to give value to user permission
     *
     * @param string $type = null|name
     * @param int $id_roles = null|1|2|...
     * @return int $permission (role id)
     */
    public function getUserRoles($type = null, $id_roles = null)
    {
        $avail_roles = [
            '1' => 'Administrator',
            '2' => 'Company',
            '3' => 'Staff',
            '4' => 'Agent'
        ];

        $permission = null;
        if (Auth::check()) {
            $permission =  Auth::user()->id_roles;
        }

        if ($id_roles) {
            $permission = $id_roles;
        }

        if (strtolower($type) == 'name') {
            if (array_key_exists($permission, $avail_roles)) {
                $permission_name = $avail_roles[$permission];
                return $permission_name;
            } else {
                return null;
            }
        }

        return $permission;
    }

    /**
     * Get user menu
     * only return available menu for specific user
     *
     * @param int $id_roles = null|1|2|...
     * @return array $user_menu
     */
    public function getUserMenu($id_roles = null)
    {
        $user_menu = [];
        $user_roles = null;
        if (Auth::check()) {
            $user_roles = Auth::user()->id_roles;
        }

        if ($id_roles) {
            $user_roles = $id_roles;
        }

        $menu = Menu::where('role_id', $user_roles)->get();
        foreach ($menu as $value) {
            $user_menu[$value->modul_type] = json_decode($value->list_menu);
        }

        return $user_menu;
    }

    /**
     * Add keys to login response
     *
     * Added key:
     * id, token, permission, menu (not inside 'menu' key)
     *
     * @param $is_login = true|false (if user is not logged in, then set is_login to false)
     * @param $with_menu = true|false (show menu for user)
     */
    public function addKeyToLoginResponse($user_data, $is_login = true, $with_menu = true)
    {
        if (!$is_login) {
            Auth::loginUsingId($user_data->id); // automatically make user log in
        }
        $agent_data = $this->agent_model
            ->with('company_detail')
            ->with('companyDetailByIdCompany')
            ->with('companyDetailByIdCompany.agent')
            ->with('department:id,name')
            ->where('id', $user_data->id)
            ->first();

        $agent_data['company_name'] = null;
        $agent_data['company_uuid'] = null;
        if (!empty($agent_data['companyDetailByIdCompany'])) {
            $agent_data['company_name'] = $agent_data['companyDetailByIdCompany']['company_name'];
            $agent_data['company_uuid'] = !empty($agent_data['companyDetailByIdCompany']['agent']) && !empty($agent_data['companyDetailByIdCompany']['agent']['uuid']) ? $agent_data['companyDetailByIdCompany']['agent']['uuid'] : null;
        }
        unset($agent_data['companyDetailByIdCompany']);

        if (!empty($agent_data['company_detail'])) {
            $agent_data['company_name'] = $agent_data['company_detail']['company_name'];
            $agent_data['company_uuid'] = $agent_data['uuid'];
        }
        unset($agent_data['company_detail']);

        $agent_data['department_name'] = null;
        if (!empty($agent_data['department'])) {
            $agent_data['department_name'] = $agent_data['department']['name'];
        }
        unset($agent_data['department']);

        $avatar_url = !empty($user_data['avatar']) ? parseFileUrl($user_data['avatar']) : null;
        $avatar_url = !empty($avatar_url) ? $avatar_url : getGravatar($user_data['name'] . '-' . $user_data['id'], 'name');
        $agent_data['avatar'] = $avatar_url;
        $agent_data['display_status_alias'] = !empty($agent_data->status_alias) ? $agent_data->status_alias->name : null;

        $additional_key = [
            'id' => $user_data->id,
            'uuid' => $user_data->uuid,
            'name' => $user_data->name,
            'phone' => $user_data->phone,
            'email' => $user_data->email,
            'token' => $this->generateUserAccessToken($user_data),
            'permission' => (Auth::check() ? $this->getUserRoles() : $this->getUserRoles(null, $user_data->id_roles)),
            'id_department' => $user_data->id_department,
            'id_company' => $user_data->id_company,
            'roles_name' => (Auth::check() ? $this->getUserRoles('name') : $this->getUserRoles('name', $user_data->id_roles)),
            'department_name' => isset($agent_data['department_name']) ? $agent_data['department_name'] : null,
            'company_name' => isset($agent_data['company_name']) ? $agent_data['company_name'] : null,
            'company_uuid' => isset($agent_data['company_uuid']) ? $agent_data['company_uuid'] : null,
            'avatar' => $agent_data['avatar'],
            'display_status_alias' => $agent_data['display_status_alias'],
            'full_access' => $user_data->full_access,
        ];
        if ($with_menu) {
            $menu = Auth::check() ? $this->getUserMenu() : $this->getUserMenu($user_data->id_roles);
            foreach ($menu as $menu_key => $menu_item) {
                $additional_key[$menu_key] = $menu_item;
            }
        }
        return $additional_key;
    }

    public function resendVerificationEmail($data)
    {
        $user = $this->agent_model->where('email', $data['email'])->first(); // check if email exists
        $result = ['code' => 400, 'message' => __('messages.email_verification.email_not_found'), 'data' => ['verification_status' => 'warning']];
        if (!$user) {
            return $result;
        }

        if ($user->is_email_verified) {
            // if user is already verified
            $result = ['code' => 400, 'message' => __('messages.email_verification.already_verified'), 'data' => ['verification_status' => 'error']];
        } else {
            $send_email_service = SendEmailService::getInstance();
            $post = $send_email_service->handle($user); // Send Email
            $user = $user->toArray();
            $keys = ['verification_status' => 'success'];
            $user = $keys + $user;
            $result = ['code' => 200, 'message' => __('messages.email_verification.email_sent_success'), 'data' => $user];
        }

        return $result;
    }

    public function show($id)
    {
        $item = $this->agent_model->findOrFail($id);
        $data = $item;
        if ($item && Auth::check()) {
            $additional_data =  $this->addKeyToLoginResponse($item, true, false);
            $data = array_merge($item->toArray(), $additional_data);
            unset($data['token']);
        }

        return $data;
    }

    /**
     * List Available Agents
     * When agent wants to transfer chat
     * filtered by logged in agent
     *
     * @return array $agents
     * return list of agents
     * except the logged in agent's data
     */
    public function getAvailableTransferAgentByAgent($request)
    {
        $current_user = Auth::user();
        $current_user_roles = $current_user->id_roles;
        $current_user_department = $current_user->id_department;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($current_user->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            $current_user_company_id = $current_user_company ? $current_user_company->id : null;
        } else {
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            $current_user_company_id = $current_user->id;
        }

        // FILTER BY AGENT NAME
        $input_agent_name = null;
        if (isset($request['agent_name'])) {
            $input_agent_name = $request['agent_name'];
        }

        $agents = $this->agent_model
            ->select('id', 'uuid', 'name', 'email', 'id_roles', 'id_department', 'id_company', 'status', 'avatar', 'online')
            ->where('id_company', $current_user_company_id)
            ->where('id', '<>', $current_user->id)
            ->where('online', 1)
            ->where('id_roles', 4);

        // show agent with company roles
        // if($current_user_roles != 2 && $current_user_roles != 1) {
        //     $agents = $agents->orWhere(function($q) use ($current_user_company_id) {
        //         $q->where('id', $current_user_company_id);
        //         $q->where('online', 1);
        //     });
        // }

        if (!empty($input_agent_name)) {
            $agents = $agents->where('name', 'like', '%' . $input_agent_name . '%');
        }

        $agents = $agents->with('companyDetailByIdCompany')
            ->with('department:id,name')
            ->orderBy('online', 'desc') // show online agent first
            ->orderBy('name', 'asc')
            ->get();

        $agents->map(function ($item, $key) {
            $item['company_name'] = null;
            if (!empty($item['companyDetailByIdCompany'])) {
                $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
            }
            unset($item['companyDetailByIdCompany']);

            $item['department_name'] = null;
            if (!empty($item['department'])) {
                $item['department_name'] = $item['department']['name'];
            }
            unset($item['department']);

            $item['avatar'] = $item->avatar ? parseFileUrl($item->avatar) : null;
            $item['handled_chat_number'] = $this->getCurrentChatCount($item['uuid']);
        });

        if (!empty($agents)) {
            return $this->successResponse($agents, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') . ' ' . __('messages.data_not_found'));
        }
    }

    /**
     * Attach channel to agent
     * stored in chat_channel_agent table
     */
    public function attachChannelToAgent($request)
    {
        $channels = $this->chat_channel_model->pluck('id');
        if ($channels->isNotEmpty()) {
            foreach ($channels as $item) {
                $store = $this->chat_channel_agent_model->updateOrCreate(
                    ['id_agent' => $request, 'channel_id' => $item],
                    ['id_agent' => $request, 'channel_id' => $item]
                );

                $result = $this->successResponse($store, __('messages.request.success'));
                if (!$store) {
                    $result = $this->errorResponse(null, __('messages.request.error'));
                }
            }

            return $result;
        }

        return $this->errorResponse(null, __('messages.request.error') . ' ' . __('messages.data_not_found'));
    }

    /**
     * Get current active chat/on going chat
     * Based on agents
     *
     * @param String $uuid = 'uuid agent'
     */
    public function getCurrentChatCount($uuid)
    {
        $agent = $this->agent_model->where('uuid', $uuid)->first();
        if (empty($agent))
            return 0;
        // return $this->errorResponse(null, 'Error Agent: '. __('messages.request.error').' '.__('messages.data_not_found') );

        $current_user_roles = $agent->id_roles;
        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = $this->agent_model->find($agent->id_company);
            $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
        } else {
            $current_user_company_uuid = $agent->uuid; // uuid for agent with roles company
        }

        $query_list = $this->chat_model->where('uuid', $current_user_company_uuid)->where('status', 1);
        $query_list = $query_list->with('chat_agent')
            ->whereHas('chat_agent', function ($q) use ($agent) {
                $q->where('id_agent', $agent->id);
            })
            ->orderBy('created_at', 'desc');
        $list = $query_list->get();

        $list = $list->filter(function ($item, $key) use ($agent, $current_user_company_uuid) {
            if ($item['uuid'] == $current_user_company_uuid) { // list based on company
                if ($item['status'] == 1) { // filter on going chat
                    if ($item['chat_agent']) {
                        if ($item['chat_agent']['id_agent'] == $agent->id) { // only show chat that assign to specific agent
                            return $item;
                        }
                    }
                }
            }
        });

        $list_count = $list->count();
        return $list_count;
    }

    public function connectToWhmcs($request)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user(); // store by using auth
        } else {
            $agent_oauth_client_service = AgentOauthClientService::getInstance();
            $company_data = $agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            $current_user = $company_data; // store by using company secret key
        }
        if (empty($current_user))
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not exist');

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            return $this->errorResponse(null, __('messages.request.error') . ' Agent does not has permission to add this channel');
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $request['email'] = $current_user['email'];
        $whmcs_acc = $this->checkWhmcsClient($request);
        if (!empty($whmcs_acc) && $whmcs_acc['code'] != 200)
            return $this->errorResponse(null, $whmcs_acc['message']);

        $request['raw_response'] = json_encode($whmcs_acc['data']);
        $request['id_agent'] = $current_user_company_id;
        $request['uuid'] = $current_user_company_uuid;
        $request['status'] = 1;

        $store = $this->agent_whmcs_account_model->updateOrCreate(
            [
                'id_agent' => $current_user_company_id,
                'uuid' => $current_user_company_uuid,
            ],
            $request
        );

        if ($store) {
            return $this->successResponse($store, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
    }

    public function checkWhmcsClient($request)
    {
        $client = new Client();
        $api_identifier = $request['identifier'];
        $api_secret = $request['secret'];
        $agent_email = $request['email'];

        $account = $client->request(
            'POST',
            env('WHMCS_URL', 'https://proto.qwords.com/includes/api.php'),
            [
                'query' => [
                    'action' => 'GetClients',
                    'username' => $api_identifier,
                    'password' => $api_secret,
                    'search' => $agent_email,
                    'responsetype' => 'json'
                ]
            ]
        );
        if (!empty($account) && $account->getStatusCode() != 200)
            return $this->errorResponse(null, 'WHMCS error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $account_res = $account->getBody()->getContents();
        $arr_account_res = json_decode($account_res, true);
        if ($arr_account_res['totalresults'] < 1)
            return $this->errorResponse(null, 'Agent\'s WHMCS Account error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $found_account = null;
        if (!empty($arr_account_res['clients']['client'])) {
            foreach ($arr_account_res['clients']['client'] as $clientKey => $clientVal) {
                if ($clientVal['email'] == $agent_email)
                    $found_account = $clientVal;
            }
        }
        if (!$found_account)
            return $this->errorResponse(null, 'Agent\'s WHMCS Account error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $details = $client->request(
            'POST',
            env('WHMCS_URL', 'https://proto.qwords.com/includes/api.php'),
            [
                'query' => [
                    'action' => 'GetClientsDetails',
                    'username' => $api_identifier,
                    'password' => $api_secret,
                    'clientid' => $found_account['id'],
                    'stats' => true,
                    'responsetype' => 'json'
                ]
            ]
        );
        if (!empty($details) && $details->getStatusCode() != 200)
            return $this->errorResponse(null, 'WHMCS error: ' . __('messages.request.error') . " " . __('messages.data_not_found'));

        $details_res = $details->getBody()->getContents();
        $arr_details_res = json_decode($details_res, true);

        $return_data = [];
        $return_data['id'] = $found_account['id'];
        $return_data['email'] = $agent_email;
        $keys = [
            'firstname' => null,
            'lastname' => null,
            'fullname' => null,
            'companyname' => null,
            // 'email' => null,
            'address1' => null,
            'address2' => null,
            'city' => null,
            'fullstate' => null,
            'state' => null,
            'postcode' => null,
            'country' => null,
            'phonenumber' => null,
            'stats' => [
                'numdueinvoices',
                'dueinvoicesbalance',
                'incredit',
                'creditbalance',
                'grossRevenue',
                'expenses',
                'income',
                'numoverdueinvoices',
                'overdueinvoicesbalance',
                'numunpaidinvoices',
                'unpaidinvoicesamount',
                'numpaidinvoices',
                'paidinvoicesamount',
                'productsnumactivehosting',
                'productsnumhosting',
                'productsnumactivereseller',
                'productsnumreseller',
                'productsnumactiveservers',
                'productsnumservers',
                'productsnumactiveother',
                'productsnumother',
                'productsnumactive',
                'productsnumtotal',
                'numactivedomains',
                'numdomains',
                'numtickets',
                'numactivetickets',
                'numaffiliatesignups',
                'isAffiliate'
            ],
        ];

        foreach ($keys as $keyRes => $valRes) {
            $return_data[$keyRes] = $arr_details_res[$keyRes];
            if ($keyRes == 'stats') {
                foreach ($keys[$keyRes] as $subKey) {
                    $arr_stats[$subKey] = $arr_details_res[$keyRes][$subKey];
                }
                $return_data[$keyRes] = $arr_stats;
            }
        }

        if (!empty($return_data)) {
            return $this->successResponse($return_data, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') . ' ' . __('messages.data_not_found'));
        }
    }

    public function getCompanyWhmcsAccount($request = null)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user(); // store by using auth
        } else {
            $agent_oauth_client_service = AgentOauthClientService::getInstance();
            $company_data = $agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            $current_user = $company_data; // store by using company secret key
        }
        if (empty($current_user))
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not exist');

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            return $this->errorResponse(null, __('messages.request.error') . ' Unauthorized.', Response::HTTP_UNAUTHORIZED);
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data = $this->agent_whmcs_account_model
            ->where('uuid', $current_user_company_uuid)
            ->where('id_agent', $current_user_company_id)
            ->where('status', 1)
            ->first();

        if (!$data)
            return  $this->errorResponse(null, __('messages.data_not_found'));

        if ($data) {
            $result = $this->successResponse($data, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function updateStatusCompanyWhmcs($request)
    {
        $current_user = null;
        if (Auth::check()) {
            $current_user = Auth::user(); // store by using auth
        } else {
            $agent_oauth_client_service = AgentOauthClientService::getInstance();
            $company_data = $agent_oauth_client_service->getCompanyBySecret($request['api_key']);
            $current_user = $company_data; // store by using company secret key
        }
        if (empty($current_user))
            return $this->errorResponse(null, __('messages.request.error') . ' Company does not exist');

        $current_user_roles = $current_user ? $current_user->id_roles : null;
        $current_user_department = $current_user ? $current_user->id_department : null;
        $current_user_company_id = null;
        $current_user_company_uuid = null;

        // ONLY SPECIFIC COMPANY
        if ($current_user_roles != 2 && $current_user_roles != 1) {
            return $this->errorResponse(null, __('messages.request.error') . ' Unauthorized.', Response::HTTP_UNAUTHORIZED);
        } else {
            $current_user_company_id = $current_user->id;
            $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
        }

        $data = $this->agent_whmcs_account_model
            ->where('uuid', $current_user_company_uuid)
            ->where('id_agent', $current_user_company_id)
            ->first();

        if (!$data)
            return  $this->errorResponse(null, __('messages.data_not_found'));

        $update = $data;
        $update->status = $request['status'];
        $update->save();

        if ($update->save()) {
            $result = $this->successResponse($update, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    /**
     * Validate logged in agent
     * Used in login function, middleware valid_agent
     *
     * Valid agent criteria:
     * agent status, is email verified, company status
     *
     * @param array $request
     */
    public function validateAgent($request)
    {
        $find_agent_by = ['id', 'uuid', 'email'];
        $search_param = [];
        if (!empty($request)) {
            foreach ($request as $field => $field_value) {
                if (in_array($field, $find_agent_by)) {
                    $search_param[$field] = $field_value;
                    break;
                }
            }
        }
        if (empty($search_param))
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $agent = $this->agent_model->select(
            'id',
            'uuid',
            'status',
            'id_roles',
            'id_company',
            'is_email_verified'
        )
            ->where($search_param)
            ->first();
        if (empty($agent))
            return $this->errorResponseWithLog(null, __('messages.auth.user_not_found'));
        # Admin passes the validation
        if ($agent->id_roles == 1) {
            return $this->successResponse(true, __('messages.request.success'));
        }

        $pass_criteria = [
            'status' => [
                'value' => 1,
                'error_message' => __('messages.request.error') . " " . __('messages.auth.validate_user.error_status', ['status_name' => $agent->status_name])
            ],
            'is_email_verified' => [
                'value' => 1,
                'error_message' => __('messages.auth.not_email_verified')
            ]
        ];

        # validate agent

        foreach ($pass_criteria as $criteria => $criteria_val) {
            if ($agent[$criteria] != $criteria_val['value']) {
                return $this->errorResponseWithLog(null, $criteria_val['error_message']);
            }
        }
        # validate agent's company
        if ($agent->id_roles == 2)
            return $this->successResponse(true, __('messages.request.success'));

        foreach ($pass_criteria as $criteria => $criteria_val) {
            $current_user_company = $this->agent_model->select('id', 'uuid', 'status', 'id_roles', 'id_company', 'is_email_verified')->where('id', $agent->id_company)->first();
            if ($current_user_company && ($current_user_company->$criteria != $criteria_val['value'])) {
                $criteria_val['error_message'] = __('messages.request.error') . " " . __('messages.auth.validate_user.error_company_' . $criteria, ['status_name' => ($criteria == 'status' ? $current_user_company->status_name : $current_user_company->$criteria)]); // set error message
                return $this->errorResponseWithLog(null, $criteria_val['error_message']);
            }
        }

        return $this->successResponse(true, __('messages.request.success'));
    }

    /**
     * Check company permissions
     *
     * All agents under a company will have access to a feature based on company's permission
     *
     * @param $request = route_action
     */
    public function checkCompanyPermissions($request)
    {
        if (!Auth::check())
            return $this->errorResponseWithLog(null, __('messages.request.error') . " " . __('messages.data_not_found'));

        $user = Auth::user();
        $current_user_company = $user;
        if ($user->id_roles != 2) {
            $company = $this->user_model->find($user->id_company);
            $current_user_company = $company;
        }

        $company_permissions = $current_user_company->getAllPermissions();
        $predefined_permissions = [
            'read-internal-chat' => [
                'only' => ['listChat', 'unreadCounter', 'getNotification', 'detailReadBubbleChat', 'showBubbleChatByChatId', 'searchMessage', 'showBubbleChatByBubbleId']
            ],
            'create-internal-chat' => [
                'only' => ['newChat', 'replyChat', 'uploadFileInternalChat']
            ],
            'update-internal-chat' => [
                'only' => ['updateNotification', 'updatePinBubbleChat']
            ],
            'delete-internal-chat' => [
                'only' => ['deleteConversation', 'deleteBubbleChat']
            ],
        ];

        $requested_action = $request['route_action'];
        $selected_permission = null;
        $selected_action = null;
        foreach ($predefined_permissions as $key_pr => $val_pr) {
            foreach ($val_pr['only'] as $sub_key => $sub_val) {
                if ($sub_val == $requested_action) {
                    $selected_action = $sub_val;
                    $selected_permission = $key_pr;
                    break;
                }
            }
        }

        $check_permission = $company_permissions->where('name', $selected_permission);
        if ($check_permission->isNotEmpty()) {
            return true;
        }
        return false;
    }

    /**
     * Show List Agent Or List Staff
     *
     * - used in panel
     * - used in report
     *
     * @return Array
     */
    public function list($request)
    {
            $current_route_name = $request['current_route_name'];

            $current_user = Auth::user();
            $current_user_roles = $current_user->id_roles;
            $current_user_department = $current_user->id_department;

            // ONLY SPECIFIC COMPANY
            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = $this->agent_model->find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
                $current_user_company_id = $current_user_company ? $current_user_company->id : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
                $current_user_company_id = $current_user->id;
            }

            // Query
            $data = $this->agent_model->with(['companyDetailByIdCompany', 'department'])->where('id_company', $current_user_company_id);

            // Query Condition
            switch ($current_route_name) {
                case 'agent.list':
                    // Route agent.list
                    if ($request['type'] == 'staff') {
                        $data = $data->where('id_roles', 3);
                    } else {
                        $data = $data->where('id_roles', 4);

                        if ($current_user_roles != 2) {
                            $data = $data->where('id_department', $current_user_department)->where('id_roles', 4);
                        }
                    }
                    $data = $data->orderBy('created_at', 'desc')->get();
                    break;

                default:
                    // Route report.agent.list
                    if($current_user_roles == 3) {
                        $data = $data->where('id_department', $current_user_department)->where('id_roles', 4)->orWhere('id', $current_user['id']);
                    }
                    $data = $data->get();

                    if($current_user_roles == 4)
                        $data = collect([]);
                    break;
            }

            $agent_roles_option = $this->agent_model->avail_roles;

            // Set Return Data
            $data->map(function($item, $key) use ($agent_roles_option) {
                $item['roles_name'] = in_array($item['id_roles'], array_keys($agent_roles_option)) ? $agent_roles_option[$item['id_roles']] : null;

                $item['company_name'] = "-";
                if (!empty($item['companyDetailByIdCompany'])) {
                    $item['company_name'] = $item['companyDetailByIdCompany']['company_name'];
                }
                unset($item['companyDetailByIdCompany']);

                $item['department_name'] = "-";
                if (!empty($item['department'])) {
                    $item['department_name'] = $item['department']['name'];
                }
                unset($item['department']);
            });

        return $this->successResponse($data, __('messages.request.success'));
    }
}
