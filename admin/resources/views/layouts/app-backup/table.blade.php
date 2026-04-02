
@extends('layouts.app')

@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">{{$title}}</h4>
                <div class="page-title-right">
                    <a href="add-{{$title}}" type="button" class="btn btn-success waves-effect waves-light font-weight-bold">
                        <i class="ri-add-line align-middle mr-2"></i> Add {{$title}}
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div id="accordion" class="custom-accordion">
                        <div class="card mb-1 shadow-none">
                            <a href="#collapseOne" class="text-dark" data-toggle="collapse" aria-expanded="true" aria-controls="collapseOne">
                                <div class="card-header" id="headingOne">
                                    <h6 class="m-0">
                                        Search & filter
                                        <i class="mdi mdi-minus float-right accor-plus-icon"></i>
                                    </h6>
                                </div>
                            </a>

                            <div id="collapseOne" class="collapse hide" aria-labelledby="headingOne" data-parent="#accordion" style="">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-10">
                                            <div class="form-group">
                                                <input type="text" class="form-control" id="#" placeholder="Search..." required="">
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <button type="button" class="btn btn-primary waves-effect waves-light font-weight-bold">
                                                    <i class="ri-search-line mr-2"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card">
                <div class="card-body">

                    <table id="datatable" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                        <thead>
                            <tr>
                                @foreach ($colums as $col)
                                    <th>{{$col["name"]}}</th>
                                @endforeach
                                <th style="width: 15%;">Action</th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>

                </div>
            </div>
        </div> <!-- end col -->
    </div> <!-- end row -->

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
<script>

    var tk = localStorage.getItem('tk')
    var settings = {
        "url":"{{$api_list}}",
        "method": "{{$api_method ?? 'POST'}}",
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    $(document).ready(function(){

        $.ajax(settings).done(function (response) {
            $('#datatable tbody').empty()
            response.data.forEach(el => {
                $('#datatable tbody').append(`<tr>
                            @foreach ($colums as $col)
                                <td>${el["{{$col['key']}}"]}</td>
                            @endforeach
                            <td>
                                <a href="#" onclick="deleteTopic(${el.id})" class="text-danger"><i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i> Delete</a>
                            </td>
                            </tr>`)
            })


        });
    })


    function deleteTopic(id){
        settings.method =  "DELETE"
        settings.data =  JSON.stringify({id})
        settings.url = "{{$api_delete}}"

        $.ajax(settings).done(function (response) {
            location.reload
        })
    }
</script>
@endsection

