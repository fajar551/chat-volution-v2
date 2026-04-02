@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Edit Hosting</h3>
    </div> 
    <form action="{{ route('product_hostings.update', $productHosting->id) }}" method="post">
        @csrf
        @method('PUT')
        <div class="mb-3">
            <label for="product_name" class="form-label">Product Name:</label>
            <input type="text" class="form-control" name="product_name" id="product_name" value="{{ $productHosting->product_name }}" required>
        </div>
        <div class="mb-3">
            <label for="pid" class="form-label">PID:</label>
            <input type="text" class="form-control" name="pid" id="pid" value="{{ $productHosting->pid }}" required>
        </div>
        <div class="mb-3">
            <label for="panel" class="form-label">Panel:</label>
            <input type="text" class="form-control" name="panel" id="panel" value="{{ $productHosting->panel }}" required>
        </div>
        <div class="mb-3">
            <label for="kapasitas" class="form-label">Kapasitas:</label>
            <input type="text" class="form-control" name="kapasitas" id="kapasitas" value="{{ $productHosting->kapasitas }}" required>
        </div>
        <div class="mb-3">
            <label for="akun_email" class="form-label">Akun Email:</label>
            <input type="text" class="form-control" name="akun_email" id="akun_email" value="{{ $productHosting->akun_email }}" required>
        </div>
        <div class="mb-3">
            <label for="tipe_hosting" class="form-label">Tipe Hosting:</label>
            <input type="text" class="form-control" name="tipe_hosting" id="tipe_hosting" value="{{ $productHosting->tipe_hosting }}" required>
        </div>
        <div class="mb-3">
            <label for="tipe_hosting" class="form-label">Link:</label>
            <input type="text" class="form-control" name="link" id="link" value="{{ $productHosting->link }}" required>
        </div>
        <button type="submit" class="btn btn-primary">Update Hosting</button>
    </form>
</div>
@endsection
