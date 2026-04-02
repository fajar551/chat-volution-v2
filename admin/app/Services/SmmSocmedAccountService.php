<?php

namespace App\Services;

use App\Models\SmmSocmedAccount;
use App\Models\SmmSocmedChannel;
use App\Models\User;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class SmmSocmedAccountService
{
    private
        $successCode = Response::HTTP_CREATED,
        $errorCode = Response::HTTP_BAD_REQUEST,
        $smm_socmed_account_model,
        $smm_socmed_channel_model;

    public function __construct(
        SmmSocmedAccount $smm_socmed_account_model,
        SmmSocmedChannel $smm_socmed_channel_model
    )
    {
        $this->smm_socmed_account_model = $smm_socmed_account_model;
        $this->smm_socmed_channel_model = $smm_socmed_channel_model;
    }

    public function handle($data, $type="")
    {
        // set response message
        $message = [
            'code' => $this->errorCode,
            'message' => __('messages.connect_account.error'),
            'data' => [
                'alert_type' => 'danger',
            ]
        ];

        $channel = $this->smm_socmed_channel_model->where('slug', $type)->first();
        $channel_id = !empty($channel) ? $channel->id : null;

        switch ($type) {
            case 'facebook':
                $user = Socialite::driver('facebook')->user();
                session(['fb_socialite' => $user]);

                $user['smm_socmed_channel_id'] = $channel_id;
                $user['expired_at'] = today()->addDays(59); // facebook token live for 60 days
            break;

            case 'twitter':
                $user = Socialite::driver('twitter')->user();
                // dd($user);
                session(['twitter_socialite' => $user]);
                // \Session::put('twitter_socialite', $user);

                $user['smm_socmed_channel_id'] = $channel_id;
                $user['smm_description'] = json_encode(["token" => $user->token, "tokenSecret" => $user->tokenSecret]);
            break;

            case 'tiktok':
                $user = Socialite::driver('tiktok')->user();
                session(['tiktok_socialite' => $user]);
                dd($user);

                $user['smm_socmed_channel_id'] = $channel_id;
                $user['smm_description'] = json_encode(["token" => $user->token, "tokenSecret" => $user->tokenSecret]);
            break;

            default:
            return $message;
        }

        $store = $this->store($user);
        if($store) {
            $message = [
                'code' => $this->successCode,
                'message' => __('messages.connect_account.success'),
                'data' => [
                    'alert_type' => 'success',
                ]
            ];
        }
        return $message;


        /** Login or Register user to app */
        # call method loginOrRegister here
    }

    /**
     * Store user socmed account
     */
    public function store($data)
    {
        if($data) {
            $user_acc = $this->smm_socmed_account_model->where('user_socmed_id', $data->id)->first();
            $description = $data['smm_description'] ?? '';

            $post = $this->smm_socmed_account_model->updateOrCreate(
                [ 'user_socmed_id' => $data->id, ],
                [
                    'account_name' => $data->name,
                    'alias_name' => $user_acc ? ($user_acc->alias_name!="" ? $user_acc->alias_name : $data->name) : $data->name, // if user exists then user alias, other than that use account name
                    'token' => $data->token,
                    'description' => $description,
                    'smm_socmed_channel_id' => $data['smm_socmed_channel_id'], // filled with socmed channel id
                    'json_result' => json_encode($data), // filled with json result
                    'account_email' => $data->email,
                    'created_by' => 1, // Auth::user()->id
                    'expired_at' => isset($data['expired_at']) ? $data['expired_at'] : null, // expired token date
                ]
            );
            return $post;
        }

        return false;
    }

    /**
     * List of socmed accounts
     *
     * @param string $status = 'active|inactive'
     */
    public function list($status='active')
    {
        $data = $this->smm_socmed_account_model;
        if($status == 'active') {
            $data = $data->where('status', 1);
        }
        if($status == 'inactive') {
            $data = $data->where('status', 0);
        }
        $result = $data->orderBy('id', 'desc')->get();

        $response_data = $result;
        if(!empty($result)) {
            $response_data = $result->map(function($item, $key) {
                $this->addKeyToResponse($item);
                unset($item['json_result']);
                return $item;
            });
        }

        return $response_data;
    }

    /**
     * Delete user socmed account
     */
    public function destroy($id)
    {
        $item = $this->smm_socmed_account_model->findOrFail($id);
        $delete = $item->delete();
        return $delete;
    }

    /**
     * Update user socmed account
     */
    public function update($data, $id)
    {
        $item = $this->smm_socmed_account_model->findOrFail($id);
        $post = $item->update($data);
        return [
            'result' => $post,
            'updated_data' => $item
        ];
    }

    /**
     * Show user socmed account
     */
    public function show($id)
    {
        $item = $this->smm_socmed_account_model->findOrFail($id);
        if($item) {
            $this->addKeyToResponse($item);
        }
        return $item;
    }

    public function addKeyToResponse($data)
    {
        $data['smm_socmed_channel_name'] = $data->smm_socmed_channel->name;
        unset($data['smm_socmed_channel']);
    }

    /**
     * Default login or register with socialite
     */
    public function loginOrRegister($data)
    {
        $user_data = $data;
        $isUser = User::where('fb_id', $user_data->id)->first();
        if($isUser){
            Auth::login($isUser);
            return redirect('/dashboard');
        }else{
            $createUser = User::create([
                'name' => $user_data->name,
                'email' => $user_data->email,
                'fb_id' => $user_data->id,
                'password' => encrypt('admin@123')
            ]);

            Auth::login($createUser);
            return redirect('/dashboard');
        }
    }
}