@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Create New Answer</h1>
            <form action="{{ route('answers.store') }}" method="post">
                @csrf
                <div class="mb-3">
                    <label for="question_id" class="form-label">Question ID:</label>
                    <input type="number" class="form-control" name="question_id" id="question_id" required>
                </div>
                <div class="mb-3">
                    <label for="answer" class="form-label">Answer:</label>
                    <textarea class="form-control" name="answer" id="answer" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create Answer</button>
            </form>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('answers.index') }}" class="btn btn-secondary">Back to All Answers</a>
        </div>
    </div>
@endsection
