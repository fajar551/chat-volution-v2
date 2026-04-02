@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between mb-3">
        <h3>All Product Hostings</h3>
        <a href="{{ route('product_hostings.create') }}" class="btn btn-primary">Create New Hosting</a>
    </div>  
    <div class="table-responsive">
        <table class="table table-striped" id="hosting_table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>PID</th>
                    <th>Panel</th>
                    <th>Kapasitas</th>
                    <th>Akun Email</th>
                    <th>Tipe Hosting</th>
                    <th>Link</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($productHostings as $productHosting)
                    <tr>
                        <td>{{ $productHosting->id }}</td>
                        <td>{{ $productHosting->product_name }}</td>
                        <td>{{ $productHosting->pid }}</td>
                        <td>{{ $productHosting->panel }}</td>
                        <td>{{ $productHosting->kapasitas }}</td>
                        <td>{{ $productHosting->akun_email }}</td>
                        <td>{{ $productHosting->tipe_hosting }}</td>
                        <td>{{ $productHosting->link }}</td>
                        <td>
                            <a href="{{ route('product_hostings.edit', $productHosting->id) }}" class="btn btn-primary">Edit</a>
                            <form action="{{ route('product_hostings.destroy', $productHosting->id) }}" method="post" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this product hosting?')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
