@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Edit Payment</h3>
    </div>
    <form action="{{ route('payments.update', $payment->id) }}" method="POST">
        @csrf
        @method('PUT')
        <div class="mb-3">
            <label for="name" class="form-label">Name:</label>
            <input type="text" class="form-control" name="name" id="name" value="{{ $payment->name }}" required>
        </div>
        <div class="mb-3">
            <label for="link" class="form-label">Link:</label>
            <input type="text" class="form-control" name="link" id="link" value="{{ $payment->link }}" required>
        </div>
        <button type="submit" class="btn btn-primary">Update Payment</button>
        <a href="{{ route('payments.index') }}" class="btn btn-secondary">Back</a>
    </form>
</div>
@endsection
