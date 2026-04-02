<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Laravel\Passport\Passport;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
        if ($this->app->environment('local') || $this->app->environment('development')) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

        Schema::defaultStringLength(255);
        config(['app.locale' => 'id']);
	    Carbon::setLocale('id');

        $this->registerPolicies();
        if (! $this->app->routesAreCached()) {
            Passport::routes();
        }

        if($this->app->environment('production')) {
            \URL::forceScheme('https');
        }


        // ACTIVITY LOG SETTINGS
        if(env('ACTIVITY_LOG') == 'enable') {
            activity()->enableLogging();
        } else {
            activity()->disableLogging();
        }

        // Trace and find the slowest query
        // Hanya aktif di development/local environment
        if ($this->app->environment('local') || $this->app->environment('development')) {
            DB::listen(function ($query) {
                // $query->sql; // the sql string that was executed
                // $query->bindings; // the parameters passed to the sql query (this replace the '?'s in the sql string)
                // $query->time; // the time it took for the query to execute;

                $location = collect(debug_backtrace())->filter(function ($trace) {
                    if(isset($trace['file'])) {
                        return !str_contains($trace['file'], 'vendor/');
                    }
                })->first(); // grab the first element of non vendor/ calls
                // $bindings = implode(', ', $query->bindings); // format the bindings as string
                Log::info("— — — — — —
                Sql: $query->sql
                Bindings: ");
                Log::info($query->bindings);
                Log::info("Time: $query->time");
                Log::info("File: " . $location['file']);
                Log::info("Line: ". $location['line']);
                Log::info("— — — — — —");
            });
        }
    }
}
