@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between mb-3">
        <h3>Payments</h3>
        <a href="{{ route('payments.create') }}" class="btn btn-primary">Create New Payment</a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
        </div>
    @endif

    <div class="table-responsive">
        <table id="payment_table" class="table table-striped">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Link</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse($payments as $payment)
                    <tr>
                        <td>{{ $loop->index + 1 }}</td>
                        <td>{{ $payment->name }}</td>
                        <td>{{ $payment->link }}</td>
                        <td>
                            <a href="{{ route('payments.show', $payment->id) }}" class="btn btn-info btn-sm">View</a>
                            <a href="{{ route('payments.edit', $payment->id) }}" class="btn btn-primary btn-sm">Edit</a>
                            <form action="{{ route('payments.destroy', $payment->id) }}" method="POST" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this payment?')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4">No payments found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
