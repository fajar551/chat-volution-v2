@extends('layouts.app-chat.app')
@section('content')
<input type="hidden" id="id" value="{{ $id }}">

<div class="container-fluid">
    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Edit topic</h4>
                <div class="page-title-right">
                    <ol class="breadcrumb m-0">
                        <li class="breadcrumb-item"><a href="/topics"><i class="ri-arrow-left-line mr-2"></i> Back to topics</a></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->
    <div class="row justify-content-center">
        <div class="col-xl-12 col-sm-12">
            <div class="card pricing-box">
                <form id="btn-save" data-parsley-validate="">
                    <div class="card-body p-4">
                        <div class="form-group">
                            <label for="name">Name<span class="text-danger">*</span></label>
                            <input type="text" id="name" name="name" data-parsley-minlength="2" data-parsley-required class="form-control" placeholder="Type Name">
                        </div>
                        <div class="form-group">
                            <label for="description">Description<span class="text-danger">*</span></label>
                            <input type="text" id="description" data-parsley-minlength="10" data-parsley-required name="description" class="form-control" placeholder="Type Description">
                        </div>
                        <div class="form-group float-right">
                            <button type="submit" class="btn btn-tangerin waves-effect waves-light">Save changes</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end row -->

    {{-- <div class="row justify-content-center">
        <div class="col-xs-12 col-sm-12">
            <div class="card">
                <h3 class="font-size-16 mt-3 text-center">List Agent Topic</h3>
                <div class="card-body">
                    <form id="appForm">
                        <div>
                            <button type="button" class="btn btn-danger mb-2 float-left" onclick="removeArr()" title="Remove Agent">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button type="button" data-toggle="modal" class="btn btn-primary mb-2 text-right text-white float-right" id="openForm" data-target="#formAgent" title="Assign agent">
                                <i class="fas fa-plus"></i> Assign agent
                            </button>
                        </div>
                        <table id="datatable" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead>
                                <tr class="bg-dark text-white">
                                    <th style="width: 5%">
                                        <input type="checkbox" class="pointer" id="checkAll" value="false" onclick="checkActiveBoxAll()">
                                    </th>
                                    <th>Agent Name</th>
                                </tr>
                            </thead>

                            <tbody></tbody>
                        </table>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="formAgent" tabindex="-1" role="dialog" aria-labelledby="formAgent" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="formAgent"><i class="fas fa-plus mr-2"></i> Assign Agent</h5>
                    <button type="button" onclick="closeForm()" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-12 col-md-12 col-lg-12">
                            <div class="form-group">
                                <select class="form-control select2-multiple optionSelector" id="agentSelected" style="width: 100%;height: 50px;line-height: 50px;">
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="col-12 col-md-12 col-lg-12 text-right">
                        <div class="form-group">
                            <button type="button" onclick="closeForm()" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" onclick="saveAgentToSelected()" class="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> --}}
</div> <!-- container-fluid -->

@endsection

@section('footer')
@include('shared.footer')
@endsection