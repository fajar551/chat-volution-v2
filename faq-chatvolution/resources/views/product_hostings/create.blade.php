@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Create New Hosting</h3>
    </div> 
    <form action="{{ route('product_hostings.store') }}" method="post">
        @csrf
        <div class="mb-3">
            <label for="product_name" class="form-label">Product Name:</label>
            <input type="text" class="form-control" name="product_name" id="product_name" required>
        </div>
        <div class="mb-3">
            <label for="pid" class="form-label">PID:</label>
            <input type="text" class="form-control" name="pid" id="pid" required>
        </div>
        <div class="mb-3">
            <label for="panel" class="form-label">Panel:</label>
            <input type="text" class="form-control" name="panel" id="panel" required>
        </div>
        <div class="mb-3">
            <label for="kapasitas" class="form-label">Kapasitas:</label>
            <input type="text" class="form-control" name="kapasitas" id="kapasitas" required>
        </div>
        <div class="mb-3">
            <label for="akun_email" class="form-label">Akun Email:</label>
            <input type="text" class="form-control" name="akun_email" id="akun_email" required>
        </div>
        <div class="mb-3">
            <label for="tipe_hosting" class="form-label">Tipe Hosting:</label>
            <input type="text" class="form-control" name="tipe_hosting" id="tipe_hosting" required>
        </div>
        <div class="mb-3">
            <label for="tipe_hosting" class="form-label">Link:</label>
            <input type="text" class="form-control" name="link" id="link" required>
        </div>
        <button type="submit" class="btn btn-primary">Create Hosting</button>
    </form>
</div>
@endsection
