<?php

namespace App\Rules;

use App\Models\InternalChat;
use Illuminate\Contracts\Validation\Rule;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class ChatFileRule implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct($sizePerType)
    {
        $this->sizePerType = $sizePerType;
        $this->errorSize = 0;
        $this->uploadedExtension = '';
        $this->errorMessageType = null;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $defined_extensions = config('validation_rules.allowed_file');
        $allowed_extensions = [];

        if ($value instanceof UploadedFile && !$value->isValid() || !is_file($value)) {
            return false;
        }

        if(empty($this->sizePerType) && !is_array($this->sizePerType)) {
            return false;
        }

        $requestedType = array_keys($this->sizePerType);
        $uploadedMime = null;
        $this->uploadedExtension = strtolower($value->getClientOriginalExtension());
        foreach($defined_extensions as $keyEx => $valEx) {
            foreach($requestedType as $reqType) {
                if($keyEx == $reqType) { // validate based on requested file type
                    foreach($valEx as $subVal) {
                        $allowed_extensions[] = $subVal;
                        if($this->uploadedExtension == $subVal) {
                            $uploadedMime = $keyEx;
                        }
                    }
                }
            }
        }

        if(empty($allowed_extensions)) {
            return false;
        }

        // validate extension
        if(!in_array($this->uploadedExtension, $allowed_extensions)) {
            $this->errorMessageType = 'error_extension';
            return false;
        }

        // validate size
        $uploadedSize = $value->getSize() / 1024;
        $megabytes = number_format(($uploadedSize /1024) , 2);
        if( !empty($this->sizePerType) && in_array($uploadedMime, array_keys($this->sizePerType)) ) {
            $size_result = $uploadedSize > $this->sizePerType[$uploadedMime];

            if($size_result) {
                $this->errorSize = $this->sizePerType[$uploadedMime];
                $this->errorMessageType = 'error_size';
                return false;
            }
        }

        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        switch ($this->errorMessageType) {
            case 'error_extension':
                $message = 'The :attribute is not allowed to upload '.$this->uploadedExtension.' extension.';
                break;

            case 'error_size':
                $message = 'The :attribute may not be greater than '. $this->errorSize .' kilobytes.';
                break;

            default:
                $message = 'The :attribute format is invalid.';
                break;
        }

        return $message;
    }
}
