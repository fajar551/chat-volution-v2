@extends('layouts.crm.app-crm')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Contacts</h4>
                <div class="page-title-right">
                    <a href="javascript:void(0)" onclick="formAdd()" class="btn btn-success waves-effect waves-light font-weight-bold">
                        <i class="ri-add-line align-middle mr-2"></i> Add Contact
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="example" class="table table-bordered dt-responsive nowrap" style="border-collapse: collapse; border-spacing: 0; width: 100%;">
                            <thead class="thead-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Account Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
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

    @include('crm.contact.add-contact')
    @include('crm.contact.edit-contact')

</div> <!-- container-fluid -->
@endsection


@section('footer')
@include('shared.footer')
<script>
    const formEdit = (id) => {
        $("#editContact").modal('show');
    }

    const closeFormEdit = () => {
        $("#editContact").modal('hide');
    }

    const formAdd = () =>{
        $('#addContact').modal('show');
    }

    const closeFormAdd = () =>{
        $('#addContact').modal('hide');
    }
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

    var tk = localStorage.getItem('tk')
    var settings = {
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    settings.method =  "GET"
    settings.url = "/api/dummy/contacts"
    var dataTable = $('#example').DataTable({
        'ajax': settings,
        "columns": [
            {
                "data": "name",
            },
            {
                "data": "account_name",
            },
            {
                "data": "phone",
            },
            {
                "data": "email",
            },
            { "data": null,
                "bSortable": false,
                'sClass':"text-center",
                "mRender": function(data) {
                    return '<a class="text-danger text-center mr-3" title="Delete Contact: '+data.name+'?" href="#" onclick="deleteLabel('+data.id+')"/' + '>' + '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' + '</a>'+
                    '<a title="Edit Contact: '+data.name+'?" href="javascript:void(0)" onclick="formEdit('+data.id+')" class="text-primary ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>';
                }
            }
        ],
        // bFilter: false
    });

    function deleteLabel(id){
        $(".page-loader").removeAttr("style")
        settings.method =  "DELETE"
        settings.data =  JSON.stringify({id})
        settings.url = "/api/chat/label"
        $.ajax(settings).done(function (response) {
            $(".page-loader").attr("style","display:none")
            Toast.fire({
                icon: "success",
                title: 'Delete label successfuly!',
            });
            dataTable.ajax.reload();
        })
    }
</script>
@endsection

