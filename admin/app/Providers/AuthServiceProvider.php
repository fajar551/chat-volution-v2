<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        Gate::define('viewLarecipe', function(?User $user, $documentation) {
            if(isset($user['id_roles']) && $user['id_roles'] == 5)
                return true; // only for developer

            if($user) {
                Auth::logout();
                Session::flush();
            }
            redirect()->route('dev.login-form')->send();
            return true;
        });

        // if (Gate::denies('viewLarecipe', $documentation)) {
        //     // The current user is not signed-in...
        //     // redirect('dev/login')->send();
        //     // return true;
        // }
    }
}
