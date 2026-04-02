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
        'unknown' => 'Aksi tidak dikenali',
        'newchat' => 'Case dibuka oleh :Name',
        'assign_agent' => 'Case ditugaskan sendiri ke agen :Name',
        'pending' => 'Case diubah menjadi Pending oleh agen :Name',
        'pending_transfer' => 'Case diubah menjadi Pending Transfer oleh agen :Name',
        'resolved_by_agent' => 'Case diubah menjadi Resolved oleh agen :Name',
        'resolved_by_user' => 'Case diubah menjadi Resolved oleh user :Name',
        'welcome_message_sent' => 'Welcome message dikirim dari agen :Name',
        'away_message_sent' => 'Away message dikirim dari agen :Name',
        'closing_message_sent' => 'Closing message dikirim dari agen :Name',
        'first_response_sent' => 'First response dikirim dari agen :Name',
        'transfer_to_agent' => 'Chat ditransfer dari agen :From ke agen :To',
        'canceled_by_system' => 'Case canceled oleh sistem',
        'canceled_by_user' => 'Case canceled oleh user :Name',
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
        'account_not_found' => 'Akun yang Dihapus',
        'group_not_found' => 'Grup yang Dihapus',
        'deleted_bubble_chat' => 'Pesan telah dihapus',
    ],

    'not_permitted' => 'Agen tidak diizinkan.',
];
