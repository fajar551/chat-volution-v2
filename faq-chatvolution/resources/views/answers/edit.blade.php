@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Edit Answer</h1>
            <form action="{{ route('answers.update', ['answer' => $answer->id]) }}" method="post">
                @csrf
                @method('PUT')
                <div class="mb-3">
                    <label for="question_id" class="form-label">Question ID:</label>
                    <input type="number" class="form-control" name="question_id" id="question_id" value="{{ $answer->question_id }}" required>
                </div>
                <div class="mb-3">
                    <label for="answer" class="form-label">Answer:</label>
                    <textarea class="form-control" name="answer" id="answer" rows="4" required>{{ $answer->answer }}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Answer</button>
            </form>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('answers.show', ['answer' => $answer->id]) }}" class="btn btn-secondary">Back to Answer Details</a>
        </div>
    </div>
@endsection
