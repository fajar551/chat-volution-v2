@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col">
            <h1>All Related Questions</h1>
            <ul class="list-group">
                @foreach ($relatedQuestions as $relatedQuestion)
                    <li class="list-group-item">{{ $relatedQuestion->related_question }}</li>
                @endforeach
            </ul>
        </div>
    </div>
    <div class="row mt-3">
        <div class="col">
            <a href="{{ route('related-questions.create') }}" class="btn btn-primary">Create New Related Question</a>
        </div>
    </div>
@endsection
