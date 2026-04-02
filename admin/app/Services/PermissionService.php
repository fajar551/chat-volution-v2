<?php

namespace App\Services;

use App\User;
use App\Models\Agent;
use App\Models\CompanyDetail;
use App\Traits\FormatResponserTrait;
use Exception;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    use FormatResponserTrait;

    public function __construct()
    {
        //
    }

    public function list()
    {
        $permissions = Permission::all();

        if($permissions) {
            return $this->successResponse( $permissions, __('messages.request.success'));
        } else {
            return $this->errorResponse(null, __('messages.request.error') );
        }
    }
}