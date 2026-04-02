<!DOCTYPE html>
<html>

    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{{ __('new_agent_notification.body.page_title') }}</title>
    </head>

    <body link="#555559" vlink="#555559" alink="#555559">
        <table class=" main contenttable" align="center"
            style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;width: 600px;">
            <tr>
                <td class="border"
                    style="border-collapse: collapse;border: 1px solid #eeeff0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                    <table
                        style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                        <!-- header view -->
                        @include('email.email-header')
                        <!-- end header view -->

                        <tr>
                            <td valign="top" class="side title"
                                style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
                                <table
                                    style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                    <tr>
                                        <td class="head-title"
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 24px;line-height: 34px;font-weight: bold; text-align: center;">
                                            <div class="mktEditable" id="main_title">
                                                {{ __('email.new_agent_notification.body.page_title') }}
                                            </div>
                                        </td>
                                    </tr>
                                    {{-- {{-- <tr>
                                        <td class="top-padding"
                                            style="border-collapse: collapse;border: 0;margin: 0;;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 21px;">
                                            <hr size="3" color="#eeeff0">
                                        </td>
                                    </tr> --}}
                                    <tr>
                                        <td class="text"
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                            <div class="mktEditable" id="main_text">
                                                <p style="margin-bottom: 10px;">{!! __('email.new_agent_notification.body.greetings', ['name' => $details['name']]) !!}</p>
                                                <br>
                                                <p style="margin-bottom: 10px;">{!! __('email.new_agent_notification.body.content') !!}</p>
                                                <br> <br>
                                                <p>{!! __('email.new_agent_notification.body.credential_email', ['email' => $details['email']]) !!}</p>
                                                <p>{!! __('email.new_agent_notification.body.credential_password', ['password' => $details['decrypted_password']]) !!}</p>
                                                <p>{!! __('email.new_agent_notification.body.content_closing', ['companyName' => $details['company_details']['company_name']]) !!}</p>
                                            </div>
                                        </td>
                                    </tr>
                                    {{-- <tr>
                                        <td
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 24px;">
                                            <br>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text"
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 24px;">
                                            <div class="mktEditable" id="download_button" style="text-align: center;">
                                                <p style="text-align: center;">{{ __('email.body.or') }}</p>
                                                <a class="btn-qchat-confirm"  href="{{ route('user.verify', $details['token']) }}">{{ __('email.body.button_confirm') }}</a><br>
                                                <br>
                                                <br>
                                            </div>
                                        </td>
                                    </tr> --}}
                                </table>
                            </td>
                        </tr>

                        {{-- account promotion company--}}
                        {{-- @include('email.email-accounts') --}}
                        {{-- end account promotion company --}}

                        {{-- footer --}}
                        @include('email.email-footer')
                        {{-- end footer --}}
                    </table>
                </td>
            </tr>
        </table>
    </body>

</html>
