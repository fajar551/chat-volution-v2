<?php

namespace App\Traits;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

trait FormatResponserTrait{

    protected function successResponse($data, $message = null, $code = Response::HTTP_OK)
	{
		return [
			'code' => $code,
            'status'=> 'Success',
			'message' => $message,
			'data' => $data
        ];
	}

	protected function errorResponse($data = null, $message = null, $code = Response::HTTP_BAD_REQUEST)
	{
		return [
            'code' => $code,
			'status'=>'Error',
			'message' => $message,
			'data' => $data
        ];
	}

	protected function successResponseWithLog($data, $message = null, $code = null, $log_name=null)
	{
		$code = $code ?: $code = Response::HTTP_OK;
		$return_response = [
            'code' => $code,
            'status'=> 'Success',
			'message' => $message,
			'data' => $data
		];

		// ADD TO ACTIVITY LOG
		$response_for_log = $return_response['data'];
		if( !empty($response_for_log['data']) && isset($response_for_log['data']['token']) )
			unset($response_for_log['data']['token']);

		$log_item = [
			'request_sent' => \Request::except('password', 'password_confirmation', 'confirm_password', '_token'),
			'response' => $response_for_log,
			'log_name' => $log_name ?: null
		];

		if(Auth::check()){
			$log_item['email'] = Auth::user()->email;
		} elseif ( !empty(\Request::get('email')) ) {
			$log_item['email'] = \Request::get('email');
		} elseif( isset($data['email']) && !empty($data['email']) ) {
			$log_item['email'] = $data['email'];
		}

		switch($log_name) {
			case 'new_chat':
				$log_item['email'] = isset($response_for_log['data']['user_email']) ? $response_for_log['data']['user_email'] :
					(isset($response_for_log['user_email']) ? $response_for_log['user_email'] : null);
				break;
		}

		createActivityLog(null, $log_item);

		return $return_response;
	}

	protected function errorResponseWithLog($data = null, $message = null, $code = null)
	{
		$code = $code ?: $code = Response::HTTP_BAD_REQUEST;
		$return_response = [
            'code' => $code,
            'status'=> 'Error '.Response::$statusTexts[$code],
			'message' => $message,
			'data' => $data
		];

		// ADD TO ACTIVITY LOG
		$response_for_log = $return_response['data'];
		if( !empty($response_for_log['data']) && isset($response_for_log['data']['token']) )
			unset($response_for_log['data']['token']);

		$log_item = [
			'request_sent' => \Request::except('password', 'password_confirmation', 'confirm_password', '_token'),
			'response' => $response_for_log,
			'log_name' => 'error'
		];

		if(Auth::check()){
			$log_item['email'] = Auth::user()->email;
		} elseif ( !empty(\Request::get('email')) ) {
			$log_item['email'] = \Request::get('email');
		}

		createActivityLog($message, $log_item);

		return $return_response;
	}

}