<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LiveChatController extends Controller
{
    public function dashboard(Request $request)
    {
        $data = [
            'title' => 'Chat Client',
            'middleware' => 'auth',
            'js' => [
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/assets/libs/lodash/lodash.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/linkify/linkifyjs/dist/linkify.min.js',
                '/assets/libs/linkify/linkify-html/dist/linkify-html.min.js',
                '/assets/libs/linkify/linkify-element/dist/linkify-element.js',
                '/js/live-chat/dashboard/dashboard-socket.js?' . rand(),
                '/js/live-chat/dashboard/dashboard.js?' . rand(),
            ],
            'css' => [
                '/assets/css/app/live-chat/dashboard/style.css',
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/card-user.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.dashboard.dashboard', $data);
    }

    public function welcome(Request $request)
    {
        $data = [
            'middleware' => 'auth',
            'js' => [
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/dashboard/welcome.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
            ]
        ];
        return view('live-chat.dashboard.welcome', $data);
    }

    public function reportChat()
    {
        $data = [
            'title' => 'Report Chat',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/lodash/lodash.min.js',
                '/assets/libs/datepicker/dist/datepicker.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/report-chat/report-chat.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/datepicker/dist/datepicker.min.css',
                '/assets/css/app/live-chat/report-chat/style.css',
                '/assets/libs/animate/animate.min.css',
            ]
        ];
        return view('live-chat.report-chat.index', $data);
    }

    public function reportChatDetail(Request $request)
    {
        $data = [
            'chat_id' => $request->chat_id,
            'title' => 'Detail Report Chat',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/assets/libs/lodash/lodash.min.js',
                '/js/live-chat/report-chat/detail-report-chat.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/datepicker/dist/datepicker.min.css',
                '/assets/css/app/live-chat/dashboard/style.css',
                '/assets/css/card-user.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css',
            ]
        ];
        return view('live-chat.report-chat.detail', $data);
    }

    public function roleList()
    {
        $data = [
            'title' => 'Roles',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/roles/roles.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
            ]
        ];
        return view('live-chat.role.roles', $data);
    }

    public function roleAdd()
    {
        $data = [
            'title' => 'Add Role',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/roles/add-role.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
            ]
        ];
        return view('live-chat.role.add-role', $data);
    }

    /* department route */
    public function departmentList()
    {
        $data = [
            'title' => 'Departments',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/departments/departments.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.departments.departments', $data);
    }

    public function departmentAdd()
    {
        $data = [
            'title' => 'Add Department',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/departments/add-department.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];

        return view('live-chat.departments.add-department', $data);
    }

    public function departmentEdit(Request $request)
    {
        $data = [
            'title' => 'Departments',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/departments/edit-department.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.departments.edit-department', $data);
    }

    /* topic */
    public function listTopics()
    {
        $data = [
            'title' => 'Topics',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/topic/index.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.topics.topic', $data);
    }

    public function addTopics()
    {
        $data = [
            'title' => 'Add Topic',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/topic/add.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.topics.add-topic', $data);
    }

    public function editTopic(Request $request)
    {
        $data = [
            'title' => 'Edit Topic',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/topic/edit.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.topics.edit-topic', $data);
    }

    /* channel */
    public function listChannel()
    {
        $data = [
            'title' => 'Channels',
            'label' => 'channel',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/channel/channels.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.channel.channels', $data);
    }

    public function addChannel()
    {
        $data = [
            'title' => 'Add Channel',
            'label' => 'add channel',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/channel/add-channel.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.channel.add-channel', $data);
    }

    public function editChannel(Request $request)
    {
        $data = [
            'title' => 'Edit Channel',
            'label' => 'edit channel',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/channel/edit-channel.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.channel.edit-channel', $data);
    }

    /* company */
    public function listCompany()
    {
        $data = [
            'title' => 'Company',
            'label' => 'company',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/users/users.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.users.users', $data);
    }

    public function addCompany()
    {
        $data = [
            'title' => 'Add Company',
            'label' => 'add company',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/add-user.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.users.add-users', $data);
    }

    /* staff */
    public function listStaff()
    {
        $data = [
            'title' => 'Staff',
            'label' => 'staff',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/users/users.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        // return view('live-chat.agent-staff.staff', $data);
        return view('live-chat.users.users', $data);
    }

    public function addStaff()
    {
        $data = [
            'title' => 'Add Staff',
            'label' => 'add staff',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/add-user.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.users.add-users', $data);
    }

    public function editStaff(Request $request)
    {
        $data = [
            'title' => 'Edit Staff',
            'label' => 'edit staff',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/edit-user.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.users.edit-users', $data);
    }

    /* agent */
    public function listAgents()
    {
        $data = [
            'title' => 'Agents',
            'label' => 'agent',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/users/users.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/css/app.css'
            ]
        ];
        return view('live-chat.users.users', $data);
    }

    public function addAgent()
    {
        $data = [
            'title' => 'Add Agent',
            'label' => 'add agent',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/add-user.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.users.add-users', $data);
    }

    public function editAgent(Request $request)
    {
        $data = [
            'title' => 'Edit Agent',
            'label' => 'edit agent',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/edit-user.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.users.edit-users', $data);
    }

    public function detailAgent(Request $request)
    {
        $data = [
            'title' => 'Detail Agent',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.agent-staff.detail-agent', $data);
    }

    /* labels */
    public function listLabels()
    {
        $data = [
            'title' => 'Labels',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                "/js/live-chat/labels/index.js?" . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.labels.labels', $data);
    }

    public function addLabel()
    {
        $data = [
            'title' => 'Add Label',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/labels/add.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.labels.add-label', $data);
    }

    public function editLabel(Request $request)
    {
        $data = [
            'title' => 'Edit Label',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/labels/edit.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.labels.edit-label', $data);
    }

    /* FAQs */
    public function listFaq()
    {
        $data = [
            'title' => 'FAQs',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                "/js/live-chat/faqs/index.js?" . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.faqs.faq', $data);
    }

    public function addFaq()
    {
        $data = [
            'title' => 'Add FAQ',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/faqs/add.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.faqs.add-faq', $data);
    }

    public function editFaq(Request $request)
    {
        $data = [
            'title' => 'Edit FAQ',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/faqs/edit.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.faqs.edit-faq', $data);
    }

    /* billings */
    public function listBilling()
    {
        $data = [
            'title' => 'Billings',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/billings/billing.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.billings.billings', $data);
    }


    /* quick replys */
    public function general()
    {
        $data = [
            'title' => 'General Quick Replies',
            'type' => 1,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/index.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.quickReply', $data);
    }

    public function personal()
    {
        $data = [
            'title' => 'Personal Quick Replies',
            'type' => 2,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/index.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.quickReply', $data);
    }

    public function addQuickGeneral()
    {
        $data = [
            'title' => 'Add General Quick Reply',
            'type' => 1,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/add.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.add-quickReply', $data);
    }

    public function addQuickPersonal()
    {
        $data = [
            'title' => 'Add Personal Quick Reply',
            'type' => 2,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/add.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.add-quickReply', $data);
    }

    public function editQuickGeneral(Request $request)
    {
        $data = [
            'title' => 'Edit General Quick Reply',
            'type' => 1,
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/edit.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.edit-quickReply', $data);
    }

    public function editQuickPersonal(Request $request)
    {
        $data = [
            'title' => 'Edit Personal Quick Reply',
            'type' => 2,
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                "/js/live-chat/quick-reply/edit.js"
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.quick-reply.edit-quickReply', $data);
    }

    /* settings messages and inbox*/
    public function welcomeMessage()
    {
        $data = [
            'title' => 'Welcome Message',
            'meta' => 'welcome_message',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/setting/setting-messages.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.settings.setting-messages', $data);
    }

    public function awayMessage()
    {
        $data =  [
            'title' => 'Away Message',
            'meta' => 'away_message',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/setting/setting-messages.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.settings.setting-messages', $data);
    }

    public function closingMessage()
    {
        $data = [
            'title' => 'Closing Message',
            'meta' => 'closing_message',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/setting/setting-messages.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.settings.setting-messages', $data);
    }

    public function inboxSetting()
    {
        $data = [
            'title' => 'Inbox Setting',
            'meta' => 'inbox_agent',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.settings.inbox-setting', $data);
    }

    public function emailTest()
    {
        return view('email.verification');
    }


    public function scan()
    {
        return view('example.scan');
    }

    public function profile()
    {
        $data = [
            'title' => 'Profile',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/profile/profile.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/profile/profile.css'
            ]
        ];
        return view('live-chat.profile.profile', $data);
    }

    public function profileUpdate()
    {
        $data = [
            'title' => 'Update Profile',
            'js' => [
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/profile/update-profile.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.profile.profile-update', $data);
    }

    public function profileChangePassword()
    {
        $data = [
            'title' => 'Change Password',
            'js' => [
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/profile/change-password.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.profile.change-password', $data);
    }

    /* integrations */
    public function tokens()
    {
        $data = [
            'title' => 'Api Keys',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/psl/dist/psl.min.js',
                '/assets/libs/lodash/lodash.min.js',
                '/js/oauth.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
                '/css/text-editor.css'
            ],
        ];
        return view('live-chat.auth.oauth-lists', $data);
    }

    public function integrationTelegram()
    {
        $data = [
            'title' => 'Integration Telegram',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/js/live-chat/integrations/integration-telegram.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css'
            ],
        ];
        return view('live-chat.integrations.telegram', $data);
    }

    public function integrationWhatsapp()
    {
        $data = [
            'title' => 'Integration Whatsapp Chatvolution',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/assets/libs/qrious/dist/qrious.js',

                '/js/live-chat/integrations/integration-whatsapp.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
            ],
        ];
        return view('live-chat.integrations.whatsapp', $data);
    }

    public function integrationWhatsappIrsfa()
    {
        $data = [
            'title' => 'Integration Whatsapp Irsfa',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/assets/libs/qrious/dist/qrious.js',

                '/js/live-chat/integrations/integration-whatsapp-irsfa.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
            ],
        ];
        return view('live-chat.integrations.whatsapp-irsfa', $data);
    }

    public function integrationWhatsappRelabs()
    {
        $data = [
            'title' => 'Integration Whatsapp Relabs',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/intl-tel-input/build/js/intlTelInput.min.js',
                '/assets/libs/qrious/dist/qrious.js',

                '/js/live-chat/integrations/integration-whatsapp-relabs.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
                '/assets/libs/intl-tel-input/build/css/intlTelInput.min.css',
            ],
        ];
        return view('live-chat.integrations.whatsapp-relabs', $data);
    }

    public function integrationWhatsappAgent1()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-1', $data);
    }

    public function integrationWhatsappAgent2()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2 - Agent 2',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-2', $data);
    }

    public function integrationWhatsappAgent3()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2 - Agent 3',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-3', $data);
    }

    public function integrationWhatsappAgent4()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2 - Agent 4',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-4', $data);
    }

    public function integrationWhatsappAgent5()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2 - Agent 5',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-5', $data);
    }

    public function integrationWhatsappAgent6()
    {
        $data = [
            'title' => 'Integration Whatsapp Socket V2 - Agent 6',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ],
        ];
        return view('live-chat.integrations.whatsapp-agent-6', $data);
    }

    public function integrationWHMCS()
    {
        $data = [
            'title' => 'Integration WHMCS',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/js/live-chat/integrations/integration-whmcs.js',
                '/js/dynamic-layout/integration-menu-dynamic.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/css/app/live-chat/integrations/integrations.css',
            ],
        ];
        return view('live-chat.integrations.whmcs', $data);
    }

    public function integrationKeys()
    {
        $data = [
            'title' => 'Secret Keys',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/js/live-chat/integrations/secret-key/keys.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/css/app.css'
            ],
        ];
        return view('live-chat.integrations.secret-keys.secret-keys', $data);
    }

    public function editKeys(Request $request)
    {
        $data = [
            'title' => 'Edit Keys',
            'label' => 'edit keys',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/integrations/secret-key/edit-keys.js',
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.integrations.secret-keys.edit-keys', $data);
    }

    public function addKeys()
    {
        $data = [
            'title' => 'Add Keys',
            'label' => 'add keys',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/integrations/secret-key/add-keys.js',
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css'
            ]
        ];
        return view('live-chat.integrations.secret-keys.add-keys', $data);
    }

    public function packagesList()
    {
        $data = [
            'title' => 'Packages',
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                //'/js/live-chat/packages/packages.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
            ]
        ];
        return view('live-chat.packages.packages', $data);
    }

    public function editPackages(Request $request)
    {
        $data = [
            'title' => 'Edit Package',
            'label' => 'edit package',
            'id' => $request->id,
            'js' => [
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/parsleyjs/parsley.min.js',
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/js/live-chat/users/edit-user.js'
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css'
            ]
        ];
        return view('live-chat.packages.edit-packages', $data);
    }
}
