<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenusSeeder extends Seeder
{
    public function run()
    {
        $dt_lm_role1 = [
            [
                'main_menu' => 'Home',
                'link' => '/home',
                'icon' => 'fas fa-home',
                'haveChildren' => false,
                'children' => null,
                'with_params' => false,
            ],
            [
                'main_menu' => 'Manages',
                'link' => 'javascript:void(0);',
                'icon' => "fas fa-user-cog",
                "haveChildren" => true,
                'with_params' => false,
                "children" => [
                    [
                        "menu" => 'Roles',
                        'icon' => false,
                        'link' => '/roles',
                        'haveChildren' => false,
                        'children' => null,
                        'with_params' => false,
                    ],
                    [
                        "menu" => 'Packages',
                        'icon' => false,
                        'link' => '/packages',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Channel',
                        'icon' => false,
                        'link' => '/channels',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Company',
                        'icon' => false,
                        'link' => '/company',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Staff',
                        'icon' => false,
                        'link' => '/staff',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Agents',
                        'icon' => false,
                        'link' => '/agents',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'FAQs',
                        'icon' => false,
                        'link' => '/faq',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                ]
            ],
            [
                'main_menu' => 'Billing',
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-coins",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Transaction Report",
                        "link" => "/transaction-reports",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ]
        ];

        $dt_lm_role2 = [
            [
                'main_menu' => 'Home',
                'link' => '/home',
                'icon' => 'fas fa-home',
                'haveChildren' => false,
                'with_params' => false,
                'children' => null,
            ],
            [
                'main_menu' => 'Manages',
                'link' => 'javascript:void(0);',
                'icon' => "fas fa-user-cog",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => 'Departments',
                        'icon' => false,
                        'link' => '/departments',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Staff',
                        'icon' => false,
                        'link' => '/staff',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Agents',
                        'icon' => false,
                        'link' => '/agents',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Topics',
                        'icon' => false,
                        'link' => '/topics',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Chat Labels',
                        'icon' => false,
                        'link' => '/labels',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'FAQs',
                        'icon' => false,
                        'link' => '/faq',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                ]
            ],
            [
                'main_menu' => 'Integrations',
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-link",
                "haveChildren" => true,
                "children" => [
                    // [
                    //     "menu" => "Whatsapp Chatvolution",
                    //     "link" => "/integrations/whatsapp",
                    //     'icon' => false,
                    //     "haveChildren" => false,
                    //     'with_params' => false,
                    //     "children" => null,
                    // ],
                    // [
                    //     "menu" => "Whatsapp Irsfa",
                    //     "link" => "/integrations/whatsapp-irsfa",
                    //     'icon' => false,
                    //     "haveChildren" => false,
                    //     'with_params' => false,
                    //     "children" => null,
                    // ],
                    // [
                    //     "menu" => "Whatsapp Relabs",
                    //     "link" => "/integrations/whatsapp-relabs",
                    //     'icon' => false,
                    //     "haveChildren" => false,
                    //     'with_params' => false,
                    //     "children" => null,
                    // ],
                    [
                        "menu" => "Whatsapp Qwords",
                        "link" => "/integrations/whatsapp-agent-1",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Whatsapp GFN",
                        "link" => "/integrations/whatsapp-agent-2",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Whatsapp Relabs",
                        "link" => "/integrations/whatsapp-agent-3",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Whatsapp Aksara",
                        "link" => "/integrations/whatsapp-agent-4",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Whatsapp GSSL",
                        "link" => "/integrations/whatsapp-agent-5",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Whatsapp BW",
                        "link" => "/integrations/whatsapp-agent-6",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    // [
                    //     "menu" => "Telegram",
                    //     "link" => "/integrations/telegram",
                    //     'icon' => false,
                    //     "haveChildren" => false,
                    //     'with_params' => false,
                    //     "children" => null,
                    // ],
                    [
                        "menu" => "API Keys",
                        "link" => "/tokens",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Secret Keys",
                        "link" => "/keys",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ],
            [
                'main_menu' => 'Quick Replies',
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-asterisk",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "General Quick Reply",
                        "link" => "/general-quick-replies",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Personal Quick Reply",
                        "link" => "/personal-quick-replies",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ],
            [
                'main_menu' => 'Kirim Email (multi)',
                'link' => '/multi-recipient-mail',
                'icon' => 'fas fa-envelope-open-text',
                'haveChildren' => false,
                'with_params' => false,
                'children' => null,
            ],
            [
                'main_menu' => "Setup",
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-cogs",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Welcome Message",
                        "link" => "/welcome-message",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    // [
                    //     "menu" => "Away Message",
                    //     "link" => "/away-message",
                    //     'icon' => false,
                    //     "haveChildren" => false,
                    //     'with_params' => false,
                    //     "children" => null,
                    // ],
                    [
                        "menu" => "Closing Message",
                        "link" => "/closing-message",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                ]
            ],
            // [
            //     'main_menu' => 'Client Chat',
            //     "link" => "/chat/client",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => true,
            //     'children' => null,
            // ],
            [
                'main_menu' => 'Client Chat',
                // "link" => "http://localhost:3000",
                "link" => "https://v2chat.genio.id/chat-with-client",
                'icon' => "fas fa-comments",
                'haveChildren' => false,
                'with_params' => true,
                'children' => null,
            ],
            // [
            //     'main_menu' => 'Internal Chat',
            //     "link" => "/chat/internal",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => false,
            //     'children' => null,
            // ],
            // [
            //     'main_menu' => 'Report Chat',
            //     "link" => "/chat/report",
            //     'icon' => "fas fa-comments-dollar",
            //     'haveChildren' => false,
            //     'with_params' => false,
            //     'children' => null,
            // ]
        ];

        $dt_lm_role3 = [
            [
                'main_menu' => 'Home',
                'link' => '/home',
                'icon' => 'fas fa-home',
                'haveChildren' => false,
                'with_params' => false,
                'children' => null,
            ],
            [
                'main_menu' => 'Manages',
                'link' => 'javascript:void(0);',
                'icon' => "fas fa-user-cog",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => 'Agents',
                        'icon' => false,
                        'link' => '/agents',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'Chat Labels',
                        'icon' => false,
                        'link' => '/labels',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                    [
                        "menu" => 'FAQs',
                        'icon' => false,
                        'link' => '/faq',
                        'haveChildren' => false,
                        'with_params' => false,
                        'children' => null,
                    ],
                ]
            ],
            [
                'main_menu' => 'Quick Replies',
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-asterisk",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Personal Quick Reply",
                        "link" => "/personal-quick-replies",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ],
            // [
            //     'main_menu' => 'Client Chat',
            //     "link" => "/chat/client",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => true,
            //     'children' => null,
            // ],
            [
                'main_menu' => 'Client Chat',
                "link" => env('BASE_LIVECHAT_V2', 'http://localhost:3000'),
                // "link" => "http://localhost:3000",
                'icon' => "fas fa-comments",
                'with_params' => true,
                'haveChildren' => false,
                'children' => null,
            ],
            // [
            //     'main_menu' => 'Internal Chat',
            //     "link" => "/chat/internal",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => false,
            //     'children' => null,
            // ],
            // [
            //     'main_menu' => 'Report Chat',
            //     "link" => "/chat/report",
            //     'icon' => "fas fa-comments-dollar",
            //     'haveChildren' => false,
            //     'with_params' => false,
            //     'children' => null,
            // ]
        ];

        $dt_lm_role4 = [
            [
                'main_menu' => 'Home',
                'link' => '/home',
                'icon' => 'fas fa-home',
                'haveChildren' => false,
                'with_params' => false,
                'children' => null,
            ],
            [
                'main_menu' => 'Quick Replies',
                'link' => 'javascript:void(0)',
                'icon' => "fas fa-asterisk",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Personal Quick Reply",
                        "link" => "/personal-quick-replies",
                        'icon' => false,
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ],
            [
                'main_menu' => 'Client Chat',
                "link" => env('BASE_LIVECHAT_V2', 'http://localhost:3000'),
                // "link" => "http://localhost:3000",
                'icon' => "fas fa-comments",
                'haveChildren' => false,
                'with_params' => true,
                'children' => null,
            ],
            // [
            //     'main_menu' => 'Client Chat',
            //     "link" => "/chat/client",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => true,
            //     'children' => null,
            // ],
            // [
            //     'main_menu' => 'Internal Chat',
            //     "link" => "/chat/internal",
            //     'icon' => "fas fa-comments",
            //     'haveChildren' => false,
            //     'with_params' => false,
            //     'children' => null,
            // ]
        ];

        $dt_crm = [
            [
                "main_menu" => "Home",
                "link" => "/crm",
                'icon' => 'fas fa-home',
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "Accounts",
                "link" => "/crm-accounts",
                "icon" => "fas fa-city",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "Contacts",
                "link" => "/crm-contacts",
                "icon" => "fas fa-id-card",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "Leads",
                "link" => "/crm-leads",
                "icon" => "fas fa-user-tie",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "Opportunities",
                "link" => "/crm-opportunities",
                "icon" => "fas fa-user-tie",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "Tools",
                "link" => "javascript:void(0)",
                "icon" => "fas fa-tools",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Tasks",
                        "link" => "/crm-tasks",
                        "icon" => "fas fa-tasks",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Calendar",
                        "link" => "/crm-calendar",
                        "icon" => "fas fa-calendar-alt",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Notes",
                        "link" => "/crm-notes",
                        "icon" => "fas fa-sticky-note",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Reports",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-bullhorn",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Files",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-folder-open",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "List Email",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-mail-bulk",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ],
                    [
                        "menu" => "Quotes",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-quote-right",
                        "haveChildren" => false,
                        'with_params' => false,
                        "children" => null,
                    ]
                ]
            ],
            [
                "main_menu" => "Live Chat",
                'link' => '/dashboard',
                "icon" => "fas fa-headset",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                "main_menu" => "SMM",
                'link' => '/social-dashboard',
                "icon" => "fab fa-twitter",
                "haveChildren" => false,
                'with_params' => false,
                "children" => null,
            ],
            [
                'main_menu' => 'Agent Chat',
                "link" => "/agent-chatting",
                'icon' => "fas fa-comments",
                'haveChildren' => false,
                'with_params' => false,
                'children' => null,
            ],
        ];

        $dt_sm = [
            [
                "main_menu" => "Dashboard",
                "link" => "/social-dashboard",
                'icon' => "fas fa-laptop-house",
                "haveChildren" => false,
                "children" => null
            ],
            [
                "main_menu" => "Groups",
                "link" => "javascript:void(0)",
                "icon" => "fas fa-users",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Create Group",
                        "link" => "/social-create-group",
                        "icon" => "fas fa-plus",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Manage Groups",
                        "link" => "/social-groups",
                        "icon" => "fas fa-users-cog",
                        "haveChildren" => false,
                        "children" => null
                    ]
                ]
            ],
            [
                "main_menu" => "Accounts",
                "link" => "javascript:void(0)",
                "icon" => "fas fa-users",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Create Accounts",
                        "link" => "/social-create-account",
                        "icon" => "fas fa-plus",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Manage Accounts",
                        "link" => "/social-accounts",
                        "icon" => "fas fa-users-cog",
                        "haveChildren" => false,
                        "children" => null
                    ]
                ]
            ],
            [
                "main_menu" => "Post",
                "link" => "javascript:void(0);",
                "icon" => "fas fa-comments",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Create Post",
                        "link" => "/social-create-post",
                        "icon" => "fas fa-plus",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Manage Post",
                        "link" => "/social-posts",
                        "icon" => "fas fa-sliders-h",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Calendar",
                        "link" => "/social-calendar",
                        "icon" => "fas fa-calendar-alt",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Bulk Schedule",
                        "link" => "/social-bulk-schedule",
                        "icon" => "fas fa-scroll",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Pending Approval",
                        "link" => "social-pending-approval",
                        "icon" => "fas fa-pause",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    // [
                    //     "menu" => "Drafts",
                    //     "link" => "javascript:void(0)",
                    //     "icon" => "fas fa-file-signature",
                    //     "haveChildren" => false,
                    //     "children" => null
                    // ],
                    [
                        "menu" => "Urls Shortening",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-link",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Curate Content",
                        "link" => "javascript:void(0)",
                        "icon" => "fas fa-funnel-dollar",
                        "haveChildren" => false,
                        "children" => null
                    ],
                ]
            ],
            [
                "main_menu" => "Analytics",
                "link" => "javascript:void(0)",
                "icon" => "fas fa-chart-line",
                "haveChildren" => true,
                "children" => [
                    [
                        "menu" => "Facebook",
                        "link" => "javascript:void(0)",
                        "icon" => "fab fa-facebook-f",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Twitter",
                        "link" => "javascript:void(0)",
                        "icon" => "fab fa-twitter",
                        "haveChildren" => false,
                        "children" => null
                    ],
                    [
                        "menu" => "Instagram",
                        "link" => "javascript:void(0)",
                        "icon" => "fab fa-instagram",
                        "haveChildren" => false,
                        "children" => null
                    ],
                ]
            ],
            [
                "main_menu" => "Live Chat",
                'link' => '/dashboard',
                "icon" => "fas fa-headset",
                "haveChildren" => false,
                "children" => null
            ],
            [
                'main_menu' => 'CRM',
                "link" => "/crm",
                'icon' => "fas fa-people-arrows",
                'haveChildren' => false,
                'children' => null
            ],
            [
                'main_menu' => 'Agent Chat',
                "link" => "/agent-chatting",
                'icon' => "fas fa-comments",
                'haveChildren' => false,
                'children' => null
            ]
        ];

        $menu[0] = [
            'role_id' => 1,
            'list_menu' => json_encode($dt_lm_role1),
            'modul_type' => 'live_chat'
        ];

        $menu[1] = [
            'role_id' => 2,
            'list_menu' => json_encode($dt_lm_role2),
            'modul_type' => 'live_chat'
        ];

        $menu[2] = [
            'role_id' => 3,
            'list_menu' => json_encode($dt_lm_role3),
            'modul_type' => 'live_chat'
        ];

        $menu[3] = [
            'role_id' => 4,
            'list_menu' => json_encode($dt_lm_role4),
            'modul_type' => 'live_chat'
        ];

        $menu[4] = [
            'role_id' => 2,
            'list_menu' => json_encode($dt_crm),
            'modul_type' => 'crm'
        ];

        for ($i = 1; $i <= 4; $i++) {
            $menu[] = [
                'role_id' => $i,
                'list_menu' => json_encode($dt_sm),
                'modul_type' => 'social_pilot'
            ];
        }

        foreach ($menu as  $value) {
            Menu::create($value);
        }
    }
}
