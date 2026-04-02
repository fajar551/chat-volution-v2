@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Payment Details</h3>
    </div>
    <table class="table">
        <tr>
            <th>Name:</th>
            <td>{{ $payment->name }}</td>
        </tr>
        <tr>
            <th>Link:</th>
            <td>{{ $payment->link }}</td>
        </tr>
    </table>
    <a href="{{ route('payments.index') }}" class="btn btn-secondary">Back</a>
</div>
@endsection
