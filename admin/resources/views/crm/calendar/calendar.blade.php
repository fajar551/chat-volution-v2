@extends('layouts.crm.app-crm')
@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Calendar</h4>
            </div>
        </div>
    </div>
    <!-- end page title -->

    <div class="row">
        <div class="col-12 col-md-12 col-lg-12">
            <div class="card">
                <div class="card-body">
                    <div id="calendar"></div>
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

    var tk = localStorage.getItem('tk')
    var settings = {
        "headers": {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "Authorization": "Bearer " + tk
        },
    };

    settings.method = "GET"
    settings.url = "/api/dummy/tasks"
    var dataTable = $('#example').DataTable({
        'ajax': settings,
        "columns": [{
                "data": "task_name",
            },
            {
                "data": "contact_name",
            },
            {
                "data": "due_date",
            },
            {
                "data": null,
                "bSortable": false,
                'sClass': "text-center",
                "mRender": function (data) {
                    return '<a class="text-danger text-center mr-3" title="Delete Label: ' + data.name +
                        '?" href="#" onclick="deleteLabel(' + data.id + ')"/' + '>' +
                        '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' +
                        '</a>' +
                        '<a title="Edit Label: ' + data.name + '?" href="/edit-label?id=' + data.id +
                        '" class="text-primary ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>';
                }
            }
        ],
        // bFilter: false
    });


    /* define full calendar */
    document.addEventListener('DOMContentLoaded', function () {
        var calendarEl = document.getElementById('calendar');

        var calendar = new FullCalendar.Calendar(calendarEl, {
            selectable: true,
            timeZone: 'Asia/Jakarta',
            themeSystem: 'bootstrap',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            now: new Date(),
            editable: true,
            dateClick: function (info) {
                var selectDate = prompt('You select date' + JSON.stringify(info));
            },
            select: function (info) {
                alert('selected ' + info.startStr + ' to ' + info.endStr);
            },
            weekNumbers: true,
            dayMaxEvents: true,
            events: 'https://fullcalendar.io/demo-events.json'
        });

        calendar.render();
    });

</script>
@endsection
