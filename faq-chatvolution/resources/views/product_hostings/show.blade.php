@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Product Hosting Detail</h3>
    </div>
    <table class="table table-bordered">
        <tr>
            <th>Product Name:</th>
            <td>{{ $productHosting->product_name }}</td>
        </tr>
        <tr>
            <th>PID:</th>
            <td>{{ $productHosting->pid }}</td>
        </tr>
        <tr>
            <th>Panel:</th>
            <td>{{ $productHosting->panel }}</td>
        </tr>
        <tr>
            <th>Kapasitas:</th>
            <td>{{ $productHosting->kapasitas }}</td>
        </tr>
        <tr>
            <th>Akun Email:</th>
            <td>{{ $productHosting->akun_email }}</td>
        </tr>
        <tr>
            <th>Tipe Hosting:</th>
            <td>{{ $productHosting->tipe_hosting }}</td>
        </tr>
        <tr>
            <th>Link:</th>
            <td>{{ $productHosting->link }}</td>
        </tr>
    </table>
    <a href="{{ route('product_hostings.index') }}" class="btn btn-secondary">Back to Product Hostings</a>
</div>
@endsection
