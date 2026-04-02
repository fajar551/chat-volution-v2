<?php

/**
 * General helpers
 */

use Carbon\Carbon;
use Creativeorange\Gravatar\Facades\Gravatar;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Lang;
use Laravolt\Avatar\Avatar;
use Spatie\Activitylog\Contracts\Activity;
use Spatie\Activitylog\LogOptions;

/**
 * Check whether the given URL is valid
 *
 * E.q. checking if value is url or just string
 *
 * @param String $param
 */
if (!function_exists('checkUrl')) {
    function checkUrl($param = "")
    {
        if (filter_var($param, FILTER_VALIDATE_URL) === FALSE || (!$param)) {
            // Not valid URL
            return false;
        } else {
            // valid URL
            return true;
        }
    }
}

if (!function_exists('format_price')) {
    function format_price($param = "", $prefix = "")
    {
        if ($param) {
            $param = $prefix . number_format($param, 0, ',', '.');

            return $param;
        } else {
            return $param;
        }
    }
}

/**
 * Upload image file
 *
 * @param collection $request_file = $request->file('image')
 * @param string $destination = 'public/image' (storage path)
 * @return Bool $showDetail = false|true (show image detail)
 */
if (!function_exists('uploadFile')) {
    function uploadFile($request_file = null, $destination = '/image', $showDetail = false)
    {
        if ($request_file) {
            /** simplest way to save file */
            // $image = $request->file('image')->store('public/book');

            /** Save file and rename file */
            $rndm = Str::random(6);
            $origin = $request_file->getClientOriginalName();
            $extension = $request_file->extension();
            $file_name = pathinfo($origin, PATHINFO_FILENAME);
            $slug_origin = Str::slug($file_name);
            $renamed = $rndm . "-" . $slug_origin . "." . $extension;
            $destination_path = $destination;

            // with renamed file
            $image = $request_file->storeAs(
                $destination_path,
                $renamed
            );
            // $name = Str::title($request_file->name); //it is the same as ucword (capitalize)

            if ($showDetail) {
                return [
                    'name' => $renamed,
                    'path' => $image,
                    'ext' => $extension,
                ];
            }

            return $image;
        } else {
            return null;
        }
    }
}

/**
 * Parse file path into url
 * Has two types of directory: public_path or storage_path
 *
 * @param String $dirtype = 'storage|public'
 * @return String $url
 */
if (!function_exists('parseFileUrl')) {
    function parseFileUrl($file_name = null, $dirtype = 'storage', $chat_channel_id = null)
    {
        $dirtype = $dirtype ?: 'storage';

        $current_http_host = request()->getSchemeAndHttpHost();
        $current_host_scheme = request()->getScheme();
        $current_host = request()->getHost();
        $url = $current_http_host . Storage::url($file_name); // to storage dir

        if ($chat_channel_id && $chat_channel_id != 1) {
            $url = env('SOCKET_QCHAT_URL', "http://localhost:4000") . "/" . $file_name;
            return $url;
        }

        if ($dirtype == 'public') {
            if (file_exists(public_path($file_name))) {
                $url = asset($file_name); // to public dir
            } else {
                Log::warning("File not exists. File: " . $file_name);
            }
        }

        if ($dirtype == 'storage') {
            if (!Storage::disk()->exists($file_name)) {
                Log::warning("File not exists. File: " . $file_name);
                return null; // return null if file is not exists
            }
        }

        return $url;
    }
}

if (!function_exists('dateTimeFormat')) {
    function dateTimeFormat($date = null, $format = null, $timezone = 'Asia/Jakarta')
    {
        if ($format == null) {
            $format = 'Y-m-d H:i:s';
        }

        $text = is_string($date);
        if (!$text)
            return "Date must be type of string";

        $date = Carbon::createFromFormat('Y-m-d H:i:s', $date);
        if (!empty($timezone))
            $date->setTimezone($timezone); // 'Europe/Paris'

        $formatted_date = $date->format($format, $date);
        $result = $formatted_date;

        return $result;
    }
}

