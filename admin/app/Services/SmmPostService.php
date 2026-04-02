<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\SmmPost;
use App\Models\SmmSocmedAccount;
use App\Models\SmmSocmedChannel;
use App\Models\User;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SmmPostService
{
    private
        $successCode = Response::HTTP_OK,
        $errorCode = Response::HTTP_BAD_REQUEST,
        $smm_socmed_channel_model;

    public function __construct(SmmPost $smm_post_model)
    {
        $this->smm_post_model = $smm_post_model;
    }

    public function list($smm_account_id=null)
    {
        $data = $this->smm_post_model->whereHas('smm_socmed_account')
            ->with('smm_socmed_account', function ($q) {
                $q->select('id', 'account_name', 'alias_name', 'smm_socmed_channel_id');
            })
            ->orderBy('id', 'desc')
            ->get();

        return $data;
    }

    public function store($data)
    {
        $posted_content = [];
        $error_post = [];
        $input_data = [];

        foreach( $data['smm_socmed_account_id'] as $account_id ) {
            $input_data = $data;
            $input_data['smm_socmed_account_id'] = $account_id;

            $store = $this->smm_post_model->create($input_data);
            if(!$store) {
                $error_post[] = $input_data;
                continue;
            } else {
                $posted_content[] = $store;
            }
        }

        $this->preparePostToSocmed($posted_content);

        $response = [
            'code' => Response::HTTP_OK,
            'status'=> 'Success',
			'message' => '',
			'data' => []
        ];
        $response['data']['error_post'] = $error_post;

        return $response;
    }

    public function destroy($id)
    {
        $post_item = $this->smm_post_model->findOrFail($id);
        // delete file first
        // if success, delete the post record
        $delete = $post_item->delete();
        return $delete;
    }

    public function show($id)
    {
        $post_item = $this->smm_post_model->findOrFail($id);
        $data = $this->smm_post_model->where('id', $id)
        ->with('smm_socmed_account', function ($q) {
            $q->select('id', 'account_name', 'alias_name', 'smm_socmed_channel_id');
        })
        ->first();

        return $data;
    }

    public function update($data, $id)
    {
        $post_item = $this->smm_post_model->findOrFail($id);
        $store = $post_item->update($data);
        return $store;
    }

    public function preparePostToSocmed($data)
    {
        foreach($data as $post_key => $post_item) {
            $item = $this->smm_post_model->find($post_item->id);
            $account = $item->smm_socmed_account;
            $channel = $account->smm_socmed_channel;

            // add pengecekan jadwal/schedule
            switch ($channel->slug) {
                case 'twitter':
                    $post = $this->postToTwitter($item, $account);
                    break;
            }
        }

        return true;
    }

    public function postToTwitter($post_data, $account_data)
    {
        try {

            $user_tokens = json_decode($account_data['description'], true);

            $client = new Client();
            $url = "https://api.twitter.com/2/tweets";
            $headers = [
                'Authorization' => 'OAuth oauth_consumer_key="YAoeW12juyX4L2iGkDfaphGaR",oauth_token="1464124222402437120-KvGNvrusAg7i77yVP5aACMGkczHcDE",
                oauth_signature_method="HMAC-SHA1",
                oauth_timestamp="1639443404",
                oauth_nonce="EMXBgHqhFAz",
                oauth_version="1.0",
                oauth_signature="lp%2BTnhsOPbty6hpThvI3p3bVyNM%3D"',

                // 'Authorization' => 'OAuth oauth_consumer_key="'.$user_tokens['token'].'",
                // oauth_token="'.env('TWITTER_ACCESS_TOKEN').'",
                // oauth_signature_method="HMAC-SHA1",
                // oauth_timestamp="1639443404",
                // oauth_nonce="EMXBgHqhFAz",
                // oauth_version="1.0",
                // oauth_signature="lp%2BTnhsOPbty6hpThvI3p3bVyNM%3D"'
            ];
            $fields = [
                'text' => $post_data['content']
            ];

            $response = $client->request('POST', $url, [
                'headers' => $headers,
                'json' => $fields,
            ]);

            $responseBody = json_decode($response->getBody(), true);
            $responseCode = $response->getStatusCode();

            return [
                'code' => Response::HTTP_OK,
                'message' => 'Success',
                'data' => $responseBody
            ];
        } catch (ClientException $e) {
            return [
                'code' => $e->getCode(),
                'message' => trim(preg_replace('/\s+/', ' ', $e->getMessage())),
                'data' => null
            ];
        }
    }

}