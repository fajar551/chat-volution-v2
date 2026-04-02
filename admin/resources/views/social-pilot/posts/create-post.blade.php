@extends('layouts.app-social.app-social')
@section('content')

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Create Post</h4>
                <a href="#" class="text-url-dark" title="Read In User Guide?">
                    <i class="fas fa-question-circle"></i>
                </a>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body">
                        <div class="form-group">
                            <label for="description_post">Posting</label>
                            <hr>
                            <textarea class="form-control fixed-area notes" id="description_post" required
                                placeholder="What do you mind?"></textarea>
                        </div>
                        <hr>
                        <div class="form-group mb-3">
                            <label for="file_content">File Content</label>
                            <input type="file" id="file_content" accept="image/jpeg,video/mp4" required
                                class="form-control" onchange="previewImage()" placeholder="Upload your file">
                            <div class="form-row mt-3">
                                <a class="ml-1" id="overview-file" data-fancybox href="assets/images/small/img-4.jpg">
                                    <img id="preview-file" src="assets/images/small/img-4.jpg" width="200"
                                        height="150" />
                                </a>
                            </div>
                        </div>
                        <div class="form-group pt-3">
                            <hr>
                            <label for="select_account">Select Account<span class="text-danger">*</span></label>
                            <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link active text-dark" data-toggle="tab" href="#group1" role="tab">
                                        <span class="d-block d-sm-none" title="group">
                                            <i class="fas fa-users fa-2 text-dark"></i>
                                        </span>
                                        <span class="d-none d-sm-block">
                                            <i class="fas fa-users fa-2 text-dark"></i> Groups
                                        </span>
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link text-dark" data-toggle="tab" href="#personal1" role="tab">
                                        <span class="d-block d-sm-none" title="personal">
                                            <i class="fas fa-user fa-2"></i>
                                        </span>
                                        <span class="d-none d-sm-block">
                                            <i class="fas fa-user fa-2 "></i> Personal
                                        </span>
                                    </a>
                                </li>
                            </ul>
                            <div class="tab-content text-muted">
                                <hr>
                                <div class="search-box chat-search-box mb-3 shadow">
                                    <div class="position-relative">
                                        <input type="search" class="form-control search"
                                            placeholder="Search accounts or groups...">
                                        <i class="ri-search-line search-icon"></i>
                                    </div>
                                </div>
                                <hr>
                                <div>
                                    <h5>Results: </h5>
                                </div>
                                <div class="tab-pane active" id="group1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">Testing123
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="tab-pane" id="personal1" role="tabpanel">
                                    <div class="form-row">
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">vxczxew
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-6 col-md-3 col-lg-3 mb-3">
                                            <div class="form-check">
                                                <label class="form-check-label pointer">
                                                    <input type="checkbox" class="form-check-input pointer"
                                                        name="select_account" id="select_account"
                                                        value="testing123">32323232
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group float-right">
                            <button type="button" class="btn btn-secondary">Cancel</button>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">Add to Queue</button>
                                <button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                                    data-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-angle-down"></i>
                                </button>
                                <div class="dropdown-menu bg-primary">
                                    <a class="dropdown-item text-url-white" href="#">Draft</a>
                                    <a class="dropdown-item text-url-white" href="#">Share Now</a>
                                    <a class="dropdown-item text-url-white" href="#">Share Next</a>
                                    <a class="dropdown-item text-url-white" href="#">Schedule Post</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection


@section('footer')
@include('shared.footer')
@endsection
