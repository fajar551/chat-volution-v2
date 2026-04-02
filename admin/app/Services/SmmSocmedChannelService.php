<?php

namespace App\Services;

use App\Models\SmmSocmedChannel;
use App\Traits\FormatResponserTrait;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SmmSocmedChannelService
{
    use FormatResponserTrait;

    public function __construct(SmmSocmedChannel $smm_socmed_channel_model)
    {
        $this->smm_socmed_channel_model = $smm_socmed_channel_model;
    }

    /**
     * List of socmed channels
     *
     * @param string $status = 'active|inactive'
     */
    public function list($status='active')
    {
        // save userID in session
        $current_user = Auth::guard('api')->user();
        session(['current_user' => $current_user]);

        $data = $this->smm_socmed_channel_model;
        if($status == 'active') {
            $data = $data->where('status', 1);
        }
        if($status == 'inactive') {
            $data = $data->where('status', 0);
        }
        $result = $data->orderBy('name', 'asc')->get();
        $response_data = $result->map(function($item, $key) {
            $item['image_logo'] = $item['image_logo'] ? asset($item['image_logo']) : null;
            $item['redirect_url'] = \Route::has($item['slug'].'.login') ? route($item['slug'].'.login') : "";
            return $item;
        });

        return $response_data;
    }

    public function store($request)
    {
        $data_to_input = $request;
        $data_to_input['slug'] = Str::slug($request['name']);
        $data_to_input['status'] = array_key_exists('status', $request) ? $request['status'] : 0;

        $post = $this->smm_socmed_channel_model->create($data_to_input);
        return $post;
    }

    public function destroy($id)
    {
        $item = $this->smm_socmed_channel_model->find($id);
        $result = $this->errorResponse(null, __('messages.request.error')." ".__('messages.data_not_found') );
        if (!$item) {
            return $result;
        }

        // add code for delete image
        $del = $item->delete();
        if($del) {
            $result = $this->successResponse(null, __('messages.delete.success') );
        } else {
            $result = $this->errorResponse(null, __('messages.delete.error') );
        }
        return $result;
    }

    public function update($request, $id)
    {
        $item = $this->smm_socmed_channel_model->find($id);
        $result = $this->errorResponse(null, __('messages.request.error')." ".__('messages.data_not_found') );
        if (!$item) {
            return $result;
        }

        $data_to_input = $request;
        $data_to_input['slug'] = Str::slug($request['name']);

        $post = $item->update($data_to_input);
        if($post) {
            $result = $this->successResponse($item, __('messages.update.success') );
        } else {
            $result = $this->errorResponse(null, __('messages.update.error') );
        }
        return $result;
    }

    public function updateStatus($request)
    {
        $item = $this->smm_socmed_channel_model->find($request['id']);
        $result = $this->errorResponse(null, __('messages.request.error')." ".__('messages.data_not_found') );
        if (!$item) {
            return $result;
        }

        $post = $item->update(['status' => $request['status']]);
        if($post) {
            $result = $this->successResponse($item, __('messages.update.success') );
        } else {
            $result = $this->errorResponse(null, __('messages.update.error') );
        }
        return $result;
    }

    public function show($id)
    {
        $item = $this->smm_socmed_channel_model->find($id);
        if ($item) {
            $result = $this->successResponse($item, __('messages.request.success') );
        } else {
            $result = $this->errorResponse(null, __('messages.request.error')." ".__('messages.data_not_found') );
        }
        return $result;
    }
}