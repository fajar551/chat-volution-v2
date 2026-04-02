<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AgentService;
use Illuminate\Support\Facades\Auth;
use App\Traits\FormatResponserTrait;
use Illuminate\Http\Response;

class CompanyFeaturePermissionMiddleware
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
        if (Auth::check()) {
            $user = Auth::user();
            $route_name = $request->route()->getName();
            $route_action = $request->route()->getActionMethod();

            # Admin/Root
            if($user->id_roles == 1)
                return $next($request);

            $agent_service = AgentService::getInstance();
            $has_permission = $agent_service->checkCompanyPermissions(['route_action' => $route_action]);
            if($has_permission) {
                return $next($request);
            }

            return response()->json($this->errorResponseWithLog(null, __('auth.not_permitted')), Response::HTTP_FORBIDDEN);
        }

        return response()->json($this->errorResponseWithLog(null, __('auth.not_permitted')), Response::HTTP_FORBIDDEN);
    }
}
