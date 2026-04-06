<?php

use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;

class AddMultiRecipientMailMenuToCompanyLiveChat extends Migration
{
    private const LABEL = 'Kirim Email (multi)';

    public function up()
    {
        $newItem = [
            'main_menu' => self::LABEL,
            'link' => '/multi-recipient-mail',
            'icon' => 'fas fa-envelope-open-text',
            'haveChildren' => false,
            'with_params' => false,
            'children' => null,
        ];

        $menu = Menu::where('role_id', 2)
            ->where('modul_type', 'live_chat')
            ->first();

        if (! $menu) {
            return;
        }

        $list = json_decode($menu->list_menu, true);
        if (! is_array($list)) {
            return;
        }

        foreach ($list as $item) {
            if (($item['main_menu'] ?? '') === self::LABEL) {
                return;
            }
        }

        $insertAt = count($list);
        foreach ($list as $i => $item) {
            if (($item['main_menu'] ?? '') === 'Setup') {
                $insertAt = $i;
                break;
            }
        }

        array_splice($list, $insertAt, 0, [$newItem]);
        $menu->list_menu = json_encode($list);
        $menu->save();
    }

    public function down()
    {
        $menu = Menu::where('role_id', 2)
            ->where('modul_type', 'live_chat')
            ->first();

        if (! $menu) {
            return;
        }

        $list = json_decode($menu->list_menu, true);
        if (! is_array($list)) {
            return;
        }

        $list = array_values(array_filter($list, function ($item) {
            return ($item['main_menu'] ?? '') !== self::LABEL;
        }));

        $menu->list_menu = json_encode($list);
        $menu->save();
    }
}
