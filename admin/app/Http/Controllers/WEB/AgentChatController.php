<?php

namespace App\Http\Controllers\WEB;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AgentChatController extends Controller
{
    public function Chat()
    {
        $data = [
            'title' => 'Internal Chat',
            'js' => [
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/moment/moment.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/assets/libs/lodash/lodash.min.js',
                // 'assets/libs/emoji/emoji-button/dist/index.js',
                '/assets/libs/linkify/linkifyjs/dist/linkify.min.js',
                '/assets/libs/linkify/linkify-html/dist/linkify-html.min.js',
                '/assets/libs/linkify/linkify-element/dist/linkify-element.js',
                '/js/agent-chat/agent-socket.js?' . rand(),
                '/js/agent-chat/agent-chat.js?' . rand(),
                '/js/agent-chat/agent-chat-dynamic.js?' . rand()
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
                '/assets/css/app/agent-chat/agent-style.css'
            ]
        ];
        return view('chat.agent-chat', $data);
    }

    public function ChatTesting()
    {
        $data = [
            'title' => 'Internal Chat Testing',
            'js' => [
                '/assets/libs/bootstrap-select/dist/js/bootstrap-select.min.js',
                '/assets/libs/sweetalert2/sweetalert2.min.js',
                '/assets/libs/moment/moment.js',
                '/assets/libs/@fancyapps/ui/dist/fancybox.umd.js',
                '/js/agent-chat/agent-chatv2.js?' . rand(),
            ],
            'css' => [
                '/assets/libs/sweetalert2/sweetalert2.min.css',
                '/assets/libs/animate/animate.min.css',
                '/assets/libs/@fancyapps/ui/dist/fancybox.css',
                '/assets/libs/bootstrap-select/dist/css/bootstrap-select.min.css',
                '/assets/css/app/agent-chat/agent-style2.css'
            ]
        ];
        return view('chat.agent-chat-v2', $data);
    }
}
