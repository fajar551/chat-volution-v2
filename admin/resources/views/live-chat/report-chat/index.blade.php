@extends('layouts.app-chat.app')

{{-- content --}}
@section('content')
    <div class="container-fluid">
        <div class="row" style="min-height:72vh">
            <div class="col-12 col-md-12 col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <form>
                            <div class="form-group row">
                                <label class="col-sm-2 col-form-label">Filter Date</label>
                                <div class="col-sm-3">
                                    <input type="text" class="form-control pointer" placeholder="Choose Start Date"
                                        id="startDate">
                                </div>
                                <span>
                                    To
                                </span>
                                <div class="col-sm-3">
                                    <input type="text" class="form-control pointer" placeholder="Choose End Date"
                                        id="endDate">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="date" class="col-sm-2 col-form-label">Filter By Agent</label>
                                <div class="col-sm-6">
                                    <select class="form-control selectpicker-search list-agent" id="list-agents"
                                        onchange="refreshList()">
                                        <option value="" disabled>Choose Agent...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="date" class="col-sm-2 col-form-label">Status</label>
                                <div class="col-sm-6">
                                    <select class="form-control" id="status_name" onchange="refreshList()">
                                        <option value="" disabled>Choose Status...</option>
                                        <option value="resolved" selected>Resolved</option>
                                        <option value="canceled_by_user">Canceled By User</option>
                                        <option value="canceled_by_system">Canceled By System</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div class="row mt-3">
                            <div class="col-sm-2 col-md-2 col-lg-2">
                                <div class="media border border-soft-tangerin-500">
                                    <div class="media-body px-3">
                                        <h5 for="date" class="col-form-label">Total Chat</h5>
                                        <p class="total-chat mt-1">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive mt-5">
                            <table id="example" class="table table-bordered dt-responsive nowrap"
                                style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                                <thead class="thead-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Date</th>
                                        <th>Agent</th>
                                        <th>First Chat</th>
                                        <th style="width: 15%;">Action</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade bs-example-modal-sm" id="modal-detail-chat" tabindex="-1" role="dialog"
            aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-sm" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-tags mr-2 text-size-14"></i> Chat History Action
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="col-12 col-md-12 col-lg-12">
                            <div class="Stepwrapper">
                                <ul class="StepProgress">

                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection


{{-- footer --}}
@section('footer')
    @include('shared.footer')
@endsection
