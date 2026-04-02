<?php

namespace App\Http\Controllers;

use App\Models\ProductHosting;
use Illuminate\Http\Request;

class ProductHostingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $productHostings = ProductHosting::all();
        return view('product_hostings.index', compact('productHostings'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('product_hostings.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_name' => 'required|string',
            'pid' => 'required|string',
            'panel' => 'required|string',
            'kapasitas' => 'required|string',
            'akun_email' => 'required|string',
            'tipe_hosting' => 'required|string',
            'link' => 'required|string',
        ]);

        ProductHosting::create($data);

        return redirect()->route('product_hostings.index')->with('success', 'Product Hosting created successfully');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $productHosting = ProductHosting::find($id);
        if (!$productHosting) {
            return redirect()->route('product_hostings.index')->with('error', 'Product Hosting not found');
        }
        return view('product_hostings.show', compact('productHosting'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $productHosting = ProductHosting::find($id);
        if (!$productHosting) {
            return redirect()->route('product_hostings.index')->with('error', 'Product Hosting not found');
        }
        return view('product_hostings.edit', compact('productHosting'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'product_name' => 'required|string',
            'pid' => 'required|string',
            'panel' => 'required|string',
            'kapasitas' => 'required|string',
            'akun_email' => 'required|string',
            'tipe_hosting' => 'required|string',
            'link' => 'required|string',
        ]);

        $productHosting = ProductHosting::find($id);
        if (!$productHosting) {
            return redirect()->route('product_hostings.index')->with('error', 'Product Hosting not found');
        }

        $productHosting->update($data);

        return redirect()->route('product_hostings.index')->with('success', 'Product Hosting updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $productHosting = ProductHosting::find($id);
        if (!$productHosting) {
            return redirect()->route('product_hostings.index')->with('error', 'Product Hosting not found');
        }

        $productHosting->delete();

        return redirect()->route('product_hostings.index')->with('success', 'Product Hosting deleted successfully');
    }
}
