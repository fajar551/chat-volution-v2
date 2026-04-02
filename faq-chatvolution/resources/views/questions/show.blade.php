@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>{{ $question->question }}</h3>
    </div>
    <div>
        <h3>{{ $question->category }}</h3>
        <h3>{{ $question->question }}</h3>
        <p>{{ $question->answers->first()->answer }}</p>
        @if ($question->relatedQuestions->count() > 0)
            <ul>
                @foreach ($question->relatedQuestions as $relatedQuestion)
                    <li>
                        <strong>{{ $relatedQuestion->related_question }}</strong>
                        <p>{{ $relatedQuestion->answer }}</p>
                    </li>
                @endforeach
            </ul>
        @endif
    </div>
    <a href="{{ route('questions.index') }}" class="btn btn-secondary">Back to All Questions</a>
</div>
    
@endsection
