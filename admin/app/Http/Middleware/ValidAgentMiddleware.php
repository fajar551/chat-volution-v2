<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AgentService;
use Illuminate\Support\Facades\Auth;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;

class ValidAgentMiddleware
{
    use FormatResponserTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if(!Auth::check()) {
            return response()->json($this->errorResponseWithLog(null, __('auth.not_permitted')), Response::HTTP_FORBIDDEN);
        }

        $user = Auth::user();
        $agent_service = AgentService::getInstance();
        $validate_agent = $agent_service->validateAgent([ 'id' => $user['id'] ]);
        if($validate_agent['code'] != 200) {
            // auth()->logout();
            return response()->json($this->errorResponseWithLog(null, $validate_agent['message']), Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
