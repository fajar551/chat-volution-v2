<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\SmmSocmedAccount;
use Laravel\Socialite\Facades\Socialite;
use App\Services\SmmSocmedAccountService;
use App\Http\Controllers\API\ApiController;

class SocialController extends ApiController
{
    private
        $user_model,
        $smm_socmed_account_model,
        $client_id,
        $client_secret;

    public function __construct(User $user_model, SmmSocmedAccount $smm_socmed_account_model)
    {
        $this->user_model = $user_model;
        $this->smm_socmed_account_model = $smm_socmed_account_model;

        if( env('APP_ENV') == 'local' ) {
            $this->client_id = env('FB_CLIENT_ID_LOCAL');
            $this->client_secret = env('FB_CLIENT_SECRET_LOCAL');
        } else {
            $this->client_id = env('FB_CLIENT_ID_STAGING');
            $this->client_secret = env('FB_CLIENT_SECRET_STAGING');
        }
    }

    public function dashboard(Request $request)
    {
        $data = [
            'title' => 'Dashboard Social',
            'menu' => 'Dashboard',
            'sub_menu' => false,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.dashboard.index', $data);
    }

    /* accounts */
    public function createAccounts(Request $request)
    {
        $data = [
            'title' => 'Create Accounts',
            'menu' => 'Accounts',
            'sub_menu' => 'Create Accounts',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                'js/social/accounts/create-account.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.accounts.create-account', $data);
    }

    public function accounts(Request $request)
    {
        $data = [
            'title' => 'Manage Accounts SMM',
            'menu' => 'Accounts',
            'sub_menu' => 'Manage Accounts',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                'js/social/accounts/accounts.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.accounts.accounts', $data);
    }

    /* groups */
    public function groups(Request $request)
    {
        $data = [
            'title' => 'Manage Groups SMM',
            'menu' => 'Groups',
            'sub_menu' => 'Manage Groups',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                'js/social/groups/groups.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.groups.groups', $data);
    }

    public function addGroup(Request $request)
    {
        $data = [
            'title' => 'Add Group SMM',
            'menu' => 'Groups',
            'sub_menu' => 'Create Group',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                'js/social/groups/groups.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.groups.add-group', $data);
    }

    public function editGroup(Request $request)
    {
        $data = [
            'title' => 'Edit Group SMM',
            'menu' => 'Groups',
            'id' => $request->id,
            'sub_menu' => 'Create Group',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                'js/social/groups/groups.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('social-pilot.groups.edit-group', $data);
    }

    public function addPost(Request $request)
    {
        $data = [
            'title' => 'Add Post SMM',
            'menu' => 'Post',
            'sub_menu' => 'Create Post',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/assets/libs/tinymce/tinymce.min.js',
                'js/social/posts/createPosts.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css'
            ]
        ];
        return view('social-pilot.posts.create-post', $data);
    }

    /**
     * Connect Social Media
     */
    public function facebookRedirect()
    {
        // set scopes
        // return Socialite::driver('facebook')->setScopes(['read_insights'])->redirect();
        return Socialite::driver('facebook')->redirect();
    }

    public function loginWithFacebook(
        Request $request,
        SmmSocmedAccountService $smm_socmed_account_service
    )
    {
        try {
            $post = $smm_socmed_account_service->handle($request->all(), 'facebook');

            // return json
            if(!empty($post) && substr($post['code'], 0, 1) == '2') {
                return $this->successResponse(null, $post['message'], $post['code']);
            } else {
                return $this->errorResponse(null, $post['message'], $post['code']);
            }

            // return redirect to home
            return redirect('/')->with(['message' => $post]);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
            throw $th;
        }

    }

    public function check()
    {
        return (session()->all());
        return (json_encode(session()->get('fb_socialite')) );

        $user = Socialite::driver('facebook')->user();
        return $user;

        // OAuth 2.0 providers...
        $token = $user->token;
        $refreshToken = $user->refreshToken;
        $expiresIn = $user->expiresIn;

        // OAuth 1.0 providers...
        $token = $user->token;
        $tokenSecret = $user->tokenSecret;

        // All providers...
        $user->getId();
        $user->getNickname();
        $user->getName();
        $user->getEmail();
        $user->getAvatar();
    }

    public function twitterRedirect()
    {
        return Socialite::driver('twitter')->redirect();
    }

    public function loginWithTwitter(
        Request $request,
        SmmSocmedAccountService $smm_socmed_account_service
    )
    {
        try {
            $post = $smm_socmed_account_service->handle($request->all(), 'twitter');

            // return json
            if(!empty($post) && substr($post['code'], 0, 1) == '2') {
                return $this->successResponse(null, $post['message'], $post['code']);
            } else {
                return $this->errorResponse(null, $post['message'], $post['code']);
            }

            // return redirect to home
            return redirect('/')->with(['message' => $post]);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
            throw $th;
        }
    }

    public function instagramRedirect()
    {
        return Socialite::driver('instagram')->redirect();
    }

    public function loginWithInstagram(
        Request $request,
        SmmSocmedAccountService $smm_socmed_account_service
    )
    {
        try {
            $post = $smm_socmed_account_service->handle($request->all(), 'instagram');

            // return json
            if(!empty($post) && substr($post['code'], 0, 1) == '2') {
                return $this->successResponse(null, $post['message'], $post['code']);
            } else {
                return $this->errorResponse(null, $post['message'], $post['code']);
            }

            // return redirect to home
            return redirect('/')->with(['message' => $post]);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
            throw $th;
        }
    }

    public function tiktokRedirect()
    {
        return Socialite::driver('tiktok')->redirect();
    }

    public function loginWithTiktok(
        Request $request,
        SmmSocmedAccountService $smm_socmed_account_service
    )
    {
        try {
            $post = $smm_socmed_account_service->handle($request->all(), 'tiktok');

            // return json
            if(!empty($post) && substr($post['code'], 0, 1) == '2') {
                return $this->successResponse(null, $post['message'], $post['code']);
            } else {
                return $this->errorResponse(null, $post['message'], $post['code']);
            }

            // return redirect to home
            return redirect('/')->with(['message' => $post]);
        } catch (\Throwable $th) {
            return $this->errorResponse(null, $th->getMessage());
            throw $th;
        }
    }



}
