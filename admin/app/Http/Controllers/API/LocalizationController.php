<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\API\ApiController;
use Illuminate\Http\Response;
use Exception;

class LocalizationController extends ApiController
{
    public function setLang($locale)
    {
        try {
            $this->checkLang($locale);
            app()->setLocale($locale);
            session()->put('locale', $locale);
            $data = ['locale' => session()->get('locale')];

            return $this->successResponse($data, __('messages.set_locale.success', ['locale' => $locale]));
        } catch (Exception $th) {
            return $this->errorResponse(null, $th->getMessage(), Response::HTTP_NOT_FOUND);
            throw $th;
        }
    }

    public function checkLang($locale)
    {
        $available_locales = config('app.available_locales');
        if(! in_array($locale, $available_locales) )
        {
            throw new Exception( __('messages.set_locale.error', ['locale' => $locale]) );
        }
    }
}
