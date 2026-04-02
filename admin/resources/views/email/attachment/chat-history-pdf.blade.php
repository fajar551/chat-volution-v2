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
        switch ($data[0]['id_channel']) {
            case 1:
                $user_name = $data[0]['user_name'] ? $data[0]['user_name'] : $data[0]['user_email'];
                $user_email = $data[0]['user_email'] ? $data[0]['user_email'] : '-';
                $identifier_category = __('User Email');
                break;

            case 2:
                $user_name = $data[0]['user_name'] ? $data[0]['user_name'] : $data[0]['no_whatsapp'];
                $user_email = $data[0]['no_whatsapp'] ? $data[0]['no_whatsapp'] : '-';
                $identifier_category = __('Phone Number');
                break;

            case 3:
                $user_name = $data[0]['user_name'] ? $data[0]['user_name'] : $data[0]['id_telegram'];
                $user_email = $data[0]['id_telegram'] ? $data[0]['id_telegram'] : '-';
                $identifier_category = __('Telegram Number');
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
            <td>{{ $data[0]['chat_id'] }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Date') }}</td>
            <td>{{ $data[0]['formatted_date'] }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Channel') }}</td>
            <td>{{ $data[0]['channel_name'] }}</td>
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
            <td>{{ isset($data[0]['department_name']) ? $data[0]['department_name'] : '-' }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Topic') }}</td>
            <td>{{ isset($data[0]['topic_name']) ? $data[0]['topic_name'] : '-' }}</td>
        </tr>
        <tr>
            <td class="neat-title-border">{{ __('Handled by Agent') }}</td>
            <td>
                @php
                    $agents = $data[0]['handled_by_agents'];
                    $agents = implode(', ', $agents);
                @endphp
                {{ $agents }}
            </td>
        </tr>
    </table>

    <span style="font-weight: bold; font-size: 14pt;">{{ __('Chat History') }}</span>
    <table class="table-chat">
        @foreach ($data as $item)
            @if ($item['id_agent'])
                <tr style="text-align: right;">
                    <td>
                        <table class="chat-content right">
                            <tr><td class="name">{{ $item['agent_name'] }}</td></tr>
                            <tr><td>
                                {{ $item['message'] }}
                                @if ( !empty($item['file_url']) )
                                    @if ( $item['file_type'] == 'image')
                                        <br>
                                        <img src="{{ $item['file_url'] }}">
                                    @endif
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
                                    @if ( $item['file_type'] == 'image')
                                        <br>
                                        <img src="{{ $item['file_url'] }}">
                                    @endif
                                    <br>
                                    {!! '[<a href="'. $item['file_url'] .'" target="_blank">'. $item['file_url'] .'</a>]' !!}
                                @endif
                            </td></tr>
                            <tr><td class="date">{{ $item['formatted_date'] }}</td></tr>
                        </table>
                    </td>
                </tr>
            @endif


                <!-- dummy data -->
                <!-- <tr style="text-align: left;">
                    <td>
                        <table class="chat-content left">
                            <tr><td class="name">Client Name:</td></tr>
                            <tr><td>
                                This is my message
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa porro dolore accusamus quaerat nam vitae, architecto natus delectus ipsam corrupti, quidem asperiores qui dicta obcaecati nisi consequatur soluta doloremque consectetur?
                            </td></tr>
                            <tr><td class="date">23 Mei 2022 15:44</td></tr>
                        </table>
                    </td>
                </tr>
                <tr style="text-align: right;">
                    <td>
                        <table class="chat-content right">
                            <tr><td class="name">Agent Name:</td></tr>
                            <tr><td>
                                This is my message
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa porro dolore accusamus quaerat nam vitae, architecto natus delectus ipsam corrupti, quidem asperiores qui dicta obcaecati nisi consequatur soluta doloremque consectetur?
                            </td></tr>
                            <tr><td class="date">23 Mei 2022 15:44</td></tr>
                        </table>
                    </td>
                </tr> -->
        @endforeach
    </table>
</body>
</html>