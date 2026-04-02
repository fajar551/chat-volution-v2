<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Defined Activity Log Name and Description
    |--------------------------------------------------------------------------
    */

    'error' => 'An error occured',

    // auth
    'register' => 'User register',
    'login' => 'User login',
    'logout' => 'User has logged out',
    'resend_verification_email' => 'User requested for resend verification email',
    'forgot_password' => 'User requested for reset password',
    'reset_password' => 'User has reset password',
    'user_verify' => 'User has verified account',

    //chat and internal chat
    'new_chat' => 'User create new chat',
    'reply_chat' => 'User has replied chat',
    'send_chat' => 'User has sent chat',
    'send_chat_group' => 'User has sent chat to group',
    'update_chat_status' => 'User has updated chat status',
    'upload_file' => 'User uploaded a file',

    // internal chat
    'delete_conversation' => 'User has deleted conversation',

    // group
    'create_group' => 'User created a group',
    'delete_group' => 'User deleted a group',
    'add_agent_group' => 'User added agent to group',
    'remove_agent_group' => 'User removed agent from group',

    // connect channel/channel integration
    'connect_channel' => 'User has connected a channel',
    'disconnect_channel' => 'User has disconnected a channel',

    // user action
    // default messages
    'welcome_message_sent' => 'Welcome message sent',
    'away_message_sent' => 'Away message sent',
    'closing_message_sent' => 'Closing message sent',
    'first_response_sent' => 'First response sent',

    // import export
    'import_data' => 'User has imported data',
    'import_department' => 'User has imported department data',
    'import_agent' => 'User has imported agent data',
];