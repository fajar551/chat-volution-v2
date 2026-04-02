<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @throws \Throwable
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    public function render($request, Throwable $exception)
    {
        if ($this->isHttpException($exception)) {
            if ($exception->getStatusCode() == 404) {
                $data = [
                    'title' => '404',
                ];
                return response()->view('errors.error404', $data, 404);
            } else {
                $data = [
                    'title' => 'Failed Response Request',
                ];
                return response()->view('errors.all-error', $data, 404);
            }
        }

        return parent::render($request, $exception);
        // if ($this->isHttpException($exception)) {
        //     if (request()->expectsJson()) {
        //         switch ($exception->getStatusCode()) {
        //             case 404:
        //                 return response()->json(['message' => 'Invalid request or url.'], 404);
        //                 break;
        //             case 429:
        //                 return response()->json(['code' => 429, 'message' => 'Too Many Requests.'], 429);
        //                 break;
        //             case '500':
        //                 return response()->json(['message' => 'Server error. Please contact admin.'], 500);
        //                 break;

        //             default:
        //                 return $this->renderHttpException($exception);
        //                 break;
        //         }
        //     }
        // } else if ($exception instanceof ModelNotFoundException) {
        //     if (request()->expectsJson()) {
        //         return response()->json(['message' => $exception->getMessage()], 404);
        //     }
        // } else {
        //     return parent::render($request, $exception);
        // }

        // return parent::render($request, $exception);
    }
}
