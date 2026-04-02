<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Chat Language Lines
    |--------------------------------------------------------------------------
    */

    'status' => [
        0 => 'Pending',
        1 => 'On Going',
        2 => 'Pending Transfer',
        9 => 'Resolved',
        10 => 'Canceled by User',
        11 => 'Canceled by System',
    ],

    'user_action' => [
        'unknown' => 'Unknown action has created',
        'newchat' => 'Case opened by :Name',
        'assign_agent' => 'Case self-assigned to agent :Name',
        'pending' => 'Case changed to Pending by agent :Name',
        'pending_transfer' => 'Case changed to Pending Transfer by agent :Name',
        'resolved_by_agent' => 'Case resolved by agent :Name',
        'resolved_by_user' => 'Case resolved by user :Name',
        'welcome_message_sent' => 'Welcome message sent from agent :Name',
        'away_message_sent' => 'Away message sent from agent :Name',
        'closing_message_sent' => 'Closing message sent from agent :Name',
        'first_response_sent' => 'First response sent from agent :Name',
        'transfer_to_agent' => 'Chat transfered from agent :From to agent :To',
        'canceled_by_system' => 'Case canceled by system',
        'canceled_by_user' => 'Case canceled by user :Name',
    ],

    'chat_type' => [
        1 => 'Private',
        2 => 'Group',
    ],

    'internal_chat_status' => [
        0 => 'Inactive',
        1 => 'On Going', // active/on going
    ],

    'internal_chat_label' => [
        'account_not_found' => 'Deleted Account',
        'group_not_found' => 'Deleted Group',
        'deleted_bubble_chat' => 'Message has been deleted',
    ],

    'internal_chat' => [
        'can_not_delete_bubble_chat' => 'Message can not be deleted',
    ],

    'not_permitted' => 'Agent is not permitted.',
];
