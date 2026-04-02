@extends('layouts.app-chat.app')
@section('content')
<div class="container">
    <div class="row justify-content-center mb-3">
        <div class="col-12 col-md-10 col-lg-10">
            <div class="row">
                <div class="col-7 col-md-7 col-lg-7">
                    <h5 class="card-title font-size-20">Your Profile info in ChatVolution</h5>
                    <p class="card-text text-muted font-size-18">
                        Personal info and options to manage it.
                        You can make some of this info, like your contact details,
                        visible to others so they can reach you easily.
                        You can also see a summary of your profiles.
                    </p>
                </div>
                <div class="col-5 col-md-5 col-lg-5">
                    <img class="img-fluid" src="{{asset('assets/images/illustration/il-personal-info.svg')}}" alt="illustration-cevo">
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-center mb-3">
        <div class="col-12 col-md-10 col-lg-10">
            <div class="card p-3">
                <div class="card-header bg-white border-bottom">
                    <div class="row">
                        <div class="col-12 mb-3">
                            <h5 class="card-title font-size-20">Info Profile & Contact</h5>
                            <p class="card-text text-muted font-size-18">Data containing your information and your contacts</p>
                        </div>
                    </div>
                    <div class="text-center">
                        <img class="rounded-circle header-profile-user avatar-xl dt-avatar pointer img-object-fit-cover" onclick="chooseAvatar()" src="{{asset('assets/images/small/img-2.jpg')}}" alt="profile-thumbnail">
                        <div class="p-image">
                            <i class="fa fa-camera upload-button" onclick="chooseAvatar()"></i>
                            <input class="avatar" id="avatar" type="file" accept="image/*" onchange="uploadAvatar()" />
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">UUID:</h5>
                            <p class="card-text text-muted dt-uuid"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Full Name:</h5>
                            <p class="card-text text-muted dt-name"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Email</h5>
                            <p class="card-text text-muted dt-email"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Phone Number</h5>
                            <p class="card-text text-muted dt-phone"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Role</h5>
                            <p class="card-text text-muted dt-permission_name"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Company Name</h5>
                            <p class="card-text text-muted dt-company_name"></p>
                        </div>
                        <div class="col-12 col-sm-4 mb-3">
                            <h5 class="card-title">Department Name</h5>
                            <p class="card-text text-muted dt-department_name"></p>
                        </div>
                        <div class="col-12 px-5 pt-3 pb-0 d-none d-sm-none d-md-block d-lg-block d-xl-block">
                            <button onclick="updateProfile()" class="btn  btn-tangerin btn-block waves-effect font-size-18">
                                <i class="fas fa-edit mr-2"></i> Edit Profile
                            </button>
                        </div>
                        <div class="col-12 pt-3 d-block d-sm-block d-md-none d-lg-none d-xl-none">
                            <button onclick="updateProfile()" class=" btn btn-tangerin btn-block waves-effect font-size-18 ">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-center mb-3">
        <div class="col-12 col-md-10 col-lg-10">
            <div class="row">
                <div class="col-7 col-md-7 col-lg-7">
                    <h5 class="card-title font-size-20">Other info and preferences for ChatVolution services</h5>
                    <p class="card-text text-muted font-size-18">
                        Ways to verify it’s you and settings for the web
                    </p>
                </div>
                <div class="col-5 col-md-5 col-lg-5">
                    <img class="img-fluid" src="{{asset('assets/images/illustration/il-settings.svg')}}" alt="illustration-cevo">
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-center mb-3">
        <div class="col-12 col-md-10 col-lg-5">
            <div class="card p-3 card-custom-size">
                <div class="card-header bg-white border-bottom custom-card-header">
                    <div class="row">
                        <div class="col-12 ">
                            <h5 class="card-title font-size-20">Password</h5>
                            <p class="card-text text-muted font-size-18">A secure password helps protect your ChatVolution Account</p>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item" onclick="changePassword()">
                            <div class="row">
                                <div class="col-10 col-md-10 col-lg-10">
                                    ••••••••
                                </div>
                                <div class="col-2 col-md-2 col-lg-2">
                                    <i class="fas fa-angle-right"></i>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-10 col-lg-5 d-none d-lg-block">
            <div class="card p-3 card-custom-size">
                <div class="card-header bg-white border-bottom custom-card-header">
                    <div class="row">
                        <div class="col-12 ">
                            <h5 class="card-title font-size-20">Coming Soon Feature</h5>
                            <p class="card-text text-muted font-size-18">...</p>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 col-md-12 col-lg-12 text-center">
                            <img class="img-fluid w-50" src="{{asset('assets/images/illustration/il-commingsoon.svg')}}" alt="illustration-cevo">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection