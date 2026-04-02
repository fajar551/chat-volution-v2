<?php

namespace App\Traits;

use Amp\Http\Client\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait ApiResponser{

    protected function successResponse($data, $message = null, $code = Response::HTTP_OK)
	{
		return response()->json([
			'code' => $code,
            'status'=> 'Success', // Response::$statusTexts[Response::HTTP_OK],
			'message' => $message,
			'data' => $data
		], $code);
	}

	protected function errorResponse($data = null, $message = null, $code = Response::HTTP_BAD_REQUEST)
	{
		$code = $code ?: $code = Response::HTTP_BAD_REQUEST;
		Log::error( ['Error' => ['code' => $code, 'message' => $message] ] );

		// Add CORS headers for cross-origin requests
		$origin = request()->header('origin');
		$allowedOrigins = [
			'https://v2chat.genio.id',
			'https://admin-chat.genio.id',
			'https://client-chat.genio.id',
			'https://waserverlive.genio.id',
			'https://chatvolution.my.id',
			'http://localhost:3000',
			'http://localhost:8000',
			'http://127.0.0.1:8000',
			'http://localhost:3001',
		];
		$corsOrigin = in_array($origin, $allowedOrigins) ? $origin : '*';

		return response()->json([
            'code' => $code,
			'status'=> 'Error '.Response::$statusTexts[$code],
			'message' => $message,
			'data' => $data
		], $code)->withHeaders([
			'Access-Control-Allow-Origin' => $corsOrigin,
			'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
			'Access-Control-Allow-Credentials' => 'true',
		]);
	}

	protected function successResponseWithLog($data, $message = null, $code = null, $log_name=null)
	{
		$code = $code ?: $code = Response::HTTP_OK;
		$return_response = [
            'code' => $code,
            'status'=> 'Success', // Response::$statusTexts[Response::HTTP_OK],
			'message' => $message,
			'data' => $data
		];

		// ADD TO ACTIVITY LOG
		$response_for_log = $return_response;
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
			case 'reply_chat':
				$log_item['email'] = isset($response_for_log['data']['user_email']) ? $response_for_log['data']['user_email'] : null;
				break;
		}

		createActivityLog(null, $log_item);

		return response()->json($return_response, $code);
	}

	protected function errorResponseWithLog($data = null, $message = null, $code = null, $log_name=null)
	{
		Log::error( ['Error' => ['code' => $code, 'message' => $message] ] );
		$code = $code ?: $code = Response::HTTP_BAD_REQUEST;
		$return_response = [
            'code' => $code,
            'status'=> 'Error '.Response::$statusTexts[$code],
			'message' => $message,
			'data' => $data
		];

		// ADD TO ACTIVITY LOG
		$response_for_log = $return_response;
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

		return response()->json($return_response, $code);
	}

}
