@extends('layouts.crm.app-crm')

@section('content')

<div class="container-fluid">

    <!-- start page title -->
    <div class="row">
        <div class="col-12">
            <div class="page-title-box d-flex align-items-center justify-content-between">
                <h4 class="mb-0">Leads</h4>
                <div class="page-title-right">
                    <a href="javascript:void(0)" onclick="formAdd()" class="btn btn-success waves-effect waves-light font-weight-bold">
                        <i class="ri-add-line align-middle mr-2"></i> Add Lead
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
                                    <th>Title</th>
                                    <th>Company</th>
                                    <th>Phone</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th>Lead Status</th>
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
    @include('crm.leads.add-lead')
    @include('crm.leads.edit-lead')
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

    settings.method =  "GET"
    settings.url = "/api/dummy/leads"
    var dataTable = $('#example').DataTable({
        'ajax': settings,
        "columns": [
            {
                "data": "name",
            },
            {
                "data": "title",
            },
            {
                "data": "company",
            },
            {
                "data": "phone",
            },
            {
                "data": "mobile"
            },
            {
                "data": "email"
            },
            {
                "data": "lead_status"
            },
            { "data": null,
                "bSortable": false,
                'sClass':"text-center",
                "mRender": function(data) {
                    return '<a class="text-danger text-center mr-3" title="Delete Lead: '+data.name+'?" href="#" onclick="deleteLabel('+data.id+')"/' + '>' + '<i class="ri-delete-bin-7-line font-size-18" style="position: relative;top: 4px;"></i>' + '</a>'+
                    '<a title="Edit Lead: '+data.name+'?" href="javascript:void(0)" onclick="formEdit('+data.id+')" class="text-primary ml-1"><i class="ri-edit-line font-size-18" style="position:relative; top: 4px;"></i></a>';
                }
            }
        ],
        // bFilter: false
    });

    const formEdit = (id) => {
        $("#editLead").modal('show');
    }

    const closeFormEdit = () => {
        $("#editLead").modal('hide');
    }

    const formAdd = () =>{
        $('#addLead').modal('show');
    }

    const closeForm = () =>{
        $('#addLead').modal('hide');
    }

    const dataLead = [
        'advertisement',
        'customer event',
        'employee referral',
        'external referral',
        'google adwords',
        'partner',
        'purchased list',
        'trade show',
        'webinar',
        'website',
        'other'
    ];
    $('.optionLeads').append(`
        <option value="" selected disabled>Choose Lead Source</option>
    `)

    dataLead.forEach(el => {
        $('.optionLeads').append(`
            <option value="${capitalize(el)}">${capitalize(el)}</option>
        `)
    })

    const dataSectors = [
        "Accounting",
        "Airlines/Aviation",
        "Alternative Dispute Resolution",
        "Alternative Medicine",
        "Animation",
        "Apparel & Fashion",
        "Architecture & Planning",
        "Arts & Crafts",
        "Automotive",
        "Aviation & Aerospace",
        "Banking",
        "Biotechnology",
        "Broadcast Media",
        "Building Materials",
        "Business Supplies & Equipment",
        "Capital Markets",
        "Chemicals",
        "Civic & Social Organization",
        "Civil Engineering",
        "Commercial Real Estate",
        "Computer & Network Security",
        "Computer Games",
        "Computer Hardware",
        "Computer Networking",
        "Computer Software",
        "Construction",
        "Consumer Electronics",
        "Consumer Goods",
        "Consumer Services",
        "Cosmetics",
        "Dairy",
        "Defense & Space",
        "Design",
        "Education Management",
        "E-learning",
        "Electrical & Electronic Manufacturing",
        "Entertainment",
        "Environmental Services",
        "Events Services",
        "Executive Office",
        "Facilities Services",
        "Farming",
        "Financial Services",
        "Fine Art",
        "Fishery",
        "Food & Beverages",
        "Food Production",
        "Fundraising",
        "Furniture",
        "Gambling & Casinos",
        "Glass, Ceramics & Concrete",
        "Government Administration",
        "Government Relations",
        "Graphic Design",
        "Health, Wellness & Fitness",
        "Higher Education",
        "Hospital & Health Care",
        "Hospitality",
        "Human Resources",
        "Import & Export",
        "Individual & Family Services",
        "Industrial Automation",
        "Information Services",
        "Information Technology & Services",
        "Insurance",
        "International Affairs",
        "International Trade & Development",
        "Internet",
        "Investment Banking/Venture",
        "Investment Management",
        "Judiciary",
        "Law Enforcement",
        "Law Practice",
        "Legal Services",
        "Legislative Office",
        "Leisure & Travel",
        "Libraries",
        "Logistics & Supply Chain",
        "Luxury Goods & Jewelry",
        "Machinery",
        "Management Consulting",
        "Maritime",
        "Marketing & Advertising",
        "Market Research",
        "Mechanical or Industrial Engineering",
        "Media Production",
        "Medical Device",
        "Medical Practice",
        "Mental Health Care",
        "Military",
        "Mining & Metals",
        "Motion Pictures & Film",
        "Museums & Institutions",
        "Music",
        "Nanotechnology",
        "Newspapers",
        "Nonprofit Organization Management",
        "Oil & Energy",
        "Online Publishing",
        "Outsourcing/Offshoring",
        "Package/Freight Delivery",
        "Packaging & Containers",
        "Paper & Forest Products",
        "Performing Arts",
        "Pharmaceuticals",
        "Philanthropy",
        "Photography",
        "Plastics",
        "Political Organization",
        "Primary/Secondary",
        "Printing",
        "Professional Training",
        "Program Development",
        "Public Policy",
        "Public Relations",
        "Public Safety",
        "Publishing",
        "Railroad Manufacture",
        "Ranching",
        "Real Estate",
        "Recreational",
        "Facilities & Services",
        "Religious Institutions",
        "Renewables & Environment",
        "Research",
        "Restaurants",
        "Retail",
        "Security & Investigations",
        "Semiconductors",
        "Shipbuilding",
        "Sporting Goods",
        "Sports",
        "Staffing & Recruiting",
        "Supermarkets",
        "Telecommunications",
        "Textiles",
        "Think Tanks",
        "Tobacco",
        "Translation & Localization",
        "Transportation/Trucking/Railroad",
        "Utilities",
        "Venture Capital",
        "Veterinary",
        "Warehousing",
        "Wholesale",
        "Wine & Spirits",
        "Wireless",
        "Writing & Editing"
    ]

    $('.optionSectors').append(`
        <option value="" selected disabled>Choose Type Company</option>
    `)

    dataSectors.forEach(el => {
        $('.optionSectors').append(`
            <option value="${capitalize(el)}">${capitalize(el)}</option>
        `)
    })

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

