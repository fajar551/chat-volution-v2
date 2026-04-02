<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ErrorController extends Controller
{
    public function index()
    {
        $data = [
            'title' => '404 Error'
        ];
        return view('errors.error404', $data);
    }
}
