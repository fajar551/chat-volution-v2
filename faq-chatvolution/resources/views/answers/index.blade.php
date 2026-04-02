@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>All Answers</h1>
            <ul class="list-group">
                @foreach ($answers as $answer)
                    <li class="list-group-item">{{ $answer->answer }}</li>
                @endforeach
            </ul>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('answers.create') }}" class="btn btn-primary">Create New Answer</a>
        </div>
    </div>
@endsection
