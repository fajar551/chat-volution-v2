<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Chat History PDF</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            color: #343a40;
            margin: 50px 40px;
        }
        .table-1 {
            width: 100%;
            border: 1px solid #343a40;
            line-height: 1.25;
            font-size: 11pt;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .table-1 th, .table-1 td {
            border-collapse: collapse;
            border: 1px solid #343a40;
            padding: 8px;
        }
        .table-1 td.neat-title-border {
            border-right: none;
            width: 20%;
        }
        .table-1 td.neat-colon-border {
            border-left: none;
        }
        .table-chat {
            width: 100%;
            margin-bottom: 30px;
            margin-top: 10px;
        }
        .table-chat th, .table-chat td {
            border-collapse: collapse;
            padding: 8px 0px;
        }
        .chat-content {
            max-width: 40%;
            border: none;
            line-height: 1.25;
            font-size: 11pt;
            border-collapse: collapse;
        }
        .chat-content th, .chat-content td {
            border-collapse: collapse;
            border: none;
            padding: 4px 16px;
        }
        .chat-content td.name {
            font-weight: bold;
            padding-top: 8px;
        }
        .chat-content td.email {
            font-size: 10pt;
        }
        .chat-content td.date {
            font-size: 9pt;
            padding-bottom: 8px;
        }
        .chat-content.right {
            margin-left: auto;
            text-align: right;
            background: rgb(255 162 55 / 30%);
            border-radius: 8px;
        }
        .chat-content.left {
            background: rgb(208 208 208 / 40%);
            border-radius: 8px;
        }
        img {
            margin: 4px 0px;
            height: auto;
            max-height: 200px;
            width: auto;
            max-width: 250px;
        }
    </style>
</head>
<body>
    @php
        switch ($data['channel_id']) {
            case 1:
                $user_name = $data['user_name'] ? $data['user_name'] : $data['user_email'];
                $user_email = $data['user_email'] ? $data['user_email'] : '-';
                $identifier_category = __('User Email');
                $data['channel_name'] = 'Livechat';
                break;

            case 2:
                $user_name = $data['user_name'] ? $data['user_name'] : $data['no_whatsapp'];
                $user_email = $data['no_whatsapp'] ? $data['no_whatsapp'] : '-';
                $identifier_category = __('Phone Number');
                $data['channel_name'] = 'WhatsApp';
                break;

            case 3:
                $user_name = $data['user_name'] ? $data['user_name'] : $data['id_telegram'];
                $user_email = $data['no_telegram'] ? $data['no_telegram'] : '(Telegram ID) '.$data['id_telegram'];
                $identifier_category = __('Telegram Number');
                $data['channel_name'] = 'Telegram';
                break;

            default:
                $user_name = '-';
                $user_email = '-';
                $identifier_category = __('User Email');
                break;
        }
    @endphp

    <table class="table-1">
        <tr>
            <td class="neat-title-border">{{ __('Chat ID') }}</td>
            <td>{{ $data['chat_id'] }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Date') }}</td>
            <td>{{ $data['formatted_date'] }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Channel') }}</td>
            <td>{{ $data['channel_name'] }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('User Name') }}</td>
            <td>{{ $user_name }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ $identifier_category }}</td>
            <td>{{ $user_email }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Department') }}</td>
            <td>{{ $department_name }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Topic') }}</td>
            <td>{{ $topic_name }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Handled by Agent') }}</td>
            <td>
                @php
                    $agents = $handled_by_agents_data;
                    $agents = !empty($agents) ? implode(', ', $agents) : '';
                @endphp
                {{ $agents }}
            </td>
        </tr>
    </table>

    <span style="font-weight: bold; font-size: 14pt;">{{ __('Chat History') }}</span>
    <table class="table-chat">
        @foreach ($data['chat_reply'] as $item)
            @if ($item['agent_id'])
                <tr style="text-align: right;">
                    <td>
                        <table class="chat-content right">
                            <tr><td class="name">{{ $item['agent_name'] }}</td></tr>
                            <tr><td>
                                {{ $item['message'] }}
                                @if ( !empty($item['file_url']) )
                                    {{-- @if ( $item['file_type'] == 'image')
                                        <br>
                                        <img src="http://localhost:8000/storage/assets/images/uploads/agent-client-chat/WOH5hn-yagambar.png">
                                    @endif --}}
                                    <br>
                                    {!! '[<a href="'. $item['file_url'] .'" target="_blank">'. $item['file_url'] .'</a>]' !!}
                                @endif
                            </td></tr>
                            <tr><td class="date">{{ $item['formatted_date'] }}</td></tr>
                        </table>
                    </td>
                </tr>
            @else
                <tr style="text-align: left;">
                    <td>
                        <table class="chat-content left">
                            <tr><td class="name">{{ $user_name }}</td></tr>
                            <tr><td class="email">{{ $user_email }}</td></tr>
                            <tr><td>
                                {{ $item['message'] }}
                                @if ( !empty($item['file_url']) )
                                    {{-- @if ( $item['file_type'] == 'image')
                                        <br>
                                        <img src="{{ $item['file_url'] }}">
                                    @endif --}}
                                    <br>
                                    {!! '[<a href="'. $item['file_url'] .'" target="_blank">'. $item['file_url'] .'</a>]' !!}
                                @endif
                            </td></tr>
                            <tr><td class="date">{{ $item['formatted_date'] }}</td></tr>
                        </table>
                    </td>
                </tr>
            @endif

        @endforeach
    </table>
</body>
</html>