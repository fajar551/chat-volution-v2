@extends('layouts.app-chat.app')
@section('content')

<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box align-items-center justify-content-between">
                <h4 class="mb-0">Billing</h4>
                <p class="text-left">Subscriptions Payment Settings</p>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="example" class="table table-bordered dt-responsive nowrap"
                            style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th class="text-center">Description</th>
                                    <th class="text-center">Price</th>
                                    <th class="text-center">Paid Until</th>
                                    <th class="text-center">Status</th>
                                </tr>
                            </thead>

                            <tbody></tbody>
                            <tfoot class="thead-dark">
                                <tr>
                                    <th colspan="1" class="text-right">Total All Price</th>
                                    <th colspan="3" class="text-left" id="summary"></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection


@section('footer')
@include('shared.footer')
@endsection
