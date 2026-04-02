<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Messages Language Lines
    |--------------------------------------------------------------------------
    */

    'label' => [
        'success' => 'Success',
        'error' => 'Error',
        'warning' => 'Warning',
    ],
    'connect_account' => [
        'success' => 'Congratulations! Account successfully connected!',
        'error' => 'Failed to connect account.',
    ],
    'data_not_found' => 'Data not found.',

    // DB Transaction
    'save' => [
        'success' => 'Data has succesfully saved!',
        'error' => 'Failed to save data.'
    ],
    'update' => [
        'success' => 'Data has succesfully updated!',
        'error' => 'Failed to update data.',
        'nothing_to_update' => 'Nothing to update.',
        'password_same_as_old' => 'The new password can not be the same as the old password.',
        'old_password_not_match' => 'The old password not match with current password.',
        'only_for_agent' => 'Full access can only change for agent roles.',
        'allow_for_company' => 'This action only allowed for company roles.',
    ],
    'delete' => [
        'success' => 'Data has succesfully deleted!',
        'error' => 'Failed to delete data.'
    ],
    'set_locale' => [
        'success' => 'Language has succesfully switched to :locale',
        'error' => 'Failed to switched language to :locale.'
    ],
    // Message for General Request Response
    'request' => [
        'success' => 'Successfully process the request!',
        'error' => 'Failed to process the request.'
    ],

    // Custom
    'email_already_registered' => 'Email already registered',

    // Email Verification
    'email_verification' => [
        'success' => 'Your e-mail is successfully verified. You can now login.',
        'error' => 'Failed to verify your account. Please contact administrator for further information.',
        'already_verified' => 'Your e-mail is already verified. You can now login.',
        'email_not_found' => 'Sorry, your email can not be identified.',
        'complete_form_first' => 'Please complete the form before login.',
        'email_sent_success' => 'Verification email has been sent. Please check your inbox.',
        'email_sent_error' => 'Failed to send verification email. Please contact administrator for further information.',
    ],

    // Authorization
    'auth' => [
        'user_not_found' => 'User not found',
        'not_email_verified' => 'Your account email is not verified',
        'login' => [
            'user_not_active' => 'User is not active',
        ],
        'register' => [
            'success' => 'Your account has successfully registered. Please check your email to verify.',
            'error' => 'Failed to register your account. Please contact administrator for further information.',
            'recaptcha_invalid' => 'Error recaptcha. Invalid input response.',
        ],
        'validate_user' => [
            'error_status' => 'Your account is :status_name',
            'error_company_status' => 'Your company account is :status_name',
            'error_company_is_email_verified' => 'Your company account is not verified',
        ]
    ],

    // Validate agent/company
    'validate_agent' => [
        'success' => 'Success. Company is listed in our database.',
        'error' => 'Failed to validate company. Please check your api_key.',
        'not_found' => 'Failed to recognize company.',
        'not_permitted' => 'Company is not permitted to access chat.',
    ],

    'topic_status' => [
        0 => 'Inactive',
        1 => 'Active'
    ],

    'channel' => [
        'disconnect_success' => 'Your :ChannelName account has successfully disconnected.',
        'disconnect_error' => 'Failed to disconnect. Error while disconnecting your :ChannelName account.',
        'phone_already_taken' => 'Phone number already registered.',
        'api_id_already_taken' => 'API ID already registered.',
        'validation_success' => 'Data validation success.',
        'validation_error' => 'Data validation error.',
        'too_many_request_code' => 'You have requested code too many times. Please contact administrator for further action.',
        'account_username_already_taken' => 'Account username already registered.',
    ],

    // Poll/Vote
    'poll' => [
        'expired' => 'Vote is expired.',
        'not_permitted' => 'Agent is not permitted to access vote.',
    ],

    // Chat Group
    'chat_group' => [
        'remove_agent_group' => ':action_from removed :action_to from :group_name group.',
        'leave_group' => ':action_from has left the :group_name group.',
    ],

];
