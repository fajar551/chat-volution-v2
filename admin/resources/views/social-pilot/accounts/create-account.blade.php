@extends('layouts.app-social.app-social')

@section('content')

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div>
                <h4 class="mb-0">Connect a new accounts</h4>
                <div class="page-title-left">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima ducimus voluptatem fugiat eius,
                        animi excepturi consequatur. Distinctio inventore delectus fugit. Deleniti voluptatum eaque
                        inventore ab quae a incidunt, alias velit.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12 col-sm-3 col-md-3 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <div class="text-center">
                        <img src="/assets/images/illustration/img_instagram.svg" alt="avatar-3"
                            class="rounded-circle avatar-md">
                    </div>
                    <h5 class="card-title text-center mt-2">Instagram</h5>
                    <p class="card-text text-center">Bussiness account</p>
                    <button class="btn btn-instagram btn-block">
                        <b>Connect</b>
                    </button>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <div class="text-center">
                        <img src="/assets/images/illustration/ic_fb_logo.svg" alt="avatar-3"
                            class="rounded-circle avatar-md">
                    </div>
                    <h5 class="card-title text-center mt-2">Facebook</h5>
                    <p class="card-text text-center">Page Or Group</p>
                    <button class="btn btn-primary btn-block">
                        <b>Connect</b>
                    </button>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <div class="text-center">
                        <img src="/assets/images/illustration/ic_twitter.svg" alt="avatar-3"
                            class="rounded-circle avatar-md">
                    </div>
                    <h5 class="card-title text-center mt-2">Twitter</h5>
                    <p class="card-text text-center">Profile</p>
                    <button class="btn btn-twitter btn-block">
                        <b>Connect</b>
                    </button>
                </div>
            </div>
        </div>
        <div class="col-12 col-sm-3 col-md-3 col-lg-3">
            <div class="card">
                <div class="card-body">
                    <div class="text-center">
                        <img src="/assets/images/illustration/ic_tiktok_logo.svg" alt="avatar-3" class="avatar-md">
                    </div>
                    <h5 class="card-title text-center mt-2">TikTok</h5>
                    <p class="card-text text-center">Profile</p>
                    <button class="btn btn-tiktok btn-block">
                        <b>Connect</b>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection
