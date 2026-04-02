<!DOCTYPE html>
<html>

    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{{ __('email.body.chat_history.page_title') }}</title>
        <style>
            .btn-qchat-confirm {
                color: #ffffff !important;
                background-color: #ff9100;
                border: 20px solid #b35e04;
                border-left: 20px solid #ff9100;
                border-right: 20px solid #ff9100;
                border-top: 10px solid #ff9100;
                border-bottom: 10px solid #ff9100;
                border-radius: 3px;
                text-decoration: none;
            }

            .btn-qchat-confirm:hover {
                background-color: #ff9100;
            }

            @media only screen and (max-width: 600px) {
                .main {
                    width: 320px !important;
                }

                .top-image {
                    width: 100px !important;
                }

                .illustration-image {
                    width: 250px !important;
                }

                .inside-footer {
                    width: 320px !important;
                }

                table[class="contenttable"] {
                    width: 320px !important;
                    text-align: left !important;
                }

                td[class="force-col"] {
                    display: block !important;
                }

                td[class="rm-col"] {
                    display: none !important;
                }

                .mt {
                    margin-top: 15px !important;
                }

                *[class].width300 {
                    width: 255px !important;
                }

                *[class].block {
                    display: block !important;
                }

                *[class].blockcol {
                    display: none !important;
                }

                .emailButton {
                    width: 100% !important;
                }

                .emailButton a {
                    display: block !important;
                    font-size: 18px !important;
                }

            }

        </style>
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
                                                {{ __('email.body.chat_history.page_title', [ 'CompanyName' => $company_name ]) }}
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td class="grey-block"
                                            style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff; text-align:center;">
                                            <div class="mktEditable" id="cta">
                                                <img class="illustration-image" src="{{ asset('assets/images/illustration/ver-img.png') }}" width="350" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="top-padding"
                                            style="border-collapse: collapse;border: 0;margin: 0;;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 21px;">
                                            <hr size="3" color="#eeeff0">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text"
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                            <div class="mktEditable" id="main_text">
                                                <p style="margin-bottom: 10px;">{!! __('email.body.chat_history.greetings', ['name' => $name ]) !!}</p>
                                                <p>
                                                    {!! __('email.body.chat_history.content', [ 'CompanyName' => $company_name ]) !!}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 24px;">
                                            <br>
                                        </td>
                                    </tr>
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
