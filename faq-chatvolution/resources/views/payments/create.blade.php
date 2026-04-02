@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Create New Payment</h3>
    </div>
    <form action="{{ route('payments.store') }}" method="POST">
        @csrf
        <div class="mb-3">
            <label for="name" class="form-label">Name:</label>
            <input type="text" class="form-control" name="name" id="name" required>
        </div>
        <div class="mb-3">
            <label for="link" class="form-label">Link:</label>
            <input type="text" class="form-control" name="link" id="link" required>
        </div>
        <button type="submit" class="btn btn-primary">Create Payment</button>
        <a href="{{ route('payments.index') }}" class="btn btn-secondary">Back</a>
    </form>
</div>
@endsection
