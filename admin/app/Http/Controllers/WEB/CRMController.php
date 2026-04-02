<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CRMController extends Controller
{
    /* Accounts */
    public function accounts()
    {
        $data = [
            'title' => 'Accounts',
            'menu' => 'account',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/accounts.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('crm.accounts.accounts', $data);
    }

    public function detailAccount(Request $request)
    {
        $data = [
            'title' => 'Accounts',
            'menu' => 'detail',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/chartjs-v3x/dist/chart.min.js',
                '/js/accounts.js',
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
            ]
        ];
        return view('crm.accounts.detail-account', $data);
    }

    /* Contacts */
    public function contacts()
    {
        $data = [
            'title' => 'Contacts',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('crm.contact.contacts', $data);
    }

    /* Leads */
    public function leads()
    {
        $data = [
            'title' => 'Contacts',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('crm.leads.leads', $data);
    }

    /* Opportunity */
    public function opportunities()
    {
        $data = [
            'title' => 'Opportunities',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/tempusdominus-bootstrap-4/build/js/tempusdominus-bootstrap-4.min.js',
                '/js/opportunities.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css'
            ]
        ];
        return view('crm.opportunity.opportunities', $data);
    }

    /* Tasks */
    public function tasks()
    {
        $data = [
            'title' => 'Tasks',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/tempusdominus-bootstrap-4/build/js/tempusdominus-bootstrap-4.min.js',
                '/js/tasks.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/tempusdominus-bootstrap-4/build/css/tempusdominus-bootstrap-4.min.css'
            ]
        ];
        return view('crm.tasks.tasks', $data);
    }

    /* Calendar */
    public function calendar()
    {
        $data = [
            'title' => 'Calendar',
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/fullcalendar-5.10.1/lib/main.min.css'
            ],
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/fullcalendar-5.10.1/lib/main.min.js'
            ]
        ];
        return view('crm.calendar.calendar', $data);
    }

    /* Notes */
    public function notes()
    {
        $data = [
            'title' => 'Notes',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/tinymce/tinymce.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('crm.notes.notes', $data);
    }
}
