@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>Related Question ID: {{ $relatedQuestion->id }}</h1>
            <p>Question ID: {{ $relatedQuestion->question_id }}</p>
            <p>Answer ID: {{ $relatedQuestion->answer_id }}</p>
            <p>{{ $relatedQuestion->related_question }}</p>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('related-questions.edit', ['related_question' => $relatedQuestion->id]) }}" class="btn btn-primary">Edit Related Question</a>
            <form action="{{ route('related-questions.destroy', ['related_question' => $relatedQuestion->id]) }}" method="post" class="d-inline">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Delete Related Question</button>
            </form>
            <a href="{{ route('related-questions.index') }}" class="btn btn-secondary">Back to All Related Questions</a>
        </div>
    </div>
@endsection
