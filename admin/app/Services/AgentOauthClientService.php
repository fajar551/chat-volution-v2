<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AgentOauthClient;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AgentOauthClientService
{
    use FormatResponserTrait;

    public function __construct(
        Agent $agent_model,
        AgentOauthClient $agent_oauth_client_model
    ) {
        $this->agent_model = $agent_model;
        $this->agent_oauth_client_model = $agent_oauth_client_model;
    }

    public static function getInstance()
    {
        return new static(
            new Agent(),
            new AgentOauthClient()
        );
    }

    public function list()
    {
        $auth_exists = Auth::check();
        $result = [];

        if($auth_exists) {
            $id = Auth::user()->id;
            $user_role = Auth::user()->id_roles;

            # Query Start
            $query = $this->agent_oauth_client_model;

            if ($user_role != 1 && $user_role != 2) {
                $agent = Agent::with('companyDetailByIdCompany')->where('id', $id)->first();
                if(!$agent && !$agent['companyDetailByIdCompany']) {
                    return $this->errorResponse(null, __('messages.auth.user_not_found'));
                }

                $id = $agent['companyDetailByIdCompany']['agent_id']; // set id as company id

                // Only show domain name if current user is not company
                $query = $query->select('domain');
            }

            if ($user_role == 2) {
                $query = $query->where('created_by', $id);
            }
            $result = $query->orderBy('id', 'desc')->get();
        }
        return $result;
    }

    public function store($request)
    {
        $id = Auth::user()->id;

        // Prepare secret key
        $date = now()->format('Y-m-d-H:i:s');
        $random = Str::random();
        $slug_name = Str::slug($request['name']);
        $secret_prep = $random . $date . $slug_name;
        $secret_key = Hash::make($secret_prep);

        $data = $request;
        $data['secret'] = $secret_key;
        $data['personal_access_client'] = 1;
        $data['password_client'] = 0;
        $data['revoked'] = 0;
        $data['created_by'] = $id;
        // $parsed = parse_url($request['domain']); // filter url for domain column
        // $data['domain'] = $parsed['scheme'].'://'.$parsed['host'];

        $post = $this->agent_oauth_client_model->create($data);

        return $post;
    }

    public function show($id)
    {
        $user_id = Auth::user()->id;
        $item = $this->agent_oauth_client_model->where('id', $id)->where('created_by', $user_id)->first();
        if ($item) {
            $result = $this->successResponse($item, __('messages.request.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        }
        return $result;
    }

    public function destroy($id)
    {
        $user_id = Auth::user()->id;
        $item = $this->agent_oauth_client_model->where('id', $id)->where('created_by', $user_id)->first();
        $result = $this->errorResponse(null, __('messages.request.error') . " " . __('messages.data_not_found'));
        if (!$item) {
            return $result;
        }

        $del = $item->delete();
        if ($del) {
            $result = $this->successResponse(null, __('messages.delete.success'));
        } else {
            $result = $this->errorResponse(null, __('messages.update.error'));
        }
        return $result;
    }

    /**
     * Validate user by client secret key
     *
     * @param $request
     * @param $check_domain = true|false
     */
    public function validate($request, $check_domain = true)
    {
        // skip origin check if check_domain false
        if ($check_domain) {
            if (empty($request['origin'])) {
                $result = $this->errorResponse(null, __('messages.validate_agent.not_found'), Response::HTTP_FORBIDDEN);
                return $result;
            }
        }

        if (array_key_exists('api_key', $request) && !empty($request['api_key'])) {
            $client_secret = $request['api_key'];

            $url_scheme = null;
            $url_host = null;
            if (!empty($request['origin'])) {
                $parsed = parse_url($request['origin']); // filter url for domain column
                if ($parsed !== false) {
                    $url_scheme = isset($parsed['scheme']) ? $parsed['scheme'] : null;
                    $url_host = isset($parsed['host']) ? $parsed['host'] : null;
                }
            }

            // check client secret key or secret key&domainquery
            $user = $this->agent_oauth_client_model->where('secret', $client_secret);

            $found_domain = false;
            if ($check_domain && ($user->first() != null) && !empty($url_host)) {
                $stored_domain = $user->first()->domain;
                $stored_url_host = $stored_domain;
                if (filter_var($stored_domain, FILTER_VALIDATE_URL)) {
                    $parsed_stored_domain = parse_url($stored_domain);
                    if ($parsed_stored_domain !== false && isset($parsed_stored_domain['host'])) {
                        $stored_url_host = $parsed_stored_domain['host'];
                    }
                }

                if ($url_host == $stored_url_host) {
                    $found_domain = true;
                } else {
                    $found_domain = false;
                }

                $user = $found_domain;
                // $user = $user->where('domain', $request['origin']); // previous code to check the whole input
            } else {
                // Skip domain check if url_host is empty or check_domain is false
                $user = true;
            }
            // $user = ($user != true ? $user->first() : $user); // previous code to check the whole input

            $error_result = $this->errorResponse(null, __('messages.validate_agent.not_permitted'), Response::HTTP_FORBIDDEN);
            if(!$user)
                return $error_result;

            // Get user data for return data
            $result = null;
            $agent_data = $this->agent_oauth_client_model->with(['agent:id,uuid,name,status'])->where('secret', $client_secret)->first();
            if($agent_data && $agent_data->agent && $agent_data->agent->company_detail) {
                $result = $agent_data->agent;
                $result['name'] = $agent_data->agent->company_detail->company_name; // company name
                $result['found'] = true;
                $result = $this->successResponse($result, __('messages.validate_agent.success'));
            } else {
                $result = $error_result;
            }
        } else {
            $result = $this->errorResponse(null, __('messages.validate_agent.error'), Response::HTTP_FORBIDDEN);
        }
        return $result;
    }

    public function getCompanyBySecret($client_secret)
    {
        try {
            if(empty($client_secret)) {
                return [];
            }

            $item = $this->agent_oauth_client_model->with('agent.company_detail')->where('secret', $client_secret)->first();

            if(empty($item)) {
                return [];
            }

            $agent_data = [];
            if (!empty($item->agent)) {
                $agent_data = $item->agent->toArray();

                // Get company ID from agent
                if(isset($item->agent->id)) {
                    $agent_data['id'] = $item->agent->id;
                }

                $agent_data['company_name'] = isset($item->agent->company_detail) && !empty($item->agent->company_detail) ? $item->agent->company_detail->company_name : null;
                $agent_data['company_phone_number'] = isset($item->agent->company_detail) && !empty($item->agent->company_detail) ? $item->agent->company_detail->company_phone_number : null;

                if(isset($agent_data['company_detail'])) {
                    unset($agent_data['company_detail']);
                }
            }

            return $agent_data;
        } catch (\Exception $e) {
            \Log::error('Error in getCompanyBySecret', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }
}
