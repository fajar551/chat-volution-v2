@extends('layouts.app-chat.app')
@section('content')

<style>
    .more{
        background:lightblue;
        color:navy;
        font-size:13px;
        padding:3px;
        cursor:pointer;
    }
</style>
<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <div class="page-title-left col-md-6">
                    <h4 class="mb-0" id="headLable"></h4>
                </div>
                <div class="page-title-right float-right mr-3">
                    <a href="/add-package" class="btn btn-success waves-effect waves-light font-weight-bold">
                        <i class="ri-add-line align-middle mr-2"></i> Add Package
                    </a>
                </div>
            </div>
            </div>
        </div>
    <!-- end page title -->
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="listdataTable" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Settings</th>
                                    <th>Status</th>
                                    <th style="width: 15%;">Action</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div> <!-- end col -->
    </div> <!-- end row -->

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
<script>
    /* toast with sweetalert2 */
    const Toast = Swal.mixin({
		toast: true,
		position: "top-end",
		showConfirmButton: false,
		timer: 3500,
		timerProgressBar: false,
		allowEscapeKey: false,
		allowOutsideClick: false,
		showClass: {
			popup: "animated lightSpeedIn",
		},
		hideClass: {
			popup: "animated lightSpeedOut",
		},
		onOpen: (toast) => {
			toast.addEventListener("mouseenter", Swal.stopTimer);
			toast.addEventListener("mouseleave", Swal.resumeTimer);
		},
	});

    $("#headLable").html("Package Chatvolution");

    /* button url */
    var btnAdd = document.getElementById("redirectPage");
    //btnAdd.href = '/add-package';
    var btnEdit = '/edit-package';

    var tk = localStorage.getItem('tk');
    var settings = {
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    var limitText = 100;
    settings.url ="/api/settings/package/list"
    settings.method ="GET"
    settings.data = function (d) {
        return JSON.stringify(d)
    };
    var dataTable = $('#listdataTable').DataTable({
        'ajax': settings,
        "columns": [
            { "data": null,
                "bSortable": false,
                'sClass':"text-center",
                "mRender": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            { "data": "name" },
            { "data": "price", render: $.fn.dataTable.render.number(',', '.', 2, '') },
            { "data": "settings" },
            { "data": null,
                "bSortable": false,
                'sClass':"text-center",
                "mRender": function(data) {
                    if(data.status==1){
                        return 'Active';
                    }else{
                        return 'Not Active';
                    }
                }
            },
            { "data": null,
                "bSortable": false,
                'sClass':"text-center",
                "mRender": function(data) {
                    return '<a title="Edit Quick Reply: '+data.name+'?" href="'+btnEdit+'?id='+data.id+'" class="text-primary ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>';
                }
            }
        ],
        // bFilter: false
    });

</script>
@endsection

