<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Kutia\Larafirebase\Messages\FirebaseMessage;

class SendPushNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;
    protected $fcm_tokens;
    protected $profile_photo;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($title, $message, $fcm_tokens, $profile_photo = null)
    {
        $this->title = $title;
        $this->message = $message;
        $this->fcm_tokens = $fcm_tokens;
        $this->profile_photo = $profile_photo;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['firebase'];
    }

    public function toFirebase($notifiable)
    {
        $push = (new FirebaseMessage)
                    ->withTitle($this->title)
                    ->withBody($this->message)
                    ->withClickAction('/');

        if(!empty($this->profile_photo)) {
            $push = $push->withIcon($this->profile_photo);
        } else {
            $push = $push->withIcon('https://seeklogo.com/images/F/firebase-logo-402F407EE0-seeklogo.com.png'); // chatvolution icon
        }
        $push = $push->withPriority('high')->asMessage($this->fcm_tokens);

        return $push;
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->line('The introduction to the notification.')
                    ->action('Notification Action', url('/'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
