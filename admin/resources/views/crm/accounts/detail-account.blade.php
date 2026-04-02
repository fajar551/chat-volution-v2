@extends('layouts.crm.app-crm')
@section('content')
<input type="hidden" value="{{ $menu }}" id="type">
<div class="container-fluid">
    <div class="card">
        <div class="card-body">
            <div>
                <h4 class="card-title">
                    <i class="fas fa-building"></i>
                    Detail Account
                </h4>
                <p class="card-title-desc pl-3">PT Adaro Energy, Tbk</p>
            </div>

            <ul class="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" data-toggle="tab" href="#detail1" role="tab">
                        <span class="d-block d-sm-none" title="detail"><i class="fas fa-info"></i></span>
                        <span class="d-none d-sm-block"><i class="fas fa-info"></i> Detail</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-toggle="tab" href="#profile1" role="tab">
                        <span class="d-block d-sm-none" title="related"><i class="fas fa-bezier-curve"></i></span>
                        <span class="d-none d-sm-block"><i class="fas fa-bezier-curve"></i> Related</span>
                    </a>
                </li>
            </ul>

            <!-- Tab panes -->
            <div class="tab-content p-3 text-muted">
                <div class="tab-pane active" id="detail1" role="tabpanel">
                    @include("crm.accounts.detail-account-information")
                </div>
                <div class="tab-pane" id="profile1" role="tabpanel">
                    @include("crm.accounts.detail-account-related")
                </div>
            </div>

        </div>
    </div>
</div>

@endsection

@section('footer')
@include('shared.footer')

@endsection
