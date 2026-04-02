@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Answer ID: {{ $answer->id }}</h1>
            <p>Question ID: {{ $answer->question_id }}</p>
            <p>{{ $answer->answer }}</p>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('answers.edit', ['answer' => $answer->id]) }}" class="btn btn-primary">Edit Answer</a>
            <form action="{{ route('answers.destroy', ['answer' => $answer->id]) }}" method="post" class="d-inline">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Delete Answer</button>
            </form>
            <a href="{{ route('answers.index') }}" class="btn btn-secondary">Back to All Answers</a>
        </div>
    </div>
@endsection
