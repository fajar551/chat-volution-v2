@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between mb-3">
        <h3>All FAQ</h3>
        <a href="{{ route('questions.create') }}" class="btn btn-primary">Create New FAQ</a>
    </div>  
    
    <div class="table-responsive">
        <table id="faq_table" class="table table-striped">
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Related Questions</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($questions as $question)
                    <tr>
                        <td>{{ $question->category }}</td>
                        <td>{{ $question->question }}</td>
                        <td>{{ $question->answers->first()->answer }}</td>
                        <td>
                            @if ($question->relatedQuestions->count() > 0)
                                <ul>
                                    @foreach ($question->relatedQuestions as $relatedQuestion)
                                        <li>
                                            <strong>{{ $relatedQuestion->related_question }}</strong>
                                            <p>Type: {{ $relatedQuestion->type }}</p>
                                            <p>{{ $relatedQuestion->answer }}</p>
                                        </li>
                                    @endforeach
                                </ul>
                            @else
                                Tidak ada related question
                            @endif
                        </td>
                        <td>
                            <a href="{{ route('questions.edit', $question->id) }}" class="btn btn-primary">Edit</a>
                            <form action="{{ route('questions.destroy', $question->id) }}" method="post" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this FAQ?')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5">No FAQs available.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
