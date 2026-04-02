<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AccountSettingsController extends Controller
{
    public function index()
    {
        return view('account_settings.index');
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Update name and email
        $user->name = $data['name'];
        $user->email = $data['email'];

        // Check if password is provided and update if necessary
        if ($data['password']) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return redirect()->route('account-settings.index')->with('success', 'Account settings updated successfully.');
    }
}
