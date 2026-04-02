@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Create New Related Question</h1>
            <form action="{{ route('related-questions.store') }}" method="post">
                @csrf
                <div class="mb-3">
                    <label for="question_id" class="form-label">Question ID:</label>
                    <input type="number" class="form-control" name="question_id" id="question_id" required>
                </div>
                <div class="mb-3">
                    <label for="answer_id" class="form-label">Answer ID:</label>
                    <input type="number" class="form-control" name="answer_id" id="answer_id" required>
                </div>
                <div class="mb-3">
                    <label for="related_question" class="form-label">Related Question:</label>
                    <textarea class="form-control" name="related_question" id="related_question" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create Related Question</button>
            </form>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('related-questions.index') }}" class="btn btn-secondary">Back to All Related Questions</a>
        </div>
    </div>
@endsection
