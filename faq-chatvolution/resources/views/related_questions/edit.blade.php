@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Edit Related Question</h1>
            <form action="{{ route('related-questions.update', ['related_question' => $relatedQuestion->id]) }}" method="post">
                @csrf
                @method('PUT')
                <div class="mb-3">
                    <label for="question_id" class="form-label">Question ID:</label>
                    <input type="number" class="form-control" name="question_id" id="question_id" value="{{ $relatedQuestion->question_id }}" required>
                </div>
                <div class="mb-3">
                    <label for="answer_id" class="form-label">Answer ID:</label>
                    <input type="number" class="form-control" name="answer_id" id="answer_id" value="{{ $relatedQuestion->answer_id }}" required>
                </div>
                <div class="mb-3">
                    <label for="related_question" class="form-label">Related Question:</label>
                    <textarea class="form-control" name="related_question" id="related_question" rows="4" required>{{ $relatedQuestion->related_question }}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Update Related Question</button>
            </form>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('related-questions.show', ['related_question' => $relatedQuestion->id]) }}" class="btn btn-secondary">Back to Related Question Details</a>
        </div>
    </div>
@endsection
