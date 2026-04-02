<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AgentOauthClientService;

class WithClientSecretMiddleware
{
    protected $agent_oauth_client_service;

    public function __construct(AgentOauthClientService $agent_oauth_client_service)
    {
        $this->agent_oauth_client_service = $agent_oauth_client_service;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        /**
         * for unauthorized user
         * used for company that integrated its secret key
         */
        /** Check client key */
        $request['origin'] = $request->header('origin');

        try {
            $data = $this->agent_oauth_client_service->validate($request->all(), false);
            if ($data['code'] !== 200) {
                // Add CORS headers to error response
                $origin = $request->header('origin');
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

                return response()->json($data, $data['code'])->withHeaders([
                    'Access-Control-Allow-Origin' => $corsOrigin,
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
                    'Access-Control-Allow-Credentials' => 'true',
                ]);
            }
        } catch (\Exception $e) {
            // Handle exception and add CORS headers
            $origin = $request->header('origin');
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
                'code' => 500,
                'message' => 'Internal Server Error: ' . $e->getMessage(),
                'data' => null
            ], 500)->withHeaders([
                'Access-Control-Allow-Origin' => $corsOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
                'Access-Control-Allow-Credentials' => 'true',
            ]);
        }

        return $next($request);
    }
}