if (!function_exists('getGravatar')) {
    function getGravatar($text = null, $type = 'name')
    {
        // gravatar example 1
        // if($text == null)
        // {
        //     $text = Str::random(10).'mail.com';
        //     $text = 'default@mail.com';
        // }

        // $check_text = is_string($text);
        // if(!$check_text)
        //     return "Date must be type of string";

        // $generated = Gravatar::get($text);
        // return $generated;

        $avatar = null;
        if ($type == 'name') {
            // gravatar example 2
            $rand = Str::random(5);
            $get_destination_path = 'assets/images/uploads/gravatar/';
            // $file_name = $rand.'-'.Str::slug($text).'.png';
            $file_name = Str::slug($text) . '.png';

            // Handle path in docker container
            $storage_dir = 'storage/assets/images/uploads/gravatar/';
            if(File::isDirectory( public_path($storage_dir) ) ) {
                $save_as = public_path($storage_dir) . $file_name;
            } else {
                $save_as = 'storage/assets/images/uploads/gravatar/' . $file_name;
            }
            // $save_as = 'storage/assets/images/uploads/gravatar/' . $file_name;

            $avatar = new Avatar(config('laravolt.avatar'));
            // $avatar->create('John Doe')->toBase64();
            $avatar->create($text) // name
                ->setDimension(100)
                ->save($save_as, $quality = 90);
            $avatar = parseFileUrl($storage_dir.$file_name, 'public');
        }

        if ($type == 'email') {
            // gravatar example 3
            $avatar = \Avatar::create($text)->toGravatar(['d' => 'identicon', 'r' => 'pg', 's' => 100]); // email
        }

        return $avatar;
    }

    /**
     * Create Activity Log
     * Insert Activity Log record
     *
     * Can be enabled/disabled by env
     * ACTIVITY_LOG=enable|disable
     *
     * @param String $param
     */
    if (!function_exists('createActivityLog')) {
        function createActivityLog($description = null, $params = [], $properties = [])
        {
            $user = null;
            $email = null;
            if (Auth::check()) {
                $user = Auth::user();
                $email = $user['email'];
            }

            $input_log = ['email' => $email];

            $default_description = $description ?: 'Unknown activity';
            $available_properties = ['log_name', 'email', 'request_sent', 'response', 'causedBy']; // 'log_name', 'email', 'request_sent', 'response'
            $defined_description = Lang::get('activity_log');
            $properties['method'] = \Request::method() ?: null;

            if (!empty($params) && is_array($params)) {
                foreach ($params as $key => $val) {
                    if (in_array($key, $available_properties) && !empty($val)) {
                        if ($key == 'log_name') {
                            $default_description = in_array($val, array_keys($defined_description)) && empty($description) ? $defined_description[$val] : $default_description;
                        }
                        $input_log[$key] = ($key == 'request_sent' || $key == 'response') ? json_encode($val) : $val;
                    }
                }
            }

            activity()
                ->causedBy($user)
                ->withProperties($properties)
                ->tap(function (Activity $activity) use ($input_log, $user) {
                    $activity->ip = \Request::ip() ?: null;
                    $activity->user_agent = \Request::header('user-agent') ?: null;
                    if (!empty($input_log)) {
                        foreach ($input_log as $log_key => $log_val) {
                            $activity->$log_key = $log_val;
                        }
                    }
                })
                ->log($default_description);

            return true;
        }
    }
}

if (!function_exists('limit_words')) {
    function limit_words($text = "", $limit = 2, $add_suffix = "")
    {
        if ($text) {
            $text = Str::words($text, $limit, $add_suffix);

            return $text;
        } else {
            return $text;
        }
    }
}

if (!function_exists('generate_random_letters')) {
    function generate_random_letters($type = null)
    {
        $date = strtotime("now");
        $words = Str::random(5);
        $another_random = substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 1, 5);
        $id = Auth::check() ? Auth::user()->id : substr($another_random, 1, 2);
        $arrange = $words . $id . $date;

        if ($type == 'meeting') {
            $arrange = env('MEETING_BASE_URL', 'https://meet.jit.si') . '/' . $arrange;
        }

        return $arrange;
    }
}

if (!function_exists('generate_random_string')) {
    function generate_random_string($length = 10, $chars = 'aA#!')
    {
        $current_unix = strtotime("now");

        $mask = '';
        if (strpos($chars, 'a') >= 0)
            $mask = $mask . 'abcdefghijklmnopqrstuvwxyz';
        if (strpos($chars, 'A') >= 0)
            $mask = $mask . 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (strpos($chars, '#') >= 0)
            $mask = $mask . '0123456789' . $current_unix;
        if (strpos($chars, '!') >= 0)
            $mask = $mask . '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';

        $result = '';
        for ($i = $length - 1; $i >= 0; $i--) {
            $anyrandom = (float)rand()/(float)getrandmax();
            $mask_length = strlen($mask) - 1;
            $anyrandomnumb = $anyrandom * $mask_length;
            $rounded = (int) round($anyrandomnumb);
            $result = $result . $mask[$rounded];
        }

        return $result;
    }
}
